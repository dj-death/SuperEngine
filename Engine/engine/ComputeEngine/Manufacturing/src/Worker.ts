import Employee = require('../../Personnel/src/Employee');
import LabourPool = require('../../Environnement/src/LabourPool');

import Machine = require('./Machine');

import ENUMS = require('../../ENUMS');
import Utils = require('../../../../utils/Utils');
import console = require('../../../../utils/logger');


import Insurance = require('../../Finance/src/Insurance');


import ObjectsManager = require('../../ObjectsManager');

import CashFlow = require('../../Finance/src/CashFlow');


interface WorkerParams extends Employee.EmployeeParams {
    id: string;
    label: string;
    spaceNeeded: number;
    CO2Footprint: ENUMS.CO2Footprint;

    minHoursWork: number;
    overtimeSatPremium: number;
    overtimeSunPremium: number;
    minHourlyWageRate: number;
    minPaidHours: number;

    externalWorkersPremium: number;

    isPaidUnderRepairs: boolean;
    isPaidUnderMaintenance: boolean;
    isPaidUnderSickness: boolean;

    strikeHoursPerWeek: number;
    strikeHoursPerWeekDays: number;
    strikeHoursPerSaturday: number;
    strikeHoursPerSunday: number;

    absenteeismProba: number;
    absenteeismNormalHoursNb: number;

    tradeUnionSensibility: number;

    availablesShifts: ENUMS.Shift[];

    defaultRecruit: boolean;

    surplusMaxDismissedPercent: number;

    canBringExternalWorkers: boolean;

    payments: ENUMS.PaymentArray;

}

interface WorkerDecisions {
    shiftLevel: ENUMS.SHIFT_LEVEL;

    hourlyWageRate: number;

    dismissedNb: number;
    recruitedNb: number;
    trainedNb: number;
}

class Worker extends Employee.Employee {
    private ready: boolean;
    
    // params
    params: WorkerParams;

    Insurance: Insurance = null;
    
    // decision
    shiftLevel: ENUMS.SHIFT_LEVEL;
    shift: ENUMS.Shift;

    hourlyWageRate: number;

    constructor(params: WorkerParams) {
        super(params);
        
    }

    machine: Machine;

    // helpers

    _calcDisaffectionHoursNb(): number {
        var probability,
            landa,
            value = 0,
            i = 0;

        var activeEmployeesNb = this.employeesNb - this.inactiveEmployeesNb;

        // based on ??,,
        probability = this.params.absenteeismProba;

        landa = probability * (this.shift.maxHoursPerPeriod / this.shift.workersNeededNb) + this.params.absenteeismNormalHoursNb;

        for (; i < activeEmployeesNb; i++) {
            value += Utils.getPoisson(landa);
        }

        return 144; //Math.round(value); // we need an integer value
    }

    _calcSicknessHoursNb(): number {
        return 0;
    }

    _calcLowMotivationHoursNb(): number {
        return 0;
    }

    _calcStrikeNextPeriodWeeksNb(): number {
        var probability: number,
            weeksMax = this.shift.weeksWorkedByPeriod,
            value = 0;
        
        // random value from 0 to max 
        probability = Math.random() * weeksMax;

        value = probability * this.params.tradeUnionSensibility;

        return Math.round(value); // we need an integer value
    }

    init(availablesWorkersNb: number, labourPool: LabourPool, strikeNotifiedWeeksNb: number = 0, machine: Machine = null) {
        this.reset();

        super.init(availablesWorkersNb, labourPool);

        this.strikeNotifiedWeeksNb = strikeNotifiedWeeksNb;
        this.machine = machine;

        if (machine !== null && this.params.defaultRecruit === true) {

            var self = this;

            this.machine.on("Ready", function (machine: Machine) {
                var variation = machine.operatorsNb - self.employeesNb;
                var recruitedNb = variation > 0 ? variation : 0;
                var surplusDismissedNb = variation < 0 ? Math.abs(Math.round(variation * self.params.surplusMaxDismissedPercent)) : 0;
                
                // necessary to call all actions even with param 0
                self.recruit(recruitedNb);
                self.dismiss(surplusDismissedNb);

                self.surplusDismissedNb = surplusDismissedNb;

            }, self);
        }


        ObjectsManager.register(this, "production");
    }

