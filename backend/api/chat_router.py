from fastapi import APIRouter, HTTPException
from dto.chat_dto import ChatRequest, ChatResponse
from service.chat_service import process_chat

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    response = await process_chat(request)
    if response.error:
        # We can handle custom status codes here if needed, but returning 400/500 based on error presence
        if response.error == "Message is required":
            raise HTTPException(status_code=400, detail=response.error)
        raise HTTPException(status_code=500, detail=response.error)
    return response
