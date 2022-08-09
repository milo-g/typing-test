#!/usr/bin/env node

const Input = require('../lib/input');
const Settings = require('../lib/settings');
const Output = require('../lib/output');
const Game = require('../lib/game');
const TITLE_FILE = "../etc/title";

function start() {
    Output.createScreen();
    process.stdout.moveCursor(0, 100);
    refreshTitle();

    let conf = Settings.loadConfig();
    if (conf == false) {
        Settings.getResultPathFromUser((resp) => {
            Settings.setPathConfig(resp);
            start();
            return;
        });
        return;
    }

    Settings.getModeFromUser((chosenMode) => {
        
        if (chosenMode == Settings.MODES.PATH) {
            Settings.getResultPathFromUser((resp) => {
                Settings.setPathConfig(resp);
                process.exit();
                return;
            });

            return;
        }

        refreshTitle();
        Input.close();
        
        Settings.getTimeFromUser((chosenTime) => {

            if (chosenTime == Settings.TIMES.BACK) {
                start();
                return;
            }

            Game.prepareGame(chosenMode, chosenTime);
            Game.startInput();
        });
    });
}

function getTitleString() {
    const fs = require('fs');
    const path = require('path');

    const title = fs.readFileSync(path.resolve(__dirname, TITLE_FILE), 'utf-8');
    return title;
}

function refreshTitle() {
    Output.createScreen();
    console.log(getTitleString());
}

start();
