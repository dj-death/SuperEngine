var ENUMS = require('../../ENUMS');
var console = require('../../../../utils/logger');
var CashFlow = require('../../Finance/src/CashFlow');
var Space = (function () {
    function Space(params) {
        this.extensionSquareMetreCost = 0;
        this.lastNetValue = 0;
        this.params = params;
    }
    Space.prototype.init = function (initialSize, extraSpace, lastNetValue, contractor) {
        if (contractor === void 0) { contractor = null; }
        this.reset();
        this.extraSpace = extraSpace;
        this.availableSpaceAtStart = initialSize;
        this.availableSpace = initialSize;
        this.lastNetValue = lastNetValue;
        this.contractor = contractor;
        // now ok
        this.initialised = true;
    };
    Space.prototype.reset = function () {
        this.effectiveExtension = 0;
        this.usedSpace = 0;
        this.initialised = false;
    };
    Object.defineProperty(Space.prototype, "availableSpaceNextPeriod", {
        get: function () {
            return this.availableSpaceAtStart + this.effectiveExtension;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "unusedSpace", {
        get: function () {
            return this.maxUsedSpace - this.usedSpace;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "maxUsedSpace", {
        get: function () {
            return Math.ceil(this.availableSpace * this.params.maxSpaceUse);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "reservedSpace", {
        get: function () {
            return Math.ceil(this.availableSpace * (1 - this.params.maxSpaceUse));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "maxExtension", {
        get: function () {
            return this.extraSpace && this.extraSpace.unusedSpace || 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "CO2PrimaryFootprintHeat", {
        get: function () {
            return this.params.CO2Footprint.kwh * this.availableSpace;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "CO2PrimaryFootprintWeight", {
        get: function () {
            return this.CO2PrimaryFootprintHeat * 0.00019;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "CO2PrimaryFootprintOffsettingCost", {
        get: function () {
            return Math.round(this.CO2PrimaryFootprintWeight * this.params.CO2Footprint.offsettingPerTonneRate);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "extensionCost", {
        // cost
        get: function () {
            if (!this.contractor) {
                return 0;
            }
            return this.effectiveExtension * this.contractor.buildingSquareMetreCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "fixedCost", {
        get: function () {
            return this.availableSpace * this.params.costs.fixedExpensesPerSquare;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "rawValue", {
        get: function () {
            return this.lastNetValue + this.extensionCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "depreciation", {
        get: function () {
            var depreciation = Math.ceil(this.rawValue * this.params.depreciationRate);
            return depreciation;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "netValue", {
        get: function () {
            if (this.params.isValuationAtMarket) {
                return this.availableSpaceNextPeriod * this.extensionSquareMetreCost;
            }
            var netValue = this.rawValue - this.depreciation;
            return netValue;
        },
        enumerable: true,
        configurable: true
    });
    // actions
    Space.prototype.useSpace = function (spaceNeed) {
        var gotSpace;
        gotSpace = spaceNeed;
        if (this.unusedSpace < gotSpace) {
            gotSpace = this.unusedSpace;
        }
        this.usedSpace += gotSpace;
        return gotSpace;
    };
    Space.prototype.extend = function (extension, creditWorthiness) {
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }
        if (!this.extraSpace) {
            console.debug('unable to extend');
            return false;
        }
        var possibleExtension = this.unusedSpace <= extension ? extension : this.unusedSpace;
        var extensionRes = this.contractor.build(possibleExtension, creditWorthiness);
        var effectiveExtension = extensionRes.squaresNb;
        var extensionDuration = extensionRes.duration;
        this.extraSpace.useSpace(effectiveExtension);
        this.effectiveExtension = effectiveExtension;
        if (extensionDuration === ENUMS.FUTURES.IMMEDIATE) {
            this.availableSpace += this.effectiveExtension;
        }
    };
    Space.prototype.onFinish = function () {
        CashFlow.addPayment(this.CO2PrimaryFootprintOffsettingCost, this.params.payments.miscellaneous);
        CashFlow.addPayment(this.fixedCost, this.params.payments.miscellaneous);
        CashFlow.addPayment(this.extensionCost, this.params.payments.acquisition, ENUMS.ACTIVITY.INVESTING);
    };
    return Space;
})();
module.exports = Space;
//# sourceMappingURL=Space.js.map