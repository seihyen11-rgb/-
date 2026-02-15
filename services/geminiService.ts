// ---------------- [연결 상태 체크] ----------------
const API_KEY = import.meta.env.VITE_GEMINI_KEY;
// gemini-pro는 가장 표준적인 모델명입니다.
const MODEL_ID = "gemini-pro"; 
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

console.log("--- [Gemini Pro 모델로 최종 시도] ---");
// ------------------------------------------------

export const analyzeFoodImage = async (base64Image: string) => {
  // 주의: gemini-pro는 텍스트 전용일 수 있으므로, 
  // 이미지 분석 시에는 모델명을 gemini-pro-vision으로 자동 전환합니다.
  const visionModel = "gemini-pro-vision";
  const url = `${BASE_URL}/${visionModel}:generateContent?key=${API_KEY}`;
  
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
    console.error("비전 모델 실패:", error);
    throw new Error("이미지 분석 실패");
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
          text: `오늘의 단백질 섭취 기록: ${currentLogs}\n사용자 메시지: "${message}"\n위 내용을 바탕으로 단백질을 추가, 수정, 삭제해줘. 반드시 JSON 형식으로만 답해줘. { "action": "ADD", "foodName": "음식명", "proteinAmount": 숫자, "responseMessage": "친절한 한글 답변" }`
        }]
      }]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("❌ Pro 모델 에러:", error);
    throw new Error("채팅 실패");
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  
  // JSON만 깔끔하게 뽑아내는 처리
  const jsonMatch = text.match(/\{.*\}/s);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
};
