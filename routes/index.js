var express = require('express');
var datesjs = require('datejs');
var router = express.Router();
var promise = require('q');
var util = require('util');

var finnair = require('./finnair');
var matrix = require('./matrix');
var airports = require('./airports');

prices = matrix.prepare(30);
searched = [];

/**
 * Main controller that does the search for flights to a destination
 * The URL accepts the three-letter IATA code of the destination.
 */
router.get('/search/:iata', function(req, res) {
    if (req.params.iata in airports.codes) {
        if (prices[req.params.iata] === undefined) {
            prices[req.params.iata] = matrix.prepare(30);
            util.log(util.format('Searching for flights to %s', req.params.iata));
            finnair.search(Date.today(), 'HEL', req.params.iata)
            .then(function(searches) {
                util.log('All searches finished; processing results');
                searches.forEach(function(search) {
                    search.forEach(function (result) {
                        prices[req.params.iata][result.depart][result.arrive] = result.price;
                    });
                });
            })
            .fail(function (error) {
                console.log(error);
            });
        }
        res.render('index', {
            to: req.params.iata,
            matrix: prices[req.params.iata]
        });
    } else {
        res.status(404).send('Invalid IATA code');
    }
});

module.exports = router;