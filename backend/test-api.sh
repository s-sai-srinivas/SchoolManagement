#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api"
ADMIN_TOKEN=""
TEACHER_TOKEN=""
SCHOOL_ID=""
TEACHER_ID=""
STUDENT_ID=""
FEE_STRUCTURE_ID=""
HOMEWORK_ID=""
NOTICE_ID=""

PASS_COUNT=0
FAIL_COUNT=0

echo "========================================="
echo "Backend API Comprehensive Testing"
echo "========================================="
echo ""

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((PASS_COUNT++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        ((FAIL_COUNT++))
    fi
}

echo "========================================="
echo "1. AUTHENTICATION TESTS"
echo "========================================="

# Admin Login
echo -n "1.1 Admin login... "
ADMIN_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"admin123","role":"ADMIN"}')

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
SCHOOL_ID=$(echo "$ADMIN_LOGIN" | grep -o '"schoolId":"[^"]*"' | cut -d'"' -f4)

[ -n "$ADMIN_TOKEN" ] && print_result 0 "Admin login" || { print_result 1 "Admin login"; exit 1; }

# Teacher Login
echo -n "1.2 Teacher login... "
TEACHER_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@demo.com","password":"teacher123","role":"TEACHER"}')

TEACHER_TOKEN=$(echo "$TEACHER_LOGIN" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
TEACHER_ID=$(echo "$TEACHER_LOGIN" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

[ -n "$TEACHER_TOKEN" ] && print_result 0 "Teacher login" || print_result 1 "Teacher login"

# Parent Login
echo -n "1.3 Parent login... "
PARENT_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"parent@demo.com","password":"parent123","role":"PARENT"}')

echo "$PARENT_LOGIN" | grep -q "accessToken" && print_result 0 "Parent login" || print_result 1 "Parent login"

# Get current user
echo -n "1.4 GET /auth/me... "
ME_RESPONSE=$(curl -s -X GET "$API_URL/auth/me" -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$ME_RESPONSE" | grep -q "admin@demo.com" && print_result 0 "Get current user" || print_result 1 "Get current user"

echo ""
echo "========================================="
echo "2. SCHOOL MANAGEMENT"
echo "========================================="

echo -n "2.1 GET /schools/:id... "
SCHOOL_RESPONSE=$(curl -s -X GET "$API_URL/schools/$SCHOOL_ID" -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$SCHOOL_RESPONSE" | grep -q "Demo School" && print_result 0 "Get school" || print_result 1 "Get school"

echo -n "2.2 PATCH /schools/:id... "
UPDATE_SCHOOL=$(curl -s -X PATCH "$API_URL/schools/$SCHOOL_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo School"}')
echo "$UPDATE_SCHOOL" | grep -q "Demo School" && print_result 0 "Update school" || print_result 1 "Update school"

echo ""
echo "========================================="
echo "3. USER MANAGEMENT"
echo "========================================="

echo -n "3.1 GET /users... "
USERS_RESPONSE=$(curl -s -X GET "$API_URL/users" -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$USERS_RESPONSE" | grep -q "admin@demo.com" && print_result 0 "Get all users" || print_result 1 "Get all users"

echo ""
echo "========================================="
echo "4. STUDENT MANAGEMENT"
echo "========================================="

echo -n "4.1 POST /students... "
CREATE_STUDENT=$(curl -s -X POST "$API_URL/students" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "admissionNo": "TEST001",
    "name": "Test Student",
    "class": "10",
    "section": "A",
    "schoolId": "'"$SCHOOL_ID"'"
  }')

STUDENT_ID=$(echo "$CREATE_STUDENT" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -n "$STUDENT_ID" ] && print_result 0 "Create student" || print_result 1 "Create student"

echo -n "4.2 GET /students... "
STUDENTS_RESPONSE=$(curl -s -X GET "$API_URL/students" -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$STUDENTS_RESPONSE" | grep -q "TEST001" && print_result 0 "Get all students" || print_result 1 "Get all students"

echo ""
echo "========================================="
echo "5. FEE MANAGEMENT"
echo "========================================="

echo -n "5.1 POST /fees/structure... "
CREATE_FEE=$(curl -s -X POST "$API_URL/fees/structure" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "schoolId": "'"$SCHOOL_ID"'",
    "annualAmountPaise": 1000000,
    "installments": 3,
    "installmentDates": ["2024-04-01", "2024-08-01", "2024-12-01"]
  }')

FEE_STRUCTURE_ID=$(echo "$CREATE_FEE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -n "$FEE_STRUCTURE_ID" ] && print_result 0 "Create fee structure" || { print_result 1 "Create fee structure"; echo "Response: $CREATE_FEE"; }

echo -n "5.2 GET /fees/structure/:schoolId... "
FEE_STRUCTURES=$(curl -s -X GET "$API_URL/fees/structure/$SCHOOL_ID" -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$FEE_STRUCTURES" | grep -q "annualAmountPaise" && print_result 0 "Get fee structures" || print_result 1 "Get fee structures"

echo ""
echo "========================================="
echo "6. HOMEWORK (Teacher Role)"
echo "========================================="

echo -n "6.1 POST /homework... "
CREATE_HOMEWORK=$(curl -s -X POST "$API_URL/homework" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "class": "10",
    "section": "A",
    "subject": "Mathematics",
    "description": "Complete exercises 1-10 from chapter 5"
  }')

HOMEWORK_ID=$(echo "$CREATE_HOMEWORK" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -n "$HOMEWORK_ID" ] && print_result 0 "Create homework" || { print_result 1 "Create homework"; echo "Response: $CREATE_HOMEWORK"; }

echo -n "6.2 GET /homework/class/:class/:section... "
HOMEWORK_LIST=$(curl -s -X GET "$API_URL/homework/class/10/A" -H "Authorization: Bearer $TEACHER_TOKEN")
echo "$HOMEWORK_LIST" | grep -q "Mathematics" && print_result 0 "Get homework by class" || print_result 1 "Get homework by class"

echo ""
echo "========================================="
echo "7. NOTICE MANAGEMENT"
echo "========================================="

echo -n "7.1 POST /notices... "
CREATE_NOTICE=$(curl -s -X POST "$API_URL/notices" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notice",
    "description": "This is a test notice for all students"
  }')

NOTICE_ID=$(echo "$CREATE_NOTICE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -n "$NOTICE_ID" ] && print_result 0 "Create notice" || { print_result 1 "Create notice"; echo "Response: $CREATE_NOTICE"; }

echo -n "7.2 GET /notices... "
NOTICES_LIST=$(curl -s -X GET "$API_URL/notices" -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$NOTICES_LIST" | grep -q "Test Notice" && print_result 0 "Get all notices" || print_result 1 "Get all notices"

echo ""
echo "========================================="
echo "8. REPORTS"
echo "========================================="

echo -n "8.1 GET /reports/fees/collection... "
FEE_REPORT=$(curl -s -X GET "$API_URL/reports/fees/collection?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$FEE_REPORT" | grep -q "totalCollected\|data" && print_result 0 "Fee collection report" || print_result 1 "Fee collection report"

echo -n "8.2 GET /reports/fees/outstanding... "
OUTSTANDING_REPORT=$(curl -s -X GET "$API_URL/reports/fees/outstanding" -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$OUTSTANDING_REPORT" | grep -q "totalOutstanding\|data" && print_result 0 "Outstanding fees report" || print_result 1 "Outstanding fees report"

echo ""
echo "========================================="
echo "TEST SUMMARY"
echo "========================================="
echo -e "${GREEN}Passed: $PASS_COUNT${NC}"
echo -e "${RED}Failed: $FAIL_COUNT${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    echo "Backend API is fully functional."
    exit 0
else
    echo -e "${YELLOW}⚠ Some tests failed.${NC}"
    exit 1
fi
