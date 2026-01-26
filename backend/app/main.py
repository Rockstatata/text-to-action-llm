"""
Text-to-Action LLM API
FastAPI application for converting natural language to structured actions.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.infer import router as infer_router
from app.api.health import router as health_router

app = FastAPI(
    title="Text-to-Action API",
    description="API for converting natural language instructions to structured JSON action plans.",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(infer_router, prefix="/api")
app.include_router(health_router)