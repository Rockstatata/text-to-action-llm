import os
from unsloth import FastLanguageModel
from transformers import AutoTokenizer
import torch
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s | %(levelname)s | %(name)s | %(message)s')
logger = logging.getLogger('text-to-action')

# Global variables to store the loaded model and tokenizer
_model = None
_tokenizer = None

def load_model():
    global _model, _tokenizer
    if _model is not None and _tokenizer is not None:
        logger.info("Model already loaded")
        return _model, _tokenizer

    backend = os.environ.get("LLM_BACKEND", "transformers")
    lora_path = os.environ.get("MODEL_PATH", "/content/text-to-action-lora") # Path to saved LoRA adapters
    base_model_name = "unsloth/Meta-Llama-3.1-8B-Instruct" # The original base model

    logger.info(f"Loading model with backend: {backend}")
    logger.info(f"Loading LoRA adapters from: {lora_path}")

    if backend == "transformers":
        # 1. Load the base model first
        _model, _tokenizer = FastLanguageModel.from_pretrained(
            model_name=base_model_name,
            max_seq_length=2048,
            dtype=None,  # Auto-detect from base model
            load_in_4bit=True, # Should match training setup
        )

        # 2. Apply Unsloth's inference optimizations to the base model
        FastLanguageModel.for_inference(_model)

        # 3. Load the LoRA adapters onto the base model
        _model = FastLanguageModel.get_peft_model(
            _model,
            r=16,  # Must match training r
            target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                            "gate_proj", "up_proj", "down_proj"], # Must match training
            lora_alpha=32, # Must match training
            lora_dropout=0.05, # Match training dropout, or 0 for inference
            bias="none", # Must match training
        )
        _model.load_adapter(lora_path, adapter_name="text_to_action_adapter") # Added adapter_name

        logger.info("Transformers model with LoRA adapters loaded successfully")
        return _model, _tokenizer
    else:
        raise ValueError(f"Unknown LLM_BACKEND: {backend}")

def get_model():
    return _model

def get_tokenizer():
    return _tokenizer