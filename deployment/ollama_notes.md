# 🦙 Ollama Local Inference Guide

Run your fine-tuned model locally using Ollama for privacy and offline usage.

## What is Ollama?

[Ollama](https://ollama.ai) is a tool for running large language models locally:
- Simple CLI interface
- Optimized inference
- Model management
- REST API

## Installation

### Windows

```powershell
# Download from https://ollama.ai/download
# Or use winget
winget install Ollama.Ollama
```

### macOS

```bash
brew install ollama
```

### Linux

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

## Quick Start

### 1. Start Ollama Server

```bash
ollama serve
```

Server runs on `http://localhost:11434`

### 2. Pull a Base Model

```bash
# Pull LLaMA 3.1 8B
ollama pull llama3.1

# Or smaller models
ollama pull llama3.1:8b-instruct-q4_0  # Quantized
```

### 3. Test Inference

```bash
ollama run llama3.1 "What is 2+2?"
```

## Using with Text-to-Action Backend

### Configure Backend

Set environment variables:

```bash
export LLM_BACKEND=ollama
export OLLAMA_URL=http://localhost:11434
export OLLAMA_MODEL=llama3.1
```

Or in `.env` file:

```env
LLM_BACKEND=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

### Start Backend

```bash
cd backend
uvicorn app.main:app --reload
```

## Converting Fine-tuned Model to Ollama

### Option 1: Create Modelfile

Create a `Modelfile`:

```dockerfile
# Base model
FROM llama3.1

# System prompt
SYSTEM """You are an AI that converts natural language instructions into structured JSON action plans.
You must output ONLY a valid JSON object with exactly these fields:
- object: the object to manipulate
- initial_position: where the object currently is
- action: what to do (move, rotate, scale)
- target_position: the destination or target state"""

# Parameters
PARAMETER temperature 0.1
PARAMETER num_predict 128
```

Build the model:

```bash
ollama create text-to-action -f Modelfile
```

### Option 2: Import GGUF

If you have a GGUF model:

```dockerfile
FROM ./text-to-action-merged.gguf

SYSTEM """..."""
```

### Option 3: From LoRA Adapters

1. Merge LoRA adapters with base model
2. Convert to GGUF format
3. Import into Ollama

```python
# Merge adapters
from peft import PeftModel
from transformers import AutoModelForCausalLM

base_model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.1-8B")
model = PeftModel.from_pretrained(base_model, "text-to-action-lora")
merged = model.merge_and_unload()
merged.save_pretrained("text-to-action-merged")
```

Convert to GGUF using [llama.cpp](https://github.com/ggerganov/llama.cpp):

```bash
python convert.py text-to-action-merged --outtype q4_0
```

## Ollama REST API

### Generate

```bash
curl http://localhost:11434/api/generate \
  -d '{
    "model": "text-to-action",
    "prompt": "Move the red box to the blue platform",
    "stream": false
  }'
```

### Chat

```bash
curl http://localhost:11434/api/chat \
  -d '{
    "model": "text-to-action",
    "messages": [
      {"role": "user", "content": "Move the red box"}
    ]
  }'
```

### List Models

```bash
curl http://localhost:11434/api/tags
```

## Python Integration

```python
import requests

def generate_ollama(prompt: str, model: str = "text-to-action") -> str:
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.1,
                "num_predict": 128
            }
        }
    )
    return response.json()["response"]

# Usage
result = generate_ollama("Move the red box to the platform")
print(result)
```

## Performance Optimization

### Quantization Levels

| Format | Size | Speed | Quality |
|--------|------|-------|---------|
| Q4_0 | ~4GB | Fast | Good |
| Q4_K_M | ~4.5GB | Medium | Better |
| Q8_0 | ~8GB | Slower | Best |
| FP16 | ~16GB | Slowest | Original |

### GPU Acceleration

Ollama auto-detects GPU. To force:

```bash
# NVIDIA
CUDA_VISIBLE_DEVICES=0 ollama serve

# AMD (ROCm)
HSA_OVERRIDE_GFX_VERSION=10.3.0 ollama serve
```

### Memory Management

```bash
# Limit VRAM usage
OLLAMA_MAX_VRAM=6000000000 ollama serve  # 6GB
```

## Model Management

```bash
# List models
ollama list

# Show model info
ollama show text-to-action

# Remove model
ollama rm text-to-action

# Copy/rename model
ollama cp text-to-action text-to-action-v2
```

## Troubleshooting

### "Model not found"

```bash
ollama pull llama3.1
# or
ollama list  # Check available models
```

### Out of memory

- Use smaller quantization (Q4_0)
- Reduce context length
- Close other applications

### Slow inference

- Enable GPU acceleration
- Use quantized models
- Reduce `num_predict`

### Connection refused

```bash
# Check if server is running
curl http://localhost:11434/api/tags

# Start server if not running
ollama serve
```

## Comparison: Ollama vs Transformers

| Feature | Ollama | Transformers |
|---------|--------|--------------|
| Setup | Simple | Complex |
| GPU support | Auto | Manual |
| Model formats | GGUF | Many |
| Fine-tuning | Limited | Full |
| Memory | Optimized | Higher |
| API | REST | Python |

## When to Use Ollama

✅ **Use Ollama when:**
- Running locally for privacy
- Limited GPU memory
- Simple deployment needed
- Edge/offline deployment

❌ **Use Transformers when:**
- Fine-tuning required
- Need HuggingFace ecosystem
- Maximum flexibility needed
- Research/experimentation

---

*For cloud deployment, see [colab_api_setup.md](colab_api_setup.md)*
