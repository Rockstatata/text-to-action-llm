"""
Inference API endpoint.
Handles instruction-to-action conversion requests.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.llm.model import generate_action
from app.llm.schema import ActionPlan, InferenceRequest
from app.utils.json_validator import validate_and_parse_json
from app.utils.logger import logger

router = APIRouter()


@router.post("/infer", response_model=ActionPlan)
async def infer(request: InferenceRequest) -> ActionPlan:
    """
    Convert natural language instruction to structured action plan.
    
    Args:
        request: InferenceRequest with instruction string
        
    Returns:
        ActionPlan with object, action, positions
        
    Raises:
        HTTPException: If generation or validation fails
    """
    logger.info(f"Received instruction: {request.instruction}")
    
    try:
        # Generate action plan from LLM
        raw_output = generate_action(request.instruction)
        logger.debug(f"Raw LLM output: {raw_output}")
        
        # Validate and parse JSON
        action_plan = validate_and_parse_json(raw_output)
        
        logger.info(f"Generated action plan: {action_plan}")
        return action_plan
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=422, detail=str(e))
        
    except Exception as e:
        logger.error(f"Inference error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/infer/batch")
async def infer_batch(instructions: list[str]) -> list[ActionPlan]:
    """
    Batch inference for multiple instructions.
    
    Args:
        instructions: List of instruction strings
        
    Returns:
        List of ActionPlan objects
    """
    results = []
    for instruction in instructions:
        try:
            request = InferenceRequest(instruction=instruction)
            result = await infer(request)
            results.append(result)
        except HTTPException as e:
            results.append({"error": e.detail, "instruction": instruction})
    
    return results
