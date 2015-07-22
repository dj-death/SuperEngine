import Management = require('../../engine/ComputeEngine/Personnel/src/Management');

import ENUMS = require('../../engine/ComputeEngine/ENUMS');

var management = new Management({
    minDailyTrainedEmployeesNb: 5,
    maxDailyTrainedEmployeesNb: 10,

    budget: {
        decreaseEffectiveness: ENUMS.FUTURES.THREE_MONTH,
        decreaseLimitRate: 0.1
    },

    costs: {
        trainingConsultantDayRate: 1000
    },

    payments: {
        management: {
            "CASH": {
                credit: ENUMS.CREDIT.CASH,
                part: 1
            }
        },

        personnel: {
            "CASH": {
                credit: ENUMS.CREDIT.CASH,
                part: 1
            }
        }
    }
});

export = management;