    get timeUnitCost(): number {
        var cost = this.hourlyWageRate * (1 + this.shift.shiftPremium) * this.workersPerPosteNb;

        return cost;
    }

    getReady() {
        this.sicknessHoursNb = this._calcSicknessHoursNb();
        this.disaffectionHoursNb = this._calcDisaffectionHoursNb();
        this.lowMotivationHoursNb = this._calcLowMotivationHoursNb();

        this.strikeNextPeriodWeeksNb = this._calcStrikeNextPeriodWeeksNb();

        this.ready = true;
    }

    reset() {
        this._workedTotaHoursNb = 0;
        this.surplusDismissedNb = 0;

        this.initialised = false;
    }

    get workersPerPosteNb(): number {
        return this.shift.workersNeededNb / this.shiftLevel;
    }

    get postesNb(): number {
        if (this.machine) {
            return this.machine.machinesNb;
        }

        return (this.employeesNb - this.inactiveEmployeesNb) / this.shift.workersNeededNb;
    }

    surplusDismissedNb: number;

    //result
    get inactiveEmployeesNb(): number {
        var result = 0;

        if (this.machine && this.machine.operatorsNb < this.employeesNb) {
            result = this.employeesNb - this.machine.operatorsNb;
        }

        return result;
    }
 
    _workedTotaHoursNb: number;

    get workedTotaHoursNb(): number {
        var total = Math.ceil(this._workedTotaHoursNb);

        // e.g: Unskilled workers are paid when machines are broken down and under repair, 
        // but not for maintenance, which is carried out when the factory is not working.

        if (this.params.isPaidUnderMaintenance && this.machine) {
            total += this.machine.maintenanceHoursNb;
        }

        if (this.params.isPaidUnderRepairs && this.machine) {
            total += this.machine.breakdownHoursNb;
        }

        // if worked hours by external is included
        if (this.params.canBringExternalWorkers) {

            // don't do anything is already included for calcul
            if (this.params.isPaidUnderSickness) {

            }

            if (!this.params.isPaidUnderSickness) {
                total -= this.sicknessHoursNb;
            }
        }

        return total;
    }

    workerProductivityAvg: number;

    get absenteeismHoursNb(): number {
        return this.sicknessHoursNb + this.disaffectionHoursNb + this.lowMotivationHoursNb;
    }

    sicknessHoursNb: number;
    //disaffection caused by too much over-time,
    disaffectionHoursNb: number;
    // low motivation brought on by poor quality products or poor management
    lowMotivationHoursNb: number;

    strikeNextPeriodWeeksNb: number;
    strikeNotifiedWeeksNb: number;

    get strikeNotifiedHoursNb(): number {
        return this.strikeNotifiedWeeksNb * this.params.strikeHoursPerWeek * (this.employeesNb - this.inactiveEmployeesNb);
    }

    get theoreticalAvailableTotalHoursNb(): number {
        return this.shift.maxHoursPerPeriod * this.shiftLevel * this.postesNb;
    }

    get effectiveAvailableTotalHoursNb(): number {
        var value;

        value = this.theoreticalAvailableTotalHoursNb - this.absenteeismHoursNb - this.strikeNotifiedHoursNb;

        // replace sick workers with externals
        if (this.params.canBringExternalWorkers) {
            value += this.sicknessHoursNb;
        }
        // check negative value and correct to 0
        value = value > 0 ? value : 0;

        return value;
    }

    get weekDaysWorkedHoursNb(): number {
        var hoursNb: number,
            effectiveMaxHoursWeekDays: number;

        effectiveMaxHoursWeekDays = this.shift.maxHoursWeekDays - (this.strikeNotifiedWeeksNb * this.params.strikeHoursPerWeekDays);
        effectiveMaxHoursWeekDays *= (this.postesNb * this.shiftLevel);

        hoursNb = this.workedTotaHoursNb < effectiveMaxHoursWeekDays ? this.workedTotaHoursNb : effectiveMaxHoursWeekDays;

        if (hoursNb < 0) {
            hoursNb = 0;
        }

        return hoursNb;
    }

