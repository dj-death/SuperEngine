var ObjectsManager = require('../../ObjectsManager');
var Equity = (function () {
    function Equity(params) {
        this.params = params;
    }
    Equity.prototype.init = function () {
        this.reset();
        this.initialised = true;
        ObjectsManager.register(this, "finance");
    };
    Equity.prototype.reset = function () {
        this.initialised = false;
    };
    return Equity;
})();
module.exports = Equity;
//# sourceMappingURL=Equity.js.map