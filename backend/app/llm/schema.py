"""
Pydantic schemas for request/response validation.
"""

from typing import Literal, Optional, List
from pydantic import BaseModel, Field


class InferenceRequest(BaseModel):
    """Request model for inference endpoint."""
    
    instruction: str = Field(
        ...,
        description="Natural language instruction to convert",
        min_length=1,
        max_length=1000,
        examples=["Move the red box to the blue platform", 
                  "Move the red box to the top shelf, then rotate the green sphere 90 degrees"]
    )


class ActionStep(BaseModel):
    """Single action step in a sequence."""
    
    object: str = Field(
        ...,
        description="The object to manipulate",
        examples=["red box", "green sphere"]
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
    
    initial_position: Optional[str] = Field(
        None,
        description="Current position of the object (optional)",
        examples=["floor", "center", "table"]
    )


class ActionPlan(BaseModel):
    """Structured action plan output from LLM - supports single or chained actions."""
    
    sequence: List[ActionStep] = Field(
        default_factory=list,
        description="Sequence of action steps to execute"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "sequence": [
                    {
                        "object": "red box",
                        "action": "move",
                        "target_position": "blue platform"
                    },
                    {
                        "object": "green sphere",
                        "action": "rotate",
                        "target_position": "90 degrees clockwise"
                    }
                ]
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
