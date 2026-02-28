# Courses API 명세

Gemini AI를 활용한 랜드마크 기반 코스 생성 및 조회 API입니다.

---

## Base URL

```
http://localhost:3001
```

---

## Endpoints 목록

| Method | Path | 설명 |
|--------|------|------|
| `GET` | `/courses` | 활성 코스 목록 조회 |
| `GET` | `/courses/:id` | 코스 상세 조회 (퀘스트 포함) |
| `POST` | `/courses/generate` | Gemini AI로 랜드마크 기반 코스 생성 |

---

## 1. 코스 목록 조회

활성화된 코스 목록을 최신 weekKey 순으로 반환합니다.

```
GET /courses
```

**Request** - 없음

**Response `200`**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "경복궁의 비밀: 사라진 옥새를 찾아라",
    "theme": "경복궁",
    "weekKey": "2026-W09",
    "estimatedDuration": 60,
    "difficulty": "MEDIUM",
    "prologue": "이보게, 자네 소문 들었나?...",
    "epilogue": "훌륭하구먼! 자네 덕분에...",
    "isActive": true,
    "createdAt": "2026-02-28T00:00:00.000Z",
    "places": []
  }
]
```

### curl

```bash
curl -s -X GET http://localhost:3001/courses
```

---

## 2. 코스 상세 조회

코스 ID로 장소 목록과 퀘스트를 포함한 전체 데이터를 조회합니다.

> `answer` 필드는 보안상 응답에서 제외됩니다.

```
GET /courses/:id
```

**Request**

| 위치 | 필드 | 타입 | 설명 |
|------|------|------|------|
| Path | `id` | string (UUID) | 코스 ID |

**Response `200`**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "경복궁의 비밀: 사라진 옥새를 찾아라",
  "theme": "경복궁",
  "weekKey": "2026-W09",
  "estimatedDuration": 60,
  "difficulty": "MEDIUM",
  "prologue": "이보게, 자네 소문 들었나?...",
  "epilogue": "훌륭하구먼! 자네 덕분에...",
  "isActive": true,
  "createdAt": "2026-02-28T00:00:00.000Z",
  "places": [],
  "quests": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "order": 1,
      "type": "PHOTO",
      "narrativeText": "가장 먼저 근정전으로 향하게나...",
      "instruction": "근정전 앞",
      "mapHint": "근정전은 조선 시대 임금이 신하들과 조회를 열던 곳입니다.",
      "gpsLatOverride": 37.5796,
      "gpsLngOverride": 126.977,
      "gpsRadiusM": null,
      "timeLimitSec": null
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440002",
      "order": 2,
      "type": "ANSWER",
      "narrativeText": "광화문 현판에 새겨진 글자를 자세히 보게나...",
      "instruction": "광화문 홍예문은 총 몇 개인가?",
      "mapHint": "광화문은 경복궁의 정문으로 1395년에 처음 건립되었습니다.",
      "gpsLatOverride": 37.5759,
      "gpsLngOverride": 126.9769,
      "gpsRadiusM": null,
      "timeLimitSec": null
    }
  ]
}
```

**Response `404`**

```json
{
  "error": "코스를 찾을 수 없습니다."
}
```

### curl

```bash
# 코스 상세 조회
curl -s -X GET http://localhost:3001/courses/550e8400-e29b-41d4-a716-446655440000

# 존재하지 않는 ID (404)
curl -s -X GET http://localhost:3001/courses/00000000-0000-0000-0000-000000000000
```

---

## 3. Gemini AI 코스 생성

랜드마크 이름을 입력하면 Gemini AI가 방탈출 코스를 생성하고 DB에 저장합니다.

```
POST /courses/generate
```

**Request**

| 위치 | 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|------|
| Body | `landmark` | string | ✅ | 코스를 생성할 랜드마크 이름 |

```json
{
  "landmark": "경복궁"
}
```

