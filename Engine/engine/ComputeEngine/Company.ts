import Production = require('./Manufacturing/src/Production');
import Marketing = require('./Marketing/src/Marketing');
import Management = require('./Personnel/src/Management');
import Finance = require('./Finance/src/Finance');

import Economy = require('./Environnement/src/Economy');


import ENUMS = require('./ENUMS');

import console = require('../../utils/logger');


export interface CompanyParams {
    defaultShareCapital: number;
}

export class Company {
    private static _instance: Company = null;

    static params: CompanyParams;

    static ProductionDept: Production;
    static MarketingDept: Marketing;
    static ManagementDept: Management;
    static FinanceDept: Finance;

    static economy: Economy;

    static initialShareCapital: number;

    public static init(params: CompanyParams, economy: Economy, ProductionDept: Production, MarketingDept: Marketing, FinanceDept: Finance, ManagementDept: Management, initialShareCapital?: number) {
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

        Company.initialShareCapital = initialShareCapital ? initialShareCapital : Company.params.defaultShareCapital;
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
            tradePayables: 0//self.tradePayablesValue
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

    get taxAssessed(): number {
        return -1;
    }

    get currPeriodProfitLoss(): number {
        var result = this.beforeTaxProfitLoss - this.taxAssessed;

        return result;
    }

    get taxDue(): number {
        return 0;
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