/*
    *
    * save.js - Save Output
    *
*/

const fs = require('fs');
const path = require('path');

const countName = path.join(__dirname, '../etc/count');
const CONFIG_FILE = path.join(__dirname, "../etc/conf");

function save(data) {
    let dir = fs.readFileSync(CONFIG_FILE).toString();

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    
    
    let count = 0;
    if (!fs.existsSync(countName)) {
        fs.writeFileSync(countName, 1);
    } else {
        let countFile = fs.readFileSync(countName);
        count = parseInt(countFile);
    }
    
    count++;
    let name = "result-" + count;
    fs.writeFileSync(dir + "/" + name, data.join("\n"));
    fs.writeFileSync(countName, count.toString());
}


function clearData() {
    let dir = fs.readFileSync(CONFIG_FILE).toString();

    if (fs.existsSync(dir)) {
        const theDir = fs.opendirSync(dir);
        while ((ent = theDir.readSync()) !== null) {
            if (ent.name.includes("result-")) {
                fs.unlinkSync(dir + "/" + ent.name);
            }
        }
    } else {
        console.log("Directory does not exist. Recreating");
        fs.mkdirSync(dir);
    }
    
    fs.writeFileSync(countName, "0");
    console.log("Finished clearing data");
}

function getConfig() {
    if (!fs.existsSync(CONFIG_FILE)) {
        fs.writeFileSync(CONFIG_FILE, "");
        return false;
    } else {
        return fs.readFileSync(CONFIG_FILE).toString();
    }
}

function writeConfig(lines) {
    fs.writeFileSync(CONFIG_FILE, lines.join('\n'));
}

module.exports.save = save;
module.exports.clearData = clearData;
module.exports.getConfig = getConfig;
module.exports.writeConfig = writeConfig;