from fastapi import APIRouter
from app.llm.model import get_model # Corrected import

router = APIRouter()

@router.get("/health")
async def health_check():
    # Check if the model has been loaded (get_model will return None if not)
    model_status = "ok" if get_model() is not None else "loading"
    return {"status": model_status, "model_loaded": get_model() is not None}