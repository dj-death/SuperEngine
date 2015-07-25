import console = require('../../../../utils/logger');

import ENUMS = require('../../ENUMS');
import Company = require('../../Company');


import ObjectsManager = require('../../ObjectsManager');


import CashFlow = require('./CashFlow');

interface CapitalParams {
    shareNominalValue: number;

    restrictions: {
        capitalAnnualVariationLimitRate: number;
        minSharePriceToIssueShares: number;
        minSharePriceToRepurchaseShares: number;
    }

    payments: ENUMS.PaymentArray;
}

class Capital {
    private initialised: boolean;

    params: CapitalParams;

    constructor(params: CapitalParams) {
        this.params = params;
    }

    private initialShareCapital: number;

    private initialSharesNb: number;
    private openingSharePrice: number;

    private lastRetainedEarnings: number;

    init(initialShareCapital: number, sharesNb: number, openingSharePrice: number, openingMarketValuation: number, lastRetainedEarnings: number) {
        this.reset();

        this.initialShareCapital = initialShareCapital;

        this.initialSharesNb = sharesNb;
        this.openingSharePrice = openingSharePrice;

        this.lastRetainedEarnings = lastRetainedEarnings;

        this.initialised = true;

        ObjectsManager.register(this, "finance");
    }

    reset() {
        this.issuedSharesNb = 0;
        this.repurchasedSharesNb = 0;

        this.initialised = false;
    }

    // decision
    sharesNbVariation: number;
    issuedSharesNb: number;
    repurchasedSharesNb: number;

    dividendRate: number;
    

    // result
    get sharesNb(): number {
        return this.initialSharesNb + this.sharesNbVariation;
    }

    //------
    get sharesValue(): number {

        return this.sharesNb * this.sharePrice;
    }

    get sharePrice(): number {
        return - 1;
    }
    
    get shareCapital(): number {
        return this.sharesNb * this.sharePrice;
    }

    // actions
    changeSharesNb(amount: number) {
        if (amount > 0) {
            this.issueShares(amount);
        }

        if (amount < 0) {
            this.repurchaseShares(amount);
        }

        //this.sharesNbVariation; 
    }

    issueShares(amount: number) {
        if (this.openingSharePrice < this.params.restrictions.minSharePriceToIssueShares) {
            return;
        }
    }

    repurchaseShares(amount: number) {
        if (this.openingSharePrice < this.params.restrictions.minSharePriceToRepurchaseShares) {
            return;
        }
    }

    payDividend(rate: number) {
        if (rate <= 0) {
            return;
        }

        // on initial
        var totalDividends = this.initialShareCapital * rate;

        if (totalDividends > this.lastRetainedEarnings) {
            rate = this.lastRetainedEarnings / this.initialShareCapital;
        }

        this.dividendRate = rate;
    }

    // cost

    get dividendPaid(): number {
        return this.dividendRate * this.initialShareCapital;
    }

    get sharesIssued(): number {
        return this.dividendRate * this.issuedSharesNb;
    }

    get sharesRepurchased(): number {
        return this.dividendRate * this.repurchasedSharesNb;
    }

    onFinish() {
        CashFlow.addPayment(this.dividendPaid, this.params.payments, ENUMS.ACTIVITY.FINANCING);
        CashFlow.addPayment(this.sharesRepurchased, this.params.payments, ENUMS.ACTIVITY.FINANCING);

        CashFlow.addReceipt(this.sharesIssued, this.params.payments, ENUMS.ACTIVITY.FINANCING);
    }

    getEndState(): any {

        var state = {
            "sharesRepurchased": this.sharesRepurchased,
            "sharesIssued": this.sharesIssued,
            "dividendPaid": this.dividendPaid
        };

        return state;
    }
}

export = Capital;