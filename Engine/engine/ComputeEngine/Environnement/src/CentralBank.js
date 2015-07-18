var ObjectsManager = require('../../ObjectsManager');
var CentralBank = (function () {
    function CentralBank(params) {
        this.initialised = false;
        this.params = params;
    }
    CentralBank.prototype.init = function (lastInterestBaseRate) {
        this.reset();
        this.initialInterestBaseRate = lastInterestBaseRate;
        this.initialised = true;
        ObjectsManager.register(this, "environnement", true);
    };
    CentralBank.prototype.reset = function () {
        this.initialInterestBaseRate = undefined;
        this._interestBaseRate = undefined;
        this.initialised = false;
    };
    Object.defineProperty(CentralBank.prototype, "interestBaseRate", {
        // result
        get: function () {
            return this._interestBaseRate;
        },
        enumerable: true,
        configurable: true
    });
    // action
    CentralBank.prototype.simulate = function () {
        if (this.params.isMoneyMarketStable) {
            this._interestBaseRate = this.initialInterestBaseRate;
            return;
        }
        // TEst Purposes
        //this._interestBaseRate = 
    };
    return CentralBank;
})();
module.exports = CentralBank;
//# sourceMappingURL=CentralBank.js.map