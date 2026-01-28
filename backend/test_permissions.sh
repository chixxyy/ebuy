#!/bin/bash
nohup npm start > server.log 2>&1 &
PID=$!
echo "Server PID: $PID"
sleep 5

echo "1. Registering User..." > permission_test.log
REGISTER_RES=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "tester@example.com", "password": "password", "name": "Tester"}')
echo "$REGISTER_RES" >> permission_test.log

echo "\n2. Logging in..." >> permission_test.log
LOGIN_RES=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "tester@example.com", "password": "password"}')
TOKEN=$(echo $LOGIN_RES | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN" >> permission_test.log

echo "\n3. Testing Unauthenticated Create Product (Should Fail)..." >> permission_test.log
curl -v -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Fail Product", "description": "Should verify auth", "price": 100, "image": "img.png", "category": "Test"}' >> permission_test.log 2>&1

echo "\n4. Testing Authenticated Create Product (Should Succeed)..." >> permission_test.log
curl -v -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Success Product", "description": "Auth works", "price": 100, "image": "img.png", "category": "Test"}' >> permission_test.log 2>&1

echo "\n5. Testing Public Read Products (Should Succeed)..." >> permission_test.log
curl -v -X GET http://localhost:3000/api/products >> permission_test.log 2>&1

kill $PID
