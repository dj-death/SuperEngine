import config = require('../config');
import Utils = require('../utils/Utils');

var Q = require('q');

import MarketSim = require('../engine/ComputeEngine/Environnement/src/Market');

import SimMain = require('../simulation/Main');

var Datastore = require('nedb');
var simulationDb = global.simulationDb || new Datastore({ filename: config.simulationDbPath + '/sim.nosql', autoload: true, corruptAlertThreshold: 0});
global.simulationDb = simulationDb;

var scenariosDb = global.scenariosDb || new Datastore({ filename: config.scenariosDbPath + '/scenarios.nosql', autoload: true, corruptAlertThreshold: 0 });
global.scenariosDb = scenariosDb;


function setIntelligenceInfos(companies) {
    var generalData = {};
    var marketSharesData = {};
    var corporateData = {};


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
}

function loadHistoryState(scenarioId, callback, failure) {
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

        console.log('scenario ref ' + scenarioId + ' is loadedd ' + scenario.historiques.length);

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
}

function loadCompaniesData(seminarId, groupId, period, callback, failure) {
    var filterObj = {
        $and: [{ seminarId: seminarId }, { groupId: groupId }, {period: period}]
    };


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
}


function saveState(company) {
    var deferred = Q.defer();

    var _id = Utils.makeID(company);

    // we use multi to debug if there is collision

    simulationDb.update({ "_id": _id }, { $set: company }, {upsert: false, multi: true}, function (error, numReplaced) {
        if (error) {
            deferred.reject(error);
        }

        console.log('update ' + _id + ' with ' + numReplaced + ' replacements');

        if (numReplaced > 1) {
            deferred.reject(new Error("A Collision happend ! More than one company state is modified @ " + _id));
        }

        deferred.resolve(company);

    });

    return deferred.promise;
}


function updateCompanyState(company, idx, period, lastState, environnement, ordersMatrix) {
   
    var companyLs = lastState.length === 1 ? lastState[0] : lastState.filter(function (v) { return v.d_CID === company.d_CID });

    SimMain.initialize(companyLs, period);

    SimMain.setDecisions(company);

    SimMain.getOrders(ordersMatrix[idx]);

    Utils.ObjectApply(company, SimMain.getEndState());
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
        console.log("load " + companies.length + " companies data");

        // to get market shares let's confronte company decisions
        var ordersMatrix = MarketSim.simulateOrders(companies);
        var environnement = MarketSim.simulateEnv();       
        
        // load last state
        loadLastState(function (data) {
            console.log("load last state " + data.length + " count");

            // we don't care whatever company is
            var lastEnvState = data[0];
            SimMain.initEnvironnemet(lastEnvState, period);
            SimMain.simulateEnv();

            companies.forEach(function (company, idx) {
                updateCompanyState(company, idx, period, data, environnement, ordersMatrix);
            });

            setIntelligenceInfos(companies);

            var p = Q();

            companies.forEach(function (company, idx) {
                p = p.then(function () {
                    console.log("now with " + idx + " of " + company.d_CompanyName);
                    return saveState(company);
                });
            });

            p
            .then(function () {
                res.send({ msg: "simulation is successufl", success: true });
            })
            .fail(function (err) {
                res.send({ msg: "simulation fails :" + err, success: false });
            });
            

        }, onError);


    }, onError);
}