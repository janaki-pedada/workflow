## utils/database.py
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.config import CHROMA_DB_PATH
import chromadb

class DatabaseManager:
    # ... rest of the code remains the same ...
    def __init__(self):
        self.client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
        self.knowledge_base_collection = None
        self.current_collection_name = None
    
    def create_collection(self, name: str):
        """Create a new collection and set it as current"""
        self.knowledge_base_collection = self.client.create_collection(name=name)
        self.current_collection_name = name
        return self.knowledge_base_collection
    
    def get_collection(self):
        """Get the current collection"""
        return self.knowledge_base_collection
    
    def has_collection(self):
        """Check if a collection exists"""
        return self.knowledge_base_collection is not None

# Create a single instance shared across the app
db_manager = DatabaseManager()