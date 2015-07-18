var ENUMS = require('../../ENUMS');
var Employee = (function () {
    function Employee(params) {
        // decision
        this.dismissedNb = 0;
        this.recruitedNb = 0;
        this.trainedNb = 0;
        this.salary = 0;
        // init them the case we will not affect them
        this.recruitedEffectiveNb = 0;
        this.trainedEffectiveNb = 0;
        this.dismissedEffectiveNb = 0;
        this._adjustedAvgEarnings = 0;
        this.params = params;
    }
    // helpers
    Employee.prototype.init = function (availablesEmployeesNb, labourPool) {
        this.reset();
        this.availablesAtStartNb = availablesEmployeesNb;
        this.employeesNb = availablesEmployeesNb;
        this.labourPool = labourPool;
        // let's work
        this.initialised = true;
    };
    Employee.prototype.reset = function () {
        this.recruitedNb = 0;
        this.recruitedEffectiveNb = 0;
        this.trainedEffectiveNb = 0;
        this.trainedNb = 0;
        this.dismissedEffectiveNb = 0;
        this.dismissedNb = 0;
        this.salary = 0;
        this._adjustedAvgEarnings = 0;
        this.onPay = function () {
        };
        this.initialised = false;
    };
    Employee.prototype.on = function (eventName, callback, scope) {
        if (scope === void 0) { scope = null; }
        var self = this;
        var previousListeners = typeof this["on" + eventName] === "function" ? this["on" + eventName] : function () {
        };
        // cumumative
        this["on" + eventName] = function () {
            previousListeners();
            callback.apply(scope, [self]);
        };
    };
    Employee.prototype.onPay = function () {
    };
    Object.defineProperty(Employee.prototype, "resignedNb", {
        get: function () {
            return this._calcResignedNb();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "availablesNextPeriodNb", {
        get: function () {
            return this.availablesAtStartNb + this.recruitedEffectiveNb + this.trainedEffectiveNb - this.dismissedEffectiveNb - this.resignedNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "recruitCost", {
        // costs
        get: function () {
            // even for try
            return this.recruitedNb * this.params.costs.recruitment;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "dismissalCost", {
        get: function () {
            // just on effective 
            return this.dismissedEffectiveNb * this.params.costs.dismissal;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "trainingCost", {
        get: function () {
            return this.trainedEffectiveNb * this.params.costs.training;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "personnelCost", {
        get: function () {
            var sums = 0;
            sums += this.recruitCost;
            sums += this.dismissalCost;
            sums += this.trainingCost;
            return sums;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "wages", {
        get: function () {
            var wages = this.salary * this.employeesNb;
            return wages;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "adjustedWages", {
        get: function () {
            if (this.adjustedAvgEarnings === this.avgEarnings) {
                return this.wages;
            }
            return this.adjustedAvgEarnings * this.employeesNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "adjustedAvgEarnings", {
        get: function () {
            return this._adjustedAvgEarnings || this.avgEarnings;
        },
        set: function (value) {
            this._adjustedAvgEarnings = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "maxDismissedNb", {
        // helpers
        get: function () {
            return this.params.maxDismissedNb || Number.POSITIVE_INFINITY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "minRecruitedNb", {
        get: function () {
            return this.params.minRecruitedNb || 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "maxRecruitedNb", {
        get: function () {
            return this.params.maxRecruitedNb || Number.POSITIVE_INFINITY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "maxTrainedNb", {
        get: function () {
            return this.params.maxTrainedNb || Number.POSITIVE_INFINITY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "minTrainedNb", {
        get: function () {
            return this.params.minTrainedNb || 0;
        },
        enumerable: true,
        configurable: true
    });
    // TODO: implement
    Employee.prototype._calcResignedNb = function () {
        return 0;
    };
    // actions
    Employee.prototype.recruit = function (recruitedNb) {
        if (!this.initialised) {
            console.log('not initialised');
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
        if (this.params.recruitedAvailability === 0 /* IMMEDIATE */) {
            this.employeesNb += this.recruitedEffectiveNb;
        }
    };
    Employee.prototype.train = function (trainedNb) {
        if (!this.initialised) {
            console.log('not initialised');
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
        if (this.params.trainedAvailability === 0 /* IMMEDIATE */) {
            this.employeesNb += this.trainedEffectiveNb;
        }
    };
    Employee.prototype.dismiss = function (dismissedNb) {
        if (!this.initialised) {
            console.log('not initialised');
            return false;
        }
        this.dismissedNb = dismissedNb;
        if (dismissedNb > this.maxDismissedNb) {
            dismissedNb = this.maxDismissedNb;
        }
        // TODO implment
        this.dismissedEffectiveNb = dismissedNb;
        if (this.params.dismissedUnvailability === 0 /* IMMEDIATE */) {
            this.employeesNb -= this.dismissedEffectiveNb;
        }
    };
    Employee.prototype.pay = function (salary) {
        if (!this.initialised) {
            console.log('not initialised');
            return false;
        }
        this.salary = salary;
    };
    Object.defineProperty(Employee.prototype, "avgEarnings", {
        // interface
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    return Employee;
})();
exports.Employee = Employee;
//# sourceMappingURL=Employee.js.map