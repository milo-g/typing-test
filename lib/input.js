/*
    *
    * Reads input from user
    *
*/

const readline = require('readline');
const util = require('util');
var rl;
        
async function readQuestion(qStr, newline = false) {
    try {
        startRL();
        let q = util.promisify((str, cb) => rl.question(str, (answer) => cb(null, answer)));
        let nl = (newline) ? "\n":"";
        
        let a = await q(qStr + nl);
        clearRL();
        return a;
    }
    
    catch(e) {
        console.log(e);
    }
}

function readQuestionCallback(qStr, newline = false, cb) {
    try {
        startRL();
        let nl = (newline) ? "\n" : "";
        rl.question(qStr + nl, cb);
    }
    catch(e) {
        console.log(e);
    }
                    
}

function startRL() {
    rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
}

function clearRL() {
    if (rl) rl.close();
}

module.exports.readQuestion = readQuestion;
module.exports.readQuestionCallback = readQuestionCallback;
module.exports.close = clearRL;