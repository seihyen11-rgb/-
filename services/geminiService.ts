// ---------------- [디버깅 로그] ----------------
const API_KEY = import.meta.env.VITE_GEMINI_KEY;
console.log("--- [Gemini API 호출 시도] ---");
console.log("열쇠 확인:", !!API_KEY ? "✅ 준비됨" : "❌ 없음");
// ----------------------------------------------

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL = "gemini-1.5-flash";

export const analyzeFoodImage = async (base64Image: string) => {
  const response = await fetch(`${BASE_URL}/${MODEL}:generateContent?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: "Analyze this food image. Estimate the protein content in grams. Provide a short food name and the protein amount. Do NOT include calories. Respond in JSON format only." }
        ]
      }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!response.ok) throw new Error("이미지 분석 실패");
  const data = await response.json();
  return JSON.parse(data.candidates[0].content.parts[0].text);
};

export const processChatMessage = async (message: string, currentLogs: string) => {
  const response = await fetch(`${BASE_URL}/${MODEL}:generateContent?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `
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
          `
        }]
      }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("API 에러 상세:", errorData);
    throw new Error("채팅 처리 실패");
  }
  
  const data = await response.json();
  return JSON.parse(data.candidates[0].content.parts[0].text);
};
