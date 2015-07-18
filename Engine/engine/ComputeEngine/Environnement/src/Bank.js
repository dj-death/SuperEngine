var Bank = (function () {
    function Bank(params) {
        this.params = params;
    }
    Bank.prototype.init = function (economy) {
        this.reset();
        this.economy = economy;
        this.initialised = true;
    };
    Bank.prototype.reset = function () {
        this.initialised = false;
    };
    Object.defineProperty(Bank.prototype, "authorisedOverdraftAnnualInterestRate", {
        get: function () {
            var baseRate = this.economy.interestBaseRate;
            return baseRate * (1 + this.params.authorisedOverdraftPremiumRate);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bank.prototype, "unAuthorisedOverdraftAnnualInterestRate", {
        get: function () {
            var baseRate = this.economy.interestBaseRate;
            return baseRate * (1 + this.params.unAuthorisedOverdraftPremiumRate);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bank.prototype, "termDepositCreditorInterestRate", {
        get: function () {
            var baseRate = this.economy.interestBaseRate;
            return baseRate * (1 + this.params.termDepositPremiumRate);
        },
        enumerable: true,
        configurable: true
    });
    return Bank;
})();
module.exports = Bank;
//# sourceMappingURL=Bank.js.map