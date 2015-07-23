import Utils = require('../../utils/Utils');

import console = require('../../utils/logger');


interface IObjects {
    [index: string]: any[];
}

class ObjectsManager {
    private static _instance: ObjectsManager = null;

    private objects: IObjects = {};
    private static persistents: IObjects = {};

    constructor() {
        if (ObjectsManager._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }

        ObjectsManager._instance = this;
    }

    public static init(doRestorePersistents: boolean = true) {
        var that = this.getInstance();
        var persistents = ObjectsManager.persistents;

        if (ObjectsManager._instance) {
            delete ObjectsManager._instance;
        }

        ObjectsManager._instance = new ObjectsManager();

        // restore
        if (doRestorePersistents) {
            that.restorePersistents();
        }

    }

    public static getInstance(): ObjectsManager {
        if (ObjectsManager._instance === null) {
            ObjectsManager._instance = new ObjectsManager();
        }

        return ObjectsManager._instance;
    }

    private restorePersistents() {
        var persistents = ObjectsManager.persistents;
        var deptObj;
        var obj;

        for (var dept in persistents) {
            if (!persistents.hasOwnProperty(dept)) {
                continue;
            }

            deptObj = persistents[dept];

            var i = 0,
                len = deptObj.length;

            for (; i < len; i++) {
                obj = deptObj[i];

                ObjectsManager.register(obj, dept, false);// do once
            }
        }

    }

    public static register(object: any, department: string, persistent: boolean = false): any {
        var that = this.getInstance();

        if (that.objects[department] === undefined) {
            that.objects[department] = [];
        }

        that.objects[department].push(object);

        if (persistent) {
            if (ObjectsManager.persistents[department] === undefined) {
                ObjectsManager.persistents[department] = [];
            }

            ObjectsManager.persistents[department].push(object);
        }
    }

    public static retrieve(department: string): any[]{
        return this.getInstance().objects[department];
    }

    public static clean() {
        delete this.getInstance().objects;
    }

    public static finish() {
        var objects: IObjects = this.getInstance().objects;
        var deptObj;


        for (var dept in objects) {
            if (!objects.hasOwnProperty(dept)) {
                continue;
            }

            deptObj = objects[dept];

            var i = 0,
                len = deptObj.length;

            var item;

            for (; i < len; i++) {

                item = deptObj[i];

                item.onFinish && item.onFinish();
            }
        }

    }

    public static getObjectsEndState(): any {
        var result = {};

        var objects: IObjects = this.getInstance().objects;
        var deptObj;


        for (var dept in objects) {
            if (!objects.hasOwnProperty(dept)) {
                continue;
            }

            deptObj = objects[dept];

            var i = 0,
                len = deptObj.length;

            var endState;

            for (; i < len; i++) {

                if (typeof deptObj[i].getEndState === "function") {
                    endState = deptObj[i].getEndState();

                    Utils.ObjectApply(result, endState);
                }

                
            }
        }

        return result;
    }
}

export = ObjectsManager;