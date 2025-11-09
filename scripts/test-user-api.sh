#!/bin/bash

# 🧪 User Management API Test Script
# Test the /api/users/create and /api/users/invite endpoints

# Configuration
PROD_URL="https://beauty-with-ai-precision.vercel.app"
# Replace with your actual token after login
SUPER_ADMIN_TOKEN="your_super_admin_jwt_token_here"
CLINIC_OWNER_TOKEN="your_clinic_owner_jwt_token_here"

echo "🧪 Testing User Management API"
echo "================================"
echo ""

# Test 1: Super Admin creates Clinic Owner
echo "Test 1: Super Admin creates Clinic Owner"
echo "----------------------------------------"
curl -X POST "${PROD_URL}/api/users/create" \
  -H "Authorization: Bearer ${SUPER_ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testowner@clinic3.com",
    "role": "clinic_owner",
    "full_name": "Test Clinic Owner",
    "clinic_id": "clinic-003"
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.'

echo ""
read -p "📋 Copy user_id and temp_password from above, then press Enter..."
echo ""

# Test 2: Send invitation email
echo "Test 2: Send invitation email"
echo "------------------------------"
read -p "Enter user_id from Test 1: " USER_ID
read -p "Enter temp_password from Test 1: " TEMP_PASSWORD

curl -X POST "${PROD_URL}/api/users/invite" \
  -H "Authorization: Bearer ${SUPER_ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"${USER_ID}\",
    \"email\": \"testowner@clinic3.com\",
    \"temp_password\": \"${TEMP_PASSWORD}\"
  }" \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.debug'

echo ""
echo ""

# Test 3: Clinic Owner creates Sales Staff
echo "Test 3: Clinic Owner creates Sales Staff"
echo "-----------------------------------------"
curl -X POST "${PROD_URL}/api/users/create" \
  -H "Authorization: Bearer ${CLINIC_OWNER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testsales@clinic1.com",
    "role": "sales_staff",
    "full_name": "Test Sales Staff"
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.'

echo ""
echo ""

# Test 4: Negative test - Sales Staff tries to create user (should fail)
echo "Test 4: Negative test - Unauthorized role"
echo "------------------------------------------"
SALES_TOKEN="your_sales_staff_jwt_token_here"
curl -X POST "${PROD_URL}/api/users/create" \
  -H "Authorization: Bearer ${SALES_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "shouldfail@test.com",
    "role": "customer",
    "full_name": "Should Fail"
  }' \
  -w "\nStatus: %{http_code} (Expected: 403)\n" \
  -s | jq '.'

echo ""
echo "✅ Test completed!"
