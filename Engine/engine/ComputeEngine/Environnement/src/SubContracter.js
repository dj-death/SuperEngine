var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Supplier = require('./Supplier');
var ENUMS = require('../../../ComputeEngine/ENUMS');
var ObjectsManager = require('../../ObjectsManager');
var SubContracter = (function (_super) {
    __extends(SubContracter, _super);
    function SubContracter(subContracorParams) {
        _super.call(this, subContracorParams);
        this.params = subContracorParams;
    }
    SubContracter.prototype.init = function (semiProduct, rawMaterialMarket, rawMaterialSupplier) {
        this.reset();
        this.material = semiProduct;
        this.rawMaterialMarket = rawMaterialMarket;
        this.rawMaterialSupplier = rawMaterialSupplier;
        // now it's ok
        this.initialised = true;
        ObjectsManager.register(this, "environnement", true);
    };
    // helpers
    SubContracter.prototype._getPrice = function (premiumQualityProp) {
        if (premiumQualityProp === void 0) { premiumQualityProp = 0; }
        var rawMaterial_spotPrice = this.rawMaterialSupplier._getPrice(1 /* MQ */, 0 /* IMMEDIATE */);
        var rawMaterial_spotHQPrice = this.rawMaterialSupplier._getPrice(2 /* HQ */, 0 /* IMMEDIATE */);
        var component_materialConsoUnit = this.material.params.rawMaterialConsoCfg.consoUnit;
        var component_standardPrice = Math.floor(rawMaterial_spotPrice * component_materialConsoUnit) + this.params.manufacturingUnitCost;
        var component_HQPrice = Math.floor(rawMaterial_spotHQPrice * component_materialConsoUnit) + this.params.manufacturingUnitCost;
        // linear interpolation
        var price = component_standardPrice + ((premiumQualityProp - 1 /* MQ */) * (component_HQPrice - component_standardPrice)) / (2 /* HQ */ - 1 /* MQ */);
        return price;
    };
    return SubContracter;
})(Supplier.Supplier);
module.exports = SubContracter;
//# sourceMappingURL=SubContracter.js.map