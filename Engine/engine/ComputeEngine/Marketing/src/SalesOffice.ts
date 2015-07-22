import Market = require('./Market');
import ObjectsManager = require('../../ObjectsManager');

import Utils = require('../../../../utils/Utils');
import console = require('../../../../utils/logger');

import CashFlow = require('../../Finance/src/CashFlow');

import ENUMS = require('../../ENUMS');


interface SalesOfficeParams {
    costs: {
        administrationCostRate: number;
    }

    payments: ENUMS.PaymentArray;
}


class SalesOffice {
    private initialised: boolean;

    params: SalesOfficeParams;

    markets: Market[];

    lastTradingReceivables: number;

    constructor(params: SalesOfficeParams) {
        this.params = params;
    }

    init(markets: Market[], lastTradingReceivables: number = 0) {
        this.reset();

        this.markets = markets;
        this.lastTradingReceivables = lastTradingReceivables;

        this.initialised = true;

        ObjectsManager.register(this, "marketing");
    }

    reset() {
        this.initialised = false;
    }

    get scrapsRevenue(): number {
        var productsNb = this.markets[0] && this.markets[0].subMarkets.length,
            sums = 0,
            product,
            i = 0;

        for (; i < productsNb; i++) {
            product = this.markets[0].subMarkets[i].product;

            sums += product.scrapRevenue;
        }

        return sums;
    }

    // result
    get productsSalesRevenue(): number {
        return Utils.sums(this.markets, "salesRevenue"); + Utils.sums(this.markets, "soldOffValue") + this.scrapsRevenue;
    }

    get soldOffRevenue(): number {
        return Utils.sums(this.markets, "soldOffValue");
    }

    get salesRevenue(): number {
        return this.productsSalesRevenue + this.soldOffRevenue + this.scrapsRevenue;
    }

    get ordersValue(): number {
        return Utils.sums(this.markets, "ordersValue");
    }

    // costs 
    get creditControlCost(): number {
        return Utils.sums(this.markets, "creditControlCost");
    }

    get administrationCost(): number {
        return Math.round(this.params.costs.administrationCostRate * Math.max(this.salesRevenue, this.ordersValue));
    }

    // cash flows
    get tradingReceipts(): number {
        var total: number;
        var unpayedFromLastTradeReceivables = 0.0962;
        var tradingReceiptsFromLastP = this.lastTradingReceivables * (1 - unpayedFromLastTradeReceivables);

        var otherSales = this.soldOffRevenue + this.scrapsRevenue;

        total = Utils.sums(this.markets, "tradingReceipts") + tradingReceiptsFromLastP + otherSales;

        return Math.ceil(total); 
    }

    get tradeReceivablesValue(): number {
        return this.lastTradingReceivables + this.salesRevenue - this.tradingReceipts;
    }

    onFinish() {
        CashFlow.addPayment(this.administrationCost, this.params.payments);
        CashFlow.addPayment(this.creditControlCost, this.params.payments);
    }

    getEndState(): any {
        this.onFinish();

        var result = {};

        var state = {
            "salesRevenue": this.salesRevenue,
            "creditControlCost": this.creditControlCost,
            "salesOfficeCost": this.administrationCost,
            "tradingReceipts": this.tradingReceipts,
            "tradeReceivablesValue": this.tradeReceivablesValue 
        };

        return state;

    }


}

export = SalesOffice;