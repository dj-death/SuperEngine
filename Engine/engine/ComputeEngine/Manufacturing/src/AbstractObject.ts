
interface AbstractObject {
    label: string;
    spaceNeeded: number;
    
    CO2Footprint: {
        kwh: number;
        weight: number;
        offsettingPerTonneRate: number;
    };

    costs?: any;
}

export = AbstractObject;

