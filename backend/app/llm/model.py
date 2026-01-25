"""
LLM Model loading and inference.
Supports multiple backends: HuggingFace, Ollama, or API.
"""

from typing import Optional
import os

from app.config import settings
from app.llm.prompt import format_prompt
from app.utils.logger import logger

# Global model state
_model = None
_tokenizer = None
_model_loaded = False


def load_model():
    """Load the LLM model based on configuration."""
    global _model, _tokenizer, _model_loaded
    
    if _model_loaded:
        logger.info("Model already loaded")
        return
    
    backend = settings.LLM_BACKEND
    logger.info(f"Loading model with backend: {backend}")
    
    if backend == "transformers":
        _load_transformers_model()
    elif backend == "ollama":
        _init_ollama_client()
    elif backend == "mock":
        logger.info("Using mock model for development")
        _model_loaded = True
    else:
        raise ValueError(f"Unknown backend: {backend}")


def _load_transformers_model():
    """Load model using HuggingFace Transformers."""
    global _model, _tokenizer, _model_loaded
    
    try:
        from transformers import AutoModelForCausalLM, AutoTokenizer
        import torch
        
        model_path = settings.MODEL_PATH
        logger.info(f"Loading model from: {model_path}")
        
        _tokenizer = AutoTokenizer.from_pretrained(model_path)
        _model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.float16,
            device_map="auto",
            load_in_4bit=True,
        )
        
        _model_loaded = True
        logger.info("Transformers model loaded successfully")
        
    except Exception as e:
        logger.error(f"Failed to load transformers model: {e}")
        raise


def _init_ollama_client():
    """Initialize Ollama client for local inference."""
    global _model_loaded
    
    try:
        import requests
        
        # Check if Ollama is running
        response = requests.get(f"{settings.OLLAMA_URL}/api/tags")
        if response.status_code == 200:
            _model_loaded = True
            logger.info("Ollama client initialized")
        else:
            raise ConnectionError("Ollama server not responding")
            
    except Exception as e:
        logger.error(f"Failed to connect to Ollama: {e}")
        raise


def is_model_loaded() -> bool:
    """Check if model is loaded and ready."""
    return _model_loaded


def generate_action(instruction: str) -> str:
    """
    Generate action plan from instruction.
    
    Args:
        instruction: Natural language instruction
        
    Returns:
        JSON string with action plan
    """
    if not _model_loaded:
        raise RuntimeError("Model not loaded")
    
    backend = settings.LLM_BACKEND
    prompt = format_prompt(instruction)
    
    if backend == "transformers":
        return _generate_transformers(prompt)
    elif backend == "ollama":
        return _generate_ollama(prompt)
    elif backend == "mock":
        return _generate_mock(instruction)
    else:
        raise ValueError(f"Unknown backend: {backend}")


def _generate_transformers(prompt: str) -> str:
    """Generate using HuggingFace Transformers."""
    global _model, _tokenizer
    
    inputs = _tokenizer(prompt, return_tensors="pt").to(_model.device)
    
    outputs = _model.generate(
        **inputs,
        max_new_tokens=settings.MAX_NEW_TOKENS,
        temperature=settings.TEMPERATURE,
        do_sample=settings.TEMPERATURE > 0,
        pad_token_id=_tokenizer.eos_token_id,
    )
    
    response = _tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Extract JSON from response
    json_start = response.find("{")
    json_end = response.rfind("}") + 1
    
    if json_start != -1 and json_end > json_start:
        return response[json_start:json_end]
    
    return response


def _generate_ollama(prompt: str) -> str:
    """Generate using Ollama local server."""
    import requests
    
    response = requests.post(
        f"{settings.OLLAMA_URL}/api/generate",
        json={
            "model": settings.OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": settings.TEMPERATURE,
                "num_predict": settings.MAX_NEW_TOKENS,
            }
        }
    )
    
    result = response.json()
    return result.get("response", "")


def _generate_mock(instruction: str) -> str:
    """Generate mock response for development."""
    import json
    
    # Simple mock response
    mock_response = {
        "object": "object from instruction",
        "initial_position": "floor",
        "action": "move",
        "target_position": "target position"
    }
    
    # Try to extract object from instruction
    words = instruction.lower().split()
    for i, word in enumerate(words):
        if word in ["the", "a", "an"] and i + 2 < len(words):
            mock_response["object"] = f"{words[i+1]} {words[i+2]}"
            break
    
    return json.dumps(mock_response)
