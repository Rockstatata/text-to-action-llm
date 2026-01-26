# Assignment: Text-to-Action Reasoning with Local

# LLaMA

Objective:
Design a system that interprets natural language instructions using a locally deployed LLaMA
model and visualizes object movement through a simple UI.

Task Description:
You will provide a text command describing a spatial manipulation task (e.g., moving an object). A
local LLaMA model must reason over the instruction, convert it into a structured action
representation, and display the action execution using any UI of your choice.

Input:
Natural language instruction describing an object, its initial position, and a target spatial
relationship.
Example: “Move the red box from the floor to the top of the blue platform.”

Model Requirement:
A locally running LLaMA model must infer the object, initial state, action, and target location.
Hardcoded rules are not allowed.

Structured Output:
Model output must be converted into a structured format (e.g., JSON) encoding the object, initial
position, action steps, and target position.

Visualization & Output:
The UI must visually show the movement of the object from its initial position to the target
position. This can be shown through animation, step-wise transitions, or a clear before-and-after
sequence. The transformation must be driven by the structured output generated from the LLaMA
model.

Constraints:

- LLaMA must run locally
- Reasoning must come from the model
- UI accuracy is conceptual, not physical

Evaluation Criteria:
LLM usage, reasoning correctness, structured output clarity, correctness of motion visualization,
and system integration.

Optional Extensions:
Support multiple objects, chained commands, or continuous motion animation.


