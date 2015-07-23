import config = require('../config');
import Utils = require('../utils/Utils');
import console = require('../utils/logger');


var Q = require('q');

import MarketSim = require('../engine/ComputeEngine/Environnement/src/Market');

import SimMain = require('../simulation/Main');

var Datastore = require('nedb');
var simulationDb = global.simulationDb || new Datastore({ filename: config.simulationDbPath + '/sim.nosql', autoload: false, corruptAlertThreshold: 0});
global.simulationDb = simulationDb;

var scenariosDb = global.scenariosDb || new Datastore({ filename: config.scenariosDbPath + '/scenarios.nosql', autoload: false, corruptAlertThreshold: 0 });
global.scenariosDb = scenariosDb;


function setIntelligenceInfos(companies) {
    var deferred = Q.defer();


    function addElementsTo(data, obj, id) {
        var companyIdxStr = "company" + id + "_";

        for (var key in obj) {
            if (!obj.hasOwnProperty(key)) {
                continue;
            }

            var property = companyIdxStr + key;
            data[property] = obj[key];
        }

    }


    setImmediate(function () {
        var generalData = {};
        var marketSharesData = {};
        var corporateData = {};

        companies.forEach(function (c, idx) {

            var info = {
                "id": c.d_CID,

                "sharePricePerCent": c.sharePricePerCent,
                "marketValuation": c.marketValuation,
                "dividendPaid": c.dividendPaid,
                "IP": c.IP,

                "m1_p1_price": c.m1_p1_price,
                "m2_p1_price": c.m2_p1_price,
                "m3_p1_price": c.m3_p1_price,
                "m1_p2_price": c.m1_p2_price,
                "m2_p2_price": c.m2_p2_price,
                "m3_p2_price": c.m3_p2_price,
                "m1_p3_price": c.m1_p3_price,
                "m2_p3_price": c.m2_p3_price,
                "m3_p3_price": c.m3_p3_price,
                "employeesNb": c.employeesNb,
                "assemblyWageRatePerCent": c.assemblyWageRatePerCent,
                "salesForceNb": c.salesForceNb,

                "nonCurrentAssetsTotalValue": c.nonCurrentAssetsTotalValue,
                "inventoriesValue": c.inventoriesValue,
                "tradeReceivablesValue": c.tradeReceivablesValue,
                "cashValue": c.cashValue,
                "taxAssessedAndDue": c.taxAssessedAndDue,
                "tradePayablesValue": c.tradePayablesValue,
                "banksOverdraft": c.banksOverdraft,
                "LTLoans": c.LTLoans,
                "ordinaryCapital": c.ordinaryCapital,
                "sharePremiumAccount": c.sharePremiumAccount,
                "retainedEarnings": c.retainedEarnings
            };

            addElementsTo(generalData, info, c.d_CID);

            var marketSharesInfo = {
                "m1_p1_marketShare": c.m1_p1_marketShare,
                "m2_p1_marketShare": c.m2_p1_marketShare,
                "m3_p1_marketShare": c.m3_p1_marketShare,
                "m1_p2_marketShare": c.m1_p2_marketShare,
                "m2_p2_marketShare": c.m2_p2_marketShare,
                "m3_p2_marketShare": c.m3_p2_marketShare,
                "m1_p3_marketShare": c.m1_p3_marketShare,
                "m2_p3_marketShare": c.m2_p3_marketShare,
                "m3_p3_marketShare": c.m3_p3_marketShare
            };

            addElementsTo(marketSharesData, marketSharesInfo, c.d_CID);

            var corporateInfo = {
                "advertisingBudget": c.advertisingBudget,
                "productsDevBudget": c.productsDevBudget,
                "p1_consumerStarRatings": c.p1_consumerStarRatings,
                "p2_consumerStarRatings": c.p2_consumerStarRatings,
                "p3_consumerStarRatings": c.p3_consumerStarRatings,
                "website_consumerStarRatings": c.website_consumerStarRatings
            };

            addElementsTo(corporateData, corporateInfo, c.d_CID);

        });

        companies.forEach(function (company, idx) {
            Utils.ObjectApply(company, generalData);

            if (company.intelligence_marketShares_order) {
                Utils.ObjectApply(company, marketSharesData);
            }

            if (company.intelligence_corporateInfo_order) {
                Utils.ObjectApply(company, corporateData);
            }

        });

        deferred.resolve(companies);

    });

    return deferred.promise;
}

function loadHistoryState(scenarioId, callback, failure) {
    scenariosDb.loadDatabase(function (err) {    // Callback is optional
        // Now commands will be executed
        if (err) {
            throw err;
        }

        scenariosDb.findOne({ ref: scenarioId }, function (err, scenario) {
            if (err) {
                failure.apply(null, [err.message]);
                throw err;
            }

            if (!scenario) {
                failure.apply(null, ["no scenario found"]);
                return false;
            }

            if (!scenario.historiques.length) {
                failure.apply(null, ["no hists found"]);
                return false;
            }

            console.debug('scenario ref ' + scenarioId + ' is loadedd ' + scenario.historiques.length);

            var hists = scenario.historiques;
            hists.sort(function (v, w) {

                if (v.period_year === w.period_year) {
                    if (v.period_quarter === undefined) {
                        return v.period - w.period;
                    }

                    return v.period_quarter - w.period_quarter;

                } else {
                    return v.period_year - w.period_year;
                }

            });

            var historique = [hists[hists.length - 1]];

            callback.apply(null, [historique]);
        });
    });
}

