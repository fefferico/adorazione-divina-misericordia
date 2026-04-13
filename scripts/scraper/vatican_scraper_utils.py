#!/usr/bin/env python3
"""
Vatican Scraper - Utilities
Analisi, filtri e manipolazioni del JSON estratto
"""

import json
import os
from collections import Counter, defaultdict
from datetime import datetime
import argparse

LIBRARY_PATH = "public/assets/data/francesco.json"


def load_library(filepath=LIBRARY_PATH):
    """Carica il JSON dal file"""
    if not os.path.exists(filepath):
        print(f"❌ File non trovato: {filepath}")
        return None
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Errore nel caricamento: {e}")
        return None


def print_stats(library):
    """Stampa statistiche generali"""
    if not library:
        return
    
    items = library.get('items', [])
    
    print("\n" + "=" * 70)
    print("📊 STATISTICHE GENERALI")
    print("=" * 70)
    
    print(f"\n📈 Totale documenti: {len(items)}")
    print(f"📅 Ultimo aggiornamento: {library.get('lastUpdated', 'N/A')}")
    
    # Statistiche per categoria
    print("\n📚 Documenti per Categoria:")
    categories = Counter()
    for item in items:
        categories[item.get('categoryId', 'unknown')] += 1
    
    for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
        print(f"   {cat:25} → {count:4} documenti")
    
    # Statistiche per tema
    print("\n🎯 Utilizzo dei Temi:")
    themes = Counter()
    for item in items:
        for theme in item.get('themeIds', []):
            themes[theme] += 1
    
    for theme, count in sorted(themes.items(), key=lambda x: x[1], reverse=True):
        percentage = (count / len(items)) * 100
        print(f"   {theme:20} → {count:5} volte ({percentage:5.1f}%)")
    
    # Lunghezza media contenuti
    print("\n📝 Lunghezza Contenuti:")
    lengths = [len(item.get('content', '')) for item in items]
    print(f"   Lunghezza minima: {min(lengths):,} caratteri")
    print(f"   Lunghezza massima: {max(lengths):,} caratteri")
    print(f"   Lunghezza media:  {sum(lengths)//len(lengths):,} caratteri")
    
    # Hint di riflessione
    print("\n💭 Hint di Riflessione:")
    hint_counts = Counter()
    for item in items:
        hint_counts[len(item.get('reflectionHints', []))] += 1
    
    for num_hints, count in sorted(hint_counts.items()):
        print(f"   {num_hints} hint → {count:4} documenti")


def filter_by_category(library, category):
    """Filtra i documenti per categoria"""
    items = library.get('items', [])
    filtered = [item for item in items if item.get('categoryId') == category]
    
    print(f"\n🔍 Filtro: categoryId = '{category}'")
    print(f"   Risultati: {len(filtered)} documenti")
    
    return filtered


def filter_by_theme(library, theme):
    """Filtra i documenti per tema"""
    items = library.get('items', [])
    filtered = [item for item in items if theme in item.get('themeIds', [])]
    
    print(f"\n🔍 Filtro: themeIds contiene '{theme}'")
    print(f"   Risultati: {len(filtered)} documenti")
    
    return filtered


def filter_by_keyword(library, keyword):
    """Filtra i documenti per keyword nel contenuto"""
    items = library.get('items', [])
    keyword_lower = keyword.lower()
    filtered = [item for item in items 
                if keyword_lower in item.get('content', '').lower()]
    
    print(f"\n🔍 Filtro: keyword '{keyword}' nel contenuto")
    print(f"   Risultati: {len(filtered)} documenti")
    
    return filtered


