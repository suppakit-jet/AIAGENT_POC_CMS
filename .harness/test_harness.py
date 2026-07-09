import os
import sys
import json
import shutil
import tempfile
import unittest
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

class TestEngineeringHarness(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        setup_utf8_output()
        cls.repo_root = Path(__file__).resolve().parent.parent
        cls.harness_dir = cls.repo_root / ".harness"
        cls.sensor_dir = cls.harness_dir / "sensors"
        cls.guardrail_dir = cls.harness_dir / "guardrails"
        cls.py_exec = sys.executable or "python"
        cls.tmp_dir = tempfile.mkdtemp(prefix="harness_test_")
        
    @classmethod
    def tearDownClass(cls):
        if os.path.exists(cls.tmp_dir):
            try:
                shutil.rmtree(cls.tmp_dir)
            except Exception:
                pass

    def run_sensor(self, script_name, *args):
        cmd = [self.py_exec, str(self.sensor_dir / script_name)] + list(args)
        return subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")

    # --- 1. Test m-cov.py (Coverage Gate Sensor) ---
    def test_mcov_pass(self):
        xml_path = os.path.join(self.tmp_dir, "cov_pass.xml")
        with open(xml_path, "w", encoding="utf-8") as f:
            f.write('<coverage line-rate="1.0" branch-rate="1.0" version="1.9" timestamp="123456789"></coverage>')
            
        res = self.run_sensor("m-cov.py", xml_path)
        self.assertEqual(res.returncode, 0, f"Expected pass, got output:\n{res.stdout}\n{res.stderr}")
        data = json.loads(res.stdout)
        self.assertEqual(data["status"], "PASS")
        self.assertEqual(data["value"], 100.0)

    def test_mcov_fail_below_threshold(self):
        xml_path = os.path.join(self.tmp_dir, "cov_fail.xml")
        with open(xml_path, "w", encoding="utf-8") as f:
            f.write('<coverage line-rate="0.80" branch-rate="0.80" version="1.9" timestamp="123456789"></coverage>')
            
        res = self.run_sensor("m-cov.py", xml_path)
        self.assertNotEqual(res.returncode, 0)
        data = json.loads(res.stdout)
        self.assertEqual(data["status"], "FAIL")
        self.assertEqual(data["value"], 80.0)

    def test_mcov_file_not_found(self):
        res = self.run_sensor("m-cov.py", os.path.join(self.tmp_dir, "nonexistent.xml"))
        self.assertNotEqual(res.returncode, 0)
        data = json.loads(res.stdout)
        self.assertEqual(data["status"], "FAIL")
        self.assertIn("error", data)

    # --- 2. Test m-hex.py (Hexagonal Architecture Sensor) ---
    def test_mhex_pass_clean(self):
        json_path = os.path.join(self.tmp_dir, "hex_clean.json")
        with open(json_path, "w", encoding="utf-8") as f:
            f.write(json.dumps({"summary": {"violations": []}}))
            
        res = self.run_sensor("m-hex.py", json_path)
        self.assertEqual(res.returncode, 0, f"Expected pass, got:\n{res.stdout}")
        data = json.loads(res.stdout)
        self.assertEqual(data["status"], "PASS")
        self.assertEqual(data["value"], 0)

    def test_mhex_fail_domain_import_outside(self):
        json_path = os.path.join(self.tmp_dir, "hex_violation.json")
        mock_data = {
            "summary": {
                "violations": [
                    {
                        "rule": {
                            "name": "M-HEX-01",
                            "severity": "error"
                        },
                        "from": "src/modules/auth/domain/entities/user.entity.ts",
                        "to": "src/modules/auth/adapters/out/db/prisma.ts"
                    }
                ]
            }
        }
        with open(json_path, "w", encoding="utf-8") as f:
            f.write(json.dumps(mock_data))
            
        res = self.run_sensor("m-hex.py", json_path)
        self.assertNotEqual(res.returncode, 0)
        data = json.loads(res.stdout)
        self.assertEqual(data["status"], "FAIL")
        self.assertGreater(data["value"], 0)
        self.assertIn("M-HEX-01", data["violations_by_rule"])

    # --- 3. Test m-tdd.py (TDD Discipline Sensor) ---
    def test_mtdd_pass_good_ratio(self):
        test_project = os.path.join(self.tmp_dir, "good_project")
        os.makedirs(test_project, exist_ok=True)
        
        # Write 10 LOC prod file
        with open(os.path.join(test_project, "calc.ts"), "w", encoding="utf-8") as f:
            f.write("\n".join([f"const x_{i} = {i};" for i in range(10)]))
            
        # Write 15 LOC test file
        with open(os.path.join(test_project, "calc.spec.ts"), "w", encoding="utf-8") as f:
            f.write("\n".join([f"expect({i}).toBe({i});" for i in range(15)]))
            
        res = self.run_sensor("m-tdd.py", test_project)
        self.assertEqual(res.returncode, 0, f"Expected pass, got:\n{res.stdout}")
        data = json.loads(res.stdout)
        self.assertEqual(data["status"], "PASS")
        self.assertGreaterEqual(data["metrics"]["M-TDD-01"]["value"], 1.0)
        self.assertEqual(data["metrics"]["M-TDD-06"]["value"], 0)

    def test_mtdd_fail_no_tests(self):
        test_project = os.path.join(self.tmp_dir, "bad_project")
        os.makedirs(test_project, exist_ok=True)
        
        # Write 20 LOC prod file without test file
        with open(os.path.join(test_project, "service.ts"), "w", encoding="utf-8") as f:
            f.write("\n".join([f"const y_{i} = {i};" for i in range(20)]))
            
        res = self.run_sensor("m-tdd.py", test_project)
        self.assertNotEqual(res.returncode, 0)
        data = json.loads(res.stdout)
        self.assertEqual(data["status"], "FAIL")
        self.assertEqual(data["metrics"]["M-TDD-06"]["value"], 1)

    # --- 4. Test install_hooks.py ---
    def test_install_hooks_execution(self):
        cmd = [self.py_exec, str(self.guardrail_dir / "install_hooks.py")]
        res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
        self.assertEqual(res.returncode, 0, f"install_hooks.py failed:\n{res.stdout}\n{res.stderr}")
        self.assertTrue((self.repo_root / ".git" / "hooks" / "pre-commit").exists())
        self.assertTrue((self.repo_root / ".git" / "hooks" / "pre-push").exists())

    # --- 5. Test harness-runner.py ---
    def test_harness_runner_cli(self):
        cmd = [self.py_exec, str(self.harness_dir / "harness-runner.py"), "--only", "tdd", "--json"]
        res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
        self.assertEqual(res.returncode, 0, f"harness-runner.py failed:\n{res.stdout}\n{res.stderr}")
        data = json.loads(res.stdout)
        self.assertIn("overall_status", data)
        self.assertEqual(data["overall_status"], "PASS")
        self.assertIn("tdd", data["results"])

    # --- 6. Test verify-harness.py ---
    def test_verify_harness_pass(self):
        cmd = [self.py_exec, 
               str(self.harness_dir / "scripts" / "verify-harness.py")]
        res = subprocess.run(cmd, capture_output=True, text=True,
                            encoding="utf-8", errors="replace")
        self.assertEqual(res.returncode, 0)
        data = json.loads(res.stdout)
        self.assertEqual(data["status"], "PASS")
        self.assertEqual(data["missing_count"], 0)
        self.assertEqual(data["checked_count"], 18)

if __name__ == "__main__":
    unittest.main(verbosity=2)
