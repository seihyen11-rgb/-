const API_KEY = import.meta.env.VITE_GEMINI_KEY;
// 사용자님 계정에서 확인된 가장 안정적인 최신 모델입니다.
const MODEL_ID = "gemini-2.5-flash"; 
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

export const analyzeFoodImage = async (base64Image: string) => {
  const url = `${BASE_URL}/models/${MODEL_ID}:generateContent?key=${API_KEY}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: "Analyze this food image. Estimate protein in grams. Respond in JSON: { \"foodName\": \"...\", \"proteinAmount\": 0 }" },
          { inlineData: { mimeType: "image/jpeg", data: base64Image } }
        ]
      }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("비전 분석 실패:", error);
    throw new Error("이미지 분석 실패");
  }

  const data = await response.json();
  return JSON.parse(data.candidates[0].content.parts[0].text);
};

export const processChatMessage = async (message: string, currentLogs: string) => {
  const url = `${BASE_URL}/models/${MODEL_ID}:generateContent?key=${API_KEY}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Current History: ${currentLogs}\nUser: "${message}"\nRespond in JSON format: { "action": "ADD" | "UPDATE" | "DELETE", "targetId": string | null, "foodName": string, "proteinAmount": number, "responseMessage": "한국어로 된 친절한 답변" }`
        }]
      }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("채팅 에러:", error);
    throw new Error("채팅 실패");
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  return JSON.parse(text);
};
