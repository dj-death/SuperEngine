export enum CREDIT {
    CASH = 0,
    ONE_MONTH = 30,
    TWO_MONTH = 60,
    THREE_MONTH = 90
}

export enum FUTURES {
    IMMEDIATE,
    THREE_MONTH,
    SIX_MONTH
}

export enum DELIVERY {
    IMMEDIATE,
    NEXT_PERIOD,
    AFTERNEXT_PERIOD,
}

export enum QUALITY {
    LQ,
    MQ,
    HQ
}

export enum SHIFT_LEVEL {
    SINGLE,
    DOUBLE,
    TREBLE
}

export enum PERIODS { // in months
    QUARTER = 3,
    HALF_YEAR = 6,
    YEAR = 12
}

export interface CO2Footprint {
    kwh: number;
    weight: number;
    offsettingPerTonneRate: number;
}

export interface Shift {
    level: SHIFT_LEVEL;
    workersNeededNb: number;
    maxHoursPerPeriod: number;
    maxHoursWeekDays: number;
    maxHoursOvertimeSaturday: number;
    maxHoursOvertimeSunday: number;
    shiftPremium: number;

    weeksWorkedByPeriod: number;
}

export enum IMPROVEMENT_TYPE {
    NONE,
    MINOR,
    MAJOR
}

export interface Future {
    term: FUTURES;
}

export interface FuturesArray {
    [index: string]: Future;
}

export enum COM_AXES {
    PRICE,
    CONFORT,
    RESISTANCE,
    ESTHETIC,
}


export enum STAR_RATINGS {
    ONE_STAR = 1,
    TWO_STAR = 2,
    THREE_STAR = 3,
    FOUR_STAR = 4,
    FIVE_STAR = 5
}