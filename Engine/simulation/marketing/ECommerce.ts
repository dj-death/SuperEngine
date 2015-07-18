import ECommerce = require('../../engine/ComputeEngine/Marketing/src/ECommerce');

import ENUMS = require('../../engine/ComputeEngine/ENUMS');

var eCommerce = new ECommerce({
    id: "internet",

    distributorsNb: 1,
    capacityChangeEffectiveness: ENUMS.FUTURES.THREE_MONTH,

    costs: {
        initialJoiningFees: 7500,
        closingDownFees: 5000,
        serviceCostRate: 0.03,
        websiteOnePortOperating: 1000
    }
});

export = eCommerce;