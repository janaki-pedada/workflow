# app/routes/llm_engine.py
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
from pydantic import BaseModel
from app.services.llm_service import call_gemini_llm
import google.generativeai as genai  # Add this import

router = APIRouter(prefix="/llm", tags=["LLM Engine"])

class LLMRequest(BaseModel):
    question: str
    context: Optional[str] = None
    custom_prompt: Optional[str] = None
    api_key: Optional[str] = None
    model: Optional[str] = None

@router.post("/query")
async def llm_query(request: LLMRequest):
    """LLM Engine endpoint with optional API key and model"""
    try:
        # Call the LLM service with the provided API key
        answer = call_gemini_llm(request.question, request.context, request.custom_prompt, request.model, request.api_key)
            
        return JSONResponse(content={
            "success": True,
            "question": request.question,
            "answer": answer,
            "context_used": request.context is not None
        })
    except Exception as e:
        raise HTTPException(500, f"LLM Error: {str(e)}")