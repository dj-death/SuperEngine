var Land = require('../../engine/ComputeEngine/Manufacturing/src/Land');
var Factory = require('../../engine/ComputeEngine/Manufacturing/src/Factory');
var ENUMS = require('../../engine/ComputeEngine/ENUMS');
var cashPayments = {
    "CASH": {
        credit: 0 /* CASH */,
        part: 1
    }
};
var spaces = {
    land: new Land({
        id: "land",
        label: "Terrain",
        maxSpaceUse: 0.8,
        depreciationRate: 0,
        isValuationAtMarket: false,
        costs: {
            fixedExpensesPerSquare: 0
        },
        payments: {
            acquisition: cashPayments,
            miscellaneous: cashPayments
        },
        CO2Footprint: {
            kwh: 0,
            weight: 0,
            offsettingPerTonneRate: 0
        }
    }),
    factory: new Factory({
        id: "factory",
        label: "Usine",
        maxSpaceUse: 0.75,
        depreciationRate: 0,
        isValuationAtMarket: true,
        costs: {
            fixedExpensesPerSquare: 20
        },
        payments: {
            acquisition: cashPayments,
            miscellaneous: cashPayments
        },
        CO2Footprint: {
            kwh: 50,
            weight: 9.5,
            offsettingPerTonneRate: 40
        }
    })
};
module.exports = spaces;
//# sourceMappingURL=Spaces.js.map