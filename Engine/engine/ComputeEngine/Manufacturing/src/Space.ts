import ENUMS = require('../../ENUMS');
import Utils = require('../../../../utils/Utils');

import BuildingContractor = require('../../Environnement/src/BuildingContractor');

import ObjectsManager = require('../../ObjectsManager');

import console = require('../../../../utils/logger');


interface SpaceParams {
    id: string;
    label: string;

    maxSpaceUse: number;

    depreciationRate: number;

    isValuationAtMarket: boolean;

    CO2Footprint: ENUMS.CO2Footprint;

    costs: {
        fixedExpensesPerSquare: number; 
    }
}

class Space {
    protected initialised: boolean;

    extraSpace: Space;

    params: SpaceParams;

    constructor(params: SpaceParams) {
        this.params = params;
    }

    protected availableSpaceAtStart: number;

    protected extensionSquareMetreCost: number = 0;

    protected lastNetValue: number = 0;

    protected contractor: BuildingContractor;

    init(initialSize: number, extraSpace: Space, lastNetValue: number, contractor: BuildingContractor = null) {
        this.reset();

        this.extraSpace = extraSpace;

        this.availableSpaceAtStart = initialSize;
        this.availableSpace = initialSize;

        this.lastNetValue = lastNetValue;

        this.contractor = contractor;

        // now ok
        this.initialised = true;

        ObjectsManager.register(this, "production");
    }

    reset() {
        this.effectiveExtension = 0;
        this.usedSpace = 0;

        this.initialised = false;
    }


    // decision
    extensionSquareMetreNb: number;

    // results
    availableSpace: number;
    effectiveExtension: number;

    get availableSpaceNextPeriod(): number {
        return this.availableSpaceAtStart + this.effectiveExtension;
    }

    get unusedSpace(): number {
        return this.maxUsedSpace - this.usedSpace;
    }

    get maxUsedSpace(): number {
        return Math.ceil(this.availableSpace * this.params.maxSpaceUse);
    }

    get reservedSpace(): number {
        return Math.ceil(this.availableSpace * (1 - this.params.maxSpaceUse));
    }

    get maxExtension(): number {
        return this.extraSpace && this.extraSpace.unusedSpace || 0;
    }

    usedSpace: number;

    get CO2PrimaryFootprintHeat(): number {
        return this.params.CO2Footprint.kwh * this.availableSpace;
    }

    get CO2PrimaryFootprintWeight(): number {
        return this.CO2PrimaryFootprintHeat * 0.00019;
    }

   
    get CO2PrimaryFootprintOffsettingCost(): number {
        return Math.round(this.CO2PrimaryFootprintWeight * this.params.CO2Footprint.offsettingPerTonneRate);
    }

    // cost
    get extensionCost(): number {
        if (!this.contractor) {
            return 0;
        }

        return this.effectiveExtension * this.contractor.buildingSquareMetreCost;
    }

    get fixedCost(): number {
        return this.availableSpace * this.params.costs.fixedExpensesPerSquare;
    }

    get rawValue(): number {
        return this.lastNetValue + this.extensionCost;
    }

    get depreciation(): number {
        var depreciation = Math.ceil(this.rawValue * this.params.depreciationRate);

        return depreciation;
    }

    get netValue(): number {

        if (this.params.isValuationAtMarket) {
            return this.availableSpaceNextPeriod * this.extensionSquareMetreCost;
        }

        var netValue = this.rawValue - this.depreciation;

        return netValue;
    }


    // actions
    useSpace(spaceNeed: number): number {
        var gotSpace: number;

        gotSpace = spaceNeed;

        if (this.unusedSpace < gotSpace) {
            gotSpace = this.unusedSpace;
        }

        this.usedSpace += gotSpace;

        return gotSpace;
    }

    extend(extension: number) {
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }

        if (!this.extraSpace) {
            console.debug('unable to extend');
            return false;
        }

        var possibleExtension = this.unusedSpace <= extension ? extension : this.unusedSpace;

        var extensionRes = this.contractor.build(possibleExtension);

        var effectiveExtension = extensionRes.squaresNb;
        var extensionDuration = extensionRes.duration;

        this.extraSpace.useSpace(effectiveExtension);

        this.effectiveExtension = effectiveExtension;

        if (extensionDuration === ENUMS.FUTURES.IMMEDIATE) {
            this.availableSpace += this.effectiveExtension;
        }

    }

}

export = Space;