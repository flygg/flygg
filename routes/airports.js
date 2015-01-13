var csv = require('ya-csv');

var airports = {};
function initialize() {
    var reader = csv.createCsvFileReader('./routes/airports.dat', {
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