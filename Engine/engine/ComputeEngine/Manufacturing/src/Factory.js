var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Space = require('./Space');
var Utils = require('../../../../utils/Utils');
var ObjectsManager = require('../../ObjectsManager');
var Factory = (function (_super) {
    __extends(Factory, _super);
    function Factory() {
        _super.apply(this, arguments);
    }
    Factory.prototype.init = function (initialSize, land, lastFactoryNetValue, contractor, ateliers) {
        if (contractor === void 0) { contractor = null; }
        _super.prototype.init.call(this, initialSize, land, lastFactoryNetValue, contractor);
        this.ateliers = ateliers;
        // TODO: add stocks
        this.usedSpace = this.ateliersSpaceUsed;
        ObjectsManager.register(this, "production");
    };
    Object.defineProperty(Factory.prototype, "ateliersSpaceUsed", {
        get: function () {
            return Utils.sums(this.ateliers, "spaceUsed");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Factory.prototype, "circulationAndAccessSpace", {
        get: function () {
            return this.reservedSpace;
        },
        enumerable: true,
        configurable: true
    });
    Factory.prototype.getEndState = function () {
        var result = {};
        var state = {
            "availableSpace": this.availableSpace,
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
    return Factory;
})(Space);
module.exports = Factory;
//# sourceMappingURL=Factory.js.map