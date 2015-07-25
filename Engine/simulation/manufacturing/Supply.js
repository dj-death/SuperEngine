var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var RawMaterial = require('../../engine/ComputeEngine/Manufacturing/src/RawMaterial');
var Warehouse = require('../../engine/ComputeEngine/Manufacturing/src/Warehouse');
var Supplier = require('../../engine/ComputeEngine/Environnement/src/Supplier');
var ENUMS = require('../../engine/ComputeEngine/ENUMS');
var RMWarehouse = (function (_super) {
    __extends(RMWarehouse, _super);
    function RMWarehouse() {
        _super.apply(this, arguments);
    }
    return RMWarehouse;
})(Warehouse);
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
var supplier = new Supplier.Supplier({
    name: "Supplier",
    availableFutures: {
        "IMMEDIATE": { term: 0 /* IMMEDIATE */ },
        "THREE_MONTH": { term: 1 /* THREE_MONTH */ },
        "SIX_MONTH": { term: 2 /* SIX_MONTH */ }
    },
    availableQualities: {
        "MQ": { index: 100, premium: 0 },
        "HQ": { index: 200, premium: 0.5 }
    },
    payments: {
        "CASH": { credit: 0 /* CASH */, part: 0.5 },
        "THREE_MONTH": { credit: 90 /* THREE_MONTH */, part: 0.5 }
    },
    deliveryDelai: 0 /* IMMEDIATE */,
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
module.exports = materials;
//# sourceMappingURL=Supply.js.map