import AbstractObject = require('./AbstractObject');
import ENUMS = require('../../ENUMS');
import Utils = require('../../../../utils/Utils');

import console = require('../../../../utils/logger');

import Insurance = require('../../Finance/src/Insurance');


import ObjectsManager = require('../../ObjectsManager');

import CashFlow = require('../../Finance/src/CashFlow');

interface MachineCosts {
    maintenanceHourlyCost: number;
    overContractedMaintenanceHourlyCost: number;
    decommissioning: number;
    overheads: number;
    runningHour: number;
    supervisionPerShift: number;
}

interface MachineParams extends AbstractObject {
    id: string;

    label: string;
    spaceNeeded: number;
    
    CO2Footprint: ENUMS.CO2Footprint;

    costs: MachineCosts;


    deliveryTime: ENUMS.DELIVERY;
    decommissioningTime: ENUMS.DELIVERY;

    depreciationRate: number;
    usefulLife: number;
    residualValue: number;
    
    breakdownProba: number;
    disposalPrice: number;
    acquisitionPrice: number;

    machineCapacityByShift: number[];
    machineOperatorsNeededNb: number[];

    payments: {
        maintenance: ENUMS.PaymentArray;
        running: ENUMS.PaymentArray;
        decommissioning: ENUMS.PaymentArray;

        acquisitions: ENUMS.PaymentArray;
    }
}

interface MachineStats {
    active: boolean;
    age: number;
    runningTotalHoursNb: number;
    efficiency: number;
    depreciatedValue?: number;
    lastUse?: boolean;
}
 
class Machine {
    private initialised: boolean;

    // params

    params: MachineParams;

    machinesStats: MachineStats[];

    Insurance: Insurance = null;

    constructor(machineParams: MachineParams) {
        this.params = machineParams;
    }

    availablesAtStartNb: number;
    machineryLastNetValue: number;

    init(availablesMachinesNb: number, machinesStats: MachineStats[], machineryLastNetValue) {
        this.reset();

        this.availablesAtStartNb = availablesMachinesNb;
        this.machinesNb = availablesMachinesNb;

        this.machineryLastNetValue = machineryLastNetValue;

        this.machinesStats = machinesStats;
        
        // now you can power machines
        this.initialised = true;

        this.workedHoursNb = 0;

        ObjectsManager.register(this, "production");
    }

    reset() {
        this.machinesStats = [];

        this.effectiveBoughtNb = 0;
        this.effectiveSoldNb = 0;
        this.lostNb = 0;

        this.onReady = function () { };

        this.initialised = false;
    }

    // decision
    boughtNb: number;
    soldNb: number;

    effectiveBoughtNb: number;
    effectiveSoldNb: number;
    lostNb: number = 0;

    shiftLevel: ENUMS.SHIFT_LEVEL;

    // results
    machinesNb: number;
    
    get availablesNextPeriodNb(): number {
        return this.availablesAtStartNb + this.effectiveBoughtNb - this.effectiveSoldNb - this.lostNb;
    }
   
    workedHoursNb: number;

    maintenancePlannedHoursNb: number;
    maintenanceOverContractedHoursNb: number;

    breakdownHoursNb: number;

    get maintenanceHoursNb(): number {
        return this.maintenancePlannedHoursNb - this.breakdownHoursNb;
    }


    get machineEfficiencyAvg(): number {
        // var avg = Utils.sums(this.machinesStats, "efficiency", "active", true) / this.machinesNb;
        var avg = Utils.sums(this.machinesStats, "efficiency") / this.machinesStats.length;

        if (avg > 1) {
            console.debug("something strange you have efficienct > than 1", avg);
        }

        return avg + 0.002; // for test
    }


    machineCapacity: number;
    operatorsNb: number;

    get spaceUsed(): number {
        return this.params.spaceNeeded * this.machinesNb;
    }

    get disposalValue(): number {
        return this.effectiveSoldNb * this.params.disposalPrice;
    }


    // costs
    get acquisitionCost(): number {
        return this.effectiveBoughtNb * this.params.acquisitionPrice;
    }


