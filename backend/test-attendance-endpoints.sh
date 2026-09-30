#!/bin/bash

# Test script for Attendance endpoints
# Make sure backend server is running on port 3000

BASE_URL="http://localhost:3001/api"
TOKEN=""

echo "=== Testing Attendance Module Endpoints ==="
echo ""

# Step 1: Login as Admin to get token
echo "1. Logging in as Admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "admin123",
    "role": "ADMIN"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed. Please check credentials."
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Get a student ID (assuming students exist)
echo "2. Getting students list..."
STUDENTS_RESPONSE=$(curl -s -X GET "$BASE_URL/students" \
  -H "Authorization: Bearer $TOKEN")

STUDENT_ID=$(echo $STUDENTS_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$STUDENT_ID" ]; then
  echo "⚠️  No students found. Please create a student first."
  echo "Response: $STUDENTS_RESPONSE"
  exit 1
fi

echo "✅ Found student ID: $STUDENT_ID"
echo ""

# Step 3: Mark single attendance
echo "3. Testing POST /api/attendance/mark..."
TODAY=$(date +%Y-%m-%d)
MARK_RESPONSE=$(curl -s -X POST "$BASE_URL/attendance/mark" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"studentId\": \"$STUDENT_ID\",
    \"date\": \"$TODAY\",
    \"status\": \"PRESENT\"
  }")

echo "Response: $MARK_RESPONSE"
echo ""

# Step 4: Get student attendance history
echo "4. Testing GET /api/attendance/student/$STUDENT_ID..."
HISTORY_RESPONSE=$(curl -s -X GET "$BASE_URL/attendance/student/$STUDENT_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $HISTORY_RESPONSE"
echo ""

# Step 5: Get daily report
echo "5. Testing GET /api/attendance/report/daily..."
DAILY_REPORT=$(curl -s -X GET "$BASE_URL/attendance/report/daily?date=$TODAY" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $DAILY_REPORT"
echo ""

# Step 6: Get monthly report
echo "6. Testing GET /api/attendance/report/monthly..."
CURRENT_MONTH=$(date +%Y-%m)
MONTHLY_REPORT=$(curl -s -X GET "$BASE_URL/attendance/report/monthly?month=$CURRENT_MONTH" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $MONTHLY_REPORT"
echo ""

# Step 7: Get defaulters
echo "7. Testing GET /api/attendance/report/defaulters..."
DEFAULTERS=$(curl -s -X GET "$BASE_URL/attendance/report/defaulters?threshold=75" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $DEFAULTERS"
echo ""

echo "=== Testing Complete ==="

