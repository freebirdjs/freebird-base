'use strict';

var _ = require('busyman');
var utils = {
    validate: {}
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


/***********************************************************************/
/*** Validators                                                      ***/
/***********************************************************************/
utils.validate.netcore = function (nc, msg) {
    if (!_.isObject(nc) || !nc._controller)
        throw new TypeError(msg || 'netcore should be given when new Device()');
    return true;
};

utils.validate.device = function (dev, msg) {
    if (!_.isObject(dev) || !_.has(dev, '_netcore') || !_.has(dev, '_id') || !_.has(dev, '_net'))
        throw new TypeError(msg || 'dev should be an instance of Device class.');
    return true;
};

utils.validate.string = function (val, msg) {
    if (!_.isString(val))
        throw new TypeError(msg || 'input value should be a string.');
    return true;
};

utils.validate.number = function (val, msg) {
    if (!_.isNumber(val) || _.isNaN(val))
        throw new TypeError(msg || 'input value should be a number and cannot be a NaN.');
    return true;
};

utils.validate.array = function (val, msg) {
    if (!_.isArray(val))
        throw new TypeError(msg || 'input value should be an array.');
    return true;
};

utils.validate.fn = function (fn, msg) {
    if (!_.isFunction(fn))
        throw new TypeError(msg || 'callback should be a function.');
    return true;
}

utils.validate.object = function (val, msg) {
    if (!_.isObject(val) || _.isArray(val))
        throw new TypeError(msg || 'Input value should be an object.');
    return true;
};

utils.validate.stringOrNumber = function (val, msg) {
    msg = msg || 'Input value should be a number or a string.';

    if (_.isNumber(val)) {
        if (_.isNaN(val))
            throw new TypeError(msg);
    } else if (!_.isString(val)) {
        throw new TypeError(msg);
    }
    return true;
};

utils.validate.defined = function (val, msg) {
    if (_.isUndefined(val))
        throw new TypeError(msg || 'Value should be given.');
    return true;
};

utils.validate.argTypes = function (argsObj) {
    var err;

    for (var key in argsObj) {
        err = utils.validate.checkArgType(key, argsObj[key]);
        if (err)
            break;
    }

    if (err)
        throw err;

    return true;
}

utils.validate.checkArgType = function (arg, val) {
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

module.exports = utils;
