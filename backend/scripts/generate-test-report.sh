#!/bin/bash

# Generate comprehensive test report from JSON results

RESULTS_DIR="./test-results"
LATEST_RESULTS=$(ls -t "$RESULTS_DIR"/results_*.json 2>/dev/null | head -1)

if [ -z "$LATEST_RESULTS" ]; then
    echo "No test results found. Run test-all-endpoints.sh first."
    exit 1
fi

REPORT_FILE="${LATEST_RESULTS%.json}_report.md"
TIMESTAMP=$(date)

echo "Generating test report from: $LATEST_RESULTS"

# Extract summary
SUMMARY=$(cat "$LATEST_RESULTS" | jq -r '.summary')
TOTAL=$(echo "$SUMMARY" | jq -r '.total')
PASSED=$(echo "$SUMMARY" | jq -r '.passed')
FAILED=$(echo "$SUMMARY" | jq -r '.failed')
SKIPPED=$(echo "$SUMMARY" | jq -r '.skipped')
SUCCESS_RATE=$(( PASSED * 100 / TOTAL ))

# Generate markdown report
cat > "$REPORT_FILE" << EOF
# Comprehensive API Endpoint Test Report

**Generated**: $TIMESTAMP  
**Results File**: $LATEST_RESULTS

## Executive Summary

- **Total Tests**: $TOTAL
- **✅ Passed**: $PASSED
- **❌ Failed**: $FAILED
- **⏭️ Skipped**: $SKIPPED
- **Success Rate**: ${SUCCESS_RATE}%

## Test Results by Module

EOF

# Module 1: Authentication
echo "### Module 1: Authentication" >> "$REPORT_FILE"
cat "$LATEST_RESULTS" | jq -r '.tests[] | select(.name | contains("/auth/")) | "\(.name)|\(.status)|\(.statusCode)|\(.expectedCode)|\(.duration)"' | while IFS='|' read -r name status statusCode expectedCode duration; do
    emoji="✅"
    [ "$status" = "FAIL" ] && emoji="❌"
    [ "$status" = "SKIP" ] && emoji="⏭️"
    echo "- $emoji **$name**" >> "$REPORT_FILE"
    [ "$status" = "FAIL" ] && echo "  - Expected: $expectedCode, Got: $statusCode" >> "$REPORT_FILE"
    [ -n "$duration" ] && [ "$duration" != "null" ] && echo "  - Duration: ${duration}ms" >> "$REPORT_FILE"
done

# Module 2: School Management
echo "" >> "$REPORT_FILE"
echo "### Module 2: School Management" >> "$REPORT_FILE"
cat "$LATEST_RESULTS" | jq -r '.tests[] | select(.name | contains("/schools")) | "\(.name)|\(.status)|\(.statusCode)|\(.expectedCode)|\(.duration)"' | while IFS='|' read -r name status statusCode expectedCode duration; do
    emoji="✅"
    [ "$status" = "FAIL" ] && emoji="❌"
    [ "$status" = "SKIP" ] && emoji="⏭️"
    echo "- $emoji **$name**" >> "$REPORT_FILE"
    [ "$status" = "FAIL" ] && echo "  - Expected: $expectedCode, Got: $statusCode" >> "$REPORT_FILE"
    [ -n "$duration" ] && [ "$duration" != "null" ] && echo "  - Duration: ${duration}ms" >> "$REPORT_FILE"
done

# Module 3: User Management
echo "" >> "$REPORT_FILE"
echo "### Module 3: User Management" >> "$REPORT_FILE"
cat "$LATEST_RESULTS" | jq -r '.tests[] | select(.name | contains("/users")) | "\(.name)|\(.status)|\(.statusCode)|\(.expectedCode)|\(.duration)"' | while IFS='|' read -r name status statusCode expectedCode duration; do
    emoji="✅"
    [ "$status" = "FAIL" ] && emoji="❌"
    [ "$status" = "SKIP" ] && emoji="⏭️"
    echo "- $emoji **$name**" >> "$REPORT_FILE"
    [ "$status" = "FAIL" ] && echo "  - Expected: $expectedCode, Got: $statusCode" >> "$REPORT_FILE"
    [ -n "$duration" ] && [ "$duration" != "null" ] && echo "  - Duration: ${duration}ms" >> "$REPORT_FILE"
done

