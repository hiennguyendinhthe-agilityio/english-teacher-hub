# 🐍 Practical Guide: Building an AI Chatbot Backend with Python & FastAPI

Welcome to the in-depth tutorial on **Python & FastAPI**, drawn directly from the real-world source code of the **Ms Van's English Class** project!

This document is crafted as a straightforward learning path, from basics to practical application, helping you master the mindset of modern Backend development.

---

## 📑 Table of Contents
1. [What is FastAPI and why should you learn it?](#1-what-is-fastapi-and-why-should-you-learn-it)
2. [Core structure of a FastAPI project](#2-core-structure-of-a-fastapi-project)
3. [Detailed source code anatomy of `api/index.py`](#3-detailed-source-code-anatomy-of-apiindexpy)
4. [NLP Techniques & Intent Routing Engine in Python](#4-nlp-techniques--intent-routing-engine-in-python)
5. [Running & Debugging Locally with Automated Swagger UI](#5-running--debugging-locally-with-automated-swagger-ui)
6. [Advanced Practical Exercises](#6-advanced-practical-exercises)

---

## 1. What is FastAPI and Why Should You Learn It?

In the Python Backend ecosystem, there are 3 most famous frameworks:
- **Django**: Massive, batteries-included (suitable for traditional monolithic websites).
- **Flask**: Lightweight, flexible but older and lacks native `async/await` support.
- **FastAPI (The most modern 🌟)**: Currently the fastest Python framework, trusted by top AI companies (OpenAI, Microsoft, Uber, Netflix).

### Outstanding advantages of FastAPI:
- ⚡ **High Performance**: On par with NodeJS and Go, powered by `Starlette` and `Pydantic`.
- 🛡️ **Type Safety**: Instantly throws an error if the Client sends malformed JSON data.
- 📖 **Interactive API Docs**: Automatically generates a Swagger UI (`/docs`) page for 1-click API testing without installing Postman.
- 🔀 **Asynchronous Support (`async / await`)**: Handles thousands of concurrent connections without blocking the network.

---

## 2. Core Structure of a FastAPI Project

A standard FastAPI always consists of 4 main components:

```text
+-------------------------------------------------------------+
| 1. App Initialization: app = FastAPI()                      |
+-------------------------------------------------------------+
| 2. Middleware Config (CORS - allows React to call it)       |
+-------------------------------------------------------------+
| 3. Define Schemas (Pydantic BaseModel)                      |
+-------------------------------------------------------------+
| 4. Build Routes / Endpoints (@app.get, @app.post)           |
+-------------------------------------------------------------+
```

---

## 3. Detailed Source Code Anatomy of `api/index.py`

Let's break down each line of code in our Backend file:

### Step 1: Initialization and CORS Configuration
```python
import os
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import httpx
from dotenv import load_dotenv

# Load secret variables from .env file (like GEMINI_API_KEY)
load_dotenv()

app = FastAPI(title="Ms Van's English Class AI Backend")

# CORS (Cross-Origin Resource Sharing): Allows Frontend (React running at localhost:5173 
# or Vercel domain) permission to send data to this Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins securely
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### Step 2: Define Data Types with Pydantic (`BaseModel`)
Pydantic helps cast types and validate data before the code executes:

```python
class ChatMessage(BaseModel):
    role: str  # Must be a string (E.g.: "user" or "ai")
    text: str  # Must be the message content

class ChatRequest(BaseModel):
    history: List[ChatMessage] = [] # List of previous messages (defaults to empty)
    message: str                    # New message just typed by the user
```
> **Why is this important?** If someone sends data missing the `message` field or sends a number instead of a string, FastAPI will automatically return a clear `422 Unprocessable Entity` error, and the server will never crash!

---

### Step 3: Write the Endpoint to Receive Messages (`@app.post("/api/chat")`)
```python
@app.post("/api/chat")
async def chat_with_ai(request: ChatRequest):
    user_msg = request.message.strip()
    
    # Catch error if the user sends an empty string
    if not user_msg:
        raise HTTPException(status_code=400, detail="Message content cannot be empty")

    # Smart processing and return JSON result
    smart_reply = generate_smart_response(user_msg)
    return {"reply": smart_reply}
```
- `async def` keyword: Indicates this is an Asynchronous function, preventing the server from "freezing" during heavy tasks.
- `HTTPException`: FastAPI's standard tool to return HTTP error codes (400: Bad Request, 404: Not Found, 500: Server Error).

---

## 4. NLP Techniques & Intent Routing Engine in Python

In the `generate_smart_response` function, we apply basic but incredibly powerful Natural Language Processing (NLP) techniques:

### 1. Text Normalization
```python
def normalize_text(text: str) -> str:
    # Convert to lowercase and compress multiple consecutive spaces into 1 space
    return re.sub(r'\s+', ' ', text.strip().lower())
```

### 2. Using Regular Expressions (Regex)
Instead of using `if "hi" in msg` (which might accidentally catch words like "chip", "hide"), we use word boundaries `(^|[^\wÀ-ỹ])` to accurately catch individual words, even Vietnamese with diacritics:

```python
greeting_words = ['xin chào', 'chào bạn', 'chào cô', 'chào', 'hello', 'hi']
has_greeting = any(re.search(rf'(^|[^\wÀ-ỹ]){re.escape(w)}([^\wÀ-ỹ]|$)', msg, re.IGNORECASE) for w in greeting_words)
```

### 3. Intent Routing Filter
- **Learning / Features:** Detects keywords like `flashcard`, `prepare lesson`, `unit 1`, `print pdf` -> Returns corresponding feature guide.
- **Grammar:** Detects `present simple`, `a and an`, `comparative` -> Returns easy-to-understand formulas and examples.
- **Off-topic:** Detects `weather`, `math`, `code`, `football` -> Tactfully declines and navigates the user back to learning English.

---

## 5. Running & Debugging Locally with Automated Swagger UI

You can manually start this Python server on your computer at any time:

### Step 1: Activate Virtual Environment
Open Terminal at the project folder and type:
```bash
source backend/venv/bin/activate
```

### Step 2: Run FastAPI Server with Uvicorn
```bash
uvicorn api.index:app --reload --port 8000
```
- `api.index:app`: Finds the `index.py` file in the `api/` directory and loads the `app` variable.
- `--reload`: Automatically restarts the server every time you hit save (Ctrl+S / Cmd+S) in the Python code!
- `--port 8000`: Opens network port 8000.

### Step 3: Experience the "Magic" - Swagger UI
While the server is running, open your web browser and go to the link:
👉 **`http://localhost:8000/docs`**

A beautifully visual interface will appear:
1. You will see the `POST /api/chat` endpoint.
2. Click the **Try it out** button.
3. Enter a test message: `{"message": "guide me on learning vocabulary with flashcards"}`.
4. Click **Execute** and see the JSON result returned instantly!

---

## 6. Advanced Practical Exercises 🎯

To reinforce what you've learned, you can try doing these 2 small exercises yourself:

### Exercise 1: Add a new greeting for the Chatbot
Try opening the `api/index.py` file, find the `greeting_words` array and add new greetings like `'good evening'`, `'good morning'`. Then test it again on Swagger UI to see if the Bot recognizes them!

### Exercise 2: Add a new grammar topic (Past Simple Tense)
Try writing an additional `if` block in the `generate_smart_response` function:
```python
if re.search(r'\b(quá khứ đơn|past simple)\b', msg):
    return (
        "💡 **Past Simple Tense:**\n\n"
        "- Formula: `S + V2/ed + O`\n"
        "- Usage: Describes an action that occurred and finished in the past.\n"
        "- Signals: *yesterday, last week, 2 years ago, in 2020*."
    )
```

---
*Happy learning, and may you quickly become a true Python & FastAPI Master! If any line of code needs further explanation, I am always here to guide you!* 🚀🐍
