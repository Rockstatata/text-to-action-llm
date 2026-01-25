# 📁 Dataset Documentation

## Overview

This directory contains the instruction-to-action dataset for fine-tuning the Text-to-Action LLM.

## Files

| File | Purpose | Examples |
|------|---------|----------|
| `train.jsonl` | Training data | ~800 |
| `val.jsonl` | Validation data | ~100 |
| `test.jsonl` | Held-out test set | ~100 |

## Format

Each line is a JSON object with two fields:

```json
{
  "instruction": "Move the red box to the blue platform",
  "output": "{\"object\": \"red box\", \"initial_position\": \"floor\", \"action\": \"move\", \"target_position\": \"blue platform\"}"
}
```

### Output Schema

| Field | Type | Description |
|-------|------|-------------|
| `object` | string | The object being manipulated |
| `initial_position` | string | Current location of the object |
| `action` | string | Action type: `move`, `rotate`, `scale` |
| `target_position` | string | Destination or target state |

## Vocabulary

### Objects
- **Colors**: red, blue, green, yellow, purple, orange, white, black
- **Shapes**: box, cube, sphere, ball, cylinder, cone, pyramid

### Positions
- Ground: floor, ground, center, origin
- Surfaces: table, desk, pedestal
- Platforms: blue platform, red platform, green platform
- Shelves: top shelf, bottom shelf
- Corners: left corner, right corner

### Actions
- **move**: Relocate object to new position
- **rotate**: Spin object by specified degrees
- **scale**: Resize object by factor

## Generation

Dataset was generated using `research/colab/dataset_generation.ipynb`.

### Parameters
- Random seed: 42
- Total examples: 1000
- Train/Val/Test split: 80/10/10

## Quality Notes

1. All outputs are valid JSON
2. All outputs conform to the schema
3. Instructions vary in phrasing (templates + synonyms)
4. Balanced action distribution (~33% each)

## Future Improvements

- [ ] Add multi-object instructions
- [ ] Include edge cases (typos, ambiguity)
- [ ] Augment with LLM paraphrasing
- [ ] Add human-verified examples

---

*Generated: January 2026*
