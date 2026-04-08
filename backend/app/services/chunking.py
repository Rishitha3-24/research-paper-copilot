def split_into_chunks(pages, chunk_size=800, overlap=150):
    chunks = []

    for page in pages:
        text = page["text"]
        page_number = page["page_number"]

        start = 0

        while start < len(text):
            end = start + chunk_size
            chunk_text = text[start:end]

            chunks.append({
                "page_number": page_number,
                "chunk_text": chunk_text
            })

            start += chunk_size - overlap

    return chunks