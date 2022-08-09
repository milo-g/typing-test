/*
    *
    * settings.js, processes arguments and handles settings output
    *
*/

const Input = require('./input');
const Output = require('./output');
const Analysis = require('./analysis');
const Save = require('./save');

const DEFAULT_RESULT_PATH = makeDefaultResultPath();

const MODES = {
    "BASIC": "BASIC",
    "ADVANCED": "ADVANCED",
    "ANALYSIS": "ANALYSIS",
    "PATH": "PATH"
}

const TIMES = {
    "HALF": 30,
    "ONE": 60,
    "TWO": 120,
    "THREE": 180,
    "FOUR": 240,
    "FIVE": 300,
    "BACK": "BACK"
}

const modesOutput = [
    "Available Modes:",
    "[1]: Basic",
    "[2]: Advanced",
    "[3]: Analysis",
    "[4]: Clear Data",
    "[5]: Set Results Directory",
    "[6]: Quit"
]

const timesOutput = [
    "Available Durations:",
    "[1]: Thirty Seconds",
    "[2]: One Minute",
    "[3]: Three Minutes",
    "[4]: Five Minutes",
    "[5]: Back",
    "[6]: Quit"
]

const resultPathOutput = [
    "Setting Result Path",
    "",
    "",
    ""
]

var chosenMode;
var chosenTime;

function getModeFromUser(cb) {
    Output.outputLines(modesOutput);
    Input.close();
    Input.readQuestionCallback("Choose an option [1-5]: ", false, function (response) {
        //    console.log(response);
        switch (response) {
            case "1": {
                chosenMode = MODES.BASIC;
                break;
            }
            case "2": {
                chosenMode = MODES.ADVANCED;
                break;
            }
                
            case "3": {
                Analysis.printAnalysis();
                process.exit();
                break;
            }

            case "4": {
                Save.clearData();
                process.exit();
                break;
            }
                
            case "5": {
                chosenMode = MODES.PATH;
                break;
            }
            case "6": {
                process.exit();
            }

            default: {
                Output.clearLines(modesOutput.length + 3);
                console.log("\x1b[42mInput not recognzed; try again\x1b[0m");
                getModeFromUser(cb);
                return;
            }
        }

        cb(chosenMode);
    });
}

function getTimeFromUser(cb) {
    Output.outputLines(timesOutput);
    Input.close();
    Input.readQuestionCallback("Choose a time limit [1-4]: ", false, function (response) {
        //    console.log(response);
        switch (response) {
            case "1": {
                chosenTime = TIMES.HALF;
                break;
            }
            case "2": {
                chosenTime = TIMES.ONE;
                break;
            }
            case "3": {
                chosenTime = TIMES.THREE;
                break;
            }
            case "4": {
                chosenTime = TIMES.FIVE;
                break;
            }

            case "5": {
                chosenTime = TIMES.BACK;
                break;
            }
            case "6": {
                process.exit();
                //                break;
            }
            default: {
                Output.clearLines(timesOutput.length + 3);
                console.log("\x1b[42mInput not recognzed; try again\x1b[0m");
                getTimeFromUser(cb);
                return;
            }
        }
        cb(chosenTime);
    });
}

function loadConfig() {
    let config = Save.getConfig();
    if (config == false) return false;

    let resultsPath = config;
    return {"results": resultsPath};
} 

function getResultPathFromUser(cb) {
    Output.outputLines(resultPathOutput);
    Input.close();
    Input.readQuestionCallback("Press enter to use default results directory\nof " + DEFAULT_RESULT_PATH + " or enter custom: ", false, function(response) {
        switch (response) {
            case "": {
                console.log("Using default path:    %s", DEFAULT_RESULT_PATH);
                cb(DEFAULT_RESULT_PATH);
                break;
            }
            default: {
                console.log("\nUsing custom path:   %s", response);
                cb(response);
            }
        }
        // Input.close();

    });
}

function makeDefaultResultPath() {
    return require('os').homedir() + '/tt-results';
}

function setPathConfig(path) {
    return Save.writeConfig([path]);
}

module.exports.getModeFromUser = getModeFromUser;
module.exports.getTimeFromUser = getTimeFromUser;
module.exports.loadConfig = loadConfig;
module.exports.setPathConfig = setPathConfig;
module.exports.getResultPathFromUser = getResultPathFromUser;
module.exports.MODES = MODES;
module.exports.TIMES = TIMES;