    get overtimeWorkedHoursNb(): number {
        var overtimeWorkedHoursNb: number,
            effectiveMaxHoursWeekDays: number;

        effectiveMaxHoursWeekDays = this.shift.maxHoursWeekDays - (this.strikeNotifiedWeeksNb * this.params.strikeHoursPerWeekDays);
        effectiveMaxHoursWeekDays *= (this.postesNb * this.shiftLevel);

        // how much hours exceed the max hours worked in weeks days
        overtimeWorkedHoursNb = this.workedTotaHoursNb - effectiveMaxHoursWeekDays;

        if (overtimeWorkedHoursNb < 0) {
            overtimeWorkedHoursNb = 0;
        }

        return overtimeWorkedHoursNb;
    }

    get overtimeSaturdayWorkedHoursNb(): number {
        var hoursNb: number,
            effectiveMaxHoursOvertimeSaturday: number;

        effectiveMaxHoursOvertimeSaturday = this.shift.maxHoursOvertimeSaturday - (this.strikeNotifiedWeeksNb * this.params.strikeHoursPerSaturday);
        effectiveMaxHoursOvertimeSaturday *= (this.postesNb * this.shiftLevel);

        hoursNb = this.overtimeWorkedHoursNb < effectiveMaxHoursOvertimeSaturday ? this.overtimeWorkedHoursNb : effectiveMaxHoursOvertimeSaturday;

        if (hoursNb < 0) {
            hoursNb = 0;
        }

        return hoursNb;
    }

    get overtimeSundayWorkedHoursNb(): number {
        var hoursNb: number,
            effectiveMaxHoursOvertimeSunday: number;

        hoursNb = this.overtimeWorkedHoursNb - this.overtimeSaturdayWorkedHoursNb;

        if (hoursNb < 0) {
            hoursNb = 0;
        }

        // we can't exceed the max
        effectiveMaxHoursOvertimeSunday = this.shift.maxHoursOvertimeSunday - (this.strikeNotifiedWeeksNb * this.params.strikeHoursPerSunday);
        effectiveMaxHoursOvertimeSunday *= (this.postesNb * this.shiftLevel);

        hoursNb = hoursNb < effectiveMaxHoursOvertimeSunday ? hoursNb : effectiveMaxHoursOvertimeSunday;

        return hoursNb;
    }

    get overtimeIntensity(): number {
        var intensity: number;
        var totalMaxOvertimeHours: number;

        totalMaxOvertimeHours = (this.shift.maxHoursOvertimeSaturday + this.shift.maxHoursOvertimeSunday) * this.postesNb * this.shiftLevel;
        // TODO: calc separate intensity for saturday and sunday with coefficient of rough
        intensity = this.overtimeWorkedHoursNb / totalMaxOvertimeHours;

        return intensity;
    }

    get workedWeeksNb(): number {
        var effectiveMaxHoursWeekDays = (this.shift.maxHoursWeekDays - (this.strikeNotifiedWeeksNb * this.params.strikeHoursPerWeekDays)) * (this.postesNb * this.shiftLevel);
        var maxHoursWeekDaysPerWeek = effectiveMaxHoursWeekDays / this.shift.weeksWorkedByPeriod;
        var workedWeekDaysWeeksNb = Math.ceil(this.weekDaysWorkedHoursNb / maxHoursWeekDaysPerWeek);

        return workedWeekDaysWeeksNb;
    }

    get spaceUsed(): number {
        return this.params.spaceNeeded * this.employeesNb;
    }

    get CO2PrimaryFootprintHeat(): number {
        return this.workedTotaHoursNb * this.params.CO2Footprint.kwh;
    }

    get CO2PrimaryFootprintWeight(): number {
        return this.CO2PrimaryFootprintHeat * 0.00052;
    }

    get CO2PrimaryFootprintOffsettingCost(): number {
        return Math.round(this.CO2PrimaryFootprintWeight * this.params.CO2Footprint.offsettingPerTonneRate);
    }
    
    // costs

    get externalWorkersCost(): number {
        var totalCost;
        var basicRate = this.hourlyWageRate;
        var adjustedRate;

        if (basicRate < this.params.minHourlyWageRate) {
            basicRate = this.params.minHourlyWageRate;
        }

        adjustedRate = basicRate * (1 + this.params.externalWorkersPremium);

        totalCost = this.sicknessHoursNb * adjustedRate;

        return totalCost;
    }
   
