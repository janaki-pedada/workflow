# services/file_processor.py
import fitz  # PyMuPDF
from app.services.embedding_service import generate_embeddings

def extract_text_from_pdf(file_path: str):
    """Extracts text from PDF file"""
    doc = fitz.open(file_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text()
    doc.close()
    return full_text

def chunk_text(text: str, chunk_size: int = 1000):
    """Splits text into chunks"""
    chunks = []
    for i in range(0, len(text), chunk_size):
        chunks.append(text[i:i+chunk_size])
    return chunks

def process_pdf_and_add_to_db(file_path: str, collection):
    """Main pipeline: Text -> Chunks -> Embeddings -> DB"""
    print("Extracting text from PDF...")
    full_text = extract_text_from_pdf(file_path)  # <-- This should work now
    
    print("Chunking text...")
    chunks = chunk_text(full_text)
    
    print(f"Generating embeddings for {len(chunks)} chunks...")
    ids, documents, embeddings = [], [], []
    
    for i, chunk in enumerate(chunks):
        chunk_id = f"chunk_{i}"
        ids.append(chunk_id)
        documents.append(chunk)
        print(f"Getting embedding for chunk {i+1}/{len(chunks)}...")
        embeddings.append(generate_embeddings(chunk))
    
    print("Adding to ChromaDB collection...")
    collection.add(embeddings=embeddings, documents=documents, ids=ids)
    print("PDF processing complete!")
    return len(chunks)