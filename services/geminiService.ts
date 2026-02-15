import { GoogleGenAI, Type } from "@google/genai";

// ---------------- [디버깅 로그: 배달 확인용] ----------------
console.log("--- [Gemini 1.5 연결 시도] ---");
console.log("열쇠 확인:", !!import.meta.env.VITE_GEMINI_KEY ? "✅ 준비됨" : "❌ 없음");
// --------------------------------------------------------

// 가장 표준적이고 오류가 적은 모델명입니다.
const AI_MODEL = "gemini-1.5-flash";

export const analyzeFoodImage = async (base64Image: string) => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_KEY });
  
  // v1beta 대신 기본 생성 방식을 사용하여 호환성을 높입니다.
  const model = ai.getGenerativeModel({ 
    model: AI_MODEL,
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const prompt = "Analyze this food image. Estimate the protein content in grams. " +
                 "Provide a short food name and the protein amount. " +
                 "Do NOT include calories. Respond in JSON format.";

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Image,
      },
    },
  ]);

  return JSON.parse(result.response.text());
};

export const processChatMessage = async (message: string, currentLogs: string) => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_KEY });
  
  const model = ai.getGenerativeModel({ 
    model: AI_MODEL,
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

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
  return JSON.parse(result.response.text());
};
