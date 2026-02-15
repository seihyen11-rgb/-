// ---------------- [연결 상태 체크] ----------------
const API_KEY = import.meta.env.VITE_GEMINI_KEY;
// v1beta가 아닌 v1 주소를 사용합니다.
const BASE_URL = "https://generativelanguage.googleapis.com/v1"; 
const MODEL_ID = "gemini-1.5-flash"; // 현재 가장 표준인 모델입니다.

console.log("--- [주소 체계 변경 후 최종 시도] ---");
// ------------------------------------------------

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
      }]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("이미지 분석 실패 원인:", error);
    throw new Error("분석 실패");
  }

  const data = await response.json();
  return JSON.parse(data.candidates[0].content.parts[0].text);
};

export const processChatMessage = async (message: string, currentLogs: string) => {
  // /models/ 를 주소 중간에 명시적으로 넣어 경로 오류를 방지합니다.
  const url = `${BASE_URL}/models/${MODEL_ID}:generateContent?key=${API_KEY}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `오늘의 기록: ${currentLogs}\n메시지: "${message}"\nJSON 형식으로만 답해줘: { "action": "ADD", "foodName": "음식명", "proteinAmount": 0, "responseMessage": "한글답변" }`
        }]
      }]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("❌ 구글 응답 상세:", error); // 404가 또 뜨면 이 내용을 꼭 봐야 합니다.
    throw new Error("채팅 실패");
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  const jsonMatch = text.match(/\{.*\}/s);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
};
