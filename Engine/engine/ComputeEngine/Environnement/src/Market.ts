import ENUMS = require('../../../ComputeEngine/ENUMS');

import ObjectsManager = require('../../ObjectsManager');


class Market {
    simulateOrders(companiesDec) {
        var i = 0,
            companiesNb = companiesDec.length;

        var ordersMatrix = [];

        for (; i < companiesNb; i++) {
            var market1 = [1047, 455, 270];
            var market2 = [1169, 532, 296];
            var market3 = [1287, 756, 405];

            ordersMatrix.push([market1, market2, market3]);
        }

        return ordersMatrix;
    }

    simulateEnv() {
        var materialMarketPrices = [
            { term: ENUMS.FUTURES.IMMEDIATE, basePrice: 50.754 },
            { term: ENUMS.FUTURES.THREE_MONTH, basePrice: 32.615 },
            { term: ENUMS.FUTURES.SIX_MONTH, basePrice: 29.748 }
        ];

        var componentsPrices = {
            p1: {
                marketPrice: [
                    { term: ENUMS.FUTURES.THREE_MONTH, basePrice: 123 },
                ],

                qualityPremium: [
                    { index: ENUMS.QUALITY.HQ, premium: 145 / 123 }
                ]
            },

            p2: {
                marketPrice: [
                    { term: ENUMS.FUTURES.THREE_MONTH, basePrice: 187 },
                ],

                qualityPremium: [
                    { index: ENUMS.QUALITY.HQ, premium: 232 / 187 }
                ]
            },

            p3: {
                marketPrice: [
                    { term: ENUMS.FUTURES.THREE_MONTH, basePrice: 290 },
                ],

                qualityPremium: [
                    { index: ENUMS.QUALITY.HQ, premium: 358 / 290 }
                ]
            }
        };

        var buildingCost = 1000;


        return {
            componentsPrices: componentsPrices,
            materialMarketPrices: materialMarketPrices,
            buildingCost: buildingCost
        };

    }
}

var market = new Market();

export = market;