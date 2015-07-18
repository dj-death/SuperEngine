var Utils = require('../../utils/Utils');
var ObjectsManager = (function () {
    function ObjectsManager() {
        this.objects = {};
        if (ObjectsManager._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }
        ObjectsManager._instance = this;
    }
    ObjectsManager.init = function (doRestorePersistents) {
        if (doRestorePersistents === void 0) { doRestorePersistents = true; }
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
    };
    ObjectsManager.getInstance = function () {
        if (ObjectsManager._instance === null) {
            ObjectsManager._instance = new ObjectsManager();
        }
        return ObjectsManager._instance;
    };
    ObjectsManager.prototype.restorePersistents = function () {
        var persistents = ObjectsManager.persistents;
        var deptObj;
        var obj;
        for (var dept in persistents) {
            if (!persistents.hasOwnProperty(dept)) {
                continue;
            }
            deptObj = persistents[dept];
            var i = 0, len = deptObj.length;
            for (; i < len; i++) {
                obj = deptObj[i];
                ObjectsManager.register(obj, dept, false); // do once
            }
        }
    };
    ObjectsManager.register = function (object, department, persistent) {
        if (persistent === void 0) { persistent = false; }
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
    };
    ObjectsManager.retrieve = function (department) {
        return this.getInstance().objects[department];
    };
    ObjectsManager.getObjectsEndState = function () {
        var result = {};
        var objects = this.getInstance().objects;
        var deptObj;
        for (var dept in objects) {
            if (!objects.hasOwnProperty(dept)) {
                continue;
            }
            deptObj = objects[dept];
            var i = 0, len = deptObj.length;
            var endState;
            for (; i < len; i++) {
                if (typeof deptObj[i].getEndState === "function") {
                    endState = deptObj[i].getEndState();
                    Utils.ObjectApply(result, endState);
                }
            }
        }
        return result;
    };
    ObjectsManager._instance = null;
    ObjectsManager.persistents = {};
    return ObjectsManager;
})();
module.exports = ObjectsManager;
//# sourceMappingURL=ObjectsManager.js.map