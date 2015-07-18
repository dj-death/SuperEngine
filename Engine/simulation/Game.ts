import Game = require('../engine/Game');
import ENUMS = require('../engine/ComputeEngine/ENUMS');

var GMCGame = new Game({
    index100Value: 1000,
    stage: {
        nb: 5,
        duration: ENUMS.PERIODS.QUARTER
    }
});

export = GMCGame;