import Capital = require('../../engine/ComputeEngine/Finance/src/Capital');

import ENUMS = require('../../engine/ComputeEngine/ENUMS');


var capital = new Capital({
    shareNominalValue: 1,

    restrictions: {
        capitalAnnualVariationLimitRate: 0.1,

        minSharePriceToIssueShares: 1,
        minSharePriceToRepurchaseShares: 1
    },

    payments: {
        "CASH": {
            credit: ENUMS.CREDIT.CASH,
            part: 1
        }
    }
});


export = capital;