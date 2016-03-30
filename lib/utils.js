exports.getDevDiff = function (devOld, devNew) {
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