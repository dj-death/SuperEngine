var ObjectsManager = require('../../ObjectsManager');
var Bank = (function () {
    function Bank(params) {
        this.params = params;
    }
    Bank.prototype.init = function (centralBank) {
        this.reset();
        // Stack range exception
        //this.centralBank = centralBank;
        this._interestRate = centralBank.initialInterestBaseRate;
        this.initialised = true;
        ObjectsManager.register(this, "environnement", true);
    };
    Bank.prototype.reset = function () {
        this.initialised = false;
    };
    Object.defineProperty(Bank.prototype, "interestRate", {
        get: function () {
            return this._interestRate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bank.prototype, "authorisedOverdraftInterestRate", {
        get: function () {
            var baseRate = this.interestRate;
            return baseRate * (1 + this.params.authorisedOverdraftPremiumRate);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bank.prototype, "unAuthorisedOverdraftInterestRate", {
        get: function () {
            var baseRate = this.interestRate;
            return baseRate * (1 + this.params.unAuthorisedOverdraftPremiumRate);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bank.prototype, "termLoansInterestRate", {
        get: function () {
            return this.params.termloansFixedAnnualInterestRate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bank.prototype, "termDepositCreditorInterestRate", {
        get: function () {
            var baseRate = this.interestRate;
            return baseRate * (1 + this.params.termDepositPremiumRate);
        },
        enumerable: true,
        configurable: true
    });
    // actions
    Bank.prototype.demandTermLoans = function (amount) {
        return amount;
    };
    Bank.prototype.repayTermLoans = function (amount) {
    };
    // helpers
    Bank.prototype.calcAuthorisedOverdraftLimit = function (companyFile) {
        var limit;
        limit = companyFile.property * 0.5;
        limit += companyFile.inventories * 0.5;
        limit += companyFile.tradeReceivables * 0.9;
        limit -= companyFile.tradePayables;
        limit -= companyFile.taxDue;
        return limit;
    };
    return Bank;
})();
module.exports = Bank;
//# sourceMappingURL=Bank.js.map