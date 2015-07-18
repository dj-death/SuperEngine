var Economy = require('./Economy');
var Currency = require('./Currency');
var MaterialMarket = require('./MaterialMarket');
var Environnement = (function () {
    function Environnement() {
        this.economies = [];
        this.currencies = [];
        this.materialsMarkets = [];
        if (Environnement._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }
        Environnement._instance = this;
    }
    Environnement.init = function () {
        if (Environnement._instance) {
            delete Environnement._instance;
        }
        Environnement._instance = new Environnement();
    };
    Environnement.getInstance = function () {
        if (Environnement._instance === null) {
            Environnement._instance = new Environnement();
        }
        return Environnement._instance;
    };
    Environnement.register = function (object) {
        var that = this.getInstance();
        if (object instanceof Economy) {
            that.economies.push(object);
        }
        else if (object instanceof Currency) {
            that.currencies.push(object);
        }
        else if (object instanceof MaterialMarket) {
            that.materialsMarkets.push(object);
        }
    };
    // results
    /*get productsProducedNb(): number {
        return Utils.sums(this.products, "producedNb");
    }*/
    Environnement.getEndState = function () {
        var that = this.getInstance();
        var proto = this.prototype;
        var endState = {};
        for (var key in proto) {
            endState[key] = that[key];
        }
        return endState;
    };
    Environnement._instance = null;
    return Environnement;
})();
module.exports = Environnement;
//# sourceMappingURL=Environnement.js.map