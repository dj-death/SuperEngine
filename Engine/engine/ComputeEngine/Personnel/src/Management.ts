import ENUMS = require('../../ENUMS');
import Utils = require('../../../../utils/Utils');

import console = require('../../../../utils/logger');

import ObjectsManager = require('../../ObjectsManager');

import Employee = require('./Employee');

import CashFlow = require('../../Finance/src/CashFlow');


interface ManagementParams {
    minDailyTrainedEmployeesNb: number;
    maxDailyTrainedEmployeesNb: number;

    budget: {
        decreaseEffectiveness: ENUMS.FUTURES;
        decreaseLimitRate: number;
    }

    costs: {
        trainingConsultantDayRate: number;
    }

    payments: {
        management: ENUMS.PaymentArray;
        personnel: ENUMS.PaymentArray;
    }
}


class Management {
    private initialised: boolean;

    params: ManagementParams;

    employees: Employee.Employee[] = [];

    constructor(params: ManagementParams) {
        this.params = params;
    }

    lastBudgetRef: number;
    nextBudgetRef: number;

    controlAlreadyDone: boolean;

    init(lastBudget: number, employees: Employee.Employee[]) {
        this.reset();

        this.lastBudgetRef = lastBudget;

        this.employees = employees;

        var self = this;

        this.employees.forEach(function (emp) {
            emp.on("Pay", self.controlRemunerations, self);
        });
 
        // let's work
        this.initialised = true;

        ObjectsManager.register(this, "management");
    }

    reset() {
        this.controlAlreadyDone = false;
        this.initialised = false;
    }

    controlRemunerations() {
        if (this.controlAlreadyDone) {
            return;
        }

        this.controlAlreadyDone = true;

        var machinist: Employee.Employee;
        var machinistAvgEarnings;

        var assemblyWorkerAvgEarnings;
        var assemblyWorker: Employee.Employee;

        var adjustedAvgEarnings;

        this.employees.forEach(function (emp) {
            var empParams = emp.params;
            if (empParams.isUnskilled && empParams.category === "machinist") {
                machinist = emp;
                machinistAvgEarnings = emp.avgEarnings;
            }

            if (!empParams.isUnskilled && empParams.category === "assemblyWorker") {
                assemblyWorker = emp;
                assemblyWorkerAvgEarnings = emp.avgEarnings;
            }
        });

        if (!machinist || !assemblyWorker || !machinistAvgEarnings || !assemblyWorkerAvgEarnings) {
            return false;
        }

        if (assemblyWorkerAvgEarnings >= machinistAvgEarnings) {
            return true;
        }

        adjustedAvgEarnings = Math.floor((machinistAvgEarnings - assemblyWorkerAvgEarnings) * assemblyWorker.employeesNb);

        // fix disequilibre
        assemblyWorker.adjustedAvgEarnings = adjustedAvgEarnings;
        
    }

    // decisions
    trainingDaysNb: number;
    budget: number;

    // results
    get minTrainedEmployeesNb(): number {
        return this.trainingDaysNb * this.params.minDailyTrainedEmployeesNb;
    }

    get maxTrainedEmployeesNb(): number {
        return this.trainingDaysNb * this.params.maxDailyTrainedEmployeesNb;
    }

    get employeesNb(): number {
        return Utils.sums(this.employees, "employeesNb");
    }

    // costs
    get trainingCost(): number {
        return this.trainingDaysNb * this.params.costs.trainingConsultantDayRate;
    }

    get personnelCost(): number {
        return Utils.sums(this.employees, "personnelCost") + this.trainingCost;
    }

    get managementCost(): number {
        return this.budget;
    }

    // actions

    train(trainingDaysNb: number) {
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }

        this.trainingDaysNb = trainingDaysNb;
    }

    allocateBudget(budget: number) {
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }

        var change = budget - this.lastBudgetRef,
            minBudget = this.lastBudgetRef * (1 - this.params.budget.decreaseLimitRate);

        // if decrease
        if (change < 0) {

            if (budget < minBudget) {
                budget = minBudget;
            }

            if (this.params.budget.decreaseEffectiveness !== ENUMS.FUTURES.IMMEDIATE) {
                this.nextBudgetRef = budget;
                budget = this.lastBudgetRef;
            }

        } 

        this.budget = budget;   
    }

    onFinish() {
        CashFlow.addPayment(this.personnelCost, this.params.payments.personnel);
        CashFlow.addPayment(this.managementCost, this.params.payments.management);
    }

    getEndState(): any {

        var result = {};

        var state = {
            "managementCost": this.managementCost,
            "personnelCost": this.personnelCost,
            "employeesNb": this.employeesNb
        };

        for (var key in state) {
            if (!state.hasOwnProperty(key)) {
                continue;
            }

            result[key] = state[key];
        }

        return result;

    }


}

export = Management;