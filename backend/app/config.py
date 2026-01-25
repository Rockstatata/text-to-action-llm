"""
Application configuration.
Loads from environment variables with sensible defaults.
"""

import os
from typing import List


class Settings:
    """Application settings loaded from environment."""
    
    # API Settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = os.getenv(
        "ALLOWED_ORIGINS", 
        "http://localhost:3000,http://localhost:8080,http://127.0.0.1:8080"
    ).split(",")
    
    # LLM Backend: "transformers", "ollama", or "mock"
    LLM_BACKEND: str = os.getenv("LLM_BACKEND", "mock")
    
    # Transformers settings
    MODEL_PATH: str = os.getenv("MODEL_PATH", "text-to-action-lora")
    
    # Ollama settings
    OLLAMA_URL: str = os.getenv("OLLAMA_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.1")
    
    # Generation settings
    MAX_NEW_TOKENS: int = int(os.getenv("MAX_NEW_TOKENS", "128"))
    TEMPERATURE: float = float(os.getenv("TEMPERATURE", "0.1"))
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")


# Global settings instance
settings = Settings()
