# 🎯 Text-to-Action LLM

A research-grade system that converts natural language instructions into structured JSON action plans for 3D scene manipulation.

## 🧠 Project Overview

This project demonstrates end-to-end LLM fine-tuning and deployment for instruction-to-action parsing. Given a natural language command like *"Move the red box to the blue platform"*, the system outputs a structured JSON response:

```json
{
  "object": "red box",
  "initial_position": "floor",
  "action": "move",
  "target_position": "top of blue platform"
}
```

## 🏗️ System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│    Backend      │────▶│   Fine-tuned    │
│  (Three.js/JS)  │     │   (FastAPI)     │     │   LLaMA + LoRA  │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
     Visualize              /infer API            Structured JSON
```

See [docs/architecture.md](docs/architecture.md) for detailed system design.

## 📁 Repository Structure

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

## 🚀 Quick Start

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

## 🔬 Research Highlights

- **Model**: LLaMA 3.1 8B with QLoRA adapters
- **Training**: Unsloth for 2x faster fine-tuning
- **Dataset**: Synthetic instruction-action pairs
- **Output**: Pydantic-validated structured JSON

## 📊 Example Use Cases

| Instruction | Output Action |
|-------------|---------------|
| "Move the red box to the platform" | `{"object": "red box", "action": "move", ...}` |
| "Rotate the blue sphere 90 degrees" | `{"object": "blue sphere", "action": "rotate", ...}` |
| "Scale the green cube by 2x" | `{"object": "green cube", "action": "scale", ...}` |

## 🛠️ Future Extensions

- [ ] Multi-object action chaining
- [ ] Animation keyframe generation
- [ ] Real-time voice input
- [ ] Multi-modal scene understanding

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions welcome! Please read the architecture docs before submitting PRs.

---

*Built with ❤️ for LLM research and practical deployment*
