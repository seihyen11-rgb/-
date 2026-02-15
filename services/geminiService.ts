const API_KEY = import.meta.env.VITE_GEMINI_KEY;
// 주소를 v1으로, 모델을 가장 안정적인 것으로 고정합니다.
const BASE_URL = "https://generativelanguage.googleapis.com/v1/models";
const MODEL_ID = "gemini-1.5-flash"; 

console.log("--- [Gemini v1 최종 호출 시도] ---");

export const analyzeFoodImage = async (base64Image: string) => {
  const url = `${BASE_URL}/${MODEL_ID}:generateContent?key=${API_KEY}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: "Estimate protein in grams for this food. Respond in JSON: { \"foodName\": \"...\", \"proteinAmount\": 0 }" }
        ]
      }]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("실패 상세 원인:", error);
    throw new Error("분석 실패");
  }

  const data = await response.json();
  return JSON.parse(data.candidates[0].content.parts[0].text);
};

export const processChatMessage = async (message: string, currentLogs: string) => {
  const url = `${BASE_URL}/${MODEL_ID}:generateContent?key=${API_KEY}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `오늘 먹은 기록: ${currentLogs}\n사용자 메시지: "${message}"\nJSON으로 응답해줘.`
        }]
      }]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.log("❌ 구글이 보낸 에러 메시지:", error);
    throw new Error("채팅 실패");
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  // AI가 앞뒤에 ```json 같은 설명을 붙일 경우를 대비해 순수 JSON만 추출
  const jsonMatch = text.match(/\{.*\}/s);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
};
