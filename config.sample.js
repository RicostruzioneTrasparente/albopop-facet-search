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
            //type: "TSV",
            //type: "JSON",// Only flat json
            //type: "XLSX", // Also for ODS
            file: "./data/sample.csv",
            separator: ","
        }
    }
};
