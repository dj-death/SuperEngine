import ObjectsManager = require('../../ObjectsManager');
import console = require('../../../../utils/logger');


interface IntelligenceParam {
    costs: {
        marketSharesInfoCost: number;
        competitorsInfoCost: number;
    }
}

class Intelligence {
    private initialised: boolean;

    params: IntelligenceParam;

    constructor(params: IntelligenceParam) {
        this.params = params;
    }

    // helpers
    init() {
        this.reset();

        this.initialised = true;

        ObjectsManager.register(this, "marketing");
    }

    reset() {
        this.initialised = false;
    }

    // decisions
    isMarketSharesInfoCommissioned: boolean;
    isCompetitorsInfoCommissioned: boolean;


    // results
    get BusinessIntelligenceCost(): number {
        var totalCost = 0;

        if (this.isMarketSharesInfoCommissioned) {
            totalCost += this.params.costs.marketSharesInfoCost;
        }

        if (this.isCompetitorsInfoCommissioned) {
            totalCost += this.params.costs.competitorsInfoCost;
        }

        return totalCost;
    }


    // actions
    commissionMarketSharesInfo(isCommissioned: boolean) {
        this.isMarketSharesInfoCommissioned = isCommissioned;
    }

    commissionCompetitorsInfo(isCommissioned: boolean) {
        this.isCompetitorsInfoCommissioned = isCommissioned;
    }

    getEndState(): any {
        var state = {
            "BusinessIntelligenceCost": this.BusinessIntelligenceCost
        };

        return state;

    }
}

export = Intelligence; 