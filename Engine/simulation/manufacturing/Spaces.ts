import Land = require('../../engine/ComputeEngine/Manufacturing/src/Land'); 
import Factory = require('../../engine/ComputeEngine/Manufacturing/src/Factory');

import ENUMS = require('../../engine/ComputeEngine/ENUMS');

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

        CO2Footprint: {
            kwh: 50,
            weight: 9.5,
            offsettingPerTonneRate: 40
        }
    })
};

export = spaces;