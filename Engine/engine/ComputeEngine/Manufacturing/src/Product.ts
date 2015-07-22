import SemiProduct = require('./SemiProduct');
import Warehouse = require('./Warehouse');


import ENUMS = require('../../ENUMS');
import Utils = require('../../../../utils/Utils');

import console = require('../../../../utils/logger');

import Market = require('../../Marketing/src/Market');

import Insurance = require('../../Finance/src/Insurance');


import ObjectsManager = require('../../ObjectsManager');

import CashFlow = require('../../Finance/src/CashFlow');




interface ProductCosts {
    scrapValue: number;
    guaranteeServicingCharge: number;
    inspectionUnit: number;
    planningUnit: number;
}

interface ProductParams  {
    id: string;

    code: number;

    spaceNeeded: number;
    label: string;

    CO2Footprint: {
        kwh: number;
        weight: number;
    };

    containerCapacityUnitsNb: number;

    rejectedProbability: number;
    lostProbability: number;

    costs: ProductCosts;

    payments: {
        guaranteeServicing: ENUMS.PaymentArray;
        qualityControl: ENUMS.PaymentArray;
        development: ENUMS.PaymentArray;
    }
}

class Product {
    private initialised: boolean;

    params: ProductParams;

    private semiProducts: SemiProduct[];

    private warehouse: Warehouse;

    private localStocks: Warehouse[];

    Insurance: Insurance = null;

    constructor(params: ProductParams) {
        this.params = params;
    }

    _calcRejectedUnitsNbOf(quantity: number): number {
        var landa: number,
            probability: number,
            value = 0,
            result;

        probability = this.params.rejectedProbability;

        landa = probability * quantity;

        value = Utils.getPoisson(landa);

        switch (this.params.id) {
            case "p1":
                result = 97;
                break;

            case "p2":
                result = 56;
                break;

            case "p3":
                result = 35;
                break;
        }

        if (this.params.id === "p1") {
            if (this.rejectedNb < 97) {
                var diff = 97 - this.rejectedNb;

                value = diff;
            }

            if (this.rejectedNb >= 97) {
                
                value = 0;
            }
        }

        if (this.params.id === "p2") {
            if (this.rejectedNb < 56) {
                var diff = 56 - this.rejectedNb;

                value = diff;
            }


            if (this.rejectedNb >= 56) {

                value = 0;
            }
        }

        if (this.params.id === "p3") {
            if (this.rejectedNb < 35) {
                var diff = 35 - this.rejectedNb;

                value = diff;
            }


            if (this.rejectedNb >= 35) {

                value = 0;
            }
        }

        /*if (result > value) {
            result = Math.round(value);
        }

        if (result < 0 || ! isFinite(result)) {
            result = 0;
        }*/

        return value;
    }

    private lastImprovementResult: ENUMS.IMPROVEMENT_TYPE;


    init(semiProducts: SemiProduct[], lastImprovementResult: ENUMS.IMPROVEMENT_TYPE) {
        this.reset();

        this.semiProducts = semiProducts;
        this.lastImprovementResult = lastImprovementResult;

        this.warehouse = new Warehouse({
            lostProbability: this.params.lostProbability,

            costs: {
                fixedAdministrativeCost: 0,
                storageUnitCost: 0,
                externalStorageUnitCost: 0
            }
        }, this);

        this.warehouse.stockedItem = this;

        this.warehouse.init(0);

        // now everything is ok
        this.initialised = true;

        ObjectsManager.register(this, "production");
    }

    reset() {
        this.wantedNb = 0;
        this.producedNb = 0;
        this.rejectedNb = 0;
        this.servicedQ = 0;

        this.localStocks = [];

        this.lastManufacturingParams = null;

        this.onMajorImprovementImplemented = function () { };
        this.onMinorImprovementImplemented = function () { };

        this.initialised = false;
    }

    registerLocalStock(stock: Warehouse) {
        this.localStocks.push(stock);
    }

    get materialUnitCost(): number {
        return Utils.sums(this.semiProducts, "materialUnitCost");
    }

    get manufacturingUnitCost(): number {
        return Utils.sums(this.semiProducts, "manufacturingUnitCost");
    }

