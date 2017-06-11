/* Nanoflux + RiotJS + Elasticsearch testing */

var riot = require('riot');

var _ = require('lodash');

var NanoFlux = require('nanoflux-fusion'),
    fusionStore = NanoFlux.getFusionStore();

var query = require("./query/es/run");

var initialState = {
    query: { match: "", fields: [], terms: {}, size: 10, from: 0 },
    response: { total: 0, items: [], aggs: {} }
};

require('./tags/es-facet/es-facet-keywords.tag.html');
var esFacetKeywordsTags = riot.mount('es-facet-keywords');
_.forEach(esFacetKeywordsTags, function(t) {
    initialState.query.terms[t.opts.composition+':'+t.opts.type+':'+t.opts.field] = [];
    t.on("submit", function(state) {
        search({ terms: state });
    });
});

require('./tags/es-facet/es-facet-datetimes.tag.html');
var esFacetDatetimesTags = riot.mount('es-facet-datetimes');
_.forEach(esFacetDatetimesTags, function(t) {
    initialState.query.terms[t.opts.composition+':'+t.opts.type+':'+t.opts.field+':'+t.opts.interval] = [];
    t.on("submit", function(state) {
        search({ terms: state });
    });
});

require('./tags/es-facet/es-facet-numbers.tag.html');
var esFacetNumbersTags = riot.mount('es-facet-numbers');
_.forEach(esFacetNumbersTags, function(t) {
    initialState.query.terms[t.opts.composition+':'+t.opts.type+':'+t.opts.field+':'+t.opts.interval] = [];
    t.on("submit", function(state) {
        search({ terms: state });
    });
});

require('./tags/es-search/es-search.tag.html');
var esSearchTags = riot.mount('es-search', { value: initialState.query.match });
initialState.query.fields = esSearchTags[0].opts.fields ? esSearchTags[0].opts.fields.split(',') : [];
esSearchTags[0].on("submit", function(state) {
    search({ match: state.value });
});

require('./tags/es-list/es-list.tag.html');
var esListTags = riot.mount('es-list', { items: initialState.items });
initialState.query.size = +esListTags[0].opts.size || 10;
esListTags[0].on("submit", function(state) {
    search({ from: state.value });
});

NanoFlux.createFusionator({
    search: function(previousState, args){
        var arg = args[0] || {};
        return query(
            arg.match || previousState.query.match,
            arg.fields || previousState.query.fields,
            _.defaults(arg.terms || {}, previousState.query.terms),
            arg.size || previousState.query.size,
            arg.from || previousState.query.from
        );
	}
}, initialState);

var search = NanoFlux.getFusionActor("search");

function fillFacets(newState, currentState, actionName) {

    _.forOwn(currentState.response.aggs, function(v,k,o) {

        var oldFacets = _.fromPairs(_.map(currentState.response.aggs[k], function(el) {
            return [
                el.key,
                {
                    key: el.key,
                    doc_count: 0,
                    active: false
                }
            ];
        }));

        var newFacets = _.fromPairs(_.map(newState.response.aggs[k], function(el) {
            var name = _.filter(_.keys(newState.query.terms), function(key) { return _.includes(key,':'+k); })[0];
            return [
                el.key,
                {
                    key: el.key,
                    doc_count: el.doc_count,
                    active: _.includes(newState.query.terms[name],_.toString(el.key))
                }
            ];
        }));

        newState.response.aggs[k] = _.orderBy(_.values(_.defaults(newFacets, oldFacets)),'key','asc');

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

    _.forEach(_.concat(esFacetKeywordsTags,esFacetDatetimesTags,esFacetNumbersTags), function(t) {
        t.update({
            opts: _.defaults({
                items: _.map(currentState.response.aggs[t.opts.field], function(el) {
                    return {
                        value: el.key,
                        count: el.doc_count,
                        active: el.active
                    }
                })
            }, t.opts)
        });
    });

});

esSearchTags[0].submit();

