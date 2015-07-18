var ENUMS = require('../../ENUMS');
var Utils = require('../../../../utils/Utils');
var ObjectsManager = require('../../ObjectsManager');
var Machine = (function () {
    function Machine(machineParams) {
        this.Insurance = null;
        this.lostNb = 0;
        this.params = machineParams;
    }
    Machine.prototype.init = function (availablesMachinesNb, machinesStats, machineryLastNetValue) {
        this.reset();
        this.availablesAtStartNb = availablesMachinesNb;
        this.machinesNb = availablesMachinesNb;
        this.machineryLastNetValue = machineryLastNetValue;
        this.machinesStats = machinesStats;
        // now you can power machines
        this.initialised = true;
        this.workedHoursNb = 0;
        ObjectsManager.register(this, "production");
    };
    Machine.prototype.reset = function () {
        this.machinesStats = [];
        this.effectiveBoughtNb = 0;
        this.effectiveSoldNb = 0;
        this.lostNb = 0;
        this.onReady = function () {
        };
        this.onFinish = function () {
        };
        this.initialised = false;
    };
    Object.defineProperty(Machine.prototype, "availablesNextPeriodNb", {
        get: function () {
            return this.availablesAtStartNb + this.effectiveBoughtNb - this.effectiveSoldNb - this.lostNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "maintenanceHoursNb", {
        get: function () {
            return this.maintenancePlannedHoursNb - this.breakdownHoursNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "machineEfficiencyAvg", {
        get: function () {
            // var avg = Utils.sums(this.machinesStats, "efficiency", "active", true) / this.machinesNb;
            var avg = Utils.sums(this.machinesStats, "efficiency") / this.machinesStats.length;
            if (avg > 1) {
                console.log("something strange you have efficienct > than 1", avg);
            }
            return avg + 0.002; // for test
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "spaceUsed", {
        get: function () {
            return this.params.spaceNeeded * this.machinesNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "disposalValue", {
        get: function () {
            return this.effectiveSoldNb * this.params.disposalPrice;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "acquisitionCost", {
        // costs
        get: function () {
            return this.effectiveBoughtNb * this.params.acquisitionPrice;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "powerCost", {
        get: function () {
            return this.params.costs.runningHour * Math.ceil(this.workedHoursNb);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "overheadsCost", {
        get: function () {
            return this.params.costs.overheads * this.machinesNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "supervisionCost", {
        get: function () {
            return this.params.costs.supervisionPerShift * this.shiftLevel;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "runningCost", {
        get: function () {
            return this.powerCost + this.overheadsCost + this.supervisionCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "decommissioningCost", {
        get: function () {
            return this.params.costs.decommissioning * this.effectiveSoldNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "maintenanceCost", {
        get: function () {
            var cost;
            cost = this.maintenancePlannedHoursNb * this.params.costs.maintenanceHourlyCost;
            cost += this.maintenanceOverContractedHoursNb * this.params.costs.overContractedMaintenanceHourlyCost;
            return cost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "theoreticalAvailableHoursNb", {
        get: function () {
            return (this.machinesNb * this.machineCapacity);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "effectiveAvailableHoursNb", {
        get: function () {
            var value;
            value = this.theoreticalAvailableHoursNb - this.maintenancePlannedHoursNb - this.maintenanceOverContractedHoursNb;
            // check negative value and correct to 0
            value = value > 0 ? value : 0;
            return value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "CO2PrimaryFootprintHeat", {
        get: function () {
            return this.params.CO2Footprint.kwh * this.workedHoursNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "CO2PrimaryFootprintWeight", {
        get: function () {
            return this.CO2PrimaryFootprintHeat * 0.00052;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "CO2PrimaryFootprintOffsettingCost", {
        get: function () {
            return Math.round(this.CO2PrimaryFootprintWeight * this.params.CO2Footprint.offsettingPerTonneRate);
        },
        enumerable: true,
        configurable: true
    });
    // helper
    Machine.prototype._getBreakdownHoursNb = function () {
        var landa = (this.params.breakdownProba / 100) * this.machineCapacity, value = 0, i = 0;
        for (; i < this.machinesNb; i++) {
            value += Utils.getPoisson(landa);
        }
        return value;
    };
    Object.defineProperty(Machine.prototype, "stats", {
        get: function () {
            var stats, item;
            var i = 0, nb = this.machinesStats.length;
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
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "machineryRawValue", {
        get: function () {
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
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "depreciation", {
        get: function () {
            var depreciation = this.machineryRawValue * this.params.depreciationRate;
            return Math.floor(depreciation);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "machineryNetValue", {
        get: function () {
            return this.machineryRawValue - this.depreciation;
        },
        enumerable: true,
        configurable: true
    });
    // Actions
    Machine.prototype.setShiftLevel = function (shiftLevel) {
        this.shiftLevel = shiftLevel;
        this.machineCapacity = this.params.machineCapacityByShift[shiftLevel - 1];
        this.operatorsNb = this.params.machineOperatorsNeededNb[shiftLevel - 1] * this.machinesNb;
        this.breakdownHoursNb = this._getBreakdownHoursNb();
        this.repair(this.breakdownHoursNb);
        this.onReady();
    };
    Machine.prototype.on = function (eventName, callback, scope) {
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
    Machine.prototype.onReady = function () {
    };
    Machine.prototype.onFinish = function () {
    };
    Machine.prototype.power = function (hoursNb) {
        if (!this.initialised) {
            console.log('not initialised');
            return false;
        }
        if (isNaN(hoursNb) || !isFinite(hoursNb)) {
            console.log('Machine @ Quantity not reel', arguments);
            return false;
        }
        var succes = true, effectiveTime;
        effectiveTime = hoursNb / this.machineEfficiencyAvg;
        this.workedHoursNb += effectiveTime;
        // sorry we have limited capacity
        if (this.workedHoursNb > this.effectiveAvailableHoursNb) {
            this.workedHoursNb -= effectiveTime;
            succes = false;
        }
        return succes;
    };
    Machine.prototype.buy = function (boughtNb) {
        if (!this.initialised) {
            console.log('not initialised');
            return false;
        }
        // decision
        this.boughtNb = boughtNb;
        // till now
        // TODO develop it
        this.effectiveBoughtNb = boughtNb;
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
    };
    Machine.prototype.sell = function (soldNb) {
        if (!this.initialised) {
            console.log('not initialised');
            return false;
        }
        this.soldNb = soldNb;
        // TODO implment
        this.effectiveSoldNb = soldNb;
        for (var i = 0; i < this.effectiveSoldNb; i++) {
            // removes the first elements which means oldest machines
            this.machinesStats[i].active = this.params.decommissioningTime === ENUMS.DELIVERY.IMMEDIATE;
            this.machinesStats[i].lastUse = true;
        }
        if (this.params.decommissioningTime === ENUMS.DELIVERY.IMMEDIATE) {
            this.machinesNb -= soldNb;
        }
    };
    Machine.prototype.repair = function (breakdownHoursNb) {
        this.maintenanceOverContractedHoursNb = breakdownHoursNb - this.maintenancePlannedHoursNb;
        if (this.maintenanceOverContractedHoursNb < 0) {
            this.maintenanceOverContractedHoursNb = 0;
        }
        return true;
    };
    Machine.prototype.doMaintenance = function (hoursByMachineNb) {
        var operationValue;
        this.maintenancePlannedHoursNb = hoursByMachineNb * this.machinesNb;
        return true;
    };
    Machine.prototype.getEndState = function () {
        // finish everything for sync
        this.onFinish();
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
    };
    return Machine;
})();
module.exports = Machine;
//# sourceMappingURL=Machine.js.map