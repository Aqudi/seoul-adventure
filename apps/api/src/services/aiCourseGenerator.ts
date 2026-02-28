import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface PlaceInput {
  name: string;
  lat: number;
  lng: number;
  landmarkNames: string[];
  facts?: Record<string, unknown>;
}

export interface GeneratedCourse {
  title: string;
  theme: string;
  estimatedDuration: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  prologue: string;
  epilogue: string;
  quests: Array<{
    placeIndex: number;
    order: number;
    type: 'PHOTO' | 'ANSWER' | 'GPS_TIME';
    narrativeText: string;
    instruction: string;
    mapHint: string;
    answer?: string | null;
    gpsRadiusM?: number | null;
    timeLimitSec?: number | null;
  }>;
}

export async function generateCourse(places: PlaceInput[]): Promise<GeneratedCourse> {
  const placeList = places
    .map(
      (p, i) =>
        `장소${i + 1}: ${p.name}\n  랜드마크: ${p.landmarkNames.join(', ')}\n  팩트: ${JSON.stringify(p.facts ?? {})}`,
    )
    .join('\n\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `당신은 서울 야외 방탈출 게임의 시나리오 작가입니다. 아래 장소들로 탐험 코스를 만들어주세요.

장소 목록:
${placeList}

요구사항:
- 총 3~4개 퀘스트 (장소당 1~2개)
- PHOTO/ANSWER/GPS_TIME 유형을 섞어서 사용
- 조선 시대 왕실 사관 말투로 대사 작성 (예: "이보게!", "~하시오")

JSON 형식으로만 응답:
{
  "title": "코스 제목",
  "theme": "테마",
  "estimatedDuration": 90,
  "difficulty": "MEDIUM",
  "prologue": "프롤로그",
  "epilogue": "에필로그",
  "quests": [
    {
      "placeIndex": 0, "order": 1, "type": "PHOTO",
      "narrativeText": "대사", "instruction": "미션 설명",
      "mapHint": "다음 장소 안내",
      "answer": null, "gpsRadiusM": null, "timeLimitSec": null
    }
  ]
}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.8,
  });

  return JSON.parse(response.choices[0]!.message.content!) as GeneratedCourse;
}
