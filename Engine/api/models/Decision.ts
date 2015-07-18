import Model = require('./Model');
import Convertor = require('../convertors/decision');

import schema = require('../schemas/CompanyDecision');

var Q = require('q');

class CompanyDecisionModel extends Model {
    static name = "CompanyDecision";
    static schema = schema;

    constructor() {
        super(CompanyDecisionModel.name, CompanyDecisionModel.schema);
    }

    remove (seminarId: string, companyId: string) {
        if (!this.Mongoose.connection.readyState) {
            throw new Error("mongoose is not connected.");
        }

        var deferred = Q.defer();

        if (!seminarId) {
            deferred.reject(new Error("Invalid argument seminarId"));
        } else {
            this.Model.remove({
                seminarId: seminarId,
                d_CID: companyId
            },
                function (err) {
                    if (err) {
                        return deferred.reject(err);
                    } else {
                        return deferred.resolve(null);
                    }
                });
        }

        return deferred.promise;
    }


    removeAll (seminarId) {
        if (!this.Mongoose.connection.readyState) {
            throw new Error("mongoose is not connected.");
        }

        var deferred = Q.defer();

        if (!seminarId) {
            deferred.reject(new Error("Invalid argument seminarId"));
        } else {
            this.Model.remove({ seminarId: seminarId }, function (err) {
                if (err) {
                    return deferred.reject(err);
                } else {
                    return deferred.resolve(null);
                }
            });
        }

        return deferred.promise;
    }


    save (decision) {
        if (!this.Mongoose.connection.readyState) {
            throw new Error("mongoose is not connected.");
        }

        var deferred = Q.defer();

        if (!decision) {
            deferred.reject(new Error("Invalid argument decision."));
        } else {
            //decision = Convertor.extractDecision(decision);
            var decisionResult = new this.Model(decision);

            decisionResult.save(function (err, saveDecision, numAffected) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(saveDecision);
                }
            });

            /*this.Model.remove({
                seminarId: decisionResult.seminarId,
                period: decisionResult.period,
                d_CID: decisionResult.d_CID
            }, function (err, numberRemoved) {
                    if (err) { return deferred.reject(err); }

                    if (numberRemoved === 0 && decision.reRunLastRound) {
                        return deferred.reject(new Error('There are no Company decisions deleted when create Company Decisions'));
                    }

                    decisionResult.save(function (err, saveDecision, numAffected) {
                        if (err) {
                            deferred.reject(err);
                        } else {
                            deferred.resolve(saveDecision);
                        }
                    });
                })*/

        }

        return deferred.promise;
    }

    findOne (seminarId, period, companyId) {
        if (!this.Mongoose.connection.readyState) {
            throw new Error("mongoose is not connected.");
        }

        var deferred = Q.defer();

        if (!seminarId) {
            deferred.reject(new Error("Invalid argument seminarId"));
        } else if (period === undefined) {
            deferred.reject(new Error("Invalid argument period."));
        } else {
            this.Model.findOne({
                seminarId: seminarId,
                period: period,
                d_CID: companyId
            }, function (err, result) {
                    if (err) {
                        return deferred.reject(err);
                    } else {
                        return deferred.resolve(result);
                    }
                })
        }

        return deferred.promise;
    }

    updateCompanyDecision (seminarId, period, companyId, companyDecision) {
        if (!this.Mongoose.connection.readyState) {
            throw new Error("mongoose is not connected.");
        }

        var deferred = Q.defer();

        if (!seminarId) {
            deferred.reject(new Error("Invalid argument seminarId."));
        } else if (period === undefined) {
            deferred.reject(new Error("Invalid argument period."));
        } else if (!companyId) {
            deferred.reject(new Error("Invalid argument companyId."));
        } else if (!companyDecision) {
            deferred.reject(new Error("Invalid argument companyDecision."))
        } else {
            this.Model.findOne({
                seminarId: seminarId,
                period: period,
                d_CID: companyId
            }, function (err, doc) {
                    if (err) { return deferred.reject(err); }

                    if (!doc) {
                        var validateErr = new Error('Cannot find company Decision not found.');
                        return deferred.reject(validateErr);
                    }

                    var fields = ['d_RequestedAdditionalBudget',
                        'd_InvestmentInEfficiency',
                        'd_InvestmentInTechnology',
                        'd_InvestmentInServicing'];

                    fields.forEach(function (field) {
                        if (companyDecision[field] !== undefined) {
                            doc.modifiedField = field;
                            doc[field] = companyDecision[field];
                        }
                    });

                    doc.save(function (err, doc) {
                        if (err) { deferred.reject(err); }
                        else { return deferred.resolve(doc); }
                    });



                });
        }
        return deferred.promise;
    }

    findAllInPeriod (seminarId, period) {
        if (!this.Mongoose.connection.readyState) {
            throw new Error("mongoose is not connected.");
        }

        var deferred = Q.defer();

        this.Model.find({
            seminarId: seminarId,
            period: period
        }, function (err, result) {
                if (err) return deferred.reject(err);

                return deferred.resolve(result);
            })

        return deferred.promise;
    }

    /**
 * Insert empty company decisions for all companies in the next period
 */
    insertEmptyCompanyDecision (seminarId, period) {
        if (!this.Mongoose.connection.readyState) {
            throw new Error("mongoose is not connected.");
        }

        //find all company decisions in the last period
        return this.findAllInPeriod(seminarId, period - 1)
            .then(function (allCompanyDecisions) {
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
            })
            return p;
        })
    }


}

var CDM = new CompanyDecisionModel();

export = CDM;

