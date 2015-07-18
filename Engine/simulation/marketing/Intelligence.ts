import Intelligence = require('../../engine/ComputeEngine/Marketing/src/Intelligence');

var BI = new Intelligence({
    costs: {
        competitorsInfoCost: 7500,
        marketSharesInfoCost: 5000
    }
});


export = BI;
