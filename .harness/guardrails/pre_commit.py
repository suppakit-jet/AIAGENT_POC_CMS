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
    
    print("--------------------------------------------------------")
    print("Running Pre-commit Guardrails (Cross-Platform Python)...")
    print("--------------------------------------------------------")
    
    if not backend_dir.exists():
        print(f"No backend directory found at {backend_dir}, skipping checks.")
        sys.exit(0)
        
    # 1. TypeScript Typecheck
    print("[1/3] Running TypeScript Typecheck...")
    res = run_cmd(["npx", "tsc", "--noEmit"], cwd=backend_dir)
    if res.returncode != 0:
        print("❌ TypeScript Typecheck FAILED!")
        if res.stdout: print(res.stdout)
        if res.stderr: print(res.stderr)
        print("Please fix the type errors above before committing.")
        print("ESCAPE HATCH: Use 'git commit --no-verify' to bypass.")
        sys.exit(1)
    print("✅ TypeScript Typecheck PASSED.\n")
    
    # 2. ESLint
    print("[2/3] Running ESLint...")
    res = run_cmd(["npx", "eslint", "src", "--ext", ".ts"], cwd=backend_dir)
    if res.returncode != 0:
        print("❌ Linting FAILED!")
        if res.stdout: print(res.stdout)
        if res.stderr: print(res.stderr)
        print("Please fix the lint errors above before committing.")
        print("ESCAPE HATCH: Use 'git commit --no-verify' to bypass.")
        sys.exit(1)
    print("✅ Linting PASSED.\n")
    
    # 3. Architecture check (m-hex.py)
    print("[3/3] Running Architecture Guardrail (Pre-commit)...")
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False, mode="w+", encoding="utf-8") as tmp_file:
        report_file_path = tmp_file.name
        
    try:
        # Run dependency-cruiser
        res_dep = run_cmd(["npx", "dependency-cruiser", "src", "--output-type", "json"], cwd=backend_dir, capture=True)
        with open(report_file_path, "w", encoding="utf-8") as f:
            f.write(res_dep.stdout if res_dep.stdout else "{}")
            
        # Run m-hex.py sensor
        py_exec = sys.executable or "python"
        res_hex = subprocess.run(
            [py_exec, str(sensor_dir / "m-hex.py"), report_file_path],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace"
        )
        
        out = res_hex.stdout.strip() if res_hex.stdout else ""
        status = "FAIL"
        try:
            data = json.loads(out)
            status = data.get("status", "FAIL")
        except Exception:
            status = "FAIL"
            
        if status == "FAIL" or res_hex.returncode != 0:
            print("❌ Architecture Guardrail FAILED!")
            print(out)
            print("--------------------------------------------------------")
            print("ESCAPE HATCH: Use 'git commit --no-verify' to bypass.")
            print("WARNING: Bypass will be flagged in pre-push, and CI pipeline will block later.")
            sys.exit(1)
        else:
            print("✅ Architecture Guardrail PASSED.")
            print("--------------------------------------------------------")
    finally:
        if os.path.exists(report_file_path):
            try:
                os.remove(report_file_path)
            except Exception:
                pass
                
    sys.exit(0)

if __name__ == "__main__":
    main()
