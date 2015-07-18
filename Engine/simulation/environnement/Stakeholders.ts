import BuildingContractor = require('../../engine/ComputeEngine/Environnement/src/BuildingContractor');
import ENUMS = require('../../Engine/ComputeEngine/ENUMS');

var stakeholders = {

    buildingContractor: new BuildingContractor({
        checkClientCreditWorthiness: true,
        minWorksDuration: ENUMS.FUTURES.THREE_MONTH,

        areCostsStable: false
    })

    
};

export = stakeholders;

