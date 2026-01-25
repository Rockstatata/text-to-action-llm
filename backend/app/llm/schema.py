"""
Pydantic schemas for request/response validation.
"""

from typing import Literal
from pydantic import BaseModel, Field


class InferenceRequest(BaseModel):
    """Request model for inference endpoint."""
    
    instruction: str = Field(
        ...,
        description="Natural language instruction to convert",
        min_length=1,
        max_length=500,
        examples=["Move the red box to the blue platform"]
    )


class ActionPlan(BaseModel):
    """Structured action plan output from LLM."""
    
    object: str = Field(
        ...,
        description="The object to manipulate",
        examples=["red box", "green sphere"]
    )
    
    initial_position: str = Field(
        ...,
        description="Current position of the object",
        examples=["floor", "center", "table"]
    )
    
    action: Literal["move", "rotate", "scale"] = Field(
        ...,
        description="Action to perform on the object"
    )
    
    target_position: str = Field(
        ...,
        description="Target position or state",
        examples=["blue platform", "90 degrees clockwise", "2x original size"]
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "object": "red box",
                "initial_position": "floor",
                "action": "move",
                "target_position": "blue platform"
            }
        }


class ErrorResponse(BaseModel):
    """Error response model."""
    
    detail: str = Field(..., description="Error message")
    
    class Config:
        json_schema_extra = {
            "example": {
                "detail": "Invalid JSON output from model"
            }
        }
