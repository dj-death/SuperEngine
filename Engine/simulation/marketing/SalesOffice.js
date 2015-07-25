var SalesOffice = require('../../engine/ComputeEngine/Marketing/src/SalesOffice');
var ENUMS = require('../../engine/ComputeEngine/ENUMS');
var cashPayments = {
    "CASH": {
        credit: 0 /* CASH */,
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
module.exports = salesOffice;
//# sourceMappingURL=SalesOffice.js.map