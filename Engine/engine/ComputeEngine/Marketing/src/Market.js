var Warehouse = require('../../Manufacturing/src/Warehouse');
var ENUMS = require('../../ENUMS');
var Utils = require('../../../../utils/Utils');
var console = require('../../../../utils/logger');
var ObjectsManager = require('../../ObjectsManager');
var CashFlow = require('../../Finance/src/CashFlow');
var SubMarket = (function () {
    function SubMarket(market, params) {
        this.market = market;
        this.economy = this.market.economy;
        this.params = params;
    }
    SubMarket.prototype.init = function (product, salesForce, stockOpeningQ, stockOpeningValue, lastPBacklogQ) {
        if (stockOpeningValue === void 0) { stockOpeningValue = 0; }
        if (lastPBacklogQ === void 0) { lastPBacklogQ = 0; }
        this.reset();
        this.product = product;
        this.salesForce = salesForce;
        this.lastPBacklogQ = lastPBacklogQ;
        // create warehouse
        this.warehouse = new Warehouse({
            lostProbability: 0,
            costs: {
                fixedAdministrativeCost: 0,
                storageUnitCost: 0,
                externalStorageUnitCost: 0
            }
        });
        this.warehouse.stockedItem = this.product;
        this.warehouse.init(stockOpeningQ, stockOpeningValue);
        this.product.registerLocalStock(this.warehouse);
        this.product.on("MajorImprovementImplemented", this.onMajorImprovementImplemented, this);
        // now work
        this.initialised = true;
        ObjectsManager.register(this, "marketing");
    };
    SubMarket.prototype.reset = function () {
        this.orderedQ = 0;
        this.deliveredQ = 0;
        this.soldOffQ = 0;
        this.initialised = false;
    };
    /* the introduction of a major improvement renders existing models of the product obsolete.
     * You may, therefore, wish to reduce existing product stocks
     * Taking up a major improvement has no effect on any backlog of unfulfilled orders you may have.
    */
    SubMarket.prototype.onMajorImprovementImplemented = function () {
        console.debug("onMajorImprovementImplemented");
        var openingQ = this.warehouse.openingQ;
        this.soldOffQ = this.warehouse.moveOut(openingQ, true);
        console.debug('openQ', openingQ, this.soldOffQ);
    };
    Object.defineProperty(SubMarket.prototype, "soldQ", {
        get: function () {
            var demandQ = this.orderedQ + this.lastPBacklogQ;
            var supplyQ = this.deliveredQ + this.warehouse.openingQ - this.soldOffQ;
            return Math.min(demandQ, supplyQ);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "backlogQ", {
        get: function () {
            if (!this.params.acceptBacklog) {
                return 0;
            }
            return Math.floor(this.warehouse.shortfallQ * (1 - this.params.dissatisfiedOrdersCancelledPercent));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "stockQ", {
        get: function () {
            return this.warehouse.availableQ;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "salesRevenue", {
        get: function () {
            return this.soldQ * this.price;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "ordersValue", {
        get: function () {
            return this.orderedQ * this.price;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "soldOffValue", {
        get: function () {
            // todo fix for cmup with inventory value
            return this.soldOffQ * this.product.inventoryUnitValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "stockValue", {
        get: function () {
            // todo fix for cmup with inventory value
            return this.stockQ * this.product.inventoryUnitValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "tradingReceipts", {
        // cash flows
        get: function () {
            var currPeriodReceiptsRatio;
            if (this.customerCredit === ENUMS.CREDIT.CASH) {
                currPeriodReceiptsRatio = 1;
            }
            else if (this.customerCredit >= this.params.periodDaysNb) {
                currPeriodReceiptsRatio = 0;
            }
            else {
                var advance = 0.0092;
                currPeriodReceiptsRatio = 1 - this.customerCredit / this.params.periodDaysNb;
                currPeriodReceiptsRatio = Utils.toCeilDecimals(currPeriodReceiptsRatio, 2) + advance;
            }
            return this.salesRevenue * currPeriodReceiptsRatio;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "tradeReceivablesValue", {
        get: function () {
            return this.salesRevenue - this.tradingReceipts;
        },
        enumerable: true,
        configurable: true
    });
    // helpers
    // actions
    SubMarket.prototype.receiveFrom = function (quantity, product, price, adsBudget, customerCredit) {
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }
        var value = quantity * price;
        this.deliveredQ = quantity;
        this.price = price;
        this.advertisingBudget = adsBudget;
        this.customerCredit = customerCredit || this.params.defaultCustomerCredit;
        this.warehouse.moveIn(quantity, value);
        if (this.lastPBacklogQ > 0) {
            this.lastPBacklogQ -= this.getOrdersOf(this.lastPBacklogQ, false); // false not a new order
        }
        return true;
    };
    SubMarket.prototype.getOrdersOf = function (quantity, isNewOrder) {
        if (isNewOrder === void 0) { isNewOrder = true; }
        if (!this.initialised) {
            console.debug('not initialised');
            return 0;
        }
        if (isNewOrder) {
            this.orderedQ += quantity;
        }
        var deliveredQ;
        // normal material from stock
        deliveredQ = this.warehouse.moveOut(quantity, true); // true to accept even if there is a shortfall
        if (deliveredQ < quantity) {
        }
        this.returnForRepair();
        return deliveredQ;
    };
    SubMarket.prototype._calcReturnedQ = function () {
        return Math.round(this.soldQ * 0.0371);
    };
    SubMarket.prototype.returnForRepair = function () {
        var returnedQ = this._calcReturnedQ();
        this.product.returnForRepair(returnedQ);
    };
    SubMarket.prototype.getEndState = function () {
        var result = {};
        var state = {
            "effectiveDeliveredQ": this.deliveredQ,
            "orderedQ": this.orderedQ,
            "soldQ": this.soldQ,
            "backlogQ": this.backlogQ,
            "stockQ": this.stockQ
        };
        for (var key in state) {
            if (!state.hasOwnProperty(key)) {
                continue;
            }
            var prop = this.market.params.id + "_";
            prop += this.product.params.id + "_";
            prop += key;
            result[prop] = state[key];
        }
        return result;
    };
    return SubMarket;
})();
var Market = (function () {
    function Market(params) {
        this.params = params;
    }
    Market.prototype.init = function (economy, products, salesForce, transport, stocksOpeningQs, stocksOpeningValues, lastPBacklogQs, lastTradingReceivables) {
        if (stocksOpeningValues === void 0) { stocksOpeningValues = []; }
        if (lastPBacklogQs === void 0) { lastPBacklogQs = []; }
        if (lastTradingReceivables === void 0) { lastTradingReceivables = 0; }
        this.reset();
        this.economy = economy;
        this.salesForce = salesForce;
        this.transport = transport;
        this.lastTradingReceivables = lastTradingReceivables;
        this.transport.init(this);
        this.salesForce.market = this;
        var i = 0, len = products.length, productCode, subMarket;
        this.subMarkets = [];
        for (; i < len; i++) {
            productCode = products[i].params.code;
            subMarket = new SubMarket(this, this.params);
            subMarket.init(products[i], salesForce, stocksOpeningQs[i], stocksOpeningValues[i], lastPBacklogQs[i]);
            this.subMarkets[productCode] = subMarket;
        }
        // now work
        this.initialised = true;
        ObjectsManager.register(this, "marketing");
    };
    Market.prototype.reset = function () {
        this.initialised = false;
    };
    Object.defineProperty(Market.prototype, "hiredTransportCost", {
        // results
        get: function () {
            return this.transport.hiredTransportCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "salesRevenue", {
        get: function () {
            // aggregate sales revenue of all subMarkets
            return Utils.sums(this.subMarkets, "salesRevenue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "tradingReceipts", {
        // cash flows
        get: function () {
            return Utils.sums(this.subMarkets, "tradingReceipts");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "tradeReceivablesValue", {
        get: function () {
            return Utils.sums(this.subMarkets, "tradeReceivablesValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "soldUnitsNb", {
        get: function () {
            return Utils.sums(this.subMarkets, "soldQ");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "ordersValue", {
        get: function () {
            return Utils.sums(this.subMarkets, "ordersValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "soldOffValue", {
        get: function () {
            return Utils.sums(this.subMarkets, "soldOffValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "stockValue", {
        get: function () {
            return Utils.sums(this.subMarkets, "stockValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "advertisingCost", {
        get: function () {
            var total = 0, i = 0, len = this.subMarkets.length;
            total += this.corporateComBudget;
            for (; i < len; i++) {
                total += this.subMarkets[i].advertisingBudget;
            }
            return total;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "creditControlCost", {
        get: function () {
            return this.soldUnitsNb * (this.params.costs.creditControlUnitCost + this.params.costs.creditCardRatePerUnitSold);
        },
        enumerable: true,
        configurable: true
    });
    // actions
    Market.prototype.receiveFrom = function (quantity, product, price, adsBudget, customerCredit) {
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }
        this.transport.load(quantity / product.params.containerCapacityUnitsNb);
        var subMarket = this.subMarkets[product.params.code];
        return subMarket && subMarket.receiveFrom.apply(subMarket, arguments);
    };
    Market.prototype.setCorporateCom = function (corporateComBudget) {
        if (!this.initialised) {
            console.debug('not initialised');
            return false;
        }
        this.corporateComBudget = corporateComBudget;
        return true;
    };
    // for test purpose
    Market.prototype.__simulate = function (orders) {
        var i = 0, len = orders.length;
        var notTaken = [];
        for (; i < len; i++) {
            notTaken.push(this.subMarkets[i].getOrdersOf(orders[i]));
        }
        return notTaken;
    };
    Market.prototype.onFinish = function () {
        CashFlow.addPayment(this.advertisingCost, this.params.payments.advertising);
    };
    Market.prototype.getEndState = function () {
        var result = {};
        var state = {};
        for (var key in state) {
            if (!state.hasOwnProperty(key)) {
                continue;
            }
            var prop = this.params.id + "_";
            prop += key;
            result[prop] = state[key];
        }
        return result;
    };
    return Market;
})();
module.exports = Market;
//# sourceMappingURL=Market.js.map