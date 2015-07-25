import RawMaterial = require('./RawMaterial');
import Warehouse = require('./Warehouse');
import SubContracter = require('../../Environnement/src/SubContracter');

import ENUMS = require('../../ENUMS');

import Atelier = require('./Atelier');

import Utils = require('../../../../utils/Utils');

import console = require('../../../../utils/logger');

import ObjectsManager = require('../../ObjectsManager');


import CashFlow = require('../../Finance/src/CashFlow');

interface RawMaterialConsumptionCfg {
    rawMaterial?: RawMaterial;
    consoUnit: number;
}

interface ManufacturingCfg {
    atelier?: Atelier;
    minManufacturingUnitTime: number;
}

interface SemiProductParams {
    id: string;
    // params
    spaceNeeded: number;
    label: string;

    lostProbability: number;
    rejectedProbability: number;

    costs: {
        inspectionUnit: number;
        planningUnit: number;
    }

    rawMaterialConsoCfg: RawMaterialConsumptionCfg;
    manufacturingCfg: ManufacturingCfg;
}

class SemiProduct {

    private initialised: boolean;

    params: SemiProductParams;

    manufacturingUnitTime: number;

    private warehouse: Warehouse;

    subContracter: SubContracter;

    constructor(semiProductParams: SemiProductParams) {
        this.params = semiProductParams;
    }

    init(atelier: Atelier, rawMaterial: RawMaterial, subContractor: SubContracter, lastPCommand3MthQ = 0, lastPCommand3MthValue = 0, lastPCommand6MthQ = 0, lastPCommand6MthValue = 0,
        beforeLastPCommand6MthQ = 0, beforeLastPCommand6MthValue = 0) {
        this.reset();

        this.subContracter = subContractor;

        this.params.manufacturingCfg.atelier = atelier;
        this.params.rawMaterialConsoCfg.rawMaterial = rawMaterial;

        this.warehouse = new Warehouse({
            lostProbability: this.params.lostProbability,

            costs: {
                fixedAdministrativeCost: 0,
                storageUnitCost: 0,
                externalStorageUnitCost: 3
            }
        }, this);

        this.warehouse.stockedItem = this;

        this.warehouse.init(0, 0, lastPCommand3MthQ, lastPCommand3MthValue, lastPCommand6MthQ, lastPCommand6MthValue,
                                                                                beforeLastPCommand6MthQ, beforeLastPCommand6MthValue);

        // now it's ok
        this.initialised = true;

        ObjectsManager.register(this, "production");
    }

    reset() {
        this.producedNb = 0;
        this.scheduledNb = 0;
        this.rejectedNb = 0;

        this.purchasesValue = 0;
        this.purchasesQ = 0;

        this.lastManufacturingParams = null;

        this.initialised = false;
    }

    purchasesValue: number;
    purchasesQ: number;

    get materialUnitCost(): number {
        var rmCfg = this.params.rawMaterialConsoCfg;

        if (! rmCfg.rawMaterial) {
            return 0;
        }

        var standardMaterialPrice = rmCfg.rawMaterial.inventoryUnitValue;
        var premiumMaterialPrice = rmCfg.rawMaterial.inventoryUnitValueForPremiumQuality;

        var premiumQualityProp = this.lastManufacturingParams && this.lastManufacturingParams[2] || 0;
        var consoUnit = rmCfg.consoUnit;

        var premiumMaterialQ = consoUnit * premiumQualityProp;
        var standardMaterialQ = consoUnit - premiumMaterialQ;

        var cost = (standardMaterialQ * standardMaterialPrice) + (premiumMaterialQ * premiumMaterialPrice);

        return cost;
    }

    get manufacturingUnitCost(): number {
        var mCfg = this.params.manufacturingCfg;
        var atelier = mCfg.atelier;
        var worker = atelier.worker;

        if (!worker) {
            return 0;
        }

        var manufacturingUnitTime = this.lastManufacturingParams && this.lastManufacturingParams[0];

        if (!manufacturingUnitTime || (manufacturingUnitTime < mCfg.minManufacturingUnitTime)) {
            manufacturingUnitTime = mCfg.minManufacturingUnitTime;
        }

        var cost = worker.timeUnitCost * (manufacturingUnitTime / 60);

        return cost;
    }

    // valuation method for components
    get inventoryUnitValue(): number {
        if (!this.subContracter) {
            return 0;
        }

        var quality = this.lastManufacturingParams && this.lastManufacturingParams[1] || 0;
        var unitValue = this.subContracter._getPrice(quality);

        return unitValue;
    }

    get closingValue(): number {
        var closingValue = this.warehouse.closingQ * this.inventoryUnitValue;

        return closingValue;
    }

    // helpers
    _calcRejectedUnitsNbOf(quantity: number): number {
        var landa: number,
            probability: number,
            value = 0,
            i = 0;

        probability = Math.random() * this.params.rejectedProbability;

        landa = probability * quantity;

        //return Math.round(Utils.getPoisson(landa));

        return 0;
    }

    lastManufacturingParams: number[];

    // results
    producedNb: number;
    scheduledNb: number;

    get availableNb(): number {
        return this.warehouse.availableQ;
    }

    rejectedNb: number;

