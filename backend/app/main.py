"""
Text-to-Action LLM API
FastAPI application for converting natural language to structured actions.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.infer import router as infer_router
from app.api.health import router as health_router
from app.config import settings

# Initialize FastAPI app
app = FastAPI(
    title="Text-to-Action LLM",
    description="Convert natural language instructions to structured JSON action plans",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router, tags=["Health"])
app.include_router(infer_router, prefix="/api", tags=["Inference"])


@app.on_event("startup")
async def startup_event():
    """Initialize model on startup."""
    from app.llm.model import load_model
    load_model()


@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "name": "Text-to-Action LLM API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
