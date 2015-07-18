import Bank = require('../../engine/ComputeEngine/Environnement/src/Bank');

import ENUMS = require('../../Engine/ComputeEngine/ENUMS');

var bank = new Bank({
    termloansFixedAnnualInterestRate: 0.1,

    authorisedOverdraftPremiumRate: 0.04,
    unAuthorisedOverdraftPremiumRate: 0.1,

    termDepositMaturity: ENUMS.FUTURES.THREE_MONTH,
    termDepositPremiumRate: 0,

    canTermLoansToBeRepaidDuringGame: false
});

export = bank;