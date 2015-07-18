var Excel = require('../utils/Excel');
var config = require('../config');
var path = require('path');
var Dir = require('node-dir');
// Persistent datastore with automatic loading 
var Datastore = require('nedb');
var scenariosDb = new Datastore({ filename: config.scenariosDbPath + '/scenarios.nosql', autoload: true, corruptAlertThreshold: 0 });
function loadScenario(scenarioId, callback) {
    scenariosDb.findOne({ ref: scenarioId }, function (err, scenario) {
        callback.apply(null, [scenario, scenarioId]);
    });
}
function populateWithHisoriques(companyRec, historiques) {
}
function initialize(req, res) {
}
exports.initialize = initialize;
;
function historique(req, res, next) {
    var scenario = req.body.scenarioId;
    var period = req.body.period;
    var lang = req.body.lang;
    var scenarioId = req.body.scenarioId || config.defaultScenario;
    // load scenario
    loadScenario(scenarioId, function (scenario) {
        if (!scenario) {
            res.status(500);
            res.send({ msg: "Error ! historiques not found" });
            return false;
        }
        var historiques = scenario.historiques;
        Excel.excelExport(historiques[period - 1], res, lang);
    });
}
exports.historique = historique;
function saveAll() {
    Dir.subdirs(config.scenariosDbPath, function (err, subdirs) {
        if (err)
            throw err;
        subdirs.forEach(function (subdir) {
            var scenario;
            var historiques = [];
            Dir.files(subdir, function (err, files) {
                if (err)
                    throw err;
                // sort ascending
                files.sort();
                files.forEach(function (file, idx) {
                    var historique = Excel.excelImport(file);
                    if (!historique) {
                        console.log(path.basename(file), ' failed');
                        return false;
                    }
                    historiques.push(historique);
                });
                if (historiques[0] !== undefined) {
                    scenario = {
                        ref: historiques[0].scenarioId.trim(),
                        historiques: historiques
                    };
                    scenariosDb.insert(scenario, function (err, newDoc) {
                        if (err)
                            throw err;
                        console.log('saved ', newDoc._id);
                    });
                }
            });
        });
    });
}
//# sourceMappingURL=initialize.js.map