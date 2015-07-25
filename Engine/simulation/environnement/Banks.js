var Bank = require('../../engine/ComputeEngine/Environnement/src/Bank');
var ENUMS = require('../../Engine/ComputeEngine/ENUMS');
var banks = {
    eurobank: new Bank({
        id: "eurobank",
        termloansFixedAnnualInterestRate: 0.1,
        authorisedOverdraftPremiumRate: 0.04,
        unAuthorisedOverdraftPremiumRate: 0.1,
        termDepositMaturity: 1 /* THREE_MONTH */,
        termDepositPremiumRate: 0,
        canTermLoansToBeRepaidDuringGame: false,
        termLoansAvailability: 0 /* IMMEDIATE */
    })
};
module.exports = banks;
//# sourceMappingURL=Banks.js.map