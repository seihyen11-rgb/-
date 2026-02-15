const API_KEY = import.meta.env.VITE_GEMINI_KEY;
const MODEL_ID = "gemini-2.5-flash"; 
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

export const analyzeFoodImage = async (base64Data: string) => {
  const url = `${BASE_URL}/models/${MODEL_ID}:generateContent?key=${API_KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: "Estimate protein in grams. Respond ONLY in JSON: { \"foodName\": \"...\", \"proteinAmount\": 0 }" },
          { inlineData: { mimeType: "image/jpeg", data: base64Data } }
        ]
      }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });
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
          text: `History: ${currentLogs}\nUser: "${message}"\nJSON: { \"action\": \"ADD\", \"foodName\": \"...\", \"proteinAmount\": 0, \"responseMessage\": \"...\" }`
        }]
      }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });
  const data = await response.json();
  return JSON.parse(data.candidates[0].content.parts[0].text);
};
