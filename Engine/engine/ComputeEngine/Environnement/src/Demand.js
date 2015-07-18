var ObjectsManager = require('../../ObjectsManager');
var Demand = (function () {
    function Demand(params) {
        this.params = params;
    }
    Demand.prototype.init = function () {
        this.initialised = true;
        ObjectsManager.register(this, "environnement", true);
    };
    // actions
    Demand.prototype.order = function (quantity) {
    };
    return Demand;
})();
module.exports = Demand;
//# sourceMappingURL=Demand.js.map