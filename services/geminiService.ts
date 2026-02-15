const API_KEY = import.meta.env.VITE_GEMINI_KEY;
// 인도 지역에서 가장 가용성이 높은 v1beta 엔드포인트와 모델 경로입니다.
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const MODEL_PATH = "models/gemini-1.5-flash";

console.log("--- [인도 지역 계정 최적화 주소 시도] ---");

export const analyzeFoodImage = async (base64Image: string) => {
  // 주소 형식을 v1beta/models/model-id:generateContent로 엄격히 맞춤
  const url = `${BASE_URL}/${MODEL_PATH}:generateContent?key=${API_KEY}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: "Estimate protein. Respond in JSON: { \"foodName\": \"...\", \"proteinAmount\": 0 }" },
          { inlineData: { mimeType: "image/jpeg", data: base64Image } }
        ]
      }]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("인도 계정 분석 에러:", error);
    throw new Error("분석 실패");
  }

  const data = await response.json();
  return JSON.parse(data.candidates[0].content.parts[0].text);
};

export const processChatMessage = async (message: string, currentLogs: string) => {
  const url = `${BASE_URL}/${MODEL_PATH}:generateContent?key=${API_KEY}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Log: ${currentLogs}\nUser: "${message}"\nJSON only: { "action": "ADD", "foodName": "...", "proteinAmount": 0, "responseMessage": "..." }`
        }]
      }]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("❌ 인도 계정 채팅 에러:", error);
    throw new Error("채팅 실패");
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  const jsonMatch = text.match(/\{.*\}/s);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
};
