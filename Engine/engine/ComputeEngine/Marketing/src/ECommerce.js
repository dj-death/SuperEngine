var ENUMS = require('../../ENUMS');
var ObjectsManager = require('../../ObjectsManager');
var console = require('../../../../utils/logger');
var CashFlow = require('../../Finance/src/CashFlow');
var ECommerce = (function () {
    function ECommerce(params) {
        this.params = params;
    }
    ECommerce.prototype.init = function (activeLastPeriodWebsitePortsNb, internetMarket, distributor) {
        this.reset();
        // begin from the last period
        this.activeWebsitePortsNb = activeLastPeriodWebsitePortsNb;
        this.distributor = distributor;
        this.internetMarket = internetMarket;
        // ok
        this.initialised = true;
        ObjectsManager.register(this, "marketing");
    };
    ECommerce.prototype.reset = function () {
        this.websiteVisitsNb = 0;
        this.failedWebsiteVisitsNb = 0;
        this.potentialWebsiteVisitsNb = 0;
        this.serviceComplaintsNb = 0;
        this.initialised = false;
    };
    Object.defineProperty(ECommerce.prototype, "failedWebsiteVisitsRate", {
        /*
         *  Estimated level of failed visits (%):
         *  the number of failed attempts to visit your web-site last quarter divided by the total number of potential visits.
         *  This performance statistic is provided by your ISP.
         */
        get: function () {
            if (this.potentialWebsiteVisitsNb === 0) {
                return 0;
            }
            return this.failedWebsiteVisitsNb / this.potentialWebsiteVisitsNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ECommerce.prototype, "websiteDevelopmentCost", {
        // costs
        get: function () {
            return this.websiteDevBudget;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ECommerce.prototype, "feesCost", {
        get: function () {
            var fees;
            if (this.isClosingDown) {
                fees = this.params.costs.closingDownFees;
            }
            if (this.isInitialJoining) {
                fees = this.params.costs.initialJoiningFees;
            }
            return fees || 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ECommerce.prototype, "websiteOperatingCost", {
        get: function () {
            return this.activeWebsitePortsNb * this.params.costs.websiteOnePortOperating;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ECommerce.prototype, "serviceCost", {
        get: function () {
            return Math.round(this.internetMarket.salesRevenue * this.params.costs.serviceCostRate);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ECommerce.prototype, "ISPCost", {
        get: function () {
            return this.websiteOperatingCost + this.serviceCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ECommerce.prototype, "internetDistributionCost", {
        get: function () {
            return this.distributor.totalCost + this.feesCost;
        },
        enumerable: true,
        configurable: true
    });
    // actions
    ECommerce.prototype.developWebsite = function (budget) {
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }
        this.websiteDevBudget = budget;
    };
    ECommerce.prototype.operateOn = function (portsNb) {
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }
        this.wantedWebsitePortsNb = portsNb;
        this.isInitialJoining = this.activeWebsitePortsNb === 0 && portsNb > 0;
        this.isClosingDown = this.activeWebsitePortsNb > 0 && portsNb === 0;
        if (this.isClosingDown) {
            this.distributor.dismiss(this.params.distributorsNb);
        }
        if (this.isInitialJoining) {
            this.distributor.recruit(this.params.distributorsNb);
        }
        if (this.params.capacityChangeEffectiveness === ENUMS.FUTURES.IMMEDIATE) {
            this.activeWebsitePortsNb = portsNb;
        }
    };
    ECommerce.prototype.onFinish = function () {
        CashFlow.addPayment(this.ISPCost, this.params.payments.ISP);
        CashFlow.addPayment(this.feesCost, this.params.payments.ISP);
        CashFlow.addPayment(this.websiteDevelopmentCost, this.params.payments.websiteDev);
    };
    ECommerce.prototype.getEndState = function () {
        var result = {};
        var state = {
            "activeWebsitePortsNb": this.activeWebsitePortsNb,
            "websiteVisitsNb": this.websiteVisitsNb,
            //"successfulWebsiteVisitsPerThousand": this.failedWebsiteVisitsRate,
            "serviceComplaintsNb": this.serviceComplaintsNb,
            "distributionCost": this.internetDistributionCost,
            "ISPCost": this.ISPCost,
            "websiteDevelopmentCost": this.websiteDevelopmentCost
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
    return ECommerce;
})();
module.exports = ECommerce;
//# sourceMappingURL=ECommerce.js.map