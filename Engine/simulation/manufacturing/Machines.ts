import Machine = require('../../engine/ComputeEngine/Manufacturing/src/Machine');
import ENUMS = require('../../engine/ComputeEngine/ENUMS');


var machines = {
    robot: new Machine({
        id: "machine",
        label: "Robot",

        spaceNeeded: 25,

        CO2Footprint: {
            kwh: 6,
            weight: 3.12,
            offsettingPerTonneRate: 40
        },

        costs: {
            decommissioning: 60000,
            maintenanceHourlyCost: 85,
            overContractedMaintenanceHourlyCost: 175,
            overheads: 3500,
            runningHour: 8,
            supervisionPerShift: 12500
        },

        acquisitionPrice: 300000,
        disposalPrice: 150000,


        deliveryTime: ENUMS.DELIVERY.NEXT_PERIOD,
        decommissioningTime: ENUMS.DELIVERY.IMMEDIATE,

        depreciationRate: 2.5 / 100,
        usefulLife: 20,
        residualValue: 0,

        machineCapacityByShift: [576, 1068, 1602],
        machineOperatorsNeededNb: [4, 8, 12],

        breakdownProba: 0.35 // %
    
    }),

    machinesState: [
        {
            active: true,
            age: 19,
            runningTotalHoursNb: 10000,
            efficiency: 0.931
            
        },
        {
            active: true,
            age: 19,
            runningTotalHoursNb: 10000,
            efficiency: 0.931
            
        },
        {
            active: true,
            age: 13,
            runningTotalHoursNb: 10000,
            efficiency: 0.931
            
        },
        {
            active: true,
            age: 13,
            runningTotalHoursNb: 10000,
            efficiency: 0.931
            
        },
        {
            active: true,
            age: 13,
            runningTotalHoursNb: 10000,
            efficiency: 0.931
            
        },
        {
            active: true,
            age: 13,
            runningTotalHoursNb: 10000,
            efficiency: 0.931
            
        },
        {
            active: true,
            age: 12,
            runningTotalHoursNb: 10000,
            efficiency: 0.931
            
        },
        {
            active: true,
            age: 12,
            runningTotalHoursNb: 10000,
            efficiency: 0.931
            
        },
        {
            active: true,
            age: 11,
            runningTotalHoursNb: 10000,
            efficiency: 0.931
            
        },
        {
            active: true,
            age: 7,
            runningTotalHoursNb: 10000,
            efficiency: 0.931
            
        },
        {
            active: true,
            age: 6,
            runningTotalHoursNb: 10000,
            efficiency: 0.931
            
        }
    ]
};

export = machines;