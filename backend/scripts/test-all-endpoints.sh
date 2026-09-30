#!/bin/bash

# Comprehensive API Endpoint Testing Script
# Tests all 60+ endpoints across 10 modules

BASE_URL="${API_URL:-http://localhost:3001/api}"
TEST_RESULTS_DIR="./test-results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_FILE="$TEST_RESULTS_DIR/results_$TIMESTAMP.json"
SUMMARY_FILE="$TEST_RESULTS_DIR/summary_$TIMESTAMP.txt"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# Test data storage
ADMIN_TOKEN=""
TEACHER_TOKEN=""
PARENT_TOKEN=""
SCHOOL_ID=""
STUDENT_ID=""
TEACHER_ID=""
PARENT_ID=""
FEE_STRUCTURE_ID=""
HOMEWORK_ID=""
NOTICE_ID=""
NOTIFICATION_ID=""
ATTENDANCE_ID=""

# Create results directory
mkdir -p "$TEST_RESULTS_DIR"

# Initialize results JSON
echo '{"timestamp":"'$TIMESTAMP'","tests":[],"summary":{"total":0,"passed":0,"failed":0,"skipped":0}}' > "$RESULTS_FILE"

# Helper function to log test result
log_test() {
    local test_name="$1"
    local status="$2"  # PASS, FAIL, SKIP
    local status_code="$3"
    local expected_code="$4"
    local response="$5"
    local duration="$6"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    case $status in
        PASS)
            PASSED_TESTS=$((PASSED_TESTS + 1))
            echo -e "${GREEN}✅ PASS${NC}: $test_name (${duration}ms)"
            ;;
        FAIL)
            FAILED_TESTS=$((FAILED_TESTS + 1))
            echo -e "${RED}❌ FAIL${NC}: $test_name - Expected $expected_code, got $status_code"
            echo -e "   Response: ${response:0:200}"
            ;;
        SKIP)
            SKIPPED_TESTS=$((SKIPPED_TESTS + 1))
            echo -e "${YELLOW}⏭️  SKIP${NC}: $test_name"
            ;;
    esac
    
    # Append to JSON results
    local json_result=$(jq -n \
        --arg name "$test_name" \
        --arg status "$status" \
        --arg status_code "$status_code" \
        --arg expected_code "$expected_code" \
        --arg response "$response" \
        --arg duration "$duration" \
        '{name: $name, status: $status, statusCode: $status_code, expectedCode: $expected_code, response: $response, duration: $duration}')
    
    jq ".tests += [$json_result]" "$RESULTS_FILE" > "$RESULTS_FILE.tmp" && mv "$RESULTS_FILE.tmp" "$RESULTS_FILE"
}

# Helper function to make API call
api_call() {
    local method="$1"
    local endpoint="$2"
    local token="$3"
    local data="$4"
    local expected_code="${5:-200}"
    
    local start_time=$(date +%s%N)
    local response
    local status_code
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            ${token:+-H "Authorization: Bearer $token"} \
            -d "$data" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            ${token:+-H "Authorization: Bearer $token"} 2>&1)
    fi
    
    status_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | sed '$d')
    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 ))
    
    if [ "$status_code" = "$expected_code" ]; then
        log_test "$method $endpoint" "PASS" "$status_code" "$expected_code" "$response_body" "$duration"
        echo "$response_body"
        return 0
    else
        log_test "$method $endpoint" "FAIL" "$status_code" "$expected_code" "$response_body" "$duration"
        echo "$response_body"
        return 1
    fi
}

# Helper function to extract JSON field
extract_field() {
    local json="$1"
    local field="$2"
    # Use jq if available, otherwise use grep
    if command -v jq &> /dev/null && [ -n "$json" ] && echo "$json" | jq empty 2>/dev/null; then
        echo "$json" | jq -r ".$field // empty" 2>/dev/null | head -1 | grep -v "^null$" | grep -v "^$"
    else
        # Fallback to grep
        local result=$(echo "$json" | grep -o "\"$field\":\"[^\"]*" | head -1 | cut -d'"' -f4)
        if [ -z "$result" ]; then
            result=$(echo "$json" | grep -o "\"$field\":[^,}]*" | head -1 | cut -d':' -f2 | tr -d ' "')
        fi
        echo "$result"
    fi
}

echo "=========================================="
echo "  Comprehensive API Endpoint Testing"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo "Results: $RESULTS_FILE"
echo ""

# ==========================================
# PHASE 1: Authentication & Setup
# ==========================================
echo "📋 PHASE 1: Authentication & Setup"
echo "-----------------------------------"

