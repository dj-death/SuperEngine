import ENUMS = require('../../ENUMS');

import Utils = require('../../../../utils/Utils');
import console = require('../../../../utils/logger');

import Insurance = require('../../Finance/src/Insurance');


import ObjectsManager = require('../../ObjectsManager');

interface WarehouseParams {
    lostProbability: number;

    costs: {
        storageUnitCost: number;
        externalStorageUnitCost: number;
        fixedAdministrativeCost: number;
    }
}

interface StockedItem {
    params: {
        spaceNeeded: number;
    }

    inventoryUnitValue?: number;
}

class Warehouse {
    protected initialised: boolean;

    stockedItem: StockedItem;

    params: WarehouseParams;

    Insurance: Insurance = null;

    constructor(warehouseParams: WarehouseParams, stockedItem: StockedItem = null) {
        this.params = warehouseParams;

        this.stockedItem = stockedItem;
    }

    // TODO: implement
    _calcMaterialLostUnitsOfThis(quantity: number): number {
        var lostQ: number,
            probability: number,
            landa: number;

        // based on ??,,
        probability = this.params.lostProbability * Math.random();

        landa = probability * quantity;
        lostQ = Math.round(Utils.getPoisson(landa));


        // reduce the quantity of stock
        if (this.availableQ < lostQ) {
            lostQ = this.availableQ;
        }

        this.availableQ -= lostQ;

        return lostQ;
    }

    init(openingQ: number, openingValue: number = 0,
                                                beforeLastPCommand6MthQ: number = 0, beforeLastPCommand6MthValue: number = 0,
                                                lastPCommand3MthQ: number = 0, lastPCommand3MthValue: number = 0,
                                                lastPCommand6MthQ: number = 0, lastPCommand6MthValue: number = 0) {
        this.reset();

        this.openingQ = openingQ;
        this.openingValue = openingValue;

        this.availableQ = openingQ;

        // let's begin
        this.initialised = true;


        // calc the lostQ and by the way diminuish the stock with loss
        this.lostQ = this._calcMaterialLostUnitsOfThis(this.openingQ);


        // the delivery from the last period comes so add it
        this.presentDeliveryBoughtLastPQ = lastPCommand3MthQ;
        this.presentDeliveryBoughtLastPValue = lastPCommand3MthValue;

        this.moveIn(this.presentDeliveryBoughtLastPQ, this.presentDeliveryBoughtLastPValue, ENUMS.FUTURES.IMMEDIATE);

        // the delivery from before last period comes so add it
        this.presentDeliveryBoughtBeforeLastPQ = beforeLastPCommand6MthQ;
        this.presentDeliveryBoughtBeforeLastPValue = beforeLastPCommand6MthValue;

        this.moveIn(this.presentDeliveryBoughtBeforeLastPQ, this.presentDeliveryBoughtBeforeLastPValue, ENUMS.FUTURES.IMMEDIATE);

        this.deliveryNextPBoughtBeforeLastPQ = lastPCommand6MthQ;
        this.deliveryNextPBoughtBeforeLastPValue = lastPCommand6MthValue;

        this.deliveryNextPQ = this.deliveryNextPBoughtBeforeLastPQ;
        this.deliveryNextPValue = this.deliveryNextPBoughtBeforeLastPValue;

        ObjectsManager.register(this, "production");
    }


    reset() {

        this.outQ = 0;
        this.inQ = 0;
        this.inValue = 0;

        this.waitNextPeriodQ = 0;
        this.waitAfterNextPeriodQ = 0;

        this.deliveryAfterNextPQ = 0;
        this.deliveryAfterNextPValue = 0;

        this.shortfallQ = 0;

        this.lostQ = 0;

        this.initialised = false;
    }

    // result
    availableQ;

    openingQ;
    openingValue;

    outQ;

    inQ;
    inValue;

    waitNextPeriodQ;
    waitAfterNextPeriodQ;

    presentDeliveryBoughtLastPQ: number;
    presentDeliveryBoughtLastPValue: number;

    presentDeliveryBoughtBeforeLastPQ: number;
    presentDeliveryBoughtBeforeLastPValue: number;

    deliveryNextPBoughtBeforeLastPQ: number;
    deliveryNextPBoughtBeforeLastPValue: number;

    deliveryNextPQ: number;
    deliveryNextPValue: number;

    deliveryAfterNextPQ;
    deliveryAfterNextPValue;

    // rupture de stock
    shortfallQ;

    lostQ;

    get spaceUsed(): number {
        return this.closingQ * (this.stockedItem && this.stockedItem.params.spaceNeeded || 0);
    }

    get closingQ(): number {
        return this.openingQ + this.inQ - this.outQ;
    }

    get unitValue(): number {

        if (this.stockedItem && this.stockedItem.inventoryUnitValue) {
            return this.stockedItem.inventoryUnitValue;
        }

        var cmup = (this.openingValue + this.inValue) / (this.openingQ + this.inQ);

        return cmup;
    }

    get closingValue(): number {
        return this.closingQ * this.unitValue;
    }

    get averageStock(): number {
        return (this.openingValue + this.closingValue) * 0.5;
    }

    get externalStock(): number {
        return 0;
    }

    get storageCost(): number {
        return (this.closingQ - this.externalStock) * this.params.costs.storageUnitCost;
    }

    get externalStorageCost(): number {
        return this.externalStock * this.params.costs.externalStorageUnitCost;
    }

    get administrativeCost(): number {
        return this.params.costs.fixedAdministrativeCost;
    }

    get warehousingCost(): number {
        return this.administrativeCost + this.storageCost;
    }

    get availableNextPeriodQ(): number {
        return this.closingQ + this.deliveryNextPQ;
    }


    // actions
    moveOut(quantity, acceptCommandWhateverHappens: boolean = false): number { // the returned value it's what we could give u
        if (!this.initialised) {
            console.debug('not initialised');
            return 0;
        }

        if (isNaN(quantity) || !isFinite(quantity)) {
            console.debug('Warehouse @ Quantity not reel', arguments);
            return 0;
        }

        if (this.availableQ < quantity) {
            console.debug('il ne reste rien dans le stock');

            this.shortfallQ += (quantity - this.availableQ);

            if (!acceptCommandWhateverHappens) {
                return this.availableQ;
            } else {
                // give you what we have
                quantity = this.availableQ;
            }

        }

        this.outQ += quantity;
        this.availableQ -= quantity;

        // we responde 100 % of your quantity requested
        return quantity;
    }

    moveIn(quantity: number, value: number = 0, term: ENUMS.FUTURES = ENUMS.FUTURES.IMMEDIATE): number {
        if (!this.initialised) {
            console.debug('not initialised');
            return 0;
        }

        if (isNaN(quantity) || !isFinite(quantity)) {
            console.debug('Warehouse @ Quantity not reel', arguments);
            return 0;
        }

        var lostQ = this._calcMaterialLostUnitsOfThis(this.inValue);
        switch (term) {
            case ENUMS.FUTURES.IMMEDIATE:
                this.inQ += quantity;
                this.availableQ += quantity;

                this.inValue += value;

                this.lostQ += lostQ;

                break;

            case ENUMS.FUTURES.THREE_MONTH:
                this.deliveryNextPQ += quantity;
                this.deliveryNextPValue += value;

                break;

            case ENUMS.FUTURES.SIX_MONTH:
                this.deliveryAfterNextPQ += quantity;
                this.deliveryAfterNextPValue += value;

                break;
        }

        return quantity - lostQ;
    }

}

export = Warehouse;