
import { GoogleGenerativeAI } from "@google/generative-ai";

// ---------------- [디버깅 로그] ----------------
console.log("--- [Gemini 1.5 연결 재시도] ---");
const API_KEY = import.meta.env.VITE_GEMINI_KEY;
console.log("열쇠 확인:", !!API_KEY ? "✅ 준비됨" : "❌ 없음");
// ----------------------------------------------

// 공식 라이브러리 클래스 생성
const genAI = new GoogleGenerativeAI(API_KEY);

const AI_MODEL = "gemini-1.5-flash";

export const analyzeFoodImage = async (base64Image: string) => {
  // .getGenerativeModel이 아닌 최신 방식으로 모델을 가져옵니다.
  const model = genAI.getGenerativeModel({ model: AI_MODEL });

  const prompt = "Analyze this food image. Estimate the protein content in grams. " +
                 "Provide a short food name and the protein amount. " +
                 "Do NOT include calories. Respond in JSON format.";

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Image,
      },
    },
    { text: prompt },
  ]);

  const response = await result.response;
  return JSON.parse(response.text());
};

export const processChatMessage = async (message: string, currentLogs: string) => {
  const model = genAI.getGenerativeModel({ model: AI_MODEL });

  const prompt = `
    The user wants to record or correct a protein entry. 
    Current history: ${currentLogs}.
    User message: "${message}".
    
    Return a JSON object:
    {
      "action": "ADD" | "UPDATE" | "DELETE",
      "targetId": string | null,
      "foodName": string,
      "proteinAmount": number,
      "responseMessage": "한국어로 된 친절한 확인 메시지"
    }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
};
