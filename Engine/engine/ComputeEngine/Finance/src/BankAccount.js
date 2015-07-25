var ENUMS = require('../../ENUMS');
var ObjectsManager = require('../../ObjectsManager');
var CashFlow = require('./CashFlow');
var BankAccount = (function () {
    function BankAccount(params) {
        this.params = params;
    }
    BankAccount.prototype.init = function (bank, initialBalance, lastTermDeposit, lastTermLoans, lastOverdraft, currPeriodOverdraftLimit) {
        if (initialBalance === void 0) { initialBalance = 0; }
        if (lastTermDeposit === void 0) { lastTermDeposit = 0; }
        if (lastTermLoans === void 0) { lastTermLoans = 0; }
        if (lastOverdraft === void 0) { lastOverdraft = 0; }
        if (currPeriodOverdraftLimit === void 0) { currPeriodOverdraftLimit = Number.MAX_VALUE; }
        this.reset();
        this.bank = bank;
        this.initialBalance = initialBalance;
        this.credit = initialBalance > 0 ? initialBalance : 0;
        this.debit = initialBalance < 0 ? Math.abs(initialBalance) : 0;
        this.termDeposit = lastTermDeposit;
        this.initialTermLoans = lastTermLoans;
        this.initialOverdraft = lastOverdraft;
        this.overdraftLimit = currPeriodOverdraftLimit;
        this.initialised = true;
        ObjectsManager.register(this, "finance");
    };
    BankAccount.prototype.reset = function () {
        this.additionnelTermLoans = 0;
        this.credit = 0;
        this.debit = 0;
        this.initialised = false;
    };
    Object.defineProperty(BankAccount.prototype, "termLoans", {
        get: function () {
            return this.initialTermLoans + this.additionnelTermLoans;
        },
        enumerable: true,
        configurable: true
    });
    BankAccount.prototype.withdraw = function (amount) {
        // don't accept negative values
        if (amount <= 0) {
            return;
        }
        this.debit += amount;
    };
    BankAccount.prototype.payIn = function (amount) {
        // don't accept negative values
        if (amount <= 0) {
            return;
        }
        this.credit += amount;
    };
    // actions
    BankAccount.prototype.changeTermDepositAmount = function (variation) {
        if (variation > 0) {
            this.placeOnTermDeposit(variation);
        }
        if (variation < 0) {
            this.withdrawTermDeposit(Math.abs(variation));
        }
    };
    BankAccount.prototype.placeOnTermDeposit = function (amount) {
        this.termDeposit += amount;
    };
    BankAccount.prototype.withdrawTermDeposit = function (amount) {
        if (this.termDeposit < amount) {
            amount = this.termDeposit;
        }
        this.termDeposit -= amount;
    };
    BankAccount.prototype.takeTermLoans = function (amount) {
        if (amount < 0) {
            if (this.bank.params.canTermLoansToBeRepaidDuringGame) {
                this.repayTermLoans(Math.abs(amount));
            }
            return;
        }
        var accordedTermLoans = this.bank.demandTermLoans(amount);
        this.additionnelTermLoans += accordedTermLoans;
    };
    // repay last period loans
    BankAccount.prototype.repayTermLoans = function (amount) {
        if (this.initialTermLoans < amount) {
            amount = this.initialTermLoans;
        }
        this.bank.repayTermLoans(amount);
        this.initialTermLoans -= amount;
    };
    BankAccount.prototype.calcOverdraftLimit = function (company_BankFile) {
        return this.bank.calcAuthorisedOverdraftLimit(company_BankFile);
    };
    Object.defineProperty(BankAccount.prototype, "cash", {
        // result
        get: function () {
            return this.balance - this.termDeposit;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BankAccount.prototype, "balance", {
        get: function () {
            return this.credit - this.debit - this.overdraft;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BankAccount.prototype, "overdraft", {
        get: function () {
            if (this.debit <= this.credit) {
                return 0;
            }
            return this.debit - this.credit;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BankAccount.prototype, "authorisedOverdraft", {
        get: function () {
            if (this.overdraft <= this.overdraftLimit) {
                return this.overdraft;
            }
            return this.overdraftLimit;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BankAccount.prototype, "unAuthorisedOverdraft", {
        get: function () {
            return this.overdraft - this.overdraftLimit;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BankAccount.prototype, "interestReceived", {
        get: function () {
            var interestRate = this.bank.termDepositCreditorInterestRate;
            var base = this.termDeposit;
            var prorataTemporis = this.params.periodDaysNb / 360;
            return base * interestRate * prorataTemporis;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BankAccount.prototype, "overdraftInterestPaid", {
        get: function () {
            // The interest rate charged on an unauthorised overdraft is much higher. 
            // Furthermore, this higher rate will apply to the whole overdraft, and not just the excess over your authorised limit.
            var interestRate = this.unAuthorisedOverdraft === 0 ? this.bank.authorisedOverdraftInterestRate : this.bank.unAuthorisedOverdraftInterestRate;
            var base = (this.overdraft + this.initialOverdraft) / 2;
            var prorataTemporis = this.params.periodDaysNb / 360;
            return base * interestRate * prorataTemporis;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BankAccount.prototype, "termLoansInterestPaid", {
        get: function () {
            var interestRate = this.bank.termLoansInterestRate;
            var base = this.termLoans;
            var prorataTemporis = this.params.periodDaysNb / 360;
            return base * interestRate * prorataTemporis;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BankAccount.prototype, "interestPaid", {
        get: function () {
            return this.termLoansInterestPaid + this.overdraftInterestPaid;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BankAccount.prototype, "additionalLoans", {
        // this period receipts
        get: function () {
            if (this.bank.params.termLoansAvailability === ENUMS.FUTURES.IMMEDIATE) {
                return this.additionnelTermLoans;
            }
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    BankAccount.prototype.onFinish = function () {
        CashFlow.addPayment(this.interestPaid, this.params.payments, ENUMS.ACTIVITY.FINANCING);
        CashFlow.addReceipt(this.interestReceived, this.params.payments, ENUMS.ACTIVITY.INVESTING);
        CashFlow.addReceipt(this.additionalLoans, this.params.payments, ENUMS.ACTIVITY.FINANCING);
    };
    BankAccount.prototype.getEndState = function () {
        var result = {};
        var state = {
            "interestPaid": this.interestPaid,
            "interestReceived": this.interestReceived,
            "banksOverdraft": this.overdraft,
            "termDeposit": this.termDeposit,
            "termLoansValue": this.termLoans,
            "previousBalance": this.initialBalance,
            "balance": this.balance,
            "additionalLoans": this.additionalLoans
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
    return BankAccount;
})();
module.exports = BankAccount;
//# sourceMappingURL=BankAccount.js.map