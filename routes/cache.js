var redis = require("redis")
var util = require('util');

var channels = require('./channels');
var client;

/**
 * Initializes the channel handler from faye that allows us to push information
 * to the subscribers
 */
function initialize() {
    util.log("Setting up the cache manager to store scraped values");
    client = redis.createClient();
}

/**
 * Fetches and pushed any cached prices to any subscribers who are watching for prices.
 * Each client listens on a channel identified by the three letter ICAO code
 * of the departure and arrival airports, separated by a dash
 *
 * @param {String} The three-letter IATA code of the departure aiport
 * @param {String} The three-letter IATA code of the arrival aiport
 */
function fetch(from, to) {
    var pattern = util.format("*-%s/%s-*", from, to);
    util.log(util.format("Fetching all cached prices that look like %s", pattern));
    client.keys(pattern, function(err, keys) {
        keys.forEach(function (key) {
            client.hgetall(key, function(err, dates) {
                for(var date in dates) {
                    var depart = key.split("-").pop();
                    var arrive = date;
                    var price = dates[date];
                    channels.publish(from, to, {
                        depart: depart,
                        arrive: arrive,
                        price: price
                    });
                }
            });
        });
    });
}

/**
 * Pushes any fetched prices to any subscribers who are watching for prices.
 * Each client listens on a channel identified by the three letter ICAO code
 * of the departure and arrival airports, separated by a dash
 *
 * @param {String} The three-letter IATA code of the departure aiport
 * @param {String} The three-letter IATA code of the arrival aiport
 * @param {Object} The data that needs to be pushed to all the subscribers
 */
function preserve(airline, from, to, depart, arrive, price) {
    var key = util.format("%s-%s/%s-%s", airline, from, to, depart);
    util.log(util.format("Caching data to redis to key %s '%s@%s'", key, price, arrive));
    var value = {};
    value[arrive] = price;
    client.hmset(key, value, function (err, status) {
        if (err) throw err;
    });
}

module.exports.initialize = initialize
module.exports.preserve = preserve
module.exports.fetch = fetch