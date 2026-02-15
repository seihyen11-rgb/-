const API_KEY = import.meta.env.VITE_GEMINI_KEY;

// 키가 비어있는지 배포 환경에서 확인하는 로그
if (!API_KEY) {
  console.error("❌ VITE_GEMINI_KEY가 설정되지 않았습니다! Vercel Settings를 확인하세요.");
}

const MODEL_ID = "gemini-2.5-flash"; // 성공했던 모델 ID
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

export const processChatMessage = async (message: string, currentLogs: string) => {
  // 주소 끝에 키가 붙는지 다시 한번 확인
  const url = `${BASE_URL}/models/${MODEL_ID}:generateContent?key=${API_KEY}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Current Logs: ${currentLogs}\nUser Message: "${message}"\nResponse in JSON: { "action": "ADD", "foodName": "...", "proteinAmount": 0, "responseMessage": "한글 답변" }`
        }]
      }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error("구글 서버 응답 에러:", errorBody);
    throw new Error("채팅 실패");
  }

  const data = await response.json();
  return JSON.parse(data.candidates[0].content.parts[0].text);
};
