#!/usr/bin/env python3
"""
verify-harness.py — Sensor / Script ตรวจสอบความครบถ้วนของไฟล์ในระบบ Engineering Harness
Output เป็นมาตรฐาน JSON และ Exit Code 0 (PASS) หรือ 1 (FAIL)
"""

import sys
import json
from pathlib import Path

def setup_utf8_output():
    if sys.platform == "win32":
        import codecs
        if hasattr(sys.stdout, 'buffer'):
            sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
        if hasattr(sys.stderr, 'buffer'):
            sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

def verify_harness():
    setup_utf8_output()
    
    # ค้นหาตำแหน่งโฟลเดอร์ .harness
    script_dir = Path(__file__).resolve().parent
    harness_dir = script_dir.parent  # .harness directory
    
    required_files = [
        "context/AGENTS.md",
        "context/acceptance-criteria.json",
        "context/decision-log.md",
        "context/knowledge_inventory.md",
        "context/metrics_inventory.md",
        "context/project-brief.md",
        "sensors/m-cov.py",
        "sensors/m-hex.py",
        "sensors/m-tdd.py",
        "guardrails/install_hooks.py",
        "guardrails/pre_commit.py",
        "guardrails/pre_push.py",
        "harness-runner.py",
        "test_harness.py",
        "gates/gate-spec.json",
        "progress.json",
        "runbooks/tdd-cycle.md",
        "runbooks/failure-guide.md",
        "runbooks/onboarding.md",
        "workflows/harness-workflow.json",
        "workflows/agent-execution-workflow.md"
    ]
    
    missing_files = []
    for rel_path in required_files:
        file_path = harness_dir / rel_path
        if not file_path.is_file():
            missing_files.append(rel_path)
            
    status = "PASS" if not missing_files else "FAIL"
    
    result = {
        "sensor": "verify-harness",
        "status": status,
        "checked_count": len(required_files),
        "missing_count": len(missing_files),
        "missing_files": missing_files
    }
    
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    if status == "FAIL":
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    verify_harness()
