var console = require('../../../../utils/logger');
var ObjectsManager = require('../../ObjectsManager');
var Atelier = (function () {
    function Atelier(atelierParams) {
        this.params = atelierParams;
    }
    Object.defineProperty(Atelier.prototype, "spaceUsed", {
        get: function () {
            var space;
            space = this.worker && this.worker.spaceUsed;
            space += this.machine && this.machine.spaceUsed;
            return space;
        },
        enumerable: true,
        configurable: true
    });
    // helper
    Atelier.prototype.init = function (worker, machine) {
        this.reset();
        this.worker = worker;
        this.machine = machine;
        // now let's work
        this.initialised = true;
        ObjectsManager.register(this, "production");
    };
    Atelier.prototype.reset = function () {
        this.workedHoursNb = 0;
        this.initialised = false;
    };
    Atelier.prototype.getNeededTimeForProd = function (quantity, manufacturingUnitTime) {
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
    };
    // actions
    Atelier.prototype.work = function (hoursNb) {
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }
        var success;
        // power machines
        success = this.machine && this.machine.power(hoursNb);
        if (!success && this.machine) {
            console.debug("Votre demande dépasse la capacité périodique des machines");
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
            console.debug("Votre demande dépasse la capacité périodique des ouvriers ", this.worker.params.label);
            console.debug("Nous lui avons demandés de travailler ", hoursNb, " hours");
            return false;
        }
        // now increment
        this.workedHoursNb += hoursNb;
        return success;
    };
    return Atelier;
})();
module.exports = Atelier;
//# sourceMappingURL=Atelier.js.map