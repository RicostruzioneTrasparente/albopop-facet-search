/* Run AlaSQL Queries */
require('script-loader!../../../node_modules/xlsx/dist/xlsx.core.min.js');
require('script-loader!../../../node_modules/tabletop/src/tabletop.min.js');
var _ = require('lodash'),
    alasql = require('alasql');

module.exports = (function() {

    var data, tags = [];

    var options = window.ES_CONFIG.options.table;

    var table_params = "";

    switch (options.type) {
        case 'CSV':
            table_params = ", {separator:'"+(options.separator||",")+"'}";
            break;
        case 'TABLETOP':
        case 'GSHEET':
            table_params = ", {sheet:'"+(options.sheet||"")+"'}";
            break;
        default:
            table_params = "";
            break;
    }

    var table = options.type+"('"+options.file+"'"+table_params+")";

    function process(match,fields,terms,facet,size,from,order) {

        var match = match || "",
            fields = fields ? _.map(fields, function(f) { return f.replace(/[\.]/g, (options.type === 'JSON' ? '->' : '.')); }) : [],
            terms = terms || {};

        var sortBy = !_.isEmpty(order) ? order[0] : "",
            sortDirection = !_.isEmpty(order) && order.length > 1 ? order[1] : "DESC";

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
                        if (t.separator) {
                            return _.join(
                                _.map(
                                    t.values,
                                    function(v) {
                                        var v = v.trim();
                                        return ""+
                                            "`"+field+"` LIKE '%"+t.separator+v+t.separator+"%'"+
                                            " OR `"+field+"` LIKE '%"+t.separator+v+"%'"+
                                            " OR `"+field+"` LIKE '%"+v+t.separator+"%'";
                                    }
                                ),
                                " OR "
                            )
                        } else {
                            return "`"+field+"` IN ("+_.join(_.map(t.values, function(v) { return "'"+v+"'"; }))+")";
                        }
                    }
                )," AND "
            ),
            where = "("+(match ? where_match : "1") + ") AND (" + (where_terms || "1")+")",
            orderby = !_.isEmpty(order) ? "ORDER BY "+sortBy+" "+sortDirection : "";

        var vterms = _.values(terms);

        var statements = _.concat(
            [["SELECT * FROM ? WHERE "+where+" "+orderby+" LIMIT "+(size||10)+" OFFSET "+(from||0), [data]]],
            _.map(vterms, function(v) {
                var field = v.field.replace(/[\.]/g, (options.type === 'JSON' ? '->' : '.'));
                return [_.join([
                    "SELECT `"+field+"` AS key, COUNT(`"+field+"`) AS doc_count",
                    "FROM ?",
                    "WHERE "+where,
                    "GROUP BY `"+field+"`",
                    "ORDER BY doc_count DESC"
                ]," "), [v.separator ? tags : data]];
            })
        );

        console.log("queries", statements);
        return alasql(statements).then(function(response) {

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
                    facet: facet,
                    size: size,
                    from: from
                },
                response: {
                    total: data.length,
                    items: response[0],
                    aggs: aggs
                }
            };

            console.log("result",result);
            return result;

        });
    };

    return function(match,fields,terms,facet,size,from,order) {

        if (_.isUndefined(data)) {
            return alasql.promise("SELECT * FROM "+table).then(function(response) {
                data = response;
                _.each(_.filter(_.values(terms), function(term) { return term.separator; }), function(term) {
                    _.each(response, function(el) {
                        _.each(el[term.field].split(term.separator), function(tag) {
                            var item = _.cloneDeep(el);
                            item[term.field] = tag.trim();
                            tags.push(item);
                        });
                    });
                });
                return process(match,fields,terms,facet,size,from,order);
            });
        } else {
            return process(match,fields,terms,facet,size,from,order);
        }

    };

})();
