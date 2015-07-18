var ObjectsManager = require('../../ObjectsManager');
var Transport = (function () {
    function Transport(params) {
        this.params = params;
    }
    Transport.prototype.init = function (market) {
        this.reset();
        this.market = market;
        this.initialised = true;
        ObjectsManager.register(this, "marketing");
    };
    Transport.prototype.reset = function () {
        this.totalContainersNb = 0;
        this.initialised = false;
    };
    Object.defineProperty(Transport.prototype, "containerDaysNb", {
        get: function () {
            return Math.ceil(this.journeyLength / this.params.distanceLimit) * this.loadsNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transport.prototype, "loadsNb", {
        // results
        get: function () {
            return Math.ceil(this.totalContainersNb);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transport.prototype, "journeyLength", {
        get: function () {
            return this.params.shipmentDistance * 2;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transport.prototype, "hiredTransportCost", {
        // cost
        get: function () {
            var cost = 0;
            cost += this.containerDaysNb * this.params.costs.containerDailyHireCost;
            cost += this.loadsNb * this.params.costs.containerShipmentCost;
            return cost;
        },
        enumerable: true,
        configurable: true
    });
    Transport.prototype.load = function (containersNb) {
        if (!this.initialised) {
            console.log('not initialised');
            return false;
        }
        if (!this.params.mixedLoads) {
            containersNb = Math.ceil(containersNb); // forget me 0.5 container no just integral containers
        }
        this.totalContainersNb += containersNb;
    };
    Transport.prototype.getEndState = function () {
        var result = {};
        var state = {
            "journeyLength": this.journeyLength,
            "loadsNb": this.loadsNb
        };
        for (var key in state) {
            if (!state.hasOwnProperty(key)) {
                continue;
            }
            var prop = this.params.id + "_";
            prop += key;
            result[prop] = state[key];
        }
        return result;
    };
    return Transport;
})();
module.exports = Transport;
//# sourceMappingURL=Transport.js.map