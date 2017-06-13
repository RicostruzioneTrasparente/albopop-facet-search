/* Run ES Query */
var _ = require('lodash');
var elasticsearch = require('elasticsearch'),
    client = new elasticsearch.Client({
        host: window.ES_CONFIG ? window.ES_CONFIG.options.es.host : "localhost:9200"
    });

module.exports = function(match,fields,terms,size,from) {

    var buildQuery = require("./build");
    var match = match || "",
        fields = fields || ['_all'],
        terms = terms || {};

    return client.search({
        index: window.ES_CONFIG ? window.ES_CONFIG.options.es.index : 'my-index',
        type: window.ES_CONFIG ? window.ES_CONFIG.options.es.type : 'my-type',
        body: buildQuery(match,fields,terms,size,from)
    }).then(function(response) {

        var aggs = {};
        _.forOwn(terms, function(v,k,o) {
            aggs[v.field] = response.aggregations[v.field].buckets
        });

        var result = {
            query: {
                match: match,
                fields: fields,
                terms: terms
            },
            response: {
                total: response.hits.total,
                items: _.map(response.hits.hits, function(hit) {
                    return hit['_source'];
                }),
                aggs: aggs
            }
        };

        console.log("result",result);
        return result;

    });
};

