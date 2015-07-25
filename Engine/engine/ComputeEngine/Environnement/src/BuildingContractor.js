var ObjectsManager = require('../../ObjectsManager');
var BuildingContractor = (function () {
    function BuildingContractor(params) {
        this.initialised = false;
        this.params = params;
    }
    BuildingContractor.prototype.init = function (economy, lastBuildingSquareMetreCost) {
        this.reset();
        this.economy = economy;
        this.initialBuildingSquareMetreCost = lastBuildingSquareMetreCost;
        this.initialised = true;
        ObjectsManager.register(this, "environnement", true);
    };
    BuildingContractor.prototype.reset = function () {
        this._buildingSquareMetreCost = undefined;
        this.initialBuildingSquareMetreCost = undefined;
        this.initialised = false;
    };
    Object.defineProperty(BuildingContractor.prototype, "buildingSquareMetreCost", {
        // result
        get: function () {
            var initialExchangeRate = this.economy.currency.initialExchangeRate;
            return this.initialBuildingSquareMetreCost * initialExchangeRate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BuildingContractor.prototype, "reelTimeBuildingSquareMetreCost", {
        get: function () {
            var quotedExchangeRate = this.economy.currency.quotedExchangeRate;
            return this._buildingSquareMetreCost * quotedExchangeRate;
        },
        enumerable: true,
        configurable: true
    });
    // helper
    BuildingContractor.prototype.simulate = function () {
        if (this.params.areCostsStable) {
            this._buildingSquareMetreCost = this.initialBuildingSquareMetreCost;
            return;
        }
        // TEST purposes
        this._buildingSquareMetreCost = 500;
    };
    BuildingContractor.prototype.build = function (requiredBuildingSquaresNb, client_creditWorthiness) {
        var worksDuration = this.params.minWorksDuration;
        if (!this.params.checkClientCreditWorthiness) {
            return {
                squaresNb: requiredBuildingSquaresNb,
                duration: worksDuration
            };
        }
        var effectiveBuildingSquaresNb;
        var plannedBuildingTotalCost = requiredBuildingSquaresNb * this.initialBuildingSquareMetreCost;
        if (plannedBuildingTotalCost <= client_creditWorthiness) {
            effectiveBuildingSquaresNb = requiredBuildingSquaresNb;
        }
        else {
            // Verifiy
            effectiveBuildingSquaresNb = Math.floor(client_creditWorthiness / this.initialBuildingSquareMetreCost);
        }
        return {
            duration: worksDuration,
            squaresNb: effectiveBuildingSquaresNb
        };
    };
    BuildingContractor.prototype.getEndState = function () {
        var state = {
            "buildingCost": this._buildingSquareMetreCost
        };
        return state;
    };
    return BuildingContractor;
})();
module.exports = BuildingContractor;
//# sourceMappingURL=BuildingContractor.js.map