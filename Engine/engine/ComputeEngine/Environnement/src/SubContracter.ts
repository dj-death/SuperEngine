import Supplier = require('./Supplier');
import MaterialMarket = require('./MaterialMarket');
import RawMaterial = require('../../Manufacturing/src/RawMaterial');
import SemiProduct = require('../../../ComputeEngine/Manufacturing/src/SemiProduct');
import ENUMS = require('../../../ComputeEngine/ENUMS');

import ObjectsManager = require('../../ObjectsManager');

import console = require('../../../../utils/logger');



interface SubContracorParams extends Supplier.SupplierParams {
    manufacturingUnitCost: number;
}


class SubContracter extends Supplier.Supplier<SemiProduct> {
    params: SubContracorParams;

    private rawMaterialSupplier: Supplier.Supplier<RawMaterial>;
    private rawMaterialMarket: MaterialMarket;

    constructor(subContracorParams: SubContracorParams) {
        super(subContracorParams);

        this.params = subContracorParams;
    }

    init(semiProduct: SemiProduct, rawMaterialMarket: MaterialMarket, rawMaterialSupplier?: Supplier.Supplier<RawMaterial>) {
        this.reset();

        this.material = semiProduct;

        this.rawMaterialMarket = rawMaterialMarket;
        this.rawMaterialSupplier = rawMaterialSupplier;

        // now it's ok
        this.initialised = true;

        ObjectsManager.register(this, "environnement", true);
    }

    // helpers
    _getPrice(premiumQualityProp: number = 0): number {
        var rawMaterial_spotPrice = this.rawMaterialSupplier._getPrice(ENUMS.QUALITY.MQ, ENUMS.FUTURES.IMMEDIATE);
        var rawMaterial_spotHQPrice = this.rawMaterialSupplier._getPrice(ENUMS.QUALITY.HQ, ENUMS.FUTURES.IMMEDIATE);

        var component_materialConsoUnit = this.material.params.rawMaterialConsoCfg.consoUnit;

        var component_standardPrice = Math.floor(rawMaterial_spotPrice * component_materialConsoUnit) + this.params.manufacturingUnitCost;
        var component_HQPrice = Math.floor(rawMaterial_spotHQPrice * component_materialConsoUnit) + this.params.manufacturingUnitCost;
        
        // linear interpolation
        var price = component_standardPrice + ((premiumQualityProp - ENUMS.QUALITY.MQ) * (component_HQPrice - component_standardPrice)) / (ENUMS.QUALITY.HQ - ENUMS.QUALITY.MQ);

        return price;
    }

}

export = SubContracter;