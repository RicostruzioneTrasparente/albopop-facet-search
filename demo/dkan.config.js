window.ES_CONFIG = {
    backend: "table",
    options: {
        es: {
            host: "http://es.ondata.it",
            index: "albopop-v4-2017.*",
            type: "item"
        },
        table: {
            type: "DKAN",
            file: "http://www.confiscatibene.it/it/api/action/datastore/search.json?resource_id=6af9fa81-1421-4bff-8ec4-5528c815cf21"
        }
    }
};
