var util = require('util');

var socket;

/**
 * Initializes the channel handler from faye that allows us to push information
 * to the subscribers
 *
 * @param {Faye} The instance of the Faye to push data through
 */
function initialize(bayeux) {
    util.log("Setting up the channel handler to push data to subscribers");
    socket = bayeux;
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
function publish(from, to, data) {
    util.log(util.format("Pushing data to subscibers on channel %s", from + '-' + to));
    socket.getClient().publish('/' + from + '-' + to, data);
}

module.exports.initialize = initialize
module.exports.publish = publish