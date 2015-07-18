var Insurance = require('./Insurance');
var Finance = (function () {
    function Finance() {
        if (Finance._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }
        Finance._instance = this;
    }
    Finance.init = function () {
        if (Finance._instance) {
            delete Finance._instance;
        }
        Finance._instance = new Finance();
    };
    Finance.getInstance = function () {
        if (Finance._instance === null) {
            Finance._instance = new Finance();
        }
        return Finance._instance;
    };
    Finance.register = function (objects) {
        var that = this.getInstance(), i = 0, len = objects.length, object;
        for (; i < len; i++) {
            object = objects[i];
            if (object instanceof Insurance) {
                that.insurance = object;
            }
        }
    };
    Finance.getEndState = function () {
        var that = this.getInstance();
        var proto = this.prototype;
        var endState = {};
        for (var key in proto) {
            endState[key] = that[key];
        }
        return endState;
    };
    Finance._instance = null;
    return Finance;
})();
module.exports = Finance;
//# sourceMappingURL=Finance.js.map