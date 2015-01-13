var datesjs = require('datejs');

/**
 * Build the JSON structure in memory to store the matrix representation
 * of the pricing table. This is the matrix that will be populated with
 * the prices from the search results
 * 
 * @param {Integer} The number of days (rows and columns) that should be used
 */
function prepare(quantity) {
    matrix = {};
    depart = Date.today();
    for (var i = 0; i < quantity; i++) {
        matrix[depart] = {};
        arrive = Date.today();
        for (var j = 0; j < quantity; j++) {
            matrix[depart][arrive] = "";
            arrive.add(1).days();
        }
        depart.add(1).days();
    }
    return matrix;
}

module.exports.prepare = prepare