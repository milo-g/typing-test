/*
    *
    * game.js - Main game logic
    *
*/

var TIME_LIMIT = 60;
var TIMELIMIT_TIMER;

var gameRunning = false;
var totalKeystrokes = 0;
var badKeystrokes = 0;
var curTime = TIME_LIMIT;
var done = false;

var curLineIdx = 0;
var curLineWordIdx = 0;
var words = [];
var curLine = []
var nextLine = [];
var curChars = "";

var totalWords = 0;
var wrongWords = 0;

var basic = true;

const WIDTH = (process.stdout.columns || 80 ) - 10;
const BASIC_WORDS = require('../etc/200words.json');
const ADV_WORDS = require('../etc/1000words.json');

const HIGHLIGHT_BG = "\x1b[43m";
const HIGHLIGHT_FG = "\x1b[30m";
const END_COLOR = "\x1b[0m";

const Output = require('./output');
const Save = require('./save');
const util = require('util');

var canQuit = false;
var resultLines = [];

function prepareGame(mode, time) {
    words = BASIC_WORDS;
    
    if (mode == "ADVANCED") {
        basic = false;
        words = ADV_WORDS;
    }

    TIME_LIMIT = time;
    curTime = time;
    curLine = generateNewLine(WIDTH, true);
    nextLine = generateNewLine(WIDTH);
    
    let outputLines = generateGameLines();
    Output.outputScreenLines(outputLines);   
}

function generateNewLine(maxLength, highlight = false) {
    
    let line = [];
    let lineLen = 0;
    while (true) {
        let newWord = getNewWord();
        
        if (shouldCapitalize()) {
            let char = newWord.charAt(0).toUpperCase();
//            char = char.toUppercase();
            newWord = char + newWord.slice(1);
        }
        
        if (lineLen + newWord.length <= maxLength) {
            line.push({"word": newWord, "highlight": highlight, "error": false, "good": false, "bad": false});
            lineLen += newWord.length + 1;
            highlight = false;
        } else {
            break;
        }
    }
    
    return line;
}

function shouldCapitalize() {
    let probability = 0.2;
    
    if (basic == true) {
        probability = 0.05;
    }
    
    return (Math.random() < probability);
}

function makeHighlightedWord(word, error = false) {
    let bg = HIGHLIGHT_BG
    let fg = HIGHLIGHT_FG
    
    if (error) {
        bg = "\x1b[45m";
        fg = "\x1b[34m";
    }
    
    return bg + fg + word + END_COLOR;
}


function getNewWord() {
    let idx = Math.floor(Math.random() * words.length);
    return words[idx];
}

function startGame() {
    gameRunning = true;
    Output.clearLines(1);
    startTimer();
}

function startTimer() {
    curTime = TIME_LIMIT;
    TIMELIMIT_TIMER = setInterval(timerInc, 1000);
}

function timerInc() {
    if (curTime <= 0) {
        done = true;
        clearInterval(TIMELIMIT_TIMER);
        refresh(true);
//        process.stdin.pause();
        gameFinish(); 
//        process.exit();
        return;
    }
    curTime--;
    refresh();
}

 function gameFinish() {
    setTimeout(setQuittable, 2000);
}

function setQuittable() {
    process.stdin.resume();
    console.log("Would you like to save your results? Press [y] to save or press any key to quit");
    canQuit = true;
}

function generateGameLines() {
    let lines = [];
    
    lines.push("Press ESC to quit\n")
    lines.push(generateGameInfoLine(basic, totalWords - wrongWords, wrongWords));
    lines.push(generateGameSecondInfoLine(curTime, totalKeystrokes, badKeystrokes));
    lines.push(generateGameWPMInfoLine());
    
    lines.push("");
    lines.push("");
    lines.push("");
    lines.push("");
    
    if (!done) {
        
        lines.push(curLine);
        lines.push(nextLine);
        lines.push("");
    
        if (gameRunning && done == false) {
            lines.push(curChars);
        }
    } else {
        lines.push("");
        lines.push("####### Finished! #######");
        lines.push("");
        lines.push(util.format("Raw WPM:          %d WPM", getRawWPM()));
        lines.push(util.format("Adjusted WPM:     %d WPM", getWPM()));
        lines.push("");
        lines.push(util.format("Total Keystrokes: %d", totalKeystrokes));
        lines.push(util.format("Bad Keystrokes:   %d", badKeystrokes));
        lines.push("");
        lines.push(util.format("Correct Words:    %d", totalWords - wrongWords));
        lines.push(util.format("Wrong Words:      %d", wrongWords));
        lines.push("");
        lines.push(getTimeString());
        lines.push("");
        lines.push("#########################");
        lines.push("");
        lines.push("");
    }
    
    return lines;
}

