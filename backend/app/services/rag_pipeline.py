import os
from dotenv import load_dotenv
import google.generativeai as genai
from app.services.vector_store import search_chunks

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

model = genai.GenerativeModel("models/gemini-2.5-flash")


def generate_answer(question, chat_history=""):
    try:
        results = search_chunks(question)

        retrieved_docs = results["documents"][0]
        print("RETRIEVED DOCS:", retrieved_docs)

        context = "\n\n".join(retrieved_docs[:5])

        prompt = f"""
You are an advanced AI Research Paper Copilot with ChatGPT-level reasoning and explanation abilities.

Your task is to answer questions based on the retrieved research paper context.

Instructions:
- Use retrieved context as the primary source
- Give detailed, deeply explained answers
- Explain concepts naturally like ChatGPT
- Use step-by-step reasoning
- Use numbered points for methodology/process
- Format answers using markdown
- Use headings (##)
- Use bullet points
- Use numbered steps
- Use paragraph style for conceptual questions
- Explain architecture module-by-module
- Make answers polished, human-like, and professional
- Use previous conversation context if relevant

Chat History:
{chat_history}

Retrieved Context:
{context}

Question:
{question}

Detailed professional answer:
"""

        response = model.generate_content(prompt)

        return {
            "question": question,
            "answer": response.text,
            "retrieved_context": retrieved_docs
        }

    except Exception as e:
        return {
            "error": str(e)
        }