import Space = require('./Space');

import BuildingContractor = require('../../Environnement/src/BuildingContractor');

import ENUMS = require('../../ENUMS');
import Factory = require('./Factory');

import Utils = require('../../../../utils/Utils');

class Land extends Space {

    factories: Factory[];
    lastLandNetValue: number;

    init(initialSize: number, extraSpace: Space, lastLandNetValue: number, contractor: BuildingContractor = null, factories?: Factory[]) {
        super.init(initialSize, extraSpace, lastLandNetValue, contractor);

        this.factories = factories;
        this.lastLandNetValue = lastLandNetValue;

        this.usedSpace = this.factoriesInitialSpace;
    }

    get accessAndParkingSpace(): number {
        return this.reservedSpace;
    }

    get factoriesInitialSpace(): number {
        return Utils.sums(this.factories, "availableSpaceAtStart");
    }

    get factoriesSpace(): number {
        return Utils.sums(this.factories, "availableSpace");
    }

    getEndState(): any {
        var result = {};

        var state = {
            "availableSpace": this.availableSpace
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

export = Land;