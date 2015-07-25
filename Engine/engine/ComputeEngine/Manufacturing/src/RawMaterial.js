var ENUMS = require('../../ENUMS');
var ObjectsManager = require('../../ObjectsManager');
var console = require('../../../../utils/logger');
var CashFlow = require('../../Finance/src/CashFlow');
var RawMaterial = (function () {
    function RawMaterial(rawMaterialParams) {
        this.params = rawMaterialParams;
    }
    RawMaterial.prototype.init = function (suppliers, warehouse) {
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
    };
    RawMaterial.prototype.reset = function () {
        this.purchasesValue = 0;
        this.purchasesQ = 0;
        this.unplannedPurchasesQ = 0;
        this.initialised = false;
    };
    Object.defineProperty(RawMaterial.prototype, "inventoryUnitValue", {
        // set valuation method
        get: function () {
            var spotPrice = this.suppliers[0]._getReelTimePrice(ENUMS.QUALITY.MQ, ENUMS.FUTURES.IMMEDIATE);
            var mth3Price = this.suppliers[0]._getReelTimePrice(ENUMS.QUALITY.MQ, ENUMS.FUTURES.THREE_MONTH);
            var mth6Price = this.suppliers[0]._getReelTimePrice(ENUMS.QUALITY.MQ, ENUMS.FUTURES.SIX_MONTH);
            var unitValue = Math.min(spotPrice, mth3Price, mth6Price);
            return unitValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RawMaterial.prototype, "inventoryUnitValueForPremiumQuality", {
        get: function () {
            var unitValue = this.inventoryUnitValue;
            var qualityPremium = this.suppliers[0].params.unplannedPurchasesPremium;
            return unitValue * (1 + qualityPremium);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RawMaterial.prototype, "closingValue", {
        // 90% of the lowest of the spot, 3-month and 6- month prices quoted last quarter (converted into euros), 
        // times the number of units in stock and on order
        get: function () {
            var quantity = this.warehouse.availableNextPeriodQ + this.warehouse.deliveryAfterNextPQ;
            var calculatedValue = quantity * this.inventoryUnitValue;
            var reelValue = calculatedValue * (1 - this.params.diffReelAndCalculatedValue);
            return Math.round(reelValue);
        },
        enumerable: true,
        configurable: true
    });
    // actions
    RawMaterial.prototype.supply = function (quantity, value, term, isUnplanned) {
        if (isUnplanned === void 0) { isUnplanned = false; }
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }
        this.purchasesValue += value;
        this.purchasesQ += quantity;
        if (isUnplanned) {
            this.unplannedPurchasesQ += quantity;
        }
        return this.warehouse.moveIn(quantity, value, term) > 0;
    };
    RawMaterial.prototype.consume = function (quantity, premiumQualityProp) {
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }
        var deliveredQ, standardMaterialQ;
        standardMaterialQ = quantity * (1 - premiumQualityProp);
        // premium materiel work in JIT
        this.suppliers[0].order(quantity * premiumQualityProp, ENUMS.QUALITY.HQ, ENUMS.FUTURES.IMMEDIATE);
        // normal material from stock
        deliveredQ = this.warehouse.moveOut(standardMaterialQ);
        if (deliveredQ < standardMaterialQ) {
            this.suppliers[0].order(standardMaterialQ - deliveredQ, ENUMS.QUALITY.MQ, ENUMS.FUTURES.IMMEDIATE, true);
        }
        return true;
    };
    RawMaterial.prototype.onFinish = function () {
        CashFlow.addPayment(this.purchasesValue, this.suppliers[0].params.payments);
    };
    RawMaterial.prototype.getEndState = function () {
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
    };
    return RawMaterial;
})();
module.exports = RawMaterial;
//# sourceMappingURL=RawMaterial.js.map