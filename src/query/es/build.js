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

            var key = k.split(':'),
                type = key[0],
                name = key[1],
                interval = key[2] || "";

            switch (type) {

                case 'keywords':
                    aggs[name] = { terms: { field: name, order: { _term: 'asc' } } };
                    if (!_.isEmpty(v)) {
                        var tobj = {};
                        tobj[name] = v;
                        query.bool.must.bool.should.push({ terms: tobj });
                    }
                    break;

                case 'datetimes':
                    aggs[name] = { date_histogram: { field: name, interval: interval } };
                    _.forEach(v, function(vi) {
                        var tobj = {};
                        tobj[name] = {
                            gte: vi,
                            lt: vi+'||+1'+interval[0],
                            format: 'epoch_millis'
                        };
                        query.bool.must.bool.should.push({ range: tobj });
                    });
                    break;

                case 'numbers':
                    aggs[name] = { histogram: { field: name, interval: +interval } };
                    _.forEach(v, function(vi) {
                        var tobj = {};
                        tobj[name] = {
                            gte: +vi,
                            lt: (+vi)+(+interval)
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
