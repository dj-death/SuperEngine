import Economy = require('../../Environnement/src/Economy');

import Product = require('../../Manufacturing/src/Product');
import Warehouse = require('../../Manufacturing/src/Warehouse');

import ENUMS = require('../../ENUMS');

import SalesForce = require('./SalesForce');

import Transport = require('./Transport');

import Utils = require('../../../../utils/Utils');
import console = require('../../../../utils/logger');

import ObjectsManager = require('../../ObjectsManager');

import CashFlow = require('../../Finance/src/CashFlow');


interface MarketParams {
    id: string;
    name: string;
  
    acceptBacklog: boolean;
    dissatisfiedOrdersCancelledPercent: number;

    costs: {
        creditControlUnitCost: number; // 0 means inactived
        creditCardRatePerUnitSold: number; // 0 means inactived
    };

    payments: {
        advertising: ENUMS.PaymentArray;
    };

    defaultCustomerCredit: ENUMS.CREDIT; // days
    periodDaysNb: number;
}

class SubMarket {
    private initialised: boolean;

    private economy: Economy;
    private market: Market;

    product: Product;

    private warehouse: Warehouse;

    private salesForce: SalesForce;

    params: MarketParams;

    lastPBacklogQ: number;

    constructor(market: Market, params: MarketParams) {
        this.market = market;
        this.economy = this.market.economy;

        this.params = params;
    }

    init(product: Product, salesForce: SalesForce, stockOpeningQ: number, stockOpeningValue: number = 0, lastPBacklogQ: number = 0) {
        this.reset();

        this.product = product;
        
        this.salesForce = salesForce;

        this.lastPBacklogQ = lastPBacklogQ;

        // create warehouse
        this.warehouse = new Warehouse({
            lostProbability: 0,
            costs: {
                fixedAdministrativeCost: 0,
                storageUnitCost: 0,
                externalStorageUnitCost: 0
            }
        });

        this.warehouse.stockedItem = this.product;

        this.warehouse.init(stockOpeningQ, stockOpeningValue);

        this.product.registerLocalStock(this.warehouse);

        this.product.on("MajorImprovementImplemented", this.onMajorImprovementImplemented, this);

        // now work
        this.initialised = true;

        ObjectsManager.register(this, "marketing");
    }

    reset() {
        this.orderedQ = 0;
        this.deliveredQ = 0;
        this.soldOffQ = 0;

        this.initialised = false;
    }

    /* the introduction of a major improvement renders existing models of the product obsolete. 
     * You may, therefore, wish to reduce existing product stocks
     * Taking up a major improvement has no effect on any backlog of unfulfilled orders you may have.
    */
    onMajorImprovementImplemented() {
        console.debug("onMajorImprovementImplemented");
        var openingQ = this.warehouse.openingQ;

        this.soldOffQ = this.warehouse.moveOut(openingQ, true);

        console.debug('openQ', openingQ, this.soldOffQ);
    }

    // decision
    advertisingBudget: number;

    price: number;

    customerCredit: ENUMS.CREDIT;

    deliveredQ: number;

    // results
    orderedQ: number;
    soldOffQ: number;

    get soldQ(): number {
        var demandQ = this.orderedQ + this.lastPBacklogQ;
        var supplyQ = this.deliveredQ + this.warehouse.openingQ - this.soldOffQ;

        return Math.min(demandQ, supplyQ);
    }

    get backlogQ(): number {
        if (! this.params.acceptBacklog) {
            return 0;
        }

        return Math.floor(this.warehouse.shortfallQ * (1 - this.params.dissatisfiedOrdersCancelledPercent));
    }

    get stockQ(): number {
        return this.warehouse.availableQ;
    }

    returnedQ: number;

    get salesRevenue(): number {
        return this.soldQ * this.price;
    }

    get ordersValue(): number {
        return this.orderedQ * this.price;
    }

    get soldOffValue(): number {
        // todo fix for cmup with inventory value
        return this.soldOffQ * this.product.inventoryUnitValue;
    }

    get stockValue(): number {
        // todo fix for cmup with inventory value
        return this.stockQ * this.product.inventoryUnitValue;
    }

    // cash flows
    get tradingReceipts(): number {
        var currPeriodReceiptsRatio: number;

        if (this.customerCredit === ENUMS.CREDIT.CASH) {
            currPeriodReceiptsRatio = 1;

        } else if (this.customerCredit >= this.params.periodDaysNb) {
            currPeriodReceiptsRatio = 0;

        } else {
            var advance = 0.0092;

            currPeriodReceiptsRatio = 1 - this.customerCredit / this.params.periodDaysNb;
            currPeriodReceiptsRatio = Utils.toCeilDecimals(currPeriodReceiptsRatio, 2) + advance;

        }

        return this.salesRevenue * currPeriodReceiptsRatio;
    }

    get tradeReceivablesValue(): number {
        return this.salesRevenue - this.tradingReceipts;
    }

    marketVolumeShareOfSales: number;
    marketValueShareOfSales: number;


    // helpers


    // actions
    receiveFrom(quantity: number, product: Product, price: number, adsBudget: number, customerCredit?: ENUMS.CREDIT): boolean {
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }

        var value = quantity * price;

        this.deliveredQ = quantity;
        this.price = price;
        this.advertisingBudget = adsBudget;

        this.customerCredit = customerCredit || this.params.defaultCustomerCredit;

        this.warehouse.moveIn(quantity, value);

