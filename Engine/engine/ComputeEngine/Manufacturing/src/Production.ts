import Product = require('./Product');
import SemiProduct = require('./SemiProduct');
import Machine = require('./Machine');
import Atelier = require('./Atelier');
import Worker = require('./Worker');
import RawMaterial = require('./RawMaterial');
import Warehouse = require('./Warehouse');

import Land = require('./Land');
import Factory = require('./Factory');

import Utils = require('../../../../utils/Utils');

class Production {
    private static _instance: Production = null;

    products: Product[] = [];
    semiProducts: SemiProduct[] = [];
    machines: Machine[] = [];
    ateliers: Atelier[] = [];
    workers: Worker[] = [];
    materials: RawMaterial[] = [];
    warehouses: Warehouse[] = [];
    factories: Factory[] = [];
    lands: Land[] = [];


    public static init() {
        if (Production._instance) {
            delete Production._instance;
        }

        Production._instance = new Production();
    }
    

    constructor() {
        if (Production._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }

        Production._instance = this;
    }

    public static getInstance(): Production {
        if (Production._instance === null) {
            Production._instance = new Production();
        }
        return Production._instance;
    }

    public static register(objects: any[]) {

        var that = this.getInstance(),
            i = 0,
            len = objects.length,
            object;

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
    }


    // results
    get productsProducedNb(): number {
        return Utils.sums(this.products, "producedNb");
    }

    get scrapRevenue(): number {
        return Utils.sums(this.products, "scrapRevenue");
    }

    get productsScheduledNb(): number {
        return Utils.sums(this.products, "scheduledNb");
    }

    get stocksSpaceUsed(): number {
        return Utils.sums(this.warehouses, "spaceUsed");
    } 

    get machiningOperationsSpaceUsed(): number {
        return Utils.sums(this.machines, "spaceUsed");
    }
    
    get workersOperationsSpaceUsed(): number {
        return Utils.sums(this.workers, "spaceUsed");
    }
    
    get ateliersSpaceUsed(): number {
        return Utils.sums(this.ateliers, "spaceUsed");
    }  

    get ownedLandsSpace(): number {
        return Utils.sums(this.lands, "availableSpace");
    }

    get factoriesCO2PrimaryFootprintTotalWeight(): number {
        var weight = Utils.sums(this.factories, "CO2PrimaryFootprintWeight");

        return Utils.toFixed(weight, 2);
    }

    get productionCO2PrimaryFootprintTotalWeight(): number {
        var machinesCO2Weight = Utils.sums(this.machines, "CO2PrimaryFootprintWeight");
        var workersCO2Weight = Utils.sums(this.workers, "CO2PrimaryFootprintWeight");

        var totalWeight = machinesCO2Weight + workersCO2Weight;

        return Utils.toFixed(totalWeight, 2);
    }

    get CO2PrimaryFootprintTotalWeight(): number {
        var weight = this.factoriesCO2PrimaryFootprintTotalWeight + this.productionCO2PrimaryFootprintTotalWeight;

        return Utils.toFixed(weight, 2);
    }

   
    // costs
    get CO2PrimaryFootprintOffsettingCost(): number {
        var factoriesShare = Utils.sums(this.factories, "CO2PrimaryFootprintOffsettingCost");
        var machinesShare = Utils.sums(this.machines, "CO2PrimaryFootprintOffsettingCost");
        var workersShare = Utils.sums(this.workers, "CO2PrimaryFootprintOffsettingCost");

        var totalCost = factoriesShare + machinesShare + workersShare;

        return totalCost;
    }

    get factoriesFixedCost(): number {
        return Utils.sums(this.factories, "fixedCost");
    }

    get productsDevelopmentCost(): number {
        return Utils.sums(this.products, "productDevelopmentCost");
    }

    get machinesMaintenanceCost(): number {
        return Utils.sums(this.machines, "maintenanceCost");
    }

    get machinesRunningCost(): number {
        return Utils.sums(this.machines, "runningCost") + Utils.sums(this.products, "prodPlanningCost");
    }

    get machinesDecommissioningCost(): number {
        return Utils.sums(this.machines, "decommissioningCost")
    }

    get guaranteeServicingCost(): number {
        return Utils.sums(this.products, "guaranteeServicingCost");
    }

    get qualityControlCostCost(): number {
        return Utils.sums(this.products, "qualityControlCost");
    }  
    
    get warehousingCost(): number {
        return Utils.sums(this.warehouses, "warehousingCost");
    }   
    
    get materialsPurchasedCost(): number {
        return Utils.sums(this.materials, "purchasesValue");
    }  
    
    get componentsPurchasedCost(): number {
        return Utils.sums(this.semiProducts, "purchasesValue");
    }   
    
    get unskilledWorkersWagesCost(): number {
        return Utils.sums(this.workers, "adjustedWages", "params.isUnskilled", true);
    }
    
    get skilledWorkersWagesCost(): number {
        return Utils.sums(this.workers, "adjustedWages", "params.isUnskilled", false);
    }

    get miscellaneousCost(): number {
        var totalCost = 0;

        totalCost += this.factoriesFixedCost;
        totalCost += this.machinesDecommissioningCost;
        totalCost += this.CO2PrimaryFootprintOffsettingCost;

        return totalCost;
    }

    get machineryNetValue(): number {
        return Utils.sums(this.machines, "machineryNetValue");
    }
    
    get landNetValue(): number {
        return Utils.sums(this.lands, "netValue");
    }

    get buildingsNetValue(): number {
        return Utils.sums(this.factories, "netValue");
    }

    get depreciation(): number {
        var totalValue = 0;

        totalValue += Utils.sums(this.machines, "depreciation");
        totalValue += Utils.sums(this.lands, "depreciation");
        totalValue += Utils.sums(this.factories, "depreciation");

        return totalValue;
    }

    get inventory_openingValue(): number {
        return Utils.sums(this.warehouses, "openingValue");
    }

    get inventory_closingValue(): number {
        // the calculation of material is different from warehouse as it includes also next deliveries
        //return Utils.sums(this.warehouses, "closingValue");

        var materialsInventoriesValue = this.materialsInventoriesValue;
        var componentsInventoriesValue = this.componentsInventoriesValue;
        var productsInventoriesValue = this.productsInventoriesValue;

        var total = materialsInventoriesValue + componentsInventoriesValue + productsInventoriesValue;

        return total;
        
    }

    get productsInventoriesValue(): number {
        return Utils.sums(this.products, "closingValue");
    }

    // just for components
    get componentsInventoriesValue(): number {
        return Utils.sums(this.semiProducts, "closingValue", "subContracter");
    }

    get materialsInventoriesValue(): number {
        return Utils.sums(this.materials, "closingValue");
    }

    public static getEndState(): any {
        var that = this.getInstance();
        var proto = this.prototype;
        var endState = {};

        for (var key in proto) {
            endState[key] = that[key];
        }

        return endState;

    }
}

export = Production; 