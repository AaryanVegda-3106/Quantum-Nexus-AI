import { GoogleGenAI } from "@google/genai";


async function main() {
  console.log("Key prefix:", process.env.GEMINI_API_KEY?.substring(0, 5));
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Hello, how are you?',
    });
    console.log("Success:", response.text);
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
