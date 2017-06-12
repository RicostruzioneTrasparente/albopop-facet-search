# Componenti <es-facet-*>

Filtri a faccette.

## Componente <es-facet-keywords>

Filtro su variabile categoriale.

Attributi: field.

Evento emesso: submit.

Esempio dati passati alla funzione di callback: `{ type: "", field: "", values: [] }`.

### Esempio d'uso

HTML

```
<es-facet-keywords field="category"></es-facet-keywords>
```

Javascript

```
require('./es-facet-keywords.tag.html');
var tags = riot.mount('es-facet-keywords');
tags[0].on("submit", function(state) {
    console.log("es-facet-keywords values:", state.values);
});
```

### Markup generato

```
<div class="facet-item { disable } { active }">
    <span class="facet-label" data-value="{ value }">{ label }</span>&nbsp;<span class="facet-count">{ count }</span>
</div>
```

## Componente <es-facet-datetimes>

Filtro su variabile temporale.

Attributi: field, format, interval.

Evento emesso: submit.

Esempio dati passati alla funzione di callback: `{ type: "", field: "", interval: "", values: [] }`.

### Esempio d'uso

HTML

```
<es-facet-datetimes format="%Y-%m-%d" field="pubdate" interval="day"></es-facet-datetimes>
```

Javascript

```
require('./es-facet-datetimes.tag.html');
var tags = riot.mount('es-facet-datetimes');
tags[0].on("submit", function(state) {
    console.log("es-facet-datetimes values:", state.values);
});
```

### Markup generato

La label è generata mediante [strftime](https://samhuri.net/projects/strftime).

```
<div class="facet-item { disable } { active }">
    <span class="facet-label" data-value="{ value }">{ label }</span>&nbsp;<span class="facet-count">{ count }</span>
</div>
```

## Componente <es-facet-numbers>

Filtro su variabile numerica.

Attributi: field, format, interval.

Evento emesso: submit.

Esempio dati passati alla funzione di callback: `{ type: "", field: "", interval: "", values: [] }`.

### Esempio d'uso

HTML

```
<es-facet-numbers format="0,0" field="distance" interval="10"></es-facet-numbers>
```

Javascript

```
require('./es-facet-numbers.tag.html');
var tags = riot.mount('es-facet-numbers');
tags[0].on("submit", function(state) {
    console.log("es-facet-numbers values:", state.values);
});
```

### Markup generato

La label è generata mediante [numeral](http://numeraljs.com/).

```
<div class="facet-item { disable } { active }">
    <span class="facet-label" data-value="{ value }">{ label }</span>&nbsp;<span class="facet-count">{ count }</span>
</div>
```

