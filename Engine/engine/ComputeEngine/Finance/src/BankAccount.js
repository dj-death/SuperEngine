var ObjectsManager = require('../../ObjectsManager');
var BankAccount = (function () {
    function BankAccount(params) {
        this.params = params;
    }
    BankAccount.prototype.init = function (bank, lastTermDeposit) {
        if (lastTermDeposit === void 0) { lastTermDeposit = 0; }
        this.reset();
        this.bank = bank;
        this._termDeposit = lastTermDeposit;
        this.initialised = true;
        ObjectsManager.register(this, "finance");
    };
    BankAccount.prototype.reset = function () {
        this.initialised = false;
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
        this._termDeposit += amount;
    };
    BankAccount.prototype.withdrawTermDeposit = function (amount) {
        if (this._termDeposit < amount) {
            amount = this._termDeposit;
        }
        this._termDeposit -= amount;
    };
    BankAccount.prototype.takeTermLoans = function (amount) {
        if (amount < 0) {
            if (this.bank.params.canTermLoansToBeRepaidDuringGame) {
                this.repayTermLoans(Math.abs(amount));
            }
            return;
        }
        if (amount > 0) {
            this._termLoans += amount;
        }
    };
    BankAccount.prototype.repayTermLoans = function (amount) {
        if (this._termLoans < amount) {
            amount = this._termLoans;
        }
        this._termLoans -= amount;
    };
    Object.defineProperty(BankAccount.prototype, "termDeposit", {
        // result
        get: function () {
            return this._termDeposit;
        },
        enumerable: true,
        configurable: true
    });
    BankAccount.prototype.getEndState = function () {
        var result = {};
        var state = {};
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