var ENUMS = require('../../ENUMS');
var ObjectsManager = require('../../ObjectsManager');
var CashFlow = require('./CashFlow');
var Capital = (function () {
    function Capital(params) {
        this.params = params;
    }
    Capital.prototype.init = function (initialShareCapital, sharesNb, openingSharePrice, openingMarketValuation, lastRetainedEarnings, sharesNbAtStartOfYear, currQuarter) {
        this.reset();
        this.initialShareCapital = initialShareCapital;
        this.initialSharesNb = sharesNb;
        this.openingSharePrice = openingSharePrice;
        this.lastRetainedEarnings = lastRetainedEarnings;
        this.sharesNbAtStartOfYear = sharesNbAtStartOfYear;
        this.currQuarter = currQuarter;
        this.initialised = true;
        ObjectsManager.register(this, "finance");
    };
    Capital.prototype.reset = function () {
        this.issuedSharesNb = 0;
        this.repurchasedSharesNb = 0;
        this.initialised = false;
    };
    Object.defineProperty(Capital.prototype, "sharesNb", {
        // result
        get: function () {
            return this.initialSharesNb + this.issuedSharesNb - this.repurchasedSharesNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Capital.prototype, "marketValuation", {
        get: function () {
            return this.sharesNb * this.sharePrice;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Capital.prototype, "sharePrice", {
        get: function () {
            return this.openingSharePrice;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Capital.prototype, "shareCapital", {
        get: function () {
            return this.sharesNb * this.params.shareNominalValue;
        },
        enumerable: true,
        configurable: true
    });
    // actions
    Capital.prototype.changeSharesNb = function (quantity) {
        if (quantity > 0) {
            this.issueShares(quantity);
        }
        if (quantity < 0) {
            this.repurchaseShares(quantity);
        }
    };
    Capital.prototype.issueShares = function (quantity) {
        if (this.openingSharePrice < this.params.restrictions.minSharePriceToIssueShares) {
            this.issuedSharesNb = 0;
            return;
        }
        var variationRate = Math.abs((this.initialSharesNb - this.sharesNbAtStartOfYear) / this.sharesNbAtStartOfYear);
        var maxAllowedVariationRate = this.params.restrictions.capitalAnnualVariationLimitRate - variationRate;
        var currPeriodMaxIssuedSharesNb = Math.round(maxAllowedVariationRate * this.sharesNbAtStartOfYear);
        if (quantity > currPeriodMaxIssuedSharesNb) {
            this.issuedSharesNb = currPeriodMaxIssuedSharesNb;
            return;
        }
        this.issuedSharesNb = quantity;
    };
    Capital.prototype.repurchaseShares = function (quantity) {
        if (this.openingSharePrice < this.params.restrictions.minSharePriceToRepurchaseShares) {
            this.repurchasedSharesNb = 0;
            return;
        }
        var variationRate = Math.abs((this.initialSharesNb - this.sharesNbAtStartOfYear) / this.sharesNbAtStartOfYear);
        var maxAllowedVariationRate = this.params.restrictions.capitalAnnualVariationLimitRate - variationRate;
        var currPeriodMaxRepurchasedSharesNb = Math.round(maxAllowedVariationRate * this.sharesNbAtStartOfYear);
        if (quantity > currPeriodMaxRepurchasedSharesNb) {
            this.repurchasedSharesNb = currPeriodMaxRepurchasedSharesNb;
            return;
        }
        this.repurchasedSharesNb = quantity;
    };
    Capital.prototype.payDividend = function (rate) {
        if (rate <= 0) {
            return;
        }
        // on initial
        var totalDividends = this.initialShareCapital * rate;
        if (totalDividends > this.lastRetainedEarnings) {
            rate = this.lastRetainedEarnings / this.initialShareCapital;
        }
        this.dividendRate = rate;
    };
    Object.defineProperty(Capital.prototype, "dividendPaid", {
        // cost
        get: function () {
            return this.initialShareCapital * this.dividendRate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Capital.prototype, "sharesIssued", {
        get: function () {
            return this.issuedSharesNb * this.openingSharePrice;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Capital.prototype, "sharesRepurchased", {
        get: function () {
            return this.repurchasedSharesNb * this.openingSharePrice;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Capital.prototype, "sharePremiumAccount", {
        get: function () {
            if (this.sharesIssued > 0) {
                return this.issuedSharesNb * (this.openingSharePrice - this.params.shareNominalValue);
            }
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Capital.prototype.onFinish = function () {
        CashFlow.addPayment(this.dividendPaid, this.params.payments, ENUMS.ACTIVITY.FINANCING);
        CashFlow.addPayment(this.sharesRepurchased, this.params.payments, ENUMS.ACTIVITY.FINANCING);
        CashFlow.addReceipt(this.sharesIssued, this.params.payments, ENUMS.ACTIVITY.FINANCING);
        // setup again as w're about a new year
        if (this.currQuarter === 4) {
            this.sharesNbAtStartOfYear = this.sharesNb;
        }
    };
    Capital.prototype.getEndState = function () {
        var state = {
            "shareCapital": this.shareCapital,
            "sharePremiumAccount": this.sharePremiumAccount,
            "sharesRepurchased": this.sharesRepurchased,
            "sharesIssued": this.sharesIssued,
            "dividendPaid": this.dividendPaid,
            "sharesNbAtStartOfYear": this.sharesNbAtStartOfYear
        };
        return state;
    };
    return Capital;
})();
module.exports = Capital;
//# sourceMappingURL=Capital.js.map