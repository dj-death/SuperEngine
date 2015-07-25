function extractDecision(v) {
    var decision = {
        seminarId: v.seminarId,
        groupId: v.groupId,
        period: v.period,
        d_CID: v.CID,
        d_CompanyName: v.CompanyName,
        markets: [
            {
                corporateComBudget: v.m1_corporate,
                agents: [{
                    appointedNb: v.m1_agents_appointedNb,
                    commissionRate: v.m1_agents_commissionRate,
                    support: v.m1_agents_support
                }],
                subMarkets: [{
                    advertisingBudget: v.m1_p1_advertising,
                    price: v.m1_p1_price,
                    deliveredQ: v.m1_p1_deliveredQ
                }, {
                    advertisingBudget: v.m1_p2_advertising,
                    price: v.m1_p2_price,
                    deliveredQ: v.m1_p2_deliveredQ
                }, {
                    advertisingBudget: v.m1_p3_advertising,
                    price: v.m1_p3_price,
                    deliveredQ: v.m1_p3_deliveredQ
                }]
            },
            {
                corporateComBudget: v.m2_corporate,
                agents: [{
                    appointedNb: v.m2_agents_appointedNb,
                    commissionRate: v.m2_agents_commissionRate,
                    support: v.m2_agents_support
                }],
                subMarkets: [{
                    advertisingBudget: v.m2_p1_advertising,
                    price: v.m2_p1_price,
                    deliveredQ: v.m2_p1_deliveredQ
                }, {
                    advertisingBudget: v.m2_p2_advertising,
                    price: v.m2_p2_price,
                    deliveredQ: v.m2_p2_deliveredQ
                }, {
                    advertisingBudget: v.m2_p3_advertising,
                    price: v.m2_p3_price,
                    deliveredQ: v.m2_p3_deliveredQ
                }]
            },
            {
                corporateComBudget: v.m3_corporate,
                agents: [{
                    appointedNb: 0,
                    commissionRate: v.m3_agents_commissionRate,
                    support: v.m3_agents_support
                }],
                subMarkets: [{
                    advertisingBudget: v.m3_p1_advertising,
                    price: v.m3_p1_price,
                    deliveredQ: v.m3_p1_deliveredQ
                }, {
                    advertisingBudget: v.m3_p2_advertising,
                    price: v.m3_p2_price,
                    deliveredQ: v.m3_p2_deliveredQ
                }, {
                    advertisingBudget: v.m3_p3_advertising,
                    price: v.m3_p3_price,
                    deliveredQ: v.m3_p3_deliveredQ
                }]
            }
        ],
        products: [
            {
                manufacturingTime: [0, v.p1_assemblyTime],
                improvementsTakeup: v.p1_takeupImprovements,
                developmentBudget: v.p1_devBudget,
                premiumMaterialPropertion: v.p1_premiumMaterialProp,
                componentsOrdered: v.p1_subcontractQ
            },
            {
                manufacturingTime: [0, v.p2_assemblyTime],
                improvementsTakeup: v.p2_takeupImprovements,
                developmentBudget: v.p2_devBudget,
                premiumMaterialPropertion: v.p2_premiumMaterialProp,
                componentsOrdered: v.p2_subcontractQ
            },
            {
                manufacturingTime: [0, v.p3_assemblyTime],
                improvementsTakeup: v.p3_takeupImprovements,
                developmentBudget: v.p3_devBudget,
                premiumMaterialPropertion: v.p3_premiumMaterialProp,
                componentsOrdered: v.p3_subcontractQ
            }
        ],
        materials: [{
            purchases: [{
                term: 0,
                quantity: v.purchases_spotQ
            }, {
                term: 1,
                quantity: v.purchases_3mthQ
            }, {
                term: 2,
                quantity: v.purchases_6mthQ
            }]
        }],
        machines: [{
            maintenanceHours: v.machine_maintenance_hoursNb,
            boughtNb: v.machine_boughtNb,
            soldNb: v.machine_soldNb
        }],
        shiftLevel: v.shift_level,
        factories: [{
            extension: v.factory_extension
        }],
        websitePortsNb: v.website_portsNb,
        websiteDevBudget: v.website_devBudget,
        insurancePlan: v.insurance_plan,
        sharesVariation: v.shares_variation,
        termLoans: v.term_loans,
        termDeposit: v.term_deposit,
        dividend: v.dividend,
        orderMarketSharesInfo: v.intelligence_marketShares_order,
        orderCorporateActivityInfo: v.intelligence_corporateInfo_order,
        staffTrainingDays: v.management_trainning,
        managementBudget: v.management_budget,
        workers: [{
            hourlyWageRate: v.assemblyWorkers_wageRate,
            hire: 0,
            trainedNb: 0
        }, {
            hourlyWageRate: v.assemblyWorkers_wageRate,
            hire: v.assemblyWorkers_hire,
            trainedNb: v.assemblyWorkers_trainedNb
        }]
    };
    return decision;
}
exports.extractDecision = extractDecision;
//# sourceMappingURL=decision.js.map