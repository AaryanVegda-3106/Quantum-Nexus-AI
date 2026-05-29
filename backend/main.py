from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import chat_router

app = FastAPI(
    title="Quantum Nexus AI Backend",
    description="Python backend for Quantum Nexus AI chatbot",
    version="1.0.0"
)

# Configure CORS (allow local Next.js frontend if needed to call directly, though we are using proxy)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat_router.router)

@app.get("/")
async def root():
    return {"message": "Quantum Nexus AI Backend is running"}
