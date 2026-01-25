# 🔧 Backend - FastAPI Inference Server

This directory contains the FastAPI backend for the Text-to-Action LLM.

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run Development Server

```bash
# With mock model (no GPU required)
export LLM_BACKEND=mock
uvicorn app.main:app --reload

# With Ollama
export LLM_BACKEND=ollama
export OLLAMA_MODEL=llama3.1
uvicorn app.main:app --reload

# With Transformers (requires GPU)
export LLM_BACKEND=transformers
export MODEL_PATH=path/to/lora/adapter
uvicorn app.main:app --reload
```

### 3. Test the API

```bash
# Health check
curl http://localhost:8000/health

# Inference
curl -X POST http://localhost:8000/api/infer \
  -H "Content-Type: application/json" \
  -d '{"instruction": "Move the red box to the blue platform"}'
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |
| GET | `/docs` | Swagger UI |
| POST | `/api/infer` | Main inference |

## Project Structure

```
backend/
├── app/
│   ├── main.py          # FastAPI app entry
│   ├── config.py        # Configuration
│   ├── api/
│   │   ├── infer.py     # Inference endpoint
│   │   └── health.py    # Health checks
│   ├── llm/
│   │   ├── model.py     # Model loading
│   │   ├── prompt.py    # Prompt templates
│   │   └── schema.py    # Pydantic schemas
│   └── utils/
│       ├── json_validator.py
│       └── logger.py
└── requirements.txt
```

## Configuration

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_BACKEND` | `mock` | Backend: `mock`, `ollama`, `transformers` |
| `MODEL_PATH` | `text-to-action-lora` | Path to LoRA adapter |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `llama3.1` | Ollama model name |
| `TEMPERATURE` | `0.1` | Generation temperature |
| `LOG_LEVEL` | `INFO` | Logging level |

## Docker

```bash
docker build -t text-to-action-backend .
docker run -p 8000:8000 text-to-action-backend
```

## Testing

```bash
pytest tests/ -v
```

---

*See `/docs` for interactive API documentation*
