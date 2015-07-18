var game = require('./Game');
var Company = require('../engine/ComputeEngine/Company');
var CompanyParams = require('./CompanyParams');
var ObjectsManager = require('../engine/ComputeEngine/ObjectsManager');
var Production = require('../engine/ComputeEngine/Manufacturing/src/Production');
var spaces = require('./manufacturing/Spaces');
var machines = require('./manufacturing/Machines');
var supply = require('./manufacturing/Supply');
var products = require('./manufacturing/Products');
var ateliers = require('./manufacturing/Ateliers');
var workers = require('./manufacturing/Workers');
var Marketing = require('../engine/ComputeEngine/Marketing/src/Marketing');
var markets = require('./marketing/Markets');
var salesForce = require('./marketing/SalesForce');
var salesOffice = require('./marketing/SalesOffice');
var transport = require('./marketing/Transport');
var eCommerce = require('./marketing/ECommerce');
var BusinessIntelligence = require('./marketing/Intelligence');
var Environnement = require('../engine/ComputeEngine/Environnement/src/Environnement');
var economies = require('./environnement/Economies');
var centralBanks = require('./environnement/CentralBanks');
var bank = require('./environnement/Bank');
var materialsMarkets = require('./environnement/MaterialsMarkets');
var currencies = require('./environnement/Currencies');
var stakeholders = require('./environnement/Stakeholders');
var labourPools = require('./environnement/LabourPools');
var Management = require('./personnel/Management');
var Finance = require('../engine/ComputeEngine/Finance/src/Finance');
var insurance = require('./finance/Insurance');
var bankAccount = require('./finance/BankAccount');
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
module.exports = objects;
//# sourceMappingURL=Objects.js.map