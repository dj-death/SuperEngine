import Supplier = require('../../Environnement/src/Supplier');
import Warehouse = require('./Warehouse');
import ENUMS = require('../../ENUMS');

import ObjectsManager = require('../../ObjectsManager');

import logger = require('../../../../utils/logger');

interface RawMaterialParams {
    id: string;
    spaceNeeded: number;
    label: string;

    diffReelAndCalculatedValue: number;
}

class RawMaterial {
    private initialised: boolean;

    params: RawMaterialParams;

    private suppliers: Supplier.Supplier<RawMaterial>[];
    private warehouse: Warehouse;

    constructor(rawMaterialParams: RawMaterialParams) {
        this.params = rawMaterialParams;
    }

    init(suppliers: Supplier.Supplier<RawMaterial>[], warehouse: Warehouse) {
        this.reset();

        this.suppliers = suppliers;

        // attach suppliers to this rawMateriel
        /*for (var i = 0, len = suppliers.length; i < len; i++) {
            this.suppliers[i].init(this);
        }*/

        this.warehouse = warehouse;
        this.warehouse.stockedItem = this;

        // let's work
        this.initialised = true;

        ObjectsManager.register(this, "production");
    }

    reset() {
        this.purchasesValue = 0;
        this.purchasesQ = 0;

        this.unplannedPurchasesQ = 0;

        this.initialised = false;
    }

    purchasesValue: number;
    purchasesQ: number;

    unplannedPurchasesQ: number;

    // set valuation method
    get inventoryUnitValue(): number {
        var spotPrice = this.suppliers[0]._getReelTimePrice(ENUMS.QUALITY.MQ, ENUMS.FUTURES.IMMEDIATE);
        var mth3Price = this.suppliers[0]._getReelTimePrice(ENUMS.QUALITY.MQ, ENUMS.FUTURES.THREE_MONTH);
        var mth6Price = this.suppliers[0]._getReelTimePrice(ENUMS.QUALITY.MQ, ENUMS.FUTURES.SIX_MONTH);

        var unitValue = Math.min(spotPrice, mth3Price, mth6Price);

        return unitValue;
    }

    get inventoryUnitValueForPremiumQuality(): number {
        var unitValue = this.inventoryUnitValue;
        var qualityPremium = this.suppliers[0].params.unplannedPurchasesPremium;

        return unitValue * (1 + qualityPremium);
    }

    // 90% of the lowest of the spot, 3-month and 6- month prices quoted last quarter (converted into euros), 
    // times the number of units in stock and on order
    get closingValue(): number {
        var quantity = this.warehouse.availableNextPeriodQ + this.warehouse.deliveryAfterNextPQ;

        var calculatedValue = quantity * this.inventoryUnitValue;
        var reelValue = calculatedValue * (1 - this.params.diffReelAndCalculatedValue);

        return Math.round(reelValue);
    }

    // actions

    supply(quantity: number, value: number, term: ENUMS.FUTURES, isUnplanned: boolean = false): boolean {
        if (!this.initialised) {
            console.log('not initialised');
            return false;
        }

        this.purchasesValue += value;
        this.purchasesQ += quantity;

        if (isUnplanned) {
            this.unplannedPurchasesQ += quantity;
        }

        return this.warehouse.moveIn(quantity, value, term) > 0;
    }
        
    consume(quantity: number, premiumQualityProp: number): boolean {
        if (!this.initialised) {
            console.log('not initialised');
            return false;
        }

        var deliveredQ: number,
            standardMaterialQ: number;

        standardMaterialQ = quantity * (1 - premiumQualityProp);

        // premium materiel work in JIT
        this.suppliers[0].order(quantity * premiumQualityProp, ENUMS.QUALITY.HQ, ENUMS.FUTURES.IMMEDIATE);

        // normal material from stock
        deliveredQ = this.warehouse.moveOut(standardMaterialQ); 

        if (deliveredQ < standardMaterialQ) {
            this.suppliers[0].order(standardMaterialQ - deliveredQ, ENUMS.QUALITY.MQ, ENUMS.FUTURES.IMMEDIATE, true);
        }

        return true;

    }

    

    getEndState(): any {
        var result = {};

        var state = {
            "openingQ": this.warehouse.openingQ,
            //"premiumMaterialPurchasesQ": this.suppliers[0].premiumMaterialPurchasesQ,
            "unplannedPurchasesQ": this.unplannedPurchasesQ,
            "lostQ": this.warehouse.lostQ,
            "outQ": this.warehouse.outQ,
            "closingQ": this.warehouse.closingQ,
            "deliveryNextPBoughtBeforeLastPQ": this.warehouse.deliveryNextPBoughtBeforeLastPQ
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

export = RawMaterial;