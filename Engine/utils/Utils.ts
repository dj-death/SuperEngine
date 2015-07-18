/**
* Utils
* @name Utils
* @namespace
*
* Cloud Module
*
* Copyright 2015 DIDI Mohamed, Inc.
*/

/**
 * Get the version of the module.
 * @return {String}
 */

//require('cloud/Engine/es6-shim.js');

var enumerables: string[] = [/*'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',*/'valueOf', 'toLocaleString', 'toString', 'constructor'];

function populateArray(value: number, length: number): number[] {
    var arr = [],
        i = 0;

    for (; i < length; i++) {
        arr.push(value);
    }

    return arr;
}

export function getPoisson(lambda: number): number {
    var L: number = Math.exp(-lambda),
        p: number = 1.0,
        k: number = 0;

    do {
        k++;
        p *= Math.random();
    } while (p > L);

    return k - 1;
}

function getValueAtAdress(object: any, property: string) {
    var splits = property.split("."),
        j = 0,
        splitsNb = splits.length,

        value;

    for (; j < splitsNb; j++) {

        if (value === undefined) {
            value = object[splits[j]];

        } else {
            value = value[splits[j]];
        }

    }

    return value;
}


export function sums(collection, property: string, filterProp?: string, filterValue?: any, coefficients?): number {
    var i: number = 0,
        len: number = collection.length,
        sum: number = 0,
        value,
        item;

    if (!coefficients || typeof coefficients === 'number') { // not array
        coefficients = populateArray(coefficients || 1, len);
    }

    for (; i < len; i++) {
        item = collection[i];

        if (filterProp) {
            value = getValueAtAdress(item, filterProp);

            if (filterValue !== undefined) {
                if (value !== filterValue) {
                    continue;
                }
                
            } else {
                if (!value) {
                    continue;
                }
            }

            
        }

        sum += item[property] * coefficients[i];
    }

    return sum;
}


export function aggregate(collection, property: string, operation, coefficients): number {
    var i: number,
        len: number = collection.length,
        aggregation: number = 0;

    if (!coefficients || typeof coefficients === 'number') { // not array
        coefficients = populateArray(coefficients || 1, len);
    }

    for (i = 0; i < len; i++) {
        aggregation += operation.call(null, collection[i][property], coefficients[i]);
    }

    return aggregation;
}


function cloneFn(item) {
    if (item === null || item === undefined) {
        return item;
    }

    // DOM nodes
    // TODO proxy this to Ext.Element.clone to handle automatic id attribute changing
    // recursively
    if (item.nodeType && item.cloneNode) {
        return item.cloneNode(true);
    }

    var type = toString.call(item),
        i, j, k, clone, key;

    // Date
    if (type === '[object Date]') {
        return new Date(item.getTime());
    }

    // Array
    if (type === '[object Array]') {
        i = item.length;

        clone = [];

        while (i--) {
            clone[i] = cloneFn(item[i]);
        }
    }
    // Object
    else if (type === '[object Object]' && item.constructor === Object) {
        clone = {};

        for (key in item) {
            clone[key] = cloneFn(item[key]);
        }

        if (enumerables) {
            for (j = enumerables.length; j--;) {
                k = enumerables[j];
                if (item.hasOwnProperty(k)) {
                    clone[k] = item[k];
                }
            }
        }
    }

    return clone || item;
}

export function ObjectApply(destination, ...rest: any[]): any {
    var i = 1,
        ln = arguments.length,
        object, key, value, sourceKey;

    for (; i < ln; i++) {
        object = arguments[i];

        for (key in object) {
            value = object[key];
            if (value && value.constructor === Object) {
                sourceKey = destination[key];
                if (sourceKey && sourceKey.constructor === Object) {
                    ObjectApply(sourceKey, value);
                } else {
                    destination[key] = cloneFn(value);
                }
            } else {
                destination[key] = value;
            }
        }
    }

    return destination;
}


export function makeID(decision) {
    var ID = "";

    ID += decision.seminarId;
    ID += decision.groupId;
    ID += decision.d_CID;
    ID += decision.period;

    return ID;
}

export function toFixed(value: number, precision: number = 0): number {
    var isToFixedBroken = (0.9).toFixed() !== '1';

    if (!isToFixedBroken) {
        return parseFloat(value.toFixed(precision));
    }

    var pow = Math.pow(10, precision);

    return parseFloat((Math.round(value * pow) / pow).toFixed(precision));
}

export function toCeilDecimals(value: number, precision: number = 0): number {

    var pow = Math.pow(10, precision);

    return parseFloat((Math.ceil(value * pow) / pow).toFixed(precision));
}