var ENUMS = require('../../../ComputeEngine/ENUMS');
var ObjectsManager = require('../../ObjectsManager');
var console = require('../../../../utils/logger');
var Supplier = (function () {
    function Supplier(supplierParams) {
        this.params = supplierParams;
    }
    Supplier.prototype.init = function (material, materialMarket) {
        this.reset();
        this.material = material;
        this.market = materialMarket;
        // now it's ok
        this.initialised = true;
        ObjectsManager.register(this, "environnement", true);
    };
    Supplier.prototype.reset = function () {
        this.initialised = false;
    };
    // helpers
    Supplier.prototype._getPrice = function (quality, term /*, credit: ENUMS.CREDIT*/) {
        var price, basePrice = this.market.getPrice(term) / this.market.params.standardLotQuantity, qualityPremium = this.params.availableQualities[ENUMS.QUALITY[quality]].premium;
        price = basePrice * (1 + qualityPremium);
        return price;
    };
    Supplier.prototype._getReelTimePrice = function (quality, term /*, credit: ENUMS.CREDIT*/) {
        var price, basePrice = this.market.getQuotedPrice(term) / this.market.params.standardLotQuantity, qualityPremium = this.params.availableQualities[ENUMS.QUALITY[quality]].premium;
        price = basePrice * (1 + qualityPremium);
        return price;
    };
    // actions
    Supplier.prototype.order = function (quantity, quality, term, isUnplannedPurchases) {
        if (quality === void 0) { quality = 1 /* MQ */; }
        if (term === void 0) { term = 0 /* IMMEDIATE */; }
        if (isUnplannedPurchases === void 0) { isUnplannedPurchases = false; }
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }
        if (!this.params.canUnplannedMaterialPurchases) {
            return false;
        }
        var orderValue, price;
        // 9di bli moujoud matmchich blach
        quality = this.params.availableQualities[ENUMS.QUALITY[quality]] !== undefined ? quality : ENUMS.QUALITY[Object.keys(this.params.availableQualities)[0]];
        term = this.params.availableFutures[ENUMS.FUTURES[term]] !== undefined ? term : ENUMS.FUTURES[Object.keys(this.params.availableFutures)[0]];
        if (isUnplannedPurchases) {
            price = this._getReelTimePrice(quality, term) * (1 + this.params.unplannedPurchasesPremium);
        }
        else {
            price = this._getPrice(quality, term);
        }
        orderValue = Math.ceil(price * quantity);
        this.material.supply(quantity, orderValue, term, isUnplannedPurchases);
        return true;
    };
    return Supplier;
})();
exports.Supplier = Supplier;
//# sourceMappingURL=Supplier.js.map