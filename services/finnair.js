var promise = require('q');
var request = require('request');
var cheerio = require('cheerio');
var util = require('util');

var cache = require('./cache');
var channels = require('./channels');

function params(depart, arrive, from, to) {
    return {
        TRANSACTION_ID:                'START_OVER',
        SERVLET_NAME_KEY:              'AirSearch',
        B_LOCATION_1:                  from,
        B_LOCATION_2:                  to,
        E_LOCATION_1:                  to,
        E_LOCATION_2:                  from,
        B_DATE_1:                      depart.toString('yyyyMMdd0000'),
        B_DATE_2:                      arrive.toString('yyyyMMdd0000'),
        E_DATE_1:                      depart.toString('yyyyMMdd0000'),
        E_DATE_2:                      arrive.toString('yyyyMMdd0000'),
        DATE_RANGE_VALUE_1:            '3',
        DATE_RANGE_VALUE_2:            '3',
        TRAVELLER_TYPE:                'ADT',
        NB_TRAVELLERS:                 '1',
        FARE_TYPE:                     '',
        CABIN:                         'E',
        NB_CHILDREN:                   '0',
        NB_INFANTS:                    '0',
        TRIP_TYPE:                     'R',
        EXTERNAL_ID:                   '',
        EXTERNAL_ID_2:                 '',
        EXTERNAL_ID_3:                 '',
        SITE:                          'FINRFINR',
        LANGUAGE:                      'GB',
        COUNTRY_SITE:                  'INT',
        SKIN:                          'STANDARD',
        PAGE:                          'WAIT',
        PAGE_FROM:                     'FPRO' };
}

/**
 * Searches Finnair for prices and returns the price elements found on
 * the page.
 *
 * @param {Date} The departure date to search for
 * @param {Date} The arrival date to search for
 * @param {String} The airport code to depart from
 * @param {String} The airport code to arrive at
 */
function prepare(depart, arrive, from, to) {
    var deferred = promise.defer();
    request.post({
        url: 'https://www.finnair.com/pl/AYPortal/wds/StartOver.action',
        form: params(depart, arrive, from, to)
    },
    function(error, response, html) {
        if (error) {
            util.log('Unable to make the request to Finnair');
            deferred.reject(error);
        } else {
            util.log('Successfully made the request to Finnair');
            results = [];
            var $ = cheerio.load(html);
            $('input[name=WDS_DATE]').each(function(i, element) {
                data = $(element).attr('value').split('|');
                results.push({
                    depart: Date.parseExact(data[0].trim(), 'yyyyMMddhhmm'),
                    arrive: Date.parseExact(data[1].trim(), 'yyyyMMddhhmm'),
                    price: data[2].trim().slice(0,-7)
                });

                var depart = data[0].trim();
                var arrive = data[1].trim();
                var price = data[2].trim().slice(0,-7);
                channels.publish(from, to, {
                    depart: depart,
                    arrive: arrive,
                    price: price
                });
                cache.preserve('AY', from, to, depart, arrive, price);
            });
            util.log(util.format("Retreived %d results", results.length));
            deferred.resolve(results);
        }
    });

    return deferred.promise;
}

/**
 * Builds the list of search requests that should be made to Finnair and
 * returns the promises. Since multiple requestes need to be made in
 * order to fetch the results, we get a promise object from the each of
 * the searches and wrap them using `all` into one collective promise.
 * Since Finnair uses a flex-pricer that allows you to search for prices
 * for +/- 3 days of a departure and arrival date, we try to use that to
 * build a much larger matrix of results.
 *
 * @param {Date} The departure date to search for
 * @param {Date} The arrival date to search for
 * @param {String} The airport code to depart from
 * @param {String} The airport code to arrive at
 */
function search(date, from, to) {
    depart = date.clone().add(-4).days();
    searches = [];
    for (i = 0; i <= 24; i++) {
        depart = depart.add(7).days();
        arrive = depart.clone().add(-4).days();
        for (j = 0; j <= 4; j++) {
            arrive = arrive.add(4).days();
            going  = depart.toString('ddd, MMM dd');
            coming = arrive.toString('ddd, MMM dd');
            util.log(util.format("Preparing search for %s to %s", going, coming));
            searches.push(prepare(depart, arrive, from, to));
        }
    }
    util.log(util.format("Prepared %d search queries", searches.length));
    return promise.all(searches);
}

module.exports.search = search