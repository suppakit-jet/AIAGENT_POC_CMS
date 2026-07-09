import os
import sys
import json
import time
import tempfile
import argparse
import subprocess
from datetime import datetime
from pathlib import Path

def setup_utf8_output():
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

def run_cmd(cmd_args, cwd=None, capture=True):
    if os.name == "nt" or sys.platform.startswith("win"):
        if cmd_args[0].lower() in ("npm", "npx", "pnpm", "yarn"):
            cmd_args = ["cmd.exe", "/c"] + cmd_args
            
    return subprocess.run(
        cmd_args,
        cwd=cwd,
        capture_output=capture,
        text=True,
        encoding="utf-8",
        errors="replace"
    )

def print_box(title, status="RUNNING"):
    icon = "⏳" if status == "RUNNING" else ("✅" if status == "PASS" else "❌")
    print(f"\n┌─────────────────────────────────────────────────────────────┐")
    print(f"│ {icon} {title:<55}│")
    print(f"└─────────────────────────────────────────────────────────────┘")

def print_report_and_exit(args, overall_status, start_time, results):
    total_duration = round(time.time() - start_time, 2)
    if args.json:
        report = {
            "harness_runner": "v1.0",
            "timestamp": datetime.now().isoformat(),
            "overall_status": overall_status,
            "total_duration_s": total_duration,
            "results": results
        }
        print(json.dumps(report, indent=2))
    else:
        print("\n┌─────────────────────────────────────────────────────────────┐")
        print(f"│ 🏁 SUMMARY REPORT                                           │")
        print("├─────────────────────────────────────────────────────────────┤")
        for k, v in results.items():
            icon = "✅" if v["status"] == "PASS" else "❌"
            print(f"│ {icon} {k:<25} | Status: {v['status']:<6} | Time: {v['duration_s']:>5}s │")
        print("├─────────────────────────────────────────────────────────────┤")
        final_icon = "🎉 ALL PASSED" if overall_status == "PASS" else "💥 FAILED"
        print(f"│ FINAL RESULT: {final_icon:<28} | Total: {total_duration:>4}s │")
        print("└─────────────────────────────────────────────────────────────┘\n")
    sys.exit(0 if overall_status == "PASS" else 1)

