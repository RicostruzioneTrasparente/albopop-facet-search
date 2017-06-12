/* Run ES Query */
var _ = require('lodash');
var elasticsearch = require('elasticsearch'),
    client = new elasticsearch.Client({
        host: window.ES_CONFIG ? window.ES_CONFIG.host : "localhost:9200"
    });


module.exports = function(match,fields,terms,size,from) {

    var buildQuery = require("./build");
    var match = match || "",
        fields = fields || ['_all'],
        terms = terms || {};

    return client.search({
        index: window.ES_CONFIG ? window.ES_CONFIG.index : 'my-index',
        type: window.ES_CONFIG ? window.ES_CONFIG.type : 'my-type',
        body: buildQuery(match,fields,terms,size,from)
    }).then(function(response) {

        var aggs = {};
        _.forOwn(terms, function(v,k,o) {
            var key = k.split(':'),
                name = key[1];
            aggs[name] = response.aggregations[name].buckets
        });

        var result = {
            query: {
                match: match,
                fields: fields,
                terms: terms
            },
            response: {
                total: response.hits.total,
                items: response.hits.hits.map(function(hit) {
                    return hit['_source'];
                }),
                aggs: aggs
            }
        };

        console.log("result",result);
        return result;

    });
};

