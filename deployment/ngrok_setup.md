# 🔗 ngrok Setup Guide

ngrok creates secure tunnels to expose your local server to the internet.

## What is ngrok?

ngrok provides:
- Public URLs for local servers
- HTTPS encryption
- Request inspection
- Custom domains (paid)

## Quick Start

### 1. Create Account

Sign up at [ngrok.com](https://ngrok.com) (free tier available).

### 2. Get Auth Token

Go to [dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)

### 3. Install ngrok

**Option A: Download binary**
```bash
# Windows
choco install ngrok

# macOS
brew install ngrok

# Linux
snap install ngrok
```

**Option B: Python package**
```bash
pip install pyngrok
```

### 4. Authenticate

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

Or in Python:
```python
from pyngrok import ngrok
ngrok.set_auth_token("YOUR_AUTH_TOKEN")
```

## Usage

### Command Line

```bash
# Expose local port 8000
ngrok http 8000

# With custom subdomain (paid)
ngrok http 8000 --subdomain=myapi

# With basic auth
ngrok http 8000 --basic-auth="user:password"
```

### Python (pyngrok)

```python
from pyngrok import ngrok

# Create tunnel
public_url = ngrok.connect(8000)
print(f"Public URL: {public_url}")

# With options
tunnel = ngrok.connect(
    addr=8000,
    proto="http",
    bind_tls=True  # HTTPS only
)

# List tunnels
tunnels = ngrok.get_tunnels()

# Close tunnel
ngrok.disconnect(public_url)

# Kill all tunnels
ngrok.kill()
```

## Integration with FastAPI

### In Colab

```python
import nest_asyncio
from threading import Thread
import uvicorn
from pyngrok import ngrok

nest_asyncio.apply()

# Start FastAPI
from app.main import app

def run_server():
    uvicorn.run(app, host="0.0.0.0", port=8000)

thread = Thread(target=run_server, daemon=True)
thread.start()

# Wait for server to start
import time
time.sleep(2)

# Create tunnel
public_url = ngrok.connect(8000)
print(f"🚀 API: {public_url}")
```

### Programmatic Startup

```python
# In your backend/app/main.py
import os
from pyngrok import ngrok

def start_ngrok():
    if os.getenv("ENABLE_NGROK", "false").lower() == "true":
        auth_token = os.getenv("NGROK_AUTH_TOKEN")
        if auth_token:
            ngrok.set_auth_token(auth_token)
            public_url = ngrok.connect(8000)
            print(f"ngrok tunnel: {public_url}")
            return public_url
    return None
```

## Frontend Configuration

Update your frontend to use the ngrok URL:

```javascript
// frontend/app.js
const CONFIG = {
    // Development (local)
    // apiUrl: 'http://localhost:8000',
    
    // Production (ngrok)
    apiUrl: 'https://abc123.ngrok-free.app',
};
```

### Dynamic URL Detection

```javascript
// Detect if running locally or through ngrok
const CONFIG = {
    apiUrl: window.location.hostname === 'localhost' 
        ? 'http://localhost:8000'
        : 'https://your-ngrok-url.ngrok-free.app'
};
```

## ngrok Free Tier Limitations

| Feature | Free | Paid |
|---------|------|------|
| Tunnels | 1 | Unlimited |
| Bandwidth | 1 GB/month | Higher |
| Custom domains | ❌ | ✅ |
| Reserved domains | ❌ | ✅ |
| IP whitelisting | ❌ | ✅ |

## Security Best Practices

### 1. Use Authentication

```bash
ngrok http 8000 --basic-auth="user:password"
```

Or add API key validation in FastAPI:

```python
from fastapi import Security, HTTPException
from fastapi.security.api_key import APIKeyHeader

api_key_header = APIKeyHeader(name="X-API-Key")

async def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != os.getenv("API_KEY"):
        raise HTTPException(status_code=403)
    return api_key
```

### 2. Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/infer")
@limiter.limit("10/minute")
async def infer(request: Request):
    ...
```

### 3. CORS Configuration

```python
# Only allow your frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend.com"],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)
```

## Troubleshooting

### "Too many connections"

Free tier limit reached. Wait or upgrade.

### URL keeps changing

Free tier URLs are random. Use paid tier for reserved domains.

### Connection refused

```bash
# Check if local server is running
curl http://localhost:8000/health

# Check ngrok status
ngrok status
```

### Timeout errors

Increase timeout in frontend:

```javascript
const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(30000)  // 30s timeout
});
```

## Alternatives to ngrok

| Tool | Free Tier | Notes |
|------|-----------|-------|
| [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/) | Yes | Requires domain |
| [localtunnel](https://localtunnel.github.io/www/) | Yes | Open source |
| [Tailscale Funnel](https://tailscale.com/kb/1223/tailscale-funnel/) | Yes | VPN-based |
| [serveo](https://serveo.net/) | Yes | SSH-based |

---

*See also: [colab_api_setup.md](colab_api_setup.md) for Colab integration*