def main():
    setup_utf8_output()
    parser = argparse.ArgumentParser(description="Unified Cross-Platform Harness Runner")
    parser.add_argument("--json", action="store_true", help="Output results in JSON format")
    parser.add_argument("--skip-cov", action="store_true", help="Skip slow test coverage check")
    parser.add_argument("--only", choices=["harness", "typecheck", "lint", "tdd", "cov", "hex"], help="Run only a specific check")
    args = parser.parse_args()
    
    repo_root = Path(__file__).resolve().parent.parent
    backend_dir = repo_root / "backend"
    harness_dir = repo_root / ".harness"
    sensor_dir = harness_dir / "sensors"
    py_exec = sys.executable or "python"
    
    start_time = time.time()
    results = {}
    overall_status = "PASS"
    
    if not args.json:
        print("🚀 =========================================================")
        print("   UNIVERSAL ENGINEERING HARNESS RUNNER (Cross-Platform)   ")
        print("   =========================================================")
        
    # 0. Harness Structure Verification
    if not args.only or args.only == "harness":
        if not args.json: print_box("Harness Structure Check (verify-harness.py)")
        t0 = time.time()
        res = run_cmd([py_exec, str(harness_dir / "scripts" / "verify-harness.py")])
        duration = round(time.time() - t0, 2)
        try:
            data = json.loads(res.stdout)
            status = data.get("status", "FAIL")
        except Exception:
            status = "FAIL"
            data = {}
        results["harness"] = {"status": status, "duration_s": duration, "data": data}
        if status == "FAIL":
            overall_status = "FAIL"
            if not args.json:
                print(f"   Status: FAIL - Harness structure incomplete!")
                print(f"   Missing: {data.get('missing_files', [])}")
            print_report_and_exit(args, overall_status, start_time, results)
        elif not args.json:
            print(f"   Status: {status} ({duration}s)")
            if isinstance(data, dict):
                print(f"   Checked: {data.get('checked_count', 0)} files")
        
    # 1. TypeScript Typecheck
    if not args.only or args.only == "typecheck":
        if not args.json: print_box("TypeScript Typecheck (tsc --noEmit)")
        t0 = time.time()
        res = run_cmd(["npx", "tsc", "--noEmit"], cwd=backend_dir)
        duration = round(time.time() - t0, 2)
        status = "PASS" if res.returncode == 0 else "FAIL"
        results["typecheck"] = {"status": status, "duration_s": duration, "output": res.stdout + res.stderr if status == "FAIL" else ""}
        if status == "FAIL": overall_status = "FAIL"
        if not args.json:
            print(f"   Status: {status} ({duration}s)")
            if status == "FAIL": print(f"   Error:\n{res.stdout}{res.stderr}")
            
    # 2. ESLint
    if not args.only or args.only == "lint":
        if not args.json: print_box("Code Linting (ESLint)")
        t0 = time.time()
        res = run_cmd(["npx", "eslint", "src", "--ext", ".ts"], cwd=backend_dir)
        duration = round(time.time() - t0, 2)
        status = "PASS" if res.returncode == 0 else "FAIL"
        results["lint"] = {"status": status, "duration_s": duration, "output": res.stdout + res.stderr if status == "FAIL" else ""}
        if status == "FAIL": overall_status = "FAIL"
        if not args.json:
            print(f"   Status: {status} ({duration}s)")
            if status == "FAIL": print(f"   Error:\n{res.stdout}{res.stderr}")
            
    # 3. TDD Discipline Sensor (m-tdd.py)
    if not args.only or args.only == "tdd":
        if not args.json: print_box("TDD Discipline & Ratio (m-tdd.py)")
        t0 = time.time()
        res = run_cmd([py_exec, str(sensor_dir / "m-tdd.py"), str(backend_dir / "src")])
        duration = round(time.time() - t0, 2)
        status = "PASS"
        data = {}
        try:
            data = json.loads(res.stdout)
            status = data.get("status", "FAIL")
        except Exception:
            status = "FAIL" if res.returncode != 0 else "PASS"
            
        results["tdd"] = {"status": status, "duration_s": duration, "data": data}
        if status == "FAIL": overall_status = "FAIL"
        if not args.json:
            print(f"   Status: {status} ({duration}s)")
            if "metrics" in data:
                m = data["metrics"].get("M-TDD-01", {})
                print(f"   Test-to-Code Ratio: {m.get('value', 0)} (Threshold: >= {m.get('threshold', 1.0)})")
            if status == "FAIL": print(f"   Remediation: {data.get('remediation', '')}")
            
    # 4. Test Coverage Gate (m-cov.py)
    if (not args.only or args.only == "cov") and not args.skip_cov:
        if not args.json: print_box("Unit Tests & Coverage Gate (m-cov.py)")
        t0 = time.time()
        res_test = run_cmd(["npm", "run", "test:coverage"], cwd=backend_dir)
        cov_xml = backend_dir / "coverage" / "cobertura.xml"
        if not cov_xml.exists():
            cov_xml = backend_dir / "coverage" / "cobertura-coverage.xml"
        
        status = "PASS"
        data = {}
        if res_test.returncode != 0 or not cov_xml.exists():
            status = "FAIL"
            results["coverage"] = {"status": "FAIL", "duration_s": round(time.time() - t0, 2), "output": "Tests failed or cobertura.xml not generated."}
            overall_status = "FAIL"
            if not args.json: print("   Status: FAIL (Tests failed or missing coverage report)")
        else:
            res_cov = run_cmd([py_exec, str(sensor_dir / "m-cov.py"), str(cov_xml)])
            duration = round(time.time() - t0, 2)
            try:
                data = json.loads(res_cov.stdout)
                status = data.get("status", "FAIL")
            except Exception:
                status = "FAIL" if res_cov.returncode != 0 else "PASS"
            results["coverage"] = {"status": status, "duration_s": duration, "data": data}
            if status == "FAIL": overall_status = "FAIL"
            if not args.json:
                print(f"   Status: {status} ({duration}s)")
                print(f"   Coverage Value: {data.get('value', 0)}% (Threshold: >= {data.get('threshold', 98)}%)")
                
    # 5. Hexagonal Architecture Gate (m-hex.py)
    if not args.only or args.only == "hex":
        if not args.json: print_box("Hexagonal Architecture Gate (m-hex.py)")
        t0 = time.time()
        with tempfile.NamedTemporaryFile(suffix=".json", delete=False, mode="w+", encoding="utf-8") as tmp_file:
            report_path = tmp_file.name
            
        try:
            res_dep = run_cmd(["npx", "dependency-cruiser", "src", "--output-type", "json"], cwd=backend_dir)
            with open(report_path, "w", encoding="utf-8") as f:
                f.write(res_dep.stdout if res_dep.stdout else "{}")
                
            res_hex = run_cmd([py_exec, str(sensor_dir / "m-hex.py"), report_path])
            duration = round(time.time() - t0, 2)
            data = {}
            try:
                data = json.loads(res_hex.stdout)
                status = data.get("status", "FAIL")
            except Exception:
                status = "FAIL" if res_hex.returncode != 0 else "PASS"
                
            results["architecture"] = {"status": status, "duration_s": duration, "data": data}
            if status == "FAIL": overall_status = "FAIL"
            if not args.json:
                print(f"   Status: {status} ({duration}s)")
                print(f"   Violations Found: {data.get('value', 0)}")
                if status == "FAIL" and "violations" in data:
                    for v in data["violations"][:3]:
                        print(f"     - [{v.get('rule')}] {v.get('from')} -> {v.get('to')}")
        finally:
            if os.path.exists(report_path):
                try: os.remove(report_path)
                except Exception: pass
                
    print_report_and_exit(args, overall_status, start_time, results)

if __name__ == "__main__":
    main()
