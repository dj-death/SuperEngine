import BankAccount = require('../../engine/ComputeEngine/Finance/src/BankAccount');

import game = require('../Game');

var accounts = {
    eurobankAccount: new BankAccount({
        id: "eurobank_account",

        periodDaysNb: game.daysNbByPeriod
    })
}

export = accounts;