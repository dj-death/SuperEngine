import SalesOffice = require('../../engine/ComputeEngine/Marketing/src/SalesOffice'); 

import ENUMS = require('../../engine/ComputeEngine/ENUMS');


var cashPayments: ENUMS.PaymentArray = {
    "CASH": {
        credit: ENUMS.CREDIT.CASH,
        part: 1
    }
};

var salesOffice = new SalesOffice({
    costs: {
        administrationCostRate: 0.01
    },


    payments: cashPayments,
    receipts: cashPayments
});

export = salesOffice;