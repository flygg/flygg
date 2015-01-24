var csv = require('ya-csv');
var path = require('path');
var util = require('util');

var airports = {};
function initialize() {
    util.log("Loading all the airport configuration data");
    var datfile = path.resolve(__dirname, 'airports.dat');
    var reader = csv.createCsvFileReader(datfile, {
        'separator': ',',
        'quote': '"',
        'escape': '"',
        'comment': '',
    });

    reader.setColumnNames(['id',
        'name',
        'city',
        'country',
        'iata',
        'icao',
        'latitude',
        'longitude',
        'altitude',
        'timezone',
        'dst']);

    reader.addListener('data', function(data) {
        airports[data.iata] = data;
    });

    reader.addListener('end', function(data) {
        return airports;
    });
};

initialize();
module.exports.codes = airports
