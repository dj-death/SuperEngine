var MaterialMarket = require('../../engine/ComputeEngine/Environnement/src/MaterialMarket');
var market = new MaterialMarket({
    id: "material",
    standardLotQuantity: 1000,
    arePricesStable: false
});
var markets = [market];
module.exports = markets;
//# sourceMappingURL=MaterialsMarkets.js.map