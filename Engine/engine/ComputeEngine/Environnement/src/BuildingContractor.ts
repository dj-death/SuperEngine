import Economy = require('./Economy');
import ENUMS = require('../../../ComputeEngine/ENUMS');

import ObjectsManager = require('../../ObjectsManager');

import console = require('../../../../utils/logger');



interface BuildingContractorParams {
    checkClientCreditWorthiness: boolean;

    minWorksDuration: ENUMS.FUTURES;

    areCostsStable: boolean;
}

interface BuildingResult {
    duration: ENUMS.FUTURES;
    squaresNb: number;
}

class BuildingContractor {

    private initialised: boolean = false;

    private params: BuildingContractorParams;

    private economy: Economy;

    // last one not at reel time
    private initialBuildingSquareMetreCost: number;

    private _buildingSquareMetreCost: number;

    constructor(params: BuildingContractorParams) {
        this.params = params;
    }

    init(economy: Economy, lastBuildingSquareMetreCost: number) {
        this.reset();

        this.economy = economy;
        this.initialBuildingSquareMetreCost = lastBuildingSquareMetreCost;

        this.initialised = true;

        ObjectsManager.register(this, "environnement", true);
    }

    reset() {
        this._buildingSquareMetreCost = undefined;
        this.initialBuildingSquareMetreCost = undefined;

        this.initialised = false;
    }

    // result
    get buildingSquareMetreCost() {
        var initialExchangeRate = this.economy.currency.initialExchangeRate;

        return this.initialBuildingSquareMetreCost * initialExchangeRate;
    }

    get reelTimeBuildingSquareMetreCost() {
        var quotedExchangeRate = this.economy.currency.quotedExchangeRate;

        return this._buildingSquareMetreCost * quotedExchangeRate;
    }

    // helper
    simulate() {
        if (this.params.areCostsStable) {
            this._buildingSquareMetreCost = this.initialBuildingSquareMetreCost;
            return;
        }

        // TEST purposes
        this._buildingSquareMetreCost = 500;
    }

    

    build(requiredBuildingSquaresNb: number, client_creditWorthiness?: number): BuildingResult {
        var worksDuration = this.params.minWorksDuration;

        if (!this.params.checkClientCreditWorthiness) {
            return {
                squaresNb: requiredBuildingSquaresNb,
                duration: worksDuration
            }
        }

        var effectiveBuildingSquaresNb;
        var plannedBuildingTotalCost = requiredBuildingSquaresNb * this.initialBuildingSquareMetreCost;

        if (plannedBuildingTotalCost <= client_creditWorthiness) {
            effectiveBuildingSquaresNb = requiredBuildingSquaresNb;
        } else {
            // TODO
            effectiveBuildingSquaresNb = 0;
        }

        return {
            duration: worksDuration,
            squaresNb: effectiveBuildingSquaresNb
        };
    }

    getEndState(): any {
        var state = {
            "buildingCost": this._buildingSquareMetreCost
        };

        return state;
    }

}

export = BuildingContractor;