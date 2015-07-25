var LabourPool = require('./LabourPool');
var ObjectsManager = require('../../ObjectsManager');
var Economy = (function () {
    function Economy(params) {
        this.params = params;
    }
    Economy.prototype.init = function (labourPool, currency, centralBank) {
        if (centralBank === void 0) { centralBank = null; }
        this.labourPool = labourPool || new LabourPool();
        this.labourPool.init(this.params.population, this.params.population, this.params.population);
        this.currency = currency;
        this.centralBank = centralBank;
        if (this.centralBank) {
            this.centralBank.economy = this;
        }
        this.initialised = true;
        ObjectsManager.register(this, "environnement", true);
    };
    // action
    Economy.prototype.simulate = function () {
        this.centralBank && this.centralBank.simulate();
        this.currency.simulate();
    };
    Economy.prototype.getEndState = function () {
        var result = {};
        var state = {
            "GDP": this.GDP,
            "unemploymentRatePerThousand": this.unemploymentRate,
            "externalTradeBalance": this.externalTradeBalance,
            "interestBaseRatePerThousand": this.centralBank && this.centralBank.interestBaseRate * 1000,
            "businessReport": this.businessReport,
            "exchangeRatePerCent": this.currency.quotedExchangeRate * 100
        };
        for (var key in state) {
            if (!state.hasOwnProperty(key)) {
                continue;
            }
            var prop = this.params.id + "_" + key;
            result[prop] = state[key];
        }
        return result;
    };
    return Economy;
})();
module.exports = Economy;
//# sourceMappingURL=Economy.js.map