import Insurance = require('../../engine/ComputeEngine/Finance/src/Insurance');

var insurance = new Insurance({
    id: "insurance",

    plans: {
        "0": {
            primaryRiskRate: 100 / 100,
            premiumRate: 0
        },

        "1": {
            primaryRiskRate: 0.1 / 100,
            premiumRate: 0.6 / 100
        },

        "2": {
            primaryRiskRate: 0.2 / 100,
            premiumRate: 0.35 / 100
        },

        "3": {
            primaryRiskRate: 0.3 / 100,
            premiumRate: 0.20 / 100
        },
    
        "4": {
            primaryRiskRate: 0.4 / 100,
            premiumRate: 0.10 / 100
        }
    },

    forceMajeureSequence: [0, 600, 51900, 0, 0],

    optimalManagementBudget: 200000,
    normalManagementBudget: 115000
});

export = insurance;