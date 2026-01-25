"""
Health check endpoint.
"""

from fastapi import APIRouter

from app.llm.model import is_model_loaded

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring.
    
    Returns:
        Health status and model loading state
    """
    return {
        "status": "healthy",
        "model_loaded": is_model_loaded(),
    }


@router.get("/ready")
async def readiness_check():
    """
    Readiness probe for Kubernetes/container orchestration.
    
    Returns 200 if model is loaded and ready to serve.
    """
    if is_model_loaded():
        return {"status": "ready"}
    else:
        return {"status": "not_ready"}, 503
