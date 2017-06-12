# Componente <es-search>

Ricerca libera full-text.

Attributi: placeholder, value.

Evento emesso: submit.

Esempio dati passati alla funzione di callback (testo immesso dall'utente): `{ value: "terremoto" }`.

## Esempio d'uso

HTML

```
<es-search fields="title,description" placeholder="Cerca..." value="terremoto"></es-search>
```

Javascript

```
require('./es-search.tag.html');
var tags = riot.mount('es-search');
tags[0].on("submit", function(state) {
    console.log("es-search value:", state.value);
});
```

## Markup generato

```
<form class="search-form">
    <input class="search-input" placeholder="{ placeholder }" value="{ value }">
</form>
```

