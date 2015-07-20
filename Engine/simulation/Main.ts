import ENUMS = require('../engine/ComputeEngine/ENUMS');
// Sim Objects
import  o = require('./Objects');

import Utils = require('../utils/Utils');
import console = require('../utils/logger');

var exchangeRateEurosPerDollar;	

var CONSTS = {
    assemblyWorker_shiftLevel: 1,
    assemblyMaterial: 0,

    machinists_strikeNextPeriodWeeksNb: 0,

    alphaA_consoUnit: o.alphaA.params.rawMaterialConsoCfg.consoUnit || 1,
    alphaB_consoUnit: o.alphaB.params.rawMaterialConsoCfg.consoUnit || 2,
    alphaC_consoUnit: o.alphaC.params.rawMaterialConsoCfg.consoUnit || 3,

    HQMaterials_premium: o.supplier.params.unplannedPurchasesPremium || 0.5,

    // minutes
    p1_machiningTime: o.alphaA.params.manufacturingCfg.minManufacturingUnitTime || 60,
    p2_machiningTime: o.alphaB.params.manufacturingCfg.minManufacturingUnitTime || 75,
    p3_machiningTime: o.alphaC.params.manufacturingCfg.minManufacturingUnitTime || 120,

    p1_minAssemblyTime: o.betaA.params.manufacturingCfg.minManufacturingUnitTime || 100,
    p2_minAssemblyTime: o.betaB.params.manufacturingCfg.minManufacturingUnitTime || 150,
    p3_minAssemblyTime: o.betaC.params.manufacturingCfg.minManufacturingUnitTime || 300,

    p1_unitValue: 98,
    p2_unitValue: 157,
    p3_unitValue: 254,

    internet_agents_appointedNb: o.eCommerce.params.distributorsNb || 1,

    machinesStats: o.machinesStates
};

function getImprovementType(str: string) {
    return ENUMS.IMPROVEMENT_TYPE[str.toUpperCase()];
}


export function getObjects() {
    return o;
}

export function initEnvironnemet(lastState, currPeriod: number) {
    o.ObjectsManager.init(false);

    var dollar2EuroExchangeRate = lastState.exchangeRatePerCent / 100;

    o.euro.init();
    o.dollar.init(dollar2EuroExchangeRate);

    o.ECB.init(lastState.m1_interestBaseRatePerThousand / 1000);
    o.FED.init(lastState.m2_interestBaseRatePerThousand / 1000);

    // banks
    o.eurobank.init(o.ECB);

    // init economics
    o.europe.init(o.europeanLabourPool, o.euro, o.ECB);
    o.northAmerica.init(o.americanLabourPool, o.dollar, o.FED);
    o.restOfDevelopedWorld.init(null, o.dollar);
    o.world.init(null, o.dollar);

    // init materials market
    var materialPrices = [lastState.material_spotPrice, lastState.material_3mthPrice, lastState.material_6mthPrice];
    o.materialMarket.init(o.world, materialPrices);

    o.buildingContractor.init(o.europe, lastState.buildingCost);

    o.supplier.init(o.material, o.materialMarket);

    o.alphaASubContracter.init(o.alphaA, o.materialMarket, o.supplier);
    o.alphaBSubContracter.init(o.alphaB, o.materialMarket, o.supplier);
    o.alphaCSubContracter.init(o.alphaC, o.materialMarket, o.supplier);

    o.Environnement.init();
    o.Environnement.register(o.ObjectsManager.retrieve("environnement"));

}

export function simulateEnv() {
    o.europe.simulate();
    o.northAmerica.simulate();

    o.materialMarket.simulate();
}

