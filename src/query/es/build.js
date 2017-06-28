/* Build ES Query */
var _ = require('lodash');

module.exports = function(match,fields,terms,size,from) {

    var query = {
        bool: {
            must: {
                bool: {
                    should: [],
                    minimum_should_match: 1
                }
            },
            filter: {}
        }
    };

    if (match) {
        query.bool.filter = { multi_match: { query: match, fields: fields } };
    }

    if (!_.isEmpty(terms)) {

        var aggs = {};
        _.forOwn(terms, function(v,k,o) {

            switch (v.type) {

                case 'keywords':
                    var order = {},
                        orderBy = v.order[0] || "_count",
                        orderDirection = v.order[1] || "desc";
                    order['_'+orderBy] = orderDirection;
                    aggs[v.field] = { terms: { field: v.field, order: order, size: v.size } };
                    if (!_.isEmpty(v.values)) {
                        var tobj = {};
                        tobj[v.field] = v.values;
                        query.bool.must.bool.should.push({ terms: tobj });
                    }
                    break;

                case 'datetimes':
                    aggs[v.field] = { date_histogram: { field: v.field, interval: v.interval } };
                    _.forEach(v.values, function(vi) {
                        var tobj = {};
                        tobj[v.field] = {
                            gte: vi,
                            lt: vi+'||+1'+v.interval[0],
                            format: 'epoch_millis'
                        };
                        query.bool.must.bool.should.push({ range: tobj });
                    });
                    break;

                case 'numbers':
                    aggs[v.field] = { histogram: { field: v.field, interval: +v.interval } };
                    _.forEach(v.values, function(vi) {
                        var tobj = {};
                        tobj[v.field] = {
                            gte: +vi,
                            lt: (+vi)+(+v.interval)
                        };
                        query.bool.must.bool.should.push({ range: tobj });
                    });
                    break;

            }

        });
    }

    var body = {
        size: size || 10,
        from: from || 0,
        query: query,
        aggs: aggs
    };

    console.log("query",body);
    return body;

};
