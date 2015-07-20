import Bank = require('../../engine/ComputeEngine/Environnement/src/Bank');

import ENUMS = require('../../Engine/ComputeEngine/ENUMS');

var banks = {
    eurobank: new Bank({
        id: "eurobank",

        termloansFixedAnnualInterestRate: 0.1,

        authorisedOverdraftPremiumRate: 0.04,
        unAuthorisedOverdraftPremiumRate: 0.1,

        termDepositMaturity: ENUMS.FUTURES.THREE_MONTH,
        termDepositPremiumRate: 0,

        canTermLoansToBeRepaidDuringGame: false,

        termLoansAvailability: ENUMS.FUTURES.IMMEDIATE
    })
};

export = banks;