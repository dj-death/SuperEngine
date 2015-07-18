var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

// default -1 means repeat

var manufacturingTime = new Schema({
    time: { type: Number, default: -1, max: 999 },
});

var product = new Schema({
    manufacturingTime: [manufacturingTime],

    improvementsTakeup: { type: Boolean, default: false },
    developmentBudget: { type: Number, default: -1, min: 0, max: 99000 },
    premiumMaterialPropertion: { type: Number, default: -1, min: 0, max: 1},
    componentsOrdered: { type: Number, default: -1, min: 0, max: 9999 }
});



var machine = new Schema({
    maintenanceHours: { type: Number, default: -1, min: 0, max: 99 },
    boughtNb: { type: Number, default: 0, min: 0, max: 99 },
    soldNb: { type: Number, default: 0, min: 0, max: 99 }
});



var futures = new Schema({
    term: Number,
    quantity: { type: Number, default: 0, min: 0, max: 99000 }

});

var material = new Schema({
    purchases: [futures]
});



var factory = new Schema({
    extension: { type: Number, default: 0, min: 0, max: 9999 }
});

var worker = new Schema({
    hourlyWageRate: { type: Number, default: -1, min: 900, max: 9999 },
    hire: { type: Number, default: 0, min: -9, max: 99 },
    trainedNb: { type: Number, default: 0, min: 0, max: 9 }
});

var subMarket = new Schema({
    advertisingBudget: { type: Number, default: -1, min: 0, max: 99000 },
    price: { type: Number, default: -1, min: 0, max: 999 },
    deliveredQ: { type: Number, default: -1, min: -999, max: 9999 },
});

var agent = new Schema({
    appointedNb: { type: Number, default: -1, min: 0, max: 99 },
    commissionRate: { type: Number, default: -1, min: 0, max: 0.99 },
    support: { type: Number, default: -1, min: 5000, max: 99000 }
});

var market = new Schema({
    corporateComBudget: { type: Number, default: -1, min: 0, max: 99000 },
    agents: [agent],
    subMarkets: [subMarket]
});

var schema = {
    seminarId: String,
    groupId: String,
    period: Number,
    
    d_CID: Number,
    d_CompanyName: String,

    markets: [market],

    products: [product],
    materials: [material],
    machines: [machine],

    shiftLevel: { type: Number, default: -1, min: 1, max: 3 },

    factories: [factory],

    websitePortsNb: { type: Number, default: -1, min: 0, max: 99 },
    websiteDevBudget: { type: Number, default: -1, min: 0, max: 999000 },


    insurancePlan: { type: Number, default: -1, min: 0, max: 4 },
    sharesVariation: { type: Number, default: 0, min: -999000, max: 999000 },
    termLoans: { type: Number, default: 0, min: 0, max: 9999000 },
    termDeposit: { type: Number, default: 0, min: -999000, max: 9999000 },
    dividend: { type: Number, default: 0, min: 0, max: 0.99 },
    
    orderMarketSharesInfo: { type: Boolean, default: false },
    orderCorporateActivityInfo: { type: Boolean, default: false },

    staffTrainingDays: { type: Number, default: -1, min: 0, max: 90 },
    managementBudget: { type: Number, default: -1, min: 30000, max: 999000 },

    workers: [worker]

};


export = schema;