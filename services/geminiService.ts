const API_KEY = import.meta.env.VITE_GEMINI_KEY;
// 3 대신 2.5로 바꿔서 안정성을 높입니다.
const MODEL_ID = "gemini-2.5-flash";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

console.log("--- [계정 맞춤형 모델: Gemini 3 Flash 호출] ---");

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
    console.error("비전 에러 상세:", error);
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
          text: `오늘의 기록: ${currentLogs}\n사용자 메시지: "${message}"\n다음 JSON 형식으로 답해줘: { "action": "ADD", "foodName": "음식명", "proteinAmount": 0, "responseMessage": "한글 답변" }`
        }]
      }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("❌ 채팅 에러 상세:", error);
    throw new Error("채팅 실패");
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  return JSON.parse(text);
};
