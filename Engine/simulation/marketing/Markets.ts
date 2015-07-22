import Market = require('../../engine/ComputeEngine/Marketing/src/Market');

import ENUMS = require('../../engine/ComputeEngine/ENUMS');

import game = require('../Game');

var periodDaysNb = game.daysNbByPeriod;

var advertisingPayments: ENUMS.PaymentArray = {
    "THREE_MONTH": {
        credit: ENUMS.CREDIT.THREE_MONTH,
        part: 1
    }
};

var defaultPayments = {
    advertising: advertisingPayments  
};

var markets = {
    euroMarket: new Market({
        id: "m1",
        name: 'Euro Zone',

        /*distribution: {
            shipmentDistance: 717,
            containerDailyHireCost: 650,
            containerShipmentCost: 0,
            distanceLimit: 400,
            productStorageCost: 3.50
        },*/

        acceptBacklog: true,
        dissatisfiedOrdersCancelledPercent: 0.5,

        costs: {
            creditCardRatePerUnitSold: 0,
            creditControlUnitCost: 1
        },

        payments: defaultPayments,

        defaultCustomerCredit: ENUMS.CREDIT.TWO_MONTH,
        periodDaysNb: periodDaysNb
    }),

    naftaMarket: new Market({
        id: "m2",

        name: 'NAFTA Market',

        /*distribution: {
            shipmentDistance: 250,
            containerDailyHireCost: 650,
            containerShipmentCost: 8000,
            distanceLimit: 400,
            productStorageCost: 4
        },*/

        acceptBacklog: true,
        dissatisfiedOrdersCancelledPercent: 0.5,

        costs: {
            creditCardRatePerUnitSold: 0,
            creditControlUnitCost: 1
        },

        payments: defaultPayments,

        defaultCustomerCredit: ENUMS.CREDIT.THREE_MONTH,
        periodDaysNb: periodDaysNb
    }),

    internetMarket: new Market({
        id: "m3",
        name: 'Internet',

        /*distribution: {
            shipmentDistance: 150,
            containerDailyHireCost: 650,
            containerShipmentCost: 0,
            distanceLimit: 400,
            productStorageCost: 3.50
        },*/

        acceptBacklog: false,
        dissatisfiedOrdersCancelledPercent: 1,

        costs: {
            creditCardRatePerUnitSold: 1,
            creditControlUnitCost: 0
        },

        payments: defaultPayments,

        defaultCustomerCredit: ENUMS.CREDIT.CASH,
        periodDaysNb: periodDaysNb
    })

};


export = markets;