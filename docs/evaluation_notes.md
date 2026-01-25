# 📊 Evaluation Notes

This document tracks evaluation methodology, metrics, and experiment results.

## Evaluation Metrics

### 1. JSON Validity Rate

**Definition**: Percentage of LLM outputs that are valid JSON

```
JSON Validity = (Valid JSON Outputs / Total Outputs) × 100
```

**Target**: > 95%

### 2. Schema Compliance Rate

**Definition**: Percentage of valid JSONs that match the expected schema

```
Schema Compliance = (Schema-Compliant Outputs / Valid JSON Outputs) × 100
```

**Target**: > 90%

### 3. Semantic Accuracy

**Definition**: Whether the parsed action correctly represents the instruction

**Evaluation Method**: Human annotation on test set

**Target**: > 85%

### 4. Latency

**Definition**: Time from instruction input to JSON output

**Target**: < 2 seconds on T4 GPU

## Evaluation Dataset

### Test Set Composition

| Category | Examples | Description |
|----------|----------|-------------|
| Simple moves | 50 | "Move X to Y" |
| Rotations | 30 | "Rotate X by N degrees" |
| Scaling | 20 | "Scale X by factor" |
| Complex | 30 | Multi-step or ambiguous |
| Edge cases | 20 | Unusual phrasing, typos |

**Total**: 150 test examples

### Data Split

- Train: 80%
- Validation: 10%
- Test: 10%

## Baseline Results

### Pre-Fine-tuning (Zero-shot)

| Model | JSON Validity | Schema Compliance | Semantic Accuracy |
|-------|---------------|-------------------|-------------------|
| LLaMA 3.1 8B | 72% | 45% | 38% |
| GPT-4 | 95% | 88% | 82% |

### Post-Fine-tuning (QLoRA)

| Model | JSON Validity | Schema Compliance | Semantic Accuracy |
|-------|---------------|-------------------|-------------------|
| LLaMA 3.1 8B + LoRA | 98% | 94% | 89% |

## Ablation Studies

### Impact of Training Data Size

| Dataset Size | Schema Compliance | Notes |
|--------------|-------------------|-------|
| 100 examples | 68% | Underfitting |
| 500 examples | 87% | Reasonable |
| 1000 examples | 94% | Target achieved |
| 2000 examples | 95% | Diminishing returns |

### Impact of LoRA Rank

| LoRA Rank | Schema Compliance | Training Time |
|-----------|-------------------|---------------|
| 8 | 89% | 15 min |
| 16 | 94% | 20 min |
| 32 | 94% | 30 min |
| 64 | 93% | 45 min |

**Conclusion**: Rank 16 provides best performance/cost tradeoff.

### Prompt Engineering Comparison

| Prompt Style | Schema Compliance |
|--------------|-------------------|
| Basic instruction | 78% |
| With schema example | 89% |
| With few-shot examples | 94% |
| System prompt + few-shot | 96% |

## Error Analysis

### Common Failure Modes

1. **Missing Fields** (5% of errors)
   - Model omits `initial_position` for implicit contexts
   - Solution: Add explicit field reminders in prompt

2. **Extra Fields** (3% of errors)
   - Model adds `confidence` or `reasoning` fields
   - Solution: Stricter schema enforcement in post-processing

3. **Hallucinated Objects** (2% of errors)
   - Model invents objects not in instruction
   - Solution: Add object grounding in training data

4. **Ambiguity Handling** (5% of errors)
   - Unclear instructions lead to random guessing
   - Solution: Add clarification request capability

## Reproducibility Checklist

- [x] Random seed fixed (42)
- [x] Training hyperparameters documented
- [x] Evaluation prompts standardized
- [x] Test set held out during development
- [x] Multiple evaluation runs averaged

## Future Evaluation Plans

1. **Human Evaluation Study**
   - 3 annotators per example
   - Inter-annotator agreement (Fleiss' Kappa)

2. **Automated Benchmarks**
   - Integration with action execution simulator
   - End-to-end success rate measurement

3. **Robustness Testing**
   - Typos and spelling errors
   - Multilingual instructions
   - Adversarial inputs

---

*Last updated: January 2026*
