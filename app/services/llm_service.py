# app/services/llm_service.py
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

import google.generativeai as genai
from app.config import GEMINI_API_KEY, LLM_MODEL_NAME
from typing import Optional

# Configure Gemini with default key
genai.configure(api_key=GEMINI_API_KEY)

# app/services/llm_service.py
def call_gemini_llm(question: str, context: Optional[str] = None, 
                   custom_prompt: Optional[str] = None, model_name: Optional[str] = None,
                   api_key: Optional[str] = None):
    """Calls Gemini LLM to generate response with optional model override"""
    
    # Use provided model or default
    model_to_use = model_name or LLM_MODEL_NAME
    
    # Configure API key if provided
    if api_key:
        genai.configure(api_key=api_key)
    
    # Build the prompt
    if custom_prompt:
        # Use custom prompt and replace placeholders
        prompt = custom_prompt.replace("{query}", question)
        if context:
            prompt = prompt.replace("{context}", context)
        else:
            prompt = prompt.replace("{context}", "No relevant context found in the uploaded documents.")
    else:
        # Default prompt
        if context:
            prompt = f"""You are a helpful AI assistant. Use the following context from uploaded documents to answer the user's question. If the context doesn't contain relevant information, say so clearly.

Context from documents:
{context}

User Question: {question}

Please provide a helpful and accurate answer based on the context above."""
        else:
            prompt = f"""You are a helpful AI assistant. Answer the following question to the best of your ability.

User Question: {question}

Please provide a helpful and accurate answer."""
    
    try:
        model = genai.GenerativeModel(model_to_use)
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error calling Gemini LLM: {str(e)}"
    finally:
        # Reset to default API key if we changed it
        if api_key:
            genai.configure(api_key=GEMINI_API_KEY)