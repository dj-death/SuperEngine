import Bank = require('../../Environnement/src/Bank');

import ObjectsManager = require('../../ObjectsManager');

interface BankAccountParams {
    id: string;
}


class BankAccount {
    private initialised: boolean;

    params: BankAccountParams;

    constructor(params: BankAccountParams) {
        this.params = params;
    }

    private bank: Bank;

    init(bank: Bank, lastTermDeposit: number = 0) {
        this.reset();

        this.bank = bank;

        this._termDeposit = lastTermDeposit;

        this.initialised = true;

        ObjectsManager.register(this, "finance");
    }

    reset() {
        this.initialised = false;
    }

    private _termDeposit: number;
    private _termLoans: number;


    // actions
    changeTermDepositAmount(variation: number) {
        if (variation > 0) {
            this.placeOnTermDeposit(variation);
        }

        if (variation < 0) {
            this.withdrawTermDeposit(Math.abs(variation));
        }
    }

    placeOnTermDeposit(amount: number) {
        this._termDeposit += amount;
    }

    withdrawTermDeposit(amount: number) {
        if (this._termDeposit < amount) {
            amount = this._termDeposit;
        }

        this._termDeposit -= amount;
    }

    takeTermLoans(amount: number) {
        if (amount < 0) {
            if (this.bank.params.canTermLoansToBeRepaidDuringGame) {
                this.repayTermLoans(Math.abs(amount));
            }

            return;
        }

        if (amount > 0) {
            this._termLoans += amount;
        }
    }

    repayTermLoans(amount: number) {
        if (this._termLoans < amount) {
            amount = this._termLoans;
        }

        this._termLoans -= amount;
    }

    // result
    get termDeposit() {
        return this._termDeposit;
    }


    getEndState(): any {
        var result = {};

        var state = {
            
        };

        for (var key in state) {
            if (!state.hasOwnProperty(key)) {
                continue;
            }

            var prop = this.params.id + "_" + key;
            result[prop] = state[key];
        }

        return result;

    }
}

export = BankAccount;