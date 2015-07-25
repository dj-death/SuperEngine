var Worker = require('../../engine/ComputeEngine/Manufacturing/src/Worker');
var ENUMS = require('../../engine/ComputeEngine/ENUMS');
var game = require('../Game');
var weeksNbByPeriod = game.weeksNbByPeriod;
var cashPayments = {
    "CASH": {
        credit: 0 /* CASH */,
        part: 1
    }
};
var single, double, treble, noShift;
noShift = {
    level: 0 /* SINGLE */,
    workersNeededNb: 1,
    maxHoursWeekDays: 420,
    maxHoursOvertimeSaturday: 84,
    maxHoursOvertimeSunday: 72,
    maxHoursPerPeriod: 420 + 84 + 72,
    shiftPremium: 0,
    weeksWorkedByPeriod: weeksNbByPeriod
};
single = {
    level: 0 /* SINGLE */,
    workersNeededNb: 4,
    maxHoursWeekDays: 420,
    maxHoursOvertimeSaturday: 84,
    maxHoursOvertimeSunday: 72,
    maxHoursPerPeriod: 420 + 84 + 72,
    shiftPremium: 0,
    weeksWorkedByPeriod: weeksNbByPeriod
};
double = {
    level: 1 /* DOUBLE */,
    workersNeededNb: 8,
    maxHoursWeekDays: 420,
    maxHoursOvertimeSaturday: 42,
    maxHoursOvertimeSunday: 72,
    maxHoursPerPeriod: 420 + 42 + 72,
    shiftPremium: 1 / 3,
    weeksWorkedByPeriod: weeksNbByPeriod
};
treble = {
    level: 2 /* TREBLE */,
    workersNeededNb: 12,
    maxHoursWeekDays: 420,
    maxHoursOvertimeSaturday: 42,
    maxHoursOvertimeSunday: 72,
    maxHoursPerPeriod: 420 + 42 + 72,
    shiftPremium: 2 / 3,
    weeksWorkedByPeriod: weeksNbByPeriod
};
var workers = {
    machinist: new Worker({
        id: "machinists",
        isUnskilled: true,
        surplusMaxDismissedPercent: 0.5,
        recruitedAvailability: 0 /* IMMEDIATE */,
        dismissedUnvailability: 0 /* IMMEDIATE */,
        trainedAvailability: 1 /* THREE_MONTH */,
        maxTrainedNb: 0,
        category: "machinist",
        label: "Opérateur de Machine",
        spaceNeeded: 0,
        CO2Footprint: {
            kwh: 0,
            weight: 0,
            offsettingPerTonneRate: 0
        },
        strikeHoursPerWeek: 0,
        strikeHoursPerWeekDays: 0,
        strikeHoursPerSaturday: 0,
        strikeHoursPerSunday: 0,
        absenteeismProba: 0,
        absenteeismNormalHoursNb: 0,
        tradeUnionSensibility: 0,
        minHourlyWageRate: 9 * 0.65,
        minHoursWork: 0,
        minPaidHours: 360,
        isPaidUnderMaintenance: false,
        isPaidUnderRepairs: true,
        isPaidUnderSickness: false,
        canBringExternalWorkers: false,
        externalWorkersPremium: 0,
        skilledRateOfPay: 0.65,
        overtimeSatPremium: 0.5,
        overtimeSunPremium: 1,
        costs: {
            recruitment: 1000,
            dismissal: 2000,
            training: 0
        },
        payments: cashPayments,
        defaultRecruit: true,
        availablesShifts: [single, double, treble]
    }),
    assemblyWorker: new Worker({
        id: "assemblyWorkers",
        surplusMaxDismissedPercent: 1,
        isUnskilled: false,
        category: "assemblyWorker",
        label: "Assembleur",
        recruitedAvailability: 1 /* THREE_MONTH */,
        dismissedUnvailability: 1 /* THREE_MONTH */,
        trainedAvailability: 1 /* THREE_MONTH */,
        maxTrainedNb: 9,
        spaceNeeded: 10,
        CO2Footprint: {
            kwh: 1,
            weight: 0.52,
            offsettingPerTonneRate: 40
        },
        strikeHoursPerWeek: 48,
        strikeHoursPerWeekDays: 35,
        strikeHoursPerSaturday: 7,
        strikeHoursPerSunday: 6,
        tradeUnionSensibility: 0.01,
        absenteeismProba: 0.0005,
        absenteeismNormalHoursNb: 7,
        minHourlyWageRate: 9,
        minHoursWork: 0,
        minPaidHours: 0,
        isPaidUnderMaintenance: false,
        isPaidUnderRepairs: false,
        isPaidUnderSickness: false,
        canBringExternalWorkers: true,
        externalWorkersPremium: 1,
        skilledRateOfPay: 1,
        overtimeSatPremium: 0.5,
        overtimeSunPremium: 1,
        costs: {
            recruitment: 2000,
            dismissal: 5000,
            training: 8500
        },
        payments: cashPayments,
        defaultRecruit: false,
        availablesShifts: [noShift]
    })
};
module.exports = workers;
//# sourceMappingURL=Workers.js.map