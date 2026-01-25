# 🏗️ System Architecture

This document describes the high-level architecture of the Text-to-Action LLM system.

## Overview

The system consists of three main components that work together to convert natural language instructions into executable action plans:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TEXT-TO-ACTION LLM                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐      ┌─────────────────┐      ┌─────────────────────┐   │
│   │   Frontend  │      │     Backend     │      │    LLM Engine       │   │
│   │             │      │                 │      │                     │   │
│   │  ┌───────┐  │      │  ┌───────────┐  │      │  ┌───────────────┐  │   │
│   │  │ UI    │  │─────▶│  │  FastAPI  │  │─────▶│  │ LLaMA 3.1 8B  │  │   │
│   │  │ Layer │  │      │  │  Server   │  │      │  │   + QLoRA     │  │   │
│   │  └───────┘  │      │  └───────────┘  │      │  └───────────────┘  │   │
│   │      │      │      │        │        │      │         │           │   │
│   │      ▼      │      │        ▼        │      │         ▼           │   │
│   │  ┌───────┐  │      │  ┌───────────┐  │      │  ┌───────────────┐  │   │
│   │  │ Scene │  │◀─────│  │  Schema   │  │◀─────│  │ Structured    │  │   │
│   │  │ Render│  │ JSON │  │ Validator │  │      │  │    Output     │  │   │
│   │  └───────┘  │      │  └───────────┘  │      │  └───────────────┘  │   │
│   │             │      │                 │      │                     │   │
│   └─────────────┘      └─────────────────┘      └─────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend Layer

**Purpose**: User interaction and 3D visualization

**Technologies**:
- Vanilla JavaScript
- Three.js (optional for 3D)
- HTML5 Canvas

**Responsibilities**:
- Accept natural language input from user
- Send POST requests to `/infer` endpoint
- Parse JSON response
- Animate scene objects based on action plan

**Key Files**:
- `frontend/index.html` - Main entry point
- `frontend/app.js` - API communication logic
- `frontend/scene.js` - Scene object definitions and animations

### 2. Backend Layer

**Purpose**: API gateway and LLM orchestration

**Technologies**:
- FastAPI
- Pydantic for validation
- Python 3.10+

**Responsibilities**:
- Expose RESTful `/infer` endpoint
- Construct prompts for LLM
- Validate LLM output against schema
- Handle retries on malformed responses
- Error handling and logging

**Module Structure**:
```
backend/app/
├── main.py          # FastAPI app entry
├── api/
│   ├── infer.py     # Inference endpoint
│   └── health.py    # Health check
├── llm/
│   ├── model.py     # Model loading
│   ├── prompt.py    # Prompt templates
│   └── schema.py    # Output schema
└── utils/
    ├── json_validator.py
    └── logger.py
```

### 3. LLM Engine

**Purpose**: Natural language understanding and structured output generation

**Model Configuration**:
- Base Model: `meta-llama/Llama-3.1-8B-Instruct`
- Fine-tuning: QLoRA (4-bit quantization)
- Adapter: LoRA rank 16, alpha 32

**Training Details**:
- Framework: Unsloth (2x speedup)
- Dataset: Custom instruction-action pairs
- Hardware: Single A100 or T4 GPU (Colab compatible)

## Data Flow

### Inference Request

```
1. User types: "Move the red box to the blue platform"
                        │
                        ▼
2. Frontend sends POST /infer
   {
     "instruction": "Move the red box to the blue platform"
   }
                        │
                        ▼
3. Backend constructs prompt:
   "Given the instruction, output a JSON action plan..."
                        │
                        ▼
4. LLM generates structured output
   {
     "object": "red box",
     "initial_position": "floor",
     "action": "move",
     "target_position": "top of blue platform"
   }
                        │
                        ▼
5. Backend validates against Pydantic schema
                        │
                        ▼
6. Frontend receives JSON, animates scene
```

## API Specification

### POST /infer

**Request**:
```json
{
  "instruction": "string"
}
```

**Response** (200 OK):
```json
{
  "object": "string",
  "initial_position": "string",
  "action": "string",
  "target_position": "string"
}
```

**Error Response** (422):
```json
{
  "detail": "Validation error message"
}
```

### GET /health

**Response** (200 OK):
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

## Deployment Options

### Option 1: Colab + ngrok (Development)

Best for: Quick prototyping, free GPU access

```
Colab (GPU) ──ngrok tunnel──▶ Public URL ◀── Frontend
```

### Option 2: Cloud VM (Production)

Best for: Persistent deployment, low latency

```
AWS/GCP VM (GPU) ◀── Frontend (same server or CDN)
```

### Option 3: Ollama (Local)

Best for: Privacy, offline usage, edge deployment

```
Local Ollama ◀── Local Frontend
```

## Security Considerations

1. **Input Sanitization**: All instructions are sanitized before prompt construction
2. **Rate Limiting**: Backend implements rate limiting to prevent abuse
3. **Schema Validation**: Pydantic enforces strict output format
4. **API Keys**: Optional authentication for production deployment

## Performance Optimization

1. **Model Quantization**: 4-bit QLoRA reduces memory by 75%
2. **KV-Cache**: Enabled for faster generation
3. **Batching**: Optional batch inference for high throughput
4. **Caching**: Repeated instructions can be cached

## Extensibility

The architecture is designed for easy extension:

| Extension | Changes Required |
|-----------|------------------|
| Multi-object actions | Extend schema to list |
| Animation keyframes | Add keyframe field to schema |
| Voice input | Add speech-to-text in frontend |
| Multi-modal | Add vision encoder to LLM |

---

*Last updated: January 2026*
