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

    if not question:
        return jsonify({'error': 'Message required'}), 400

    # Step 1 - convert question to embedding
    question_embedding = model.encode(question).tolist()

    # Step 2 - search ChromaDB for relevant chunks
    results = collection.query(
        query_embeddings=[question_embedding],
        n_results=2
    )

    # Step 3 - build context from retrieved chunks
    context = "\n\n".join(results['documents'][0])

    # Step 4 - send to Groq with context
    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": f"""You are a helpful assistant for The Grand Hotel.
Answer the guest's question using ONLY the context provided below.
If the answer is not in the context, say 'I don't have that information, please contact our front desk at +91-22-1234-5678.'

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

if __name__ == '__main__':
    app.run(port=5001, debug=True)