import Production = require('./Manufacturing/src/Production');
import Marketing = require('./Marketing/src/Marketing');
import Management = require('./Personnel/src/Management');
import Finance = require('./Finance/src/Finance');

import CashFlow = require('./Finance/src/CashFlow');

import Economy = require('./Environnement/src/Economy');


import ENUMS = require('./ENUMS');

import console = require('../../utils/logger');


export interface CompanyParams {
    taxAnnumRate: number;
    taxAssessedPaymentQuarter: number;
}

export class Company {
    private static _instance: Company = null;

    static params: CompanyParams;

    static ProductionDept: Production;
    static MarketingDept: Marketing;
    static ManagementDept: Management;
    static FinanceDept: Finance;

    static CashFlow: CashFlow;

    static economy: Economy;

    static currentQuarter: number;

    static lastTaxDue: number;
    static previousTaxableProfitLoss: number;

    static previousRetainedEarnings: number;

    public static init(params: CompanyParams, economy: Economy, ProductionDept: Production, MarketingDept: Marketing, FinanceDept: Finance, cashFlow: CashFlow, ManagementDept: Management, quarter: number, lastTaxDue: number, previousTaxableProfitLoss: number, previousRetainedEarnings: number) {
        if (Company._instance) {
            delete Company._instance;
        }

        Company._instance = new Company();

        Company.params = params;

        Company.economy = economy;

        Company.ProductionDept = ProductionDept;
        Company.MarketingDept = MarketingDept;
        Company.ManagementDept = ManagementDept;
        Company.FinanceDept = FinanceDept;

        Company.CashFlow = cashFlow;

        Company.currentQuarter = quarter;

        Company.lastTaxDue = lastTaxDue;
        Company.previousTaxableProfitLoss = previousTaxableProfitLoss;

        Company.previousRetainedEarnings = previousRetainedEarnings;
    }

    constructor() {
        if (Company._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }

        Company._instance = this;
    }

    public static getInstance(): Company {
        if (Company._instance === null) {
            Company._instance = new Company();
        }

        return Company._instance;
    }


    prepareCompanyBankFile(): ENUMS.Company_BankFile {
        var self = this;

        return {
            property: self.propertyValue,
            inventories: Company.ProductionDept.inventory_closingValue,
            taxDue: self.taxDue,
            tradeReceivables: Company.MarketingDept.salesOffice.tradeReceivablesValue,
            tradePayables: Company.CashFlow.tradePayablesValue
        };
    }

    get propertyValue(): number {
        var lands = Company.ProductionDept.landNetValue;
        var buildings = Company.ProductionDept.buildingsNetValue;

        return lands + buildings;
    }

    get productionCost(): number {
        var totalCost = 0;

        totalCost += Company.ProductionDept.inventory_openingValue;
        totalCost -= Company.ProductionDept.inventory_closingValue;

        totalCost += Company.ProductionDept.componentsPurchasedCost;
        totalCost += Company.ProductionDept.materialsPurchasedCost;
        totalCost += Company.ProductionDept.machinesRunningCost;
        totalCost += Company.ProductionDept.skilledWorkersWagesCost;
        totalCost += Company.ProductionDept.unskilledWorkersWagesCost;
        totalCost += Company.ProductionDept.qualityControlCostCost;

        totalCost += Company.MarketingDept.hiredTransportCost;

        return totalCost;
    }

