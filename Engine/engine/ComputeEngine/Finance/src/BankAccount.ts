import Bank = require('../../Environnement/src/Bank');
import ENUMS = require('../../ENUMS');


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

        this.termDeposit = lastTermDeposit;

        this.initialised = true;

        ObjectsManager.register(this, "finance");
    }

    reset() {
        this.balance = 0;
        this.termDeposit = 0;
        this.termLoans = 0;

        this.additionnalLoans = 0;

        this.initialised = false;
    }

    private balance: number;

    private termDeposit: number;
    private termLoans: number;

    private additionnalLoans: number;// curr period

    withdraw(amount: number) {
        this.balance -= amount;
    }

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
        this.termDeposit += amount;
    }

    withdrawTermDeposit(amount: number) {
        if (this.termDeposit < amount) {
            amount = this.termDeposit;
        }

        this.termDeposit -= amount;
    }

    takeTermLoans(amount: number) {
        if (amount < 0) {
            if (this.bank.params.canTermLoansToBeRepaidDuringGame) {
                this.repayTermLoans(Math.abs(amount));
            }

            return;
        }

        this.additionnalLoans += amount;

        if (this.bank.params.termLoansAvailability === ENUMS.FUTURES.IMMEDIATE) {
            this.termLoans += amount;
        }

        if (amount > 0) {
            this.termLoans += amount;
        }
    }

    repayTermLoans(amount: number) {
        if (this.termLoans < amount) {
            amount = this.termLoans;
        }

        this.termLoans -= amount;
    }

    takeOverdraft(amount: number) {
        
    }

    // result

    get overdraftLimit(): number {
        return 0;
    }

    get overdraft(): number {
        if (this.balance >= 0) {
            return 0;
        }

        return Math.abs(this.balance);
    }

    get authorisedOverdraft(): number {
        
    }

    get unAuthorisedOverdraft(): number {
        var total = this.overdraft - this.overdraftLimit;

        if 
    }



    get interestReceived(): number {
        return this.termDeposit * 
    }

    get interestPaid(): number {
        return this.termLoans * 
    }

    get banksOverdraft(): number {
        return this.authorisedOverdraft + this.unAuthorisedOverdraft; 
    }

    get termLoansValue(): number {
        return this.termLoans;
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