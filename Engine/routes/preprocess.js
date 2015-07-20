var Excel = require('../utils/Excel');
var config = require('../config');
var Utils = require('../utils/Utils');
var path = require('path');
var Dir = require('node-dir');
var console = require('../utils/logger');
// Persistent datastore with automatic loading 
var Datastore = require('nedb');
var scenariosDb = global.scenariosDb || new Datastore({ filename: config.scenariosDbPath + '/scenarios.nosql', autoload: true, corruptAlertThreshold: 0 });
global.scenariosDb = scenariosDb;
var simulationDb = global.simulationDb || new Datastore({ filename: config.simulationDbPath + '/sim.nosql', autoload: true });
global.simulationDb = simulationDb;
function loadScenario(scenarioId, callback) {
    scenariosDb.findOne({ ref: scenarioId }, function (err, scenario) {
        callback.apply(null, [scenario, scenarioId]);
    });
}
function populateWithHisoriques(companyRec, historiques) {
}
function analyze(req, res) {
    Excel.dbToExcel(res);
}
exports.analyze = analyze;
;
function initialize(req, res) {
    saveTest();
}
exports.initialize = initialize;
;
function historique(req, res, next) {
    var period = req.query.period;
    var lang = req.query.lang || config.defaultLang;
    var scenarioId = req.query.scenarioId || config.defaultScenario;
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
function saveTest() {
    var reports = [];
    function getPeriod(year, quarter) {
        var period;
        if (year == 2013) {
            period = 1;
        }
        else {
            period = quarter + 1;
        }
        return period;
    }
    Dir.files(config.decisionsTestPath, function (err, files) {
        if (err) {
            console.debug(err);
            throw err;
        }
        // sort ascending
        files.sort();
        files.forEach(function (file, idx) {
            var report = Excel.excelImport(file);
            report["seminarId"] = 1;
            report["period"] = getPeriod(report["period_year"], report["period_quarter"]);
            report["_id"] = Utils.makeID(report);
            if (!report) {
                console.debug(path.basename(file), ' failed');
                return false;
            }
            console.debug(report["_id"], report["period"]);
            reports.push(report);
        });
        if (reports.length) {
            simulationDb.insert(reports, function (err, newDoc) {
                if (err) {
                    console.debug(err);
                    throw err;
                }
            });
        }
    });
}
function saveAll() {
    Dir.subdirs(config.decisionsTestPath, function (err, subdirs) {
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
                        console.debug(path.basename(file), ' failed');
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
                        console.debug('saved ', newDoc._id);
                    });
                }
            });
        });
    });
}
//# sourceMappingURL=preprocess.js.map