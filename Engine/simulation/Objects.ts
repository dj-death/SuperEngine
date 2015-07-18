import game = require('./Game');

import Company = require('../engine/ComputeEngine/Company');

import CompanyParams = require('./CompanyParams');


import ObjectsManager = require('../engine/ComputeEngine/ObjectsManager');

import Production = require('../engine/ComputeEngine/Manufacturing/src/Production');

import spaces = require('./manufacturing/Spaces');

import machines = require('./manufacturing/Machines');
import supply = require('./manufacturing/Supply');
import products = require('./manufacturing/Products');
import ateliers = require('./manufacturing/Ateliers');
import workers = require('./manufacturing/Workers');

import Marketing = require('../engine/ComputeEngine/Marketing/src/Marketing');

import markets = require('./marketing/Markets');
import salesForce = require('./marketing/SalesForce');
import salesOffice = require('./marketing/SalesOffice');
import transport = require('./marketing/Transport');
import eCommerce = require('./marketing/ECommerce');
import BusinessIntelligence = require('./marketing/Intelligence');

import Environnement = require('../engine/ComputeEngine/Environnement/src/Environnement');

import economies = require('./environnement/Economies');
import centralBanks = require('./environnement/CentralBanks');
import bank = require('./environnement/Bank');
import materialsMarkets = require('./environnement/MaterialsMarkets');

import currencies = require('./environnement/Currencies');

import stakeholders = require('./environnement/Stakeholders');

import labourPools = require('./environnement/LabourPools');

import Management = require('./personnel/Management');

import Finance = require('../engine/ComputeEngine/Finance/src/Finance');

import insurance = require('./finance/Insurance');
import bankAccount = require('./finance/BankAccount');


var objects = {
    game: game,

    Company: Company.Company,
    CompanyParams: CompanyParams,

    ObjectsManager: ObjectsManager,
    Production: Production,
    Marketing: Marketing,
    Environnement: Environnement,
    Finance: Finance,
    Management: Management,

    insurance: insurance,
    bankAccount: bankAccount,
    

    eCommerce: eCommerce,
    salesOffice: salesOffice,

    land: spaces.land,
    factory: spaces.factory,

    robot: machines.robot,

    machinesStates: machines.machinesState,

    material: supply.materials[0],

    supplier: supply.suppliers[0],

    rmWarehouse: supply.warehouses[0],

    alphaA: products.alphaA,
    betaA: products.betaA,
    productA: products.productA,

    alphaASubContracter: products.alphaASubContracter,

    alphaB: products.alphaB,
    betaB: products.betaB,
    productB: products.productB,

    alphaBSubContracter: products.alphaBSubContracter,

    alphaC: products.alphaC,
    betaC: products.betaC,
    productC: products.productC,

    alphaCSubContracter: products.alphaCSubContracter,

    atelierMoulage: ateliers[0],
    atelierFinition: ateliers[1],

    machinist: workers.machinist,
    assemblyWorker: workers.assemblyWorker,

    BusinessIntelligence: BusinessIntelligence,

    euroMarket: markets.euroMarket,
    naftaMarket: markets.naftaMarket,
    internetMarket: markets.internetMarket,

    euroAgents: salesForce.euroAgents,
    naftaDistributors: salesForce.naftaDistributors,
    internetDistributor: salesForce.internetDistributor,

    euroTrs: transport.europeTrs,
    naftaTrs: transport.naftaTrs,
    internetTrs: transport.internetTrs,

    europe: economies.europe,
    northAmerica: economies.northAmerica,
    restOfDevelopedWorld: economies.restOfDevelopedWorld,
    world: economies.world,

    dollar: currencies.dollar,
    euro: currencies.euro,

    FED: centralBanks.FED,
    ECB: centralBanks.ECB,

    bank: bank,

    europeanLabourPool: labourPools.europeanLabourPool,
    americanLabourPool: labourPools.americanLabourPool,

    materialMarket: materialsMarkets[0],

    buildingContractor: stakeholders.buildingContractor
};

export = objects;