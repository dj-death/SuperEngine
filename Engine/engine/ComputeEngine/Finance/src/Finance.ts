import Insurance = require('./Insurance');
import BankAccount = require('./BankAccount');


import Utils = require('../../../../utils/Utils');
import console = require('../../../../utils/logger');


class Finance {
    private static _instance: Finance = null;

    private insurances: Insurance[] = [];

    private bankAccounts: BankAccount[] = [];

    public static init() {
        if (Finance._instance) {
            delete Finance._instance;
        }

        Finance._instance = new Finance();
    }


    constructor() {
        if (Finance._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }

        Finance._instance = this;
    }

    public static getInstance(): Finance {
        if (Finance._instance === null) {
            Finance._instance = new Finance();
        }

        return Finance._instance;
    }

    public static register(objects: any[]) {

        var that = this.getInstance(),
            i = 0,
            len = objects.length,
            object;

        for (; i < len; i++) {
            object = objects[i];

            if (object instanceof Insurance) {
                that.insurances.push(object);
            }

            else if (object instanceof BankAccount) {
                that.bankAccounts.push(object);
            }
        }
    }
    
    get insurancesPremiumsCost(): number {
        return Utils.sums(this.insurances, "premiumsCost");
    }

    get insurancesClaimsForLosses(): number {
        return Utils.sums(this.insurances, "claimsForLosses");
    }

    get insurancesReceipts(): number {
        return Utils.sums(this.insurances, "receipts");
    }

    get insurancePrimaryNonInsuredRisk(): number {
        return Utils.sums(this.insurances, "primaryNonInsuredRisk");
    }

    get interestPaid(): number {
        return Utils.sums(this.bankAccounts, "interestPaid");
    }

    get interestReceived(): number {
        return Utils.sums(this.bankAccounts, "interestReceived");
    }

    get banksOverdraft(): number {
        return Utils.sums(this.bankAccounts, "overdraft");
    }

    get termDeposit(): number {
        return Utils.sums(this.bankAccounts, "termDeposit");
    }

    get termLoansValue(): number {
        return Utils.sums(this.bankAccounts, "termLoans");
    }

    get additionalLoans(): number {
        return Utils.sums(this.bankAccounts, "additionalLoans");
    }

    get balance(): number {
        return Utils.sums(this.bankAccounts, "balance");
    }

    get cashValue(): number {
        return Utils.sums(this.bankAccounts, "cash");
    }

    public static getEndState(): any {
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

    }

}

export = Finance; 