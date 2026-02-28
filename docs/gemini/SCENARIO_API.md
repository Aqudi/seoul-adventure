# Scenario API 명세

Gemini AI를 활용한 방탈출 시나리오 생성 및 조회 API입니다.

---

## Base URL

```
http://localhost:3001
```

---

## Endpoints

### 1. 시나리오 생성

랜드마크 이름을 입력하면 Gemini AI가 방탈출 시나리오를 생성하고 DB에 저장합니다.

```
POST /scenarios/generate
```

**Request**

| 위치 | 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|------|
| Body | `landmark` | string | ✅ | 시나리오를 생성할 랜드마크 이름 |

```json
{
  "landmark": "경복궁"
}
```

**Response `201`**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "landmark": "경복궁",
  "gameTitle": "경복궁의 비밀: 사라진 옥새를 찾아라",
  "prologue": "이보게, 자네 소문 들었나?...",
  "epilogue": "훌륭하구먼! 자네 덕분에...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "quests": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "step": 1,
      "type": "PHOTO",
      "title": "근정전: 왕권의 상징",
      "locationName": "근정전 앞",
      "latitude": 37.5796,
      "longitude": 126.9770,
      "scenarioText": "가장 먼저 근정전으로 향하게나...",
      "question": null,
      "factInfo": "근정전은 조선 시대 임금이 신하들과 조회를 열던 곳입니다.",
      "successMsg": "오오! 근정전의 기운이 담겼구먼!",
      "failureMsg": "음... 건물이 잘 보이지 않네. 다시 찍어보게나."
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440002",
      "step": 2,
      "type": "PASSWORD",
      "title": "광화문: 숨겨진 숫자",
      "locationName": "광화문 현판 앞",
      "latitude": 37.5759,
      "longitude": 126.9769,
      "scenarioText": "광화문 현판에 새겨진 글자를 자세히 보게나...",
      "question": "광화문 홍예문은 총 몇 개인가?",
      "factInfo": "광화문은 경복궁의 정문으로 1395년에 처음 건립되었습니다.",
      "successMsg": "정답일세! 문이 열리는구먼!",
      "failureMsg": "허허, 틀렸네. 다시 세어보게나."
    }
  ]
}
```

> `answer` 필드는 보안상 응답에서 제외됩니다.

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

---

### 2. 시나리오 목록 조회

저장된 모든 시나리오의 요약 목록을 최신순으로 반환합니다.

```
GET /scenarios
```

**Request** - 없음

**Response `200`**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "landmark": "경복궁",
    "gameTitle": "경복궁의 비밀: 사라진 옥새를 찾아라",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "landmark": "세빛 둥둥섬",
    "gameTitle": "세빛 유람기: 사라진 삼색 구슬의 비밀",
    "createdAt": "2023-12-31T00:00:00.000Z"
  }
]
```

---

### 3. 시나리오 상세 조회

시나리오 ID로 전체 퀘스트 데이터를 조회합니다.

```
GET /scenarios/:id
```

**Request**

| 위치 | 필드 | 타입 | 설명 |
|------|------|------|------|
| Path | `id` | string (UUID) | 시나리오 ID |

**Response `200`** - `POST /scenarios/generate` 응답과 동일한 구조

**Response `404`**

```json
{
  "error": "시나리오를 찾을 수 없습니다."
}
```

---

## Quest 타입 상세

| 타입 | 설명 | `question` | `answer` |
|------|------|------|------|
| `PHOTO` | 해당 장소에서 사진 촬영 인증 | `null` | `null` |
| `PASSWORD` | 역사적 팩트 기반 비밀번호 입력 | 질문 텍스트 | (응답 제외) |

---

## Quest 객체 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string (UUID) | 퀘스트 ID |
| `step` | number (1~4) | 퀘스트 순서 |
| `type` | `PHOTO` \| `PASSWORD` | 퀘스트 유형 |
| `title` | string | 퀘스트 제목 |
| `locationName` | string | 장소명 |
| `latitude` | number | 위도 |
| `longitude` | number | 경도 |
| `scenarioText` | string | 사극 말투 내러티브 |
| `question` | string \| null | PASSWORD 퀘스트 질문 |
| `factInfo` | string | 장소 역사/사실 정보 |
| `successMsg` | string | 성공 시 메시지 |
| `failureMsg` | string | 실패 시 메시지 |

---

## curl 예시

```bash
# 시나리오 생성
curl -X POST http://localhost:3001/scenarios/generate \
  -H "Content-Type: application/json" \
  -d '{"landmark": "경복궁"}'

# 전체 목록 조회
curl http://localhost:3001/scenarios

# 상세 조회
curl http://localhost:3001/scenarios/550e8400-e29b-41d4-a716-446655440000
```