def export_filtered(items, output_file, category=None, theme=None):
    """Esporta una selezione filtrata in JSON"""
    export_data = {
        "items": items,
        "count": len(items),
        "exported_at": datetime.now().isoformat(),
        "filters": {
            "category": category,
            "theme": theme
        }
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(export_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Esportati {len(items)} documenti in: {output_file}")


def find_gaps(library):
    """Trova anni con pochi documenti (possibili gap)"""
    items = library.get('items', [])
    
    print("\n🔎 Ricerca Gap Temporali:")
    
    years_per_category = defaultdict(lambda: defaultdict(int))
    
    for item in items:
        scraped_at = item.get('scraped_at', '')
        if scraped_at:
            year = scraped_at.split('-')[0]
            category = item.get('categoryId', 'unknown')
            years_per_category[category][year] += 1
    
    for category in sorted(years_per_category.keys()):
        print(f"\n   {category}:")
        years = sorted(years_per_category[category].items())
        for year, count in years:
            status = "✓" if count > 10 else "⚠️ "
            print(f"      {year}: {count:4} documenti {status}")


def deduplicate(library, save=False):
    """Identifica e rimuove duplicati"""
    items = library.get('items', [])
    
    print("\n🔍 Analisi Duplicati:")
    
    seen_ids = set()
    duplicates = []
    unique_items = []
    
    for item in items:
        item_id = item.get('id')
        if item_id in seen_ids:
            duplicates.append(item)
        else:
            unique_items.append(item)
            seen_ids.add(item_id)
    
    print(f"   Total items: {len(items)}")
    print(f"   Unique items: {len(unique_items)}")
    print(f"   Duplicates found: {len(duplicates)}")
    
    if duplicates and save:
        library['items'] = unique_items
        library['totalItems'] = len(unique_items)
        with open(LIBRARY_PATH, 'w', encoding='utf-8') as f:
            json.dump(library, f, ensure_ascii=False, indent=2)
        print(f"✅ Rimossi {len(duplicates)} duplicati e salvato!")
    
    return unique_items if save else duplicates


def analyze_themes(library):
    """Analisi approfondita dei temi"""
    items = library.get('items', [])
    
    print("\n🎯 Analisi Temi:")
    
    theme_categories = defaultdict(lambda: defaultdict(int))
    
    for item in items:
        category = item.get('categoryId', 'unknown')
        for theme in item.get('themeIds', []):
            theme_categories[theme][category] += 1
    
    for theme in sorted(theme_categories.keys()):
        print(f"\n   {theme}:")
        categories = sorted(theme_categories[theme].items(), 
                          key=lambda x: x[1], reverse=True)
        for cat, count in categories:
            print(f"      {cat:25} → {count:4} documenti")


def list_categories(library):
    """Elenca tutte le categorie con info"""
    categories = library.get('categories', [])
    
    print("\n📚 Categorie Disponibili:")
    
    if categories:
        for cat in categories:
            print(f"\n   {cat.get('categoryId'):30} | {cat.get('displayName')}")
            print(f"   {'Path:':30} {cat.get('path')}")
            print(f"   {'Con anni:':30} {'Sì' if cat.get('years') else 'No'}")
    else:
        print("   Nessuna categoria metadata trovata")


def sample_items(library, num=5, category=None):
    """Stampa un campione di documenti"""
    items = library.get('items', [])
    
    if category:
        items = [i for i in items if i.get('categoryId') == category]
    
    print(f"\n📄 Campione di {min(num, len(items))} Documenti:")
    
    for i, item in enumerate(items[:num], 1):
        print(f"\n   [{i}] {item.get('id')}")
        print(f"       Categoria: {item.get('categoryId')}")
        print(f"       Titolo: {item.get('title', 'N/A')[:60]}...")
        print(f"       Temi: {', '.join(item.get('themeIds', []))}")
        print(f"       Lunghezza: {len(item.get('content', ''))} caratteri")
        print(f"       Hint: {len(item.get('reflectionHints', []))} riflessioni")


def validate_json(library):
    """Valida l'integrità del JSON"""
    print("\n✅ Validazione JSON:")
    
    issues = []
    items = library.get('items', [])
    
    required_fields = ['id', 'categoryId', 'title', 'content', 'author']
    
    for i, item in enumerate(items):
        for field in required_fields:
            if field not in item or not item[field]:
                issues.append(f"   Item {i}: campo '{field}' mancante")
        
        if not item.get('themeIds') or len(item.get('themeIds', [])) == 0:
            issues.append(f"   Item {i}: nessun tema")
        
        if not item.get('reflectionHints') or len(item.get('reflectionHints', [])) == 0:
            issues.append(f"   Item {i}: nessun hint di riflessione")
    
    if issues:
        print(f"   ⚠️  Trovati {len(issues)} problemi:")
        for issue in issues[:20]:
            print(issue)
        if len(issues) > 20:
            print(f"   ... e {len(issues) - 20} altri")
    else:
        print(f"   ✅ Tutti i {len(items)} documenti sono validi!")


def main():
    parser = argparse.ArgumentParser(description='Vatican Scraper - Utilities')
    
    subparsers = parser.add_subparsers(dest='command', help='Comando')
    
    # Stats
    subparsers.add_parser('stats', help='Mostra statistiche generali')
    
    # Filter
    filter_parser = subparsers.add_parser('filter', help='Filtra documenti')
    filter_parser.add_argument('--category', help='Filtra per categoria')
    filter_parser.add_argument('--theme', help='Filtra per tema')
    filter_parser.add_argument('--keyword', help='Filtra per keyword')
    filter_parser.add_argument('--output', help='Salva risultati in file')
    
    # Gaps
    subparsers.add_parser('gaps', help='Trova gap temporali')
    
    # Dedup
    dedup_parser = subparsers.add_parser('dedup', help='Analizza/rimuovi duplicati')
    dedup_parser.add_argument('--save', action='store_true', help='Salva le modifiche')
    
    # Analyze
    subparsers.add_parser('analyze', help='Analizza temi')
    
    # List
    subparsers.add_parser('list', help='Elenca categorie')
    
    # Sample
    sample_parser = subparsers.add_parser('sample', help='Mostra campione documenti')
    sample_parser.add_argument('--num', type=int, default=5, help='Numero documenti')
    sample_parser.add_argument('--category', help='Categoria specifica')
    
    # Validate
    subparsers.add_parser('validate', help='Valida integrità JSON')
    
    args = parser.parse_args()
    
    library = load_library()
    if not library:
        return
    
    if args.command == 'stats':
        print_stats(library)
    
    elif args.command == 'filter':
        filtered = library.get('items', [])
        if args.category:
            filtered = filter_by_category(library, args.category)
        elif args.theme:
            filtered = filter_by_theme(library, args.theme)
        elif args.keyword:
            filtered = filter_by_keyword(library, args.keyword)
        
        if args.output:
            export_filtered(filtered, args.output)
    
    elif args.command == 'gaps':
        find_gaps(library)
    
    elif args.command == 'dedup':
        deduplicate(library, save=args.save)
    
    elif args.command == 'analyze':
        analyze_themes(library)
    
    elif args.command == 'list':
        list_categories(library)
    
    elif args.command == 'sample':
        sample_items(library, num=args.num, category=args.category)
    
    elif args.command == 'validate':
        validate_json(library)
    
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