    get powerCost(): number {
        return this.params.costs.runningHour * Math.ceil(this.workedHoursNb);
    }

    get overheadsCost(): number {
        return this.params.costs.overheads * this.machinesNb;
    }

    get supervisionCost(): number {
        return this.params.costs.supervisionPerShift * this.shiftLevel;
    }

    get runningCost(): number {
        return this.powerCost + this.overheadsCost + this.supervisionCost;
    }

    get decommissioningCost(): number {
        return this.params.costs.decommissioning * this.effectiveSoldNb;
    }

    get maintenanceCost(): number {
        var cost: number;

        cost = this.maintenancePlannedHoursNb * this.params.costs.maintenanceHourlyCost;
        cost += this.maintenanceOverContractedHoursNb * this.params.costs.overContractedMaintenanceHourlyCost;

        return cost;
    }

    get theoreticalAvailableHoursNb(): number {
        return (this.machinesNb * this.machineCapacity);
    }

    get effectiveAvailableHoursNb(): number {
        var value;

        value = this.theoreticalAvailableHoursNb - this.maintenancePlannedHoursNb - this.maintenanceOverContractedHoursNb;

        // check negative value and correct to 0
        value = value > 0 ? value : 0;

        return value;
    }

    get CO2PrimaryFootprintHeat(): number {
        return this.params.CO2Footprint.kwh * this.workedHoursNb;
    }

    get CO2PrimaryFootprintWeight(): number {
        return this.CO2PrimaryFootprintHeat * 0.00052;
    }

    get CO2PrimaryFootprintOffsettingCost(): number {
        return Math.round(this.CO2PrimaryFootprintWeight * this.params.CO2Footprint.offsettingPerTonneRate);
    }

    // helper

    _getBreakdownHoursNb(): number {
        var landa = (this.params.breakdownProba / 100) * this.machineCapacity,
            value = 0,
            i = 0;

        for (; i < this.machinesNb; i++) {
            value += Utils.getPoisson(landa);
        }

        return value;
    }

    get stats(): MachineStats[] {
        var stats: MachineStats[],
            item: MachineStats;

        var i = 0,
            nb = this.machinesStats.length;


        stats = [];

        for (; i < nb; i++) {
            item = Utils.ObjectApply({}, this.machinesStats[i]);

            // we deal just with active
            if (item.lastUse || (!item.active && item.age !== 0)) {
                continue;
            }

            // update stats
            item.age += 1; // 1 period
            item.efficiency *= 0.97; // TODO implement
            item.runningTotalHoursNb += Math.ceil(this.workedHoursNb / this.machinesNb);

            stats.push(item);
        }

        return stats;
    }

    get machineryRawValue(): number {
        var rawValue = this.machineryLastNetValue + (this.effectiveBoughtNb * this.params.acquisitionPrice);

        // now retreiving sold machines depreciated value
        var soldNb = this.effectiveSoldNb;
        var i = 0;

        var age;
        var netRate = 1 - this.params.depreciationRate;
        var depreciatedValue;

        for (; i < soldNb; i++) {
            age = this.machinesStats[i].age;
            depreciatedValue = Math.floor(this.params.acquisitionPrice * Math.pow(netRate, age));

            rawValue -= depreciatedValue;
        }

        return rawValue;   
    }

    get depreciation(): number {
        var depreciation = this.machineryRawValue * this.params.depreciationRate;
        return Math.floor(depreciation);
    }
    
    get machineryNetValue(): number {
        return this.machineryRawValue - this.depreciation;
    }


    


    // Actions

    setShiftLevel(shiftLevel: ENUMS.SHIFT_LEVEL) {
        this.shiftLevel = shiftLevel;

        this.machineCapacity = this.params.machineCapacityByShift[shiftLevel - 1];

        this.operatorsNb = this.params.machineOperatorsNeededNb[shiftLevel - 1] * this.machinesNb;

        this.breakdownHoursNb = this._getBreakdownHoursNb();

        this.repair(this.breakdownHoursNb);

        this.onReady();
    }


