import Space = require('./Space');

import AbstractObject = require('./AbstractObject');
import Atelier = require('./Atelier');
import Warehouse = require('./Warehouse');

import Land = require('./Land');

import BuildingContractor = require('../../Environnement/src/BuildingContractor');


import ENUMS = require('../../ENUMS');

import Utils = require('../../../../utils/Utils');
import console = require('../../../../utils/logger');

import ObjectsManager = require('../../ObjectsManager');


class Factory extends Space  {
 
    ateliers: Atelier[];
    warehouses: Warehouse[];

    init(initialSize: number, land: Land, lastFactoryNetValue: number, contractor: BuildingContractor = null, ateliers?: Atelier[]) {
        super.init(initialSize, land, lastFactoryNetValue, contractor);

        this.ateliers = ateliers;

        // TODO: add stocks
        this.usedSpace = this.ateliersSpaceUsed;

        ObjectsManager.register(this, "production");
    }

    get ateliersSpaceUsed(): number {
        return Utils.sums(this.ateliers, "spaceUsed");
    }


    get circulationAndAccessSpace(): number {
        return this.reservedSpace;
    }

    

    getEndState(): any {
        var result = {};

        var state = {
            "availableSpace": this.availableSpace,
            /*"machiningSpaceUsed": this.machiningSpaceUsed,
            "assemblyWorkersSpaceUsed": this.assemblyWorkersSpaceUsed,
            "stocksSpaceUsed": this.stocksSpaceUsed,*/
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

export = Factory;