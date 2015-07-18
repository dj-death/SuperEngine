import Demand = require('./Demand');
import Currency = require('./Currency');
import LabourPool = require('./LabourPool');
import CentralBank = require('./CentralBank');

import ObjectsManager = require('../../ObjectsManager');


interface EconomicsParams {
    id: string;

    name: string;

    population: number;
    initialGDPPerCapita: number;
    internetAccessPercent: number;
}

class Economy {
    private initialised: boolean;
    
    private demand: Demand;
    private labourPool: LabourPool;
    private centralBank: CentralBank;

    currency: Currency;

    params: EconomicsParams;



    constructor(params: EconomicsParams) {
        this.params = params;
    }

    init(labourPool: LabourPool, currency, centralBank: CentralBank = null) {
        this.labourPool = labourPool || new LabourPool();
        this.labourPool.init(this.params.population, this.params.population, this.params.population);
        this.currency = currency;

        this.centralBank = centralBank;
        if (this.centralBank) {
            this.centralBank.economy = this;
        }


        this.initialised = true;

        ObjectsManager.register(this, "environnement", true);
    }

    // results
    GDP: number;
    unemploymentRate: number;
    externalTradeBalance: number;
    interestBaseRate: number;
    exchangeRate: number;

    businessReport: string;

    // action
    simulate() {

        this.centralBank && this.centralBank.simulate();
        this.currency.simulate();
    }


    getEndState(): any {
        var result = {};

        var state = {
            "GDP": this.GDP,
            "unemploymentRatePerThousand": this.unemploymentRate,
            "externalTradeBalance": this.externalTradeBalance,

            "interestBaseRatePerThousand": this.centralBank && this.centralBank.interestBaseRate * 1000,

            "businessReport": this.businessReport,

            "exchangeRatePerCent": this.currency.quotedExchangeRate * 100
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

export = Economy;