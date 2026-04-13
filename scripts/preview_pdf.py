import pdfplumber

with pdfplumber.open("scripts/scraper/nt02-lettere-apocalisse.pdf") as pdf:
    for i in range(min(5, len(pdf.pages))):
        print(f"--- Page {i+1} ---")
        print(pdf.pages[i].extract_text())
