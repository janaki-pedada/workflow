# config.py
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

# API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyC4rVgSCZYB7Wu5gSGSwo-vXILS3Rbkark")

# Model Settings
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
LLM_MODEL_NAME = "gemini-1.5-flash"

# Database Settings
CHROMA_DB_PATH = "./chroma_data"