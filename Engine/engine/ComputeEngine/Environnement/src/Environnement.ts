import Economy = require('./Economy');
import Currency = require('./Currency');
import MaterialMarket = require('./MaterialMarket');

import Utils = require('../../../../utils/Utils');
import console = require('../../../../utils/logger');


class Environnement {
    private static _instance: Environnement = null;

    private economies: Economy[] = [];
    private currencies: Currency[] = [];
    private materialsMarkets: MaterialMarket[] = [];

    public static init() {
        if (Environnement._instance) {
            delete Environnement._instance;
        }

        Environnement._instance = new Environnement();
    }


    constructor() {
        if (Environnement._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }

        Environnement._instance = this;
    }

    public static getInstance(): Environnement {
        if (Environnement._instance === null) {
            Environnement._instance = new Environnement();
        }
        return Environnement._instance;
    }

    public static register(object) {

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

    }


    // results
    /*get productsProducedNb(): number {
        return Utils.sums(this.products, "producedNb");
    }*/

   

    public static getEndState(): any {
        var that = this.getInstance();
        var proto = this.prototype;
        var endState = {};

        for (var key in proto) {
            endState[key] = that[key];
        }

        return endState;

    }
}

export = Environnement; 