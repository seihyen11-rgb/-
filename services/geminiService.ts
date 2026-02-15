const API_KEY = import.meta.env.VITE_GEMINI_KEY;
// 리스트에서 확인된 가장 최신 모델 ID입니다.
const MODEL_ID = "gemini-3-flash-preview"; 
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

console.log("--- [계정 확인 모델: Gemini 3 Flash 시도] ---");

export const analyzeFoodImage = async (base64Image: string) => {
  const url = `${BASE_URL}/models/${MODEL_ID}:generateContent?key=${API_KEY}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: "Estimate protein in grams for this food. Respond in JSON: { \"foodName\": \"...\", \"proteinAmount\": 0 }" },
          { inlineData: { mimeType: "image/jpeg", data: base64Image } }
        ]
      }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("분석 실패:", error);
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
          text: `Log: ${currentLogs}\nUser: "${message}"\nJSON: { "action": "ADD", "foodName": "...", "proteinAmount": 0, "responseMessage": "한글답변" }`
        }]
      }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("❌ 채팅 실패 상세:", error);
    throw new Error("채팅 실패");
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  return JSON.parse(text);
};
