var ENUMS = require('../../ENUMS');
var CashFlow = (function () {
    function CashFlow() {
        this.operating = {
            payments: {},
            receipts: {},
            periodPayables: 0,
            periodPayments: 0,
            periodReceipts: 0
        };
        this.financing = {
            payments: {},
            receipts: {},
            periodPayables: 0,
            periodPayments: 0,
            periodReceipts: 0
        };
        this.investing = {
            payments: {},
            receipts: {},
            periodPayables: 0,
            periodPayments: 0,
            periodReceipts: 0
        };
        this.periodPayments = 0;
        this.periodReceipts = 0;
        if (CashFlow._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }
        CashFlow._instance = this;
    }
    CashFlow.init = function (bankAccount, periodDaysNb, initialCashFlowBalance, lastPayables) {
        if (initialCashFlowBalance === void 0) { initialCashFlowBalance = 0; }
        if (lastPayables === void 0) { lastPayables = 0; }
        if (CashFlow._instance) {
            delete CashFlow._instance;
        }
        CashFlow._instance = new CashFlow();
        CashFlow._instance.bankAccount = bankAccount;
        CashFlow._instance.lastPayables = lastPayables;
        CashFlow._instance.initialCashFlowBalance = initialCashFlowBalance;
        this.periodDaysNb = periodDaysNb;
        // now pay payables of last period
        CashFlow._instance.bankAccount.withdraw(lastPayables);
    };
    CashFlow.getInstance = function () {
        if (CashFlow._instance === null) {
            CashFlow._instance = new CashFlow();
        }
        return CashFlow._instance;
    };
    CashFlow.addPayment = function (total, paymentParams, activityType) {
        if (activityType === void 0) { activityType = ENUMS.ACTIVITY.OPERATING; }
        var self = this.getInstance();
        var activity;
        switch (activityType) {
            case ENUMS.ACTIVITY.INVESTING:
                activity = self.investing;
                break;
            case ENUMS.ACTIVITY.FINANCING:
                activity = self.financing;
                break;
            case ENUMS.ACTIVITY.OPERATING:
                activity = self.operating;
                break;
            default:
                activity = self.operating;
                break;
        }
        for (var key in paymentParams) {
            if (!paymentParams.hasOwnProperty(key)) {
                continue;
            }
            var item = paymentParams[key];
            var amount = total * item.part;
            var credit = item.credit;
            var currPeriodPaymentsRatio;
            var currPeriodPayments;
            if (activity.payments[ENUMS.CREDIT[credit]] === undefined) {
                activity.payments[ENUMS.CREDIT[credit]] = 0;
            }
            activity.payments[ENUMS.CREDIT[credit]] += amount;
            if (credit === ENUMS.CREDIT.CASH) {
                currPeriodPaymentsRatio = 1;
            }
            else if (credit >= CashFlow.periodDaysNb) {
                currPeriodPaymentsRatio = 0;
            }
            else {
                currPeriodPaymentsRatio = 1 - credit / CashFlow.periodDaysNb;
            }
            currPeriodPayments = Math.round(amount * currPeriodPaymentsRatio);
            activity.periodPayments += currPeriodPayments;
            activity.periodPayables += (amount - currPeriodPayments);
            // now pay
            self.bankAccount.withdraw(currPeriodPayments);
        }
    };
    CashFlow.addReceipt = function (total, paymentParams, activityType) {
        if (activityType === void 0) { activityType = ENUMS.ACTIVITY.OPERATING; }
        var self = this.getInstance();
        var activity;
        switch (activityType) {
            case ENUMS.ACTIVITY.INVESTING:
                activity = self.investing;
                break;
            case ENUMS.ACTIVITY.FINANCING:
                activity = self.financing;
                break;
            case ENUMS.ACTIVITY.OPERATING:
                activity = self.operating;
                break;
            default:
                activity = self.operating;
                break;
        }
        for (var key in paymentParams) {
            if (!paymentParams.hasOwnProperty(key)) {
                continue;
            }
            var item = paymentParams[key];
            var amount = total * item.part;
            var credit = item.credit;
            var currPeriodRatio;
            var currPeriodReceipts;
            if (activity.receipts[ENUMS.CREDIT[credit]] === undefined) {
                activity.receipts[ENUMS.CREDIT[credit]] = 0;
            }
            activity.receipts[ENUMS.CREDIT[credit]] += amount;
            if (credit === ENUMS.CREDIT.CASH) {
                currPeriodRatio = 1;
            }
            else if (credit >= CashFlow.periodDaysNb) {
                currPeriodRatio = 0;
            }
            else {
                currPeriodRatio = 1 - credit / CashFlow.periodDaysNb;
            }
            currPeriodReceipts = Math.round(amount * currPeriodRatio);
            activity.periodReceipts += currPeriodReceipts;
            // now receive money
            self.bankAccount.payIn(currPeriodReceipts);
        }
    };
    Object.defineProperty(CashFlow.prototype, "tradingReceipts", {
        get: function () {
            return this.operating.periodReceipts;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CashFlow.prototype, "tradingPayments", {
        get: function () {
            return this.operating.periodPayments + this.lastPayables;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CashFlow.prototype, "tradePayablesValue", {
        get: function () {
            return this.operating.periodPayables;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CashFlow.prototype, "assetsSales", {
        get: function () {
            return this.investing.periodReceipts;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CashFlow.prototype, "assetsPurchases", {
        get: function () {
            return this.investing.periodPayments;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CashFlow.prototype, "operatingNetCashFlow", {
        get: function () {
            return this.operating.periodReceipts - this.operating.periodPayments;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CashFlow.prototype, "financingNetCashFlow", {
        get: function () {
            return this.financing.periodReceipts - this.financing.periodPayments;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CashFlow.prototype, "investingNetCashFlow", {
        get: function () {
            return this.investing.periodReceipts - this.investing.periodPayments;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CashFlow.prototype, "netCashFlow", {
        get: function () {
            return this.operatingNetCashFlow + this.investingNetCashFlow + this.financingNetCashFlow;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CashFlow.prototype, "cashFlowBalance", {
        get: function () {
            return this.netCashFlow + this.initialCashFlowBalance;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CashFlow.prototype, "previousBalance", {
        get: function () {
            return this.initialCashFlowBalance;
        },
        enumerable: true,
        configurable: true
    });
    CashFlow.getEndState = function () {
        var that = this.getInstance();
        var proto = this.prototype;
        var endState = {};
        var value;
        for (var key in proto) {
            value = that[key];
            if (typeof value === "object" || typeof value === "function") {
                continue;
            }
            endState[key] = value;
        }
        return endState;
    };
    CashFlow._instance = null;
    return CashFlow;
})();
module.exports = CashFlow;
//# sourceMappingURL=CashFlow.js.map