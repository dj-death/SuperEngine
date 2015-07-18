var Excel = require('../utils/Excel');
require();
var historique = function (req, res, next) {
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
        Excel.excelExport(historiques[0], res);
    });
    Excel.excelExport(, res, lang);
};
module.exports = historique;
//# sourceMappingURL=historique.js.map