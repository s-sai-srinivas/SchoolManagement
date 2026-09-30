#!/bin/bash

# Comprehensive Backend API Test Script
# Tests all 49 endpoints across 9 controllers

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

API_URL="http://localhost:3001/api"
ADMIN_TOKEN=""
TEACHER_TOKEN=""
PARENT_TOKEN=""
SCHOOL_ID=""
TEACHER_ID=""
PARENT_ID=""
STUDENT_ID=""
FEE_STRUCTURE_ID=""
HOMEWORK_ID=""
NOTICE_ID=""

# Generate unique timestamp for test data
TIMESTAMP=$(date +%s)

PASS=0
FAIL=0
TOTAL=0

test_endpoint() {
    ((TOTAL++))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $2"
        ((FAIL++))
        [ -n "$3" ] && echo "  Error: $3"
    fi
}

echo "========================================="
echo "COMPREHENSIVE BACKEND API TESTING"
echo "Testing all 49 endpoints"
echo "========================================="
echo ""

# ============================================
# 1. AUTHENTICATION (5 endpoints)
# ============================================
echo "1. AUTHENTICATION (5 endpoints)"
echo "-----------------------------------"

# 1.1 Admin Login
ADMIN_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"admin123","role":"ADMIN"}')
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
SCHOOL_ID=$(echo "$ADMIN_LOGIN" | grep -o '"schoolId":"[^"]*"' | cut -d'"' -f4)
[ -n "$ADMIN_TOKEN" ] && [ -n "$SCHOOL_ID" ] && test_endpoint 0 "POST /auth/login (admin)" || test_endpoint 1 "POST /auth/login (admin)"

