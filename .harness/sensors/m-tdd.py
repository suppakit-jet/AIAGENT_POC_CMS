import os
import sys
import json
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

def count_loc(file_path):
    """Counts non-empty, non-comment lines of code in a file."""
    count = 0
    try:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            for line in f:
                stripped = line.strip()
                if not stripped:
                    continue
                # Simple comment skipping for TS/JS/Py
                if stripped.startswith("//") or stripped.startswith("#") or stripped.startswith("/*") or stripped.startswith("*"):
                    continue
                count += 1
    except Exception:
        pass
    return count

def check_tdd_discipline(target_dir):
    setup_utf8_output()
    target_path = Path(target_dir).resolve()
    
    if not target_path.exists():
        result = {
            "sensor": "m-tdd",
            "status": "FAIL",
            "timestamp": datetime.now().isoformat(),
            "error": f"Target directory not found: {target_dir}",
            "remediation": "Please provide a valid source directory path."
        }
        print(json.dumps(result, indent=2))
        sys.exit(1)
        
    prod_files = []
    test_files = []
    
    # Extensions to check
    valid_exts = {".ts", ".js", ".py"}
    
    for root, dirs, files in os.walk(target_path):
        # Exclude common non-source directories
        dirs[:] = [d for d in dirs if d not in ("node_modules", "dist", "build", "coverage", ".git", ".next", "__pycache__", "__fixtures__")]
        for file in files:
            ext = os.path.splitext(file)[1]
            if ext not in valid_exts or file.endswith(".d.ts"):
                continue
                
            full_path = Path(root) / file
            
            # Categorize test vs prod
            if (
                file.endswith(".spec.ts") or file.endswith(".test.ts") or
                file.endswith(".spec.js") or file.endswith(".test.js") or
                file.startswith("test_") or file.endswith("_test.py") or
                "__tests__" in str(full_path) or "/tests/" in str(full_path).replace("\\", "/")
            ):
                test_files.append(full_path)
            else:
                prod_files.append(full_path)
                
    prod_loc = sum(count_loc(f) for f in prod_files)
    test_loc = sum(count_loc(f) for f in test_files)
    
    ratio = round(test_loc / prod_loc, 2) if prod_loc > 0 else (10.0 if test_loc > 0 else 0.0)
    
    # M-TDD-01: Test-to-code ratio >= 1.0
    status_01 = "PASS" if ratio >= 1.0 else "FAIL"
    
    # M-TDD-06: No PRs/projects without tests (must have at least 1 test file if prod files exist)
    status_06 = "PASS" if (len(test_files) > 0 or len(prod_files) == 0) else "FAIL"
    
    overall_status = "PASS" if (status_01 == "PASS" and status_06 == "PASS") else "FAIL"
    
    remediation_tips = []
    if status_01 == "FAIL":
        remediation_tips.append(f"Test-to-code ratio is {ratio} (Threshold: >= 1.0). Write more tests to cover production code.")
    if status_06 == "FAIL":
        remediation_tips.append("No test files found! Every feature/code change must be accompanied by automated unit tests [M-TDD-06].")
        
    result = {
        "sensor": "m-tdd",
        "status": overall_status,
        "timestamp": datetime.now().isoformat(),
        "target": str(target_path),
        "metrics": {
            "M-TDD-01": {
                "name": "Test-to-Code Ratio",
                "value": ratio,
                "threshold": 1.0,
                "status": status_01,
                "prod_loc": prod_loc,
                "test_loc": test_loc,
                "prod_files_count": len(prod_files),
                "test_files_count": len(test_files)
            },
            "M-TDD-06": {
                "name": "PRs/Features without tests",
                "value": 0 if len(test_files) > 0 else 1,
                "threshold": 0,
                "status": status_06
            }
        },
        "remediation": "; ".join(remediation_tips) if remediation_tips else "TDD discipline maintained. Great job!"
    }
    
    print(json.dumps(result, indent=2))
    sys.exit(0 if overall_status == "PASS" else 1)

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "backend/src"
    check_tdd_discipline(target)
