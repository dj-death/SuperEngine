var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Model = require('./Model');
var schema = require('../schemas/CompanyDecision');
var Q = require('q');
var CompanyDecisionModel = (function (_super) {
    __extends(CompanyDecisionModel, _super);
    function CompanyDecisionModel() {
        _super.call(this, CompanyDecisionModel.name, CompanyDecisionModel.schema);
    }
    CompanyDecisionModel.prototype.remove = function (seminarId, companyId) {
        if (!this.Mongoose.connection.readyState) {
            throw new Error("mongoose is not connected.");
        }
        var deferred = Q.defer();
        if (!seminarId) {
            deferred.reject(new Error("Invalid argument seminarId"));
        }
        else {
            this.Model.remove({
                seminarId: seminarId,
                d_CID: companyId
            }, function (err) {
                if (err) {
                    return deferred.reject(err);
                }
                else {
                    return deferred.resolve(null);
                }
            });
        }
        return deferred.promise;
    };
    CompanyDecisionModel.prototype.removeAll = function (seminarId) {
        if (!this.Mongoose.connection.readyState) {
            throw new Error("mongoose is not connected.");
        }
        var deferred = Q.defer();
        if (!seminarId) {
            deferred.reject(new Error("Invalid argument seminarId"));
        }
        else {
            this.Model.remove({ seminarId: seminarId }, function (err) {
                if (err) {
                    return deferred.reject(err);
                }
                else {
                    return deferred.resolve(null);
                }
            });
        }
        return deferred.promise;
    };
    CompanyDecisionModel.prototype.save = function (decision) {
        if (!this.Mongoose.connection.readyState) {
            throw new Error("mongoose is not connected.");
        }
        var deferred = Q.defer();
        if (!decision) {
            deferred.reject(new Error("Invalid argument decision."));
        }
        else {
            //decision = Convertor.extractDecision(decision);
            var decisionResult = new this.Model(decision);
            decisionResult.save(function (err, saveDecision, numAffected) {
                if (err) {
                    deferred.reject(err);
                }
                else {
                    deferred.resolve(saveDecision);
                }
            });
        }
        return deferred.promise;
    };
    CompanyDecisionModel.prototype.findOne = function (seminarId, period, companyId) {
        if (!this.Mongoose.connection.readyState) {
            throw new Error("mongoose is not connected.");
        }
        var deferred = Q.defer();
        if (!seminarId) {
            deferred.reject(new Error("Invalid argument seminarId"));
        }
        else if (period === undefined) {
            deferred.reject(new Error("Invalid argument period."));
        }
        else {
            this.Model.findOne({
                seminarId: seminarId,
                period: period,
                d_CID: companyId
            }, function (err, result) {
                if (err) {
                    return deferred.reject(err);
                }
                else {
                    return deferred.resolve(result);
                }
            });
        }
        return deferred.promise;
    };
    CompanyDecisionModel.prototype.updateCompanyDecision = function (seminarId, period, companyId, companyDecision) {
        if (!this.Mongoose.connection.readyState) {
            throw new Error("mongoose is not connected.");
        }
        var deferred = Q.defer();
        if (!seminarId) {
            deferred.reject(new Error("Invalid argument seminarId."));
        }
        else if (period === undefined) {
            deferred.reject(new Error("Invalid argument period."));
        }
        else if (!companyId) {
            deferred.reject(new Error("Invalid argument companyId."));
        }
        else if (!companyDecision) {
            deferred.reject(new Error("Invalid argument companyDecision."));
        }
        else {
            this.Model.findOne({
                seminarId: seminarId,
                period: period,
                d_CID: companyId
            }, function (err, doc) {
                if (err) {
                    return deferred.reject(err);
                }
                if (!doc) {
                    var validateErr = new Error('Cannot find company Decision not found.');
                    return deferred.reject(validateErr);
                }
                var fields = ['d_RequestedAdditionalBudget', 'd_InvestmentInEfficiency', 'd_InvestmentInTechnology', 'd_InvestmentInServicing'];
                fields.forEach(function (field) {
                    if (companyDecision[field] !== undefined) {
                        doc.modifiedField = field;
                        doc[field] = companyDecision[field];
                    }
                });
                doc.save(function (err, doc) {
                    if (err) {
                        deferred.reject(err);
                    }
                    else {
                        return deferred.resolve(doc);
                    }
                });
            });
        }
        return deferred.promise;
    };
    CompanyDecisionModel.prototype.findAllInPeriod = function (seminarId, period) {
        if (!this.Mongoose.connection.readyState) {
            throw new Error("mongoose is not connected.");
        }
        var deferred = Q.defer();
        this.Model.find({
            seminarId: seminarId,
            period: period
        }, function (err, result) {
            if (err)
                return deferred.reject(err);
            return deferred.resolve(result);
        });
        return deferred.promise;
    };
    /**
 * Insert empty company decisions for all companies in the next period
 */
    CompanyDecisionModel.prototype.insertEmptyCompanyDecision = function (seminarId, period) {
        if (!this.Mongoose.connection.readyState) {
            throw new Error("mongoose is not connected.");
        }
        //find all company decisions in the last period
        return this.findAllInPeriod(seminarId, period - 1).then(function (allCompanyDecisions) {
            var p = Q();
            allCompanyDecisions.forEach(function (companyDecision) {
                p = p.then(function () {
                    return this.save({
                        seminarId: seminarId,
                        period: period,
                        d_CID: companyDecision.d_CID,
                        d_CompanyName: companyDecision.d_CompanyName,
                        d_BrandsDecisions: companyDecision.d_BrandsDecisions
                    });
                });
            });
            return p;
        });
    };
    CompanyDecisionModel.name = "CompanyDecision";
    CompanyDecisionModel.schema = schema;
    return CompanyDecisionModel;
})(Model);
var CDM = new CompanyDecisionModel();
module.exports = CDM;
//# sourceMappingURL=Decision.js.map