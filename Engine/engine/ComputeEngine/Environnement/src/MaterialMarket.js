var ENUMS = require('../../../ComputeEngine/ENUMS');
var ObjectsManager = require('../../ObjectsManager');
var console = require('../../../../utils/logger');
var MaterialMarket = (function () {
    function MaterialMarket(params) {
        this.params = params;
    }
    MaterialMarket.prototype.init = function (economy, lastQuotedPrices) {
        this.reset();
        this.economy = economy;
        // we begin at the end of last so is the price of first day of period
        this.initialQuotedPrices = lastQuotedPrices;
        this.initialised = true;
        ObjectsManager.register(this, "environnement", true);
    };
    MaterialMarket.prototype.reset = function () {
        this.initialQuotedPrices = [];
        this._spotPrice = undefined;
        this._threeMthPrice = undefined;
        this._sixMthPrice = undefined;
        this.initialised = false;
    };
    // result
    // initial prices at local currency for standard lot
    MaterialMarket.prototype.getPrice = function (term) {
        if (term === void 0) { term = 0 /* IMMEDIATE */; }
        if (!this.initialised) {
            return 0;
        }
        var price;
        var initialExchangeRate = this.economy.currency.initialExchangeRate;
        switch (term) {
            case 2 /* SIX_MONTH */:
                price = this.initialQuotedPrices[2] * initialExchangeRate;
                break;
            case 1 /* THREE_MONTH */:
                price = this.initialQuotedPrices[1] * initialExchangeRate;
                break;
            default:
                price = this.initialQuotedPrices[0] * initialExchangeRate;
        }
        return price;
    };
    // at reel time (for this period) at local currency for standard lot
    MaterialMarket.prototype.getQuotedPrice = function (term) {
        if (term === void 0) { term = 0 /* IMMEDIATE */; }
        if (!this.initialised) {
            console.debug('MaterialMarket not initialised');
            return 0;
        }
        var price;
        var quotedExchangeRate = this.economy.currency.quotedExchangeRate;
        switch (term) {
            case 2 /* SIX_MONTH */:
                price = this._sixMthPrice * quotedExchangeRate;
                break;
            case 1 /* THREE_MONTH */:
                price = this._threeMthPrice * quotedExchangeRate;
                break;
            default:
                price = this._spotPrice * quotedExchangeRate;
        }
        return price;
    };
    // action
    MaterialMarket.prototype.simulate = function () {
        if (this.params.arePricesStable) {
            this._spotPrice = this.initialQuotedPrices[0];
            this._threeMthPrice = this.initialQuotedPrices[1];
            this._sixMthPrice = this.initialQuotedPrices[2];
            return;
        }
        this._spotPrice = 37564;
        this._threeMthPrice = 33545;
        this._sixMthPrice = 31073;
    };
    MaterialMarket.prototype.getEndState = function () {
        var result = {};
        var state = {
            "spotPrice": this._spotPrice,
            "3mthPrice": this._threeMthPrice,
            "6mthPrice": this._sixMthPrice
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
    return MaterialMarket;
})();
module.exports = MaterialMarket;
//# sourceMappingURL=MaterialMarket.js.map