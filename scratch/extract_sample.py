import pdfplumber
import json
import re

pdf_path = "/home/fefferico/projects/adorazione-divina-misericordia/medjugorje-canti-di-adorazione-score-accordi-spartiti-w2wpkp2cvjyv6qwmvw2kkwmrc-qs-3x2d7fatieq0py4o4iveezq01py4o4iveezq1-pdf_compress.pdf"

with pdfplumber.open(pdf_path) as pdf:
    full_text = ""
    for page in pdf.pages[:10]: # Check first 10 pages
        full_text += page.extract_text() or ""
        full_text += "\n--- PAGE ---\n"
    
    print(full_text)
