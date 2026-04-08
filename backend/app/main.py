from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from app.services.rag_pipeline import generate_answer
from app.services.vector_store import (
    store_chunks,
    search_chunks,
    clear_collection
)
from app.services.pdf_loader import extract_pdf_text
from app.services.chunking import split_into_chunks
from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi import Query
import os

class AskRequest(BaseModel):
    question: str
    chat_history: str = ""
app = FastAPI()
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.get("/")
def home():
    return {"message": "Backend is running successfully"}

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    pages = extract_pdf_text(file_path)

    chunks = split_into_chunks(pages)

    clear_collection()

    store_chunks(chunks)

    return {
        "message": "PDF uploaded and processed successfully",
        "total_pages": len(pages),
        "total_chunks": len(chunks),
        "chunks": chunks[:3]
    }

@app.get("/search")
def search_pdf(query: str):
    results = search_chunks(query)

    return {
        "query": query,
        "results": results
    }


@app.get("/ask")
def ask_question(
    question: str = Query(...),
    chat_history: str = Query("")
):
    return generate_answer(
        question,
        chat_history
    )
@app.get("/summarize")
def summarize_paper():
    return generate_answer(
        "Summarize the entire research paper including objective, methodology, architecture, key contributions, and conclusions.",
        ""
    )