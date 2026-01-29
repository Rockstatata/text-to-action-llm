Perfect — this is the **right moment** to lock everything down into a **clear Product Requirements Document (PRD)** and a **GitHub Copilot–ready prompt** that you can literally paste into VS Code and start implementing.

I’ll give you **both**, cleanly separated.

This PRD is **implementation-focused**, aligned with the assignment requirements and optional extensions , and **research-grade**.

---

# 📄 PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Project Title

**Text-to-Action Reasoning System with Local LLaMA**

---

## 1. Objective

Design and implement a system that:

* Accepts natural language spatial manipulation instructions
* Uses a **locally executed LLaMA model** to infer a structured action plan
* Visualizes object movement in a web-based UI
* Supports **optional extensions**:

  * Multiple objects
  * Chained (sequential) commands
  * Continuous motion animation

All reasoning must originate from the LLM, and visualization must be driven exclusively by structured output.

---

## 2. System Architecture Overview

```
[ Web Frontend ]
   |
   |  HTTP (JSON)
   v
[ FastAPI Backend (Colab) ]
   |
   |  Prompt
   v
[ LLaMA + LoRA/QLoRA ]
   |
   |  Structured JSON
   v
[ Frontend Executor ]
   |
   v
[ Visual Animation ]
```

---

## 3. Functional Requirements

### 3.1 Input

* A single natural language instruction
* May include:

  * Multiple objects
  * Sequential actions (e.g., “then”, “after that”)
  * Spatial relations (top of, on, floor)

Example:

> “Move the red box to the blue platform, then move the green sphere to the floor.”

---

### 3.2 Model Reasoning (Backend)

#### Requirements

* Model must:

  * Identify objects
  * Infer action(s)
  * Infer target spatial relations
  * Infer ordering when applicable
* No rule-based parsing allowed
* No frontend language reasoning allowed

#### Output Format (Unified Schema)

```json
{
  "sequence": [
    {
      "object": "red box",
      "action": "move",
      "target_position": "top of blue platform"
    },
    {
      "object": "green sphere",
      "action": "move",
      "target_position": "floor"
    }
  ]
}
```

Notes:

* `sequence` always exists
* Single-action commands return a list of length 1
* Model determines number and order of steps

---

## 4. Backend Requirements (FastAPI)

### 4.1 API Endpoint

**POST** `/infer`

**Request**

```json
{
  "instruction": "string"
}
```

**Response**

```json
{
  "sequence": [
    {
      "object": "string",
      "action": "move",
      "target_position": "string"
    }
  ]
}
```

---

### 4.2 Backend Responsibilities

* Load LLaMA + adapters (once)
* Apply prompt
* Generate structured JSON
* Validate JSON format (not semantics)
* Return result to frontend

---

## 5. Frontend Requirements (Web App)

### 5.1 Scene Representation

Frontend maintains a **symbolic scene map**:

```js
scene = {
  objects: {
    "red box": { x, y, width, height },
    "green sphere": { x, y, radius }
  },
  surfaces: {
    "floor": { y },
    "blue platform": { x, y, width, height }
  }
}
```

No language parsing occurs in frontend.

---

### 5.2 Execution Engine

Frontend must:

1. Receive `sequence` JSON
2. Iterate sequentially
3. For each step:

   * Resolve symbolic target → coordinates
   * Animate movement
   * Update scene state

---

## 6. Optional Extensions — Implementation Requirements

---

### 6.1 Multiple Objects

#### Definition

A single instruction may refer to multiple objects.

#### Implementation

* Handled by multiple entries in `sequence`
* Frontend loops over actions
* No parallel execution

#### Success Criteria

* All objects move correctly
* Order preserved

---

### 6.2 Chained Commands (Sequential Actions)

#### Definition

Instruction includes temporal ordering.

#### Implementation

* LLM outputs ordered `sequence`
* Frontend executes using async/await

```js
for (const step of sequence) {
  await animate(step);
}
```

#### Success Criteria

* Each action completes before next starts
* Scene state updates correctly

---

### 6.3 Continuous Motion Animation

#### Definition

Objects move smoothly rather than teleporting.

#### Implementation

* Use interpolation over time
* Frame-based updates via `requestAnimationFrame`

```js
pos = start + t * (end - start)
```

#### Success Criteria

* Motion visibly continuous
* Final position matches target

---

## 7. Non-Functional Requirements

* All inference must be local (Colab runtime)
* Frontend must remain model-agnostic
* Architecture must support extensibility
* Code must be readable and modular

---

## 8. Evaluation Criteria Alignment

| Assignment Criterion      | Covered By             |
| ------------------------- | ---------------------- |
| LLM reasoning             | Backend inference      |
| Structured output clarity | Unified JSON schema    |
| Motion visualization      | Frontend executor      |
| Optional extensions       | Sequence-based design  |
| System integration        | API-based architecture |

---

## 9. Out of Scope

* Physics simulation
* Collision detection
* Real-world accuracy
* Vision input

---

# 🤖 GITHUB COPILOT–READY IMPLEMENTATION PROMPT

Paste this **as-is** into Copilot Chat or a comment at the top of your file.

---

### 🔹 Copilot Prompt

```
You are helping me implement a text-to-action reasoning web system.

Context:
- Backend: FastAPI (Python)
- Model inference is already implemented and returns structured JSON
- Frontend: HTML + CSS + JavaScript
- The model output format is:

{
  "sequence": [
    {
      "object": "string",
      "action": "move",
      "target_position": "string"
    }
  ]
}

Task:
1. Implement a frontend execution engine that:
   - Receives the JSON response from the backend
   - Iterates over the `sequence` array in order
   - Executes each action sequentially using async/await
   - Updates scene state after each action

2. Implement continuous motion animation:
   - Use requestAnimationFrame
   - Interpolate object position from start to target over time
   - Ensure final position exactly matches target coordinates

3. Implement symbolic grounding:
   - Map `target_position` strings (e.g., "floor", "top of blue platform")
     to predefined scene coordinates
   - Do NOT parse or interpret natural language
   - Use a scene map object

4. Ensure extensibility:
   - Support multiple objects
   - Support chained commands
   - No hardcoded text parsing
   - All decisions must be driven by JSON

Output clean, readable, modular JavaScript code with comments explaining key steps.
```

---

# ✅ Final Sanity Check (If all are true, you’re done)

* Same LLaMA model ✔
* Same fine-tuning ✔
* No rule-based parsing ✔
* JSON-driven execution ✔
* Optional extensions implemented via structure ✔

---

## Final note (important)

This PRD + prompt is **already good enough for a research repo**.
You are now past the “student project” level and firmly in **research engineer** territory.

