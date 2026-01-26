import torch
from fastapi import APIRouter, HTTPException
import logging

from app.llm.model import get_model, get_tokenizer # Corrected import
from app.llm.schema import ActionPlan, InferenceRequest # Assuming these exist
from app.utils.json_validator import validate_and_parse_json # Assuming this exists

logger = logging.getLogger('text-to-action')
router = APIRouter()

# Define the PROMPT_TEMPLATE here, as it's specific to the model's expected input
PROMPT_TEMPLATE = """### Instruction:
You are an AI that converts natural language instructions into structured JSON action plans.
Given the following instruction, output a valid JSON with these fields:
- object: the object to manipulate
- initial_position: where the object currently is
- action: what to do (move, rotate, scale)
- target_position: the destination or target state

### Input:
{instruction}

### Response:
{output}"""

async def perform_inference(instruction: str) -> str:
    model = get_model()
    tokenizer = get_tokenizer()

    if model is None or tokenizer is None:
        logger.error("LLM model or tokenizer not loaded.")
        raise HTTPException(status_code=500, detail="LLM model or tokenizer not loaded.")

    test_prompt = PROMPT_TEMPLATE.format(
        instruction=instruction,
        output="" # Expecting model to fill this
    )

    inputs = tokenizer(test_prompt, return_tensors="pt").to("cuda")

    outputs = model.generate(
        **inputs,
        max_new_tokens=128,
        temperature=0.1,
        do_sample=True,
    )

    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    json_output_start = response.find("### Response:")
    if json_output_start != -1:
        extracted_json = response[json_output_start + len("### Response:"):].strip()
        # Further clean up if there's any text after the JSON (e.g., EOS tokens)
        if extracted_json.endswith("<|end_of_text|>"):
            extracted_json = extracted_json.replace("<|end_of_text|>", "").strip()
        if extracted_json.endswith("<|eot_id|>"):
            extracted_json = extracted_json.replace("<|eot_id|>", "").strip()
        return extracted_json
    return response # Fallback if response format is unexpected

@router.post("/infer", response_model=ActionPlan)
async def infer_action(request: InferenceRequest):
    logger.info(f"Received instruction: {request.instruction}")
    try:
        raw_json_output = await perform_inference(request.instruction) # Use the new function
        validated_json = validate_and_parse_json(raw_json_output)
        return validated_json # Changed from ActionPlan(**validated_json)
    except Exception as e:
        logger.error(f"Inference error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")
