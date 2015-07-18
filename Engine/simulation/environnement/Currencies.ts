import Currency = require('../../engine/ComputeEngine/Environnement/src/Currency');

var currencies = {
    euro: new Currency({
        id: "euro",

        label: "EURO",
        sign: "€",
        isLocal: true
    }),

    dollar: new Currency({
        id: "dollar",

        label: "USD",
        sign: "$",

        isLocal: false
    })
};

export = currencies;