**Response `201`** - 생성된 코스 (상세 조회와 동일한 구조, `answer` 제외)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "경복궁의 비밀: 사라진 옥새를 찾아라",
  "theme": "경복궁",
  "weekKey": "2026-W09",
  "estimatedDuration": 60,
  "difficulty": "MEDIUM",
  "prologue": "이보게, 자네 소문 들었나?...",
  "epilogue": "훌륭하구먼! 자네 덕분에...",
  "isActive": true,
  "createdAt": "2026-02-28T00:00:00.000Z",
  "quests": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "order": 1,
      "type": "PHOTO",
      "narrativeText": "가장 먼저 근정전으로 향하게나...",
      "instruction": "근정전 앞",
      "mapHint": "근정전은 조선 시대 임금이 신하들과 조회를 열던 곳입니다.",
      "gpsLatOverride": 37.5796,
      "gpsLngOverride": 126.977,
      "gpsRadiusM": null,
      "timeLimitSec": null
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440002",
      "order": 2,
      "type": "ANSWER",
      "narrativeText": "광화문 현판에 새겨진 글자를 자세히 보게나...",
      "instruction": "광화문 홍예문은 총 몇 개인가?",
      "mapHint": "광화문은 경복궁의 정문으로 1395년에 처음 건립되었습니다.",
      "gpsLatOverride": 37.5759,
      "gpsLngOverride": 126.9769,
      "gpsRadiusM": null,
      "timeLimitSec": null
    }
  ]
}
```

**Response `400`** - 요청 형식 오류

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "body/landmark must NOT have fewer than 1 characters"
}
```

**Response `502`** - Gemini API 호출 실패

```json
{
  "error": "GEMINI_API_KEY environment variable is not set"
}
```

### curl

```bash
# 코스 생성
curl -s -X POST http://localhost:3001/courses/generate \
  -H "Content-Type: application/json" \
  -d '{"landmark": "경복궁"}'

# landmark 누락 (400)
curl -s -X POST http://localhost:3001/courses/generate \
  -H "Content-Type: application/json" \
  -d '{}'

# 빈 문자열 (400)
curl -s -X POST http://localhost:3001/courses/generate \
  -H "Content-Type: application/json" \
  -d '{"landmark": ""}'
```

---

## Gemini → Course/Quest 필드 매핑

Gemini AI 응답을 DB 엔티티로 변환하는 규칙입니다.

### Course

| Gemini 응답 | Course 필드 | 비고 |
|-------------|-------------|------|
| `game_title` | `title` | |
| `landmark` | `theme` | |
| `prologue` | `prologue` | |
| `epilogue` | `epilogue` | |
| _(자동 생성)_ | `weekKey` | 현재 날짜 기반 (예: `2026-W09`) |
| _(기본값)_ | `estimatedDuration` | `60` (분) |
| _(기본값)_ | `difficulty` | `MEDIUM` |

### Quest

| Gemini 응답 | Quest 필드 | 비고 |
|-------------|------------|------|
| `step` | `order` | |
| `type` (`PHOTO`) | `type` | `PHOTO` 그대로 |
| `type` (`PASSWORD`) | `type` | → `ANSWER` 으로 변환 |
| `scenario_text` | `narrativeText` | |
| `question` | `instruction` | null이면 `location_name` 사용 |
| `fact_info` | `mapHint` | |
| `answer` | `answer` | DB 저장, 응답에서 제외 |
| `latitude` | `gpsLatOverride` | |
| `longitude` | `gpsLngOverride` | |

---

## Quest 타입 상세

| 타입 | 설명 | `instruction` | `answer` |
|------|------|---------------|----------|
| `PHOTO` | 해당 장소에서 사진 촬영 인증 | 장소명 | `null` |
| `ANSWER` | 역사적 팩트 기반 정답 입력 | 질문 텍스트 | DB 저장 (응답 제외) |
| `GPS_TIME` | GPS 위치 기반 시간 미션 | 장소 안내 | `null` |

---

## Quest 객체 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string (UUID) | 퀘스트 ID |
| `order` | number | 퀘스트 순서 (1부터 시작) |
| `type` | `PHOTO` \| `ANSWER` \| `GPS_TIME` | 퀘스트 유형 |
| `narrativeText` | string | 사극 말투 내러티브 |
| `instruction` | string | 수행 안내 또는 질문 |
| `mapHint` | string | 장소 역사/사실 정보 |
| `gpsLatOverride` | number \| null | 위도 |
| `gpsLngOverride` | number \| null | 경도 |
| `gpsRadiusM` | number \| null | GPS 인증 반경 (m) |
| `timeLimitSec` | number \| null | 시간 제한 (초) |

---

## 전체 테스트용 curl

```bash
# 1. 코스 목록 조회
curl -s http://localhost:3001/courses | jq .

# 2. Gemini AI로 코스 생성 (ID를 변수로 저장)
COURSE_ID=$(curl -s -X POST http://localhost:3001/courses/generate \
  -H "Content-Type: application/json" \
  -d '{"landmark": "경복궁"}' | jq -r '.id')

echo "생성된 코스 ID: $COURSE_ID"

# 3. 생성된 코스 상세 조회
curl -s http://localhost:3001/courses/$COURSE_ID | jq .

# 4. 존재하지 않는 코스 조회 (404)
curl -s http://localhost:3001/courses/00000000-0000-0000-0000-000000000000 | jq .
```
