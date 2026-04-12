import requests
from bs4 import BeautifulSoup
import re

def clean_text(text):
    text = re.sub(r'©\s*Copyright.*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'Dicastero per la Comunicazione.*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'La Santa Sede.*', '', text, flags=re.IGNORECASE)
    
    lines = text.split('\n')
    clean_lines = []
    for line in lines:
        line = line.strip()
        if not line: continue
        if len(line) < 3: continue
        if any(x in line for x in ['Français', 'English', 'Italiano', 'Português', 'Español']): continue
        clean_lines.append(line)
        
    return '\n\n'.join(clean_lines)

url = "https://www.vatican.va/content/francesco/it/angelus/2024/documents/20241027-angelus.html"
response = requests.get(url)
soup = BeautifulSoup(response.content, 'html.parser')

print("Selectors available:")
if soup.select_one('.document-content'): print("- .document-content found")
if soup.select_one('#document-content'): print("- #document-content found")
if soup.select_one('body'): print("- body found")

content = soup.select_one('.document-content') or soup.select_one('#document-content') or soup.select_one('body')

# Print first 200 chars of raw body text
print("-" * 20)
print(f"Raw body (first 200): {soup.body.get_text()[:200]}")
print("-" * 20)

# Decompose known noise
for tag in content.select('.header, .footer, nav, script, style, .languages, .breadcrumb'):
    tag.decompose()

text = content.get_text(separator='\n')
cleaned = clean_text(text)
print(f"Cleaned text length: {len(cleaned)}")
print(f"Cleaned text preview (first 200): {cleaned[:200]}")