        if (this.lastPBacklogQ > 0) {
            this.lastPBacklogQ -= this.getOrdersOf(this.lastPBacklogQ, false); // false not a new order
        }

        return true;
    }

    getOrdersOf(quantity: number, isNewOrder: boolean = true): number {
        if (!this.initialised) {
            console.debug('not initialised');
            return 0;
        }

        if (isNewOrder) {
            this.orderedQ += quantity;
        }

        var deliveredQ: number;

        // normal material from stock
        deliveredQ = this.warehouse.moveOut(quantity, true); // true to accept even if there is a shortfall

        if (deliveredQ < quantity) {

        }

        this.returnForRepair();

        return deliveredQ;
    }

    _calcReturnedQ(): number {
        return Math.round(this.soldQ  * 0.0371);

    }

    returnForRepair() {
        var returnedQ = this._calcReturnedQ();

        this.product.returnForRepair(returnedQ);
    }

    getEndState(): any {
        var result = {};

        var state = {
            "effectiveDeliveredQ": this.deliveredQ,
            "orderedQ": this.orderedQ,
            "soldQ": this.soldQ,
            "backlogQ": this.backlogQ,
            "stockQ": this.stockQ
        };

        for (var key in state) {
            if (!state.hasOwnProperty(key)) {
                continue;
            }

            var prop = this.market.params.id + "_";
            prop += this.product.params.id + "_";
            prop += key;

            result[prop] = state[key];
        }

        return result;

    }


}



class Market {
    
    private initialised: boolean;

    subMarkets: SubMarket[];

    private salesForce: SalesForce;

    private transport: Transport;

    economy: Economy;

    lastTradingReceivables: number;

    params: MarketParams;

    constructor(params: MarketParams) {
        this.params = params;
    }

    init(economy: Economy, products: Product[], salesForce: SalesForce, transport: Transport, stocksOpeningQs: number[], stocksOpeningValues: number[] = [], lastPBacklogQs: number[] = [], lastTradingReceivables: number = 0) {
        this.reset();

        this.economy = economy;
        this.salesForce = salesForce;
        this.transport = transport;

        this.lastTradingReceivables = lastTradingReceivables;

        this.transport.init(this);

        this.salesForce.market = this;

        var i = 0,
            len = products.length,
            productCode: number,

            subMarket: SubMarket;

        this.subMarkets = [];

        for (; i < len; i++) {
            productCode = products[i].params.code;

            subMarket = new SubMarket(this, this.params);
            subMarket.init(products[i], salesForce, stocksOpeningQs[i], stocksOpeningValues[i], lastPBacklogQs[i]);

            this.subMarkets[productCode] = subMarket;
        }

        // now work
        this.initialised = true;

        ObjectsManager.register(this, "marketing");
    }

    reset() {

        this.initialised = false;
    }

    // decision
    corporateComBudget: number;

    // results

    get hiredTransportCost(): number {
        return this.transport.hiredTransportCost;
    }

    get salesRevenue(): number {
        // aggregate sales revenue of all subMarkets
        return Utils.sums(this.subMarkets, "salesRevenue");
    }

    // cash flows
    get tradingReceipts(): number {
        return Utils.sums(this.subMarkets, "tradingReceipts");
    }

    get tradeReceivablesValue(): number {
        return Utils.sums(this.subMarkets, "tradeReceivablesValue");
    }


    get soldUnitsNb(): number {
        return Utils.sums(this.subMarkets, "soldQ");
    }

    get ordersValue(): number {
        return Utils.sums(this.subMarkets, "ordersValue");
    }

    get soldOffValue(): number {
        return Utils.sums(this.subMarkets, "soldOffValue");
    }

    get stockValue(): number {
        return Utils.sums(this.subMarkets, "stockValue");
    }

    get advertisingCost(): number {
        var total = 0,
            i = 0,
            len = this.subMarkets.length;

        total += this.corporateComBudget;

        for (; i < len; i++) {
            total += this.subMarkets[i].advertisingBudget;
        }

        return total;
    }

    get creditControlCost(): number {
        return this.soldUnitsNb * (this.params.costs.creditControlUnitCost + this.params.costs.creditCardRatePerUnitSold);
    }



    // actions
    receiveFrom(quantity: number, product: Product, price: number, adsBudget: number, customerCredit?: ENUMS.CREDIT): boolean {
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }

        this.transport.load(quantity / product.params.containerCapacityUnitsNb);

        var subMarket = this.subMarkets[product.params.code];

        return subMarket && subMarket.receiveFrom.apply(subMarket, arguments);
    }

    setCorporateCom(corporateComBudget: number): boolean {
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }

        this.corporateComBudget = corporateComBudget;

        return true;
    }
    

    // for test purpose
    __simulate(orders: number[]) {
        var i = 0,
            len = orders.length;

        var notTaken = [];

        for (; i < len; i++) {
            notTaken.push(this.subMarkets[i].getOrdersOf(orders[i]));
        }

        return notTaken;
    }

    onFinish() {
        CashFlow.addPayment(this.advertisingCost, this.params.payments.advertising);
    }

    getEndState(): any {

        var result = {};

        var state = {
        
        };

        for (var key in state) {
            if (!state.hasOwnProperty(key)) {
                continue;
            }

            var prop = this.params.id + "_";
            prop += key;

            result[prop] = state[key];
        }

        return result;

    }



}

export = Market;