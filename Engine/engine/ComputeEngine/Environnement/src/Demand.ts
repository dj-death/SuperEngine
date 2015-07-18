import ObjectsManager = require('../../ObjectsManager');


interface CustomerPreferences {
    pricePrefs: {
        priceFloor: number;
        priceNormal: number;
        priceCeiling: number;
    }
}

interface DemandParams {
    customerPreferences: CustomerPreferences;
}

class Demand {
    private initialised: boolean;

    private params: DemandParams;

    constructor(params: DemandParams) {
        this.params = params;
    }

    init() {
        this.initialised = true;

        ObjectsManager.register(this, "environnement", true);
    }

    // actions
    order(quantity: number) {

    }
    
}

export = Demand;