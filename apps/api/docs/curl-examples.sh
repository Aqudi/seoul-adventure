#!/usr/bin/env bash
# Seoul Advanture API 테스트용 curl 예시
# 사용법: ./curl-examples.sh [BASE_URL]
# 기본 BASE_URL: http://localhost:3001
# jq가 있으면 JSON을 보기 좋게 출력하고, 없으면 그대로 출력합니다.

BASE_URL="${1:-http://localhost:3001}"
if command -v jq &>/dev/null; then
  JQ="jq ."
else
  JQ="cat"
fi

echo "=== 1. GET /health ==="
curl -s -X GET "$BASE_URL/health" | $JQ

echo ""
echo "=== 2. GET /db ==="
curl -s -X GET "$BASE_URL/db" | $JQ

echo ""
echo "=== 3. POST /users/register (새 사용자 등록) ==="
curl -s -X POST "$BASE_URL/users/register" \
  -H "Content-Type: application/json" \
  -d '{"nickname":"testuser","password":"testpass"}' | $JQ

echo ""
echo "=== 4. POST /users/register (동일 정보 → 기존 사용자 반환) ==="
curl -s -X POST "$BASE_URL/users/register" \
  -H "Content-Type: application/json" \
  -d '{"nickname":"testuser","password":"testpass"}' | $JQ

echo ""
echo "=== 5. POST /users/register (닉네임 중복 + 잘못된 비밀번호) ==="
curl -s -X POST "$BASE_URL/users/register" \
  -H "Content-Type: application/json" \
  -d '{"nickname":"testuser","password":"wrong"}' | $JQ

echo ""
echo "=== 6. POST /users/register (nickname 누락) ==="
curl -s -X POST "$BASE_URL/users/register" \
  -H "Content-Type: application/json" \
  -d '{"password":"mypassword"}' | $JQ

echo ""
echo "=== 7. POST /users/register (password 누락) ==="
curl -s -X POST "$BASE_URL/users/register" \
  -H "Content-Type: application/json" \
  -d '{"nickname":"player1"}' | $JQ
