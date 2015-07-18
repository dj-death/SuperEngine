import Warehouse = require('./Warehouse');
import Worker = require('./Worker');
import Machine = require('./Machine');

import logger = require('../../../../utils/logger');

import ObjectsManager = require('../../ObjectsManager');

interface AtelierCosts {
    power: number;
    fixedExpenses: number;
    maintenance: number;
}

interface AtelierParams {
    label: string;
    spaceNeeded: number;

    unity: number;
    costs: AtelierCosts;
}

class Atelier {

    private initialised: boolean;
    
    params: AtelierParams;

    constructor(atelierParams: AtelierParams) {
        this.params = atelierParams;
    }

    worker: Worker;
    machine: Machine;

    // results
    workedHoursNb: number;

    get spaceUsed(): number {
        var space: number;

        space = this.worker && this.worker.spaceUsed;
        space += this.machine && this.machine.spaceUsed;

        return space;
    }


    // helper
    init(worker: Worker, machine: Machine) {
        this.reset();

        this.worker = worker;
        this.machine = machine;

        // now let's work
        this.initialised = true;

        ObjectsManager.register(this, "production");
    }

    reset() {
        this.workedHoursNb = 0;

        this.initialised = false;
    }


    getNeededTimeForProd(quantity, manufacturingUnitTime: number): any {
        var needed = {};

        var effectiveManufacturingTotalTime = quantity * manufacturingUnitTime;

        if (this.machine) {
            effectiveManufacturingTotalTime /= this.machine.machineEfficiencyAvg;

            needed[this.machine.params.id] = effectiveManufacturingTotalTime;
        }

        if (this.worker) {
            needed[this.worker.params.id] = effectiveManufacturingTotalTime;
        }
        
        return needed;
    }


    // actions
    work(hoursNb: number): boolean {
        if (!this.initialised) {
            console.log('not initialised');

            return false;
        }

        var success: boolean;

        // power machines
        success = this.machine && this.machine.power(hoursNb);

        if (!success && this.machine) {
            console.log("Votre demande dépasse la capacité périodique des machines");
            return false;
        }

        // everything is ok now order workers to do their job

        // let's see if the machine do some trouble and need some extra time due to its depreciation
        if (this.machine) {
            var efficiency = this.machine.machineEfficiencyAvg;

            if (isFinite(efficiency) && efficiency > 0) {
                hoursNb /= efficiency;
            } 
        }

        success = this.worker && this.worker.work(hoursNb);

        if (!success && this.worker) {
            console.log("Votre demande dépasse la capacité périodique des ouvriers ", this.worker.params.label);
            console.log("Nous lui avons demandés de travailler ", hoursNb, " hours");
            return false;
        }

        // now increment
        this.workedHoursNb += hoursNb;

        return success;
    }

}

export = Atelier;