export function initialize(lastState, currPeriod: number) {

    for (var key in lastState) {
        var value = lastState[key];

        // is a number
        if (!isNaN(value)) {
            lastState[key] = parseFloat(value);
        }
    }

    o.ObjectsManager.init();

    // init the game
    o.game.init();

    var machinesStats = lastState.machine_stats;
    var state;

    if (!machinesStats || !machinesStats.length) {
        machinesStats = [];

        for (var i = 0; i < lastState.machine_availablesNextPeriodNb; i++) {
            state = CONSTS.machinesStats[i] || machinesStats[i - 1];

            machinesStats.push(state);
        }
    }
    

    console.debug(machinesStats);

    // machines
    o.robot.init(lastState.machine_availablesNextPeriodNb, machinesStats, lastState.machineryNetValue);

    // materials
    o.rmWarehouse.init(lastState.material_closingQ, lastState.materialsInventoriesValue,
        lastState.material_deliveryNextPBoughtBeforeLastPQ, 0/*lastState.material_deliveryNextPBoughtBeforeLastPValue*/,
        lastState.purchases_3mthQ * 1000, 0/*lastState.purchases_3mthValue*/,
        lastState.purchases_6mthQ * 1000, 0/*lastState.purchases_6mthValue*/);

    o.supplier.init(o.material, o.materialMarket);

    o.material.init([o.supplier], o.rmWarehouse);


    // workers
    o.machinist.init(lastState.machinists_availablesNextPeriodNb, o.europeanLabourPool, CONSTS.machinists_strikeNextPeriodWeeksNb, o.robot);
    o.assemblyWorker.init(lastState.assemblyWorkers_availablesNextPeriodNb, o.europeanLabourPool, lastState.assemblyWorkers_strikeNextPeriodWeeksNb);

    // ateliers
    o.atelierMoulage.init(o.machinist, o.robot);
    o.atelierFinition.init(o.assemblyWorker, null);

    // init products and their semiProducts
    o.alphaA.init(o.atelierMoulage, o.material, o.alphaASubContracter, lastState.p1_components_availableNextPQ, 0/*lastState.p1_componentsPurchasedCost*/);
    o.betaA.init(o.atelierFinition, null, null);

    o.productA.init([o.alphaA, o.betaA], getImprovementType(lastState.p1_improvementsResult));

    o.alphaB.init(o.atelierMoulage, o.material, o.alphaBSubContracter, lastState.p2_components_availableNextPQ, 0/*lastState.p2_componentsPurchasedCost*/);
    o.betaB.init(o.atelierFinition, null, null);

    o.productB.init([o.alphaB, o.betaB], getImprovementType(lastState.p2_improvementsResult));

    o.alphaC.init(o.atelierMoulage, o.material, o.alphaCSubContracter, lastState.p3_components_availableNextPQ, 0/*lastState.p3_componentsPurchasedCost*/);
    o.betaC.init(o.atelierFinition, null, null);

    o.productC.init([o.alphaC, o.betaC], getImprovementType(lastState.p3_improvementsResult));

    // init
    o.factory.init(lastState.factory_availableSpace, o.land, lastState.buildingsNetValue, o.buildingContractor, [o.atelierMoulage, o.atelierFinition]);
    o.land.init(lastState.land_availableSpace, o.land, lastState.landNetValue, o.buildingContractor,[o.factory]);

    // internet website
    o.eCommerce.init(lastState.m3_agents_wantedWebsitePortsNb, o.internetMarket, o.internetDistributor);

    // init agents
    o.euroAgents.init(lastState.m1_agents_availablesNextPeriodNb, o.europeanLabourPool);
    o.naftaDistributors.init(lastState.m2_agents_availablesNextPeriodNb, o.americanLabourPool);

    var initialDistributorsNb = lastState.m3_agents_wantedWebsitePortsNb > 1 ? o.eCommerce.params.distributorsNb : 0;

    o.internetDistributor.init(initialDistributorsNb, o.europeanLabourPool);

    var m1_p1_stockValue = lastState.m1_p1_stockValue || CONSTS.p1_unitValue * lastState.m1_p1_stockQ;
    var m1_p2_stockValue = lastState.m1_p2_stockValue || CONSTS.p2_unitValue * lastState.m1_p2_stockQ;
    var m1_p3_stockValue = lastState.m1_p3_stockValue || CONSTS.p3_unitValue * lastState.m1_p3_stockQ;

    var m2_p1_stockValue = lastState.m1_p1_stockValue || CONSTS.p1_unitValue * lastState.m2_p1_stockQ;
    var m2_p2_stockValue = lastState.m2_p2_stockValue || CONSTS.p2_unitValue * lastState.m2_p2_stockQ;
    var m2_p3_stockValue = lastState.m3_p3_stockValue || CONSTS.p3_unitValue * lastState.m2_p3_stockQ;

    var m3_p1_stockValue = lastState.m3_p1_stockValue || CONSTS.p1_unitValue * lastState.m3_p1_stockQ;
    var m3_p2_stockValue = lastState.m3_p2_stockValue || CONSTS.p2_unitValue * lastState.m3_p2_stockQ;
    var m3_p3_stockValue = lastState.m3_p3_stockValue || CONSTS.p3_unitValue * lastState.m3_p3_stockQ;

    // init markets
    var euroStocks = [lastState.m1_p1_stockQ, lastState.m1_p2_stockQ, lastState.m1_p3_stockQ];
    var euroStocksValue = [m1_p1_stockValue, m1_p2_stockValue, m1_p3_stockValue];
    var euroBacklogs = [lastState.m1_p1_backlogQ, lastState.m1_p2_backlogQ, lastState.m1_p3_backlogQ];

    var naftaStocks = [lastState.m2_p1_stockQ, lastState.m2_p2_stockQ, lastState.m2_p3_stockQ];
    var naftaStocksValue = [m2_p1_stockValue, m2_p2_stockValue, m2_p3_stockValue];
    var naftaBacklogs = [lastState.m2_p1_backlogQ, lastState.m2_p2_backlogQ, lastState.m2_p3_backlogQ];

    var internetStocks = [lastState.m3_p1_stockQ, lastState.m3_p2_stockQ, lastState.m3_p3_stockQ];
    var internetStocksValue = [m3_p1_stockValue, m3_p2_stockValue, m3_p3_stockValue];

    o.euroMarket.init(o.europe, [o.productA, o.productB, o.productC], o.euroAgents, o.euroTrs, euroStocks, euroStocksValue, euroBacklogs);
    o.naftaMarket.init(o.northAmerica, [o.productA, o.productB, o.productC], o.naftaDistributors, o.naftaTrs, naftaStocks, naftaStocksValue, naftaBacklogs);
    o.internetMarket.init(o.world, [o.productA, o.productB, o.productC], o.internetDistributor, o.internetTrs, internetStocks, internetStocksValue);

    o.salesOffice.init([o.euroMarket, o.naftaMarket, o.internetMarket], lastState.tradeReceivablesValue);

    o.BusinessIntelligence.init();

    o.Management.init(lastState.management_budget, [o.machinist, o.assemblyWorker]);

    // finance
    var premiumsBase = lastState.landNetValue + lastState.buildingsNetValue + lastState.machineryNetValue + lastState.inventory_closingValue;
    o.alphaInsurance.init(premiumsBase, currPeriod, o.Management);

    var cashBalance = lastState.cashBalance || (lastState.cashValue - lastState.banksOverdraft);

    o.eurobankAccount.init(o.Company.getInstance(), o.eurobank, cashBalance, lastState.termDeposit, lastState.termLoansValue, lastState.banksOverdraft, lastState.nextPOverdraftLimit);

    // now registring responsability centers
    o.Production.init();
    o.Production.register(o.ObjectsManager.retrieve("production"));

    o.Marketing.init();
    o.Marketing.register(o.ObjectsManager.retrieve("marketing"));

    o.Finance.init();
    o.Finance.register(o.ObjectsManager.retrieve("finance"));

    o.Company.init(o.CompanyParams, o.europe, o.Production.getInstance(), o.Marketing.getInstance(), o.Finance.getInstance(), o.Management);

}


