var Management = require('../../engine/ComputeEngine/Personnel/src/Management');
var ENUMS = require('../../engine/ComputeEngine/ENUMS');
var management = new Management({
    minDailyTrainedEmployeesNb: 5,
    maxDailyTrainedEmployeesNb: 10,
    budget: {
        decreaseEffectiveness: 1 /* THREE_MONTH */,
        decreaseLimitRate: 0.1
    },
    costs: {
        trainingConsultantDayRate: 1000
    }
});
module.exports = management;
//# sourceMappingURL=Management.js.map