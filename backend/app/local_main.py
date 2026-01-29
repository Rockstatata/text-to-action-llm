from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import json
from app.llm.schema import InferenceRequest

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prompt template for single and chained commands with coordinate support
PROMPT_TEMPLATE = """### Instruction:
You are an AI that converts natural language instructions into structured JSON action plans.

For SINGLE actions, output a JSON with these fields:
- object: the object to manipulate (use spaces, not underscores)
- initial_position: where the object currently is (named position or coordinates)
- action: what to do (move, jump, rotate, grow, shrink, fade, bounce, etc.)
- target_position: EITHER a named position (like "left", "center", "top shelf", "red platform") OR coordinates in format "(x, y)" for precise placement

For CHAINED/SEQUENTIAL actions (when instruction contains "then", "after", or multiple steps), output:
{{
  "sequence": [
    {{"object": "...", "initial_position": "...", "action": "...", "target_position": "..."}},
    {{"object": "...", "initial_position": "...", "action": "...", "target_position": "..."}}
  ]
}}

COORDINATE EXAMPLES:
- "move red box to coordinates 200, 300" -> target_position: "(200, 300)"
- "move blue ball to position 400 150" -> target_position: "(400, 150)"
- "slide cube to x 100 y 250" -> target_position: "(100, 250)"

NAMED POSITION EXAMPLES:
- center, left, right, top, bottom
- top left, top right, bottom left, bottom right
- red platform, blue platform, green platform
- table, floor, top shelf

IMPORTANT: 
- Never use underscores (_) in any field values. Always use spaces between words.
- Output ONLY valid JSON, no explanations.

### Input:
{instruction}

### Response:
"""

@app.post("/api/generate")
def generate(request: InferenceRequest):
    prompt = PROMPT_TEMPLATE.format(instruction=request.instruction)
    r = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "action-model",
            "prompt": prompt,
            "stream": False
        }
    )
    response = r.json()
    if "error" in response:
        raise HTTPException(status_code=500, detail=response["error"])
    # Ollama returns {"response": "generated text"}
    generated_text = response.get("response", "")
    # Extract JSON from after "### Response:"
    if "### Response:" in generated_text:
        json_part = generated_text.split("### Response:")[-1].strip()
    else:
        json_part = generated_text.strip()
    # Try to parse as JSON
    try:
        action_plan = json.loads(json_part)
        return action_plan
    except json.JSONDecodeError:
        # Try to extract JSON from the response if there's extra text
        import re
        json_match = re.search(r'\{[\s\S]*\}', json_part)
        if json_match:
            try:
                action_plan = json.loads(json_match.group())
                return action_plan
            except json.JSONDecodeError:
                pass
        return {"error": "Failed to parse model response as JSON", "raw_response": generated_text}

# Alias for /infer endpoint (frontend uses this)
@app.post("/infer")
def infer(request: InferenceRequest):
    return generate(request)


@app.get("/health")
def health_check():
    return {"status": "ok"}
