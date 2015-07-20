/**
* Paramètres Générales
*
*
* Copyright 2015 DIDI Mohamed, Inc.
*/

import ENUMS = require('ComputeEngine/ENUMS');

import console = require('../utils/logger');



interface Stage {
    nb: number;
    duration: ENUMS.PERIODS; // in months
}

interface Configs {
    stage: Stage;
    index100Value: number;
}

class Game {
    private initialised: boolean = false;

    configs: Configs;

    constructor(configs: Configs) {
        this.configs = configs;
    }

    init() {
        // let's begin
        this.initialised = true;
        
    }

    get weeksNbByPeriod(): number {
        var monthWeeksNb = 4;

        return this.configs.stage.duration * monthWeeksNb;
    }

    get daysNbByPeriod(): number {
        var monthDaysNb = 30;

        return this.configs.stage.duration * monthDaysNb;
    }
}

export = Game;