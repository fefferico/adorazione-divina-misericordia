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

    # MATTHEW
    matthew = [
        {"title": "Le Beatitudini (Mt 5,1-12)", "content": "Vedendo le folle, Gesù salì sul monte... Beati i poveri in spirito, perché di essi è il regno dei cieli. Beati quelli che sono nel pianto, perché saranno consolati. Beati i miti, perché avranno in eredità la terra. Beati quelli che hanno fame e sete della giustizia, perché saranno saziati. Beati i misericordiosi, perché troveranno misericordia..."},
        {"title": "Il Sale della Terra (Mt 5,13-16)", "content": "Voi siete il sale della terra; ma se il sale perde il sapore, con che cosa lo si renderà salato? A null'altro serve che ad essere gettato via e calpestato dalla gente. Voi siete la luce del mondo; non può restare nascosta una città che sta sopra un monte."},
        {"title": "Amore per i nemici (Mt 5,43-48)", "content": "Avete inteso che fu detto: Amerai il tuo prossimo e odierai il tuo nemico. Ma io vi dico: amate i vostri nemici e pregate per quelli che vi perseguitano, affinché siate figli del Padre vostro che è nei cieli... Siate voi dunque perfetti come è perfetto il Padre vostro celeste."},
        {"title": "Il Padre Nostro (Mt 6,5-15)", "content": "Voi dunque pregate così: Padre nostro che sei nei cieli, sia santificato il tuo nome, venga il tuo regno, sia fatta la tua volontà, come in cielo così in terra..."},
        {"title": "La Tempesta Sedata (Mt 8,23-27)", "content": "Salito sulla barca, i suoi discepoli lo seguirono. Ed ecco, avvenne nel mare una grande tempesta... Allora egli si alzò, sgridò i venti e il mare e avvenne una grande bonaccia."},
        {"title": "Venite a me (Mt 11,25-30)", "content": "Venite a me, voi tutti che siete stanchi e oppressi, e io vi darò ristoro. Prendete il mio giogo sopra di voi e imparate da me, che sono mite e umile di cuore, e troverete ristoro per le vostre anime."},
        {"title": "La Confessione di Pietro (Mt 16,13-20)", "content": "Gesù disse loro: 'Ma voi, chi dite che io sia?'. Rispose Simon Pietro: 'Tu sei il Cristo, il Figlio del Dio vivente'."},
        {"title": "Il Granello di Senape (Mt 13,31-32)", "content": "Il regno dei cieli è simile a un granello di senape, che un uomo prese e seminò nel suo campo. Esso è le più piccolo di tutti i semi ma, una volta cresciuto, è più grande delle altre piante dell'orto."},
        {"title": "Il Giudizio Finale (Mt 25,31-46)", "content": "Quando il Figlio dell'uomo verrà nella sua gloria... dirà a quelli che saranno alla sua destra: Venite, benedetti del Padre mio... perché ho avuto fame e mi avete dato da mangiare, ho avuto sete e mi avete dato da bere..."},
        {"title": "Il Mandato Missionario (Mt 28,16-20)", "content": "Andate dunque e fate discepoli tutti i popoli, battezdandoli nel nome del Padre e del Figlio e dello Spirito Santo, insegnando loro a osservare tutto ciò che vi ho comandato. Ed ecco, io sono con voi tutti i giorni, fino alla fine del mondo."}
    ]

    # MARK
    mark = [
        {"title": "Il Battesimo di Gesù (Mc 1,9-11)", "content": "In quei giorni, Gesù venne da Nazaret di Galilea e fu battezzato nel Giordano da Giovanni. E subito, uscendo dall'acqua, vide squarciarsi i cieli e lo Spirito discendere verso di lui come una colomba."},
        {"title": "La Guarigione del Paralitico (Mc 2,1-12)", "content": "Figlio, ti sono perdonati i tuoi peccati... Alzati, prendi la tua barella e va' a casa tua."},
        {"title": "Il Sabato per l'Uomo (Mc 2,23-28)", "content": "Il sabato è stato fatto per l'uomo e non l'uomo per il sabato! Perciò il Figlio dell'uomo è signore anche del sabato."},
        {"title": "Chi è mia Madre? (Mc 3,31-35)", "content": "Chi compie la volontà di Dio, costui è mio fratello, sorella e madre."},
        {"title": "La Figlia di Giairo (Mc 5,21-43)", "content": "Fanciulla, io ti dico: Alzati! Subito la fanciulla si alzò e camminava."},
        {"title": "Il Cieco di Betsaida (Mc 8,22-26)", "content": "Prese il cieco per mano, lo condusse fuori dal villaggio e, dopo avergli messo della saliva sugli occhi, gli impose le mani e gli chiese: 'Vedi qualcosa?'."},
        {"title": "La Trasfigurazione (Mc 9,2-8)", "content": "Gesù prese con sé Pietro, Giacomo e Giovanni e li condusse su un alto monte, in disparte, loro soli. Fu trasfigurato davanti a loro e le sue vesti divennero splendenti, bianchissime."},
        {"title": "Lasciate che i bambini vengano a me (Mc 10,13-16)", "content": "In verità io vi dico: chi non accoglie il regno di Dio come lo accoglie un bambino, non entrerà in esso."},
        {"title": "Il Cieco Bartimeo (Mc 10,46-52)", "content": "Figlio di Davide, Gesù, abbi pietà di me! ... Gesù gli disse: Va', la tua fede ti ha salvato."},
        {"title": "Il Primo di tutti i comandamenti (Mc 12,28-34)", "content": "Il primo è: Ascolta, Israele. Il Signore nostro Dio è l'unico Signore; amerai il Signore tuo Dio con tutto il tuo cuore... Il secondo è questo: Amerai il tuo prossimo come te stesso."}
    ]

    # LUKE
    luke = [
        {"title": "L'Annunciazione (Lc 1,26-38)", "content": "L'angelo le disse: Non temere, Maria, perché hai trovato grazia presso Dio. Ed ecco, concepirai un figlio, lo darai alla luce e lo chiamerai Gesù... Allora Maria disse: Ecco la serva del Signore: avvenga per me secondo la tua parola."},
        {"title": "Il Magnificat (Lc 1,46-55)", "content": "L'anima mia magnifica il Signore e il mio spirito esulta in Dio, mio salvatore, perché ha guardato l'umiltà della sua serva... Di generazione in generazione la sua misericordia per quelli che lo temono."},
        {"title": "La Nascita di Gesù (Lc 2,1-14)", "content": "Maria diede alla luce il suo figlio primogenito, lo avvolse in fasce e lo pose in una mangiatoia... Gloria a Dio nel più alto dei cieli e sulla terra pace agli uomini, che egli ama."},
        {"title": "I Pastori alla Capanna (Lc 2,15-20)", "content": "Andarono, senza indugio, e trovarono Maria e Giuseppe e il bambino, adagiato nella mangiatoia."},
        {"title": "Il Buon Samaritano (Lc 10,25-37)", "content": "Un uomo scendeva da Gerusalemme a Gerico... Un Samaritano, che era in viaggio, passandogli accanto, vide e ne ebbe compassione... Va' e anche tu fa' così."},
        {"title": "Marta e Maria (Lc 10,38-42)", "content": "Marta, Marta, tu ti affanni e ti agiti per molte cose, ma di una cosa sola c'è bisogno. Maria ha scelto la parte migliore, che non le sarà tolta."},
        {"title": "Il Padre Misericordioso (Lc 15,11-32)", "content": "Quando era ancora lontano, suo padre lo vide, ebbe compassione, gli corse incontro, gli si gettò al collo e lo baciò... Presto, portate qui il vestito più bello e fateglielo indossare... perché questo mio figlio era morto ed è tornato in vita, era perduto ed è stato ritrovato."},
        {"title": "La Pecora Smarrita (Lc 15,1-7)", "content": "Chi di voi, se ha cento pecore e ne perde una, non lascia le novantanove nel deserto e va in cerca di quella perduta, finché non la trova?"},
        {"title": "Il Ricco Epulone e Lazzaro (Lc 16,19-31)", "content": "C'era un uomo ricco... e un povero, di nome Lazzaro... Un giorno il povero morì e fu portato dagli angeli accanto ad Abramo."},
        {"title": "I Discepoli di Emmaus (Lc 24,13-35)", "content": "Mentre conversavano e discutevano insieme, Gesù in persona si avvicinò e camminava con loro... Resta con noi, perché si fa sera e il giorno è ormai al tramonto."}
    ]

    # JOHN
    john = [
        {"title": "Il Prologo (Gv 1,1-18)", "content": "In principio era il Verbo, e il Verbo era presso Dio e il Verbo era Dio... E il Verbo si fece carne e venne ad abitare in mezzo a noi."},
        {"title": "Le Nozze di Cana (Gv 2,1-12)", "content": "Sua madre disse ai servitori: 'Qualsiasi cosa vi dica, fatela'. ... Gesù disse loro: 'Riempite d'acqua gli orci'; e li riempirono fino all'orlo."},
        {"title": "Nicodemo (Gv 3,1-21)", "content": "Dio infatti ha tanto amato il mondo da dare il Figlio unigenito, perché chiunque crede in lui non vada perduto, ma abbia la vita eterna."},
        {"title": "La Samaritana al Pozzo (Gv 4,1-42)", "content": "Gesù le risponde: 'Se tu conoscessi il dono di Dio e chi è colui che ti dice: Dammi da bere!, tu avresti chiesto a lui ed egli ti avrebbe dato acqua viva'."},
        {"title": "Il Pane della Vita (Gv 6,22-59)", "content": "Gesù disse loro: 'Io sono il pane della vita; chi viene a me non avrà fame e chi crede in me non avrà sete mai'."},
        {"title": "Il Buon Pastore (Gv 10,1-21)", "content": "Io sono il buon pastore. Il buon pastore dà la propria vita per le pecore. ... Io sono venuto perché abbiano la vita e l'abbiano in abbondanza."},
        {"title": "La Risurrezione di Lazzaro (Gv 11,1-44)", "content": "Gesù le disse: 'Io sono la risurrezione e la vita; chi crede in me, anche se muore, vivrà; chiunque vive e crede in me, non morirà in eterno'."},
        {"title": "La Lavanda dei Piedi (Gv 13,1-20)", "content": "Se dunque io, il Signore e il Maestro, ho lavato i piedi a voi, anche voi dovete lavare i piedi gli uni agli altri. Vi ho dato infatti l'esempio..."},
        {"title": "La Vite e i Tralci (Gv 15,1-17)", "content": "Rimanete in me e io in voi. Come il tralcio non può far frutto da se stesso se non rimane nella vite, così anche voi se non rimanete in me."},
        {"title": "L'Apparizione a Maria Maddalena (Gv 20,11-18)", "content": "Gesù le disse: 'Maria!'. Ella si voltò e gli disse in ebraico: 'Rabbunì!', che significa: 'Maestro!'."}
    ]

    # ENCYCLICALS
    encyclicals = [
        {"title": "Dives in Misericordia (Par. 1)", "content": "Dio, ricco di misericordia, è colui che Gesù Cristo ci ha rivelato come Padre: proprio il suo Figlio, in se stesso, ce l'ha manifestato e fatto conoscere..."},
        {"title": "Dives in Misericordia (Par. 3)", "content": "Il concetto antico di misericordia ha una sua storia lunga e ricca. Ad essa occorre risalire affinché la misericordia risplenda più pienamente..."},
        {"title": "Dives in Misericordia (Par. 7)", "content": "La croce di Cristo, sulla quale il Figlio, consostanziale al Padre, rende piena giustizia a Dio, è anche una rivelazione radicale della misericordia..."},
        {"title": "Dives in Misericordia (Par. 13)", "content": "La Chiesa deve professare e proclamare la misericordia di Dio in tutta la sua verità, quale ci è stata trasmessa dalla rivelazione..."},
        {"title": "Misericordiae Vultus (Par. 1)", "content": "Gesù Cristo è il volto della misericordia del Padre. Il mistero della fede cristiana sembra trovare in questa parola la sua sintesi. Essa è divenuta viva, visibile e ha raggiunto il suo culmine in Gesù di Nazaret."},
        {"title": "Misericordiae Vultus (Par. 3)", "content": "Sempre abbiamo bisogno di contemplare il mistero della misericordia. È condizione della nostra salvezza. Misericordia: è la parola che rivela il mistero della SS. Trinità."},
        {"title": "Misericordiae Vultus (Par. 9)", "content": "Nelle parabole dedicate alla misericordia, Gesù rivela la natura di Dio come quella di un Padre che non si dà mai per vinto fino a quando non ha dissolto il peccato e vinto il rifiuto con la compassione."},
        {"title": "Misericordiae Vultus (Par. 15)", "content": "In questo Giubileo la Chiesa sarà chiamata ancora di più a curare queste ferite, a lenirle con l'olio della consolazione, a fasciarle con la misericordia..."},
        {"title": "Laudato Si' (Par. 1)", "content": "«Laudato si’, mi’ Signore», cantava san Francesco d’Assisi. In questo bel cantico ci ricordava che la nostra casa comune è anche come una sorella, con la quale condividiamo l’esistenza..."},
        {"title": "Evangelii Gaudium (Par. 1)", "content": "La gioia del Vangelo riempie il cuore e la vita intera di coloro che si incontrano con Gesù. Coloro che si lasciano salvare da Lui sono liberati dal peccato, dalla tristezza, dal vuoto interiore, dall’isolamento."}
    ]

    # HOMILIES
    homilies = [
        {"title": "Omelia sulla Divina Misericordia (Francesco)", "content": "La misericordia di Dio non è un'idea astratta, ma una realtà concreta con cui Egli rivela il suo amore come quello di un padre e di una madre che si commuovono per il proprio figlio."},
        {"title": "Omelia per la Canonizzazione di Faustina (G. Paolo II)", "content": "È un giorno veramente grande. Oggi l'amore di Dio si manifesta a noi con particolare intensità tramite la figura di questa umile figlia della Polonia."},
        {"title": "Omelia sulla Coroncina (Papa Francesco)", "content": "La preghiera della coroncina non è una vana ripetizione, ma un grido del cuore che confida nell'abbondanza dei meriti di Cristo."},
        {"title": "Omelia sulla Speranza (Benedetto XVI)", "content": "Spe salvi facti sumus – nella speranza siamo stati salvati, dice san Paolo ai Romani e anche a noi. La redenzione ci è offerta nel senso che ci è stata donata la speranza."},
        {"title": "Omelia sulla Misericordia che salva (G. Paolo II)", "content": "L'uomo non può vivere senza amore. Egli rimane per se stesso un essere incomprensibile, la sua vita è priva di senso, se non gli viene rivelato l'amore..."},
        {"title": "Omelia del Mercoledì delle Ceneri (Francesco)", "content": "La Quaresima è un viaggio di ritorno a Dio. Quante volte, indaffarati o indifferenti, gli abbiamo detto: 'Signore, verrei da Te dopo...'."},
        {"title": "Omelia sulla Pasqua (Benedetto XVI)", "content": "La risurrezione non è un evento del passato; è un salto di qualità nella storia... è l'esplosione dell'amore che ha sciolto l'intreccio del 'morire e divenire'."}
    ]

    # PRAYERS
    prayers = [
        {"title": "Atto di Affidamento alla Misericordia", "content": "Dio, Padre misericordioso, che hai rivelato il Tuo amore nel Figlio Tuo Gesù Cristo, e l'hai riversato su di noi nello Spirito Santo Paraclito, Ti affidiamo oggi i destini del mondo e di ogni uomo."},
        {"title": "Preghiera di Santa Faustina per i Peccatori", "content": "O Gesù, Verità eterna, nostra Vita, invoco e chiedo la Tua misericordia per i poveri peccatori. Dolce Cuore del mio Signore, pieno di compassione e di misericordia..."},
        {"title": "Inno alla carità (1 Cor 13)", "content": "Se anche parlassi le lingue degli uomini e degli angeli, ma non avessi la carità, sarei come un bronzo che rimbomba o un cembalo che tintinna..."},
        {"title": "Preghiera S. Francesco (Semplice)", "content": "Signore, fa' di me uno strumento della tua pace: dove è odio, fa' ch'io porti amore; dove è offesa, ch'io porti il perdono..."},
        {"title": "Anima Christi", "content": "Anima di Cristo, santificami. Corpo di Cristo, salvami. Sangue di Cristo, inebriami. Acqua del costato di Cristo, lavami."}
    ]

    all_new_items = []
    
    def add_batch(batch, cat_id):
        for i, item in enumerate(batch):
            new_item = {
                "id": f"{cat_id}_{i+200}",
                "categoryId": cat_id,
                "themeId": "generale",
                "title": item['title'],
                "content": item['content'],
                "reflectionHints": ["Cosa mi dice questa parola?", "Come posso viverla oggi?"]
            }
            all_new_items.append(new_item)

    add_batch(matthew, 'vangelo')
    add_batch(mark, 'vangelo')
    add_batch(luke, 'vangelo')
    add_batch(john, 'vangelo')
    add_batch(encyclicals, 'enciclica')
    add_batch(homilies, 'omelia')
    add_batch(prayers, 'preghiera')

    # Merge with existing Diario
    existing_items = data.get('items', [])
    existing_diario = [item for item in existing_items if item.get('categoryId') == 'diario']
    
    data['items'] = existing_diario + all_new_items
    
    with open(LIBRARY_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Populated {len(all_new_items)} new items. Total items: {len(data['items'])}")

if __name__ == "__main__":
    populate()
