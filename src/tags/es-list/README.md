# Componente <es-list>

Output dei risultati sotto forma di lista.

Attributi: size, prev, next.

Evento emesso: submit.

Esempio dati passati alla funzione di callback (numero di pagina selezionata): `{ value: 2 }`.

## Esempio d'uso

HTML

```
<es-list size="25" prev="Pagina precedente" next="Pagina successiva">
    <h1>{ title }</h1>
    <p>{ description }</p>
</es-list>
```

Javascript

```
require('./es-list.tag.html');
var tags = riot.mount('es-list');
tags[0].on("submit", function(state) {
    console.log("es-list value:", state.value);
});
```

## Markup generato

Al posto del tag `<yield/>` viene generato il markup personalizzato dell'utente.

```
<div class="list-item"><yield/></div>
...
<div>
    <span class="list-page" data-value="0">{ prev }</span>
    <span class="list-page" data-value="{ page }">{ page+1 }</span>
    ...
    <span class="list-page" data-value="1">{ next }</span>
</div>
```

