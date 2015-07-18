var ENUMS = require('../../ENUMS');
var Utils = require('../../../../utils/Utils');
var logger = require('../../../../utils/logger');
var ObjectsManager = require('../../ObjectsManager');
var Management = (function () {
    function Management(params) {
        this.employees = [];
        this.params = params;
    }
    Management.prototype.init = function (lastBudget, employees) {
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
    };
    Management.prototype.reset = function () {
        this.controlAlreadyDone = false;
        this.initialised = false;
    };
    Management.prototype.controlRemunerations = function () {
        if (this.controlAlreadyDone) {
            return;
        }
        this.controlAlreadyDone = true;
        var machinist;
        var machinistAvgEarnings;
        var assemblyWorkerAvgEarnings;
        var assemblyWorker;
        var adjustedAvgEarnings;
        logger.log("call for control");
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
        logger.log("We have M:", machinistAvgEarnings, " A:", assemblyWorkerAvgEarnings);
        if (!machinist || !assemblyWorker || !machinistAvgEarnings || !assemblyWorkerAvgEarnings) {
            return false;
        }
        if (assemblyWorkerAvgEarnings >= machinistAvgEarnings) {
            return true;
        }
        adjustedAvgEarnings = Math.floor((machinistAvgEarnings - assemblyWorkerAvgEarnings) * assemblyWorker.employeesNb);
        logger.log("Adjusted:", adjustedAvgEarnings);
        // fix disequilibre
        assemblyWorker.adjustedAvgEarnings = adjustedAvgEarnings;
    };
    Object.defineProperty(Management.prototype, "minTrainedEmployeesNb", {
        // results
        get: function () {
            return this.trainingDaysNb * this.params.minDailyTrainedEmployeesNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Management.prototype, "maxTrainedEmployeesNb", {
        get: function () {
            return this.trainingDaysNb * this.params.maxDailyTrainedEmployeesNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Management.prototype, "employeesNb", {
        get: function () {
            return Utils.sums(this.employees, "employeesNb");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Management.prototype, "trainingCost", {
        // costs
        get: function () {
            return this.trainingDaysNb * this.params.costs.trainingConsultantDayRate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Management.prototype, "personnelCost", {
        get: function () {
            return Utils.sums(this.employees, "personnelCost") + this.trainingCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Management.prototype, "managementCost", {
        get: function () {
            return this.budget;
        },
        enumerable: true,
        configurable: true
    });
    // actions
    Management.prototype.train = function (trainingDaysNb) {
        if (!this.initialised) {
            console.log('not initialised');
            return false;
        }
        this.trainingDaysNb = trainingDaysNb;
    };
    Management.prototype.allocateBudget = function (budget) {
        if (!this.initialised) {
            console.log('not initialised');
            return false;
        }
        var change = budget - this.lastBudgetRef, minBudget = this.lastBudgetRef * (1 - this.params.budget.decreaseLimitRate);
        // if decrease
        if (change < 0) {
            if (budget < minBudget) {
                budget = minBudget;
            }
            if (this.params.budget.decreaseEffectiveness !== 0 /* IMMEDIATE */) {
                this.nextBudgetRef = budget;
                budget = this.lastBudgetRef;
            }
        }
        this.budget = budget;
    };
    Management.prototype.getEndState = function () {
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
    };
    return Management;
})();
module.exports = Management;
//# sourceMappingURL=Management.js.map