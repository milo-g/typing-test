/*
    * analysis.js - WPM Analysis
*/

const fs = require('fs');
const path = require('path');

const CONF_FILE = path.join(__dirname, "../etc/conf");

var raws = [];
var adjs = [];

function printAnalysis() {
   
    parseResults();
    
    console.log("Total Results: %d\n", raws.length);

    let rawRes = analyzeResults(raws);
    let adjRes = analyzeResults(adjs);

    printResults("Raw", rawRes);
    printResults("Adj", adjRes);
    
    // console.log("Max Raw:     %d", max(raws));
    // console.log("Average Raw: %d", avg(raws));
    // console.log("Top 10% Raw: %d", topPercent(raws, 0.1));
    // console.log("Top 25% Raw: %d", topPercent(raws, 0.25));
    // console.log("Top 50% Raw: %d", topPercent(raws, 0.5));
    // console.log("Std Dev Raw: %d", stdDev(raws));
    // console.log("")
    // console.log("Max Adj:     %d", max(adjs));
    // console.log("Average Adj: %d", avg(adjs));
    // console.log("Top 10% Adj: %d", topPercent(adjs, 0.1));
    // console.log("Top 25% Adj: %d", topPercent(adjs, 0.25));
    // console.log("Top 50% Adj: %d", topPercent(adjs, 0.5));
    // console.log("Std Dev Adj: %d", stdDev(adjs));
    // console.log("")
}

function printResults(name, result) {
    for (let key in result) {
        let res = result[key];
        let str = res == Math.floor(res) ? res : res.toFixed(2);
        if (!key.includes("Bnd"))
            console.log("%s %s: %s WPM", key, name, str);
    
    }
    console.log("95% Prob. Range: %d-%d WPM", Math.round(result["Lwr Bnd"]), Math.round(result["Upr Bnd"]));
    console.log();
}

function analyzeResults(res) {
    let goodSet = removeOutliers(res);
  
    let topTen  = topPercent(goodSet, 0.1);
    let topQ    = topPercent(goodSet, 0.25);
    let lowQ    = topPercent(goodSet, 0.75);
    let topHalf = topPercent(goodSet, 0.5);
    
    let maxim = max(goodSet);
    let minim = min(goodSet);
    let average = avg(goodSet)
    let std = stdDev(goodSet);
    let upperBound = (std*2) + average;
    let lowerbound = average - (std*2);

    return {
        "Max    ": maxim,
        // "Min    ": minim,
        "Average": average,
        "Top 10%": topTen,
        "UQ     ": topQ,
        // "LQ     ": lowQ,
        "Median ": topHalf,
        "Std Dev": std,
        "Lwr Bnd": lowerbound,
        "Upr Bnd": upperBound
    }
}

function removeOutliers(results) {
    let newArr = [];

    let firstQ = topPercent(results, 0.25);
    let thirdQ = topPercent(results, 0.75);

    let iqrOut = 1.5 * Math.abs(firstQ - thirdQ);

    let floor = thirdQ - iqrOut;
    let ceil = firstQ + iqrOut;

    for (let result of results) {
        if (result >= floor && result <= ceil) {
            newArr.push(result);
        }
    }

    return newArr;
}

function parseResults() {
    let resultDir = getResultDir();
    process.stdout.write("\033[2J");
    if (!fs.existsSync(resultDir)) {
        console.log("\n Error! Result Directory does not exit. Exiting");
        process.exit();
    }
    
    const dir = fs.opendirSync(resultDir);
    let ent;
    
    while ((ent = dir.readSync()) !== null) {
        parseFile(ent.name);
    }
    dir.closeSync();
    
    if (raws.length == 0) {
        console.log("No records found. Do a test!\n\n");
        return;
    }
}

function avg(arr) {
    return arr.reduce((r, v) => r + v, 0) / arr.length;
}

function max(arr) {
    return arr.reduce((r, val) => r = (val > r) ? val : r, arr[0]);
}

function min(arr) {
    return arr.reduce((r, val) => r = (val < r) ? val : r, arr[0]);
}

function order(arr) {
    return arr.sort((obja, objb) => {
            if (obja > objb) {
                return -1
            } else if (obja < objb) {
                return 1
            } else return 0;
    });
}

function topPercent(arr, percent) {
    let ordered = order(arr);
    return ordered[Math.round(ordered.length * percent)];
}

function stdDev(arr) {
    let av = avg(arr);
    return Math.sqrt(avg(arr.map((val) => (val - av)**2)));
}

function getResultDir() {
    return fs.readFileSync(CONF_FILE).toString();
}

function parseFile(name) {
    let resultDir = getResultDir();
    let filename = resultDir + "/" + name;
    let file = fs.readFileSync(filename);
    
    let lines = file.toString().split('\n');
    let raw = parseInt(lines[2].split(':')[1].trim().split(" ")[0]);
    let adj = parseInt(lines[3].split(':')[1].trim().split(" ")[0]);
    
    raws.push(raw);
    adjs.push(adj);
}

module.exports.printAnalysis = printAnalysis;
