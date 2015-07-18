//import DecisionModel = require('../api/models/Decision');
//var Q = require('q');
var Utils = require('../utils/Utils');
var config = require('../config');
var Q = require('q');
var Datastore = require('nedb');
var simulationDb = global.simulationDb || new Datastore({ filename: config.simulationDbPath + '/sim.nosql', autoload: true });
global.simulationDb = simulationDb;
simulationDb.ensureIndex({ fieldName: '_id', unique: true, sparse: true }, function (err) {
    if (err) {
        console.log(err);
        throw err;
    }
});
function makeID(decision) {
    var ID = "";
    ID += decision.seminarId;
    ID += decision.groupId;
    ID += decision.d_CID;
    ID += decision.period;
    return ID;
}
var decisions = function (req, res, next) {
    var decision = req.body;
    // for test purpose
    var decisions = [];
    for (var i = 1; i <= 8; i++) {
        var dec = Utils.ObjectApply({}, decision);
        dec["d_CID"] = i;
        dec["seminarId"] = 1;
        dec["groupId"] = 1;
        dec["period"] = 1;
        dec["d_CompanyName"] = "Company " + i;
        dec["_id"] = makeID(dec);
        decisions.push(dec);
    }
    // end of test
    simulationDb.insert(decisions, function (error, newDoc) {
        if (error) {
            console.log(error);
            res.jsonp({
                "success": false,
                "msg": "Decision failed to be saved " + error.message
            });
            throw error;
        }
        res.jsonp({
            "success": true,
            "msg": "Decision saved"
        });
    });
};
module.exports = decisions;
//# sourceMappingURL=decisions.js.map