    on(eventName: string, callback, scope = null) {
        var self = this;
        var previousListeners = typeof this["on" + eventName] === "function" ? this["on" + eventName] : function () { };
        // cumumative
        this["on" + eventName] = function () {
            previousListeners();
            callback.apply(scope, [self]);
        };
    }

    onReady() { }

    onFinish() {
        // maintenance
        CashFlow.addPayment(this.maintenanceCost, this.params.payments.maintenance);
        CashFlow.addPayment(this.runningCost, this.params.payments.running);
        CashFlow.addPayment(this.CO2PrimaryFootprintOffsettingCost, this.params.payments.running);

        CashFlow.addPayment(this.decommissioningCost, this.params.payments.decommissioning);

        CashFlow.addPayment(this.acquisitionCost, this.params.payments.acquisitions, ENUMS.ACTIVITY.INVESTING);

        console.log("runningCost", this.runningCost); 
        console.log("maintenanceCost", this.maintenanceCost); 
        console.log("CO2", this.CO2PrimaryFootprintOffsettingCost);
        console.log("decomm", this.decommissioningCost);
    }
       

    power(hoursNb: number): boolean {
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }

        if (isNaN(hoursNb) || !isFinite(hoursNb)) {
            console.debug('Machine @ Quantity not reel', arguments);
            return false;
        }
        
        var succes = true,
            effectiveTime: number;

        effectiveTime = hoursNb / this.machineEfficiencyAvg;

        this.workedHoursNb += effectiveTime;

        // sorry we have limited capacity
        if (this.workedHoursNb > this.effectiveAvailableHoursNb) {
            this.workedHoursNb -= effectiveTime;

            succes = false;
        }

        return succes;
    }


    buy(boughtNb: number) {
       
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }

        // decision
        this.boughtNb = boughtNb;

        // till now
        // TODO develop it
        this.effectiveBoughtNb = boughtNb;

        // add new stats
        for (var i = 0; i < this.effectiveBoughtNb; i++) {
            this.machinesStats.push({
                active: this.params.deliveryTime === ENUMS.DELIVERY.IMMEDIATE,
                age: 0,
                efficiency: 1,
                depreciatedValue: 300000,
                runningTotalHoursNb: 0
            });
        }

        if (this.params.deliveryTime === ENUMS.DELIVERY.IMMEDIATE) {
            this.machinesNb += this.effectiveBoughtNb;
        }
    }

    sell(soldNb: number) {
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }

        this.soldNb = soldNb;

        // TODO implment
        this.effectiveSoldNb = soldNb;

        // add new stats
        for (var i = 0; i < this.effectiveSoldNb; i++) {
            // removes the first elements which means oldest machines
            this.machinesStats[i].active = this.params.decommissioningTime === ENUMS.DELIVERY.IMMEDIATE;
            this.machinesStats[i].lastUse = true;
        }

        if (this.params.decommissioningTime === ENUMS.DELIVERY.IMMEDIATE) {
            this.machinesNb -= soldNb;
        }
    }

    repair(breakdownHoursNb: number): boolean {
        this.maintenanceOverContractedHoursNb = breakdownHoursNb - this.maintenancePlannedHoursNb;

        if (this.maintenanceOverContractedHoursNb < 0) {
            this.maintenanceOverContractedHoursNb = 0;
        }

        return true;
    }

    doMaintenance(hoursByMachineNb: number): boolean {

        var operationValue: number;

        this.maintenancePlannedHoursNb = hoursByMachineNb * this.machinesNb;

        return true;
    }

    getEndState(): any {
        // finish everything for sync
        var result = {};

        var state = {
            "effectiveSoldNb": this.effectiveSoldNb,
            "machinesNb": this.machinesNb,
            "effectiveBoughtNb": this.effectiveBoughtNb,
            "availablesNextPeriodNb": this.availablesNextPeriodNb,

            "theoreticalAvailableHoursNb": this.theoreticalAvailableHoursNb,
            "breakdownHoursNb": this.breakdownHoursNb,
            "workedHoursNb": Math.ceil(this.workedHoursNb),
            "machineEfficiencyAvg": this.machineEfficiencyAvg * 100,

            "stats": this.stats
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

export = Machine;