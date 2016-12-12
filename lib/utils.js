'use strict';

var _ = require('busyman'),
    proving = require('proving'),
    FCONSTS = require('freebird-constants');

var utils = {
    validate: proving
};

utils.getObjectDiff = function (n, o) {
    var newPvals = utils.buildPathValuePairs(n),
        delta = {};

    _.forEach(newPvals, function (newVal, path) {
        var oldVal = _.get(o, path);

        if (newVal !== oldVal)
            _.set(delta, path, newVal);
    });

    return delta;
};

utils.buildPathValuePairs = function (tip, obj) {
    var result = {};

    if (_.isObject(tip)) {
        obj = tip;
        tip = '';
    }

    if (!_.isObject(obj))
        throw new TypeError('buildPathValuePairs() fails, input is not an object.');

    if (!_.isUndefined(tip) && tip !== '' && tip !== '.' && tip !== '/')
        tip = tip + '.';

    _.forEach(obj, function (val, key) {
        if (obj.hasOwnProperty(key)) {
            // Tricky: If val is an array, don't buid its full path
            if (_.isArray(val) || !_.isObject(val))
                result[tip + key] = val;
            else if (_.isObject(val))
                result = _.assign(result, utils.buildPathValuePairs(tip + key, val));
        }
    });

    return result;
};

utils.getFrom = function (obj, type, keys) {
    var target = obj[type],
        isValid = true,
        result;

    if (!_.isUndefined(keys) && !_.isArray(keys) && !_.isString(keys))
        throw new TypeError('keys should be an array of string or a single string, if given.');

    if (_.isArray(keys)) {
        keys.forEach(function (k) {
            isValid = isValid && _.isString(k);
        });
        if (!isValid)
            throw new TypeError('keys should be an array of string or a single string, if given.');
    }

    result = _.isUndefined(keys) ? target : _.pick(target, keys);
    return result ? _.cloneDeep(result) : result;
};

/***********************************************************************/
/*** Validators                                                      ***/
/***********************************************************************/
utils.validate.netcore = function (nc, msg) {
    if (!_.isObject(nc) || !_.has(nc, '_controller') || !_.has(nc, '_freebird'))
        throw new TypeError(msg || 'netcore should be given when new Device()');
    return true;
};

utils.validate.device = function (dev, msg) {
    if (!_.isObject(dev) || !_.has(dev, '_netcore') || !_.has(dev, '_id') || !_.has(dev, '_net'))
        throw new TypeError(msg || 'dev should be an instance of Device class.');
    return true;
};

utils.validate.argTypes = function (argsObj) {
    for (var key in argsObj) {
        utils.validate.checkArgType(key, argsObj[key]);
    }
    return true;
};

utils.validate.checkArgType = function (arg, val) {
    switch (arg) {
        case 'permAddr':
        case 'attrName':
            proving.string(val, arg + ' should be a string.');
            break;
        case 'auxId':
            proving.stringOrNumber(val, arg + ' should be a number or a string.');
            break;
        case 'cfg':
        case 'gadAttrs':
        case 'devAttrs':
            proving.object(val, arg + ' should be an object.');

            break;
        case 'val':
            proving.defined(val, arg + ' should be given.');
            if (_.isFunction(val))
                throw new TypeError('val should not be a function.');
            break;
        case 'callback':
            proving.fn(val, arg + ' should be a function.');
            break;
        case 'rawGad':
        case 'rawDev':
            proving.defined(val, arg + ' should be given.');
            break;
        default:
            break;
    }
    return true;
};

utils.validate.cookers = function (nc) {
    if (!_.isFunction(nc._cookRawDev))
        throw new Error('_cookRawDev() not implemented.');
    else if (!_.isFunction(nc._cookRawGad))
        throw new Error('_cookRawGad() not implemented.');

    return true;
};

utils.validate.drivers = function (nc) {
    var netDrvs = nc._drivers.net,
        devDrvs = nc._drivers.dev,
        gadDrvs = nc._drivers.gad,
        badDrvs = [],
        badDrvNames;

    _.forEach(FCONSTS.MandatoryNetDrvNames, function (name) {
        if (!_.isFunction(netDrvs[name]))
            badDrvs.push('net.' + name);
    });

    _.forEach(FCONSTS.MandatoryDevDrvNames, function (name) {
        if (!_.isFunction(devDrvs[name]))
            badDrvs.push('dev.' + name);
    });

    _.forEach(FCONSTS.MandatoryGadDrvNames, function (name) {
        if (!_.isFunction(gadDrvs[name]))
            badDrvs.push('gad.' + name);
    });

    if (badDrvs.length) {
        _.forEach(badDrvs, function (name) {
            badDrvNames = badDrvNames + name + ', ';
        });
        throw new Error('Mandatory driver(s): ' + badDrvNames + 'not implemented.');
    }

    return true;
};

module.exports = utils;
