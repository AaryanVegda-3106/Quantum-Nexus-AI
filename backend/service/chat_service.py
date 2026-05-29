import os
import json
from google import genai
from google.genai import types
from dto.chat_dto import ChatRequest, ChatResponse

# Load knowledge base data
KNOWLEDGE_BASE_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'knowledge-base', 'data.json')
try:
    with open(KNOWLEDGE_BASE_PATH, 'r', encoding='utf-8') as f:
        knowledge_data = json.load(f)
except FileNotFoundError:
    knowledge_data = []
    print(f"Warning: Knowledge base not found at {KNOWLEDGE_BASE_PATH}")

async def process_chat(request: ChatRequest) -> ChatResponse:
    if not request.message:
        return ChatResponse(response="", error="Message is required")

    query_lower = request.message.lower()
    forbidden_keywords = ["hack", "bomb", "kill", "suicide", "illegal", "exploit"]
    if any(keyword in query_lower for keyword in forbidden_keywords):
        return ChatResponse(
            response="I'm sorry, but I cannot assist with that request. As Quantum Nexus AI, my purpose is to educate and discuss emerging technologies safely and constructively."
        )

    relevant_knowledge = [
        item for item in knowledge_data
        if item.get('technology', '').lower() in query_lower or
           item.get('category', '').lower() in query_lower or
           any(c.lower() in query_lower for c in item.get('core_concepts', []))
    ]

    system_instruction = (
        "You are Quantum Nexus AI, a futuristic, highly advanced AI mentor specializing in emerging technologies (Quantum Computing, Web3, AI, Metaverse, etc.). You speak with a premium, intelligent, and concise tone. Format your answers clearly with markdown.\n"
        "\nCRITICAL GUARDRAIL: You must absolutely refuse to answer any questions related to violence, self-harm, illegal acts, hate speech, or sexually explicit content. If asked about these, politely decline and state your purpose as a technology educator.\n"
    )

    if relevant_knowledge:
        system_instruction += "\nUse the following verified knowledge base information to accurately answer the user's query:\n"
        system_instruction += json.dumps(relevant_knowledge, indent=2)

    # Initialize Gemini client
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return ChatResponse(response="", error="GEMINI_API_KEY environment variable not set")
        
    client = genai.Client(api_key=api_key)

    contents = []
    if request.history:
        for msg in request.history:
            if not msg.content:
                continue
            role = 'user' if msg.role == 'user' else 'model'
            contents.append(types.Content(role=role, parts=[types.Part.from_text(text=msg.content)]))

    contents.append(types.Content(role='user', parts=[types.Part.from_text(text=request.message)]))

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                safety_settings=[
                    types.SafetySetting(
                        category=types.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold=types.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
                    ),
                    types.SafetySetting(
                        category=types.HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold=types.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
                    ),
                    types.SafetySetting(
                        category=types.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                        threshold=types.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
                    ),
                    types.SafetySetting(
                        category=types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold=types.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
                    )
                ]
            )
        )
        return ChatResponse(response=response.text)
    except Exception as e:
        print(f"API Chat Error: {e}")
        return ChatResponse(response="", error=str(e))
