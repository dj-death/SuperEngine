import ENUMS = require('../../../ComputeEngine/ENUMS');
import RawMaterial = require('../../Manufacturing/src/RawMaterial');
import MaterialMarket = require('./MaterialMarket');

import ObjectsManager = require('../../ObjectsManager');


interface Quality {
    index: ENUMS.QUALITY;
    // will be fixed by market so we don't need to hard code it
    premium?: number;
}

interface QualitiesArray {
    [index: string]: Quality;
}

interface Payment {
    credit: ENUMS.CREDIT;
    part: number;
}

interface PaymentArray {
    [index: string]: Payment;
}


export interface SupplierParams {
    name: string;

    availableQualities: QualitiesArray;
    availableFutures: ENUMS.FuturesArray;
    payments: PaymentArray;

    interestRate: number;
    rebateRate: number;
    discountRate: number;

    deliveryDelai: ENUMS.DELIVERY;

    canUnplannedMaterialPurchases: boolean;
    unplannedPurchasesPremium: number;
}

interface Material {
    supply: (quantity: number, value: number, term: ENUMS.FUTURES, isUnplannedPurchases: boolean) => boolean;
}

export class Supplier<T extends Material> {
    protected initialised: boolean;

    params: SupplierParams;

    material: T;

    market: MaterialMarket;

    constructor(supplierParams: SupplierParams) {
        this.params = supplierParams;
    }

    init(material: T, materialMarket: MaterialMarket) {
        this.reset();

        this.material = material;

        this.market = materialMarket;
        // now it's ok
        this.initialised = true;

        ObjectsManager.register(this, "environnement", true);
    }

    reset() {
        this.initialised = false;
    }


    // helpers
    _getPrice(quality: ENUMS.QUALITY, term: ENUMS.FUTURES/*, credit: ENUMS.CREDIT*/): number {
        var price,
            basePrice = this.market.getPrice(term) / this.market.params.standardLotQuantity,
            qualityPremium = this.params.availableQualities[ENUMS.QUALITY[quality]].premium;
        
        price = basePrice * (1 + qualityPremium);

        return price;
    }


    _getReelTimePrice(quality: ENUMS.QUALITY, term: ENUMS.FUTURES/*, credit: ENUMS.CREDIT*/): number {
        var price,
            basePrice = this.market.getQuotedPrice(term) / this.market.params.standardLotQuantity,
            qualityPremium = this.params.availableQualities[ENUMS.QUALITY[quality]].premium;

        price = basePrice * (1 + qualityPremium);

        return price;
    }

    // actions

    order(quantity: number, quality: ENUMS.QUALITY = ENUMS.QUALITY.MQ, term: ENUMS.FUTURES = ENUMS.FUTURES.IMMEDIATE, isUnplannedPurchases: boolean = false): boolean {
        if (!this.initialised) {
            console.log('not initialised');
            console.info(arguments);
            return false;
        }

        if (!this.params.canUnplannedMaterialPurchases) {
            return false;
        }

        var orderValue: number,
            price: number;

        // 9di bli moujoud matmchich blach
        quality = this.params.availableQualities[ENUMS.QUALITY[quality]] !== undefined ? quality : ENUMS.QUALITY[Object.keys(this.params.availableQualities)[0]];
        term = this.params.availableFutures[ENUMS.FUTURES[term]] !== undefined ? term : ENUMS.FUTURES[Object.keys(this.params.availableFutures)[0]];

        if (isUnplannedPurchases) {
            price = this._getReelTimePrice(quality, term) * (1 + this.params.unplannedPurchasesPremium);

        } else {
            price = this._getPrice(quality, term);
        }

        orderValue = Math.ceil(price * quantity);

        this.material.supply(quantity, orderValue, term, isUnplannedPurchases);

        return true;
    }
}
