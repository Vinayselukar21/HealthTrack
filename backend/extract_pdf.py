import pdfplumber
import json

def extract_document_structure(pdf_path):
    document = {
        "pages": []
    }

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            content = {
                "page_number": page.page_number,
                "text_blocks": [],
                "tables": []
            }

            # Extract paragraphs (as list of lines grouped by y position)
            lines = page.extract_text().split("\n") if page.extract_text() else []
            content["text_blocks"] = lines

            # Extract tables
            tables = page.extract_tables()
            for table in tables:
                content["tables"].append(table)

            document["pages"].append(content)

    return document

def extract_pdf(pdf_path):

        try:
            doc = extract_document_structure(pdf_path)
            stringified_doc = json.dumps(doc, indent=2)
            print(stringified_doc)
            return stringified_doc
        except Exception as e:
            print(f"Error reading PDF: {e}")
            return f"Error reading PDF: {e}"
