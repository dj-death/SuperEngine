var ObjectsManager = require('../../ObjectsManager');
var Currency = (function () {
    function Currency(params) {
        this.initialised = false;
        this.params = params;
    }
    Currency.prototype.init = function (lastExchangeRate) {
        this.reset();
        this.initialExchangeRate = this.params.isLocal ? 1 : lastExchangeRate;
        this.initialised = true;
        ObjectsManager.register(this, "environnement", true);
    };
    Currency.prototype.reset = function () {
        this._quotedExchangeRate = undefined;
        this.initialExchangeRate = undefined;
        this.initialised = false;
    };
    Object.defineProperty(Currency.prototype, "quotedExchangeRate", {
        // result
        get: function () {
            return this._quotedExchangeRate;
        },
        enumerable: true,
        configurable: true
    });
    // action
    Currency.prototype.simulate = function () {
        if (this.params.isLocal) {
            this._quotedExchangeRate = 1;
            return;
        }
        // TEst Purposes
        this._quotedExchangeRate = 1.15;
    };
    Currency.prototype.getEndState = function () {
        var result = {};
        var state = {
            "exchangeRatePerCent": this.quotedExchangeRate
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
    return Currency;
})();
module.exports = Currency;
//# sourceMappingURL=Currency.js.map