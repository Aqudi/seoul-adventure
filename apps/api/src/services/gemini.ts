import { GoogleGenAI } from '@google/genai';

const SYSTEM_INSTRUCTION =
  "당신은 위치 기반 야외 방탈출 게임의 전문 시나리오 작가입니다. 입력받은 '랜드마크'를 주제로 팩트와 픽션이 결합된 몰입감 있는 게임 시나리오를 작성하세요.";

const PROMPT_TEMPLATE = `입력된 랜드마크 '{landmark_name}'을 배경으로 하는 방탈출 시나리오를 생성하십시오. 응답은 반드시 지정된 JSON 구조를 따라야 하며, 다음 조건을 충족해야 합니다.


2. 구성: 총 4단계의 퀘스트를 생성하며, PHOTO(사진 인증) 2개와 PASSWORD(비밀번호 입력) 2개를 혼합하십시오.
3. 데이터 정확성:
   - 각 퀘스트의 위도(latitude)와 경도(longitude)는 실제 해당 랜드마크의 정확한 위치 좌표를 반영하십시오.
   - PASSWORD 퀴즈는 해당 장소의 안내판, 조형물의 개수, 역사적 연도 등 실제 현장에서만 알 수 있는 '팩트'를 기반으로 설계하십시오.
   - fact_info 항목에는 해당 장소에 대한 실제 역사적 상식이나 유래를 2문장 이내로 포함하십시오.
4. 시각화: 시나리오의 시작(prologue)과 끝(epilogue)을 명확히 정의하십시오.

[필수 JSON 키]: landmark, game_title, prologue, epilogue, quests(배열: step, type, title, location_name, latitude, longitude, scenario_text, question, answer, fact_info, success_msg, failure_msg)`;

export interface GeminiQuestResponse {
  step: number;
  type: 'PHOTO' | 'PASSWORD';
  title: string;
  location_name: string;
  latitude: number;
  longitude: number;
  scenario_text: string;
  question?: string;
  answer?: string;
  fact_info: string;
  success_msg: string;
  failure_msg: string;
}

export interface GeminiScenarioResponse {
  landmark: string;
  game_title: string;
  prologue: string;
  epilogue: string;
  quests: GeminiQuestResponse[];
}

export async function generateScenario(landmarkName: string): Promise<GeminiScenarioResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = PROMPT_TEMPLATE.replace(/{landmark_name}/g, landmarkName);

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
    },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  const text = response.text;
  if (!text) {
    throw new Error('Empty response from Gemini API');
  }

  return JSON.parse(text) as GeminiScenarioResponse;
}