function loadCompaniesData(seminarId, groupId, period, callback, failure) {
    var filterObj = {
        $and: [{ seminarId: seminarId }, { groupId: groupId }, {period: period}]
    };

    simulationDb.loadDatabase(function (err) {    // Callback is optional
        // Now commands will be executed
        if (err) {
            throw err;
        }

        simulationDb.find(filterObj, function (err, companies) {
            if (err) {
                failure.apply(null, [err.message]);
                throw err;
            }

            if (!companies) {
                failure.apply(null, ["no data found"]);
                return false;
            }

            callback.apply(null, [companies, period]);

        });
    });
}

function objectSlice(object, startIdx, endIdx): any {
    var slice = {};

    var keys = Object.keys(object);
    var size = keys.length;
    var idx = startIdx;

    var key;


    if (endIdx === undefined || endIdx > size) {
        endIdx = size;
    }

    // endIdx non inclue
    for (; idx < endIdx; idx++) {
        key = keys[idx];

        slice[key] = object[key];
    }

    return slice;
}

function divideObject(object, packetSize, persistentKey?, persistentValue?): any[] {
    var keys = Object.keys(object);
    var size = keys.length;
    var packetsNb = Math.ceil(size / packetSize);
    var packets = [];
    var packet;

    var i = 0;

    var startIdx;
    var endIdx;

    if (packetsNb <= 1) {
        return [object];
    }

    console.debug("Your doc ", size, "will be divided to ", packetsNb);

    for (; i < packetsNb; i++) {

        startIdx = i * packetSize;
        endIdx = startIdx + packetSize;

        packet = objectSlice(object, startIdx, endIdx);

        if (persistentKey) {
            packet[persistentKey] = persistentValue;
        }

        packets.push(packet);

        startIdx = endIdx + 1;
    }

    return packets;
}


function saveState(company: any) {
    var p = Q();

    var packetSize = 1000;

    var _id = Utils.makeID(company);

    var packets = divideObject(company, packetSize);

    packets.forEach(function (packet) {

        p = p.then(function () {
            var deferred = Q.defer();

            setImmediate(function () {

                simulationDb.update({ "_id": _id }, { $set: packet }, { upsert: false, multi: false }, function (error, numReplaced) {
                    if (error) {
                        deferred.reject(error);
                        return;
                    }

                    console.debug('update ' + _id + ' with ' + numReplaced + ' replacements');

                    if (numReplaced > 1) {
                        deferred.reject(new Error("A Collision happend ! More than one company state is modified @ " + _id));
                    }

                    deferred.resolve(company);

                });

            });

            return deferred.promise;
        });

    });

    return p;

}


function updateCompanyState(company, idx, period, lastState, environnement, ordersMatrix) {

    var deferred = Q.defer();

    setImmediate(function () {

        var companyLs = lastState.length === 1 ? lastState[0] : lastState.filter(function (v) { return v.d_CID === company.d_CID });

        SimMain.initialize(companyLs, period, company.d_CID);

        SimMain.setDecisions(company);

        SimMain.getOrders(ordersMatrix[idx]);

        Utils.ObjectApply(company, SimMain.getEndState());

        deferred.resolve(company);

    });

    return deferred.promise;

}

function updateStates(companies, lastState, ordersMatrix, period) {
    var deferred = Q.defer();

    companies.forEach(function (company, idx) {
        var companyLs = lastState.length === 1 ? lastState[0] : lastState.filter(function (v) { return v.d_CID === company.d_CID });

        SimMain.initialize(companyLs, period, company.d_CID);

        SimMain.setDecisions(company);

        SimMain.getOrders(ordersMatrix[idx]);

        Utils.ObjectApply(company, SimMain.getEndState());

    });

    deferred.resolve(companies);

    return deferred.promise;
}


export function run (req, res, next) {
    var seminarId = parseInt(req.query.seminarId);
    var groupId = parseInt(req.query.groupId);
    var period = parseInt(req.query.period);
    var scenarioId = req.query.scenarioId || config.defaultScenario;

    function onError(err) {
        res.send({ msg: err, success: false });
    }

    function loadLastState(callback, failure) {
        if (period === 1) {
            loadHistoryState(scenarioId, callback, failure);

        } else {
            loadCompaniesData(seminarId, groupId, period - 1, callback, failure);
        }
    }

    // load current state i.e decisions
    loadCompaniesData(seminarId, groupId, period, function (companies) {
        console.debug("load " + companies.length + " companies data");

        // to get market shares let's confronte company decisions
        var ordersMatrix = MarketSim.simulateOrders(companies);
        var environnement = MarketSim.simulateEnv();       
        
        // load last state
        loadLastState(function (data) {
            console.debug("load last state " + data.length + " count");

            // we don't care whatever company is
            var lastEnvState = data[0];
            SimMain.initEnvironnemet(lastEnvState, period);
            SimMain.simulateEnv();


            var p = Q();

            companies.forEach(function (company, idx) {
                p = p.then(function () {
                    return updateCompanyState(company, idx, period, data, environnement, ordersMatrix);
                });

            })

            p
            /*.then(function () {
                return updateStates(companies, data, ordersMatrix, period);
            })*/

            .then(function (states) {
                console.debug('step 2');
                return setIntelligenceInfos(/*states*/companies);
            })

            .then(function (states) {
                console.debug('step 3', states.length);
                states.forEach(function (state, idx) {
                    p = p.then(function () {
                        console.debug("now with " + idx + " of " + state.d_CompanyName);
                        return saveState(state);
                    });

                    // try to free memory
                    delete states[idx];
                });

                return p;

            })

            .then(function () {
                res.send({ msg: "simulation is successufl", success: true });
            })
            .fail(function (err) {
                res.send({ msg: "simulation fails :" + err, success: false });
            });
            

        }, onError);


    }, onError);
}