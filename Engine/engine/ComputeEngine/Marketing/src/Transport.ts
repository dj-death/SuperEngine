import Market = require('./Market');

import ObjectsManager = require('../../ObjectsManager');

import console = require('../../../../utils/logger');

import CashFlow = require('../../Finance/src/CashFlow');

import ENUMS = require('../../ENUMS');


interface TransportParams {
    id: string;
    shipmentDistance: number;
    distanceLimit: number;

    mixedLoads: boolean;

    costs: {
        containerDailyHireCost: number;
        containerShipmentCost: number;
        productStorageCost: number;
    };

    payments: ENUMS.PaymentArray;
}



class Transport {
    private initialised: boolean;

    params: TransportParams;

    market: Market;

    constructor(params: TransportParams) {
        this.params = params;
    }

    init(market: Market) {
        this.reset();

        this.market = market;

        this.initialised = true;

        ObjectsManager.register(this, "marketing");
    }

    reset() {
        this.totalContainersNb = 0;

        this.initialised = false;
    }

    totalContainersNb: number;

    get containerDaysNb(): number {
        return Math.ceil(this.journeyLength / this.params.distanceLimit) * this.loadsNb;
    }

    // results
    get loadsNb(): number {
        return Math.ceil(this.totalContainersNb);
    }

    get journeyLength(): number {
        return this.params.shipmentDistance * 2;
    }

    // cost
    get hiredTransportCost(): number {
        var cost = 0;
        cost += this.containerDaysNb * this.params.costs.containerDailyHireCost;
        cost += this.loadsNb * this.params.costs.containerShipmentCost;

        return cost;
    }


    load(containersNb: number) {
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }

        if (! this.params.mixedLoads) {
            containersNb = Math.ceil(containersNb); // forget me 0.5 container no just integral containers
        }

        this.totalContainersNb += containersNb;
    }

    onFinish() {
        CashFlow.addPayment(this.hiredTransportCost, this.params.payments);

        console.log("Trs", this.hiredTransportCost); 
    }

    getEndState(): any {

        var result = {};

        var state = {
            "journeyLength": this.journeyLength,
            "loadsNb": this.loadsNb
        };

        for (var key in state) {
            if (!state.hasOwnProperty(key)) {
                continue;
            }

            var prop = this.params.id + "_";
            prop += key;

            result[prop] = state[key];
        }

        return result;

    }
}

export = Transport;