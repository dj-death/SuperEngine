import ObjectsManager = require('../../ObjectsManager');

import console = require('../../../../utils/logger');


import Economy = require('./Economy');

interface CentralBankParams {
    id: string;
    isMoneyMarketStable: boolean;
}


class CentralBank {
    private initialised: boolean = false;

    private params: CentralBankParams;

    economy: Economy;

    initialInterestBaseRate: number;

    private _interestBaseRate: number;

    constructor(params: CentralBankParams) {
        this.params = params;
    }

    init(lastInterestBaseRate: number) {
        this.reset();

        this.initialInterestBaseRate = lastInterestBaseRate;

        this.initialised = true;

        ObjectsManager.register(this, "environnement", true);
    }

    reset() {
        this.initialInterestBaseRate = undefined;
        this._interestBaseRate = undefined;

        this.initialised = false;
    }

    // result
    get interestBaseRate() {
        return this._interestBaseRate;
    }

    // action
    simulate() {
        if (this.params.isMoneyMarketStable) {
            this._interestBaseRate = this.initialInterestBaseRate;
            return;
        }

        // TEst Purposes
        this._interestBaseRate = 0.015;
    }
}

export = CentralBank;