var CentralBank = require('../../engine/ComputeEngine/Environnement/src/CentralBank');
var centralBanks = {
    FED: new CentralBank({
        id: "fed",
        isMoneyMarketStable: false
    }),
    ECB: new CentralBank({
        id: "ecb",
        isMoneyMarketStable: false
    })
};
module.exports = centralBanks;
//# sourceMappingURL=CentralBanks.js.map