var Insurance = require('../../engine/ComputeEngine/Finance/src/Insurance');
var ENUMS = require('../../engine/ComputeEngine/ENUMS');
var defaultPayments = {
    "CASH": {
        credit: 0 /* CASH */,
        part: 1
    }
};
var insurances = {
    alphaInsurance: new Insurance({
        id: "insurance1",
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
        normalManagementBudget: 115000,
        payments: defaultPayments
    })
};
module.exports = insurances;
//# sourceMappingURL=Insurances.js.map