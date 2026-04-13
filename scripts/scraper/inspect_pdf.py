import pdfplumber

pdf_path = "nt01-vangeli-atti-apostoli.pdf"
with pdfplumber.open(pdf_path) as pdf:
    for i in range(min(5, len(pdf.pages))):
        print(f"--- Page {i+1} ---")
        print(pdf.pages[i].extract_text()[:1000])
        print("\n")