    get wages(): number {
        var wages,
            minSalary: number,

            weekDaysWorkedHoursNb: number,

            basicRate: number,

            weekDaysWage: number,
            saturdayWage: number,
            sundayWage: number,

            avgSalary: number,
            inactivesSalaries: number;

        var minTotalPaidHours = this.params.minPaidHours * this.postesNb * this.shiftLevel;

        basicRate = this.hourlyWageRate;

        weekDaysWorkedHoursNb = this.weekDaysWorkedHoursNb;

        if (weekDaysWorkedHoursNb < minTotalPaidHours) {
            weekDaysWorkedHoursNb = minTotalPaidHours;
        }

        weekDaysWage = weekDaysWorkedHoursNb * basicRate;

        saturdayWage = this.overtimeSaturdayWorkedHoursNb * basicRate * (1 + this.params.overtimeSatPremium);
        sundayWage = this.overtimeSundayWorkedHoursNb * basicRate * (1 + this.params.overtimeSunPremium);

        // we calculate on the hours worked by each poste so after we multiplie it by workers nb per poste
        wages = Math.ceil((weekDaysWage + saturdayWage + sundayWage) * (1 + this.shift.shiftPremium) * this.workersPerPosteNb);

        avgSalary = Math.ceil(wages / (this.employeesNb - this.inactiveEmployeesNb));
        inactivesSalaries = this.inactiveEmployeesNb * avgSalary;

        wages += inactivesSalaries;

        return wages;

    }

    get avgWagePerWorkerPerWeekWorked(): number {
        var avgWagePerWorker = this.wages / this.employeesNb;
        var avgWagePerWorkerPerWeekWorked = avgWagePerWorker / this.workedWeeksNb;

        return Math.ceil(avgWagePerWorkerPerWeekWorked);
    }

    get avgEarnings(): number {
        return this.wages / this.employeesNb;
    }


    // Actions

    work(hoursNb: number): boolean {
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }

        if (!this.ready) {
            console.debug('not ready');
            return false;
        }

        var success = true;

        if (isNaN(hoursNb) || !isFinite(hoursNb)) {
            console.debug('Machine @ Quantity not reel', arguments);
            return false;
        }


        // sorry we have limited capacity
        if ((this._workedTotaHoursNb + hoursNb) > this.effectiveAvailableTotalHoursNb) {

            console.debug('Il ne reste pas de Heures de MOD');
            return false;
        }

        this._workedTotaHoursNb += hoursNb;

        return true;
    }

    get adjustedWages(): number {
        // fire this event so we can control remunerations by management
        this.onPay();

        if (this.adjustedAvgEarnings === this.avgEarnings) {
            return this.wages;
        }

        return this.adjustedAvgEarnings * this.workedWeeksNb * this.employeesNb;
    }

    pay(hourlyWageRate: number) {
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }

        var basicRate = hourlyWageRate * this.params.skilledRateOfPay;

        if (basicRate < this.params.minHourlyWageRate) {
            basicRate = this.params.minHourlyWageRate;
        }

        this.hourlyWageRate = basicRate;
    }

    setShift(shiftLevel: number) {
        this.shiftLevel = shiftLevel;
        this.shift = this.params.availablesShifts[shiftLevel - 1];

        this.getReady();
    }

    onFinish() {
        CashFlow.addPayment(this.adjustedWages, this.params.payments);
        CashFlow.addPayment(this.CO2PrimaryFootprintOffsettingCost, this.params.payments);
    }

    getEndState(): any {
        var result = {};

        var state = {
            "availablesAtStartNb": this.availablesAtStartNb,
            "recruitedEffectiveNb": this.recruitedEffectiveNb,
            "dismissedEffectiveNb": this.dismissedEffectiveNb,
            "availablesNextPeriodNb": this.availablesNextPeriodNb,
            "availableTotalHoursNb": this.theoreticalAvailableTotalHoursNb,
            "absenteeismHoursNb": this.absenteeismHoursNb,
            "workedTotaHoursNb": this.workedTotaHoursNb,
            "strikeNextPeriodWeeksNb": this.strikeNextPeriodWeeksNb,
        };

        for (var key in state) {
            if (!state.hasOwnProperty(key)) {
                continue;
            }

            var prop = this.params.id + "_" + key;
            result[prop] = state[key];
        }

        return result;

    }

    
}

export = Worker;