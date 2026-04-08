import chromadb
from app.services.embeddings import generate_embedding

client = chromadb.Client()
collection = client.get_or_create_collection("pdf_chunks")

def store_chunks(chunks):
    for i, chunk in enumerate(chunks):
        embedding = generate_embedding(chunk["chunk_text"])

        collection.add(
            ids=[str(i)],
            documents=[chunk["chunk_text"]],
            embeddings=[embedding],
            metadatas=[{"page_number": chunk["page_number"]}]
        )

def search_chunks(query, top_k=6):
    query_embedding = generate_embedding(query)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["documents", "distances", "metadatas"]
    )

    return results

def clear_collection():
    all_docs = collection.get()

    if all_docs["ids"]:
        collection.delete(ids=all_docs["ids"])