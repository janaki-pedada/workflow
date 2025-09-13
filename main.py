# main.py
import sys
import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <-- Add this import

# Add the current directory to Python path
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))

# Initialize FastAPI app
app = FastAPI(title="Knowledge Base API", version="1.0.0")

# Enable CORS - Add this middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your React app's URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Import and include routers
from app.routes import knowledge_base, llm_engine, workflow

app.include_router(knowledge_base.router)
app.include_router(llm_engine.router)
app.include_router(workflow.router)

@app.get("/")
def read_root():
    return {"message": "Knowledge Base API is running!", "version": "1.0.0"}

if __name__ == "__main__":
    # Load embedding model on startup
    print("Loading embedding model...")
    from app.services.embedding_service import embedding_model
    print("Model loaded successfully!")
    
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)