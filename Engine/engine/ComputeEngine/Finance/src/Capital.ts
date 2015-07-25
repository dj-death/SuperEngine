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

    private sharesNbAtStartOfYear: number;

    currQuarter: number;

    init(initialShareCapital: number, sharesNb: number, openingSharePrice: number, openingMarketValuation: number, lastRetainedEarnings: number, sharesNbAtStartOfYear: number, currQuarter: number) {
        this.reset();

        this.initialShareCapital = initialShareCapital;

        this.initialSharesNb = sharesNb;
        this.openingSharePrice = openingSharePrice;

        this.lastRetainedEarnings = lastRetainedEarnings;

        this.sharesNbAtStartOfYear = sharesNbAtStartOfYear;

        this.currQuarter = currQuarter;

        this.initialised = true;

        ObjectsManager.register(this, "finance");
    }

    reset() {
        this.issuedSharesNb = 0;
        this.repurchasedSharesNb = 0;

        this.initialised = false;
    }

    // decision
    issuedSharesNb: number;
    repurchasedSharesNb: number;

    dividendRate: number;
    

    // result
    get sharesNb(): number {
        return this.initialSharesNb + this.issuedSharesNb - this.repurchasedSharesNb;
    }

    get marketValuation(): number {
        return this.sharesNb * this.sharePrice;
    }

    get sharePrice(): number {
        return this.openingSharePrice;
    }
    
    get shareCapital(): number {
        return this.sharesNb * this.params.shareNominalValue;
    }

    // actions
    changeSharesNb(quantity: number) {
        if (quantity > 0) {
            this.issueShares(quantity);
        }

        if (quantity < 0) {
            this.repurchaseShares(quantity);
        }

    }

    issueShares(quantity: number) {
        if (this.openingSharePrice < this.params.restrictions.minSharePriceToIssueShares) {
            this.issuedSharesNb = 0;

            return;
        }

        var variationRate = Math.abs((this.initialSharesNb - this.sharesNbAtStartOfYear) / this.sharesNbAtStartOfYear);
        var maxAllowedVariationRate = this.params.restrictions.capitalAnnualVariationLimitRate - variationRate;
        var currPeriodMaxIssuedSharesNb = Math.round(maxAllowedVariationRate * this.sharesNbAtStartOfYear);

        if (quantity > currPeriodMaxIssuedSharesNb) {
            this.issuedSharesNb = currPeriodMaxIssuedSharesNb;
            return;
        }

        this.issuedSharesNb = quantity;
    }

    repurchaseShares(quantity: number) {
        if (this.openingSharePrice < this.params.restrictions.minSharePriceToRepurchaseShares) {
            this.repurchasedSharesNb = 0;

            return;
        }

        var variationRate = Math.abs((this.initialSharesNb - this.sharesNbAtStartOfYear) / this.sharesNbAtStartOfYear);
        var maxAllowedVariationRate = this.params.restrictions.capitalAnnualVariationLimitRate - variationRate;
        var currPeriodMaxRepurchasedSharesNb = Math.round(maxAllowedVariationRate * this.sharesNbAtStartOfYear);

        if (quantity > currPeriodMaxRepurchasedSharesNb) {
            this.repurchasedSharesNb = currPeriodMaxRepurchasedSharesNb;
            return;
        }

        this.repurchasedSharesNb = quantity;
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
        return this.initialShareCapital * this.dividendRate;
    }

    get sharesIssued(): number {
        return this.issuedSharesNb * this.openingSharePrice;
    }

    get sharesRepurchased(): number {
        return this.repurchasedSharesNb * this.openingSharePrice;
    }

    get sharePremiumAccount(): number {
        if (this.sharesIssued > 0) {
            return this.issuedSharesNb * (this.openingSharePrice - this.params.shareNominalValue);
        }

        return 0;
    }

    

    onFinish() {
        CashFlow.addPayment(this.dividendPaid, this.params.payments, ENUMS.ACTIVITY.FINANCING);
        CashFlow.addPayment(this.sharesRepurchased, this.params.payments, ENUMS.ACTIVITY.FINANCING);

        CashFlow.addReceipt(this.sharesIssued, this.params.payments, ENUMS.ACTIVITY.FINANCING);

        // setup again as w're about a new year
        if (this.currQuarter === 4) {
            this.sharesNbAtStartOfYear = this.sharesNb;
        }
    }

    getEndState(): any {

        var state = {
            "shareCapital": this.shareCapital,
            "sharePremiumAccount": this.sharePremiumAccount,

            "sharesRepurchased": this.sharesRepurchased,
            "sharesIssued": this.sharesIssued,
            "dividendPaid": this.dividendPaid,

            "sharesNbAtStartOfYear": this.sharesNbAtStartOfYear
        };

        return state;
    }
}

export = Capital;