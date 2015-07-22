import console = require('../../../../utils/logger');

import ENUMS = require('../../ENUMS');
import Company = require('../../Company');


import ObjectsManager = require('../../ObjectsManager');

interface CapitalParams {
    shareNominalValue: number;

    restrictions: {
        capitalAnnualVariationLimitRate: number;
        minSharePriceToIssueShares: number;
        minSharePriceToRepurchaseShares: number;
    }
}

class Capital {
    private initialised: boolean;

    params: CapitalParams;

    constructor(params: CapitalParams) {
        this.params = params;
    }


    private initialSharesNb: number;
    private openingSharePrice: number;
    private lastRetainedEarnings: number;

    init(shareCapital: number, sharesNb: number, openingSharePrice: number, openingMarketValuation: number, lastRetainedEarnings: number) {
        this.reset();

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

        var totalDividends = this.sharesNb * rate;

        if (totalDividends > this.lastRetainedEarnings) {

        }
    }

    // cost

    get dividendPaid(): number {
        return this.dividendRate * this.sharesNb;
    }

    get sharesIssued(): number {
        return this.dividendRate * this.issuedSharesNb;
    }

    get sharesRepurchased(): number {
        return this.dividendRate * this.repurchasedSharesNb;
    }
}

export = Capital;