import CentralBank = require('./CentralBank');

import ENUMS = require('../../ENUMS');

import ObjectsManager = require('../../ObjectsManager');

import console = require('../../../../utils/logger');



interface BankParams {
    id: string;

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

    constructor(params: BankParams) {
        this.params = params;
    }

    private centralBank: CentralBank;

    init(centralBank: CentralBank) {
        this.reset();

        // Stack range exception
        this.centralBank = centralBank;

        this.initialised = true;

        ObjectsManager.register(this, "environnement", true);
    }

    reset() {

        this.initialised = false;
    }

    private get interestRate(): number {
        return this.centralBank.initialInterestBaseRate;
    }

    get authorisedOverdraftInterestRate(): number {
        var baseRate = this.interestRate;

        return baseRate * (1 + this.params.authorisedOverdraftPremiumRate);
    }

    get unAuthorisedOverdraftInterestRate(): number {
        var baseRate = this.interestRate;

        return baseRate * (1 + this.params.unAuthorisedOverdraftPremiumRate);
    }

    get termLoansInterestRate(): number {
        return this.params.termloansFixedAnnualInterestRate;
    }

    get termDepositCreditorInterestRate(): number {
        var baseRate = this.interestRate;

        return baseRate * (1 + this.params.termDepositPremiumRate);
    }

    // actions

    demandTermLoans(amount: number): number {
        return amount;
    }

    repayTermLoans(amount: number) {

    }

    // helpers

    calcAuthorisedOverdraftLimit(companyFile: ENUMS.Company_BankFile): number {
        var limit: number;

        limit = companyFile.property * 0.5;
        limit += companyFile.inventories * 0.5;
        limit += companyFile.tradeReceivables * 0.9;
        limit -= companyFile.tradePayables;
        limit -= companyFile.taxDue;

        return limit;
    }

}


export = Bank;