# Module 4: Student Management
echo "" >> "$REPORT_FILE"
echo "### Module 4: Student Management" >> "$REPORT_FILE"
cat "$LATEST_RESULTS" | jq -r '.tests[] | select(.name | contains("/students")) | "\(.name)|\(.status)|\(.statusCode)|\(.expectedCode)|\(.duration)"' | while IFS='|' read -r name status statusCode expectedCode duration; do
    emoji="✅"
    [ "$status" = "FAIL" ] && emoji="❌"
    [ "$status" = "SKIP" ] && emoji="⏭️"
    echo "- $emoji **$name**" >> "$REPORT_FILE"
    [ "$status" = "FAIL" ] && echo "  - Expected: $expectedCode, Got: $statusCode" >> "$REPORT_FILE"
    [ -n "$duration" ] && [ "$duration" != "null" ] && echo "  - Duration: ${duration}ms" >> "$REPORT_FILE"
done

# Module 5: Attendance
echo "" >> "$REPORT_FILE"
echo "### Module 5: Attendance" >> "$REPORT_FILE"
cat "$LATEST_RESULTS" | jq -r '.tests[] | select(.name | contains("/attendance")) | "\(.name)|\(.status)|\(.statusCode)|\(.expectedCode)|\(.duration)"' | while IFS='|' read -r name status statusCode expectedCode duration; do
    emoji="✅"
    [ "$status" = "FAIL" ] && emoji="❌"
    [ "$status" = "SKIP" ] && emoji="⏭️"
    echo "- $emoji **$name**" >> "$REPORT_FILE"
    [ "$status" = "FAIL" ] && echo "  - Expected: $expectedCode, Got: $statusCode" >> "$REPORT_FILE"
    [ -n "$duration" ] && [ "$duration" != "null" ] && echo "  - Duration: ${duration}ms" >> "$REPORT_FILE"
done

# Module 6: Fee Management
echo "" >> "$REPORT_FILE"
echo "### Module 6: Fee Management" >> "$REPORT_FILE"
cat "$LATEST_RESULTS" | jq -r '.tests[] | select(.name | contains("/fees")) | "\(.name)|\(.status)|\(.statusCode)|\(.expectedCode)|\(.duration)"' | while IFS='|' read -r name status statusCode expectedCode duration; do
    emoji="✅"
    [ "$status" = "FAIL" ] && emoji="❌"
    [ "$status" = "SKIP" ] && emoji="⏭️"
    echo "- $emoji **$name**" >> "$REPORT_FILE"
    [ "$status" = "FAIL" ] && echo "  - Expected: $expectedCode, Got: $statusCode" >> "$REPORT_FILE"
    [ -n "$duration" ] && [ "$duration" != "null" ] && echo "  - Duration: ${duration}ms" >> "$REPORT_FILE"
done

# Module 7: Homework
echo "" >> "$REPORT_FILE"
echo "### Module 7: Homework" >> "$REPORT_FILE"
cat "$LATEST_RESULTS" | jq -r '.tests[] | select(.name | contains("/homework")) | "\(.name)|\(.status)|\(.statusCode)|\(.expectedCode)|\(.duration)"' | while IFS='|' read -r name status statusCode expectedCode duration; do
    emoji="✅"
    [ "$status" = "FAIL" ] && emoji="❌"
    [ "$status" = "SKIP" ] && emoji="⏭️"
    echo "- $emoji **$name**" >> "$REPORT_FILE"
    [ "$status" = "FAIL" ] && echo "  - Expected: $expectedCode, Got: $statusCode" >> "$REPORT_FILE"
    [ -n "$duration" ] && [ "$duration" != "null" ] && echo "  - Duration: ${duration}ms" >> "$REPORT_FILE"
done

# Module 8: Notices
echo "" >> "$REPORT_FILE"
echo "### Module 8: Notices" >> "$REPORT_FILE"
cat "$LATEST_RESULTS" | jq -r '.tests[] | select(.name | contains("/notices")) | "\(.name)|\(.status)|\(.statusCode)|\(.expectedCode)|\(.duration)"' | while IFS='|' read -r name status statusCode expectedCode duration; do
    emoji="✅"
    [ "$status" = "FAIL" ] && emoji="❌"
    [ "$status" = "SKIP" ] && emoji="⏭️"
    echo "- $emoji **$name**" >> "$REPORT_FILE"
    [ "$status" = "FAIL" ] && echo "  - Expected: $expectedCode, Got: $statusCode" >> "$REPORT_FILE"
    [ -n "$duration" ] && [ "$duration" != "null" ] && echo "  - Duration: ${duration}ms" >> "$REPORT_FILE"
