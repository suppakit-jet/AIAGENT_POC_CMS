import os
import sys
import json
import tempfile
import subprocess
from pathlib import Path

def setup_utf8_output():
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

def run_cmd(cmd_args, cwd=None, capture=False):
    """Runs a command cross-platform. Wraps in cmd.exe /c on Windows if needed."""
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

def main():
    setup_utf8_output()
    repo_root = Path(__file__).resolve().parent.parent.parent
    backend_dir = repo_root / "backend"
    sensor_dir = repo_root / ".harness" / "sensors"
    
    if not (backend_dir / "src").exists():
        print("No backend/src/ found, skipping pre-push sensors.")
        sys.exit(0)
        
    print("--------------------------------------------------------")
    print("Running Full Quality Gate (Pre-push Cross-Platform)...")
    print("--------------------------------------------------------")
    
    # 1. Run Tests + Coverage
    print("[1/2] Generating test coverage report...")
    res_cov = run_cmd(["npm", "run", "test:coverage"], cwd=backend_dir)
    if res_cov.returncode != 0:
        print("❌ Tests FAILED — fix failing tests before push.")
        sys.exit(1)
        
    cov_xml = backend_dir / "coverage" / "cobertura.xml"
    if not cov_xml.exists():
        cov_xml = backend_dir / "coverage" / "cobertura-coverage.xml"
    if not cov_xml.exists():
        print(f"❌ Coverage report not found at {cov_xml}")
        sys.exit(1)
        
    py_exec = sys.executable or "python"
    res_cov_sensor = subprocess.run(
        [py_exec, str(sensor_dir / "m-cov.py"), str(cov_xml)],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace"
    )
    
    out_cov = res_cov_sensor.stdout.strip() if res_cov_sensor.stdout else ""
    status_cov = "FAIL"
    try:
        data = json.loads(out_cov)
        status_cov = data.get("status", "FAIL")
    except Exception:
        status_cov = "FAIL"
        
    if status_cov == "FAIL" or res_cov_sensor.returncode != 0:
        print("❌ Coverage Gate FAILED!")
        print(out_cov)
        sys.exit(1)
    print("✅ Coverage Gate PASSED.\n")
    
    # 2. Run Architecture check
    print("[2/2] Checking Hexagonal Architecture...")
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False, mode="w+", encoding="utf-8") as tmp_file:
        report_file_path = tmp_file.name
        
    try:
        res_dep = run_cmd(["npx", "dependency-cruiser", "src", "--output-type", "json"], cwd=backend_dir, capture=True)
        with open(report_file_path, "w", encoding="utf-8") as f:
            f.write(res_dep.stdout if res_dep.stdout else "{}")
            
        res_hex = subprocess.run(
            [py_exec, str(sensor_dir / "m-hex.py"), report_file_path],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace"
        )
        
        out_hex = res_hex.stdout.strip() if res_hex.stdout else ""
        status_hex = "FAIL"
        try:
            data = json.loads(out_hex)
            status_hex = data.get("status", "FAIL")
        except Exception:
            status_hex = "FAIL"
            
        if status_hex == "FAIL" or res_hex.returncode != 0:
            print("❌ Architecture Gate FAILED (Hard block)!")
            print(out_hex)
            sys.exit(1)
        else:
            print("✅ Architecture Gate PASSED.")
    finally:
        if os.path.exists(report_file_path):
            try:
                os.remove(report_file_path)
            except Exception:
                pass
                
    print("--------------------------------------------------------")
    print("🎉 All Pre-push Quality Gates PASSED.")
    print("--------------------------------------------------------")
    sys.exit(0)

if __name__ == "__main__":
    main()
