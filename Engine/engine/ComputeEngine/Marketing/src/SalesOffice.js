var ObjectsManager = require('../../ObjectsManager');
var Utils = require('../../../../utils/Utils');
var CashFlow = require('../../Finance/src/CashFlow');
var SalesOffice = (function () {
    function SalesOffice(params) {
        this.params = params;
    }
    SalesOffice.prototype.init = function (markets, lastTradingReceivables) {
        if (lastTradingReceivables === void 0) { lastTradingReceivables = 0; }
        this.reset();
        this.markets = markets;
        this.lastTradingReceivables = lastTradingReceivables;
        this.initialised = true;
        ObjectsManager.register(this, "marketing");
    };
    SalesOffice.prototype.reset = function () {
        this.initialised = false;
    };
    Object.defineProperty(SalesOffice.prototype, "scrapsRevenue", {
        get: function () {
            var productsNb = this.markets[0] && this.markets[0].subMarkets.length, sums = 0, product, i = 0;
            for (; i < productsNb; i++) {
                product = this.markets[0].subMarkets[i].product;
                sums += product.scrapRevenue;
            }
            return sums;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SalesOffice.prototype, "productsSalesRevenue", {
        // result
        get: function () {
            return Utils.sums(this.markets, "salesRevenue");
            +Utils.sums(this.markets, "soldOffValue") + this.scrapsRevenue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SalesOffice.prototype, "soldOffRevenue", {
        get: function () {
            return Utils.sums(this.markets, "soldOffValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SalesOffice.prototype, "salesRevenue", {
        get: function () {
            return this.productsSalesRevenue + this.soldOffRevenue + this.scrapsRevenue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SalesOffice.prototype, "ordersValue", {
        get: function () {
            return Utils.sums(this.markets, "ordersValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SalesOffice.prototype, "creditControlCost", {
        // costs 
        get: function () {
            return Utils.sums(this.markets, "creditControlCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SalesOffice.prototype, "administrationCost", {
        get: function () {
            return Math.round(this.params.costs.administrationCostRate * Math.max(this.salesRevenue, this.ordersValue));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SalesOffice.prototype, "tradingReceipts", {
        // cash flows
        get: function () {
            var total;
            var unpayedFromLastTradeReceivables = 0.0962;
            var tradingReceiptsFromLastP = this.lastTradingReceivables * (1 - unpayedFromLastTradeReceivables);
            var otherSales = this.soldOffRevenue + this.scrapsRevenue;
            total = Utils.sums(this.markets, "tradingReceipts") + tradingReceiptsFromLastP + otherSales;
            return Math.ceil(total);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SalesOffice.prototype, "tradeReceivablesValue", {
        get: function () {
            return this.lastTradingReceivables + this.salesRevenue - this.tradingReceipts;
        },
        enumerable: true,
        configurable: true
    });
    SalesOffice.prototype.onFinish = function () {
        CashFlow.addPayment(this.administrationCost, this.params.payments);
        CashFlow.addPayment(this.creditControlCost, this.params.payments);
        CashFlow.addReceipt(this.tradingReceipts, this.params.receipts);
    };
    SalesOffice.prototype.getEndState = function () {
        var result = {};
        var state = {
            "salesRevenue": this.salesRevenue,
            "creditControlCost": this.creditControlCost,
            "salesOfficeCost": this.administrationCost,
            "tradeReceivablesValue": this.tradeReceivablesValue
        };
        return state;
    };
    return SalesOffice;
})();
module.exports = SalesOffice;
//# sourceMappingURL=SalesOffice.js.map