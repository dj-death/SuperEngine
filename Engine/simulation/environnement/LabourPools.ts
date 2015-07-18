import LabourPool = require('../../engine/ComputeEngine/Environnement/src/LabourPool');

var pools = {
    europeanLabourPool: new LabourPool(),
    americanLabourPool: new LabourPool()
};

export = pools;