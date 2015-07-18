var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Space = require('./Space');
var Utils = require('../../../../utils/Utils');
var Land = (function (_super) {
    __extends(Land, _super);
    function Land() {
        _super.apply(this, arguments);
    }
    Land.prototype.init = function (initialSize, extraSpace, lastLandNetValue, contractor, factories) {
        if (contractor === void 0) { contractor = null; }
        _super.prototype.init.call(this, initialSize, extraSpace, lastLandNetValue, contractor);
        this.factories = factories;
        this.lastLandNetValue = lastLandNetValue;
        this.usedSpace = this.factoriesInitialSpace;
    };
    Object.defineProperty(Land.prototype, "accessAndParkingSpace", {
        get: function () {
            return this.reservedSpace;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Land.prototype, "factoriesInitialSpace", {
        get: function () {
            return Utils.sums(this.factories, "availableSpaceAtStart");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Land.prototype, "factoriesSpace", {
        get: function () {
            return Utils.sums(this.factories, "availableSpace");
        },
        enumerable: true,
        configurable: true
    });
    Land.prototype.getEndState = function () {
        var result = {};
        var state = {
            "availableSpace": this.availableSpace
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
    return Land;
})(Space);
module.exports = Land;
//# sourceMappingURL=Land.js.map