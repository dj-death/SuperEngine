import ENUMS = require('../../../ComputeEngine/ENUMS');
import Economy = require("./Economy");

import ObjectsManager = require('../../ObjectsManager');
import console = require('../../../../utils/logger');




interface MaterialMarketParams {
    id: string;
    standardLotQuantity: number;

    arePricesStable: boolean;
}

class MaterialMarket {
    initialised: boolean;

    params: MaterialMarketParams;

    economy: Economy;

    private initialQuotedPrices: number[];

    constructor(params: MaterialMarketParams) {
        this.params = params;
    }

    init(economy: Economy, lastQuotedPrices: number[]) {
        this.reset();

        this.economy = economy;

        // we begin at the end of last so is the price of first day of period
        this.initialQuotedPrices = lastQuotedPrices;

        this.initialised = true;

        ObjectsManager.register(this, "environnement", true);
    }

    reset() {
        this.initialQuotedPrices = [];

        this._spotPrice = undefined;
        this._threeMthPrice = undefined;
        this._sixMthPrice = undefined;

        this.initialised = false;
    }

    private _spotPrice: number;
    private _threeMthPrice: number;
    private _sixMthPrice: number;

    // result
    // initial prices at local currency for standard lot
    getPrice(term: ENUMS.FUTURES = ENUMS.FUTURES.IMMEDIATE): number {
        if (!this.initialised) {
            return 0;
        }

        var price: number;

        var initialExchangeRate = this.economy.currency.initialExchangeRate;

        switch (term) {
            case ENUMS.FUTURES.SIX_MONTH:
                price = this.initialQuotedPrices[2] * initialExchangeRate;
                break;

            case ENUMS.FUTURES.THREE_MONTH:
                price = this.initialQuotedPrices[1] * initialExchangeRate;
                break;
                
            default:
                price = this.initialQuotedPrices[0] * initialExchangeRate;
        }

        return price;
    }


    // at reel time (for this period) at local currency for standard lot
    getQuotedPrice(term: ENUMS.FUTURES = ENUMS.FUTURES.IMMEDIATE): number {
        if (!this.initialised) {
            console.debug('MaterialMarket not initialised');
            return 0;
        }

        var price: number;

        var quotedExchangeRate = this.economy.currency.quotedExchangeRate; 

        switch (term) {
            case ENUMS.FUTURES.SIX_MONTH:
                price = this._sixMthPrice * quotedExchangeRate;
                break;

            case ENUMS.FUTURES.THREE_MONTH:
                price = this._threeMthPrice * quotedExchangeRate;
                break;

            default:
                price = this._spotPrice * quotedExchangeRate;
        }

        return price;
    }

    // action
    simulate() {
        if (this.params.arePricesStable) {
            this._spotPrice = this.initialQuotedPrices[0];
            this._threeMthPrice = this.initialQuotedPrices[1];
            this._sixMthPrice = this.initialQuotedPrices[2];

            return;
        }

        this._spotPrice = 37564;
        this._threeMthPrice = 33545;
        this._sixMthPrice = 31073;
    }

    getEndState(): any {
        var result = {};

        var state = {
            "spotPrice": this._spotPrice,
            "3mthPrice": this._threeMthPrice,
            "6mthPrice": this._sixMthPrice
        };

        for (var key in state) {
            if (!state.hasOwnProperty(key)) {
                continue;
            }

            var prop = this.params.id + "_" + key;
            result[prop] = state[key];
        }

        return result;
    }
}

export = MaterialMarket;