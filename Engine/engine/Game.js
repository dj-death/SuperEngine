/**
* Paramètres Générales
*
*
* Copyright 2015 DIDI Mohamed, Inc.
*/
var Game = (function () {
    function Game(configs) {
        this.initialised = false;
        this.configs = configs;
    }
    Game.prototype.init = function () {
        // let's begin
        this.initialised = true;
    };
    Object.defineProperty(Game.prototype, "weeksNbByPeriod", {
        get: function () {
            var monthWeeksNb = 4;
            return this.configs.stage.duration * monthWeeksNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "daysNbByPeriod", {
        get: function () {
            var monthDaysNb = 30;
            return this.configs.stage.duration * monthDaysNb;
        },
        enumerable: true,
        configurable: true
    });
    return Game;
})();
module.exports = Game;
//# sourceMappingURL=Game.js.map