import os
import chromadb
from sentence_transformers import SentenceTransformer
from groq import Groq
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

# Setup
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_collection("hotel_docs")
model = SentenceTransformer('all-MiniLM-L6-v2')
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

@app.route('/rag-chat', methods=['POST'])
def rag_chat():
    data = request.json
    question = data.get('message')
    hotel_id = data.get('hotel_id')
    print(f"RAG request - hotel_id: {hotel_id}")
    
    # List all collections
    all_collections = client.list_collections()
    print(f"Available collections: {[c.name for c in all_collections]}")
    if not question:
        return jsonify({'error': 'Message required'}), 400

    # Use hotel-specific collection if exists, fallback to default
    collection_name = f"hotel_{hotel_id}_docs" if hotel_id else "hotel_docs"
    
    try:
        hotel_collection = client.get_collection(collection_name)
    except:
        # Fallback to default collection
        try:
            hotel_collection = client.get_collection("hotel_docs")
        except:
            return jsonify({'reply': "I don't have any hotel information yet. Please ask the hotel to upload their documents.", 'source_chunks': []})

    # Convert question to embedding
    question_embedding = model.encode(question).tolist()

    # Search collection
    results = hotel_collection.query(
        query_embeddings=[question_embedding],
        n_results=2
    )

    context = "\n\n".join(results['documents'][0])

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": f"""You are a helpful assistant for this hotel.
Answer the guest's question using ONLY the context provided below.
If the answer is not in the context, say 'I don't have that information, please contact our front desk.'

CONTEXT:
{context}"""
            },
            {
                "role": "user",
                "content": question
            }
        ],
        max_tokens=1024,
    )

    answer = response.choices[0].message.content
    return jsonify({'reply': answer, 'source_chunks': results['documents'][0]})
@app.route('/ingest', methods=['POST'])
def ingest_document():
    data = request.json
    file_path = data.get('file_path')
    hotel_id = data.get('hotel_id')
    file_name = data.get('file_name')

    if not file_path or not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 400

    try:
        # Read file
        if file_path.endswith('.pdf'):
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
        else:
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()

        # Chunk text
        words = text.split()
        chunks = []
        current_chunk = []
        current_size = 0

        for word in words:
            current_chunk.append(word)
            current_size += len(word)
            if current_size >= 1000:
                chunks.append(' '.join(current_chunk))
                current_chunk = []
                current_size = 0

        if current_chunk:
            chunks.append(' '.join(current_chunk))

        # Store in hotel-specific collection
        collection_name = f"hotel_{hotel_id}_docs"
        try:
            hotel_collection = client.get_collection(collection_name)
        except:
            hotel_collection = client.create_collection(collection_name)

        # Generate embeddings and store
        embeddings = model.encode(chunks).tolist()
        ids = [f"{file_name}_chunk_{i}" for i in range(len(chunks))]
        metadatas = [{"source": file_name, "hotel_id": str(hotel_id)} for _ in chunks]

        hotel_collection.add(
            documents=chunks,
            embeddings=embeddings,
            ids=ids,
            metadatas=metadatas
        )

        return jsonify({'success': True, 'chunks': len(chunks), 'collection': collection_name})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)

