var Company = (function () {
    function Company() {
        if (Company._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }
        Company._instance = this;
    }
    Company.init = function (params, economy, ProductionDept, MarketingDept, FinanceDept, ManagementDept, initialShareCapital) {
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
    };
    Company.getInstance = function () {
        if (Company._instance === null) {
            Company._instance = new Company();
        }
        return Company._instance;
    };
    Object.defineProperty(Company.prototype, "productionCost", {
        get: function () {
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
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "administrativeExpensesTotalCost", {
        get: function () {
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
            totalCost += Company.FinanceDept.insurance.premiumsCost;
            return totalCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "grossProfit", {
        get: function () {
            var totalRevenues = Company.MarketingDept.salesOffice.salesRevenue;
            var productionCosts = this.productionCost;
            var grossProfit = totalRevenues - productionCosts;
            return grossProfit;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "operatingProfitLoss", {
        get: function () {
            var result = this.grossProfit;
            result += Company.FinanceDept.insurance.receipts;
            result -= this.administrativeExpensesTotalCost;
            result -= Company.ProductionDept.depreciation;
            return result;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "beforeTaxProfitLoss", {
        get: function () {
            var result = this.operatingProfitLoss;
            // adding finances income
            // susctract finances expenses
            return result;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "taxAssessed", {
        get: function () {
            return -1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "currPeriodProfitLoss", {
        get: function () {
            var result = this.beforeTaxProfitLoss - this.taxAssessed;
            return result;
        },
        enumerable: true,
        configurable: true
    });
    Company.getEndState = function () {
        var that = this.getInstance();
        var proto = this.prototype;
        var endState = {};
        for (var key in proto) {
            endState[key] = that[key];
        }
        return endState;
    };
    Company._instance = null;
    return Company;
})();
exports.Company = Company;
//# sourceMappingURL=Company.js.map