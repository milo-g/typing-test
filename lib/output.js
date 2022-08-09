/*
    *
    * output.js - Handles screen output
    *
*/

const END_COLOR = "\x1b[0m";

function outputLines(lines) {
    console.log(makeOutputFromLines(lines));
}

function outputScreenLines(lines, done) { 
    createScreen();
    makeScreenOutputFromLines(lines, 8, done);
//    console.log(makeScreenOutputFromLines(lines, 3, 4));
}

function clearLines(lineCount) {
    process.stdout.moveCursor(0, -lineCount);
    process.stdout.clearScreenDown();
}

function createInitialOutput() {
    const Utils = require('utils.js');
    let lines = createWordLines(5);
    outputLines(Utils.makeOutputFromLines(lines));
}


function formatWord(wordo) {
    let word = wordo["word"];
    let highlight = wordo["highlight"];
    let error = wordo["error"];
    let good = wordo["good"];
    let bad = wordo["bad"];
    
    let bg = "";
    let fg = "";
    let end = "";
    // console.log(wordo);
    if (highlight && error) {
        bg = "\x1b[45m";
        fg = "\x1b[34m";
        end = END_COLOR;
    } else if (highlight) {
        bg = "\x1b[43m";
        fg = "\x1b[30m";
        end = END_COLOR;
    } else if (good && !bad) {
       fg = "\x1b[34m";
       end = END_COLOR
    } else if (bad) {
        bg = "\x1b[45m";
        end = END_COLOR;
    }
    return bg + fg + word + end;
}

function createScreen() {
    console.log('\033[2J');
}

function makeOutputFromLines(linesArray) {
    let output = "";
    
    for (let i = 0; i < linesArray.length; i++) {
        
        output += linesArray[i];
        output += "\n";
    }
    
    return output;
}

function makeScreenOutputFromLines(linesArray, gameLine, done) {
    let output = "";
    
    for (let i = 0; i < linesArray.length; i++) {
        let lineStr = linesArray[i];
        
        if (!done && (i == gameLine || i == gameLine + 1)) {
            lineStr = "";
            for (let j = 0; j < linesArray[i].length; j++) {
                lineStr += formatWord(linesArray[i][j]) + " ";
            }
        }
        
        output += lineStr;
        let newLine = (i != linesArray.length - 1) ? "\n" : "";
        process.stdout.write(lineStr + newLine);
    }
    
    return output;
}

module.exports.outputLines = outputLines;
module.exports.outputScreenLines = outputScreenLines;
module.exports.clearLines = clearLines;
module.exports.createInitialOutput = createInitialOutput;
module.exports.createScreen = createScreen;
