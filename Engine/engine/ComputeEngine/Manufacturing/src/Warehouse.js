var ENUMS = require('../../ENUMS');
var Utils = require('../../../../utils/Utils');
var console = require('../../../../utils/logger');
var ObjectsManager = require('../../ObjectsManager');
var CashFlow = require('../../Finance/src/CashFlow');
var Warehouse = (function () {
    function Warehouse(warehouseParams, stockedItem) {
        if (stockedItem === void 0) { stockedItem = null; }
        this.Insurance = null;
        this.params = warehouseParams;
        this.stockedItem = stockedItem;
    }
    // TODO: implement
    Warehouse.prototype._calcMaterialLostUnitsOfThis = function (quantity) {
        var lostQ, probability, landa;
        // based on ??,,
        probability = this.params.lostProbability * Math.random();
        landa = probability * quantity;
        lostQ = Math.round(Utils.getPoisson(landa));
        // reduce the quantity of stock
        if (this.availableQ < lostQ) {
            lostQ = this.availableQ;
        }
        this.availableQ -= lostQ;
        return lostQ;
    };
    Warehouse.prototype.init = function (openingQ, openingValue, beforeLastPCommand6MthQ, beforeLastPCommand6MthValue, lastPCommand3MthQ, lastPCommand3MthValue, lastPCommand6MthQ, lastPCommand6MthValue) {
        if (openingValue === void 0) { openingValue = 0; }
        if (beforeLastPCommand6MthQ === void 0) { beforeLastPCommand6MthQ = 0; }
        if (beforeLastPCommand6MthValue === void 0) { beforeLastPCommand6MthValue = 0; }
        if (lastPCommand3MthQ === void 0) { lastPCommand3MthQ = 0; }
        if (lastPCommand3MthValue === void 0) { lastPCommand3MthValue = 0; }
        if (lastPCommand6MthQ === void 0) { lastPCommand6MthQ = 0; }
        if (lastPCommand6MthValue === void 0) { lastPCommand6MthValue = 0; }
        this.reset();
        this.openingQ = openingQ;
        this.openingValue = openingValue;
        this.availableQ = openingQ;
        // let's begin
        this.initialised = true;
        // calc the lostQ and by the way diminuish the stock with loss
        this.lostQ = this._calcMaterialLostUnitsOfThis(this.openingQ);
        // the delivery from the last period comes so add it
        this.presentDeliveryBoughtLastPQ = lastPCommand3MthQ;
        this.presentDeliveryBoughtLastPValue = lastPCommand3MthValue;
        this.moveIn(this.presentDeliveryBoughtLastPQ, this.presentDeliveryBoughtLastPValue, ENUMS.FUTURES.IMMEDIATE);
        // the delivery from before last period comes so add it
        this.presentDeliveryBoughtBeforeLastPQ = beforeLastPCommand6MthQ;
        this.presentDeliveryBoughtBeforeLastPValue = beforeLastPCommand6MthValue;
        this.moveIn(this.presentDeliveryBoughtBeforeLastPQ, this.presentDeliveryBoughtBeforeLastPValue, ENUMS.FUTURES.IMMEDIATE);
        this.deliveryNextPBoughtBeforeLastPQ = lastPCommand6MthQ;
        this.deliveryNextPBoughtBeforeLastPValue = lastPCommand6MthValue;
        this.deliveryNextPQ = this.deliveryNextPBoughtBeforeLastPQ;
        this.deliveryNextPValue = this.deliveryNextPBoughtBeforeLastPValue;
        ObjectsManager.register(this, "production");
    };
    Warehouse.prototype.reset = function () {
        this.outQ = 0;
        this.inQ = 0;
        this.inValue = 0;
        this.waitNextPeriodQ = 0;
        this.waitAfterNextPeriodQ = 0;
        this.deliveryAfterNextPQ = 0;
        this.deliveryAfterNextPValue = 0;
        this.shortfallQ = 0;
        this.lostQ = 0;
        this.initialised = false;
    };
    Object.defineProperty(Warehouse.prototype, "spaceUsed", {
        get: function () {
            return this.closingQ * (this.stockedItem && this.stockedItem.params.spaceNeeded || 0);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Warehouse.prototype, "closingQ", {
        get: function () {
            return this.openingQ + this.inQ - this.outQ;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Warehouse.prototype, "unitValue", {
        get: function () {
            if (this.stockedItem && this.stockedItem.inventoryUnitValue) {
                return this.stockedItem.inventoryUnitValue;
            }
            var cmup = (this.openingValue + this.inValue) / (this.openingQ + this.inQ);
            return cmup;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Warehouse.prototype, "closingValue", {
        get: function () {
            return this.closingQ * this.unitValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Warehouse.prototype, "averageStock", {
        get: function () {
            return (this.openingValue + this.closingValue) * 0.5;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Warehouse.prototype, "externalStock", {
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Warehouse.prototype, "storageCost", {
        get: function () {
            return (this.closingQ - this.externalStock) * this.params.costs.storageUnitCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Warehouse.prototype, "externalStorageCost", {
        get: function () {
            return this.externalStock * this.params.costs.externalStorageUnitCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Warehouse.prototype, "administrativeCost", {
        get: function () {
            return this.params.costs.fixedAdministrativeCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Warehouse.prototype, "warehousingCost", {
        get: function () {
            return this.administrativeCost + this.storageCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Warehouse.prototype, "availableNextPeriodQ", {
        get: function () {
            return this.closingQ + this.deliveryNextPQ;
        },
        enumerable: true,
        configurable: true
    });
    // actions
    Warehouse.prototype.moveOut = function (quantity, acceptCommandWhateverHappens) {
        if (acceptCommandWhateverHappens === void 0) { acceptCommandWhateverHappens = false; }
        if (!this.initialised) {
            console.debug('not initialised');
            return 0;
        }
        if (isNaN(quantity) || !isFinite(quantity)) {
            console.debug('Warehouse @ Quantity not reel', arguments);
            return 0;
        }
        if (this.availableQ < quantity) {
            console.debug('il ne reste rien dans le stock');
            this.shortfallQ += (quantity - this.availableQ);
            if (!acceptCommandWhateverHappens) {
                return this.availableQ;
            }
            else {
                // give you what we have
                quantity = this.availableQ;
            }
        }
        this.outQ += quantity;
        this.availableQ -= quantity;
        // we responde 100 % of your quantity requested
        return quantity;
    };
    Warehouse.prototype.moveIn = function (quantity, value, term) {
        if (value === void 0) { value = 0; }
        if (term === void 0) { term = ENUMS.FUTURES.IMMEDIATE; }
        if (!this.initialised) {
            console.debug('not initialised');
            return 0;
        }
        if (isNaN(quantity) || !isFinite(quantity)) {
            console.debug('Warehouse @ Quantity not reel', arguments);
            return 0;
        }
        var lostQ = this._calcMaterialLostUnitsOfThis(this.inValue);
        switch (term) {
            case ENUMS.FUTURES.IMMEDIATE:
                this.inQ += quantity;
                this.availableQ += quantity;
                this.inValue += value;
                this.lostQ += lostQ;
                break;
            case ENUMS.FUTURES.THREE_MONTH:
                this.deliveryNextPQ += quantity;
                this.deliveryNextPValue += value;
                break;
            case ENUMS.FUTURES.SIX_MONTH:
                this.deliveryAfterNextPQ += quantity;
                this.deliveryAfterNextPValue += value;
                break;
        }
        return quantity - lostQ;
    };
    Warehouse.prototype.onFinish = function () {
        if (!this.params.payments) {
            this.params.payments = {
                "THREE_MONTH": {
                    credit: ENUMS.CREDIT.THREE_MONTH,
                    part: 1
                }
            };
        }
        CashFlow.addPayment(this.warehousingCost, this.params.payments);
    };
    Warehouse.prototype.getEndState = function () {
        return {};
    };
    return Warehouse;
})();
module.exports = Warehouse;
//# sourceMappingURL=Warehouse.js.map