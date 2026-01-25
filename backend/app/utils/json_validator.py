"""
JSON validation and parsing utilities.
"""

import json
import re
from typing import Optional

from app.llm.schema import ActionPlan
from app.utils.logger import logger


def extract_json_from_text(text: str) -> Optional[str]:
    """
    Extract JSON object from text that may contain other content.
    
    Args:
        text: Raw text that may contain JSON
        
    Returns:
        Extracted JSON string or None
    """
    # Try to find JSON object boundaries
    json_match = re.search(r'\{[^{}]*\}', text, re.DOTALL)
    
    if json_match:
        return json_match.group()
    
    return None


def validate_and_parse_json(raw_output: str) -> ActionPlan:
    """
    Validate and parse raw LLM output into ActionPlan.
    
    Args:
        raw_output: Raw string output from LLM
        
    Returns:
        Validated ActionPlan object
        
    Raises:
        ValueError: If parsing or validation fails
    """
    # Try to extract JSON if wrapped in other text
    json_str = raw_output.strip()
    
    if not json_str.startswith("{"):
        extracted = extract_json_from_text(json_str)
        if extracted:
            json_str = extracted
        else:
            raise ValueError(f"No JSON found in output: {raw_output[:100]}")
    
    # Parse JSON
    try:
        data = json.loads(json_str)
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {e}")
        raise ValueError(f"Invalid JSON: {e}")
    
    # Validate required fields
    required_fields = {"object", "initial_position", "action", "target_position"}
    missing_fields = required_fields - set(data.keys())
    
    if missing_fields:
        raise ValueError(f"Missing required fields: {missing_fields}")
    
    # Normalize action
    action = data["action"].lower().strip()
    if action not in ("move", "rotate", "scale"):
        # Try to map common alternatives
        action_map = {
            "place": "move",
            "put": "move",
            "relocate": "move",
            "transfer": "move",
            "spin": "rotate",
            "turn": "rotate",
            "resize": "scale",
            "shrink": "scale",
            "grow": "scale",
        }
        action = action_map.get(action, action)
    
    data["action"] = action
    
    # Validate with Pydantic
    try:
        return ActionPlan(**data)
    except Exception as e:
        logger.error(f"Pydantic validation error: {e}")
        raise ValueError(f"Schema validation failed: {e}")


def is_valid_action_plan(data: dict) -> bool:
    """
    Check if a dictionary is a valid action plan.
    
    Args:
        data: Dictionary to validate
        
    Returns:
        True if valid, False otherwise
    """
    try:
        ActionPlan(**data)
        return True
    except Exception:
        return False
