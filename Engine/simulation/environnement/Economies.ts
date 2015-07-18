import Economy = require('../../engine/ComputeEngine/Environnement/src/Economy');

var economies = {
    europe: new Economy({
        id: "m1",
        name: "European Union (EU)",

        initialGDPPerCapita: 34222,
        population: 501000000,
        internetAccessPercent: 0.673,
    }),

    northAmerica: new Economy({
        id: "m2",

        name: "North American free trade area (Nafta)",

        initialGDPPerCapita: 37315,
        population: 453000000,
        internetAccessPercent: 0.657
    }),

    restOfDevelopedWorld: new Economy({
        id: "rest",

        name: "Other major economies",

        initialGDPPerCapita: 5390,
        population: 3504000000,
        internetAccessPercent: 0.238
    }),

    world: new Economy({
        id: "world",

        name: "World",

        initialGDPPerCapita: 11874,
        population: 5000000000,
        internetAccessPercent: 0.238
    })
};

export = economies;

