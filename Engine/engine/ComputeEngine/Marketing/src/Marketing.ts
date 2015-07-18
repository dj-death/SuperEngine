import Utils = require('../../../../utils/Utils');

import Market = require('./Market');
import SalesOffice = require('./SalesOffice');
import Transport = require('./Transport');
import Intelligence = require('./Intelligence');
import SalesForce = require('./SalesForce');
import ECommerce = require('./ECommerce');

class Marketing {
    private static _instance: Marketing = null;

    markets: Market[] = [];
    
    transports: Transport[] = [];
    salesForces: SalesForce[] = [];

    eCommerce: ECommerce;
    intelligence: Intelligence;
    salesOffice: SalesOffice;

    public static init() {
        if (Marketing._instance) {
            delete Marketing._instance;
        }

        Marketing._instance = new Marketing();
    }


    constructor() {
        if (Marketing._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }

        Marketing._instance = this;
    }

    public static getInstance(): Marketing {
        if (Marketing._instance === null) {
            Marketing._instance = new Marketing();
        }
        return Marketing._instance;
    }

    public static register(objects: any[]) {

        var that = this.getInstance(),
            i = 0,
            len = objects.length,
            object;

        for (; i < len; i++) {
            object = objects[i];

            if (object instanceof Market) {
                that.markets.push(object);

            }

            else if (object instanceof Intelligence) {
                that.intelligence = object;
            }

            else if (object instanceof ECommerce) {
                that.eCommerce = object;
            }

            else if (object instanceof Transport) {
                that.transports.push(object);
            }

            else if (object instanceof SalesOffice) {
                that.salesOffice = object;
            }

            else if (object instanceof SalesForce) {
                that.salesForces.push(object);
            }
        }
    }


    // results
    get advertisingCost(): number {
        return Utils.sums(this.markets, "advertisingCost");
    }

    get productsInventoriesValue(): number {
        return Utils.sums(this.markets, "stockValue");
    }

    get hiredTransportCost(): number {
        return Utils.sums(this.transports, "hiredTransportCost");
    }

    get salesForceCost(): number {
        return Utils.sums(this.salesForces, "totalCost", "params.isECommerceDistributor", false);
    }
    


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

export = Marketing; 