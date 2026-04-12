import json
import os

LIBRARY_PATH = 'public/assets/data/library.json'

def populate():
    if not os.path.exists(LIBRARY_PATH):
        print("Library file not found!")
        return

    with open(LIBRARY_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Structure check
    if 'items' not in data:
        print("Invalid structure: 'items' missing")
        return

    # NEW BUNDLE OF ITEMS
    new_items = []

    # Helper to add items
    def add_it(batch_name, cat, items):
        for i, it in enumerate(items):
            new_items.append({
                "id": f"{cat}_{batch_name}_{i+500}",
                "categoryId": cat,
                "themeId": "generale",
                "title": it['title'],
                "content": it['content'],
                "reflectionHints": ["Cosa mi dice questa parola?", "Come posso vivere questa misericordia?"]
            })

    # Vangelo di Matteo - Major Blocks
    matteo = [
        {"title": "Genealogia di Gesù (Mt 1,1-17)", "content": "Libro della generazione di Gesù Cristo figlio di Davide, figlio di Abramo... In tutto, quindi, le generazioni da Abramo a Davide sono quattordici; da Davide fino alla deportazione in Babilonia sono quattordici; dalla deportazione in Babilonia a Cristo, quattordici."},
        {"title": "Annuncio a Giuseppe (Mt 1,18-25)", "content": "Giuseppe, suo sposo, poiché era uomo giusto e non voleva accusarla pubblicamente, pensò di ripudiarla in segreto... L'angelo gli disse: 'Giuseppe, figlio di Davide, non temere di prendere con te Maria, tua sposa. Infatti il bambino che è generato in lei viene dallo Spirito Santo'."},
        {"title": "I Magi (Mt 2,1-12)", "content": "Nato Gesù a Betlemme di Giudea, al tempo del re Erode, ecco, alcuni Magi vennero da oriente a Gerusalemme... Entrati nella casa, videro il bambino con Maria sua madre, si prostrarono e lo adorarono."},
        {"title": "Fuga in Egitto (Mt 2,13-15)", "content": "Un angelo del Signore apparve in sogno a Giuseppe e gli disse: 'Alzati, prendi con te il bambino e sua madre, fuggi in Egitto e resta là finché non ti avvertirò'."},
        {"title": "Battesimo al Giordano (Mt 3,13-17)", "content": "Gesù dalla Galilea venne al Giordano da Giovanni, per farsi battezzare da lui... Ed ecco una voce dal cielo che diceva: 'Questi è il Figlio mio, l'amato: in lui mi sono compiaciuto'."},
        {"title": "Tentazioni nel Deserto (Mt 4,1-11)", "content": "Non di solo pane vivrà l'uomo, ma di ogni parola che esce dalla bocca di Dio... Vattene, satana! Sta scritto infatti: Il Signore, Dio tuo, adorerai: a lui solo renderai culto."},
        {"title": "Chiamata dei primi discepoli (Mt 4,18-22)", "content": "Mentre camminava lungo il mare di Galilea, vide due fratelli... e disse loro: 'Venite dietro a me, vi farò pescatori di uomini'."},
        {"title": "I Poveri in Spirito (Mt 5,3)", "content": "Beati i poveri in spirito, perché di essi è il regno dei cieli."},
        {"title": "I Puri di Cuore (Mt 5,8)", "content": "Beati i puri di cuore, perché vedranno Dio."},
        {"title": "Sale e Luce (Mt 5,13-16)", "content": "Voi siete il sale della terra... Voi siete la luce del mondo."},
        {"title": "Compiimento della Legge (Mt 5,17-20)", "content": "Non crediate che io sia venuto ad abolire la Legge o i Profeti; non sono venuto ad abolire, ma a dare pieno compimento."},
        {"title": "Giuramenti e Verità (Mt 5,33-37)", "content": "Sia invece il vostro parlare: 'Sì, sì', 'No, no'; il di più viene dal Maligno."},
        {"title": "L'Elemosina (Mt 6,1-4)", "content": "Quando dunque fai l'elemosina, non suonare la tromba davanti a te... il Padre tuo, che vede nel segreto, ti ricompenserà."},
        {"title": "La Preghiera (Mt 6,5-15)", "content": "Voi dunque pregate così: Padre nostro che sei nei cieli..."},
        {"title": "Il Tesoro nel Cielo (Mt 6,19-21)", "content": "Dov'è il tuo tesoro, là sarà anche il tuo cuore."},
        {"title": "Abbandono alla Provvidenza (Mt 6,25-34)", "content": "Guardate gli uccelli del cielo: non seminano e non mietono... Cercate invece, anzitutto, il regno di Dio e la sua giustizia."},
        {"title": "Non giudicate (Mt 7,1-5)", "content": "Non giudicate, per non essere giudicati... Perché guardi la pagliuzza che è nell'occhio del tuo fratello, e non t'accorgi della trave che è nel tuo occhio?"},
        {"title": "Chiedete e vi sarà dato (Mt 7,7-11)", "content": "Chiedete e vi sarà dato, cercate e troverete, bussate e vi sarà aperto."},
        {"title": "La Porta Stretta (Mt 7,13-14)", "content": "Entrate per la porta stretta, perché larga è la porta e spaziosa la via che conduce alla perdizione."},
        {"title": "La Casa sulla Roccia (Mt 7,24-27)", "content": "Chiunque ascolta queste mie parole e le mette in pratica, sarà simile a un uomo saggio, che ha costruito la sua casa sulla roccia."}
    ]

    # Luca
    luca = [
        {"title": "Il Magnificat (Lc 1,46-55)", "content": "L'anima mia magnifica il Signore... Ha soccorso Israele, suo servo, ricordandosi della sua misericordia."},
        {"title": "Benedictus (Lc 1,68-79)", "content": "Benedetto il Signore, Dio d'Israele, perché ha visitato e redento il suo popolo..."},
        {"title": "Nunc Dimittis (Lc 2,29-32)", "content": "Ora puoi lasciare, o Signore, che il tuo servo vada in pace, secondo la tua parola..."},
        {"title": "Discorso della Pianura (Lc 6,17-26)", "content": "Beati voi, poveri, perché vostro è il regno di Dio. Beati voi, che ora avete fame, perché sarete saziati."},
        {"title": "Amate i nemici (Lc 6,27-36)", "content": "Amate i vostri nemici, fate del bene a quelli che vi odiano... Siate misericordiosi, come il Padre vostro è misericordioso."},
        {"title": "La Peccatrice perdonata (Lc 7,36-50)", "content": "Le sono perdonati i suoi molti peccati, perché ha molto amato. Invece colui al quale si perdona poco, ama poco."},
        {"title": "Parabola del Seminatore (Lc 8,4-15)", "content": "Il seme è la parola di Dio... Quello caduto sulla terra buona sono coloro che... portano frutto con perseveranza."},
        {"title": "La Missione dei Settantadue (Lc 10,1-12)", "content": "La messe è abbondante, ma sono pochi gli operai."},
        {"title": "Marta e Maria (Lc 10,38-42)", "content": "Maria ha scelto la parte migliore, che non le sarà tolta."},
        {"title": "La Pecora Smarrita (Lc 15,1-7)", "content": "Ci sarà gioia in cielo per un solo peccatore che si converte, più che per novantanove giusti."},
        {"title": "La Moneta Ritrovata (Lc 15,8-10)", "content": "Rallegratevi con me, perché ho ritrovato la moneta che avevo perduta."},
        {"title": "Il Figlio Prodigo (Lc 15,11-32)", "content": "Padre, ho peccato verso il Cielo e davanti a te... Bisognava far festa e rallegrarsi, perché questo tuo fratello era morto ed è tornato in vita."},
        {"title": "Il Ricco e Lazzaro (Lc 16,19-31)", "content": "Tra noi e voi è stato stabilito un grande abisso..."},
        {"title": "I Dieci Lebbrosi (Lc 17,11-19)", "content": "Non ne sono stati guariti dieci? E gli altri nove dove sono?"},
        {"title": "Il Fariseo e il Pubblicano (Lc 18,9-14)", "content": "O Dio, abbi pietà di me peccatore... Questi, a differenza dell'altro, tornò a casa sua giustificato."},
        {"title": "Gesù e i bambini (Lc 18,15-17)", "content": "Lasciate che i bambini vengano a me... Chi non accoglie il regno di Dio come lo accoglie un bambino, non entrerà in esso."},
        {"title": "Il Giovane Ricco (Lc 18,18-23)", "content": "Vendi tutto quello che hai, distribuiscilo ai poveri e avrai un tesoro nei cieli."},
        {"title": "Zaccheo (Lc 19,1-10)", "content": "Oggi la salvezza è entrata in questa casa... Il Figlio dell'uomo infatti è venuto a cercare e a salvare ciò che era perduto."},
        {"title": "Istituzione dell'Eucaristia (Lc 22,14-23)", "content": "Questo è il mio corpo, che è dato per voi; fate questo in memoria di me."},
        {"title": "Il Buon Ladrone (Lc 23,39-43)", "content": "In verità io ti dico: oggi con me sarai nel paradiso."}
    ]

    # Giovanni
    giovanni = [
        {"title": "Il Verbo (Gv 1,1-5)", "content": "In principio era il Verbo... e la luce splende nelle tenebre e le tenebre non l'hanno vinta."},
        {"title": "Giovanni Battista (Gv 1,19-28)", "content": "Io sono voce di uno che grida nel deserto: Rendete diritta la via del Signore."},
        {"title": "L'Agnello di Dio (Gv 1,29-34)", "content": "Ecco l'agnello di Dio, colui che toglie il peccato del mondo!"},
        {"title": "Cana di Galilea (Gv 2,1-12)", "content": "Qualsiasi cosa vi dica, fatela."},
        {"title": "Dialogo con Nicodemo (Gv 3,1-21)", "content": "Se uno non nasce da acqua e Spirito, non può entrare nel regno di Dio."},
        {"title": "La Samaritana (Gv 4,1-42)", "content": "Chi beve dell'acqua che io gli darò, non avrà più sete in eterno."},
        {"title": "Guarigione del paralitico (Gv 5,1-18)", "content": "Vuoi guarire? ... Alzati, prendi la tua barella e cammina."},
        {"title": "Moltiplicazione dei Pani (Gv 6,1-15)", "content": "Gesù prese i pani e, dopo aver reso grazie, li diede a quelli che erano seduti."},
        {"title": "Cammino sulle acque (Gv 6,16-21)", "content": "Sono io, non abbiate paura!"},
        {"title": "Il Pane Disceso dal Cielo (Gv 6,35-40)", "content": "Io sono il pane della vita; chi viene a me non avrà fame."},
        {"title": "Le Parole di Vita Eterna (Gv 6,60-71)", "content": "Signore, da chi andremo? Tu hai parole di vita eterna."},
        {"title": "L'Adultera (Gv 8,1-11)", "content": "Chi di voi è senza peccato, getti per primo la pietra contro di lei... Neanch'io ti condanno; va' e d'ora in poi non peccare più."},
        {"title": "La Luce del Mondo (Gv 8,12)", "content": "Io sono la luce del mondo; chi segue me, non camminerà nelle tenebre."},
        {"title": "La Verità vi farà liberi (Gv 8,31-38)", "content": "Se rimanete nella mia parola, siete davvero miei discepoli; conoscerete la verità e la verità vi farà liberi."},
        {"title": "Il Buon Pastore (Gv 10,1-10)", "content": "Io sono la porta: se uno entra attraverso di me, sarà salvato."},
        {"title": "Una sola cosa è necessaria (Gv 11)", "content": "Io sono la risurrezione e la vita; chi crede in me, anche se muore, vivrà."},
        {"title": "Il Comandamento Nuovo (Gv 13,31-35)", "content": "Vi do un comandamento nuovo: che vi amiate gli uni agli altri. Come io ho amato voi, così amatevi anche voi gli uni agli altri."},
        {"title": "La Via, la Verità e la Vita (Gv 14,1-7)", "content": "Io sono la via, la verità e la vita. Nessuno viene al Padre se non per mezzo di me."},
        {"title": "La Vite e i Tralci (Gv 15,1-8)", "content": "Io sono la vite, voi i tralci. Chi rimane in me, e io in lui, porta molto frutto."},
        {"title": "Il Consolatore (Gv 16,5-15)", "content": "Quando verrà lui, lo Spirito della verità, vi guiderà a tutta la verità."}
    ]

    # Encicliche - Dives in Misericordia
    dives = [
        {"title": "Dives in Misericordia (Par. 1)", "content": "Dio, ricco di misericordia, è colui che Gesù Cristo ci ha rivelato come Padre..."},
        {"title": "Dives in Misericordia (Par. 2)", "content": "L'uomo contemporaneo sembra opporsi al Dio di misericordia e sembra voler togliere dalla vita e dal cuore umano l'idea stessa della misericordia..."},
        {"title": "Dives in Misericordia (Par. 4)", "content": "Cristo, rivelando l'amore-misericordia di Dio, esigeva al tempo stesso dagli uomini che si lasciassero anch'essi guidare nella loro vita dall'amore e dalla misericordia."},
        {"title": "Dives in Misericordia (Par. 8)", "content": "La misericordia nel suo aspetto autentico e proprio si manifesta come una forza che è capace di richiamare l'uomo a se stesso ed è capace di vincere il male con il bene."},
        {"title": "Dives in Misericordia (Par. 14)", "content": "La Chiesa deve professare e proclamare la misericordia di Dio in tutta la sua verità."},
        {"title": "Misericordiae Vultus (Par. 1)", "content": "Gesù Cristo è il volto della misericordia del Padre."},
        {"title": "Misericordiae Vultus (Par. 2)", "content": "Sempre abbiamo bisogno di contemplare il mistero della misericordia. È condizione della nostra salvezza."},
        {"title": "Misericordiae Vultus (Par. 10)", "content": "L'architrave che sorregge la vita della Chiesa è la misericordia."},
        {"title": "Misericordiae Vultus (Par. 12)", "content": "La Chiesa ha la missione di annunciare la misericordia di Dio, cuore pulsante del Vangelo."},
        {"title": "Misericordiae Vultus (Par. 21)", "content": "La misericordia non è contraria alla giustizia ma esprime il comportamento di Dio verso il peccatore."}
    ]
    
    # Omelie
    homilies = [
        {"title": "Sulla gioia del perdono", "content": "C'è più gioia in cielo per un peccatore che si converte. Dio non si stanca mai di perdonarci, siamo noi che ci stanchiamo di chiedere la sua misericordia."},
        {"title": "Il tempo della misericordia", "content": "Siamo nel tempo della misericordia. Questo è il tempo favorevole per curare le ferite, per non stancarci di incontrare quanti sono in attesa di vedere i segni della vicinanza di Dio."},
        {"title": "La carezza di Dio", "content": "La misericordia di Dio è come una carezza, come l'abbraccio di un padre che accoglie il figlio che torna a casa."},
        {"title": "Aprire il cuore", "content": "Non abbiate paura della misericordia di Dio. Lasciatevi abbracciare da Lui, lasciatevi amare da Colui che è l'Amore stesso."}
    ]

    add_it("matte", "vangelo", matteo)
    add_it("luke", "vangelo", luca)
    add_it("john", "vangelo", giovanni)
    add_it("dives", "enciclica", dives)
    add_it("hom", "omelia", homilies)

    # Combine
    existing_items = data.get('items', [])
    # Keep only Diario from existing to avoid duplicates if possible
    # But let's just append to be safe for now, or filter by category
    other_cats = [it for it in existing_items if it['categoryId'] == 'diario']
    
    data['items'] = other_cats + new_items

    with open(LIBRARY_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Added {len(new_items)} items. Total items: {len(data['items'])}")

if __name__ == "__main__":
    populate()