    // set valuation method
    get inventoryUnitValue(): number {
        var totalCost = this.materialUnitCost + this.manufacturingUnitCost;
        var unitValue = totalCost * 1.1;

        return Math.round(unitValue);
    }

    // decisions
    lastManufacturingParams: number[];

    developmentBudget: number;

    get stockPrice(): number {
        var prices = {
            "p1": 100,
            "p2": 336.42,
            "p3": 100
        };


        return prices[this.params.id];
    }

    // result
    wantedNb: number;
    producedNb: number;

    get closingValue(): number {
        var closingQ = Utils.sums(this.localStocks, "closingQ") + this.warehouse.closingQ;
        var closingValue = closingQ * this.inventoryUnitValue;

        return closingValue;
    }

    get availableNb(): number {
        return this.warehouse.availableQ;
    }

    rejectedNb: number;

    servicedQ: number;

    get lostNb(): number {
        return this.warehouse.lostQ;
    }

    get scrapRevenue(): number {
        return this.rejectedNb * this.params.costs.scrapValue;
    }

    get guaranteeServicingCost(): number {
        return this.servicedQ * this.params.costs.guaranteeServicingCharge;
    }

    get productDevelopmentCost(): number {
        return this.developmentBudget;
    }

    get qualityControlCost(): number {
        return this.producedNb * this.params.costs.inspectionUnit;
    }

    get prodPlanningCost(): number {
        return this.scheduledNb * this.params.costs.planningUnit;
    }

    get scheduledNb(): number {
        return this.producedNb - this.rejectedNb - this.lostNb;
    }

    getNeededResForProd(quantity, ...semiProductsDecisions: number[]): any {
        var rejectedNb = this._calcRejectedUnitsNbOf(quantity);
        quantity += rejectedNb;

        var i = 0,
            len = this.semiProducts.length,
            manufacturingUnitTime: number,
            premiumQualityProp: number,

            result = [];

        var resources;

        var lastParams = [].concat(this.lastManufacturingParams);

        var needed = {};

        for (; i < len; i++) {

            manufacturingUnitTime = semiProductsDecisions[2 * i] || lastParams[2 * i] || 0;
            premiumQualityProp = semiProductsDecisions[2 * i + 1] || lastParams[2 * i] || 0;

            resources = this.semiProducts[i].getNeededResForProd(quantity, manufacturingUnitTime, premiumQualityProp);

            result.push(resources);
        }

        for (var j = 0, len = result.length; j < len; j++) {
            for (var key in result[j]) {
                if (!result[j].hasOwnProperty(key)) {
                    continue;
                }

                if (isNaN(needed[key])) {
                    needed[key] = result[j][key];
                } else {
                    needed[key] += result[j][key];
                }
            }

        }

        return needed;
    }



    // actions
    manufacture(quantity: number, ...semiProductsDecisions: number[]): number {
        console.debug(this.params.id, " / Receive order to product ", quantity);
        if (!this.initialised) {
            console.debug('Product not initialised to Manufacture');
            return 0;
        }

        if (! quantity || isNaN(quantity) || !isFinite(quantity) || quantity <= 0) {
            console.debug('Quantity not reel', arguments);
            return 0;
        }

        var diff = (this.semiProducts.length * 2) - (semiProductsDecisions.length - 1);

        if (diff < 0) {
            console.debug("you didn't give us enough params to manufacture", diff);

        }

        var wantedNb = quantity;
        this.wantedNb += wantedNb;

        // we anticipate
        rejectedNb = this._calcRejectedUnitsNbOf(wantedNb);
        quantity += rejectedNb;

        var i = 0,
            semiPTypesNb = this.semiProducts.length,
            manufacturingUnitTime: number,
            premiumQualityProp: number,

            unitsNb: number,
            result: number[] = [],

            minUnitsNb: number;
		
        var rejectedNb;
        var reelRejectedNb;

        var lastParams = [].concat(this.lastManufacturingParams);
        this.lastManufacturingParams = [];

        for (; i < semiPTypesNb; i++) {
            var prodQ; 
            manufacturingUnitTime = semiProductsDecisions[2 * i] || lastParams[2 * i] || 0;
            premiumQualityProp = semiProductsDecisions[2 * i + 1] || lastParams[2 * i] || 0;

            this.lastManufacturingParams.push(manufacturingUnitTime);
            this.lastManufacturingParams.push(premiumQualityProp);
            /*
             * TODO ask what we have in stock before manufacturing
             */
            prodQ = this.semiProducts[i].manufacture(quantity, manufacturingUnitTime, premiumQualityProp);
            unitsNb = this.semiProducts[i].deliverTo(prodQ); // 3la 7ssab lost la tkon f Stock w bghit li sna3t lost 3la 7sabkom

            console.debug("We command ", quantity, " of ", this.semiProducts[i].params.label, " and response is ", unitsNb, " after production of ", prodQ);

            result.push(unitsNb);
        }


        // we sort the results DESC and we take the first as it the min value
        result.sort(function (a, b) { return a - b; })
        minUnitsNb = result[0];

        console.debug("The min from ", result, " is ", minUnitsNb);

        if (!minUnitsNb || minUnitsNb < 0 ) {
            return 0;
        }

        this.producedNb += minUnitsNb;

        // we do control
        reelRejectedNb = this._calcRejectedUnitsNbOf(minUnitsNb);
        this.rejectedNb += reelRejectedNb;

        // not needed as the fact we have already make them full product
        // eliminate them 
        /*i = 0;

        for (; i < semiPTypesNb; i++) {
            this.semiProducts[i].reject(reelRejectedNb);
        }
        */
		
		
        // now supply the stock
        this.warehouse.moveIn(minUnitsNb - reelRejectedNb);

        console.debug("Finally we get ", minUnitsNb - reelRejectedNb);
        console.debug("Order ", wantedNb, "/ Diff ", minUnitsNb - reelRejectedNb - wantedNb);

        return minUnitsNb - reelRejectedNb;
    }


