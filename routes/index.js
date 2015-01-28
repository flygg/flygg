var express = require('express');
var datesjs = require('datejs');
var router = express.Router();
var promise = require('q');
var util = require('util');
var ejs = require('ejs')

var finnair = require('../services/finnair');
var matrix = require('../services/matrix');
var airports = require('../services/airports');
var cache = require('../services/cache');

var prices = matrix.prepare(180);
var searched = [];

/**
 * Main controller that does the search for flights to a destination
 * The URL accepts the three-letter IATA code of the destination.
 */
router.get('/search/:iata', function(req, res) {
    if (req.params.iata in airports.codes) {
        cache.client().get('HEL/' + req.params.iata, function(error, data) {
            util.log("Rendering template");
            res.render('index', {
                from: 'HEL',
                to: req.params.iata,
                matrix: prices
            });
            util.log("Rendered template");
            if (error || data === null) {
                util.log(util.format('Searching for flights to %s', req.params.iata));
                finnair.search(Date.today(), 'HEL', req.params.iata)
                .then(function(searches) {
                    cache.client().set('HEL/' + req.params.iata, prices, function(error, data) {
                        util.log('All searches finished; caching results');
                    });
                    cache.client().expire('HEL/' + req.params.iata, 15 * 60);
                })
                .fail(function (error) {
                    util.log(error);
                });
            }
        });
    } else {
        res.status(404).send('Invalid IATA code');
    }
});

module.exports = router;