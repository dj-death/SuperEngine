var Utils = require('../../../../utils/Utils');
var Market = require('./Market');
var SalesOffice = require('./SalesOffice');
var Transport = require('./Transport');
var Intelligence = require('./Intelligence');
var SalesForce = require('./SalesForce');
var ECommerce = require('./ECommerce');
var Marketing = (function () {
    function Marketing() {
        this.markets = [];
        this.transports = [];
        this.salesForces = [];
        if (Marketing._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }
        Marketing._instance = this;
    }
    Marketing.init = function () {
        if (Marketing._instance) {
            delete Marketing._instance;
        }
        Marketing._instance = new Marketing();
    };
    Marketing.getInstance = function () {
        if (Marketing._instance === null) {
            Marketing._instance = new Marketing();
        }
        return Marketing._instance;
    };
    Marketing.register = function (objects) {
        var that = this.getInstance(), i = 0, len = objects.length, object;
        for (; i < len; i++) {
            object = objects[i];
            if (object instanceof Market) {
                that.markets.push(object);
            }
            else if (object instanceof Intelligence) {
                that.intelligence = object;
            }
            else if (object instanceof ECommerce) {
                that.eCommerce = object;
            }
            else if (object instanceof Transport) {
                that.transports.push(object);
            }
            else if (object instanceof SalesOffice) {
                that.salesOffice = object;
            }
            else if (object instanceof SalesForce) {
                that.salesForces.push(object);
            }
        }
    };
    Object.defineProperty(Marketing.prototype, "advertisingCost", {
        // results
        get: function () {
            return Utils.sums(this.markets, "advertisingCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marketing.prototype, "productsInventoriesValue", {
        get: function () {
            return Utils.sums(this.markets, "stockValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marketing.prototype, "hiredTransportCost", {
        get: function () {
            return Utils.sums(this.transports, "hiredTransportCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marketing.prototype, "salesForceCost", {
        get: function () {
            return Utils.sums(this.salesForces, "totalCost", "params.isECommerceDistributor", false);
        },
        enumerable: true,
        configurable: true
    });
    Marketing.getEndState = function () {
        var that = this.getInstance();
        var proto = this.prototype;
        var endState = {};
        var value;
        for (var key in proto) {
            value = that[key];
            if (typeof value === "object" || typeof value === "function") {
                continue;
            }
            endState[key] = value;
        }
        return endState;
    };
    Marketing._instance = null;
    return Marketing;
})();
module.exports = Marketing;
//# sourceMappingURL=Marketing.js.map