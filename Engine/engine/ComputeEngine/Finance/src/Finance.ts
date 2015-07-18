import Insurance = require('./Insurance');

import Utils = require('../../../../utils/Utils');

class Finance {
    private static _instance: Finance = null;

    insurance: Insurance;

    public static init() {
        if (Finance._instance) {
            delete Finance._instance;
        }

        Finance._instance = new Finance();
    }


    constructor() {
        if (Finance._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }

        Finance._instance = this;
    }

    public static getInstance(): Finance {
        if (Finance._instance === null) {
            Finance._instance = new Finance();
        }

        return Finance._instance;
    }

    public static register(objects: any[]) {

        var that = this.getInstance(),
            i = 0,
            len = objects.length,
            object;

        for (; i < len; i++) {
            object = objects[i];

            if (object instanceof Insurance) {
                that.insurance = object;

            }
        }
    }



    public static getEndState(): any {
        var that = this.getInstance();
        var proto = this.prototype;
        var endState = {};

        for (var key in proto) {
            endState[key] = that[key];
        }

        return endState;

    }

}

export = Finance; 