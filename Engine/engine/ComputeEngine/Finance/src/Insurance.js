var ObjectsManager = require('../../ObjectsManager');
var CashFlow = require('./CashFlow');
var Insurance = (function () {
    function Insurance(params) {
        this.params = params;
    }
    Insurance.prototype.init = function (premiumsBase, currPeriod, management) {
        this.reset();
        this.management = management;
        this.premiumsBase = premiumsBase;
        this.forceMajeure = this.params.forceMajeureSequence[currPeriod - 1] || 0;
        this.initialised = true;
        ObjectsManager.register(this, "finance");
    };
    Insurance.prototype.reset = function () {
        this._claimsForLosses = 0;
        this.initialised = false;
    };
    // action
    Insurance.prototype.takeoutInsurance = function (insurancePlanRef) {
        this.insurancePlanTakenout = this.params.plans[insurancePlanRef];
    };
    Insurance.prototype.claims = function () {
    };
    Insurance.prototype.cover = function () {
        var objects = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            objects[_i - 0] = arguments[_i];
        }
        var self = this;
        objects.forEach(function (obj) {
            obj.insurance = self;
        });
    };
    Object.defineProperty(Insurance.prototype, "claimsForLosses", {
        // result
        get: function () {
            if (this.insurancePlanTakenout.primaryRiskRate === 0) {
                return 0;
            }
            if (this._claimsForLosses > 0) {
                return this._claimsForLosses;
            }
            var risks = this.forceMajeure;
            var risksAlphaFactors;
            var managementBudget = this.management.budget;
            if (managementBudget >= this.params.optimalManagementBudget) {
                risksAlphaFactors = 0;
            }
            else {
                if (managementBudget === this.params.normalManagementBudget) {
                    risksAlphaFactors = 1;
                }
            }
            return risks * risksAlphaFactors;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Insurance.prototype, "primaryNonInsuredRisk", {
        get: function () {
            return Math.floor(this.premiumsBase * this.insurancePlanTakenout.primaryRiskRate);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Insurance.prototype, "premiumsCost", {
        get: function () {
            var insurancePremiums = this.insurancePlanTakenout.premiumRate * this.premiumsBase;
            return Math.floor(insurancePremiums);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Insurance.prototype, "receipts", {
        get: function () {
            var diff = this.claimsForLosses - this.primaryNonInsuredRisk;
            if (diff > 0) {
                return diff;
            }
            else {
                return 0;
            }
        },
        enumerable: true,
        configurable: true
    });
    Insurance.prototype.onFinish = function () {
        CashFlow.addPayment(this.premiumsCost, this.params.payments);
        CashFlow.addReceipt(this.receipts, this.params.payments);
    };
    Insurance.prototype.getEndState = function () {
        var result = {};
        var state = {
            "premiumsCost": this.premiumsCost,
            "claimsForLosses": this.claimsForLosses,
            "receipts": this.receipts,
            "primaryNonInsuredRisk": this.primaryNonInsuredRisk
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
    return Insurance;
})();
module.exports = Insurance;
//# sourceMappingURL=Insurance.js.map