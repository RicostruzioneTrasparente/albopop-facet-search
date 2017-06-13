/* Run AlaSQL Queries */
require('script-loader!../../../node_modules/xlsx/dist/xlsx.core.min.js');
var _ = require('lodash'),
    alasql = require('alasql');

module.exports = function(match,fields,terms,size,from) {

    var match = match || "",
        fields = fields || ['_all'],
        terms = terms || {};

    var options = window.ES_CONFIG.options.table;

    var table = options.type+"('"+options.file+"', {separator:'"+options.separator+"'})",
        where_match = _.join(
            _.map(fields, function(f) {
                return "`"+f+"` LIKE '"+match+"'";
            })," OR "
        ),
        where_terms = _.join(
            _.map(
                _.filter(
                    _.values(terms),
                    function(v) {
                        return !_.isEmpty(v.values);
                    }
                ),
                function(t) {
                    return "`"+t.field+"` IN ("+_.join(_.map(t.values, function(v) { return "'"+v+"'"; }))+")";
                }
            )," AND "
        ),
        where = "("+(match ? where_match : "1") + ") AND (" + (where_terms || "1")+")";

    var vterms = _.values(terms);

    var statements = _.concat(
        "SELECT * FROM "+table+" WHERE "+where+" LIMIT "+(size||10)+" OFFSET "+(from||0),
        _.map(vterms, function(v) {
            return _.join([
                "SELECT `"+v.field+"` AS key, COUNT(`"+v.field+"`) AS doc_count",
                "FROM "+table,
                "WHERE "+where,
                "GROUP BY `"+v.field+"`",
                "ORDER BY `"+v.field+"` ASC"
            ]," ");
        })
    );

    console.log("queries", statements);

    return alasql(statements).then(function(response) {

        console.log(response);
        var aggs = {};
        _.forEach(vterms, function(v,i) {
            aggs[v.field] = _.filter(
                response[i+1],
                function(b) { return !_.isUndefined(b.key); }
            );
        });

        var result = {
            query: {
                match: match,
                fields: fields,
                terms: terms,
                size: size,
                from: from
            },
            response: {
                total: response[0].length,
                items: response[0],
                aggs: aggs
            }
        };

        console.log("result",result);
        return result;

    });
};
