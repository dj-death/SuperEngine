var BuildingContractor = require('../../engine/ComputeEngine/Environnement/src/BuildingContractor');
var ENUMS = require('../../Engine/ComputeEngine/ENUMS');
var stakeholders = {
    buildingContractor: new BuildingContractor({
        checkClientCreditWorthiness: true,
        minWorksDuration: 1 /* THREE_MONTH */,
        areCostsStable: false
    })
};
module.exports = stakeholders;
//# sourceMappingURL=Stakeholders.js.map