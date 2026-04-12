import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup

async def scrape_vatican():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # URL di partenza (Esempio: Francesco)
        url = "https://www.vatican.va/content/francesco/it.html"
        await page.goto(url)
        
        # Attendiamo che l'accordion sia visibile
        await page.wait_for_selector("#accordionmenu")
        
        # Otteniamo l'HTML renderizzato
        content = await page.content()
        soup = BeautifulSoup(content, 'html.parser')
        
        # Troviamo tutte le categorie nell'accordion
        # Di solito sono elementi <h3> o <div> con classi specifiche
        categories = soup.select("#accordionmenu h3")
        
        results = []

        for cat in categories:
            cat_name = cat.get_text(strip=True)
            print(f"Analizzando categoria: {cat_name}")
            
            # Qui dovresti implementare la logica di click se i link non sono nel DOM
            # Se i link sono già presenti (spesso nascosti via CSS):
            next_div = cat.find_next_sibling("div")
            if next_div:
                links = next_div.find_all("a")
                for link in links:
                    doc_title = link.get_text(strip=True)
                    doc_url = "https://www.vatican.va" + link.get('href')
                    
                    results.append({
                        "categoria": cat_name,
                        "titolo": doc_title,
                        "url": doc_url
                    })

        await browser.close()
        return results

# Esecuzione
if __name__ == "__main__":
    data = asyncio.run(scrape_vatican())
    for item in data[:10]: # Mostra i primi 10
        print(item)