# Text-to-Action LLM

A research-grade system that converts natural language instructions into structured JSON action plans for scene manipulation, with support for **chained commands** and **continuous motion animation**.

## Project Overview

This project demonstrates end-to-end LLM fine-tuning and deployment for instruction-to-action parsing. Given a natural language command, the system outputs a structured JSON response:

**Single Action:**
```json
{
  "object": "red box",
  "initial_position": "floor",
  "action": "move",
  "target_position": "blue platform"
}
```

**Chained Commands:**
```json
{
  "sequence": [
    {"object": "red box", "initial_position": "floor", "action": "move", "target_position": "top shelf"},
    {"object": "green sphere", "initial_position": "center", "action": "rotate", "target_position": "90 degrees"}
  ]
}
```

## Features

- **LLM Reasoning**: Model infers objects, actions, and positions - no hardcoded rules
- **Chained Commands**: Support for sequential multi-step actions ("then", "after")
- **Smooth Animation**: Continuous motion visualization with easing
- **Dynamic Objects**: Create/remove objects at runtime
- **Modern UI**: Clean, responsive interface with execution logs

## System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────>│    Backend      │────>│   Fine-tuned    │
│  (Three.js/JS)  │     │   (FastAPI)     │     │   LLaMA + LoRA  │
│                 │<────│                 │<────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
     Visualize              /infer API            Structured JSON
```

See [docs/architecture.md](docs/architecture.md) for detailed system design.

## Repository Structure

```
text-to-action-llm/
├── research/          # ML experiments, notebooks, datasets
│   ├── colab/         # Training & inference notebooks
│   ├── data/          # Instruction-action datasets
│   └── experiments/   # Ablation studies & notes
├── backend/           # FastAPI inference server
│   └── app/           # API, LLM modules, utilities
├── frontend/          # 3D visualization (vanilla JS)
└── deployment/        # Setup guides for Colab, ngrok, Ollama
```

## Complete Workflow

The system follows a 5-phase pipeline from data generation to interactive visualization. The diagram below shows the full flow from dataset generation and fine-tuning through deployment and frontend visualization.

![Complete Workflow](docs/Flow%20Diagram.png)

*Figure: End-to-end system workflow from data generation to interactive visualization.*

## Quick Start

### 1. Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. Frontend

Open `frontend/index.html` in a browser, or serve with:

```bash
cd frontend
python -m http.server 8080
```

### 3. Training (Colab)

Open `research/colab/finetune_llama31_unsloth.ipynb` in Google Colab with GPU runtime.

## Research Highlights

- **Model**: LLaMA 3.1 8B with QLoRA adapters
- **Training**: Unsloth for 2x faster fine-tuning
- **Dataset**: Synthetic instruction-action pairs
- **Output**: Pydantic-validated structured JSON

## Example Use Cases

| Instruction | Output Action |
|-------------|---------------|
| "Move the red box to the platform" | `{"object": "red box", "action": "move", ...}` |
| "Rotate the blue sphere 90 degrees" | `{"object": "blue sphere", "action": "rotate", ...}` |
| "Scale the green cube by 2x" | `{"object": "green cube", "action": "scale", ...}` |
| "Move red box to shelf, then rotate blue sphere" | `{"sequence": [{...}, {...}]}` |

## Assignment Requirements

| Requirement | Implementation |
|-------------|----------------|
| LLM runs locally | Yes - Ollama + fine-tuned LLaMA |
| Model reasoning (no hardcoding) | Yes - LLM infers all actions |
| Structured JSON output | Yes - Pydantic-validated |
| Motion visualization | Yes - Canvas animation |
| Multiple objects | Yes - Sequence-based |
| Chained commands | Yes - Async/await execution |
| Continuous animation | Yes - requestAnimationFrame |

## Future Extensions

- [ ] Animation keyframe generation
- [ ] Real-time voice input
- [ ] Multi-modal scene understanding

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions welcome! Please read the architecture docs before submitting PRs.

---

Built for LLM research and practical deployment