function getRawWPM() {
    return Math.round((totalKeystrokes / 5) / (TIME_LIMIT / 60));
}

function getRawInstWPM() {
    return Math.round((totalKeystrokes / 5) / ((TIME_LIMIT - curTime) / 60));
}

function getWPM() {
    return Math.round(((totalKeystrokes - badKeystrokes) / 5) / (TIME_LIMIT / 60));
}

function getInstWPM() {
    return Math.round(((totalKeystrokes - badKeystrokes) / 5) / ((TIME_LIMIT - curTime) / 60));
}

function generateGameInfoLine(type, c, w) {
    return util.format("Game Type: %s Correct Words: %d  Incorrect: %d", (type) ? "BASIC   " : "ADVANCED ", c, w);
}

function generateGameSecondInfoLine(time, c, w) {
    return util.format("Time Left: %s    Keystrokes:    %d  Incorrect: %d", formatTime(time), c, w);
}

function generateGameWPMInfoLine(total, incorrect) {
    let wpm = getInstWPM();
    let raw = getRawInstWPM();
    return util.format("                    Raw WPM: %s  Adj. WPM: %s", raw, wpm);
}
    
 function startInput() {
     process.stdout.write("\nTimer will start when first key pressed");
     const readline = require('readline');
     readline.emitKeypressEvents(process.stdin);
     process.stdin.setRawMode(true);
     process.stdin.on('keypress', async (str, key) => {
        if (key.name === 'escape') process.exit();
        if (gameRunning == false) {
            startGame();
        }
        if (!done) {
            if (key.name == "up" || key.name == "down" || key.name == "left" || key.name == "right") {
                return;
            }
            processKeystroke(key);
        } else if (canQuit) {
            if (key.name == "y") {
                process.stdout.write('\033[2K');
                console.log("Saving...");
                Save.save(resultLines);
            }
            process.exit();
        } else {
            refresh(true);
        }
    });
}

function processKeystroke(key) {

    if (key.name == "backspace") {
        curChars = curChars.substr(0, curChars.length - 1);
    } else if (key.name == "space") {
        totalKeystrokes++;
        advanceWords();
    } else {
        totalKeystrokes++;
        curChars += key.sequence;
    }
    
    let error = checkWord();
    if (error) badKeystrokes++;
    refresh();

}

function checkWord() {
    let curWord = curLine[curLineWordIdx];
    let error = false;
    
    for (let i = 0; i < curChars.length; i++) {
        let curChar = curChars.charAt(i);
        let realChar = curWord["word"].charAt(i);
        if (curChar != realChar) {
            error = true;
            break;
        }
    }
    
    setFormat(curLineWordIdx, "error", error);
    setFormat(curLineWordIdx, "good", !error);
    return error;
}

function advanceWords() {

    if (curLine[curLineWordIdx]["word"] != curChars) {
        //incorrect word
        setFormat(curLineWordIdx, "bad", true);
        wrongWords++;
        badKeystrokes++;
    } 
    totalWords++;

    curChars = "";
    
    if (curLineWordIdx + 1 < curLine.length) {
        setFormat(curLineWordIdx, "highlight", false);
        setFormat(++curLineWordIdx, "highlight", true);
    } else {
        advanceLine();
    }
}

function advanceLine() {
    curLine = nextLine;
    nextLine = generateNewLine(WIDTH);
    setFormat(0, "highlight", true);
    curLineIdx++;
    curLineWordIdx = 0;
}

function setFormat(idx, prop, val) {
    curLine[idx][prop] = val;
}

function refresh(done) {
    let lines = generateGameLines();
    Output.outputScreenLines(lines, done);
    if (done) {
        resultLines = lines.slice(lines.length - 15, lines.length - 2);
        resultLines.unshift((basic) ? "###### BASIC TEST #######" : "####### ADV TEST ########")
    }
}

function getTimeString() {
    
    if (TIME_LIMIT == 30) {
        return "Test Length:      30 sec";
    }
    
    let mins = Math.floor(TIME_LIMIT / 60);
    return "Test Length:      " + mins + " Min" + ((mins != 1) ? "s":"");
}

function formatTime(timeLeft) {
    let mins = Math.floor(timeLeft / 60);
    let min = "0" + mins + ":";
    
    let s = timeLeft % 60;
    let str = parseInt(s);
    if (s < 10) str = "0" + str;
    
    return min + str;
}

module.exports.prepareGame = prepareGame;
module.exports.startInput = startInput;