var Machine = require('../../engine/ComputeEngine/Manufacturing/src/Machine');
var ENUMS = require('../../engine/ComputeEngine/ENUMS');
var cashPayments = {
    "CASH": {
        credit: 0 /* CASH */,
        part: 1
    }
};
var maintenancePayments = {
    "THREE_MONTH": {
        credit: 90 /* THREE_MONTH */,
        part: 1
    }
};
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
        payments: {
            acquisitions: cashPayments,
            disposals: cashPayments,
            running: cashPayments,
            decommissioning: cashPayments,
            maintenance: maintenancePayments
        },
        acquisitionPrice: 300000,
        disposalPrice: 150000,
        deliveryTime: 1 /* NEXT_PERIOD */,
        decommissioningTime: 0 /* IMMEDIATE */,
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
module.exports = machines;
//# sourceMappingURL=Machines.js.map