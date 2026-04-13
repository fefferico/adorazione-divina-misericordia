import pdfplumber

pdf_path = "nt01-vangeli-atti-apostoli.pdf"
with pdfplumber.open(pdf_path) as pdf:
    # Marco starts around page 35
    for i in range(34, 40): 
        print(f"--- Page {i+1} ---")
        print(pdf.pages[i].extract_text())
        print("\n")
