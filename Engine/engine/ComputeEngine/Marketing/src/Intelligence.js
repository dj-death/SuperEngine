var ObjectsManager = require('../../ObjectsManager');
var Intelligence = (function () {
    function Intelligence(params) {
        this.params = params;
    }
    // helpers
    Intelligence.prototype.init = function () {
        this.reset();
        this.initialised = true;
        ObjectsManager.register(this, "marketing");
    };
    Intelligence.prototype.reset = function () {
        this.initialised = false;
    };
    Object.defineProperty(Intelligence.prototype, "BusinessIntelligenceCost", {
        // results
        get: function () {
            var totalCost = 0;
            if (this.isMarketSharesInfoCommissioned) {
                totalCost += this.params.costs.marketSharesInfoCost;
            }
            if (this.isCompetitorsInfoCommissioned) {
                totalCost += this.params.costs.competitorsInfoCost;
            }
            return totalCost;
        },
        enumerable: true,
        configurable: true
    });
    // actions
    Intelligence.prototype.commissionMarketSharesInfo = function (isCommissioned) {
        this.isMarketSharesInfoCommissioned = isCommissioned;
    };
    Intelligence.prototype.commissionCompetitorsInfo = function (isCommissioned) {
        this.isCompetitorsInfoCommissioned = isCommissioned;
    };
    Intelligence.prototype.getEndState = function () {
        var state = {
            "BusinessIntelligenceCost": this.BusinessIntelligenceCost
        };
        return state;
    };
    return Intelligence;
})();
module.exports = Intelligence;
//# sourceMappingURL=Intelligence.js.map