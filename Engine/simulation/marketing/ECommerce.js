var ECommerce = require('../../engine/ComputeEngine/Marketing/src/ECommerce');
var ENUMS = require('../../engine/ComputeEngine/ENUMS');
var eCommerce = new ECommerce({
    id: "internet",
    distributorsNb: 1,
    capacityChangeEffectiveness: 1 /* THREE_MONTH */,
    costs: {
        initialJoiningFees: 7500,
        closingDownFees: 5000,
        serviceCostRate: 0.03,
        websiteOnePortOperating: 1000
    },
    payments: {
        ISP: {
            "CASH": {
                credit: 0 /* CASH */,
                part: 1
            }
        },
        websiteDev: {
            "THREE_MONTH": {
                credit: 90 /* THREE_MONTH */,
                part: 1
            }
        }
    }
});
module.exports = eCommerce;
//# sourceMappingURL=ECommerce.js.map