    get administrativeExpensesTotalCost(): number {
        var totalCost = 0;

        totalCost += Company.MarketingDept.advertisingCost;
        totalCost += Company.MarketingDept.salesForceCost;

        totalCost += Company.MarketingDept.eCommerce.ISPCost;
        totalCost += Company.MarketingDept.eCommerce.internetDistributionCost;
        totalCost += Company.MarketingDept.eCommerce.websiteDevelopmentCost;

        totalCost += Company.MarketingDept.salesOffice.administrationCost;
        totalCost += Company.MarketingDept.salesOffice.creditControlCost;
        totalCost += Company.MarketingDept.intelligence.BusinessIntelligenceCost;

        totalCost += Company.ManagementDept.personnelCost;
        totalCost += Company.ManagementDept.managementCost;

        totalCost += Company.ProductionDept.guaranteeServicingCost;
        totalCost += Company.ProductionDept.productsDevelopmentCost;
        totalCost += Company.ProductionDept.machinesMaintenanceCost;
        totalCost += Company.ProductionDept.warehousingCost;
        totalCost += Company.ProductionDept.miscellaneousCost;

        totalCost += Company.FinanceDept.insurancesPremiumsCost;

        return totalCost;
    }

    get grossProfit(): number {
        var totalRevenues = Company.MarketingDept.salesOffice.salesRevenue;
        var productionCosts = this.productionCost;

        var grossProfit = totalRevenues - productionCosts;

        return grossProfit;
    }

    get operatingProfitLoss(): number {
        var result = this.grossProfit;

        result += Company.FinanceDept.insurancesReceipts;
        
        result -= this.administrativeExpensesTotalCost;
        result -= Company.ProductionDept.depreciation;

        return result;
    }

    get beforeTaxProfitLoss(): number {
        var result = this.operatingProfitLoss;

        result += Company.FinanceDept.interestReceived;
        result -= Company.FinanceDept.interestPaid;

        return result;
    }

    get previousTaxableProfitLoss(): number {
        // accumulate just for this year not previous
        if (Company.currentQuarter !== 1) {
            return Company.previousTaxableProfitLoss;
        }

        // case of loss last year
        if (Company.currentQuarter === 1 && Company.previousTaxableProfitLoss < 0) {
            return Company.previousTaxableProfitLoss;
        }

    }

    get taxableProfitLoss(): number {
        return this.beforeTaxProfitLoss + this.previousTaxableProfitLoss;
    }

    get taxDue(): number {
        if (Company.currentQuarter === 4) {
            if (this.taxableProfitLoss > 0) {
                return Math.round(this.taxableProfitLoss * Company.params.taxAnnumRate);
            }

            return 0;
        }

        else if (Company.currentQuarter !== Company.params.taxAssessedPaymentQuarter) {
            return Company.lastTaxDue;
        }

        return 0;
    }


    get taxAssessed(): number {
        if (Company.currentQuarter === 4) {
            return this.taxDue;
        }

        return 0;
    }

    get taxPaid(): number {
        if (Company.currentQuarter === Company.params.taxAssessedPaymentQuarter) {
            return this.taxDue;
        }

        return 0;
    }

    get currPeriodProfitLoss(): number {
        var result = this.beforeTaxProfitLoss - this.taxAssessed;

        return result;
    }

    get retainedEarningsTransfered(): number {
        return this.currPeriodProfitLoss - Company.FinanceDept.capital.dividendPaid;
    }

    get previousRetainedEarnings(): number {
        return Company.previousRetainedEarnings;
    }

    get retainedEarnings(): number {
        return this.retainedEarningsTransfered + this.previousRetainedEarnings;
    }

    get equityTotalValue(): number {
        var capital = Company.FinanceDept.capital;

        return capital.shareCapital + capital.sharePremiumAccount + this.retainedEarnings;
    }

    get nextPOverdraftLimit(): number {
        var company_bankFile = this.prepareCompanyBankFile();

        return Company.FinanceDept.calcOverdraftLimit(company_bankFile);
    }

    get nextPBorrowingPower(): number {
        return Company.FinanceDept.capital.marketValuation * 0.5 - Company.FinanceDept.termLoansValue - this.nextPOverdraftLimit;
    }

    get creditWorthiness(): number {
        return this.nextPBorrowingPower + Company.FinanceDept.cashValue;
    }
    

    public static getEndState(): any {
        var that = this.getInstance();
        var proto = this.prototype;
        var endState = {};

        for (var key in proto) {
            endState[key] = that[key];
        }

        return endState;

    }
}