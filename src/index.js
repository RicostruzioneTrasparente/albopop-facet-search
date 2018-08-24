/* Nanoflux + RiotJS + Elasticsearch testing */

var riot = require('riot');

var _ = require('lodash');

var NanoFlux = require('nanoflux-fusion'),
    fusionStore = NanoFlux.getFusionStore();

var queries = {
    es: require("./query/es/run"),
    table: require("./query/table/run")
};

var query = queries[window.ES_CONFIG.backend];

var initialState = {
    query: { match: "", fields: [], terms: {}, facet: "", size: 10, from: 0 },
    response: { total: 0, items: [], aggs: {} }
};

require('./tags/es-facet/');
var esFacetTags = _.concat(
    riot.mount('es-facet-keywords'),
    riot.mount('es-facet-datetimes'),
    riot.mount('es-facet-numbers')
);
_.forEach(esFacetTags, function(t) {
    initialState.query.terms[t.opts.field] = {
        type: t.opts.type,
        field: t.opts.field,
        interval: t.opts.interval,
        size: t.opts.size,
        order: t.opts.order,
        values: []
    };
    t.on("submit", function(state) {
        var tobj = {};
        tobj[t.opts.field] = state;
        search({ terms: tobj, facet: !_.isEmpty(state.values) ? t.opts.type+':'+t.opts.field : "" });
    });
});

require('./tags/es-search/');
var esSearchTags = riot.mount('es-search');
initialState.query.fields = esSearchTags[0].opts.fields ? esSearchTags[0].opts.fields.split(',') : [];
esSearchTags[0].on("submit", function(state) {
    search({ match: state.value });
});

require('./tags/es-list/');
var esListTags = riot.mount('es-list');
initialState.query.size = +esListTags[0].opts.size || 10;
esListTags[0].on("submit", function(state) {
    search({ from: state.value });
});

require('./tags/es-feed/');
var esFeedTags = riot.mount('es-feed');

NanoFlux.createFusionator({
    search: function(previousState, args){
        var arg = args[0] || {};
        return query(
            !_.isUndefined(arg.match) ? arg.match : previousState.query.match,
            !_.isUndefined(arg.fields) ? arg.fields : previousState.query.fields,
            _.defaults(arg.terms || {}, previousState.query.terms),
            !_.isUndefined(arg.facet) ? arg.facet : previousState.query.facet,
            !_.isUndefined(arg.size) ? arg.size : previousState.query.size,
            !_.isUndefined(arg.from) ? arg.from : previousState.query.from
        );
	}
}, initialState);

var search = NanoFlux.getFusionActor("search");

function fillFacets(newState, currentState, actionName) {

    _.forOwn(currentState.response.aggs, function(v,k,o) {

        var newFacets = _.fromPairs(_.map(newState.response.aggs[k], function(el) {
            return [
                el.key,
                {
                    key: el.key,
                    doc_count: el.doc_count,
                    active: _.includes(newState.query.terms[k].values,_.toString(el.key))
                }
            ];
        }));

        var newAggs = [];
        _.each(currentState.response.aggs[k], function(v,i) {
            newAggs.push(newFacets[v.key] || { key: v.key, doc_count: 0, active: false });
        });

        newState.response.aggs[k] = newAggs;

    });

    return newState;
}

fusionStore.use(fillFacets);

var subscription = fusionStore.subscribe(this, function(currentState) {

    _.forEach(esListTags, function(t) {
        t.update({
            opts: _.defaults({
                total: currentState.response.total,
                items: currentState.response.items
            }, t.opts)
        });
    });

    _.forEach(esFacetTags, function(t) {
        if (t.opts.type+':'+t.opts.field !== currentState.query.facet) {
            t.update({
                opts: _.defaults({
                    items: _.map(currentState.response.aggs[t.opts.field], function(el) {
                        return {
                            value: el.key,
                            count: el.doc_count,
                            active: el.active
                        }
                    }),
                    missing: Math.abs(currentState.response.total - _.sumBy(currentState.response.aggs[t.opts.field], function(el) { return el.doc_count; }))
                }, t.opts)
            });
        }
    });

    _.forEach(esFeedTags, function(t) {
        t.update({
            opts: _.defaults({
                data: currentState.query
            }, t.opts)
        });
    });

});

esSearchTags[0].submit();

