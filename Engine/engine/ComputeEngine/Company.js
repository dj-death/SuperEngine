var Company = (function () {
    function Company() {
        if (Company._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }
        Company._instance = this;
    }
    Company.init = function (params, economy, ProductionDept, MarketingDept, FinanceDept, cashFlow, ManagementDept, quarter, lastTaxDue, previousTaxableProfitLoss, previousRetainedEarnings) {
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
    };
    Company.getInstance = function () {
        if (Company._instance === null) {
            Company._instance = new Company();
        }
        return Company._instance;
    };
    Company.prototype.prepareCompanyBankFile = function () {
        var self = this;
        return {
            property: self.propertyValue,
            inventories: Company.ProductionDept.inventory_closingValue,
            taxDue: self.taxDue,
            tradeReceivables: Company.MarketingDept.salesOffice.tradeReceivablesValue,
            tradePayables: Company.CashFlow.tradePayablesValue
        };
    };
    Object.defineProperty(Company.prototype, "propertyValue", {
        get: function () {
            var lands = Company.ProductionDept.landNetValue;
            var buildings = Company.ProductionDept.buildingsNetValue;
            return lands + buildings;
        },
        enumerable: true,
        configurable: true
    });
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
            result += Company.FinanceDept.insurancesReceipts;
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
            result += Company.FinanceDept.interestReceived;
            result -= Company.FinanceDept.interestPaid;
            return result;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "previousTaxableProfitLoss", {
        get: function () {
            // accumulate just for this year not previous
            if (Company.currentQuarter !== 1) {
                return Company.previousTaxableProfitLoss;
            }
            // case of loss last year
            if (Company.currentQuarter === 1 && Company.previousTaxableProfitLoss < 0) {
                return Company.previousTaxableProfitLoss;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "taxableProfitLoss", {
        get: function () {
            return this.beforeTaxProfitLoss + this.previousTaxableProfitLoss;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "taxDue", {
        get: function () {
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
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "taxAssessed", {
        get: function () {
            if (Company.currentQuarter === 4) {
                return this.taxDue;
            }
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "taxPaid", {
        get: function () {
            if (Company.currentQuarter === Company.params.taxAssessedPaymentQuarter) {
                return this.taxDue;
            }
            return 0;
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
    Object.defineProperty(Company.prototype, "retainedEarningsTransfered", {
        get: function () {
            return this.currPeriodProfitLoss - Company.FinanceDept.capital.dividendPaid;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "previousRetainedEarnings", {
        get: function () {
            return Company.previousRetainedEarnings;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "retainedEarnings", {
        get: function () {
            return this.retainedEarningsTransfered + this.previousRetainedEarnings;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "equityTotalValue", {
        get: function () {
            var capital = Company.FinanceDept.capital;
            return capital.shareCapital + capital.sharePremiumAccount + this.retainedEarnings;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "nextPOverdraftLimit", {
        get: function () {
            var company_bankFile = this.prepareCompanyBankFile();
            return Company.FinanceDept.calcOverdraftLimit(company_bankFile);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "nextPBorrowingPower", {
        get: function () {
            return Company.FinanceDept.capital.marketValuation * 0.5 - Company.FinanceDept.termLoansValue - this.nextPOverdraftLimit;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "creditWorthiness", {
        get: function () {
            return this.nextPBorrowingPower + Company.FinanceDept.cashValue;
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