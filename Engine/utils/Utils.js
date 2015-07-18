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
var enumerables = ['valueOf', 'toLocaleString', 'toString', 'constructor'];
function populateArray(value, length) {
    var arr = [], i = 0;
    for (; i < length; i++) {
        arr.push(value);
    }
    return arr;
}
function getPoisson(lambda) {
    var L = Math.exp(-lambda), p = 1.0, k = 0;
    do {
        k++;
        p *= Math.random();
    } while (p > L);
    return k - 1;
}
exports.getPoisson = getPoisson;
function getValueAtAdress(object, property) {
    var splits = property.split("."), j = 0, splitsNb = splits.length, value;
    for (; j < splitsNb; j++) {
        if (value === undefined) {
            value = object[splits[j]];
        }
        else {
            value = value[splits[j]];
        }
    }
    return value;
}
function sums(collection, property, filterProp, filterValue, coefficients) {
    var i = 0, len = collection.length, sum = 0, value, item;
    if (!coefficients || typeof coefficients === 'number') {
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
            }
            else {
                if (!value) {
                    continue;
                }
            }
        }
        sum += item[property] * coefficients[i];
    }
    return sum;
}
exports.sums = sums;
function aggregate(collection, property, operation, coefficients) {
    var i, len = collection.length, aggregation = 0;
    if (!coefficients || typeof coefficients === 'number') {
        coefficients = populateArray(coefficients || 1, len);
    }
    for (i = 0; i < len; i++) {
        aggregation += operation.call(null, collection[i][property], coefficients[i]);
    }
    return aggregation;
}
exports.aggregate = aggregate;
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
    var type = toString.call(item), i, j, k, clone, key;
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
function ObjectApply(destination) {
    var rest = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        rest[_i - 1] = arguments[_i];
    }
    var i = 1, ln = arguments.length, object, key, value, sourceKey;
    for (; i < ln; i++) {
        object = arguments[i];
        for (key in object) {
            value = object[key];
            if (value && value.constructor === Object) {
                sourceKey = destination[key];
                if (sourceKey && sourceKey.constructor === Object) {
                    ObjectApply(sourceKey, value);
                }
                else {
                    destination[key] = cloneFn(value);
                }
            }
            else {
                destination[key] = value;
            }
        }
    }
    return destination;
}
exports.ObjectApply = ObjectApply;
function makeID(decision) {
    var ID = "";
    ID += decision.seminarId;
    ID += decision.groupId;
    ID += decision.d_CID;
    ID += decision.period;
    return ID;
}
exports.makeID = makeID;
function toFixed(value, precision) {
    if (precision === void 0) { precision = 0; }
    var isToFixedBroken = (0.9).toFixed() !== '1';
    if (!isToFixedBroken) {
        return parseFloat(value.toFixed(precision));
    }
    var pow = Math.pow(10, precision);
    return parseFloat((Math.round(value * pow) / pow).toFixed(precision));
}
exports.toFixed = toFixed;
function toCeilDecimals(value, precision) {
    if (precision === void 0) { precision = 0; }
    var pow = Math.pow(10, precision);
    return parseFloat((Math.ceil(value * pow) / pow).toFixed(precision));
}
exports.toCeilDecimals = toCeilDecimals;
//# sourceMappingURL=Utils.js.map