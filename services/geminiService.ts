
import { GoogleGenAI, Type } from "@google/genai";
// ---------------- 디버깅 코드 시작 ----------------
console.log("--- [환경 변수 체크] ---");
// 열쇠가 있는지 없는지만 true/false로 보여줍니다.
console.log("1. 열쇠가 배달되었나요?:", !!import.meta.env.VITE_API_KEY); 
// 열쇠의 글자 수를 확인합니다. (0이면 없는 것)
console.log("2. 열쇠 글자 수:", import.meta.env.VITE_API_KEY?.length || 0);
// 열쇠의 앞 3글자만 살짝 확인합니다.
console.log("3. 열쇠 앞부분 확인:", import.meta.env.VITE_API_KEY?.substring(0, 3));
console.log("------------------------");
// ------------------------------------------------
const AI_MODEL = 'gemini-2.0-flash';

export const analyzeFoodImage = async (base64Image: string) => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  
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
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  
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
