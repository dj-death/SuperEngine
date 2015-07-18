var Warehouse = require('./Warehouse');
var ENUMS = require('../../ENUMS');
var Utils = require('../../../../utils/Utils');
var ObjectsManager = require('../../ObjectsManager');
var Product = (function () {
    function Product(params) {
        this.Insurance = null;
        this.params = params;
    }
    Product.prototype._calcRejectedUnitsNbOf = function (quantity) {
        var landa, probability, value = 0, result;
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
    };
    Product.prototype.init = function (semiProducts, lastImprovementResult) {
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
    };
    Product.prototype.reset = function () {
        this.wantedNb = 0;
        this.producedNb = 0;
        this.rejectedNb = 0;
        this.servicedQ = 0;
        this.localStocks = [];
        this.lastManufacturingParams = null;
        this.onMajorImprovementImplemented = function () {
        };
        this.onMinorImprovementImplemented = function () {
        };
        this.initialised = false;
    };
    Product.prototype.registerLocalStock = function (stock) {
        this.localStocks.push(stock);
    };
    Object.defineProperty(Product.prototype, "materialUnitCost", {
        get: function () {
            return Utils.sums(this.semiProducts, "materialUnitCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "manufacturingUnitCost", {
        get: function () {
            return Utils.sums(this.semiProducts, "manufacturingUnitCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "inventoryUnitValue", {
        // set valuation method
        get: function () {
            var totalCost = this.materialUnitCost + this.manufacturingUnitCost;
            var unitValue = totalCost * 1.1;
            return Math.round(unitValue);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "stockPrice", {
        get: function () {
            var prices = {
                "p1": 100,
                "p2": 336.42,
                "p3": 100
            };
            return prices[this.params.id];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "closingValue", {
        get: function () {
            var closingQ = Utils.sums(this.localStocks, "closingQ") + this.warehouse.closingQ;
            var closingValue = closingQ * this.inventoryUnitValue;
            return closingValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "availableNb", {
        get: function () {
            return this.warehouse.availableQ;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "lostNb", {
        get: function () {
            return this.warehouse.lostQ;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "scrapRevenue", {
        get: function () {
            return this.rejectedNb * this.params.costs.scrapValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "guaranteeServicingCost", {
        get: function () {
            return this.servicedQ * this.params.costs.guaranteeServicingCharge;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "productDevelopmentCost", {
        get: function () {
            return this.developmentBudget;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "qualityControlCost", {
        get: function () {
            return this.producedNb * this.params.costs.inspectionUnit;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "prodPlanningCost", {
        get: function () {
            return this.scheduledNb * this.params.costs.planningUnit;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "scheduledNb", {
        get: function () {
            return this.producedNb - this.rejectedNb - this.lostNb;
        },
        enumerable: true,
        configurable: true
    });
    Product.prototype.getNeededResForProd = function (quantity) {
        var semiProductsDecisions = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            semiProductsDecisions[_i - 1] = arguments[_i];
        }
        var rejectedNb = this._calcRejectedUnitsNbOf(quantity);
        quantity += rejectedNb;
        var i = 0, len = this.semiProducts.length, manufacturingUnitTime, premiumQualityProp, result = [];
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
                }
                else {
                    needed[key] += result[j][key];
                }
            }
        }
        return needed;
    };
    // actions
    Product.prototype.manufacture = function (quantity) {
        var semiProductsDecisions = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            semiProductsDecisions[_i - 1] = arguments[_i];
        }
        console.log(this.params.id, " / Receive order to product ", quantity);
        if (!this.initialised) {
            console.log('Product not initialised to Manufacture');
            return 0;
        }
        if (!quantity || isNaN(quantity) || !isFinite(quantity) || quantity <= 0) {
            console.log('Quantity not reel', arguments);
            return 0;
        }
        var diff = (this.semiProducts.length * 2) - (semiProductsDecisions.length - 1);
        if (diff < 0) {
            console.log("you didn't give us enough params to manufacture", diff);
        }
        var wantedNb = quantity;
        this.wantedNb += wantedNb;
        // we anticipate
        rejectedNb = this._calcRejectedUnitsNbOf(wantedNb);
        quantity += rejectedNb;
        var i = 0, semiPTypesNb = this.semiProducts.length, manufacturingUnitTime, premiumQualityProp, unitsNb, result = [], minUnitsNb;
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
            console.log("We command ", quantity, " of ", this.semiProducts[i].params.label, " and response is ", unitsNb, " after production of ", prodQ);
            result.push(unitsNb);
        }
        // we sort the results DESC and we take the first as it the min value
        result.sort(function (a, b) {
            return a - b;
        });
        minUnitsNb = result[0];
        console.log("The min from ", result, " is ", minUnitsNb);
        if (!minUnitsNb || minUnitsNb < 0) {
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
        console.log("Finally we get ", minUnitsNb - reelRejectedNb);
        console.log("Order ", wantedNb, "/ Diff ", minUnitsNb - reelRejectedNb - wantedNb);
        return minUnitsNb - reelRejectedNb;
    };
    Product.prototype.deliverTo = function (quantity, market, price, advertisingBudget, customerCredit) {
        if (!this.initialised) {
            console.log('Product not initialised');
            return 0;
        }
        var diff, args;
        var deliveredQ;
        diff = quantity - this.warehouse.availableQ;
        // on peut pas satisfaire la totalité de la demande
        if (diff > 0) {
            args = [diff];
            args = args.concat(this.lastManufacturingParams);
            console.log("Product", this.params.id, " call for compensation", diff);
            this.manufacture.apply(this, args);
        }
        deliveredQ = this.warehouse.moveOut(quantity);
        market.receiveFrom(deliveredQ, this, price, advertisingBudget, customerCredit);
        return quantity;
    };
    Product.prototype.developWithBudget = function (developmentBudget) {
        this.developmentBudget = developmentBudget;
        return true;
    };
    Product.prototype.onMajorImprovementImplemented = function () {
    };
    Product.prototype.onMinorImprovementImplemented = function () {
    };
    Product.prototype.on = function (eventName, callback, scope) {
        if (scope === void 0) { scope = null; }
        var self = this;
        var previousListeners = typeof this["on" + eventName] === "function" ? this["on" + eventName] : function () {
        };
        // cumumative
        this["on" + eventName] = function () {
            previousListeners();
            callback.apply(scope, [self]);
        };
    };
    Product.prototype.takeUpImprovements = function (isOk) {
        var lastRes = this.lastImprovementResult;
        if (!isOk) {
            return false;
        }
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
    };
    Product.prototype.returnForRepair = function (quantity) {
        this.servicedQ += quantity;
    };
    Product.prototype.getEndState = function () {
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
    };
    return Product;
})();
module.exports = Product;
//# sourceMappingURL=Product.js.map