export function setDecisions(dec) {

    // machines decisions
    o.robot.buy(dec.machine_boughtNb);
    o.robot.sell(dec.machine_soldNb);
    o.robot.doMaintenance(dec.machine_maintenance_hoursNb);
    o.robot.setShiftLevel(dec.shift_level);

    // materials purchases
    o.supplier.order(dec.purchases_spotQ * 1000, ENUMS.QUALITY.MQ, ENUMS.FUTURES.IMMEDIATE);
    o.supplier.order(dec.purchases_3mthQ * 1000, ENUMS.QUALITY.MQ, ENUMS.FUTURES.THREE_MONTH);
    o.supplier.order(dec.purchases_6mthQ * 1000, ENUMS.QUALITY.MQ, ENUMS.FUTURES.SIX_MONTH);


    // SubContracting
    o.alphaA.subContract(dec.p1_subcontractQ, dec.p1_premiumMaterialProp / 100);
    o.alphaB.subContract(dec.p2_subcontractQ, dec.p2_premiumMaterialProp / 100);
    o.alphaC.subContract(dec.p3_subcontractQ, dec.p2_premiumMaterialProp / 100);

    // Personnel
    var recruitedNb = dec.assemblyWorkers_hire > 0 ? dec.assemblyWorkers_hire : 0;
    var dismissedNb = dec.assemblyWorkers_hire < 0 ? Math.abs(dec.assemblyWorkers_hire) : 0;

    o.assemblyWorker.recruit(recruitedNb);
    o.assemblyWorker.train(dec.assemblyWorkers_trainedNb);
    o.assemblyWorker.dismiss(dismissedNb);

    o.assemblyWorker.setShift(CONSTS.assemblyWorker_shiftLevel);
    o.assemblyWorker.pay(dec.assemblyWorkers_wageRate / 100);

    o.machinist.setShift(dec.shift_level);
    o.machinist.pay(dec.assemblyWorkers_wageRate / 100);

    // Management
    o.Management.allocateBudget(dec.management_budget * 1000);
    o.Management.train(dec.management_trainning);


    function tryProgram(p1_Q, p2_Q, p3_Q): number[] {

        var p1_Res = o.productA.getNeededResForProd(p1_Q, CONSTS.p1_machiningTime, dec.p1_premiumMaterialProp / 100, dec.p1_assemblyTime, CONSTS.assemblyMaterial);
        var p2_Res = o.productB.getNeededResForProd(p2_Q, CONSTS.p2_machiningTime, dec.p2_premiumMaterialProp / 100, dec.p2_assemblyTime, CONSTS.assemblyMaterial);
        var p3_Res = o.productC.getNeededResForProd(p3_Q, CONSTS.p3_machiningTime, dec.p3_premiumMaterialProp / 100, dec.p3_assemblyTime, CONSTS.assemblyMaterial);

        var prod_Res = [p1_Res, p2_Res, p3_Res];
        var neededMachiningTime = Utils.sums(prod_Res, "machinists");
        var neededAssemblyTime = Utils.sums(prod_Res, "assemblyWorkers");

        var diffMachiningTime = neededMachiningTime - o.machinist.effectiveAvailableTotalHoursNb;
        var diffAssemblyTime = neededAssemblyTime - o.assemblyWorker.effectiveAvailableTotalHoursNb;
        var diffBase;

        var consoUnitA, consoUnitB, consoUnitC;

        if (diffAssemblyTime > 0 || diffMachiningTime > 0) {
            console.debug("Needs exceed Capacity");
            diffBase = Math.max(diffAssemblyTime, diffMachiningTime);

            var totalQ = p1_Q + p2_Q + p3_Q;
            var ratioA = p1_Q / totalQ;
            var ratioB = p2_Q / totalQ;
            var ratioC = p3_Q / totalQ;

            if (diffBase === diffAssemblyTime) {

                diffBase *= 60;
                // here we could use decision of assembly time of minimum but it doesnt include efficiency or non valid value
                consoUnitA = dec.p1_assemblyTime < CONSTS.p1_minAssemblyTime ? CONSTS.p1_minAssemblyTime : dec.p1_assemblyTime;
                consoUnitB = dec.p2_assemblyTime < CONSTS.p2_minAssemblyTime ? CONSTS.p2_minAssemblyTime : dec.p2_assemblyTime;
                consoUnitC = dec.p3_assemblyTime < CONSTS.p3_minAssemblyTime ? CONSTS.p3_minAssemblyTime : dec.p3_assemblyTime;
            }

            if (diffBase === diffMachiningTime) {
                consoUnitA = p1_Res.machinists / p1_Q;
                consoUnitB = p1_Res.machinists / p2_Q;
                consoUnitC = p1_Res.machinists / p3_Q;
            }

            var P_minus = Math.round(diffBase / (ratioA * consoUnitA + ratioB * consoUnitB + ratioC * consoUnitC));

            var p1_Minus = Math.round(P_minus * ratioA);
            var p2_Minus = Math.round(P_minus * ratioB);
            var p3_Minus = Math.round(P_minus * ratioC);

            console.debug('il reste ', diffBase - (p1_Minus * consoUnitA) - (p2_Minus * consoUnitB) - (p3_Minus * consoUnitC));
            

            return [p1_Minus, p2_Minus, p3_Minus];

        }

        console.debug("Good");

        return [0, 0, 0];
    }

    // production
    var p1_scheduledQ = dec.m1_p1_deliveredQ + dec.m2_p1_deliveredQ + dec.m3_p1_deliveredQ;
    var p2_scheduledQ = dec.m1_p2_deliveredQ + dec.m2_p2_deliveredQ + dec.m3_p2_deliveredQ;
    var p3_scheduledQ = dec.m1_p3_deliveredQ + dec.m2_p3_deliveredQ + dec.m3_p3_deliveredQ;

    var m1_p1_Q = dec.m1_p1_deliveredQ;
    var m2_p1_Q = dec.m2_p1_deliveredQ;
    var m3_p1_Q = dec.m3_p1_deliveredQ;

    var m1_p2_Q = dec.m1_p2_deliveredQ;
    var m2_p2_Q = dec.m2_p2_deliveredQ;
    var m3_p2_Q = dec.m3_p2_deliveredQ;

    var m1_p3_Q = dec.m1_p3_deliveredQ;
    var m2_p3_Q = dec.m2_p3_deliveredQ;
    var m3_p3_Q = dec.m3_p3_deliveredQ;

    var totalWantedP1 = p1_scheduledQ;
    var totalWantedP2 = p2_scheduledQ;
    var totalWantedP3 = p3_scheduledQ

    var minusQs;
    var successProgram;

    do {

        minusQs = tryProgram(p1_scheduledQ, p2_scheduledQ, p3_scheduledQ);

        p1_scheduledQ -= minusQs[0];
        p2_scheduledQ -= minusQs[1];
        p3_scheduledQ -= minusQs[2];

        m1_p1_Q -= Math.ceil(minusQs[0] * (dec.m1_p1_deliveredQ / totalWantedP1));
        m2_p1_Q -= Math.ceil(minusQs[0] * (dec.m2_p1_deliveredQ / totalWantedP1));
        m3_p1_Q = p1_scheduledQ - m1_p1_Q - m2_p1_Q;

        m1_p2_Q -= Math.ceil(minusQs[1] * (dec.m1_p2_deliveredQ / totalWantedP2));
        m2_p2_Q -= Math.ceil(minusQs[1] * (dec.m2_p2_deliveredQ / totalWantedP2));
        m3_p2_Q = p2_scheduledQ - m1_p2_Q - m2_p2_Q;

        m1_p3_Q -= Math.ceil(minusQs[2] * (dec.m1_p3_deliveredQ / totalWantedP3));
        m2_p3_Q -= Math.ceil(minusQs[2] * (dec.m2_p3_deliveredQ / totalWantedP3));
        m3_p3_Q = p3_scheduledQ - m1_p3_Q - m2_p3_Q;

        successProgram = (minusQs[0] + minusQs[1] + minusQs[2]) === 0;

    } while (!successProgram);

    o.productA.manufacture(p1_scheduledQ, CONSTS.p1_machiningTime, dec.p1_premiumMaterialProp / 100, dec.p1_assemblyTime, CONSTS.assemblyMaterial);
    o.productB.manufacture(p2_scheduledQ, CONSTS.p2_machiningTime, dec.p2_premiumMaterialProp / 100, dec.p2_assemblyTime, CONSTS.assemblyMaterial);
    o.productC.manufacture(p3_scheduledQ, CONSTS.p3_machiningTime, dec.p3_premiumMaterialProp / 100, dec.p3_assemblyTime, CONSTS.assemblyMaterial);


    // R&D
    o.productA.developWithBudget(dec.p1_devBudget * 1000);
    o.productA.takeUpImprovements(!!dec.p1_takeupImprovements);

    o.productB.developWithBudget(dec.p2_devBudget * 1000);
    o.productB.takeUpImprovements(!!dec.p2_takeupImprovements);

    o.productC.developWithBudget(dec.p3_devBudget * 1000);
    o.productC.takeUpImprovements(!!dec.p3_takeupImprovements);


    // corporate
    o.euroMarket.setCorporateCom(dec.m1_corporate * 1000);
    o.naftaMarket.setCorporateCom(dec.m2_corporate * 1000);
    o.internetMarket.setCorporateCom(dec.m3_corporate * 1000);

    // sales agent
    o.euroAgents.appoint(dec.m1_agents_appointedNb, dec.m1_agents_support * 1000, dec.m1_agents_commissionRate / 100);
    o.naftaDistributors.appoint(dec.m2_agents_appointedNb, dec.m2_agents_support * 1000, dec.m2_agents_commissionRate / 100);
    o.internetDistributor.appoint(CONSTS.internet_agents_appointedNb, dec.m3_agents_support * 1000, dec.m3_agents_commissionRate / 100);

    // eCommerce
    o.eCommerce.operateOn(dec.website_portsNb);
    o.eCommerce.developWebsite(dec.website_devBudget * 1000);


    // deliveries to markets + prices + ads
    o.productA.deliverTo(m1_p1_Q, o.euroMarket, dec.m1_p1_price, dec.m1_p1_advertising * 1000);
    o.productA.deliverTo(m2_p1_Q, o.naftaMarket, dec.m2_p1_price, dec.m2_p1_advertising * 1000);
    o.productA.deliverTo(m3_p1_Q, o.internetMarket, dec.m3_p1_price, dec.m3_p1_advertising * 1000);

    o.productB.deliverTo(m1_p2_Q, o.euroMarket, dec.m1_p2_price, dec.m1_p2_advertising * 1000);
    o.productB.deliverTo(m2_p2_Q, o.naftaMarket, dec.m2_p2_price, dec.m2_p2_advertising * 1000);
    o.productB.deliverTo(m3_p2_Q, o.internetMarket, dec.m3_p2_price, dec.m3_p2_advertising * 1000);

    o.productC.deliverTo(m1_p3_Q, o.euroMarket, dec.m1_p3_price, dec.m1_p3_advertising * 1000);
    o.productC.deliverTo(m2_p3_Q, o.naftaMarket, dec.m2_p3_price, dec.m2_p3_advertising * 1000);
    o.productC.deliverTo(m3_p3_Q, o.internetMarket, dec.m3_p3_price, dec.m3_p3_advertising * 1000);

    // intelligence
    o.BusinessIntelligence.commissionCompetitorsInfo(!!dec.intelligence_corporateInfo_order);
    o.BusinessIntelligence.commissionMarketSharesInfo(!!dec.intelligence_marketShares_order);

    // finance
    o.alphaInsurance.takeoutInsurance(dec.insurance_plan);

    o.eurobankAccount.changeTermDepositAmount(dec.term_deposit * 1000);

    o.eurobankAccount.takeTermLoans(dec.term_loans * 1000);
}


export function getOrders(matrix: number[][]) {
    var euroOrders = matrix[0];
    var naftaOrders = matrix[1];
    var internetOrders = matrix[2];

    console.debug(matrix);

    o.euroMarket.__simulate(euroOrders);
    o.naftaMarket.__simulate(naftaOrders);
    o.internetMarket.__simulate(internetOrders);

}

export function getEndState() {
    var endState = o.ObjectsManager.getObjectsEndState();

    Utils.ObjectApply(endState, o.Production.getEndState(), o.Marketing.getEndState(),o.Environnement.getEndState(), o.Finance.getInstance(), o.Company.getInstance());

    return endState;
}