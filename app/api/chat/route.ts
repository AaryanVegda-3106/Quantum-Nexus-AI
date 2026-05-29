import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import knowledgeData from "@/knowledge-base/data.json";

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // --- Guardrails: Input Sanitization ---
    const queryLower = message.toLowerCase();
    const forbiddenKeywords = ["hack", "bomb", "kill", "suicide", "illegal", "exploit"];
    if (forbiddenKeywords.some(keyword => queryLower.includes(keyword))) {
      return NextResponse.json({ 
        response: "I'm sorry, but I cannot assist with that request. As Quantum Nexus AI, my purpose is to educate and discuss emerging technologies safely and constructively." 
      });
    }

    const relevantKnowledge = knowledgeData.filter(item => 
      queryLower.includes(item.technology.toLowerCase()) || 
      queryLower.includes(item.category.toLowerCase()) ||
      item.core_concepts.some(c => queryLower.includes(c.toLowerCase()))
    );

    let systemInstruction = "You are Quantum Nexus AI, a futuristic, highly advanced AI mentor specializing in emerging technologies (Quantum Computing, Web3, AI, Metaverse, etc.). You speak with a premium, intelligent, and concise tone. Format your answers clearly with markdown.\n";
    systemInstruction += "\nCRITICAL GUARDRAIL: You must absolutely refuse to answer any questions related to violence, self-harm, illegal acts, hate speech, or sexually explicit content. If asked about these, politely decline and state your purpose as a technology educator.\n";
    
    if (relevantKnowledge.length > 0) {
      systemInstruction += "\nUse the following verified knowledge base information to accurately answer the user's query:\n";
      systemInstruction += JSON.stringify(relevantKnowledge, null, 2);
    }

    // Construct history for Gemini API
    const contents = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        // Skip empty messages (like the temporary typing ones)
        if (!msg.content) continue;
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      }
    }

    // Add the current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          }
        ]
      }
    });

    return NextResponse.json({ response: response.text });

  } catch (error: any) {
    console.error("API Chat Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate response" }, { status: 500 });
  }
}