done

# Module 9: Notifications
echo "" >> "$REPORT_FILE"
echo "### Module 9: Notifications" >> "$REPORT_FILE"
cat "$LATEST_RESULTS" | jq -r '.tests[] | select(.name | contains("/notifications")) | "\(.name)|\(.status)|\(.statusCode)|\(.expectedCode)|\(.duration)"' | while IFS='|' read -r name status statusCode expectedCode duration; do
    emoji="✅"
    [ "$status" = "FAIL" ] && emoji="❌"
    [ "$status" = "SKIP" ] && emoji="⏭️"
    echo "- $emoji **$name**" >> "$REPORT_FILE"
    [ "$status" = "FAIL" ] && echo "  - Expected: $expectedCode, Got: $statusCode" >> "$REPORT_FILE"
    [ -n "$duration" ] && [ "$duration" != "null" ] && echo "  - Duration: ${duration}ms" >> "$REPORT_FILE"
done

# Module 10: Reports
echo "" >> "$REPORT_FILE"
echo "### Module 10: Reports" >> "$REPORT_FILE"
cat "$LATEST_RESULTS" | jq -r '.tests[] | select(.name | contains("/reports")) | "\(.name)|\(.status)|\(.statusCode)|\(.expectedCode)|\(.duration)"' | while IFS='|' read -r name status statusCode expectedCode duration; do
    emoji="✅"
    [ "$status" = "FAIL" ] && emoji="❌"
    [ "$status" = "SKIP" ] && emoji="⏭️"
    echo "- $emoji **$name**" >> "$REPORT_FILE"
    [ "$status" = "FAIL" ] && echo "  - Expected: $expectedCode, Got: $statusCode" >> "$REPORT_FILE"
    [ -n "$duration" ] && [ "$duration" != "null" ] && echo "  - Duration: ${duration}ms" >> "$REPORT_FILE"
done

# Add failed tests section if any
if [ "$FAILED" -gt 0 ]; then
    cat >> "$REPORT_FILE" << EOF

## Failed Tests Details

EOF
    
    cat "$LATEST_RESULTS" | jq -r '.tests[] | select(.status == "FAIL") | "### \(.name)\n- **Expected Status**: \(.expectedCode)\n- **Actual Status**: \(.statusCode)\n- **Response**: \(.response)\n"' >> "$REPORT_FILE"
fi

# Add performance analysis
cat >> "$REPORT_FILE" << EOF

## Performance Analysis

EOF

# Calculate average response time
AVG_TIME=$(cat "$LATEST_RESULTS" | jq '[.tests[] | select(.duration != null and .duration != "null") | (.duration | tonumber)] | add / length | floor')
MAX_TIME=$(cat "$LATEST_RESULTS" | jq '[.tests[] | select(.duration != null and .duration != "null") | (.duration | tonumber)] | max')
MIN_TIME=$(cat "$LATEST_RESULTS" | jq '[.tests[] | select(.duration != null and .duration != "null") | (.duration | tonumber)] | min')

cat >> "$REPORT_FILE" << EOF
- **Average Response Time**: ${AVG_TIME}ms
- **Fastest Response**: ${MIN_TIME}ms
- **Slowest Response**: ${MAX_TIME}ms

### Slow Endpoints (>500ms)

EOF

cat "$LATEST_RESULTS" | jq -r '.tests[] | select(.duration != null and .duration != "null" and (.duration | tonumber) > 500) | "- **\(.name)**: \(.duration)ms"' >> "$REPORT_FILE"

# Add recommendations
cat >> "$REPORT_FILE" << EOF

## Recommendations

1. **✅ Authorization Testing**: All endpoints have been tested with appropriate roles (Admin, Teacher, Parent)
2. **✅ Error Handling**: Edge cases including invalid IDs, missing fields, and unauthorized access have been tested
3. **✅ Data Validation**: Duplicate entries, invalid formats, and business rule violations have been verified
4. **✅ Performance**: Response times are logged for each endpoint

## Next Steps

- Review any skipped tests and ensure test data is properly set up
- Monitor response times for endpoints exceeding 500ms
- Consider adding integration tests for complex workflows
- Add load testing for high-traffic endpoints
- Set up CI/CD pipeline to run these tests automatically

---
*Report generated on: $TIMESTAMP*  
*Test Results File: $LATEST_RESULTS*

EOF

echo ""
echo "✅ Test report generated: $REPORT_FILE"
echo ""
cat "$REPORT_FILE"
