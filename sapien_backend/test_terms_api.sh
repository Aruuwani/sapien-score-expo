#!/bin/bash

# Test Terms & Conditions API

echo "=========================================="
echo "Testing Terms & Conditions API"
echo "=========================================="
echo ""

# Test GET Terms (should return 404 if not seeded yet)
echo "1. Testing GET /node/api/terms/terms"
echo "-------------------------------------------"
curl -s http://localhost:5000/node/api/terms/terms | json_pp
echo ""
echo ""

# Test GET Privacy (should return 404 if not seeded yet)
echo "2. Testing GET /node/api/terms/privacy"
echo "-------------------------------------------"
curl -s http://localhost:5000/node/api/terms/privacy | json_pp
echo ""
echo ""

echo "=========================================="
echo "If you see 404 errors above, run:"
echo "  node seedTermsConditions.js"
echo "=========================================="

