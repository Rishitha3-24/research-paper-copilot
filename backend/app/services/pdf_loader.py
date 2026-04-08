from pypdf import PdfReader

def extract_pdf_text(file_path):
    reader = PdfReader(file_path)

    pages = []

    for i, page in enumerate(reader.pages):
        text = page.extract_text()

        pages.append({
            "page_number": i + 1,
            "text": text
        })

    return pages