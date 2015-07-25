var BankAccount = require('../../engine/ComputeEngine/Finance/src/BankAccount');
var game = require('../Game');
var ENUMS = require('../../engine/ComputeEngine/ENUMS');
var defaultPayments = {
    "CASH": {
        credit: 0 /* CASH */,
        part: 1
    }
};
var accounts = {
    eurobankAccount: new BankAccount({
        id: "eurobank_account",
        periodDaysNb: game.daysNbByPeriod,
        payments: defaultPayments
    })
};
module.exports = accounts;
//# sourceMappingURL=BankAccounts.js.map