import Economy = require('./Economy');

import ENUMS = require('../../ENUMS');


interface BankParams {
    termloansFixedAnnualInterestRate: number;
    authorisedOverdraftPremiumRate: number;
    unAuthorisedOverdraftPremiumRate: number;

    termDepositMaturity: ENUMS.FUTURES;

    termDepositPremiumRate: number;

    canTermLoansToBeRepaidDuringGame: boolean;
    termLoansAvailability: ENUMS.FUTURES;
}

class Bank {
    private initialised: boolean;

    params: BankParams;

    private economy: Economy;

    constructor(params: BankParams) {
        this.params = params;
    }

    init(economy: Economy) {
        this.reset();

        this.economy = economy;

        this.initialised = true;
    }

    reset() {

        this.initialised = false;
    }

    get authorisedOverdraftAnnualInterestRate(): number {
        var baseRate = this.economy.interestBaseRate;

        return baseRate * (1 + this.params.authorisedOverdraftPremiumRate);
    }

    get unAuthorisedOverdraftAnnualInterestRate(): number {
        var baseRate = this.economy.interestBaseRate;

        return baseRate * (1 + this.params.unAuthorisedOverdraftPremiumRate);
    }

    get termDepositCreditorInterestRate(): number {
        var baseRate = this.economy.interestBaseRate;

        return baseRate * (1 + this.params.termDepositPremiumRate);
    }
}


export = Bank;