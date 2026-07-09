import os
import sys
import stat
from pathlib import Path

def setup_utf8_output():
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

def install_hooks():
    setup_utf8_output()
    repo_root = Path(__file__).resolve().parent.parent.parent
    hooks_dir = repo_root / ".git" / "hooks"
    
    if not (repo_root / ".git").exists():
        print(f"❌ Error: .git directory not found at {repo_root}")
        sys.exit(1)
        
    hooks_dir.mkdir(parents=True, exist_ok=True)
    
    # Universal Launcher script content for pre-commit
    pre_commit_content = """#!/bin/sh
# Universal Git Hook Launcher for Windows (Git Bash/MSYS) and macOS/Linux
if command -v python3 >/dev/null 2>&1; then
    exec python3 .harness/guardrails/pre_commit.py "$@"
elif command -v python >/dev/null 2>&1; then
    exec python .harness/guardrails/pre_commit.py "$@"
elif command -v py >/dev/null 2>&1; then
    exec py .harness/guardrails/pre_commit.py "$@"
else
    echo "❌ Error: Python not found! Please install Python 3 to run Harness guardrails."
    exit 1
fi
"""

    # Universal Launcher script content for pre-push
    pre_push_content = """#!/bin/sh
# Universal Git Hook Launcher for Windows (Git Bash/MSYS) and macOS/Linux
if command -v python3 >/dev/null 2>&1; then
    exec python3 .harness/guardrails/pre_push.py "$@"
elif command -v python >/dev/null 2>&1; then
    exec python .harness/guardrails/pre_push.py "$@"
elif command -v py >/dev/null 2>&1; then
    exec py .harness/guardrails/pre_push.py "$@"
else
    echo "❌ Error: Python not found! Please install Python 3 to run Harness guardrails."
    exit 1
fi
"""

    hooks_to_install = {
        "pre-commit": pre_commit_content,
        "pre-push": pre_push_content
    }
    
    print(f"📦 Installing universal cross-platform Git hooks to {hooks_dir}...")
    
    for hook_name, content in hooks_to_install.items():
        hook_path = hooks_dir / hook_name
        with open(hook_path, "w", encoding="utf-8", newline="\n") as f:
            f.write(content)
            
        # Make hook executable on POSIX systems (macOS/Linux)
        try:
            st = os.stat(hook_path)
            os.chmod(hook_path, st.st_mode | stat.S_IEXEC | stat.S_IXGRP | stat.S_IXOTH)
        except Exception as e:
            # On Windows, chmod might not apply executable bits in the same way, which is normal
            pass
            
        print(f"✅ Successfully installed {hook_name}")
        
    print("\n🎉 All Git hooks installed successfully! Working across Windows & macOS.")

if __name__ == "__main__":
    install_hooks()
