import RawMaterial = require('../../engine/ComputeEngine/Manufacturing/src/RawMaterial');
import Warehouse = require('../../engine/ComputeEngine/Manufacturing/src/Warehouse');

import Supplier = require('../../engine/ComputeEngine/Environnement/src/Supplier');

import ENUMS = require('../../engine/ComputeEngine/ENUMS');

class RMWarehouse extends Warehouse {

}

var material = new RawMaterial({
    id: "material",
    label: "Material",

    CO2Footprint: {
        kwh: 0,
        weight: 0
    },

    spaceNeeded: 0.005,

    canUnplannedMaterialPurchases: true,

    diffReelAndCalculatedValue: 0.1
});

var supplier = new Supplier.Supplier<RawMaterial>({
    name: "Supplier",

    availableFutures: {
        "IMMEDIATE": { term: ENUMS.FUTURES.IMMEDIATE},
        "THREE_MONTH": { term: ENUMS.FUTURES.THREE_MONTH},
        "SIX_MONTH": { term: ENUMS.FUTURES.SIX_MONTH}
    },

    availableQualities: {
        "MQ": { index: 100, premium: 0 },
        "HQ": { index: 200, premium: 0.5 }
    },

    payments: {
        "CASH": { credit: ENUMS.CREDIT.CASH, part: 0.5 },
        "THREE_MONTH": { credit: ENUMS.CREDIT.THREE_MONTH, part: 0.5 }
    },

    deliveryDelai: ENUMS.DELIVERY.IMMEDIATE,

    discountRate: 0,
    interestRate: 0,
    rebateRate: 0,

    canUnplannedMaterialPurchases: true,
    unplannedPurchasesPremium: 0.1
});


var rmWarehouse = new RMWarehouse({
    lostProbability: 0,

    costs: {
        storageUnitCost: 0,
        externalStorageUnitCost: 2.5,

        fixedAdministrativeCost: 7500
    }
});

var materials = {
    suppliers: [supplier],
    materials: [material],
    warehouses: [rmWarehouse]
};

export = materials;