var Warehouse = require('./Warehouse');
var ENUMS = require('../../ENUMS');
var Utils = require('../../../../utils/Utils');
var ObjectsManager = require('../../ObjectsManager');
var SemiProduct = (function () {
    function SemiProduct(semiProductParams) {
        this.params = semiProductParams;
    }
    SemiProduct.prototype.init = function (atelier, rawMaterial, subContractor, lastPCommand3MthQ, lastPCommand3MthValue, lastPCommand6MthQ, lastPCommand6MthValue, beforeLastPCommand6MthQ, beforeLastPCommand6MthValue) {
        if (lastPCommand3MthQ === void 0) { lastPCommand3MthQ = 0; }
        if (lastPCommand3MthValue === void 0) { lastPCommand3MthValue = 0; }
        if (lastPCommand6MthQ === void 0) { lastPCommand6MthQ = 0; }
        if (lastPCommand6MthValue === void 0) { lastPCommand6MthValue = 0; }
        if (beforeLastPCommand6MthQ === void 0) { beforeLastPCommand6MthQ = 0; }
        if (beforeLastPCommand6MthValue === void 0) { beforeLastPCommand6MthValue = 0; }
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
        this.warehouse.init(0, 0, lastPCommand3MthQ, lastPCommand3MthValue, lastPCommand6MthQ, lastPCommand6MthValue, beforeLastPCommand6MthQ, beforeLastPCommand6MthValue);
        // now it's ok
        this.initialised = true;
        ObjectsManager.register(this, "production");
    };
    SemiProduct.prototype.reset = function () {
        this.producedNb = 0;
        this.scheduledNb = 0;
        this.rejectedNb = 0;
        this.purchasesValue = 0;
        this.purchasesQ = 0;
        this.lastManufacturingParams = null;
        this.initialised = false;
    };
    Object.defineProperty(SemiProduct.prototype, "materialUnitCost", {
        get: function () {
            var rmCfg = this.params.rawMaterialConsoCfg;
            if (!rmCfg.rawMaterial) {
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
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SemiProduct.prototype, "manufacturingUnitCost", {
        get: function () {
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
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SemiProduct.prototype, "inventoryUnitValue", {
        // valuation method for components
        get: function () {
            if (!this.subContracter) {
                return 0;
            }
            var quality = this.lastManufacturingParams && this.lastManufacturingParams[1] || 0;
            var unitValue = this.subContracter._getPrice(quality);
            return unitValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SemiProduct.prototype, "closingValue", {
        get: function () {
            var closingValue = this.warehouse.closingQ * this.inventoryUnitValue;
            return closingValue;
        },
        enumerable: true,
        configurable: true
    });
    // helpers
    SemiProduct.prototype._calcRejectedUnitsNbOf = function (quantity) {
        var landa, probability, value = 0, i = 0;
        probability = Math.random() * this.params.rejectedProbability;
        landa = probability * quantity;
        //return Math.round(Utils.getPoisson(landa));
        return 0;
    };
    Object.defineProperty(SemiProduct.prototype, "availableNb", {
        get: function () {
            return this.warehouse.availableQ;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SemiProduct.prototype, "lostNb", {
        get: function () {
            return this.warehouse.lostQ;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SemiProduct.prototype, "rawMaterialTotalConsoQ", {
        get: function () {
            return this.producedNb * this.params.rawMaterialConsoCfg.consoUnit;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SemiProduct.prototype, "manufacturingTotalHoursNb", {
        get: function () {
            return this.producedNb * this.manufacturingUnitTime / 60;
        },
        enumerable: true,
        configurable: true
    });
    SemiProduct.prototype.getNeededResForProd = function (quantity, manufacturingUnitTime, premiumQualityProp) {
        if (premiumQualityProp === void 0) { premiumQualityProp = 0; }
        if (!manufacturingUnitTime || isNaN(manufacturingUnitTime) || manufacturingUnitTime < 0) {
            manufacturingUnitTime = this.params.manufacturingCfg.minManufacturingUnitTime;
        }
        var mCfg = this.params.manufacturingCfg, rmCfg = this.params.rawMaterialConsoCfg, consoUnit = rmCfg.consoUnit;
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
    };
    // actions
    SemiProduct.prototype.manufacture = function (quantity, manufacturingUnitTime, premiumQualityProp) {
        if (premiumQualityProp === void 0) { premiumQualityProp = 0; }
        if (!this.initialised) {
            console.log('not initialised');
            return 0;
        }
        if (isNaN(quantity) || !isFinite(quantity) || quantity <= 0) {
            console.log('Quantity not reel', arguments);
            return 0;
        }
        if (!manufacturingUnitTime || isNaN(manufacturingUnitTime) || manufacturingUnitTime < 0) {
            manufacturingUnitTime = this.params.manufacturingCfg.minManufacturingUnitTime;
        }
        this.lastManufacturingParams = [manufacturingUnitTime, premiumQualityProp];
        // use any outsourced components first
        if (this.warehouse.availableQ > 0) {
            return this.deliverTo(quantity);
        }
        var mCfg = this.params.manufacturingCfg, rmCfg = this.params.rawMaterialConsoCfg, consoUnit = rmCfg.consoUnit, i = 0, done, producedQ = 0;
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
                console.log("Atelier @ Redo ");
                mCfg.atelier && mCfg.atelier.work(-manufacturingUnitTime / 60);
                break;
            }
            // finally everything is ok
            producedQ++;
        }
        this.producedNb += producedQ;
        return this.warehouse.moveIn(producedQ);
    };
    SemiProduct.prototype.deliverTo = function (quantity) {
        if (!this.initialised) {
            console.log('not initialised');
            return 0;
        }
        var diff, availableQ, args;
        availableQ = this.warehouse.availableQ;
        console.log("call SP stock", availableQ, " but you need ", quantity);
        diff = quantity - availableQ;
        if (diff > 0) {
            args = [diff];
            args = args.concat(this.lastManufacturingParams);
            this.manufacture.apply(this, args);
        }
        return this.warehouse.moveOut(quantity);
    };
    SemiProduct.prototype.reject = function (quantity) {
        this.warehouse.moveOut(quantity);
    };
    SemiProduct.prototype.subContract = function (unitsNb, premiumQualityProp) {
        if (premiumQualityProp === void 0) { premiumQualityProp = 0; }
        if (!this.initialised) {
            console.log('not initialised');
            return false;
        }
        var qualityIdx;
        qualityIdx = 2 /* HQ */ * premiumQualityProp + 1 /* MQ */;
        this.subContracter.order(unitsNb, qualityIdx);
        return this.supply(unitsNb);
    };
    SemiProduct.prototype.supply = function (quantity, value, term) {
        if (value === void 0) { value = 0; }
        if (term === void 0) { term = 0 /* IMMEDIATE */; }
        if (!this.initialised) {
            console.log('not initialised');
            return false;
        }
        this.purchasesValue += value;
        this.purchasesQ += quantity;
        this.warehouse.moveIn(quantity, value, term);
        return true;
    };
    return SemiProduct;
})();
module.exports = SemiProduct;
//# sourceMappingURL=SemiProduct.js.map