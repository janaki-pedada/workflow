# routes/workflow.py
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from app.services.llm_service import call_gemini_llm
from app.utils.database import db_manager  # <-- Import the shared manager

router = APIRouter(prefix="/workflow", tags=["Workflow"])

class WorkflowRequest(BaseModel):
    question: str
    api_key: Optional[str] = None
    model: Optional[str] = None
    custom_prompt: Optional[str] = None

def query_knowledge_base(question: str, collection, n_results: int = 3):
    """Query knowledge base for relevant chunks"""
    from app.services.embedding_service import generate_embeddings
    
    question_embedding = generate_embeddings(question)
    results = collection.query(query_embeddings=[question_embedding], n_results=n_results)
    return results['documents'][0] if results['documents'] else []

@router.post("/full")
async def full_workflow(request: WorkflowRequest):
    """Complete workflow: Query -> Knowledge Base -> LLM -> Output"""
    # Get collection from shared manager
    collection = db_manager.get_collection()
    
    if collection is None:
        raise HTTPException(400, "Please upload a PDF first. Use POST /kb/upload")
    
    try:
        # 1. Get context from knowledge base
        relevant_chunks = query_knowledge_base(request.question, collection)
        context = "\n\n".join(relevant_chunks) if relevant_chunks else None
        
        # 2. Generate answer with LLM (with custom configuration if provided)
        answer = call_gemini_llm(request.question, context, request.custom_prompt, request.model, request.api_key)
        
        # 3. Return final response
        return JSONResponse(content={
            "workflow": "User Query → KnowledgeBase → LLM Engine → Output",
            "question": request.question,
            "context_from_kb": relevant_chunks,
            "final_answer": answer,
            "model_used": request.model or "gemini-1.5-flash",
            "context_found": context is not None
        })
    except Exception as e:
        raise HTTPException(500, f"Workflow error: {str(e)}")