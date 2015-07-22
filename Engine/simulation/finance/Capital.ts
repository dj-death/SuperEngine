import Capital = require('../../engine/ComputeEngine/Finance/src/Capital');

var capital = new Capital({
    shareNominalValue: 1,

    restrictions: {
        capitalAnnualVariationLimitRate: 0.1,

        minSharePriceToIssueShares: 1,
        minSharePriceToRepurchaseShares: 1
    }
});


export = capital;