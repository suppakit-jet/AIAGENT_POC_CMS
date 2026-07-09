import xml.etree.ElementTree as ET
import json
import sys
from datetime import datetime

def setup_utf8_output():
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

def check_coverage(file_path):
    setup_utf8_output()
    try:
        tree = ET.parse(file_path)
        root = tree.getroot()
        
        # Parse global rate
        line_rate_attr = root.attrib.get('line-rate')
        if line_rate_attr is None:
            raise ValueError("Invalid format: missing line-rate attribute")
        
        line_rate = float(line_rate_attr)
        value = line_rate * 100
        threshold = 98.0
        
        affected_files = []
        for cls in root.findall(".//class"):
            cls_rate = float(cls.attrib.get('line-rate', 0)) * 100
            if cls_rate < threshold:
                affected_files.append(cls.attrib.get('filename', 'unknown'))
                
        status = "PASS" if value >= threshold else "FAIL"
        
        result = {
            "metric_id": "M-COV-01",
            "name": "Overall Line Coverage",
            "value": value,
            "threshold": threshold,
            "operator": "gte",
            "status": status,
            "remediation": {
                "summary": "Line coverage ต่ำกว่าเกณฑ์ที่กำหนด (98%)" if status == "FAIL" else "Coverage ผ่านเกณฑ์",
                "action_required": "เพิ่ม unit test ให้กับไฟล์ที่ระบุเพื่อดัน coverage ถึงเกณฑ์" if status == "FAIL" else "ไม่มี",
                "affected_files": affected_files if status == "FAIL" else []
            },
            "timestamp": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        }
        print(json.dumps(result, indent=2, ensure_ascii=False))
        sys.exit(1 if status == "FAIL" else 0)
        
    except ET.ParseError:
        print(json.dumps({"sensor": "m-cov", "status": "FAIL", "error": "Invalid XML format"}, indent=2))
        sys.exit(1)
    except FileNotFoundError:
        print(json.dumps({"sensor": "m-cov", "status": "FAIL", "error": "File not found"}, indent=2))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"sensor": "m-cov", "status": "FAIL", "error": str(e)}, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing input file path"}, indent=2))
        sys.exit(1)
    check_coverage(sys.argv[1])
