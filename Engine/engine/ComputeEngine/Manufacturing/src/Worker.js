var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Employee = require('../../Personnel/src/Employee');
var Utils = require('../../../../utils/Utils');
var logger = require('../../../../utils/logger');
var ObjectsManager = require('../../ObjectsManager');
var Worker = (function (_super) {
    __extends(Worker, _super);
    function Worker(params) {
        _super.call(this, params);
        this.Insurance = null;
    }
    // helpers
    Worker.prototype._calcDisaffectionHoursNb = function () {
        var probability, landa, value = 0, i = 0;
        var activeEmployeesNb = this.employeesNb - this.inactiveEmployeesNb;
        // based on ??,,
        probability = this.params.absenteeismProba;
        landa = probability * (this.shift.maxHoursPerPeriod / this.shift.workersNeededNb) + this.params.absenteeismNormalHoursNb;
        for (; i < activeEmployeesNb; i++) {
            value += Utils.getPoisson(landa);
        }
        return 144; //Math.round(value); // we need an integer value
    };
    Worker.prototype._calcSicknessHoursNb = function () {
        return 0;
    };
    Worker.prototype._calcLowMotivationHoursNb = function () {
        return 0;
    };
    Worker.prototype._calcStrikeNextPeriodWeeksNb = function () {
        var probability, weeksMax = this.shift.weeksWorkedByPeriod, value = 0;
        // random value from 0 to max 
        probability = Math.random() * weeksMax;
        value = probability * this.params.tradeUnionSensibility;
        return Math.round(value); // we need an integer value
    };
    Worker.prototype.init = function (availablesWorkersNb, labourPool, strikeNotifiedWeeksNb, machine) {
        if (strikeNotifiedWeeksNb === void 0) { strikeNotifiedWeeksNb = 0; }
        if (machine === void 0) { machine = null; }
        this.reset();
        _super.prototype.init.call(this, availablesWorkersNb, labourPool);
        this.strikeNotifiedWeeksNb = strikeNotifiedWeeksNb;
        this.machine = machine;
        if (machine !== null && this.params.defaultRecruit === true) {
            var self = this;
            this.machine.on("Ready", function (machine) {
                var variation = machine.operatorsNb - self.employeesNb;
                var recruitedNb = variation > 0 ? variation : 0;
                var surplusDismissedNb = variation < 0 ? Math.abs(Math.round(variation * self.params.surplusMaxDismissedPercent)) : 0;
                // necessary to call all actions even with param 0
                self.recruit(recruitedNb);
                self.dismiss(surplusDismissedNb);
                self.surplusDismissedNb = surplusDismissedNb;
                logger.log("Machines :", machine.operatorsNb, " Available:", self.employeesNb);
                logger.log("Recruit:", recruitedNb, " Dismiss", surplusDismissedNb);
                logger.log("Next P:", self.availablesNextPeriodNb);
                logger.log("Trained:", self.trainedNb, self.trainedEffectiveNb);
                logger.log("Recruit:", self.recruitedNb, self.recruitedEffectiveNb);
                logger.log("Dis:", self.dismissedNb, self.dismissedEffectiveNb);
            }, self);
        }
        ObjectsManager.register(this, "production");
    };
    Object.defineProperty(Worker.prototype, "timeUnitCost", {
        get: function () {
            var cost = this.hourlyWageRate * (1 + this.shift.shiftPremium) * this.workersPerPosteNb;
            return cost;
        },
        enumerable: true,
        configurable: true
    });
    Worker.prototype.getReady = function () {
        this.sicknessHoursNb = this._calcSicknessHoursNb();
        this.disaffectionHoursNb = this._calcDisaffectionHoursNb();
        this.lowMotivationHoursNb = this._calcLowMotivationHoursNb();
        this.strikeNextPeriodWeeksNb = this._calcStrikeNextPeriodWeeksNb();
        this.ready = true;
    };
    Worker.prototype.reset = function () {
        this._workedTotaHoursNb = 0;
        this.surplusDismissedNb = 0;
        this.initialised = false;
    };
    Object.defineProperty(Worker.prototype, "workersPerPosteNb", {
        get: function () {
            return this.shift.workersNeededNb / this.shiftLevel;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "postesNb", {
        get: function () {
            if (this.machine) {
                return this.machine.machinesNb;
            }
            return (this.employeesNb - this.inactiveEmployeesNb) / this.shift.workersNeededNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "inactiveEmployeesNb", {
        //result
        get: function () {
            var result = 0;
            if (this.machine && this.machine.operatorsNb < this.employeesNb) {
                result = this.employeesNb - this.machine.operatorsNb;
            }
            return result;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "workedTotaHoursNb", {
        get: function () {
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
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "absenteeismHoursNb", {
        get: function () {
            return this.sicknessHoursNb + this.disaffectionHoursNb + this.lowMotivationHoursNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "strikeNotifiedHoursNb", {
        get: function () {
            return this.strikeNotifiedWeeksNb * this.params.strikeHoursPerWeek * (this.employeesNb - this.inactiveEmployeesNb);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "theoreticalAvailableTotalHoursNb", {
        get: function () {
            return this.shift.maxHoursPerPeriod * this.shiftLevel * this.postesNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "effectiveAvailableTotalHoursNb", {
        get: function () {
            var value;
            value = this.theoreticalAvailableTotalHoursNb - this.absenteeismHoursNb - this.strikeNotifiedHoursNb;
            // replace sick workers with externals
            if (this.params.canBringExternalWorkers) {
                value += this.sicknessHoursNb;
            }
            // check negative value and correct to 0
            value = value > 0 ? value : 0;
            return value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "weekDaysWorkedHoursNb", {
        get: function () {
            var hoursNb, effectiveMaxHoursWeekDays;
            effectiveMaxHoursWeekDays = this.shift.maxHoursWeekDays - (this.strikeNotifiedWeeksNb * this.params.strikeHoursPerWeekDays);
            effectiveMaxHoursWeekDays *= (this.postesNb * this.shiftLevel);
            hoursNb = this.workedTotaHoursNb < effectiveMaxHoursWeekDays ? this.workedTotaHoursNb : effectiveMaxHoursWeekDays;
            if (hoursNb < 0) {
                hoursNb = 0;
            }
            return hoursNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "overtimeWorkedHoursNb", {
        get: function () {
            var overtimeWorkedHoursNb, effectiveMaxHoursWeekDays;
            effectiveMaxHoursWeekDays = this.shift.maxHoursWeekDays - (this.strikeNotifiedWeeksNb * this.params.strikeHoursPerWeekDays);
            effectiveMaxHoursWeekDays *= (this.postesNb * this.shiftLevel);
            // how much hours exceed the max hours worked in weeks days
            overtimeWorkedHoursNb = this.workedTotaHoursNb - effectiveMaxHoursWeekDays;
            if (overtimeWorkedHoursNb < 0) {
                overtimeWorkedHoursNb = 0;
            }
            return overtimeWorkedHoursNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "overtimeSaturdayWorkedHoursNb", {
        get: function () {
            var hoursNb, effectiveMaxHoursOvertimeSaturday;
            effectiveMaxHoursOvertimeSaturday = this.shift.maxHoursOvertimeSaturday - (this.strikeNotifiedWeeksNb * this.params.strikeHoursPerSaturday);
            effectiveMaxHoursOvertimeSaturday *= (this.postesNb * this.shiftLevel);
            hoursNb = this.overtimeWorkedHoursNb < effectiveMaxHoursOvertimeSaturday ? this.overtimeWorkedHoursNb : effectiveMaxHoursOvertimeSaturday;
            if (hoursNb < 0) {
                hoursNb = 0;
            }
            return hoursNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "overtimeSundayWorkedHoursNb", {
        get: function () {
            var hoursNb, effectiveMaxHoursOvertimeSunday;
            hoursNb = this.overtimeWorkedHoursNb - this.overtimeSaturdayWorkedHoursNb;
            if (hoursNb < 0) {
                hoursNb = 0;
            }
            // we can't exceed the max
            effectiveMaxHoursOvertimeSunday = this.shift.maxHoursOvertimeSunday - (this.strikeNotifiedWeeksNb * this.params.strikeHoursPerSunday);
            effectiveMaxHoursOvertimeSunday *= (this.postesNb * this.shiftLevel);
            hoursNb = hoursNb < effectiveMaxHoursOvertimeSunday ? hoursNb : effectiveMaxHoursOvertimeSunday;
            return hoursNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "overtimeIntensity", {
        get: function () {
            var intensity;
            var totalMaxOvertimeHours;
            totalMaxOvertimeHours = (this.shift.maxHoursOvertimeSaturday + this.shift.maxHoursOvertimeSunday) * this.postesNb * this.shiftLevel;
            // TODO: calc separate intensity for saturday and sunday with coefficient of rough
            intensity = this.overtimeWorkedHoursNb / totalMaxOvertimeHours;
            return intensity;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "workedWeeksNb", {
        get: function () {
            var effectiveMaxHoursWeekDays = (this.shift.maxHoursWeekDays - (this.strikeNotifiedWeeksNb * this.params.strikeHoursPerWeekDays)) * (this.postesNb * this.shiftLevel);
            var maxHoursWeekDaysPerWeek = effectiveMaxHoursWeekDays / this.shift.weeksWorkedByPeriod;
            var workedWeekDaysWeeksNb = Math.ceil(this.weekDaysWorkedHoursNb / maxHoursWeekDaysPerWeek);
            return workedWeekDaysWeeksNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "spaceUsed", {
        get: function () {
            return this.params.spaceNeeded * this.employeesNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "CO2PrimaryFootprintHeat", {
        get: function () {
            return this.workedTotaHoursNb * this.params.CO2Footprint.kwh;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "CO2PrimaryFootprintWeight", {
        get: function () {
            return this.CO2PrimaryFootprintHeat * 0.00052;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "CO2PrimaryFootprintOffsettingCost", {
        get: function () {
            return Math.round(this.CO2PrimaryFootprintWeight * this.params.CO2Footprint.offsettingPerTonneRate);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "externalWorkersCost", {
        // costs
        get: function () {
            var totalCost;
            var basicRate = this.hourlyWageRate;
            var adjustedRate;
            if (basicRate < this.params.minHourlyWageRate) {
                basicRate = this.params.minHourlyWageRate;
            }
            adjustedRate = basicRate * (1 + this.params.externalWorkersPremium);
            totalCost = this.sicknessHoursNb * adjustedRate;
            return totalCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "wages", {
        get: function () {
            var wages, minSalary, weekDaysWorkedHoursNb, basicRate, weekDaysWage, saturdayWage, sundayWage, avgSalary, inactivesSalaries;
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
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "avgWagePerWorkerPerWeekWorked", {
        get: function () {
            var avgWagePerWorker = this.wages / this.employeesNb;
            var avgWagePerWorkerPerWeekWorked = avgWagePerWorker / this.workedWeeksNb;
            return Math.ceil(avgWagePerWorkerPerWeekWorked);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "avgEarnings", {
        get: function () {
            return this.wages / this.employeesNb;
        },
        enumerable: true,
        configurable: true
    });
    // Actions
    Worker.prototype.work = function (hoursNb) {
        if (!this.initialised) {
            console.log('not initialised');
            return false;
        }
        if (!this.ready) {
            console.log('not ready');
            return false;
        }
        var success = true;
        if (isNaN(hoursNb) || !isFinite(hoursNb)) {
            console.log('Machine @ Quantity not reel', arguments);
            return false;
        }
        // sorry we have limited capacity
        if ((this._workedTotaHoursNb + hoursNb) > this.effectiveAvailableTotalHoursNb) {
            console.log('Il ne reste pas de Heures de MOD');
            return false;
        }
        this._workedTotaHoursNb += hoursNb;
        return true;
    };
    Object.defineProperty(Worker.prototype, "adjustedWages", {
        get: function () {
            // fire this event so we can control remunerations by management
            this.onPay();
            if (this.adjustedAvgEarnings === this.avgEarnings) {
                return this.wages;
            }
            return this.adjustedAvgEarnings * this.workedWeeksNb * this.employeesNb;
        },
        enumerable: true,
        configurable: true
    });
    Worker.prototype.pay = function (hourlyWageRate) {
        if (!this.initialised) {
            console.log('not initialised');
            return false;
        }
        var basicRate = hourlyWageRate * this.params.skilledRateOfPay;
        if (basicRate < this.params.minHourlyWageRate) {
            basicRate = this.params.minHourlyWageRate;
        }
        this.hourlyWageRate = basicRate;
    };
    Worker.prototype.setShift = function (shiftLevel) {
        this.shiftLevel = shiftLevel;
        this.shift = this.params.availablesShifts[shiftLevel - 1];
        this.getReady();
    };
    Worker.prototype.getEndState = function () {
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
    };
    return Worker;
})(Employee.Employee);
module.exports = Worker;
//# sourceMappingURL=Worker.js.map