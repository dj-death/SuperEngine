import BankAccount = require('./BankAccount');

import ENUMS = require('../../ENUMS');

import Utils = require('../../../../utils/Utils');
import console = require('../../../../utils/logger');



interface flow {
    [index: string]: number;
}

interface Activity {
    payments: flow;
    receipts: flow;

    periodPayments: number;
    periodPayables: number;

    periodReceipts: number;
}

class CashFlow {
    private static _instance: CashFlow = null;

    private operating: Activity = {
        payments: {},
        receipts: {},

        periodPayables: 0,

        periodPayments:0,
        periodReceipts:0
    };

    private financing: Activity = {
        payments: {},
        receipts: {},

        periodPayables: 0,
        periodPayments: 0,
        periodReceipts: 0
    };

    private investing: Activity = {
        payments: {},
        receipts: {},

        periodPayables: 0,
        periodPayments: 0,
        periodReceipts: 0
    };

    private bankAccount: BankAccount;

    private initialCashFlowBalance: number;

    private periodPayments: number = 0;
    private periodReceipts: number = 0;

    lastPayables: number;

    static periodDaysNb: number;

    public static init(bankAccount: BankAccount, periodDaysNb: number, initialCashFlowBalance: number = 0, lastPayables: number = 0) {
        if (CashFlow._instance) {
            delete CashFlow._instance;
        }

        CashFlow._instance = new CashFlow();
        CashFlow._instance.bankAccount = bankAccount;
        CashFlow._instance.lastPayables = lastPayables;
        CashFlow._instance.initialCashFlowBalance = initialCashFlowBalance;

        this.periodDaysNb = periodDaysNb;

        // now pay payables of last period
        CashFlow._instance.bankAccount.withdraw(lastPayables);
    }


    constructor() {
        if (CashFlow._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }

        CashFlow._instance = this;
    }

    public static getInstance(): CashFlow {
        if (CashFlow._instance === null) {
            CashFlow._instance = new CashFlow();
        }

        return CashFlow._instance;
    }


    public static addPayment(total: number, paymentParams: ENUMS.PaymentArray, activityType: ENUMS.ACTIVITY = ENUMS.ACTIVITY.OPERATING) {
        var self = this.getInstance();

        var activity: Activity;

        switch (activityType) {
            case ENUMS.ACTIVITY.INVESTING:
                activity = self.investing;
                break;

            case ENUMS.ACTIVITY.FINANCING:
                activity = self.financing;
                break;

            case ENUMS.ACTIVITY.OPERATING:
                activity = self.operating;
                break;

            default:
                activity = self.operating;
                break;
        }

        for (var key in paymentParams) {
            if (!paymentParams.hasOwnProperty(key)) {
                continue;
            }

            var item = paymentParams[key];
            var amount = total * item.part;
            var credit = item.credit;

            var currPeriodPaymentsRatio;
            var currPeriodPayments;

            if (activity.payments[ENUMS.CREDIT[credit]] === undefined) {
                activity.payments[ENUMS.CREDIT[credit]] = 0;
            }

            activity.payments[ENUMS.CREDIT[credit]] += amount;

            if (credit === ENUMS.CREDIT.CASH) {
                currPeriodPaymentsRatio = 1;

            } else if (credit >= CashFlow.periodDaysNb) {
                currPeriodPaymentsRatio = 0;

            } else {
                currPeriodPaymentsRatio = 1 - credit / CashFlow.periodDaysNb;                
            }

            currPeriodPayments = Math.round(amount * currPeriodPaymentsRatio);
            activity.periodPayments += currPeriodPayments;

            activity.periodPayables += (amount - currPeriodPayments);

            // now pay
            self.bankAccount.withdraw(currPeriodPayments);

        }
        
    }

    public static addReceipt(total: number, paymentParams: ENUMS.PaymentArray, activityType: ENUMS.ACTIVITY = ENUMS.ACTIVITY.OPERATING) {
        var self = this.getInstance();

        var activity;

        switch (activityType) {
            case ENUMS.ACTIVITY.INVESTING:
                activity = self.investing
                break;

            case ENUMS.ACTIVITY.FINANCING:
                activity = self.financing;
                break;

            case ENUMS.ACTIVITY.OPERATING:
                activity = self.operating;
                break;

            default:
                activity = self.operating;
                break;
        }

        for (var key in paymentParams) {
            if (!paymentParams.hasOwnProperty(key)) {
                continue;
            }

            var item = paymentParams[key];
            var amount = total * item.part;
            var credit = item.credit;

            var currPeriodRatio;
            var currPeriodReceipts;

            if (activity.receipts[ENUMS.CREDIT[credit]] === undefined) {
                activity.receipts[ENUMS.CREDIT[credit]] = 0;
            }

            activity.receipts[ENUMS.CREDIT[credit]] += amount;

            if (credit === ENUMS.CREDIT.CASH) {
                currPeriodRatio = 1;

            } else if (credit >= CashFlow.periodDaysNb) {
                currPeriodRatio = 0;

            } else {
                currPeriodRatio = 1 - credit / CashFlow.periodDaysNb;
            }

            currPeriodReceipts = Math.round(amount * currPeriodRatio);
            activity.periodReceipts += currPeriodReceipts;

            // now receive money
            self.bankAccount.payIn(currPeriodReceipts);
        }
    }

    get tradingReceipts(): number {
        return this.operating.periodReceipts;
    }

    get tradingPayments(): number {
        return this.operating.periodPayments + this.lastPayables;
    }

    get tradePayablesValue(): number {
        return this.operating.periodPayables;
    }

    get assetsSales(): number {
        return this.investing.periodReceipts;
    }

    get assetsPurchases(): number {
        return this.investing.periodPayments;
    }

    get operatingNetCashFlow(): number {
        return this.operating.periodReceipts - this.operating.periodPayments;
    }

    get financingNetCashFlow(): number {
        return this.financing.periodReceipts - this.financing.periodPayments;
    }

    get investingNetCashFlow(): number {
        return this.investing.periodReceipts - this.investing.periodPayments;
    }

    get netCashFlow(): number {
        return this.operatingNetCashFlow + this.investingNetCashFlow + this.financingNetCashFlow;
    }

    get cashFlowBalance(): number {
        return this.netCashFlow + this.initialCashFlowBalance;
    }

    get previousBalance(): number {
        return this.initialCashFlowBalance;
    }

    public static getEndState(): any {
        var that = this.getInstance();
        var proto = this.prototype;
        var endState = {};
        var value;

        for (var key in proto) {
            value = that[key];

            if (typeof value === "object" || typeof value === "function") {
                continue;
            }

            endState[key] = value;
        }

        return endState;

    }
}


export = CashFlow;




