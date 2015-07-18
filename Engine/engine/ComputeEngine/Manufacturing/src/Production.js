var Product = require('./Product');
var SemiProduct = require('./SemiProduct');
var Machine = require('./Machine');
var Atelier = require('./Atelier');
var Worker = require('./Worker');
var RawMaterial = require('./RawMaterial');
var Warehouse = require('./Warehouse');
var Land = require('./Land');
var Factory = require('./Factory');
var Utils = require('../../../../utils/Utils');
var Production = (function () {
    function Production() {
        this.products = [];
        this.semiProducts = [];
        this.machines = [];
        this.ateliers = [];
        this.workers = [];
        this.materials = [];
        this.warehouses = [];
        this.factories = [];
        this.lands = [];
        if (Production._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }
        Production._instance = this;
    }
    Production.init = function () {
        if (Production._instance) {
            delete Production._instance;
        }
        Production._instance = new Production();
    };
    Production.getInstance = function () {
        if (Production._instance === null) {
            Production._instance = new Production();
        }
        return Production._instance;
    };
    Production.register = function (objects) {
        var that = this.getInstance(), i = 0, len = objects.length, object;
        for (; i < len; i++) {
            object = objects[i];
            if (object instanceof Atelier) {
                that.ateliers.push(object);
            }
            else if (object instanceof Product) {
                that.products.push(object);
            }
            else if (object instanceof SemiProduct) {
                that.semiProducts.push(object);
            }
            else if (object instanceof Machine) {
                that.machines.push(object);
            }
            else if (object instanceof Worker) {
                that.workers.push(object);
            }
            else if (object instanceof RawMaterial) {
                that.materials.push(object);
            }
            else if (object instanceof Warehouse) {
                that.warehouses.push(object);
            }
            else if (object instanceof Factory) {
                that.factories.push(object);
            }
            else if (object instanceof Land) {
                that.lands.push(object);
            }
        }
    };
    Object.defineProperty(Production.prototype, "productsProducedNb", {
        // results
        get: function () {
            return Utils.sums(this.products, "producedNb");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "scrapRevenue", {
        get: function () {
            return Utils.sums(this.products, "scrapRevenue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "productsScheduledNb", {
        get: function () {
            return Utils.sums(this.products, "scheduledNb");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "stocksSpaceUsed", {
        get: function () {
            return Utils.sums(this.warehouses, "spaceUsed");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "machiningOperationsSpaceUsed", {
        get: function () {
            return Utils.sums(this.machines, "spaceUsed");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "workersOperationsSpaceUsed", {
        get: function () {
            return Utils.sums(this.workers, "spaceUsed");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "ateliersSpaceUsed", {
        get: function () {
            return Utils.sums(this.ateliers, "spaceUsed");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "ownedLandsSpace", {
        get: function () {
            return Utils.sums(this.lands, "availableSpace");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "factoriesCO2PrimaryFootprintTotalWeight", {
        get: function () {
            var weight = Utils.sums(this.factories, "CO2PrimaryFootprintWeight");
            return Utils.toFixed(weight, 2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "productionCO2PrimaryFootprintTotalWeight", {
        get: function () {
            var machinesCO2Weight = Utils.sums(this.machines, "CO2PrimaryFootprintWeight");
            var workersCO2Weight = Utils.sums(this.workers, "CO2PrimaryFootprintWeight");
            var totalWeight = machinesCO2Weight + workersCO2Weight;
            return Utils.toFixed(totalWeight, 2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "CO2PrimaryFootprintTotalWeight", {
        get: function () {
            var weight = this.factoriesCO2PrimaryFootprintTotalWeight + this.productionCO2PrimaryFootprintTotalWeight;
            return Utils.toFixed(weight, 2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "CO2PrimaryFootprintOffsettingCost", {
        // costs
        get: function () {
            var factoriesShare = Utils.sums(this.factories, "CO2PrimaryFootprintOffsettingCost");
            var machinesShare = Utils.sums(this.machines, "CO2PrimaryFootprintOffsettingCost");
            var workersShare = Utils.sums(this.workers, "CO2PrimaryFootprintOffsettingCost");
            var totalCost = factoriesShare + machinesShare + workersShare;
            return totalCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "factoriesFixedCost", {
        get: function () {
            return Utils.sums(this.factories, "fixedCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "productsDevelopmentCost", {
        get: function () {
            return Utils.sums(this.products, "productDevelopmentCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "machinesMaintenanceCost", {
        get: function () {
            return Utils.sums(this.machines, "maintenanceCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "machinesRunningCost", {
        get: function () {
            return Utils.sums(this.machines, "runningCost") + Utils.sums(this.products, "prodPlanningCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "machinesDecommissioningCost", {
        get: function () {
            return Utils.sums(this.machines, "decommissioningCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "guaranteeServicingCost", {
        get: function () {
            return Utils.sums(this.products, "guaranteeServicingCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "qualityControlCostCost", {
        get: function () {
            return Utils.sums(this.products, "qualityControlCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "warehousingCost", {
        get: function () {
            return Utils.sums(this.warehouses, "warehousingCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "materialsPurchasedCost", {
        get: function () {
            return Utils.sums(this.materials, "purchasesValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "componentsPurchasedCost", {
        get: function () {
            return Utils.sums(this.semiProducts, "purchasesValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "unskilledWorkersWagesCost", {
        get: function () {
            return Utils.sums(this.workers, "adjustedWages", "params.isUnskilled", true);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "skilledWorkersWagesCost", {
        get: function () {
            return Utils.sums(this.workers, "adjustedWages", "params.isUnskilled", false);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "miscellaneousCost", {
        get: function () {
            var totalCost = 0;
            totalCost += this.factoriesFixedCost;
            totalCost += this.machinesDecommissioningCost;
            totalCost += this.CO2PrimaryFootprintOffsettingCost;
            return totalCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "machineryNetValue", {
        get: function () {
            return Utils.sums(this.machines, "machineryNetValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "landNetValue", {
        get: function () {
            return Utils.sums(this.lands, "netValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "buildingsNetValue", {
        get: function () {
            return Utils.sums(this.factories, "netValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "depreciation", {
        get: function () {
            var totalValue = 0;
            totalValue += Utils.sums(this.machines, "depreciation");
            totalValue += Utils.sums(this.lands, "depreciation");
            totalValue += Utils.sums(this.factories, "depreciation");
            return totalValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "inventory_openingValue", {
        get: function () {
            return Utils.sums(this.warehouses, "openingValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "inventory_closingValue", {
        get: function () {
            // the calculation of material is different from warehouse as it includes also next deliveries
            //return Utils.sums(this.warehouses, "closingValue");
            var materialsInventoriesValue = this.materialsInventoriesValue;
            var componentsInventoriesValue = this.componentsInventoriesValue;
            var productsInventoriesValue = this.productsInventoriesValue;
            var total = materialsInventoriesValue + componentsInventoriesValue + productsInventoriesValue;
            return total;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "productsInventoriesValue", {
        get: function () {
            return Utils.sums(this.products, "closingValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "componentsInventoriesValue", {
        // just for components
        get: function () {
            return Utils.sums(this.semiProducts, "closingValue", "subContracter");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "materialsInventoriesValue", {
        get: function () {
            return Utils.sums(this.materials, "closingValue");
        },
        enumerable: true,
        configurable: true
    });
    Production.getEndState = function () {
        var that = this.getInstance();
        var proto = this.prototype;
        var endState = {};
        for (var key in proto) {
            endState[key] = that[key];
        }
        return endState;
    };
    Production._instance = null;
    return Production;
})();
module.exports = Production;
//# sourceMappingURL=Production.js.map