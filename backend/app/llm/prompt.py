"""
Prompt templates for LLM inference.
"""

SYSTEM_PROMPT = """You are an AI that converts natural language instructions into structured JSON action plans.
You must output ONLY a valid JSON object with exactly these fields:
- object: the object to manipulate (e.g., "red box")
- initial_position: where the object currently is (e.g., "floor")
- action: what to do - must be one of: "move", "rotate", "scale"
- target_position: the destination or target state (e.g., "blue platform")

Do not include any explanation, just the JSON."""

FEW_SHOT_EXAMPLES = [
    {
        "instruction": "Move the red box to the blue platform",
        "output": '{"object": "red box", "initial_position": "floor", "action": "move", "target_position": "blue platform"}'
    },
    {
        "instruction": "Rotate the green sphere 90 degrees clockwise",
        "output": '{"object": "green sphere", "initial_position": "center", "action": "rotate", "target_position": "90 degrees clockwise"}'
    }
]


def format_prompt(instruction: str, include_examples: bool = True) -> str:
    """
    Format instruction into prompt for LLM.
    
    Args:
        instruction: User's natural language instruction
        include_examples: Whether to include few-shot examples
        
    Returns:
        Formatted prompt string
    """
    prompt_parts = [SYSTEM_PROMPT, ""]
    
    if include_examples:
        prompt_parts.append("Examples:")
        for example in FEW_SHOT_EXAMPLES:
            prompt_parts.append(f"\nInstruction: {example['instruction']}")
            prompt_parts.append(f"Output: {example['output']}")
        prompt_parts.append("")
    
    prompt_parts.append(f"Instruction: {instruction}")
    prompt_parts.append("Output:")
    
    return "\n".join(prompt_parts)


def format_chat_prompt(instruction: str) -> list[dict]:
    """
    Format instruction for chat-style models.
    
    Args:
        instruction: User's natural language instruction
        
    Returns:
        List of message dicts for chat API
    """
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT}
    ]
    
    # Add few-shot examples
    for example in FEW_SHOT_EXAMPLES:
        messages.append({"role": "user", "content": example["instruction"]})
        messages.append({"role": "assistant", "content": example["output"]})
    
    # Add current instruction
    messages.append({"role": "user", "content": instruction})
    
    return messages
