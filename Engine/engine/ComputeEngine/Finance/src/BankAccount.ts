﻿import Bank = require('../../Environnement/src/Bank');
import ENUMS = require('../../ENUMS');
import Company = require('../../Company');


import ObjectsManager = require('../../ObjectsManager');

import console = require('../../../../utils/logger');


interface BankAccountParams {
    id: string;
    periodDaysNb: number;
}


class BankAccount {
    private initialised: boolean;

    params: BankAccountParams;

    constructor(params: BankAccountParams) {
        this.params = params;
    }

    private company: Company.Company;
    private bank: Bank;

    init(company: Company.Company, bank: Bank, initialBalance: number = 0, lastTermDeposit: number = 0, lastTermLoans: number = 0, lastOverdraft: number = 0, currPeriodOverdraftLimit: number = Number.MAX_VALUE) {
        this.reset();

        this.company = company;
        this.bank = bank;

        this.initialBalance = initialBalance;

        this.credit = initialBalance;
        this.termDeposit = lastTermDeposit;
        this.initialTermLoans = lastTermLoans;
        this.initialOverdraft = lastOverdraft;

        this.overdraftLimit = currPeriodOverdraftLimit;

        this.initialised = true;

        ObjectsManager.register(this, "finance");
    }

    reset() {
        this.additionnelTermLoans = 0;

        this.credit = 0;
        this.debit = 0;

        this.initialised = false;
    }


    private initialBalance: number;

    private credit: number;
    private debit: number;

    private initialTermLoans: number;
    private additionnelTermLoans: number;// curr period

    private initialOverdraft: number;

    private overdraftLimit: number;

    get termLoans(): number {
       return this.initialTermLoans + this.additionnelTermLoans;   
    }

    private termDeposit: number;

    withdraw(amount: number) {
        // don't accept negative values
        if (amount <= 0) {
            return;
        }

        this.debit += amount;
    }

    payIn(amount: number) {
         // don't accept negative values
        if (amount <= 0) {
            return;
        }

        this.credit += amount;
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

        var accordedTermLoans = this.bank.demandTermLoans(amount);

        this.additionnelTermLoans += accordedTermLoans;

        if (this.bank.params.termLoansAvailability === ENUMS.FUTURES.IMMEDIATE) {
            this.balance += accordedTermLoans;
        }

    }

    // repay last period loans
    repayTermLoans(amount: number) {
        if (this.initialTermLoans < amount) {
            amount = this.initialTermLoans;
        }

        this.bank.repayTermLoans(amount);

        this.initialTermLoans -= amount;
    }

    // result
    
    get cash(): number {
        return this.balance - this.termDeposit;
    }

    get balance(): number {
        return this.credit - this.debit - this.overdraft;
    }

    get nextPeriodOverdraftLimit(): number {
        //var company_BankFile = this.company.prepareCompanyBankFile();

        return 0;//this.bank.calcAuthorisedOverdraftLimit(company_BankFile);
    }

    get overdraft(): number {
        if (this.debit <= this.credit) {
            return 0;
        }

        return this.debit - this.credit;
    }

    get authorisedOverdraft(): number {
        if (this.overdraft <= this.overdraftLimit) {
            return this.overdraft;
        }

        return this.overdraftLimit;
    }

    get unAuthorisedOverdraft(): number {
        return this.overdraft - this.overdraftLimit;
    }



    get interestReceived(): number {
        var interestRate = this.bank.termDepositCreditorInterestRate;
        var base = this.termDeposit;
        var prorataTemporis = this.params.periodDaysNb / 360;

        return base * interestRate * prorataTemporis;
    }

    get overdraftInterestPaid(): number {
        // The interest rate charged on an unauthorised overdraft is much higher. 
        // Furthermore, this higher rate will apply to the whole overdraft, and not just the excess over your authorised limit.
        var interestRate = this.unAuthorisedOverdraft === 0 ? this.bank.authorisedOverdraftInterestRate : this.bank.unAuthorisedOverdraftInterestRate;
        var base = (this.overdraft + this.initialOverdraft) / 2;
        var prorataTemporis = this.params.periodDaysNb / 360;

        return base * interestRate * prorataTemporis;
    }

    get termLoansInterestPaid(): number {
        var interestRate = this.bank.termLoansInterestRate;
        var base = this.termLoans;
        var prorataTemporis = this.params.periodDaysNb / 360;

        return base * interestRate * prorataTemporis;
    }

    get interestPaid(): number {
        return this.termLoansInterestPaid + this.overdraftInterestPaid;
    }


    getEndState(): any {
        var result = {};

        var state = {
            "interestPaid": this.interestPaid,
            "interestReceived": this.interestReceived,
            "banksOverdraft": this.overdraft,
            "termDeposit": this.termDeposit,
            "termLoansValue": this.termLoans,
            "previousBalance": this.initialBalance,
            "balance": this.balance
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