# 1.1 Login as Admin
echo "1.1 Testing POST /auth/login (Admin)..."
LOGIN_RESPONSE=$(api_call "POST" "/auth/login" "" \
    '{"email":"admin@demo.com","password":"admin123","role":"ADMIN"}' 200)
if command -v jq &> /dev/null && echo "$LOGIN_RESPONSE" | jq empty 2>/dev/null; then
    ADMIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken // empty')
    SCHOOL_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.user.schoolId // empty')
else
    ADMIN_TOKEN=$(extract_field "$LOGIN_RESPONSE" "accessToken")
    SCHOOL_ID=$(extract_field "$LOGIN_RESPONSE" "schoolId")
fi

# 1.2 Login as Teacher
echo "1.2 Testing POST /auth/login (Teacher)..."
TEACHER_RESPONSE=$(api_call "POST" "/auth/login" "" \
    '{"email":"teacher@demo.com","password":"teacher123","role":"TEACHER"}' 200)
if command -v jq &> /dev/null && echo "$TEACHER_RESPONSE" | jq empty 2>/dev/null; then
    TEACHER_TOKEN=$(echo "$TEACHER_RESPONSE" | jq -r '.accessToken // empty')
    TEACHER_ID=$(echo "$TEACHER_RESPONSE" | jq -r '.user.id // empty')
else
    TEACHER_TOKEN=$(extract_field "$TEACHER_RESPONSE" "accessToken")
    TEACHER_ID=$(extract_field "$TEACHER_RESPONSE" "id")
fi

# 1.3 Login as Parent
echo "1.3 Testing POST /auth/login (Parent)..."
PARENT_RESPONSE=$(api_call "POST" "/auth/login" "" \
    '{"email":"parent@demo.com","password":"parent123","role":"PARENT"}' 200)
if command -v jq &> /dev/null && echo "$PARENT_RESPONSE" | jq empty 2>/dev/null; then
    PARENT_TOKEN=$(echo "$PARENT_RESPONSE" | jq -r '.accessToken // empty')
    PARENT_ID=$(echo "$PARENT_RESPONSE" | jq -r '.user.id // empty')
else
    PARENT_TOKEN=$(extract_field "$PARENT_RESPONSE" "accessToken")
    PARENT_ID=$(extract_field "$PARENT_RESPONSE" "id")
fi

# 1.4 Test invalid login
echo "1.4 Testing POST /auth/login (Invalid credentials)..."
api_call "POST" "/auth/login" "" '{"email":"invalid@demo.com","password":"wrong","role":"ADMIN"}' 401 > /dev/null

# 1.5 Get current user (Admin)
echo "1.5 Testing GET /auth/me (Admin)..."
api_call "GET" "/auth/me" "$ADMIN_TOKEN" "" 200 > /dev/null

# 1.6 Get current user (Teacher)
echo "1.6 Testing GET /auth/me (Teacher)..."
api_call "GET" "/auth/me" "$TEACHER_TOKEN" "" 200 > /dev/null

# 1.7 Get current user (Parent)
echo "1.7 Testing GET /auth/me (Parent)..."
api_call "GET" "/auth/me" "$PARENT_TOKEN" "" 200 > /dev/null

# 1.8 Test refresh token (need to get fresh token)
echo "1.8 Testing POST /auth/refresh..."
ADMIN_LOGIN_FRESH=$(api_call "POST" "/auth/login" "" \
    '{"email":"admin@demo.com","password":"admin123","role":"ADMIN"}' 200)
if command -v jq &> /dev/null && echo "$ADMIN_LOGIN_FRESH" | jq empty 2>/dev/null; then
    REFRESH_TOKEN=$(echo "$ADMIN_LOGIN_FRESH" | jq -r '.refreshToken // empty')
else
    REFRESH_TOKEN=$(extract_field "$ADMIN_LOGIN_FRESH" "refreshToken")
fi
if [ -n "$REFRESH_TOKEN" ] && [ "$REFRESH_TOKEN" != "null" ] && [ "$REFRESH_TOKEN" != "" ]; then
    api_call "POST" "/auth/refresh" "" "{\"refreshToken\":\"$REFRESH_TOKEN\"}" 200 > /dev/null
else
    log_test "POST /auth/refresh" "SKIP" "N/A" "200" "Could not extract refresh token" "0"
fi

