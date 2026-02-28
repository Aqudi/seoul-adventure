import { GoogleGenAI } from '@google/genai';

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface PhotoAnalysisResult {
  passed: boolean;
  reason: string;
  confidence: number; // 0~1
}

/**
 * Gemini Vision으로 사진이 퀘스트 완료 증거로 적합한지 분석
 */
export async function analyzePhoto(
  imageBuffer: Buffer,
  mimeType: string,
  questInstruction: string,
  placeContext: string,
): Promise<PhotoAnalysisResult> {
  const response = await genai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `당신은 서울 어드벤처 게임의 퀘스트 검증 AI입니다.
사용자가 제출한 사진이 퀘스트를 올바르게 완료했는지 판단합니다.
실제로 해당 장소나 대상을 촬영했는지 확인하되, 너무 엄격하지 않게 판단하세요.

퀘스트 지시사항: "${questInstruction}"
장소/맥락: "${placeContext}"

이 사진이 퀘스트 완료 증거로 적합한지 판단하고 반드시 아래 JSON 형식으로만 응답하세요:
{ "passed": boolean, "reason": string, "confidence": number }`,
          },
          {
            inlineData: {
              mimeType,
              data: imageBuffer.toString('base64'),
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      maxOutputTokens: 300,
    },
  });

  try {
    const text = response.text ?? '';
    console.info('[photoAnalyzer] raw response:', text);
    return JSON.parse(text) as PhotoAnalysisResult;
  } catch (e) {
    console.error('[photoAnalyzer] JSON parse failed:', e, 'raw:', response.text);
    return { passed: false, reason: '사진 분석에 실패했습니다.', confidence: 0 };
  }
}
