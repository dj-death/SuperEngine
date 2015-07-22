import Intelligence = require('../../engine/ComputeEngine/Marketing/src/Intelligence');

import ENUMS = require('../../engine/ComputeEngine/ENUMS');


var BI = new Intelligence({
    costs: {
        competitorsInfoCost: 7500,
        marketSharesInfoCost: 5000
    },

    payments: {
        "THREE_MONTH": {
            credit: ENUMS.CREDIT.THREE_MONTH,
            part: 1
        }
    }
});

export = BI;
