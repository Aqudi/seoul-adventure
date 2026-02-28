# 시나리오 생성 API 개발 문서

## 개요

Gemini API를 활용하여 랜드마크 기반의 방탈출 게임 시나리오를 자동 생성하고, 생성된 시나리오를 데이터베이스에 저장 및 조회하는 API입니다.

---

## DB 설계

### Scenario 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 기본 키 |
| landmark | VARCHAR | 랜드마크 이름 |
| game_title | VARCHAR | 게임 제목 |
| prologue | TEXT | 시나리오 프롤로그 |
| epilogue | TEXT | 시나리오 에필로그 |
| created_at | TIMESTAMP | 생성 일시 |

### ScenarioQuest 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 기본 키 |
| scenario_id | UUID (FK) | Scenario 참조 |
| step | INTEGER | 퀘스트 순서 (1~4) |
| type | ENUM | PHOTO / PASSWORD |
| title | VARCHAR | 퀘스트 제목 |
| location_name | VARCHAR | 장소명 |
| latitude | FLOAT | 위도 |
| longitude | FLOAT | 경도 |
| scenario_text | TEXT | 퀘스트 내러티브 |
| question | TEXT (nullable) | PASSWORD 퀘스트 질문 |
| answer | VARCHAR (nullable) | PASSWORD 퀘스트 정답 |
| fact_info | TEXT | 장소 관련 실제 역사/정보 |
| success_msg | TEXT | 성공 메시지 |
| failure_msg | TEXT | 실패 메시지 |

### ERD

```
Scenario (1) ──< ScenarioQuest (N)
```

---

## 환경 변수

`.env`에 아래 항목을 추가해야 합니다.

```
GEMINI_API_KEY=your-gemini-api-key
```

Google AI Studio(https://aistudio.google.com/)에서 API 키를 발급받을 수 있습니다.

---

## API 명세

### POST /scenarios/generate

랜드마크 이름을 입력받아 Gemini API로 시나리오를 생성하고 DB에 저장합니다.

**Request Body**
```json
{
  "landmark": "경복궁"
}
```

**Response (201)**
```json
{
  "id": "uuid",
  "landmark": "경복궁",
  "gameTitle": "경복궁의 비밀: 사라진 옥새를 찾아라",
  "prologue": "이보게, 자네 소문 들었나?...",
  "epilogue": "훌륭하구먼!...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "quests": [
    {
      "id": "uuid",
      "step": 1,
      "type": "PHOTO",
      "title": "근정전: 왕권의 상징",
      "locationName": "근정전 앞",
      "latitude": 37.5796,
      "longitude": 126.9770,
      "scenarioText": "가장 먼저...",
      "question": null,
      "factInfo": "근정전은...",
      "successMsg": "오오!...",
      "failureMsg": "음..."
    }
  ]
}
```

**Error Response (502)** - Gemini API 호출 실패 시
```json
{ "error": "Gemini API error (400): ..." }
```

---

### GET /scenarios

저장된 모든 시나리오 목록을 반환합니다 (최신순).

**Response (200)**
```json
[
  {
    "id": "uuid",
    "landmark": "경복궁",
    "gameTitle": "경복궁의 비밀: 사라진 옥새를 찾아라",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### GET /scenarios/:id

시나리오 ID로 상세 데이터를 조회합니다.

**Response (200)** - POST /scenarios/generate 와 동일한 구조

**Error Response (404)**
```json
{ "error": "시나리오를 찾을 수 없습니다." }
```

---

## Gemini 프롬프트 구조

### 시스템 인스트럭션

```
당신은 위치 기반 야외 방탈출 게임의 전문 시나리오 작가입니다.
입력받은 '랜드마크'를 주제로 팩트와 픽션이 결합된 몰입감 있는 게임 시나리오를 작성하세요.
```

### 프롬프트 조건

- **컨셉**: 사용자를 '조선시대 사관'으로 설정, 사극 말투(~하오, ~하구먼, ~하게나) 사용
- **구성**: 총 4단계 퀘스트 (PHOTO 2개 + PASSWORD 2개)
- **데이터 정확성**: 실제 위/경도 좌표 반영, 실제 현장 팩트 기반 퀴즈
- **응답 형식**: JSON (`response_mime_type: application/json`)

---

## 파일 구조

```
apps/api/src/
├── services/
│   └── gemini.ts          # Gemini API 호출 서비스
└── routes/
    └── scenarios.ts       # 시나리오 CRUD 라우트

packages/database/src/entities/
├── Scenario.ts            # Scenario 엔티티
└── ScenarioQuest.ts       # ScenarioQuest 엔티티
```

---

## 사용 예시 (curl)

```bash
# 시나리오 생성
curl -X POST http://localhost:3001/scenarios/generate \
  -H "Content-Type: application/json" \
  -d '{"landmark": "경복궁"}'

# 전체 목록 조회
curl http://localhost:3001/scenarios

# ID로 상세 조회
curl http://localhost:3001/scenarios/{id}
```
