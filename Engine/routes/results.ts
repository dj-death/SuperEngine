import Excel = require('../utils/Excel');

import config = require('../config');

var Datastore = require('nedb');
var simulationDb = global.simulationDb || new Datastore({ filename: config.simulationDbPath + '/sim.nosql', autoload: true });

global.simulationDb = simulationDb;

var results = function (req, res, next) {
    var lang = req.body.lang || config.defaultLang;

    var period = req.body.period || req.query.period;
    var companyId = req.body.companyId || req.query.companyId;
    var groupId = req.body.groupId || req.query.groupId;
    var seminarId = req.body.seminarId || req.query.seminarId;

    if (!period || !companyId || !groupId) {
        res.send({ msg: "params not send", success: false});
    }
    
    fetchReportDataOf(companyId, groupId, period, seminarId, function (reportData) {
        if (!reportData) {
            res.send({ msg: "report not found", success: false });
            return false;
        }

        Excel.excelExport(reportData, res, lang);
    });  
};

function fetchReportDataOf(companyId, groupId, period, seminarId, callback) {
    var filterObj = {
        $and: [
            { seminarId: parseInt(seminarId) },
            { groupId: parseInt(groupId) },
            { period: parseInt(period) },
            { d_CID: parseInt(companyId) }
        ]
    };

    simulationDb.findOne(filterObj, function (err, company) {
        callback.apply(null, [company]);
    });

}

export = results;
