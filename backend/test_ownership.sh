#!/bin/bash
nohup npm start > server.log 2>&1 &
PID=$!
echo "Server PID: $PID"
sleep 5

echo "1. Registering User A..." > ownership_test.log
USER_A=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "userA@example.com", "password": "password", "name": "User A"}')
echo "User A: $USER_A" >> ownership_test.log
TOKEN_A=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "userA@example.com", "password": "password"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "2. Registering User B..." >> ownership_test.log
USER_B=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "userB@example.com", "password": "password", "name": "User B"}')
echo "User B: $USER_B" >> ownership_test.log
TOKEN_B=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "userB@example.com", "password": "password"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "3. User A creates Product A..." >> ownership_test.log
PRODUCT_A=$(curl -s -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"name": "Product A", "description": "By A", "price": 100, "image": "img.png", "category": "Test"}')
echo "Product A: $PRODUCT_A" >> ownership_test.log
PRODUCT_ID_A=$(echo $PRODUCT_A | grep -o '"id":[0-9]*' | cut -d':' -f2)

echo "4. User B tries to DELETE Product A (Should Fail)..." >> ownership_test.log
curl -v -X DELETE http://localhost:3000/api/products/$PRODUCT_ID_A \
  -H "Authorization: Bearer $TOKEN_B" >> ownership_test.log 2>&1

echo "\n5. User A tries to DELETE Product A (Should Succeed)..." >> ownership_test.log
curl -v -X DELETE http://localhost:3000/api/products/$PRODUCT_ID_A \
  -H "Authorization: Bearer $TOKEN_A" >> ownership_test.log 2>&1

kill $PID
