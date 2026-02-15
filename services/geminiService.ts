import { GoogleGenAI, Type } from "@google/genai";

// ---------------- [열쇠 배달 확인 디버깅 코드] ----------------
console.log("--- [새로운 환경 변수 체크] ---");
console.log("1. VITE_GEMINI_KEY 배달 완료?:", !!import.meta.env.VITE_GEMINI_KEY);
console.log("2. 글자 수:", import.meta.env.VITE_GEMINI_KEY?.length || 0);
console.log("-----------------------------------------");
// -----------------------------------------------------------

const AI_MODEL = 'gemini-1.5-flash';

export const analyzeFoodImage = async (base64Image: string) => {
  // 열쇠 이름을 VITE_GEMINI_KEY로 변경했습니다.
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_KEY });
  
  const response = await ai.models.generateContent({
    model: AI_MODEL,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          text: "Analyze this food image. Estimate the protein content in grams. " +
                "Provide a short food name and the protein amount. " +
                "Do NOT include calories or any other nutritional information. " +
                "Respond in JSON format."
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          foodName: { type: Type.STRING },
          proteinAmount: { type: Type.NUMBER, description: "Protein in grams" }
        },
        required: ["foodName", "proteinAmount"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const processChatMessage = async (message: string, currentLogs: string) => {
  // 열쇠 이름을 VITE_GEMINI_KEY로 변경했습니다.
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_KEY });
  
  const response = await ai.models.generateContent({
    model: AI_MODEL,
    contents: `The user wants to record or correct a protein entry. 
    Current history of today's logs: ${currentLogs}.
    User message: "${message}".
    
    If the user is correcting a previous entry (e.g., "Change the chicken protein to 30g"), find the relevant item.
    If the user is adding a new one (e.g., "I ate two eggs"), estimate the protein.
    Estimate based on standard portions. Do NOT mention calories.
    
    Return a JSON object with:
    1. action: "ADD" or "UPDATE" or "DELETE"
    2. targetId: (if update/delete)
    3. foodName: (updated or new name)
    4. proteinAmount: (updated or new value)
    5. responseMessage: (A friendly confirmation message in Korean)`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          action: { type: Type.STRING },
          targetId: { type: Type.STRING },
          foodName: { type: Type.STRING },
          proteinAmount: { type: Type.NUMBER },
          responseMessage: { type: Type.STRING }
        },
        required: ["action", "foodName", "proteinAmount", "responseMessage"]
      }
    }
  });

  return JSON.parse(response.text);
};
