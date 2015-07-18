import CentralBank = require('../../engine/ComputeEngine/Environnement/src/CentralBank');

var centralBanks = {
    FED: new CentralBank({
        isMoneyMarketStable: false
    }),

    ECB: new CentralBank({
        isMoneyMarketStable: false
    })
};

export = centralBanks;
