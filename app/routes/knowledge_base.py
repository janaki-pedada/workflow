# app/routes/knowledge_base.py
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import secrets
from app.services.file_processor import process_pdf_and_add_to_db
from app.utils.database import db_manager

router = APIRouter(prefix="/kb", tags=["Knowledge Base"])

@router.post("/upload")
async def upload_and_process_file(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(400, "File must be a PDF")
    
    temp_file_path = f"temp_{file.filename}"
    
    try:
        # Save uploaded file
        with open(temp_file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Create collection using the shared manager
        collection_name = f"kb_{secrets.token_hex(8)}"
        collection = db_manager.create_collection(collection_name)
        
        # Process PDF
        chunk_count = process_pdf_and_add_to_db(temp_file_path, collection)
        
        return JSONResponse(
            content={
                "message": "File processed successfully!",
                "collection_name": collection_name,
                "chunks_added": chunk_count
            },
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true"
            }
        )
    except Exception as e:
        raise HTTPException(500, f"An error occurred: {str(e)}")
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)