# 🧪 Ablation Study Notes

This document tracks ablation experiments and their findings.

## Experiment Log

### Experiment 1: LoRA Rank Comparison

**Date**: January 2026

**Hypothesis**: Higher LoRA rank improves schema compliance but increases training time.

**Setup**:
- Base model: LLaMA 3.1 8B
- Dataset: 1000 examples
- Other hyperparameters fixed

**Results**:

| LoRA Rank | Schema Compliance | Training Time | Memory |
|-----------|-------------------|---------------|--------|
| 4 | 82% | 12 min | 8.2 GB |
| 8 | 89% | 15 min | 8.5 GB |
| 16 | 94% | 20 min | 9.1 GB |
| 32 | 94% | 30 min | 10.2 GB |
| 64 | 93% | 45 min | 12.8 GB |

**Conclusion**: Rank 16 provides optimal tradeoff. Higher ranks don't improve accuracy but increase cost.

---

### Experiment 2: Dataset Size Impact

**Date**: January 2026

**Hypothesis**: More training data improves generalization.

**Results**:

| Dataset Size | Schema Compliance | Generalization Score |
|--------------|-------------------|---------------------|
| 100 | 68% | Poor |
| 250 | 79% | Fair |
| 500 | 87% | Good |
| 1000 | 94% | Good |
| 2000 | 95% | Good |

**Conclusion**: 1000 examples sufficient for our vocabulary. Diminishing returns beyond that.

---

### Experiment 3: Prompt Engineering

**Date**: January 2026

**Hypothesis**: Better prompts reduce fine-tuning requirements.

**Variations Tested**:

1. **Basic**: Just instruction
2. **Schema Description**: Include JSON schema in prompt
3. **Few-shot**: Add 2 examples in prompt
4. **System + Few-shot**: Full system prompt + examples

**Results (on base model, no fine-tuning)**:

| Prompt Style | JSON Validity | Schema Compliance |
|--------------|---------------|-------------------|
| Basic | 45% | 22% |
| Schema Description | 72% | 51% |
| Few-shot | 85% | 68% |
| System + Few-shot | 91% | 76% |

**Conclusion**: Good prompts are essential baseline. Fine-tuning still needed for production (94%+).

---

### Experiment 4: Learning Rate Sensitivity

**Date**: January 2026

**Results**:

| Learning Rate | Final Loss | Schema Compliance |
|---------------|------------|-------------------|
| 1e-5 | 0.42 | 78% (underfitting) |
| 5e-5 | 0.21 | 89% |
| 2e-4 | 0.12 | 94% |
| 5e-4 | 0.08 | 91% |
| 1e-3 | 0.15 | 85% (overfitting) |

**Conclusion**: 2e-4 is optimal for QLoRA on this task.

---

### Experiment 5: Temperature Effects

**Date**: January 2026

**Hypothesis**: Lower temperature improves JSON validity.

**Results (at inference)**:

| Temperature | JSON Validity | Output Diversity |
|-------------|---------------|------------------|
| 0.0 (greedy) | 99% | Very low |
| 0.1 | 98% | Low |
| 0.3 | 95% | Medium |
| 0.7 | 88% | High |
| 1.0 | 72% | Very high |

**Conclusion**: Use temperature 0.1 for structured output. Determinism preferred.

---

## Planned Experiments

- [ ] Quantization impact (4-bit vs 8-bit vs 16-bit)
- [ ] Alternative base models (Mistral, Qwen)
- [ ] Multi-task training (action parsing + validation)
- [ ] Instruction augmentation with GPT-4

---

## Hardware Notes

All experiments run on:
- Google Colab Pro
- NVIDIA T4 (16GB) or A100 (40GB)
- Training time scales linearly with dataset size

---

*Last updated: January 2026*
