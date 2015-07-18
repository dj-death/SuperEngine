var ENUMS = require('../../../ComputeEngine/ENUMS');
var Market = (function () {
    function Market() {
    }
    Market.prototype.simulateOrders = function (companiesDec) {
        var i = 0, companiesNb = companiesDec.length;
        var ordersMatrix = [];
        for (; i < companiesNb; i++) {
            var market1 = [1047, 455, 270];
            var market2 = [1169, 532, 296];
            var market3 = [1287, 756, 405];
            ordersMatrix.push([market1, market2, market3]);
        }
        return ordersMatrix;
    };
    Market.prototype.simulateEnv = function () {
        var materialMarketPrices = [
            { term: 0 /* IMMEDIATE */, basePrice: 50.754 },
            { term: 1 /* THREE_MONTH */, basePrice: 32.615 },
            { term: 2 /* SIX_MONTH */, basePrice: 29.748 }
        ];
        var componentsPrices = {
            p1: {
                marketPrice: [
                    { term: 1 /* THREE_MONTH */, basePrice: 123 },
                ],
                qualityPremium: [
                    { index: 2 /* HQ */, premium: 145 / 123 }
                ]
            },
            p2: {
                marketPrice: [
                    { term: 1 /* THREE_MONTH */, basePrice: 187 },
                ],
                qualityPremium: [
                    { index: 2 /* HQ */, premium: 232 / 187 }
                ]
            },
            p3: {
                marketPrice: [
                    { term: 1 /* THREE_MONTH */, basePrice: 290 },
                ],
                qualityPremium: [
                    { index: 2 /* HQ */, premium: 358 / 290 }
                ]
            }
        };
        var buildingCost = 1000;
        return {
            componentsPrices: componentsPrices,
            materialMarketPrices: materialMarketPrices,
            buildingCost: buildingCost
        };
    };
    return Market;
})();
var market = new Market();
module.exports = market;
//# sourceMappingURL=Market.js.map