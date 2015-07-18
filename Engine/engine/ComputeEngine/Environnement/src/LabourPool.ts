import Warehouse = require('../../Manufacturing/src/Warehouse');

class Pool extends Warehouse {

    constructor() {
        var defaultParams = {
            lostProbability: 0,
            costs: {
                fixedAdministrativeCost: 0,
                storageUnitCost: 0,
                externalStorageUnitCost: 0
            }
        };

        super(defaultParams);
    }

    employ(quantity: number): number {
        return this.moveOut(quantity, true);
    }

    train(quantity: number) {
        return this.moveOut(quantity, true);
    }

    // remember to see if we need to set future
    free(quantity: number) {
        this.moveIn(quantity);
    }
}

class LabourPool {
    private unemployedUnskilledPool: Pool;

    private unemployedSkilledPool: Pool;
    private employedSkilledPool: Pool;

    constructor() {
        this.unemployedSkilledPool = new Pool();
        this.unemployedUnskilledPool = new Pool();
        this.employedSkilledPool = new Pool();
    }

    init(unemployedSkilledNb: number, unemployedUnskilledNb: number, employedSkilledNb: number) {
        this.unemployedSkilledPool.init(unemployedSkilledNb);

        this.unemployedUnskilledPool.init(unemployedUnskilledNb);

        this.employedSkilledPool.init(employedSkilledNb);
    }


    employ(quantity: number, isUnskilled: boolean): number {
        var effectiveQ: number,
            restQ: number;

        if (isUnskilled) {
            effectiveQ = this.unemployedUnskilledPool.employ(quantity);

        } else {

            effectiveQ = this.unemployedSkilledPool.employ(quantity);
            restQ = quantity - effectiveQ;

            if (restQ > 0) {
                effectiveQ += this.employedSkilledPool.employ(quantity);
            }
        }

        return effectiveQ;
    }

    train(quantity: number, lookForUnskilled: boolean = true): number {
        var effectiveQ: number;

        if (lookForUnskilled) {
            effectiveQ = this.unemployedUnskilledPool.train(quantity);

        } else {

            effectiveQ = this.unemployedSkilledPool.train(quantity);
        }

        return effectiveQ;
    }

}
export = LabourPool; 