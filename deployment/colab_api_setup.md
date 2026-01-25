# 🚀 Colab API Setup Guide

This guide explains how to run the FastAPI backend in Google Colab with GPU support.

## Why Colab?

- **Free GPU access** (T4, L4, or A100)
- **No local GPU required**
- **Easy to share and reproduce**

## Step-by-Step Setup

### 1. Create New Colab Notebook

Go to [Google Colab](https://colab.research.google.com) and create a new notebook.

### 2. Enable GPU Runtime

```
Runtime → Change runtime type → GPU (T4)
```

### 3. Install Dependencies

```python
!pip install -q fastapi uvicorn pyngrok
!pip install -q transformers accelerate bitsandbytes peft
!pip install -q unsloth
```

### 4. Upload or Clone Your Code

```python
# Option 1: Clone from GitHub
!git clone https://github.com/your-username/text-to-action-llm.git
%cd text-to-action-llm/backend

# Option 2: Upload files manually
from google.colab import files
uploaded = files.upload()
```

### 5. Set Up ngrok for Public Access

```python
from pyngrok import ngrok

# Set your ngrok auth token (get from https://dashboard.ngrok.com)
ngrok.set_auth_token("YOUR_NGROK_AUTH_TOKEN")
```

### 6. Load the Model

```python
import sys
sys.path.append('/content/text-to-action-llm/backend')

from app.llm.model import load_model
load_model()
```

### 7. Start FastAPI Server

```python
import nest_asyncio
import uvicorn
from threading import Thread

nest_asyncio.apply()

# Import your app
from app.main import app

# Start uvicorn in background thread
def run():
    uvicorn.run(app, host="0.0.0.0", port=8000)

thread = Thread(target=run, daemon=True)
thread.start()
```

### 8. Create Public URL

```python
# Create public URL
public_url = ngrok.connect(8000)
print(f"🚀 Public URL: {public_url}")
print(f"📚 API Docs: {public_url}/docs")
```

### 9. Test the API

```python
import requests

response = requests.post(
    f"{public_url}/api/infer",
    json={"instruction": "Move the red box to the blue platform"}
)
print(response.json())
```

## Complete Colab Cell

Here's everything in one cell:

```python
# ============================================
# Text-to-Action LLM - Colab API Setup
# ============================================

# 1. Install dependencies
!pip install -q fastapi uvicorn pyngrok nest_asyncio
!pip install -q transformers accelerate bitsandbytes peft

# 2. Clone repo
!git clone https://github.com/your-username/text-to-action-llm.git
%cd text-to-action-llm/backend

# 3. Setup ngrok
from pyngrok import ngrok
ngrok.set_auth_token("YOUR_TOKEN")  # Replace with your token

# 4. Start server
import nest_asyncio
import uvicorn
from threading import Thread
import sys

sys.path.append('/content/text-to-action-llm/backend')
nest_asyncio.apply()

from app.main import app

def run():
    uvicorn.run(app, host="0.0.0.0", port=8000)

Thread(target=run, daemon=True).start()

# 5. Create tunnel
import time
time.sleep(2)  # Wait for server
public_url = ngrok.connect(8000)
print(f"\n🚀 API is live at: {public_url}")
print(f"📚 Swagger docs: {public_url}/docs")
```

## Connecting Frontend

Update your frontend's `app.js`:

```javascript
const CONFIG = {
    apiUrl: 'https://xxxx-xx-xxx-xxx-xx.ngrok-free.app',  // Your ngrok URL
    // ...
};
```

## Troubleshooting

### "Address already in use"

```python
!kill -9 $(lsof -t -i:8000)
```

### ngrok connection issues

```python
# Check ngrok status
ngrok.get_tunnels()

# Kill existing tunnels
ngrok.kill()
```

### Model loading OOM

Use 4-bit quantization:

```python
# In config or environment
os.environ["LOAD_IN_4BIT"] = "true"
```

## Session Persistence

Colab sessions timeout after ~12 hours. For longer uptime:

1. Use Colab Pro for longer sessions
2. Implement auto-reconnect in frontend
3. Consider a cloud VM for production

---

*See also: [ngrok_setup.md](ngrok_setup.md) for detailed ngrok configuration*
