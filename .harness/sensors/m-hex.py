import json
import sys
from datetime import datetime
from collections import defaultdict

def setup_utf8_output():
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

def check_hexagonal(file_path):
    setup_utf8_output()
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        all_violations = data.get("summary", {}).get("violations", [])
        violations = [v for v in all_violations if v.get("rule", {}).get("severity") == "error"]
        
        status = "PASS" if len(violations) == 0 else "FAIL"
        
        violations_by_rule = defaultdict(list)
        affected_files = []
        
        for v in violations:
            rule_name = v.get("rule", {}).get("name", "unknown")
            violations_by_rule[rule_name].append(f"{v['from']} -> {v['to']}")
            affected_files.append(f"[{rule_name}] {v['from']} -> {v['to']}")
            
        result = {
            "metric_id": "M-HEX",
            "name": "Hexagonal Architecture Conformance",
            "value": len(violations),
            "threshold": 0,
            "operator": "lte",
            "status": status,
            "violations_by_rule": dict(violations_by_rule),
            "remediation": {
                "summary": f"พบ {len(violations)} การละเมิดกฎสถาปัตยกรรมระดับ Error" if status == "FAIL" else "สถาปัตยกรรมถูกต้องตามกฎ (0 Violations)",
                "action_required": "แก้ไขการ import ให้เป็นไปตามกฎของ Domain/Application/Adapters" if status == "FAIL" else "ไม่มี",
                "affected_files": affected_files
            },
            "timestamp": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        }
        print(json.dumps(result, indent=2, ensure_ascii=False))
        sys.exit(1 if status == "FAIL" else 0)
        
    except Exception as e:
        print(json.dumps({"sensor": "m-hex", "status": "FAIL", "error": f"Sensor error: {str(e)}"}, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    check_hexagonal(sys.argv[1])
