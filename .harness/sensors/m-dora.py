import os
import sys
import json
import time
import subprocess
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path

def setup_utf8_output():
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

def get_git_info():
    sha = os.getenv("GITHUB_SHA")
    ref = os.getenv("GITHUB_REF_NAME")
    commit_time = os.getenv("COMMIT_TIMESTAMP")
    repo = os.getenv("GITHUB_REPOSITORY", "suppakit-jet/AIAGENT_POC_CMS")

    if not sha:
        try:
            sha = subprocess.check_output(["git", "rev-parse", "HEAD"], text=True, errors="replace").strip()
        except Exception:
            sha = "local-sha"

    if not ref:
        try:
            ref = subprocess.check_output(["git", "rev-parse", "--abbrev-ref", "HEAD"], text=True, errors="replace").strip()
        except Exception:
            ref = "local-branch"

    if not commit_time:
        try:
            commit_time_str = subprocess.check_output(["git", "log", "-1", "--format=%ct"], text=True, errors="replace").strip()
            commit_time = int(commit_time_str)
        except Exception:
            commit_time = int(time.time())
    else:
        try:
            commit_time = int(commit_time)
        except ValueError:
            commit_time = int(time.time())

    return sha, ref, commit_time, repo

def calculate_mttr_and_incidents(harness_dir):
    post_mortem_dir = harness_dir / "post-mortem"
    incident_count = 0
    total_recovery_time = 0

    if post_mortem_dir.exists():
        for file in post_mortem_dir.glob("*.json"):
            try:
                with open(file, "r", encoding="utf-8", errors="replace") as f:
                    data = json.load(f)
                    if data.get("type") == "incident" and "start_time" in data and "resolved_time" in data:
                        incident_count += 1
                        t1 = int(data["start_time"])
                        t2 = int(data["resolved_time"])
                        total_recovery_time += max(0, t2 - t1)
            except Exception:
                pass

    mttr = round(total_recovery_time / incident_count, 2) if incident_count > 0 else 0
    return incident_count, mttr

def collect_dora_metrics():
    setup_utf8_output()
    harness_dir = Path(__file__).resolve().parent.parent
    sha, ref, commit_time, repo = get_git_info()

    current_time = int(time.time())
    lead_time_seconds = max(0, current_time - commit_time)

    job_status = os.getenv("CI_JOB_STATUS", "success")
    event_type = "deploy" if ref in ("main", "master") else "build"

    incident_count, mttr_seconds = calculate_mttr_and_incidents(harness_dir)

    # Load history to calculate deployment frequency & change failure rate
    history_file = harness_dir / "dora-history.jsonl"
    total_deploys = 0
    failed_deploys = 0

    if history_file.exists():
        try:
            with open(history_file, "r", encoding="utf-8", errors="replace") as f:
                for line in f:
                    stripped = line.strip()
                    if not stripped:
                        continue
                    entry = json.loads(stripped)
                    if entry.get("event", {}).get("event_type") == "deploy":
                        total_deploys += 1
                        if entry.get("event", {}).get("status") == "failure":
                            failed_deploys += 1
        except Exception:
            pass

    # Count current deploy if applicable
    if event_type == "deploy":
        total_deploys += 1
        if job_status == "failure":
            failed_deploys += 1

    cfr_percent = round((failed_deploys / total_deploys) * 100, 2) if total_deploys > 0 else 0.0

    result = {
        "metric_id": "M-DORA-01",
        "name": "DORA Metrics Exporter (Harness Sensor)",
        "value": {
            "deployment_frequency_total": total_deploys,
            "lead_time_seconds": lead_time_seconds,
            "change_failure_rate_percent": cfr_percent,
            "mttr_seconds": mttr_seconds
        },
        "event": {
            "event_type": event_type,
            "repository": repo,
            "branch": ref,
            "commit_sha": sha,
            "status": job_status,
            "commit_timestamp": commit_time,
            "deploy_timestamp": current_time
        },
        "status": "PASS" if job_status == "success" else "WARN",
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    }

    # Append to local history file (for Grafana / Promtail / Loki ingestion)
    try:
        with open(history_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(result, ensure_ascii=False) + "\n")
    except Exception as e:
        pass

    # Push to Grafana / Prometheus backend if configured
    endpoint = os.getenv("DORA_METRICS_ENDPOINT")
    if endpoint:
        try:
            req = urllib.request.Request(
                endpoint,
                data=json.dumps(result).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                result["push_status"] = f"Success ({resp.getcode()})"
        except Exception as e:
            result["push_status"] = f"Failed ({str(e)})"

    print(json.dumps(result, indent=2, ensure_ascii=False))
    sys.exit(0)

if __name__ == "__main__":
    collect_dora_metrics()
