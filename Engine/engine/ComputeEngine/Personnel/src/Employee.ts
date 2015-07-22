import LabourPool = require('../../Environnement/src/LabourPool');
import ENUMS = require('../../ENUMS');
import console = require('../../../../utils/logger');



export interface EmployeeCosts {
    recruitment: number;
    dismissal: number;
    training: number;
}

export interface EmployeeParams {
    category: string;

    isUnskilled: boolean;

    skilledRateOfPay?: number;

    trainedAvailability?: ENUMS.FUTURES;

    recruitedAvailability: ENUMS.FUTURES;
    dismissedUnvailability: ENUMS.FUTURES;

    maxDismissedNb?: number;

    minRecruitedNb?: number;
    maxRecruitedNb?: number;

    maxTrainedNb?: number;
    minTrainedNb?: number;

    costs: EmployeeCosts;
}


export class Employee {
    protected initialised: boolean;

    // params
    params: EmployeeParams;

    labourPool: LabourPool;

    // decision
    dismissedNb: number = 0;
    recruitedNb: number = 0;
    trainedNb: number = 0;

    salary: number = 0;
    

    constructor(params: EmployeeParams) {
        this.params = params;
    }

    // helpers

    init(availablesEmployeesNb: number, labourPool: LabourPool): void {
        this.reset();

        this.availablesAtStartNb = availablesEmployeesNb;
        this.employeesNb = availablesEmployeesNb;

        this.labourPool = labourPool;

        // let's work
        this.initialised = true;
    }

    reset() {
        this.recruitedNb = 0;
        this.recruitedEffectiveNb = 0;

        this.trainedEffectiveNb = 0;
        this.trainedNb = 0;

        this.dismissedEffectiveNb = 0;
        this.dismissedNb = 0;

        this.salary = 0;

        this._adjustedAvgEarnings = 0;

        this.onPay = function () { };

        this.initialised = false;
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

    onPay() { }


    //result
    employeesNb: number;

    availablesAtStartNb: number;

    // init them the case we will not affect them
    recruitedEffectiveNb: number = 0;
    trainedEffectiveNb: number = 0;
    dismissedEffectiveNb: number = 0;

    get resignedNb(): number {
        return this._calcResignedNb();
    }

    get availablesNextPeriodNb(): number {
        return this.availablesAtStartNb + this.recruitedEffectiveNb + this.trainedEffectiveNb - this.dismissedEffectiveNb - this.resignedNb;
    }

    


    
    // costs
    get recruitCost(): number {
        // even for try
        return this.recruitedNb * this.params.costs.recruitment;
    }

    get dismissalCost(): number {
        // just on effective 
        return this.dismissedEffectiveNb * this.params.costs.dismissal;
    }

    get trainingCost(): number {
        return this.trainedEffectiveNb * this.params.costs.training;
    }

    get personnelCost(): number {
        var sums = 0;

        sums += this.recruitCost;
        sums += this.dismissalCost;
        sums += this.trainingCost;

        return sums;
    }

    get wages(): number {
        var wages = this.salary * this.employeesNb;
        return wages;
    }

    get adjustedWages(): number {
        if (this.adjustedAvgEarnings === this.avgEarnings) {
            return this.wages;
        }

        return this.adjustedAvgEarnings * this.employeesNb;
    }

    protected _adjustedAvgEarnings: number = 0;

    set adjustedAvgEarnings(value: number) {
        this._adjustedAvgEarnings = value;
    }

    get adjustedAvgEarnings(): number {
        return this._adjustedAvgEarnings || this.avgEarnings;
    }


    // helpers
    protected get maxDismissedNb(): number {
        return this.params.maxDismissedNb || Number.POSITIVE_INFINITY;
    }

    protected get minRecruitedNb(): number {
        return this.params.minRecruitedNb || 0;
    }

    protected get maxRecruitedNb(): number {
        return this.params.maxRecruitedNb || Number.POSITIVE_INFINITY;
    }

    protected get maxTrainedNb(): number {
        return this.params.maxTrainedNb || Number.POSITIVE_INFINITY;
    }

    protected get minTrainedNb(): number {
        return this.params.minTrainedNb || 0;
    }

    // TODO: implement
    _calcResignedNb(): number {
        return 0;
    }
    

    // actions

    recruit(recruitedNb: number) {
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }

        // decision
        this.recruitedNb = recruitedNb;

        if (recruitedNb < this.minRecruitedNb) {
            recruitedNb = this.minRecruitedNb;
        }

        if (recruitedNb > this.maxRecruitedNb) {
            recruitedNb = this.maxRecruitedNb;
        }

        this.recruitedEffectiveNb = this.labourPool.employ(recruitedNb, this.params.isUnskilled);

        if (this.params.recruitedAvailability === ENUMS.FUTURES.IMMEDIATE) {
            this.employeesNb += this.recruitedEffectiveNb;
        }

    }

    train(trainedNb: number) {
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }

        this.trainedNb = trainedNb;

        if (trainedNb < this.minTrainedNb) {
            trainedNb = this.minTrainedNb;
        }

        if (trainedNb > this.maxTrainedNb) {
            trainedNb = this.maxTrainedNb;
        }


        // TODO implment
        this.trainedEffectiveNb = this.labourPool.train(trainedNb, !this.params.isUnskilled);

        if (this.params.trainedAvailability === ENUMS.FUTURES.IMMEDIATE) {
            this.employeesNb += this.trainedEffectiveNb;
        }
    }

    dismiss(dismissedNb: number) {
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }

        this.dismissedNb = dismissedNb;

        if (dismissedNb > this.maxDismissedNb) {
            dismissedNb = this.maxDismissedNb;
        }

        // TODO implment
        this.dismissedEffectiveNb = dismissedNb;

        if (this.params.dismissedUnvailability === ENUMS.FUTURES.IMMEDIATE) {
            this.employeesNb -= this.dismissedEffectiveNb;
        }
    }

    pay(salary: number) {
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }

        this.salary = salary;
    }

    // interface
    get avgEarnings(): number {
        return 0;
    }

    
}
