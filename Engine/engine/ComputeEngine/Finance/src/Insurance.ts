import ObjectsManager = require('../../ObjectsManager');

import Management = require('../../Personnel/src/Management');

import console = require('../../../../utils/logger');


interface InsurancePlanOptions {
    primaryRiskRate: number;
    premiumRate: number;
}

interface InsurancePlans {
    [index: string]: InsurancePlanOptions;
}

interface InsuranceParams {
    id: string;
    plans: InsurancePlans;

    forceMajeureSequence: number[];

    // at this level risk is 0
    optimalManagementBudget: number;
    normalManagementBudget: number;
}

class Insurance {
    private initialised: boolean;

    params: InsuranceParams;

    constructor(params: InsuranceParams) {
        this.params = params;
    }

    premiumsBase: number;

    private forceMajeure: number;

    management: Management;

    init(premiumsBase: number, currPeriod: number, management: Management) {
        this.reset();

        this.management = management;

        this.premiumsBase = premiumsBase;

        this.forceMajeure = this.params.forceMajeureSequence[currPeriod - 1] || 0;

        this.initialised = true;

        ObjectsManager.register(this, "finance");
    }

    reset() {
        this._claimsForLosses = 0;

        this.initialised = false;
    }

    // decision
    private insurancePlanTakenout: InsurancePlanOptions;

    private _claimsForLosses: number;


    // action
    takeoutInsurance(insurancePlanRef: string) {
        this.insurancePlanTakenout = this.params.plans[insurancePlanRef];
    }

    claims() {

    }

    cover(...objects: any[]) {
        var self = this;

        objects.forEach(function (obj) {
            obj.insurance = self;
        });
    }

    // result

    get claimsForLosses(): number {
        if (this.insurancePlanTakenout.primaryRiskRate === 0) {
            return 0;
        }

        if (this._claimsForLosses > 0) {
            return this._claimsForLosses;
        }

        var risks = this.forceMajeure;
        var risksAlphaFactors;

        var managementBudget = this.management.budget;


        if (managementBudget >= this.params.optimalManagementBudget) {
            risksAlphaFactors = 0;

        } else {
            if (managementBudget === this.params.normalManagementBudget) {
                risksAlphaFactors = 1;
            }

        }

        return risks * risksAlphaFactors;
    }

    get primaryNonInsuredRisk(): number {
        return Math.floor(this.premiumsBase * this.insurancePlanTakenout.primaryRiskRate);
    }

    get premiumsCost(): number {
        var insurancePremiums = this.insurancePlanTakenout.premiumRate * this.premiumsBase;

        return Math.floor(insurancePremiums);
    }

    

    get receipts(): number {
        var diff = this.claimsForLosses - this.primaryNonInsuredRisk;
        
        if (diff > 0) {
            return diff;

        } else {
            return 0;
        }
    }

    getEndState(): any {
        var result = {};

        var state = {
            "premiumsCost": this.premiumsCost,
            "claimsForLosses": this.claimsForLosses,
            "receipts": this.receipts,
            "primaryNonInsuredRisk": this.primaryNonInsuredRisk
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


export = Insurance;