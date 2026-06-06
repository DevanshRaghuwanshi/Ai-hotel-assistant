import os
import chromadb
from sentence_transformers import SentenceTransformer
from pypdf import PdfReader

# Setup
client = chromadb.PersistentClient(path="./chroma_db")
model = SentenceTransformer('all-MiniLM-L6-v2')

# Delete collection if exists and create fresh
try:
    client.delete_collection("hotel_docs")
except:
    pass

collection = client.create_collection("hotel_docs")

def read_file(filepath):
    if filepath.endswith('.pdf'):
        reader = PdfReader(filepath)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text
    else:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()

def chunk_text(text, chunk_size=500):
    words = text.split()
    chunks = []
    current_chunk = []
    current_size = 0
    
    for word in words:
        current_chunk.append(word)
        current_size += len(word)
        if current_size >= chunk_size:
            chunks.append(' '.join(current_chunk))
            current_chunk = []
            current_size = 0
    
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    return chunks

# Process all files in documents folder
documents_path = "./documents"
all_chunks = []
all_ids = []
all_metadata = []

for filename in os.listdir(documents_path):
    filepath = os.path.join(documents_path, filename)
    print(f"Processing {filename}...")
    
    text = read_file(filepath)
    chunks = chunk_text(text)
    
    for i, chunk in enumerate(chunks):
        all_chunks.append(chunk)
        all_ids.append(f"{filename}_chunk_{i}")
        all_metadata.append({"source": filename})

# Generate embeddings and store
print("Generating embeddings...")
embeddings = model.encode(all_chunks).tolist()

collection.add(
    documents=all_chunks,
    embeddings=embeddings,
    ids=all_ids,
    metadatas=all_metadata
)

print(f"Done! Stored {len(all_chunks)} chunks in ChromaDB")