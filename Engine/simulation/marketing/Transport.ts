import Transport = require('../../engine/ComputeEngine/Marketing/src/Transport');
import ENUMS = require('../../engine/ComputeEngine/ENUMS');


var defaultPayments: ENUMS.PaymentArray = {
    "THREE_MONTH": {
        credit: ENUMS.CREDIT.THREE_MONTH,
        part: 1
    }
};

var transports = {
    europeTrs: new Transport({
        id: "m1_transport",

        shipmentDistance: 717,
        distanceLimit: 400,

        mixedLoads: true,

        costs: {
            
            containerDailyHireCost: 650,
            containerShipmentCost: 0,
            
            productStorageCost: 3.50
        },

        payments: defaultPayments
    }),

    naftaTrs: new Transport({
        id: "m2_transport",

        shipmentDistance: 250,
        distanceLimit: 400,

        mixedLoads: true,

        costs: {
            containerDailyHireCost: 650,
            containerShipmentCost: 8000,
            productStorageCost: 4
        },

        payments: defaultPayments
    }),

    internetTrs: new Transport({
        id: "m3_transport",

        shipmentDistance: 150,
        distanceLimit: 400,

        mixedLoads: true,

        costs: {
            containerDailyHireCost: 650,
            containerShipmentCost: 0,
            
            productStorageCost: 3.50
        },

        payments: defaultPayments
    })

};


export = transports;