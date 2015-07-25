var SemiProduct = require('../../engine/ComputeEngine/Manufacturing/src/SemiProduct');
var Product = require('../../engine/ComputeEngine/Manufacturing/src/Product');
var SubContracter = require('../../engine/ComputeEngine/Environnement/src/SubContracter');
var ENUMS = require('../../engine/ComputeEngine/ENUMS');
var Utils = require('../../utils/Utils');
var subContracterDefaultParams, alphaASubContracterParams, alphaBSubContracterParams, alphaCSubContracterParams;
subContracterDefaultParams = {
    name: "Sous-Traitant",
    availableFutures: {
        "IMMEDIATE": { term: 0 /* IMMEDIATE */ },
    },
    availableQualities: {
        "MQ": { index: 100, premium: 0 },
        "HQ": { index: 200, premium: 0.5 }
    },
    payments: {
        "CASH": { credit: 0 /* CASH */, part: 0.5 },
        "THREE_MONTH": { credit: 90 /* THREE_MONTH */, part: 0.5 }
    },
    deliveryDelai: 2 /* AFTERNEXT_PERIOD */,
    discountRate: 0,
    interestRate: 0,
    rebateRate: 0,
    canUnplannedMaterialPurchases: false,
    unplannedPurchasesPremium: 0
};
alphaASubContracterParams = Utils.ObjectApply({}, subContracterDefaultParams, { manufacturingUnitCost: 60 });
alphaBSubContracterParams = Utils.ObjectApply({}, subContracterDefaultParams, { manufacturingUnitCost: 75 });
alphaCSubContracterParams = Utils.ObjectApply({}, subContracterDefaultParams, { manufacturingUnitCost: 120 });
var cashPayments = {
    "CASH": {
        credit: 0 /* CASH */,
        part: 1
    }
};
var products = {
    alphaA: new SemiProduct({
        id: "p1_alpha",
        label: "encours alpha Produit A",
        spaceNeeded: 0.25,
        manufacturingCfg: {
            minManufacturingUnitTime: 60
        },
        lostProbability: 0,
        rejectedProbability: 0,
        rawMaterialConsoCfg: {
            consoUnit: 1
        },
        costs: {
            inspectionUnit: 0,
            planningUnit: 0
        }
    }),
    betaA: new SemiProduct({
        id: "p1_beta",
        label: "encours beta Produit A",
        spaceNeeded: 0,
        manufacturingCfg: {
            minManufacturingUnitTime: 100
        },
        rawMaterialConsoCfg: {
            consoUnit: 0
        },
        lostProbability: 0,
        rejectedProbability: 0,
        costs: {
            inspectionUnit: 0,
            planningUnit: 0
        }
    }),
    alphaB: new SemiProduct({
        id: "p2_alpha",
        label: "encours alpha Produit B",
        spaceNeeded: 0.5,
        manufacturingCfg: {
            minManufacturingUnitTime: 75
        },
        rawMaterialConsoCfg: {
            consoUnit: 2
        },
        lostProbability: 0,
        rejectedProbability: 0,
        costs: {
            inspectionUnit: 0,
            planningUnit: 0
        }
    }),
    betaB: new SemiProduct({
        id: "p2_beta",
        label: "encours beta Produit B",
        spaceNeeded: 0,
        manufacturingCfg: {
            minManufacturingUnitTime: 150
        },
        rawMaterialConsoCfg: {
            consoUnit: 0
        },
        lostProbability: 0,
        rejectedProbability: 0,
        costs: {
            inspectionUnit: 0,
            planningUnit: 0
        }
    }),
    alphaC: new SemiProduct({
        id: "p3_alpha",
        label: "encours alpha Produit C",
        spaceNeeded: 1,
        manufacturingCfg: {
            minManufacturingUnitTime: 120
        },
        rawMaterialConsoCfg: {
            consoUnit: 3
        },
        lostProbability: 0,
        rejectedProbability: 0,
        costs: {
            inspectionUnit: 0,
            planningUnit: 0
        }
    }),
    betaC: new SemiProduct({
        id: "p3_beta",
        label: "encours alpha Produit A",
        spaceNeeded: 0,
        manufacturingCfg: {
            minManufacturingUnitTime: 300
        },
        rawMaterialConsoCfg: {
            consoUnit: 0
        },
        lostProbability: 0,
        rejectedProbability: 0,
        costs: {
            inspectionUnit: 0,
            planningUnit: 0
        }
    }),
    productA: new Product({
        id: "p1",
        code: 0,
        label: "Produit A",
        spaceNeeded: 0,
        CO2Footprint: {
            kwh: 0,
            weight: 0
        },
        rejectedProbability: 0.035819793,
        lostProbability: 0,
        containerCapacityUnitsNb: 500,
        costs: {
            scrapValue: 40,
            guaranteeServicingCharge: 60,
            inspectionUnit: 1,
            planningUnit: 1
        },
        payments: {
            guaranteeServicing: cashPayments,
            qualityControl: cashPayments,
            development: cashPayments
        }
    }),
    productB: new Product({
        id: "p2",
        code: 1,
        label: "Produit B",
        spaceNeeded: 0,
        CO2Footprint: {
            kwh: 0,
            weight: 0
        },
        rejectedProbability: 0.037110669,
        lostProbability: 0,
        containerCapacityUnitsNb: 250,
        costs: {
            scrapValue: 80,
            guaranteeServicingCharge: 150,
            inspectionUnit: 1,
            planningUnit: 1
        },
        payments: {
            guaranteeServicing: cashPayments,
            qualityControl: cashPayments,
            development: cashPayments
        }
    }),
    productC: new Product({
        id: "p3",
        code: 2,
        label: "Produit C",
        spaceNeeded: 0,
        CO2Footprint: {
            kwh: 0,
            weight: 0
        },
        rejectedProbability: 0.038209607,
        lostProbability: 0,
        containerCapacityUnitsNb: 125,
        costs: {
            scrapValue: 120,
            guaranteeServicingCharge: 250,
            inspectionUnit: 1,
            planningUnit: 1
        },
        payments: {
            guaranteeServicing: cashPayments,
            qualityControl: cashPayments,
            development: cashPayments
        }
    }),
    alphaASubContracter: new SubContracter(alphaASubContracterParams),
    alphaBSubContracter: new SubContracter(alphaBSubContracterParams),
    alphaCSubContracter: new SubContracter(alphaCSubContracterParams)
};
module.exports = products;
//# sourceMappingURL=Products.js.map