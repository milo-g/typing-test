/*
    *
    * utils.js - Utility functions module
    *
*/


function makeOutputFromLines(linesArray) {
    let output = "";
    
    for (let i = 0; i < linesArray.length; i++) {
        output += linesArray[i];
        output += "\n";
    }
    
    return output;
}

function wordsFromMode(mode) {
    if (mode == "BASIC") {
        return require('../etc/basic_words.json');
    }
    
    if (mode == "ADVANCED") {
        return require('../etc/advanced_words.json');
    }
}

module.exports.makeOutputFromLines = makeOutputFromLines;
module.exports.wordsFromMode = wordsFromMode;
