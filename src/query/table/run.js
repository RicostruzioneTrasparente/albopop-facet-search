/* Run AlaSQL Queries */
require('script-loader!../../../node_modules/xlsx/dist/xlsx.core.min.js');
require('script-loader!../../../node_modules/tabletop/src/tabletop.min.js');
var _ = require('lodash'),
    alasql = require('alasql');

module.exports = (function() {

    var data;

    var options = window.ES_CONFIG.options.table;

    var table_params = options.type === 'CSV' ? ", {separator:'"+(options.separator||",")+"'}" : "",
        table = options.type+"('"+options.file+"'"+table_params+")";

    function process(match,fields,terms,facet,size,from) {

        var match = match || "",
            fields = fields ? _.map(function(f) { return f.replace(/[\.]/g, (options.type === 'JSON' ? '->' : '.')); }) : [],
            terms = terms || {};

        var where_match = _.join(
                _.map(fields, function(f) {
                    return "`"+f+"` LIKE '%"+match+"%'";
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
                        var field = t.field.replace(/[\.]/g, (options.type === 'JSON' ? '->' : '.'));
                        return "`"+field+"` IN ("+_.join(_.map(t.values, function(v) { return "'"+v+"'"; }))+")";
                    }
                )," AND "
            ),
            where = "("+(match ? where_match : "1") + ") AND (" + (where_terms || "1")+")";

        var vterms = _.values(terms);

        var statements = _.concat(
            [["SELECT * FROM ? WHERE "+where, [data]]],
            [["SELECT * FROM ? WHERE "+where+" LIMIT "+(size||10)+" OFFSET "+(from||0), [data]]],
            _.map(vterms, function(v) {
                var field = v.field.replace(/[\.]/g, (options.type === 'JSON' ? '->' : '.'));
                return [_.join([
                    "SELECT `"+field+"` AS key, COUNT(`"+field+"`) AS doc_count",
                    "FROM ?",
                    "WHERE "+where,
                    "GROUP BY `"+field+"`",
                    "ORDER BY doc_count DESC"
                ]," "), [data]];
            })
        );

        console.log("queries", statements);

        return alasql(statements).then(function(response) {

            console.log(response);
            var aggs = {};
            _.forEach(vterms, function(v,i) {
                aggs[v.field] = _.filter(
                    response[i+2],
                    function(b) { return !_.isUndefined(b.key); }
                );
            });

            var result = {
                query: {
                    match: match,
                    fields: fields,
                    terms: terms,
                    facet: facet,
                    size: size,
                    from: from
                },
                response: {
                    total: response[0].length,
                    items: response[1],
                    aggs: aggs
                }
            };

            console.log("result",result);
            return result;

        });
    };

    return function(match,fields,terms,facet,size,from) {

        if (_.isUndefined(data)) {
            return alasql.promise("SELECT * FROM "+table).then(function(response) {
                data = response;
                return process(match,fields,terms,facet,size,from);
            });
        } else {
            return process(match,fields,terms,facet,size,from);
        }

    };

})();
