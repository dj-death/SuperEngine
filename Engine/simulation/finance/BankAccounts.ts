import BankAccount = require('../../engine/ComputeEngine/Finance/src/BankAccount');

import game = require('../Game');

import ENUMS = require('../../engine/ComputeEngine/ENUMS');


var defaultPayments: ENUMS.PaymentArray = {
    "CASH": {
        credit: ENUMS.CREDIT.CASH,
        part: 1
    }
};

var accounts = {
    eurobankAccount: new BankAccount({
        id: "eurobank_account",

        periodDaysNb: game.daysNbByPeriod,

        payments: defaultPayments
    })
}

export = accounts;