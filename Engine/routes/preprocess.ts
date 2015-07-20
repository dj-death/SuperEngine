import Excel = require('../utils/Excel');
import config = require('../config');
import Utils = require('../utils/Utils');
import path = require('path');

import fs = require('fs');

var Dir = require('node-dir');

import console = require('../utils/logger');


// Persistent datastore with automatic loading 
var Datastore = require('nedb');
var scenariosDb = global.scenariosDb || new Datastore({ filename: config.scenariosDbPath + '/scenarios.nosql', autoload: false, corruptAlertThreshold: 0 });
global.scenariosDb = scenariosDb;

var simulationDb = global.simulationDb || new Datastore({ filename: config.simulationDbPath + '/sim.nosql', autoload: true });

global.simulationDb = simulationDb;


function loadScenario(scenarioId, callback) {
    scenariosDb.loadDatabase(function (err) {    // Callback is optional
        // Now commands will be executed
        if (err) {
            throw err;
        }

        scenariosDb.findOne({ ref: scenarioId }, function (err, scenario) {
            callback.apply(null, [scenario, scenarioId]);
        });

    });
}

function populateWithHisoriques (companyRec, historiques) {


}


export function analyze(req, res) {
    Excel.dbToExcel(res);
};


export function initialize (req, res) {
    saveTest();
};

export function historique (req, res, next) {
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


function saveTest() {
    var reports = [];

    function getPeriod(year, quarter) {
        var period;

        if (year == 2013) {
            period = 1;
        } else {
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

            simulationDb.loadDatabase(function (err) {    // Callback is optional
                // Now commands will be executed
                if (err) {
                    throw err;
                }


                simulationDb.insert(reports, function (err, newDoc) {
                    if (err) {
                        console.debug(err);
                        throw err;
                    }

                });

            });
        }

    });


}


function saveAll() {

    Dir.subdirs(config.decisionsTestPath, function (err, subdirs) {
        if (err) throw err;

        subdirs.forEach(function (subdir) {
            var scenario;
            var historiques = [];

            Dir.files(subdir, function (err, files) {
                if (err) throw err;
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

                    scenariosDb.loadDatabase(function (err) {    // Callback is optional
                        // Now commands will be executed
                        if (err) {
                            throw err;
                        }

                        scenariosDb.insert(scenario, function (err, newDoc) {
                            if (err) throw err;

                            console.debug('saved ', newDoc._id);
                        });

                    });
                }

            });


        });

    });

}