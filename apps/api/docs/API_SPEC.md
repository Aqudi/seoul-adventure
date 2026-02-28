# Seoul Advanture API 명세

- **Base URL**: `http://localhost:3001`
- **Content-Type**: `application/json`

---

## 1. 헬스 체크

서버 동작 여부를 확인합니다.

| 항목         | 내용      |
| ------------ | --------- |
| **Method**   | `GET`     |
| **Path**     | `/health` |
| **Response** | `200 OK`  |

### 응답 예시

```json
{
  "status": "ok",
  "message": "Seoul Advanture API is running"
}
```

### curl

```bash
curl -s -X GET http://localhost:3001/health
```

---

## 2. DB 연결 상태

PostgreSQL 연결 상태를 확인합니다.

| 항목         | 내용                                                         |
| ------------ | ------------------------------------------------------------ |
| **Method**   | `GET`                                                        |
| **Path**     | `/db`                                                        |
| **Response** | `200 OK` (연결됨) / `503 Service Unavailable` (ORM 미초기화) |

### 응답 예시 (연결됨)

```json
{
  "status": "ok",
  "database": "connected"
}
```

### 응답 예시 (연결 끊김)

```json
{
  "status": "ok",
  "database": "disconnected"
}
```

### 응답 예시 (503)

```json
{
  "status": "error",
  "message": "Database not initialized"
}
```

### curl

```bash
curl -s -X GET http://localhost:3001/db
```

---

## 3. 사용자 등록 / 로그인

닉네임과 비밀번호로 사용자를 등록하거나, 이미 있는 사용자면 비밀번호가 일치할 때 기존 정보를 반환합니다.

| 항목             | 내용               |
| ---------------- | ------------------ |
| **Method**       | `POST`             |
| **Path**         | `/users/register`  |
| **Content-Type** | `application/json` |

### Request Body

| 필드       | 타입   | 필수 | 설명                         |
| ---------- | ------ | ---- | ---------------------------- |
| `nickname` | string | O    | 공백 제거 후 사용, 중복 불가 |
| `password` | string | O    | bcrypt 해시 후 저장          |

### 동작

- **닉네임 + 비밀번호가 기존 사용자와 일치** → `200 OK` + 기존 사용자 정보
- **닉네임 없음** → 새 사용자 생성 후 `201 Created` + 생성된 사용자 정보
- **닉네임은 있으나 비밀번호 불일치** → `400 Bad Request`

### 응답 (200 / 201 공통 구조)

`user`에는 비밀번호가 포함되지 않습니다. **로그인 성공 시** 응답 헤더에 로그인 상태용 쿠키가 담깁니다.

**Set-Cookie (로그인 상태)**

| 항목          | 설명                                                                                 |
| ------------- | ------------------------------------------------------------------------------------ |
| **쿠키 이름** | 환경 변수 `COOKIE_SESSION_NAME` (기본값: `x_sa_t`, 유추하기 어려운 값으로 변경 권장) |
| **쿠키 값**   | JWT (서명된 토큰, `JWT_SECRET`으로 서명, 유추 불가)                                  |
| **옵션**      | `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=604800`(7일)                          |

```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "nickname": "닉네임",
    "createdAt": "2025-02-28T00:00:00.000Z",
    "updatedAt": "2025-02-28T00:00:00.000Z"
  },
  "message": "기존 사용자 정보를 반환합니다."
}
```

또는

```json
{
  "success": true,
  "user": { ... },
  "message": "새 사용자가 등록되었습니다."
}
```

### 에러 응답 (400)

- nickname 누락/빈 문자열

```json
{
  "success": false,
  "error": "nickname is required and must be a non-empty string"
}
```

- password 누락

```json
{
  "success": false,
  "error": "password is required"
}
```

- 닉네임 중복 + 비밀번호 불일치

```json
{
  "success": false,
  "error": "이미 사용 중인 닉네임입니다. 비밀번호가 일치하지 않습니다."
}
```

### curl

**새 사용자 등록 (201) — 응답 헤더에 Set-Cookie 포함**

```bash
curl -s -i -X POST http://localhost:3001/users/register \
  -H "Content-Type: application/json" \
  -d '{"nickname":"player1","password":"mypassword123"}'
```

**동일 닉네임 + 동일 비밀번호 → 기존 사용자 반환 (200)**

```bash
curl -s -X POST http://localhost:3001/users/register \
  -H "Content-Type: application/json" \
  -d '{"nickname":"player1","password":"mypassword123"}'
```

**닉네임 중복 + 비밀번호 불일치 (400)**

```bash
curl -s -X POST http://localhost:3001/users/register \
  -H "Content-Type: application/json" \
  -d '{"nickname":"player1","password":"wrongpassword"}'
```

**nickname 누락 (400)**

```bash
curl -s -X POST http://localhost:3001/users/register \
  -H "Content-Type: application/json" \
  -d '{"password":"mypassword123"}'
```

**password 누락 (400)**

```bash
curl -s -X POST http://localhost:3001/users/register \
  -H "Content-Type: application/json" \
  -d '{"nickname":"player1"}'
```

---

## 전체 테스트용 curl (한 번에 실행)

서버가 `http://localhost:3001`에서 떠 있다고 가정합니다.

```bash
# 1. 헬스 체크
curl -s -X GET http://localhost:3001/health

# 2. DB 연결 상태
curl -s -X GET http://localhost:3001/db

# 3. 사용자 등록 (최초 → 201, Set-Cookie로 로그인 쿠키 확인)
curl -s -i -X POST http://localhost:3001/users/register \
  -H "Content-Type: application/json" \
  -d '{"nickname":"testuser","password":"testpass"}'

# 4. 동일 정보로 다시 요청 (기존 사용자 반환 → 200)
curl -s -X POST http://localhost:3001/users/register \
  -H "Content-Type: application/json" \
  -d '{"nickname":"testuser","password":"testpass"}'

# 5. 닉네임 중복 + 잘못된 비밀번호 (400)
curl -s -X POST http://localhost:3001/users/register \
  -H "Content-Type: application/json" \
  -d '{"nickname":"testuser","password":"wrong"}'
```
