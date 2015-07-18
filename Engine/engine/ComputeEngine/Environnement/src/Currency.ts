import ObjectsManager = require('../../ObjectsManager');


interface CurrencyParams {
    id: string;

    label: string;
    sign: string;

    // to see if the base
    isLocal: boolean;
}

class Currency {
    private initialised: boolean = false;
    private params: CurrencyParams;

    // last one not at reel time
    initialExchangeRate: number;

    _quotedExchangeRate: number;

    constructor(params: CurrencyParams) {
        this.params = params;
    }

    init(lastExchangeRate?: number) {
        this.reset();

        this.initialExchangeRate = this.params.isLocal ? 1 : lastExchangeRate; 
        this.initialised = true;

        ObjectsManager.register(this, "environnement", true);
    }

    reset() {
        this._quotedExchangeRate = undefined;
        this.initialExchangeRate = undefined;

        this.initialised = false;
    }

    // result
    get quotedExchangeRate() {
        return this._quotedExchangeRate;
    }

    // action
    simulate() {
        if (this.params.isLocal) {
            this._quotedExchangeRate = 1;

            return;
        }

        // TEst Purposes
        this._quotedExchangeRate = 1.15;
    }

    getEndState(): any {
        var result = {};

        var state = {
            "exchangeRatePerCent": this.quotedExchangeRate
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

export = Currency;