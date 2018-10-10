window.ES_CONFIG = {
    backend: "es",
    options: {
        es: {
            host: "http://es.ondata.it",
            index: "albopop-v4-2018.*",
            type: "item"
        },
        table: {
            type: "CSV",
            file: "./data/sample.csv",
            separator: ","
        }
    }
};