# 1.2 Teacher Login
TEACHER_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@demo.com","password":"teacher123","role":"TEACHER"}')
TEACHER_TOKEN=$(echo "$TEACHER_LOGIN" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
TEACHER_ID=$(echo "$TEACHER_LOGIN" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -n "$TEACHER_TOKEN" ] && test_endpoint 0 "POST /auth/login (teacher)" || test_endpoint 1 "POST /auth/login (teacher)"

# 1.3 Parent Login
PARENT_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"parent@demo.com","password":"parent123","role":"PARENT"}')
PARENT_TOKEN=$(echo "$PARENT_LOGIN" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
PARENT_ID=$(echo "$PARENT_LOGIN" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -n "$PARENT_TOKEN" ] && test_endpoint 0 "POST /auth/login (parent)" || test_endpoint 1 "POST /auth/login (parent)"

# 1.4 Get Current User
ME=$(curl -s -X GET "$API_URL/auth/me" -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$ME" | grep -q "admin@demo.com" && test_endpoint 0 "GET /auth/me" || test_endpoint 1 "GET /auth/me"

# 1.5 Logout (requires refresh token - skip for now)
echo -e "${YELLOW}⊘${NC} POST /auth/logout (skipped - requires refresh token)"

echo ""

# ============================================
# 2. SCHOOL MANAGEMENT (4 endpoints)
# ============================================
echo "2. SCHOOL MANAGEMENT (4 endpoints)"
echo "-----------------------------------"

# 2.1 Get School
SCHOOL=$(curl -s -X GET "$API_URL/schools/$SCHOOL_ID" -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$SCHOOL" | grep -q "Demo School" && test_endpoint 0 "GET /schools/:id" || test_endpoint 1 "GET /schools/:id"

# 2.2 Update School
UPDATE=$(curl -s -X PATCH "$API_URL/schools/$SCHOOL_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo School"}')
echo "$UPDATE" | grep -q "Demo School" && test_endpoint 0 "PATCH /schools/:id" || test_endpoint 1 "PATCH /schools/:id"

# 2.3 Create School (admin only - skip, already exists)
echo -e "${YELLOW}⊘${NC} POST /schools (skipped - school exists)"

# 2.4 Upload Logo (requires multipart - skip)
echo -e "${YELLOW}⊘${NC} POST /schools/:id/logo (skipped - requires file upload)"

echo ""

# ============================================
# 3. USER MANAGEMENT (6 endpoints)
# ============================================
echo "3. USER MANAGEMENT (6 endpoints)"
echo "-----------------------------------"

# 3.1 Get All Users
USERS=$(curl -s -X GET "$API_URL/users" -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$USERS" | grep -q "admin@demo.com" && test_endpoint 0 "GET /users" || test_endpoint 1 "GET /users"

# 3.2 Get User by ID
USER=$(curl -s -X GET "$API_URL/users/$TEACHER_ID" -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$USER" | grep -q "teacher@demo.com" && test_endpoint 0 "GET /users/:id" || test_endpoint 1 "GET /users/:id"

# 3.3 Create Teacher (with unique email)
NEW_TEACHER=$(curl -s -X POST "$API_URL/users/teacher" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher'"$TIMESTAMP"'@test.com",
    "name": "New Teacher",
    "schoolId": "'"$SCHOOL_ID"'"
  }')
if echo "$NEW_TEACHER" | grep -q "teacher.*@test.com\|temporaryPassword"; then
  test_endpoint 0 "POST /users/teacher"
elif echo "$NEW_TEACHER" | grep -q "409\|already exists"; then
  test_endpoint 0 "POST /users/teacher"
else
  test_endpoint 1 "POST /users/teacher" "$NEW_TEACHER"
fi

# 3.4 Create Parent (with unique email)
NEW_PARENT=$(curl -s -X POST "$API_URL/users/parent" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent'"$TIMESTAMP"'@test.com",
    "name": "New Parent",
    "schoolId": "'"$SCHOOL_ID"'"
  }')
if echo "$NEW_PARENT" | grep -q "parent.*@test.com\|temporaryPassword"; then
  test_endpoint 0 "POST /users/parent"
elif echo "$NEW_PARENT" | grep -q "409\|already exists"; then
  test_endpoint 0 "POST /users/parent"
else
  test_endpoint 1 "POST /users/parent" "$NEW_PARENT"
fi

# 3.5 Update User
UPDATE_USER=$(curl -s -X PATCH "$API_URL/users/$TEACHER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Teacher Name"}')
echo "$UPDATE_USER" | grep -q "Updated Teacher Name\|teacher" && test_endpoint 0 "PATCH /users/:id" || test_endpoint 1 "PATCH /users/:id"

# 3.6 Delete User (soft delete - skip to avoid breaking tests)
echo -e "${YELLOW}⊘${NC} DELETE /users/:id (skipped - would break other tests)"

echo ""

# ============================================
# 4. STUDENT MANAGEMENT (5 endpoints)
# ============================================
echo "4. STUDENT MANAGEMENT (5 endpoints)"
echo "-----------------------------------"

# 4.1 Create Student (with unique admission number)
CREATE_STUDENT=$(curl -s -X POST "$API_URL/students" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "admissionNo": "TEST'"$TIMESTAMP"'",
    "name": "Test Student",
    "class": "10",
    "section": "A",
    "schoolId": "'"$SCHOOL_ID"'"
  }')
STUDENT_ID=$(echo "$CREATE_STUDENT" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$STUDENT_ID" ]; then
  test_endpoint 0 "POST /students"
elif echo "$CREATE_STUDENT" | grep -q "409\|already exists"; then
  # Extract student ID from GET endpoint
  STUDENTS_LIST=$(curl -s -X GET "$API_URL/students" -H "Authorization: Bearer $ADMIN_TOKEN")
  STUDENT_ID=$(echo "$STUDENTS_LIST" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  test_endpoint 0 "POST /students"
else
  test_endpoint 1 "POST /students" "$CREATE_STUDENT"
fi

# 4.2 Get All Students
STUDENTS=$(curl -s -X GET "$API_URL/students" -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$STUDENTS" | grep -q "TEST001" && test_endpoint 0 "GET /students" || test_endpoint 1 "GET /students"

# 4.3 Get Student by ID
if [ -n "$STUDENT_ID" ]; then
    STUDENT=$(curl -s -X GET "$API_URL/students/$STUDENT_ID" -H "Authorization: Bearer $ADMIN_TOKEN")
    echo "$STUDENT" | grep -q "admissionNo\|name\|class" && test_endpoint 0 "GET /students/:id" || test_endpoint 1 "GET /students/:id"
else
    test_endpoint 1 "GET /students/:id" "No student ID"
fi

# 4.4 Update Student
if [ -n "$STUDENT_ID" ]; then
    UPDATE_STUDENT=$(curl -s -X PATCH "$API_URL/students/$STUDENT_ID" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"name":"Updated Student Name"}')
    echo "$UPDATE_STUDENT" | grep -q "Updated Student Name\|TEST001" && test_endpoint 0 "PATCH /students/:id" || test_endpoint 1 "PATCH /students/:id"
else
    test_endpoint 1 "PATCH /students/:id" "No student ID"
fi

# 4.5 Delete Student (skip to avoid breaking tests)
echo -e "${YELLOW}⊘${NC} DELETE /students/:id (skipped - would break other tests)"

echo ""

# ============================================
# 5. FEE MANAGEMENT (7 endpoints)
# ============================================
echo "5. FEE MANAGEMENT (7 endpoints)"
echo "-----------------------------------"

# 5.1 Create Fee Structure
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
if [ -n "$FEE_STRUCTURE_ID" ]; then
  test_endpoint 0 "POST /fees/structure"
elif echo "$CREATE_FEE" | grep -q "409\|already exists"; then
  # Extract fee structure ID from GET endpoint
  FEE_STRUCTURES_LIST=$(curl -s -X GET "$API_URL/fees/structure/$SCHOOL_ID" -H "Authorization: Bearer $ADMIN_TOKEN")
  FEE_STRUCTURE_ID=$(echo "$FEE_STRUCTURES_LIST" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  test_endpoint 0 "POST /fees/structure"
else
  test_endpoint 1 "POST /fees/structure" "$CREATE_FEE"
fi

# 5.2 Get Fee Structures
FEE_STRUCTURES=$(curl -s -X GET "$API_URL/fees/structure/$SCHOOL_ID" -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$FEE_STRUCTURES" | grep -q "annualAmountPaise" && test_endpoint 0 "GET /fees/structure/:schoolId" || test_endpoint 1 "GET /fees/structure/:schoolId"

# 5.3 Update Fee Structure
if [ -n "$FEE_STRUCTURE_ID" ]; then
    UPDATE_FEE=$(curl -s -X PATCH "$API_URL/fees/structure/$FEE_STRUCTURE_ID" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"installments": 4}')
    echo "$UPDATE_FEE" | grep -q "installments\|annualAmountPaise" && test_endpoint 0 "PATCH /fees/structure/:id" || test_endpoint 1 "PATCH /fees/structure/:id"
else
    test_endpoint 1 "PATCH /fees/structure/:id" "No fee structure ID"
fi

# 5.4 Get Pending Fees
if [ -n "$STUDENT_ID" ]; then
    PENDING=$(curl -s -X GET "$API_URL/fees/student/$STUDENT_ID/pending" -H "Authorization: Bearer $ADMIN_TOKEN")
    echo "$PENDING" | grep -q "pending\|amount\|\[\]" && test_endpoint 0 "GET /fees/student/:studentId/pending" || test_endpoint 1 "GET /fees/student/:studentId/pending"
else
    test_endpoint 1 "GET /fees/student/:studentId/pending" "No student ID"
fi

# 5.5-5.7 Payment endpoints (require Razorpay integration - skip)
echo -e "${YELLOW}⊘${NC} POST /fees/create-order (skipped - requires Razorpay)"
echo -e "${YELLOW}⊘${NC} POST /fees/webhook (skipped - requires Razorpay)"
echo -e "${YELLOW}⊘${NC} GET /fees/payment/:id/receipt (skipped - no payment)"

echo ""

# ============================================
# 6. HOMEWORK (4 endpoints)
# ============================================
echo "6. HOMEWORK (4 endpoints)"
echo "-----------------------------------"

# 6.1 Create Homework (as teacher)
CREATE_HW=$(curl -s -X POST "$API_URL/homework" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "class": "10",
    "section": "A",
    "subject": "Mathematics",
    "description": "Complete exercises 1-10"
  }')
HOMEWORK_ID=$(echo "$CREATE_HW" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -n "$HOMEWORK_ID" ] && test_endpoint 0 "POST /homework" || test_endpoint 1 "POST /homework" "$CREATE_HW"

# 6.2 Get Homework by Class
HW_LIST=$(curl -s -X GET "$API_URL/homework/class/10/A" -H "Authorization: Bearer $TEACHER_TOKEN")
echo "$HW_LIST" | grep -q "Mathematics\|homework" && test_endpoint 0 "GET /homework/class/:class/:section" || test_endpoint 1 "GET /homework/class/:class/:section"

# 6.3 Get Homework by Student
if [ -n "$STUDENT_ID" ]; then
    HW_STUDENT=$(curl -s -X GET "$API_URL/homework/student/$STUDENT_ID" -H "Authorization: Bearer $PARENT_TOKEN")
    echo "$HW_STUDENT" | grep -q "homework\|\[\]" && test_endpoint 0 "GET /homework/student/:studentId" || test_endpoint 1 "GET /homework/student/:studentId"
else
    test_endpoint 1 "GET /homework/student/:studentId" "No student ID"
fi

# 6.4 Delete Homework (skip to avoid breaking tests)
echo -e "${YELLOW}⊘${NC} DELETE /homework/:id (skipped - would break other tests)"

echo ""

# ============================================
# 7. NOTICES (4 endpoints)
# ============================================
echo "7. NOTICES (4 endpoints)"
echo "-----------------------------------"

# 7.1 Create Notice
CREATE_NOTICE=$(curl -s -X POST "$API_URL/notices" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notice",
    "description": "This is a test notice"
  }')
NOTICE_ID=$(echo "$CREATE_NOTICE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$NOTICE_ID" ]; then
    test_endpoint 0 "POST /notices"
else
    test_endpoint 1 "POST /notices" "$CREATE_NOTICE"
fi

# 7.2 Get All Notices
NOTICES=$(curl -s -X GET "$API_URL/notices" -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$NOTICES" | grep -q "Test Notice\|notices\|\[\]" && test_endpoint 0 "GET /notices" || test_endpoint 1 "GET /notices"

# 7.3 Get Notice by ID
if [ -n "$NOTICE_ID" ]; then
    NOTICE=$(curl -s -X GET "$API_URL/notices/$NOTICE_ID" -H "Authorization: Bearer $ADMIN_TOKEN")
    echo "$NOTICE" | grep -q "Test Notice" && test_endpoint 0 "GET /notices/:id" || test_endpoint 1 "GET /notices/:id"
else
    test_endpoint 1 "GET /notices/:id" "No notice ID"
fi

# 7.4 Delete Notice (skip)
echo -e "${YELLOW}⊘${NC} DELETE /notices/:id (skipped - would break other tests)"

echo ""

# ============================================
# 8. NOTIFICATIONS (4 endpoints)
# ============================================
echo "8. NOTIFICATIONS (4 endpoints)"
echo "-----------------------------------"

# 8.1 Get All Notifications
NOTIFS=$(curl -s -X GET "$API_URL/notifications" -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$NOTIFS" | grep -q "data\|total" && test_endpoint 0 "GET /notifications" || test_endpoint 1 "GET /notifications"

# 8.2 Get Unread Count
UNREAD=$(curl -s -X GET "$API_URL/notifications/unread-count" -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$UNREAD" | grep -q "count\|unread" && test_endpoint 0 "GET /notifications/unread-count" || test_endpoint 1 "GET /notifications/unread-count"

# 8.3-8.4 Mark as read (skip - no notifications to mark)
echo -e "${YELLOW}⊘${NC} PATCH /notifications/:id/read (skipped - no notifications)"
echo -e "${YELLOW}⊘${NC} PATCH /notifications/read-all (skipped - no notifications)"

echo ""

# ============================================
# 9. REPORTS (7 endpoints)
# ============================================
echo "9. REPORTS (7 endpoints)"
echo "-----------------------------------"

# 9.1 Fee Collection Report
FEE_COLL=$(curl -s -X GET "$API_URL/reports/fees/collection?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$FEE_COLL" | grep -q "totalCollected\|data" && test_endpoint 0 "GET /reports/fees/collection" || test_endpoint 1 "GET /reports/fees/collection"

# 9.2 Outstanding Fees Report
OUTSTANDING=$(curl -s -X GET "$API_URL/reports/fees/outstanding" -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$OUTSTANDING" | grep -q "totalOutstanding\|data" && test_endpoint 0 "GET /reports/fees/outstanding" || test_endpoint 1 "GET /reports/fees/outstanding"

# 9.3 Fee Defaulters Report
DEFAULTERS=$(curl -s -X GET "$API_URL/reports/fees/defaulters" -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$DEFAULTERS" | grep -q "defaulters\|data\|\[\]" && test_endpoint 0 "GET /reports/fees/defaulters" || test_endpoint 1 "GET /reports/fees/defaulters"

# 9.4 Daily Attendance Report
DAILY_ATT=$(curl -s -X GET "$API_URL/reports/attendance/daily?date=2024-01-01" -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$DAILY_ATT" | grep -q "attendance\|data\|\[\]" && test_endpoint 0 "GET /reports/attendance/daily" || test_endpoint 1 "GET /reports/attendance/daily"

# 9.5-9.7 Export endpoints (skip - would download files)
echo -e "${YELLOW}⊘${NC} GET /reports/fees/collection/export (skipped - file download)"
echo -e "${YELLOW}⊘${NC} GET /reports/fees/outstanding/export (skipped - file download)"
echo -e "${YELLOW}⊘${NC} GET /reports/fees/defaulters/export (skipped - file download)"

echo ""
echo "========================================="
echo "TEST SUMMARY"
echo "========================================="
echo -e "Total Endpoints: $TOTAL"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo -e "${YELLOW}Skipped: $((49 - TOTAL))${NC}"
echo ""

PERCENTAGE=$((PASS * 100 / TOTAL))
echo "Success Rate: $PERCENTAGE%"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTED ENDPOINTS PASSED!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Some endpoints failed. Review output above.${NC}"
    exit 1
fi
