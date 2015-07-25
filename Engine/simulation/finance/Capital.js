var Capital = require('../../engine/ComputeEngine/Finance/src/Capital');
var ENUMS = require('../../engine/ComputeEngine/ENUMS');
var capital = new Capital({
    shareNominalValue: 1,
    restrictions: {
        capitalAnnualVariationLimitRate: 0.1,
        minSharePriceToIssueShares: 1,
        minSharePriceToRepurchaseShares: 1
    },
    payments: {
        "CASH": {
            credit: 0 /* CASH */,
            part: 1
        }
    }
});
module.exports = capital;
//# sourceMappingURL=Capital.js.map