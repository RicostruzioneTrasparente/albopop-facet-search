# AlboPOP Faceted Search

Interfaccia grafica per la ricerca e la navigazione dell'archivio di AlboPOP indicizzato su Elasticsearch.

Supporta quattro tipologie di filtro:

- *search*: ricerca libera full-text;
- *keywords*: variabile categoriale;
- *datetimes*: variabile temporale;
- *numbers*: variabile numerica.

E una tipologia di presentazione dei risultati:

- *list*: una lista di documenti con paginazione.

Per i dettagli fare riferimento al file index.html (markup) e ai rispettivi file README.md nelle cartelle in src/tags/.

## Temi

Lo stile dell'applicazione si può specificare come file css da includere in index.html.
Il markup dei tag è personalizzabile oppure documentato.

## Installazione in locale

Clona il repository: `git clone https://github.com/RicostruzioneTrasparente/albopop-facet-search.git && cd albopop-facet-search/`.

Copia e compila opportunamente il file di configurazione: `cp config.sample.js config.js`.

Servi il file `index.html` da un web server e aprilo in un browser.

## Sviluppo

Clona il repository: `git clone https://github.com/RicostruzioneTrasparente/albopop-facet-search.git && cd albopop-facet-search/`.

Installa le dipendenze: `npm install`.

Modifica i file nella cartella `src/` e compila con `npm run build` per generare il file `js/bundle.js`.