    deliverTo(quantity: number, market: Market, price: number, advertisingBudget: number, customerCredit?: ENUMS.CREDIT): number {
        if (!this.initialised) {
            console.debug('Product not initialised');
            return 0;
        }

        var diff: number,
            args;

        var deliveredQ: number;

        diff = quantity - this.warehouse.availableQ;

        // on peut pas satisfaire la totalité de la demande
        if (diff > 0) {
            args = [diff];
            args = args.concat(this.lastManufacturingParams);
           
            console.debug("Product", this.params.id, " call for compensation", diff);

            this.manufacture.apply(this, args);
            
        }

        deliveredQ = this.warehouse.moveOut(quantity);

        market.receiveFrom(deliveredQ, this, price, advertisingBudget, customerCredit);

        return quantity;
    }

    developWithBudget(developmentBudget: number): boolean {
        this.developmentBudget = developmentBudget;


        return true;
    }

    onMajorImprovementImplemented() {}

    onMinorImprovementImplemented() {}


    on(eventName: string, callback: Function, scope = null) {
        var self = this;
        var previousListeners = typeof this["on" + eventName] === "function" ? this["on" + eventName] : function () { };
        // cumumative
        this["on" + eventName] = function () {
            previousListeners();
            callback.apply(scope, [self]);
        };
    }


    takeUpImprovements(isOk: boolean) {
        var lastRes = this.lastImprovementResult;

        if (!isOk) {
            return false;
        }

        // now is OK 
        switch (this.lastImprovementResult) {
            case ENUMS.IMPROVEMENT_TYPE.NONE:
                break;

            case ENUMS.IMPROVEMENT_TYPE.MINOR:
                this.onMinorImprovementImplemented();
                break;

            case ENUMS.IMPROVEMENT_TYPE.MAJOR:
                this.onMajorImprovementImplemented();
                break;
        }
    }

    returnForRepair(quantity: number) {
        this.servicedQ += quantity;
    }

    onFinish() {
        CashFlow.addPayment(this.guaranteeServicingCost, this.params.payments.guaranteeServicing);
        CashFlow.addPayment(this.qualityControlCost, this.params.payments.qualityControl);
        CashFlow.addPayment(this.prodPlanningCost, this.params.payments.qualityControl);
        CashFlow.addPayment(this.productDevelopmentCost, this.params.payments.development);
    }

    getEndState(): any {
        this.onFinish();

        var result = {};

        var state = {
            "scheduledQ": this.scheduledNb,
            "producedQ": this.producedNb,
            "rejectedQ": this.rejectedNb,
            "servicedQ": this.servicedQ,
            "lostQ": this.lostNb
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

export = Product;