# 1.9 Test logout
echo "1.9 Testing POST /auth/logout..."
if [ -n "$REFRESH_TOKEN" ]; then
    api_call "POST" "/auth/logout" "$ADMIN_TOKEN" "{\"refreshToken\":\"$REFRESH_TOKEN\"}" 200 > /dev/null
else
    log_test "POST /auth/logout" "SKIP" "N/A" "200" "No refresh token available" "0"
fi

# Get a student ID for testing
echo "Getting test student ID..."
STUDENTS_RESPONSE=$(api_call "GET" "/students" "$ADMIN_TOKEN" "" 200)
if command -v jq &> /dev/null; then
    STUDENT_ID=$(echo "$STUDENTS_RESPONSE" | jq -r 'if type == "array" then .[0].id elif .data then .data[0].id else .[0].id end' 2>/dev/null | head -1)
else
    STUDENT_ID=$(echo "$STUDENTS_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
fi

echo ""
echo "✅ Phase 1 Complete"
echo ""

# ==========================================
# PHASE 2: School Management
# ==========================================
echo "📋 PHASE 2: School Management"
echo "-----------------------------------"

# 2.1 Get school
echo "2.1 Testing GET /schools/:id..."
api_call "GET" "/schools/$SCHOOL_ID" "$ADMIN_TOKEN" "" 200 > /dev/null

# 2.2 Update school
echo "2.2 Testing PATCH /schools/:id..."
api_call "PATCH" "/schools/$SCHOOL_ID" "$ADMIN_TOKEN" \
    '{"name":"Updated Demo School"}' 200 > /dev/null

# 2.3 Test invalid school ID
echo "2.3 Testing GET /schools/:id (Invalid ID)..."
api_call "GET" "/schools/00000000-0000-0000-0000-000000000000" "$ADMIN_TOKEN" "" 404 > /dev/null

# 2.4 Test non-admin access
echo "2.4 Testing PATCH /schools/:id (Non-admin)..."
api_call "PATCH" "/schools/$SCHOOL_ID" "$TEACHER_TOKEN" \
    '{"name":"Unauthorized Update"}' 403 > /dev/null

echo ""
echo "✅ Phase 2 Complete"
echo ""

# ==========================================
# PHASE 3: User Management
# ==========================================
echo "📋 PHASE 3: User Management"
echo "-----------------------------------"

# 3.1 Create teacher (use unique email)
echo "3.1 Testing POST /users/teacher..."
UNIQUE_EMAIL_TEACHER="teacher$(date +%s)@demo.com"
TEACHER_CREATE_RESPONSE=$(api_call "POST" "/users/teacher" "$ADMIN_TOKEN" \
    "{\"email\":\"$UNIQUE_EMAIL_TEACHER\",\"name\":\"Test Teacher 2\",\"schoolId\":\"$SCHOOL_ID\"}" 201)
if command -v jq &> /dev/null && echo "$TEACHER_CREATE_RESPONSE" | jq empty 2>/dev/null; then
    NEW_TEACHER_ID=$(echo "$TEACHER_CREATE_RESPONSE" | jq -r '.id // empty')
else
    NEW_TEACHER_ID=$(extract_field "$TEACHER_CREATE_RESPONSE" "id")
fi

# 3.2 Create parent (use unique email)
echo "3.2 Testing POST /users/parent..."
UNIQUE_EMAIL_PARENT="parent$(date +%s)@demo.com"
PARENT_CREATE_RESPONSE=$(api_call "POST" "/users/parent" "$ADMIN_TOKEN" \
    "{\"email\":\"$UNIQUE_EMAIL_PARENT\",\"name\":\"Test Parent 3\",\"schoolId\":\"$SCHOOL_ID\"}" 201)

# 3.3 Get all users
echo "3.3 Testing GET /users..."
api_call "GET" "/users" "$ADMIN_TOKEN" "" 200 > /dev/null

# 3.4 Get users filtered by role
echo "3.4 Testing GET /users?role=TEACHER..."
api_call "GET" "/users?role=TEACHER" "$ADMIN_TOKEN" "" 200 > /dev/null

# 3.5 Get user by ID
echo "3.5 Testing GET /users/:id..."
if [ -n "$TEACHER_ID" ] && [ "$TEACHER_ID" != "null" ]; then
    api_call "GET" "/users/$TEACHER_ID" "$ADMIN_TOKEN" "" 200 > /dev/null
else
    log_test "GET /users/:id" "SKIP" "N/A" "200" "Teacher ID not available" "0"
fi

# 3.6 Update user
echo "3.6 Testing PATCH /users/:id..."
if [ -n "$TEACHER_ID" ] && [ "$TEACHER_ID" != "null" ]; then
    api_call "PATCH" "/users/$TEACHER_ID" "$ADMIN_TOKEN" \
        '{"name":"Updated Teacher Name"}' 200 > /dev/null
else
    log_test "PATCH /users/:id" "SKIP" "N/A" "200" "Teacher ID not available" "0"
fi

# 3.7 Test duplicate email
echo "3.7 Testing POST /users/teacher (Duplicate email)..."
api_call "POST" "/users/teacher" "$ADMIN_TOKEN" \
    "{\"email\":\"teacher@demo.com\",\"name\":\"Duplicate\",\"schoolId\":\"$SCHOOL_ID\"}" 409 > /dev/null

# 3.8 Test non-admin access
echo "3.8 Testing GET /users (Non-admin)..."
api_call "GET" "/users" "$TEACHER_TOKEN" "" 403 > /dev/null

echo ""
echo "✅ Phase 3 Complete"
echo ""

# ==========================================
# PHASE 4: Student Management
# ==========================================
echo "📋 PHASE 4: Student Management"
echo "-----------------------------------"

# 4.1 Create student
echo "4.1 Testing POST /students..."
UNIQUE_ADMISSION="TEST$(date +%s)"
STUDENT_CREATE_RESPONSE=$(api_call "POST" "/students" "$ADMIN_TOKEN" \
    "{\"admissionNo\":\"$UNIQUE_ADMISSION\",\"name\":\"Test Student\",\"class\":\"10\",\"section\":\"A\",\"schoolId\":\"$SCHOOL_ID\"}" 201)
if command -v jq &> /dev/null && echo "$STUDENT_CREATE_RESPONSE" | jq empty 2>/dev/null; then
    NEW_STUDENT_ID=$(echo "$STUDENT_CREATE_RESPONSE" | jq -r '.id // empty')
else
    NEW_STUDENT_ID=$(extract_field "$STUDENT_CREATE_RESPONSE" "id")
fi

# 4.2 Get all students
echo "4.2 Testing GET /students..."
api_call "GET" "/students" "$ADMIN_TOKEN" "" 200 > /dev/null

# 4.3 Get students filtered by class
echo "4.3 Testing GET /students?class=10..."
api_call "GET" "/students?class=10" "$ADMIN_TOKEN" "" 200 > /dev/null

# 4.4 Get student count
echo "4.4 Testing GET /students/count..."
api_call "GET" "/students/count" "$ADMIN_TOKEN" "" 200 > /dev/null

# 4.5 Get student by ID
echo "4.5 Testing GET /students/:id..."
if [ -n "$STUDENT_ID" ] && [ "$STUDENT_ID" != "null" ] && [ "$STUDENT_ID" != "" ]; then
    api_call "GET" "/students/$STUDENT_ID" "$ADMIN_TOKEN" "" 200 > /dev/null
else
    log_test "GET /students/:id" "SKIP" "N/A" "200" "Student ID not available" "0"
fi

# 4.6 Update student
echo "4.6 Testing PATCH /students/:id..."
if [ -n "$STUDENT_ID" ] && [ "$STUDENT_ID" != "null" ] && [ "$STUDENT_ID" != "" ]; then
    api_call "PATCH" "/students/$STUDENT_ID" "$ADMIN_TOKEN" \
        '{"name":"Updated Student Name"}' 200 > /dev/null
else
    log_test "PATCH /students/:id" "SKIP" "N/A" "200" "Student ID not available" "0"
fi

# 4.7 Test duplicate admission number
echo "4.7 Testing POST /students (Duplicate admission)..."
api_call "POST" "/students" "$ADMIN_TOKEN" \
    "{\"admissionNo\":\"TEST001\",\"name\":\"Duplicate\",\"class\":\"10\",\"section\":\"A\",\"schoolId\":\"$SCHOOL_ID\"}" 409 > /dev/null

# 4.8 Test parent access to their child
echo "4.8 Testing GET /students/:id (Parent access)..."
if [ -n "$STUDENT_ID" ] && [ "$STUDENT_ID" != "null" ] && [ "$STUDENT_ID" != "" ]; then
    api_call "GET" "/students/$STUDENT_ID" "$PARENT_TOKEN" "" 200 > /dev/null
else
    log_test "GET /students/:id (Parent)" "SKIP" "N/A" "200" "Student ID not available" "0"
fi

# 4.9 Test teacher access
echo "4.9 Testing GET /students (Teacher access)..."
api_call "GET" "/students" "$TEACHER_TOKEN" "" 200 > /dev/null

echo ""
echo "✅ Phase 4 Complete"
echo ""

# ==========================================
# PHASE 5: Attendance
# ==========================================
echo "📋 PHASE 5: Attendance"
echo "-----------------------------------"

# Calculate yesterday's date (works on both Linux and macOS)
if date -d "yesterday" +%Y-%m-%d >/dev/null 2>&1; then
    YESTERDAY=$(date -d "yesterday" +%Y-%m-%d)
elif date -v-1d +%Y-%m-%d >/dev/null 2>&1; then
    YESTERDAY=$(date -v-1d +%Y-%m-%d)
else
    # Fallback: use a date from last month
    YESTERDAY=$(date -d "30 days ago" +%Y-%m-%d 2>/dev/null || date -v-30d +%Y-%m-%d 2>/dev/null || echo "2025-10-24")
fi

# 5.1 Mark single attendance (returns 201 for creation)
echo "5.1 Testing POST /attendance/mark..."
if [ -n "$STUDENT_ID" ] && [ "$STUDENT_ID" != "null" ] && [ "$STUDENT_ID" != "" ]; then
    ATTENDANCE_RESPONSE=$(api_call "POST" "/attendance/mark" "$ADMIN_TOKEN" \
        "{\"studentId\":\"$STUDENT_ID\",\"date\":\"$YESTERDAY\",\"status\":\"PRESENT\"}" 201)
    if command -v jq &> /dev/null && echo "$ATTENDANCE_RESPONSE" | jq empty 2>/dev/null; then
        ATTENDANCE_ID=$(echo "$ATTENDANCE_RESPONSE" | jq -r '.id // empty')
    else
        ATTENDANCE_ID=$(extract_field "$ATTENDANCE_RESPONSE" "id")
    fi
else
    log_test "POST /attendance/mark" "SKIP" "N/A" "201" "Student ID not available" "0"
    ATTENDANCE_RESPONSE=""
fi

# 5.2 Bulk mark attendance (returns 201 for creation)
echo "5.2 Testing POST /attendance/bulk..."
if [ -n "$STUDENT_ID" ] && [ "$STUDENT_ID" != "null" ] && [ "$STUDENT_ID" != "" ]; then
    api_call "POST" "/attendance/bulk" "$ADMIN_TOKEN" \
        "{\"class\":\"10\",\"section\":\"A\",\"date\":\"$YESTERDAY\",\"records\":[{\"studentId\":\"$STUDENT_ID\",\"status\":\"ABSENT\"}]}" 201 > /dev/null
else
    log_test "POST /attendance/bulk" "SKIP" "N/A" "201" "Student ID not available" "0"
fi

# 5.3 Get student attendance history
echo "5.3 Testing GET /attendance/student/:studentId..."
if [ -n "$STUDENT_ID" ] && [ "$STUDENT_ID" != "null" ] && [ "$STUDENT_ID" != "" ]; then
    CURRENT_MONTH=$(date +%Y-%m)
    api_call "GET" "/attendance/student/$STUDENT_ID?month=$CURRENT_MONTH" "$ADMIN_TOKEN" "" 200 > /dev/null
else
    log_test "GET /attendance/student/:studentId" "SKIP" "N/A" "200" "Student ID not available" "0"
fi

# 5.4 Get class attendance
echo "5.4 Testing GET /attendance/class/:class/:section..."
api_call "GET" "/attendance/class/10/A?date=$YESTERDAY" "$ADMIN_TOKEN" "" 200 > /dev/null

# 5.5 Update attendance
echo "5.5 Testing PATCH /attendance/:id..."
if [ -n "$ATTENDANCE_ID" ] && [ "$ATTENDANCE_ID" != "null" ]; then
    api_call "PATCH" "/attendance/$ATTENDANCE_ID" "$ADMIN_TOKEN" \
        '{"status":"LATE"}' 200 > /dev/null
else
    log_test "PATCH /attendance/:id" "SKIP" "N/A" "200" "Attendance ID not available" "0"
fi

# 5.6 Get daily report
echo "5.6 Testing GET /attendance/report/daily..."
api_call "GET" "/attendance/report/daily?date=$YESTERDAY" "$ADMIN_TOKEN" "" 200 > /dev/null

# 5.7 Get monthly report
echo "5.7 Testing GET /attendance/report/monthly..."
api_call "GET" "/attendance/report/monthly?month=2025-11" "$ADMIN_TOKEN" "" 200 > /dev/null

# 5.8 Get defaulters
echo "5.8 Testing GET /attendance/report/defaulters..."
api_call "GET" "/attendance/report/defaulters?threshold=75" "$ADMIN_TOKEN" "" 200 > /dev/null

# 5.9 Test future date rejection
echo "5.9 Testing POST /attendance/mark (Future date)..."
if [ -n "$STUDENT_ID" ] && [ "$STUDENT_ID" != "null" ] && [ "$STUDENT_ID" != "" ]; then
    FUTURE_DATE=$(date -d "+1 day" +%Y-%m-%d 2>/dev/null || date -v+1d +%Y-%m-%d 2>/dev/null || echo "2026-12-31")
    api_call "POST" "/attendance/mark" "$ADMIN_TOKEN" \
        "{\"studentId\":\"$STUDENT_ID\",\"date\":\"$FUTURE_DATE\",\"status\":\"PRESENT\"}" 400 > /dev/null
else
    log_test "POST /attendance/mark (Future date)" "SKIP" "N/A" "400" "Student ID not available" "0"
fi

# 5.10 Test parent access to child attendance
echo "5.10 Testing GET /attendance/student/:studentId (Parent)..."
if [ -n "$STUDENT_ID" ] && [ "$STUDENT_ID" != "null" ] && [ "$STUDENT_ID" != "" ]; then
    api_call "GET" "/attendance/student/$STUDENT_ID" "$PARENT_TOKEN" "" 200 > /dev/null
else
    log_test "GET /attendance/student/:studentId (Parent)" "SKIP" "N/A" "200" "Student ID not available" "0"
fi

echo ""
echo "✅ Phase 5 Complete"
echo ""

# ==========================================
# PHASE 6: Fee Management
# ==========================================
echo "📋 PHASE 6: Fee Management"
echo "-----------------------------------"

# 6.1 Get fee structure
echo "6.1 Testing GET /fees/structure/:schoolId..."
FEE_STRUCTURE_RESPONSE=$(api_call "GET" "/fees/structure/$SCHOOL_ID" "$ADMIN_TOKEN" "" 200)
FEE_STRUCTURE_ID=$(extract_field "$FEE_STRUCTURE_RESPONSE" "id")

# 6.2 Get pending fees
echo "6.2 Testing GET /fees/student/:studentId/pending..."
if [ -n "$STUDENT_ID" ] && [ "$STUDENT_ID" != "null" ] && [ "$STUDENT_ID" != "" ]; then
    api_call "GET" "/fees/student/$STUDENT_ID/pending" "$ADMIN_TOKEN" "" 200 > /dev/null
else
    log_test "GET /fees/student/:studentId/pending" "SKIP" "N/A" "200" "Student ID not available" "0"
fi

# 6.3 Create payment order
echo "6.3 Testing POST /fees/create-order..."
if [ -n "$STUDENT_ID" ] && [ "$STUDENT_ID" != "null" ] && [ "$STUDENT_ID" != "" ]; then
    PAYMENT_ORDER_RESPONSE=$(api_call "POST" "/fees/create-order" "$PARENT_TOKEN" \
        "{\"studentId\":\"$STUDENT_ID\",\"amountPaise\":50000,\"installmentNo\":1}" 201)
    if command -v jq &> /dev/null && echo "$PAYMENT_ORDER_RESPONSE" | jq empty 2>/dev/null; then
        PAYMENT_ID=$(echo "$PAYMENT_ORDER_RESPONSE" | jq -r '.id // empty')
    else
        PAYMENT_ID=$(extract_field "$PAYMENT_ORDER_RESPONSE" "id")
    fi
else
    log_test "POST /fees/create-order" "SKIP" "N/A" "201" "Student ID not available" "0"
fi

# 6.4 List payments
echo "6.4 Testing GET /fees/payments..."
api_call "GET" "/fees/payments" "$ADMIN_TOKEN" "" 200 > /dev/null

# 6.5 Test parent access to pending fees
echo "6.5 Testing GET /fees/student/:studentId/pending (Parent)..."
if [ -n "$STUDENT_ID" ] && [ "$STUDENT_ID" != "null" ] && [ "$STUDENT_ID" != "" ]; then
    api_call "GET" "/fees/student/$STUDENT_ID/pending" "$PARENT_TOKEN" "" 200 > /dev/null
else
    log_test "GET /fees/student/:studentId/pending (Parent)" "SKIP" "N/A" "200" "Student ID not available" "0"
fi

# 6.6 Test non-parent access to create order
echo "6.6 Testing POST /fees/create-order (Non-parent)..."
if [ -n "$STUDENT_ID" ] && [ "$STUDENT_ID" != "null" ] && [ "$STUDENT_ID" != "" ]; then
    api_call "POST" "/fees/create-order" "$TEACHER_TOKEN" \
        "{\"studentId\":\"$STUDENT_ID\",\"amountPaise\":50000,\"installmentNo\":1}" 403 > /dev/null
else
    log_test "POST /fees/create-order (Non-parent)" "SKIP" "N/A" "403" "Student ID not available" "0"
fi

echo ""
echo "✅ Phase 6 Complete"
echo ""

# ==========================================
# PHASE 7: Homework
# ==========================================
echo "📋 PHASE 7: Homework"
echo "-----------------------------------"

# 7.1 Create homework
echo "7.1 Testing POST /homework..."
HOMEWORK_RESPONSE=$(api_call "POST" "/homework" "$TEACHER_TOKEN" \
    "{\"class\":\"10\",\"section\":\"A\",\"subject\":\"Mathematics\",\"description\":\"Complete exercise 5.1\"}" 201)
HOMEWORK_ID=$(extract_field "$HOMEWORK_RESPONSE" "id")

# 7.2 Get homework by class
echo "7.2 Testing GET /homework/class/:class/:section..."
api_call "GET" "/homework/class/10/A" "$TEACHER_TOKEN" "" 200 > /dev/null

# 7.3 Get homework by student
echo "7.3 Testing GET /homework/student/:studentId..."
if [ -n "$STUDENT_ID" ] && [ "$STUDENT_ID" != "null" ] && [ "$STUDENT_ID" != "" ]; then
    api_call "GET" "/homework/student/$STUDENT_ID" "$PARENT_TOKEN" "" 200 > /dev/null
else
    log_test "GET /homework/student/:studentId" "SKIP" "N/A" "200" "Student ID not available" "0"
fi

# 7.4 Delete homework
echo "7.4 Testing DELETE /homework/:id..."
if [ -n "$HOMEWORK_ID" ] && [ "$HOMEWORK_ID" != "null" ]; then
    api_call "DELETE" "/homework/$HOMEWORK_ID" "$TEACHER_TOKEN" "" 200 > /dev/null
else
    log_test "DELETE /homework/:id" "SKIP" "N/A" "200" "Homework ID not available" "0"
fi

# 7.5 Test non-teacher access
echo "7.5 Testing POST /homework (Non-teacher)..."
api_call "POST" "/homework" "$PARENT_TOKEN" \
    "{\"class\":\"10\",\"section\":\"A\",\"subject\":\"Math\",\"description\":\"Test\"}" 403 > /dev/null

echo ""
echo "✅ Phase 7 Complete"
echo ""

# ==========================================
# PHASE 8: Notices
# ==========================================
echo "📋 PHASE 8: Notices"
echo "-----------------------------------"

# 8.1 Create notice
echo "8.1 Testing POST /notices..."
NOTICE_RESPONSE=$(api_call "POST" "/notices" "$ADMIN_TOKEN" \
    "{\"title\":\"Test Notice\",\"description\":\"This is a test notice\"}" 201)
NOTICE_ID=$(extract_field "$NOTICE_RESPONSE" "id")

# 8.2 Get all notices
echo "8.2 Testing GET /notices..."
api_call "GET" "/notices" "$ADMIN_TOKEN" "" 200 > /dev/null

# 8.3 Get notice by ID
echo "8.3 Testing GET /notices/:id..."
if [ -n "$NOTICE_ID" ] && [ "$NOTICE_ID" != "null" ]; then
    api_call "GET" "/notices/$NOTICE_ID" "$ADMIN_TOKEN" "" 200 > /dev/null
else
    log_test "GET /notices/:id" "SKIP" "N/A" "200" "Notice ID not available" "0"
fi

# 8.4 Delete notice
echo "8.4 Testing DELETE /notices/:id..."
if [ -n "$NOTICE_ID" ] && [ "$NOTICE_ID" != "null" ]; then
    api_call "DELETE" "/notices/$NOTICE_ID" "$ADMIN_TOKEN" "" 200 > /dev/null
else
    log_test "DELETE /notices/:id" "SKIP" "N/A" "200" "Notice ID not available" "0"
fi

# 8.5 Test non-admin access to create
echo "8.5 Testing POST /notices (Non-admin)..."
api_call "POST" "/notices" "$TEACHER_TOKEN" \
    "{\"title\":\"Unauthorized\",\"description\":\"Test\"}" 403 > /dev/null

# 8.6 Test parent access to view
echo "8.6 Testing GET /notices (Parent)..."
api_call "GET" "/notices" "$PARENT_TOKEN" "" 200 > /dev/null

echo ""
echo "✅ Phase 8 Complete"
echo ""

# ==========================================
# PHASE 9: Notifications
# ==========================================
echo "📋 PHASE 9: Notifications"
echo "-----------------------------------"

# 9.1 Get notifications
echo "9.1 Testing GET /notifications..."
NOTIFICATIONS_RESPONSE=$(api_call "GET" "/notifications" "$PARENT_TOKEN" "" 200)
if command -v jq &> /dev/null; then
    NOTIFICATION_ID=$(echo "$NOTIFICATIONS_RESPONSE" | jq -r 'if .data then .data[0].id elif type == "array" then .[0].id else empty end' 2>/dev/null | head -1)
else
    NOTIFICATION_ID=$(echo "$NOTIFICATIONS_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
fi

# 9.2 Get unread count
echo "9.2 Testing GET /notifications/unread-count..."
api_call "GET" "/notifications/unread-count" "$PARENT_TOKEN" "" 200 > /dev/null

# 9.3 Mark notification as read
if [ -n "$NOTIFICATION_ID" ]; then
    echo "9.3 Testing PATCH /notifications/:id/read..."
    api_call "PATCH" "/notifications/$NOTIFICATION_ID/read" "$PARENT_TOKEN" "" 200 > /dev/null
else
    log_test "PATCH /notifications/:id/read" "SKIP" "N/A" "200" "No notifications found" "0"
fi

# 9.4 Mark all as read
echo "9.4 Testing PATCH /notifications/read-all..."
api_call "PATCH" "/notifications/read-all" "$PARENT_TOKEN" "" 200 > /dev/null

echo ""
echo "✅ Phase 9 Complete"
echo ""

# ==========================================
# PHASE 10: Reports
# ==========================================
echo "📋 PHASE 10: Reports"
echo "-----------------------------------"

# 10.1 Fee collection report
echo "10.1 Testing GET /reports/fees/collection..."
api_call "GET" "/reports/fees/collection" "$ADMIN_TOKEN" "" 200 > /dev/null

# 10.2 Outstanding fees report
echo "10.2 Testing GET /reports/fees/outstanding..."
api_call "GET" "/reports/fees/outstanding" "$ADMIN_TOKEN" "" 200 > /dev/null

# 10.3 Fee defaulters report
echo "10.3 Testing GET /reports/fees/defaulters..."
api_call "GET" "/reports/fees/defaulters" "$ADMIN_TOKEN" "" 200 > /dev/null

# 10.4 Daily attendance report
echo "10.4 Testing GET /reports/attendance/daily..."
api_call "GET" "/reports/attendance/daily?date=$YESTERDAY" "$ADMIN_TOKEN" "" 200 > /dev/null

# 10.5 Monthly attendance report
echo "10.5 Testing GET /reports/attendance/monthly..."
api_call "GET" "/reports/attendance/monthly?month=2025-11" "$ADMIN_TOKEN" "" 200 > /dev/null

# 10.6 Attendance defaulters report
echo "10.6 Testing GET /reports/attendance/defaulters..."
api_call "GET" "/reports/attendance/defaulters" "$ADMIN_TOKEN" "" 200 > /dev/null

# 10.7 Test non-admin access
echo "10.7 Testing GET /reports/fees/collection (Non-admin)..."
api_call "GET" "/reports/fees/collection" "$TEACHER_TOKEN" "" 403 > /dev/null

echo ""
echo "✅ Phase 10 Complete"
echo ""

# ==========================================
# Generate Summary
# ==========================================
jq ".summary = {total: $TOTAL_TESTS, passed: $PASSED_TESTS, failed: $FAILED_TESTS, skipped: $SKIPPED_TESTS}" "$RESULTS_FILE" > "$RESULTS_FILE.tmp" && mv "$RESULTS_FILE.tmp" "$RESULTS_FILE"

echo "=========================================="
echo "  Test Summary"
echo "=========================================="
echo "Total Tests:  $TOTAL_TESTS"
echo -e "${GREEN}Passed:       $PASSED_TESTS${NC}"
echo -e "${RED}Failed:       $FAILED_TESTS${NC}"
echo -e "${YELLOW}Skipped:      $SKIPPED_TESTS${NC}"
echo ""
echo "Success Rate: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%"
echo ""
echo "Results saved to: $RESULTS_FILE"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Check results file for details.${NC}"
    exit 1
fi

