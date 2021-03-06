var SalesForce = require('../../engine/ComputeEngine/Marketing/src/SalesForce');
var ENUMS = require('../../engine/ComputeEngine/ENUMS');
var salesForceDefaultCostsParams = {
    minSupportPerAgent: 5000,
    dismissal: 5000,
    recruitment: 7500,
    training: 0
};
var defaultPayments = {
    "CASH": {
        credit: 0 /* CASH */,
        part: 1
    }
};
var agents = {
    euroAgents: new SalesForce({
        id: "m1_agents",
        category: "Agents Commerciaux",
        isECommerceDistributor: false,
        isUnskilled: false,
        recruitedAvailability: 1 /* THREE_MONTH */,
        dismissedUnvailability: 1 /* THREE_MONTH */,
        maxTrainedNb: 0,
        isCommissionsBasedOnOrders: true,
        costs: salesForceDefaultCostsParams,
        payments: defaultPayments
    }),
    naftaDistributors: new SalesForce({
        id: "m2_agents",
        category: "Distributeurs Nafta",
        isECommerceDistributor: false,
        isUnskilled: false,
        recruitedAvailability: 1 /* THREE_MONTH */,
        dismissedUnvailability: 1 /* THREE_MONTH */,
        maxTrainedNb: 0,
        isCommissionsBasedOnOrders: false,
        costs: salesForceDefaultCostsParams,
        payments: defaultPayments
    }),
    internetDistributor: new SalesForce({
        id: "m3_agents",
        category: "Distributeur Internet",
        isECommerceDistributor: true,
        isUnskilled: false,
        recruitedAvailability: 1 /* THREE_MONTH */,
        dismissedUnvailability: 1 /* THREE_MONTH */,
        maxTrainedNb: 0,
        isCommissionsBasedOnOrders: false,
        costs: salesForceDefaultCostsParams,
        payments: defaultPayments
    })
};
module.exports = agents;
//# sourceMappingURL=SalesForce.js.map