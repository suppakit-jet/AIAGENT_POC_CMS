#!/bin/bash
COVERAGE_FILE=$1
THRESHOLD=98.0

if [ ! -f "$COVERAGE_FILE" ]; then
    echo '{"error": "File not found"}'
    exit 1
fi

LINE_RATE=$(xmlstarlet sel -t -v "/coverage/@line-rate" "$COVERAGE_FILE")
VALUE=$(echo "$LINE_RATE * 100" | bc -l)

# Get files < 98%
AFFECTED_FILES=$(xmlstarlet sel -t -m "//class[@line-rate < 0.98]" -v "@filename" -n "$COVERAGE_FILE" | jq -R . | jq -s .)

STATUS="PASS"
if (( $(echo "$VALUE < $THRESHOLD" | bc -l) )); then
    STATUS="FAIL"
    REMEDIATION='{"summary": "Line coverage ต่ำกว่าเกณฑ์ที่กำหนด (98%)", "action_required": "เพิ่ม unit test ให้กับไฟล์ที่ระบุเพื่อดัน coverage ถึงเกณฑ์", "affected_files": '"$AFFECTED_FILES"'}'
else
    REMEDIATION='{"summary": "Coverage ผ่านเกณฑ์", "action_required": "ไม่มี", "affected_files": []}'
fi

cat <<EOF_JSON
{
  "metric_id": "M-COV-01",
  "name": "Overall Line Coverage",
  "value": $VALUE,
  "threshold": $THRESHOLD,
  "operator": "gte",
  "status": "$STATUS",
  "remediation": $REMEDIATION,
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF_JSON
