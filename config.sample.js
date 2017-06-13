window.ES_CONFIG = {
    backend: "es",
    options: {
        es: {
            host: "localhost:9200",
            index: "my-index",
            type: "my-type"
        },
        table: {
            type: "CSV",
            file: "./data/sample.csv",
            separator: ","
        }
    }
};
