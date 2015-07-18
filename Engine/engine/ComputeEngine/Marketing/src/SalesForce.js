var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Employee = require('../../Personnel/src/Employee');
var ObjectsManager = require('../../ObjectsManager');
var SalesForce = (function (_super) {
    __extends(SalesForce, _super);
    function SalesForce(params) {
        _super.call(this, params);
    }
    // helpers
    SalesForce.prototype.init = function (availablesAgentsNb, labourPool, market) {
        this.reset();
        _super.prototype.init.call(this, availablesAgentsNb, labourPool);
        this.market = market;
        ObjectsManager.register(this, "marketing");
    };
    SalesForce.prototype.reset = function () {
        this.initialised = false;
    };
    Object.defineProperty(SalesForce.prototype, "supportCost", {
        // result
        // costs
        get: function () {
            return this.supportPerAgent * this.employeesNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SalesForce.prototype, "totalCost", {
        get: function () {
            return this.supportCost + this.commissionsCost + this.personnelCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SalesForce.prototype, "commissionsCost", {
        get: function () {
            var commissionsBase, salesRevenue, ordersValue, commissions;
            salesRevenue = this.market.salesRevenue;
            ordersValue = this.market.ordersValue;
            commissionsBase = this.params.isCommissionsBasedOnOrders ? ordersValue : salesRevenue;
            commissions = Math.round(commissionsBase * this.commissionRate);
            return commissions;
        },
        enumerable: true,
        configurable: true
    });
    // actions
    SalesForce.prototype.appoint = function (appointedNb, supportPerAgent, commissionRate) {
        this.appointedNb = appointedNb;
        this.commissionRate = commissionRate;
        this.supportPerAgent = supportPerAgent < this.params.costs.minSupportPerAgent ? this.params.costs.minSupportPerAgent : supportPerAgent;
        if (this.employeesNb < appointedNb) {
            this.recruit(appointedNb - this.employeesNb);
        }
        if (this.employeesNb > appointedNb) {
            this.dismiss(this.employeesNb - appointedNb);
        }
        return true;
    };
    SalesForce.prototype.getEndState = function () {
        var result = {};
        var state = {
            "effectiveAppointedNb": this.appointedNb,
            "resignedNb": this.resignedNb,
            "availablesNextPeriodNb": this.availablesNextPeriodNb
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
    return SalesForce;
})(Employee.Employee);
module.exports = SalesForce;
//# sourceMappingURL=SalesForce.js.map