import Atelier = require('../../engine/ComputeEngine/Manufacturing/src/Atelier');

var atelierMoulage = new Atelier({
    label: "Atelier de Moulage",
    spaceNeeded: 0,
    unity: 0,
    costs: {
        fixedExpenses: 0,
        maintenance: 0,
        power: 0
    }

});

var atelierFinition = new Atelier({
    label: "Atelier de Finition",
    spaceNeeded: 0,
    unity: 0,
    costs: {
        fixedExpenses: 0,
        maintenance: 0,
        power: 0
    }
});

var ateliers = [atelierMoulage, atelierFinition];

export = ateliers;