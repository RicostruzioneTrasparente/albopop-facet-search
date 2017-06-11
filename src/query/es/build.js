/* Build ES Query */
var _ = require('lodash');

module.exports = function(match,fields,terms) {

    var bool = {
        must: [],
        should: [],
        must_not: [],
        filter: {}
    };

    if (match) {
        bool.filter = { multi_match: { query: match, fields: fields } };
    }

    if (!_.isEmpty(terms)) {

        var aggs = {};
        _.forOwn(terms, function(v,k,o) {

            var key = k.split(':'),
                composition = key[0],
                type = key[1],
                name = key[2],
                interval = key[3] || "";

            switch (type) {

                case 'keywords':
                    aggs[name] = { terms: { field: name, order: { _term: 'asc' } } };
                    if (!_.isEmpty(v)) {
                        var tobj = {};
                        tobj[name] = v;
                        bool[composition].push({ terms: tobj });
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
                        bool[composition].push({ range: tobj });
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
                        bool[composition].push({ range: tobj });
                    });
                    break;

            }

        });
    }

    if (!_.isEmpty(bool.should)) {
        bool.minimum_should_match = 1;
    }

    var body = {
        query: {
            bool: bool
        },
        aggs: aggs
    };

    console.log("query",body);
    return body;

};
