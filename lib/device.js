var _ = require('lodash');
var utils = require('./utils');

function Device(netcore, rawDev) {
    if (!netcore)
        throw new Error('netcore should be given when new Device()');

    this._netcore = netcore;
    this._raw = rawDev;

    this._id = null;            // fb storage
    this._joinTime = null;      // POSIX Time, seconds since 1/1/1970, assigned by netcore at register
    this._timestamp = null;     // POSIX Time, seconds, fb should call dev._markActivity() to update it
    this._gads = [];            // when register gad

    this.states = {
        name: '',               // client user local set
        description: '',        // client user local set
        location: '',           // client user local set
        _enabled: false,
        _traffic: {
            in: { hits: 0, bytes: 0 },
            out: { hits: 0, bytes: 0 }
        },
        role: '',
        parent: '',             // permanent address, default is '0' for netcore
        maySleep: false,        // developer
        sleepPeriod: 30,        // developer, seconds
        status: 'offline',
        address: {
            permanent: '',
            dynamic: ''
        }
    };

    this.attrs = {
        manufacturer: '',
        model: '',
        serial: '',
        version: {
            hw: '',
            sw: '',
            fmw: ''
        },
        power: {
            type: '',
            voltage: ''
        }
    };

    this.extra = null;
}

/*************************************************************************************************/
/*** Device Public APIs                                                                        ***/
/*************************************************************************************************/
Device.prototype.isRegistered  = function () {
    return !_.isNil(this._id);
};

Device.prototype.isEnabled  = function () {
    return this._enabled;
};

Device.prototype.enable = function () {
    // [TODO] attr changed?, net changed?
    this._enabled = true;
    return this;
};

Device.prototype.disable = function () {
    // [TODO] attr changed?, net changed?
    this._enabled = false;
    return this;
};

Device.prototype.resetTxTraffic = function () {
    // [TODO] attr changed?, net changed?
    this._traffic.out.bytes = 0;
    this._traffic.out.hits = 0;

    return this._traffic.out;
};

Device.prototype.resetRxTraffic = function () {
    // [TODO] attr changed?, net changed?
    this._traffic.in.bytes = 0;
    this._traffic.in.hits = 0;
    return this._traffic.in;
};

Device.prototype.dump = function () {
    return {
        netcore: this._netcore ? this._netcore._name : null,
        // no raw
        id: this._id,
        enabled: this._enabled,
        status: this.status,
        joinTime: this._joinTime,
        timestamp: this._timestamp,
        gads: _.cloneDeep(this._gads),
        traffic: _.cloneDeep(this._traffic),
        role: this.role,
        parent: this.parent,
        maySleep: this.maySleep,
        address: _.cloneDeep(this.address),
        attrs: _.cloneDeep(this.attrs)
    };
};

/*************************************************************************************************/
/*** Device Protected APIs                                                                     ***/
/*************************************************************************************************/
Device.prototype._incTxBytes = function (num) {
    // [TODO] attr changed?
    this._traffic.out.bytes += num;
    this._traffic.out.hits += 1;

    return this._traffic.out;
};

Device.prototype._incRxBytes = function (num) {
    // [TODO] attr changed?
    this._traffic.in.bytes += num;
    this._traffic.in.hits += 1;

    return this._traffic.in;
};

Device.prototype._poke = function () {
    this._timestamp = utils.nowSeconds();

    return this;
};

/*************************************************************************************************/
/*** Device Public APIs                                                                        ***/
/*************************************************************************************************/
// getter and setter
Device.prototype.getAttr = function (path) {
    var value = _.get(this.attrs, path);
    // if got an object. return a cloned one
    if (value && _.isPlainObject(value))
        value = _.cloneDeep(value);

    return value;
};

Device.prototype.setAttr = function (path, val) {
    // This API does not merge object
    _.set(this.attrs, path, val);
    return this;
};

/*************************************************************************************************/
/*** Device Public APIs: Protected Member Getters                                              ***/
/*************************************************************************************************/
Device.prototype.getNetcore = function () {
    return this._netcore;
};

Device.prototype.getRaw = function () {
    return this._raw;
};

Device.prototype.getId = function () {
    return this._id;
};

Device.prototype.getJoinTime = function () {
    return this._joinTime;
};

Device.prototype.getGadTable = function () {
    return _.cloneDeep(this._gads);
};

/*************************************************************************************************/
/*** Device Drivers                                                                            ***/
/*************************************************************************************************/
Device.prototype.read = function (attrName, callback) {
    var self = this,
        drvRead = this._netcore._getDriver('dev', 'read');

    if (!this.isEnabled()) {
        return callback(new Error('Not enabled'));
    } else if (!_.isFunction(drvRead)) {
        return callback(new Error('No driver'));
    } else {
        return drvRead(this, attrName, function (err, result) {
            if (!err)
                self._poke();

            callback(err, result);
        });
    }
};

Device.prototype.write = function (attrName, val, callback) {
    var drvWrite = this._netcore._getDriver('dev', 'write');

    if (!this.isEnabled()) {
        return callback(new Error('Not working'));
    } else if (!_.isFunction(drvWrite)) {
        return callback(new Error('No driver'));
    } else {
        // write may not get things back which depneds on implementation
        return drvWrite(this, attrName, val, function (err, result) {
            if (!err)
                self._poke();

            callback(err, result);
        });
    }
};

Device.prototype.identify = function (callback) {
    var self = this,
        drvIdentify = this._netcore._getDriver('dev', 'identify');

    if (!this.isEnabled()) {
        return callback(new Error('Not working'));
    } else if (!_.isFunction(drvIdentify)) {
        return callback(new Error('No driver'));
    } else {
        return drvIdentify(this, function (err, result) {
            if (!err)
                self._poke();

            callback(err, result);
        });
    }
};

Device.prototype.ping = function (callback) {
    var self = this,
        drvPing = this._netcore._getDriver('net', 'ping');

    if (!this.isEnabled()) {
        return callback(new Error('Not working'));
    } else if (!_.isFunction(drvPing)) {
        return callback(new Error('No driver'));
    } else {
        return drvPing(this, function (err, time) {
            if (!err)
                self._poke();

            callback(err, time);
        });
    }
};

module.exports = Device;
