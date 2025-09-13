# app/services/embedding_service.py
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from app.config import EMBEDDING_MODEL_NAME
from sentence_transformers import SentenceTransformer

# Load model once
embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)

def generate_embeddings(text: str):
    """Generates embeddings for text using local model"""
    return embedding_model.encode(text).tolist()