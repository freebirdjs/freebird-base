var _ = require('lodash');

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
        throw new Error('buildPathValuePairs() fails, input is not an object.');

    if (tip !== undefined && tip !== '' && tip !== '.' && tip !== '/')
        tip = tip + '.';

    _.forEach(obj, function (val, key) {
        if (obj.hasOwnProperty(key)) {
            // Tricky: If val is an array, don't buid its full path
            if (_.isArray(val) || !_.isObject(val))
                result[tip + key] = val;
            else if (_.isObject(val))
                result = Object.assign(result, utils.buildPathValuePairs(tip + key, val));
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
        props = [ 'profile', 'class', 'auxId' ];

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

module.exports = utils;
