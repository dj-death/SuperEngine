var Insurance = require('./Insurance');
var BankAccount = require('./BankAccount');
var Capital = require('./Capital');
var Utils = require('../../../../utils/Utils');
var Finance = (function () {
    function Finance() {
        this.insurances = [];
        this.bankAccounts = [];
        if (Finance._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }
        Finance._instance = this;
    }
    Finance.init = function () {
        if (Finance._instance) {
            delete Finance._instance;
        }
        Finance._instance = new Finance();
    };
    Finance.getInstance = function () {
        if (Finance._instance === null) {
            Finance._instance = new Finance();
        }
        return Finance._instance;
    };
    Finance.register = function (objects) {
        var that = this.getInstance(), i = 0, len = objects.length, object;
        for (; i < len; i++) {
            object = objects[i];
            if (object instanceof Insurance) {
                that.insurances.push(object);
            }
            else if (object instanceof BankAccount) {
                that.bankAccounts.push(object);
            }
            else if (object instanceof Capital) {
                that.capital = object;
            }
        }
    };
    Finance.prototype.calcOverdraftLimit = function (company_BankFile) {
        var sums = 0;
        this.bankAccounts.forEach(function (account) {
            sums += account.calcOverdraftLimit(company_BankFile);
        });
        return sums;
    };
    Object.defineProperty(Finance.prototype, "insurancesPremiumsCost", {
        get: function () {
            return Utils.sums(this.insurances, "premiumsCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Finance.prototype, "insurancesClaimsForLosses", {
        get: function () {
            return Utils.sums(this.insurances, "claimsForLosses");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Finance.prototype, "insurancesReceipts", {
        get: function () {
            return Utils.sums(this.insurances, "receipts");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Finance.prototype, "insurancePrimaryNonInsuredRisk", {
        get: function () {
            return Utils.sums(this.insurances, "primaryNonInsuredRisk");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Finance.prototype, "interestPaid", {
        get: function () {
            return Utils.sums(this.bankAccounts, "interestPaid");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Finance.prototype, "interestReceived", {
        get: function () {
            return Utils.sums(this.bankAccounts, "interestReceived");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Finance.prototype, "banksOverdraft", {
        get: function () {
            return Utils.sums(this.bankAccounts, "overdraft");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Finance.prototype, "termDeposit", {
        get: function () {
            return Utils.sums(this.bankAccounts, "termDeposit");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Finance.prototype, "termLoansValue", {
        get: function () {
            return Utils.sums(this.bankAccounts, "termLoans");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Finance.prototype, "additionalLoans", {
        get: function () {
            return Utils.sums(this.bankAccounts, "additionalLoans");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Finance.prototype, "balance", {
        get: function () {
            return Utils.sums(this.bankAccounts, "balance");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Finance.prototype, "cashValue", {
        get: function () {
            return Utils.sums(this.bankAccounts, "cash");
        },
        enumerable: true,
        configurable: true
    });
    Finance.getEndState = function () {
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
    Finance._instance = null;
    return Finance;
})();
module.exports = Finance;
//# sourceMappingURL=Finance.js.map