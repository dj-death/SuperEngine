var Intelligence = require('../../engine/ComputeEngine/Marketing/src/Intelligence');
var ENUMS = require('../../engine/ComputeEngine/ENUMS');
var BI = new Intelligence({
    costs: {
        competitorsInfoCost: 7500,
        marketSharesInfoCost: 5000
    },
    payments: {
        "THREE_MONTH": {
            credit: 90 /* THREE_MONTH */,
            part: 1
        }
    }
});
module.exports = BI;
//# sourceMappingURL=Intelligence.js.map