    get lostNb(): number {
        return this.warehouse.lostQ;
    }

    get rawMaterialTotalConsoQ(): number {
        return this.producedNb * this.params.rawMaterialConsoCfg.consoUnit;
    }

    get manufacturingTotalHoursNb(): number {
        return this.producedNb * this.manufacturingUnitTime / 60;
    }

    getNeededResForProd(quantity: number, manufacturingUnitTime: number, premiumQualityProp: number = 0): any {
        if (!manufacturingUnitTime || isNaN(manufacturingUnitTime) || manufacturingUnitTime < 0) {
            manufacturingUnitTime = this.params.manufacturingCfg.minManufacturingUnitTime;
        }

        var mCfg = this.params.manufacturingCfg,
            rmCfg = this.params.rawMaterialConsoCfg,
            consoUnit = rmCfg.consoUnit;

        var atelierRes;

        manufacturingUnitTime = manufacturingUnitTime < mCfg.minManufacturingUnitTime ? mCfg.minManufacturingUnitTime : manufacturingUnitTime;

        var needed = {};    

        if (rmCfg.rawMaterial) {
            needed[rmCfg.rawMaterial.params.id] = quantity * consoUnit * (1 - premiumQualityProp);
            needed["premium_" + rmCfg.rawMaterial.params.id] = quantity * consoUnit * premiumQualityProp;
        }

        if (mCfg.atelier) {
            atelierRes = mCfg.atelier.getNeededTimeForProd(quantity, manufacturingUnitTime / 60);
        }

        Utils.ObjectApply(needed, atelierRes);

        return needed;
    }


    // actions
    manufacture(quantity: number, manufacturingUnitTime: number, premiumQualityProp: number = 0): number {
        if (!this.initialised) {
            console.debug('not initialised');
            return 0;
        }

        if (isNaN(quantity) || !isFinite(quantity) || quantity <= 0) {
            console.debug('Quantity not reel', arguments);
            return 0;
        }

        if (! manufacturingUnitTime || isNaN(manufacturingUnitTime) || manufacturingUnitTime < 0) {
            manufacturingUnitTime = this.params.manufacturingCfg.minManufacturingUnitTime;
        }

        this.lastManufacturingParams = [manufacturingUnitTime, premiumQualityProp];

        // use any outsourced components first
        if (this.warehouse.availableQ > 0) {
            return this.deliverTo(quantity);
        }

        var mCfg = this.params.manufacturingCfg,
            rmCfg = this.params.rawMaterialConsoCfg,
            consoUnit = rmCfg.consoUnit,

            i = 0,
            done: boolean,

            producedQ = 0;

        var effectiveQ;

        this.scheduledNb += quantity;

        manufacturingUnitTime = manufacturingUnitTime < mCfg.minManufacturingUnitTime ? mCfg.minManufacturingUnitTime : manufacturingUnitTime;

        this.manufacturingUnitTime = manufacturingUnitTime;

        for (; i < quantity; i++) {
            done = mCfg.atelier && mCfg.atelier.work(manufacturingUnitTime / 60);
            
            if (!done && mCfg.atelier) {
                break;
            }

            done = rmCfg.rawMaterial && rmCfg.rawMaterial.consume(consoUnit, premiumQualityProp);
            
            // if we have materiel but we didn'h have sufficient quantity then break;
            if (!done && rmCfg.rawMaterial) {
                // redo
                console.debug("Atelier @ Redo ");
                mCfg.atelier && mCfg.atelier.work(- manufacturingUnitTime / 60);
                break;
            }

            // finally everything is ok
            producedQ++;
        }

        this.producedNb += producedQ;

        return this.warehouse.moveIn(producedQ);

    }

    deliverTo(quantity: number): number {
        if (!this.initialised) {
            console.debug('not initialised');
            return 0;
        }

        var diff: number,
            availableQ: number,
            args;

        availableQ = this.warehouse.availableQ;

        console.debug("call SP stock", availableQ, " but you need ", quantity);
        
        diff = quantity - availableQ;

        if (diff > 0) {
            args = [diff];
            args = args.concat(this.lastManufacturingParams);
            
            this.manufacture.apply(this, args);
        } 

        return this.warehouse.moveOut(quantity);
    }

    reject(quantity) {
        this.warehouse.moveOut(quantity);
    }

    subContract(unitsNb: number, premiumQualityProp: number = 0): boolean {
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }

        var qualityIdx: number;

        qualityIdx = ENUMS.QUALITY.HQ * premiumQualityProp + ENUMS.QUALITY.MQ;

        this.subContracter.order(unitsNb, qualityIdx);

        return this.supply(unitsNb);
    }

    supply(quantity: number, value: number = 0, term: ENUMS.FUTURES = ENUMS.FUTURES.IMMEDIATE): boolean {
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }
        this.purchasesValue += value;
        this.purchasesQ += quantity;

        this.warehouse.moveIn(quantity, value, term);

        return true;
    }

    onFinish() {
        if (this.subContracter) {
            CashFlow.addPayment(this.purchasesValue, this.subContracter.params.payments);
        }
    }

    getEndState(): any {

        var result = {};

        var state = {
            
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

export = SemiProduct;