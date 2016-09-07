'use strict';

var _ = require('busyman');
var utils = {};

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

utils.getDevDiff = function (devNew, devOld) {
    var delta = {},
        props = [ 'role', 'parent', 'maySleep', 'address.dynamic',
                  'attrs.manufacturer', 'attrs.model', 'attrs.serial',
                  'attrs.version.hw', 'attrs.version.sw', 'attrs.version.fmw',
                  'attrs.power.type', 'attrs.power.voltage'
                ];

    _.forEach(props, function (path) {
        var oldVal = _.get(devOld, path),
            newVal = _.get(devNew, path);

        if (oldVal !== newVal)
            _.set(delta, path, newVal);
    });

    return delta;
};

utils.getGadDiff = function (gadNew, gadOld) {
    var delta = {},
        props = [ 'profile', 'classId', 'auxId' ];

    _.forEach(props, function (path) {
        var oldVal = _.get(gadOld, path),
            newVal = _.get(gadNew, path);

        if (oldVal !== newVal)
            _.set(delta, path, newVal);
    });

    return delta;
};

utils.nowSeconds = function () {
    return Math.floor(Date.now()/1000);
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

utils.validateNetcore = function (nc, msg) {
    msg = msg || 'netcore should be given when new Device()';

    if (!_.isObject(nc) || !nc._controller)
        throw new TypeError(msg);

    return true;
};

utils.validateDevice = function (dev, msg) {
    msg = msg || 'dev should be an instance of Device class.';

    if (!_.isObject(dev) || !_.has(dev, '_netcore') || !_.has(dev, '_id') || !_.has(dev, '_net'))
        throw new TypeError(msg);
    return true;
};

utils.validateAttrName = function (attrName, msg) {
    msg = msg || 'attrName should be a string.';

    if (!_.isString(attrName))
        throw new TypeError(msg);
    return true;
}

utils.validateAuxId = function (auxId, msg) {
    msg = msg || 'auxId should be a number or a string.';

    if (!_.isNumber(auxId) && !_.isString(auxId))
        throw new TypeError(msg);
    return true;
};

utils.validateGadId = function (gadId, msg) {
    msg = msg || 'gadId should be a number.';

    if (!_.isNumber(gadId))
        throw new TypeError(msg);
    return true;
};

utils.validateInfo = function (info, msg) {
    msg = msg || 'Info should be an object.';

    if (!_.isObject(info))
        throw new TypeError(msg);
    return true;
};

utils.validateArgs = function (args, msg) {
    msg = msg || 'Args should be an array.';

    if (!_.isArray(args))
        throw new TypeError(msg);
    return true;
};

utils.validateValue = function (val, msg) {
    msg = msg || 'Value should be given.';

    if (_.isUndefined(val))
        throw new TypeError(msg);
    return true;
};

utils.validateCallback = function (cb, msg) {
    msg = msg || 'callback should be given and should be a function.';

    if (!_.isFunction(cb))
        throw new TypeError('callback should be given and should be a function.');
    return true;
}

utils.checkArgType = function (arg, val) {
    var err;

    switch (arg) {
        case 'permAddr':
        case 'attrName':
            if (!_.isString(val))
                err = new TypeError(arg + ' should be a string.');
            break;
        case 'auxId':
            if (!_.isString(val) && !_.isNumber(val))
                err = new TypeError('auxId should be a number or a string.');
            break;
        case 'cfg':
        case 'gadAttrs':
        case 'devAttrs':
            if (!_.isPlainObject(val))
                err = new TypeError(arg + ' should be an object.');
            break;
        case 'val':
            if (_.isFunction(val))
                err = new TypeError('val should not be a function.');
            else if (_.isUndefined(val))
                err = new TypeError('val should be given.');
            break;
        case 'callback':
            if (!_.isFunction(val))
                err = new TypeError('callback should be a function.');
            break;
        case 'rawGad':
        case 'rawDev':
            if (_.isUndefined(val))
                err = new TypeError(arg + ' should be given.');
            break;
        default:
            break;
    }

    return err;
};

utils.validateArgTypes = function (argsObj) {
    var err;

    for (var key in argsObj) {
        err = utils.checkArgType(key, argsObj[key]);
        if (err)
            break;
    }

    if (err)
        throw err;

    return true;
}


module.exports = utils;
