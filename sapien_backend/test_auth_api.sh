#!/bin/bash

# SapienScore Authentication API Test Script
# This script tests the new authentication endpoints

BASE_URL="http://localhost:5000/node/api/auth"

echo "=================================="
echo "SapienScore Auth API Test Script"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Register a new user
echo -e "${YELLOW}Test 1: Register New User${NC}"
echo "POST $BASE_URL/register"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "phone_number": "+1234567890",
    "password": "TestPassword123!",
    "agreedTerms": true
  }')

echo "$REGISTER_RESPONSE" | jq '.'
echo ""

# Extract token from registration
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token // empty')

if [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✓ Registration successful${NC}"
else
  echo -e "${RED}✗ Registration failed${NC}"
fi
echo ""
echo "=================================="
echo ""

# Test 2: Login with email
echo -e "${YELLOW}Test 2: Login with Email${NC}"
echo "POST $BASE_URL/login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "testuser@example.com",
    "password": "TestPassword123!"
  }')

echo "$LOGIN_RESPONSE" | jq '.'
echo ""

LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty')

if [ -n "$LOGIN_TOKEN" ]; then
  echo -e "${GREEN}✓ Login successful${NC}"
  TOKEN="$LOGIN_TOKEN"
else
  echo -e "${RED}✗ Login failed${NC}"
fi
echo ""
echo "=================================="
echo ""

# Test 3: Login with phone number
echo -e "${YELLOW}Test 3: Login with Phone Number${NC}"
echo "POST $BASE_URL/login"
PHONE_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "+1234567890",
    "password": "TestPassword123!"
  }')

echo "$PHONE_LOGIN_RESPONSE" | jq '.'
echo ""

PHONE_TOKEN=$(echo "$PHONE_LOGIN_RESPONSE" | jq -r '.token // empty')

if [ -n "$PHONE_TOKEN" ]; then
  echo -e "${GREEN}✓ Phone login successful${NC}"
else
  echo -e "${RED}✗ Phone login failed${NC}"
fi
echo ""
echo "=================================="
echo ""

# Test 4: Forgot Password - Request Reset
echo -e "${YELLOW}Test 4: Forgot Password - Request Reset${NC}"
echo "POST $BASE_URL/forgot-password"
FORGOT_RESPONSE=$(curl -s -X POST "$BASE_URL/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com"
  }')

echo "$FORGOT_RESPONSE" | jq '.'
echo ""

if echo "$FORGOT_RESPONSE" | jq -e '.message' > /dev/null; then
  echo -e "${GREEN}✓ Password reset email sent${NC}"
  echo -e "${YELLOW}Check your email for the 6-digit verification code${NC}"
else
  echo -e "${RED}✗ Password reset request failed${NC}"
fi
echo ""
echo "=================================="
echo ""

# Test 5: Test with invalid credentials
echo -e "${YELLOW}Test 5: Login with Invalid Password${NC}"
echo "POST $BASE_URL/login"
INVALID_LOGIN=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "testuser@example.com",
    "password": "WrongPassword123!"
  }')

echo "$INVALID_LOGIN" | jq '.'
echo ""

if echo "$INVALID_LOGIN" | jq -e '.error' > /dev/null; then
  echo -e "${GREEN}✓ Invalid credentials properly rejected${NC}"
else
  echo -e "${RED}✗ Security issue: Invalid credentials accepted${NC}"
fi
echo ""
echo "=================================="
echo ""

# Test 6: Test deprecated endpoint
echo -e "${YELLOW}Test 6: Test Deprecated Endpoint${NC}"
echo "POST http://localhost:5000/node/api/users/create"
DEPRECATED_RESPONSE=$(curl -s -X POST "http://localhost:5000/node/api/users/create" \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+9876543210"
  }')

echo "$DEPRECATED_RESPONSE" | jq '.'
echo ""

if echo "$DEPRECATED_RESPONSE" | jq -e '.error' | grep -q "deprecated"; then
  echo -e "${GREEN}✓ Deprecated endpoint returns proper error${NC}"
else
  echo -e "${RED}✗ Deprecated endpoint not properly disabled${NC}"
fi
echo ""
echo "=================================="
echo ""

# Test 7: Test registration without required fields
echo -e "${YELLOW}Test 7: Registration Without Required Fields${NC}"
echo "POST $BASE_URL/register"
INVALID_REG=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "incomplete@example.com"
  }')

echo "$INVALID_REG" | jq '.'
echo ""

if echo "$INVALID_REG" | jq -e '.error' > /dev/null; then
  echo -e "${GREEN}✓ Validation working correctly${NC}"
else
  echo -e "${RED}✗ Validation not working${NC}"
fi
echo ""
echo "=================================="
echo ""

# Summary
echo -e "${YELLOW}Test Summary${NC}"
echo "All tests completed!"
echo ""
echo "Your JWT Token (save this for authenticated requests):"
echo -e "${GREEN}$TOKEN${NC}"
echo ""
echo "Use this token in your requests:"
echo "  Authorization: Bearer $TOKEN"
echo "  or"
echo "  x-access-token: $TOKEN"
echo ""
echo "=================================="

