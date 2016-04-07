var _ = require('lodash');
var utils = require('./utils');

function Device(netcore, rawDev) {
    if (!_.isObject(netcore) || !netcore._controller)
        throw new Error('netcore should be given when new Device()');

    this._netcore = netcore;
    this._raw = rawDev;
    this._id = null;            // fb storage
    this._gads = [];            // when register gad

    this._net = {
        enabled: false,         // {RPT}
        joinTime: null,         // POSIX Time, seconds since 1/1/1970, assigned by netcore at register
        timestamp: null,        // POSIX Time, seconds, fb should call dev._markActivity() to update it
        traffic: {              // {RRT} only report@reset
            in: { hits: 0, bytes: 0 },
            out: { hits: 0, bytes: 0 }
        },
        role: '',               // {RPT}
        parent: '0',            // {RPT} permanent address, default is '0' for netcore
        maySleep: false,        // {RPT} developer
        sleepPeriod: 30,        // {RPT} developer, seconds
        status: 'unknown',      // {RPT} online, offline, sleep, unknown
        address: {              // {RPT}
            permanent: '',
            dynamic: ''
        }
    };
    // getProp, setProp
    this._props = {
        name: undefined,               // client user local set
        description: undefined,        // client user local set
        location: undefined            // client user local set
    };
    // LOCAL: getAttr, setAttr; REMOTE: read, write
    this._attrs = {
        manufacturer: undefined,
        model: undefined,
        serial: undefined,
        version: {
            hw: undefined,
            sw: undefined,
            fmw: undefined
        },
        power: {
            type: undefined,
            voltage: undefined
        }
    };

    this.extra = null;
}

/*************************************************************************************************/
/*** Device Public APIs: Protected Member Getters                                              ***/
/*************************************************************************************************/
Device.prototype.getNetcore = function () {
    return this._netcore;
};

Device.prototype.getRawDev = function () {
    return this._raw;
};

Device.prototype.getId = function () {
    return this._id;
};

Device.prototype.getGadTable = function () {
    return _.cloneDeep(this._gads);
};

/*************************************************************************************************/
/*** Device Public APIs                                                                        ***/
/*************************************************************************************************/
Device.prototype.isRegistered  = function () {
    return !_.isNil(this._id);
};

Device.prototype.isEnabled  = function () {
    return this._net.enabled;
};

Device.prototype.getAddress = function () {
    return _.cloneDeep(this._net.address);
};

Device.prototype.getTraffic = function () {
    return _.cloneDeep(this._net.traffic);
};

Device.prototype.getNetInfo = function () {
    return _.cloneDeep(this._net);
};

Device.prototype.setNetInfo = function () {
    // [TODO] find delta
    this._fbEmit('_dev:netChanged', {
        id: this._id,
        permAddr: this.net.address.permanent,
        data: {
            traffic: this.getTraffic()
        }
    });
};

Device.prototype.getProps = function () {
    return _.cloneDeep(this._props);
};

Device.prototype.setProps = function (props) {
    // [TODO] _dev:propsChanged
};

Device.prototype.getAttrs = function () {
    return _.cloneDeep(this._attrs);
};

Device.prototype.setAttrs = function (attrs) {
    // [TODO] _dev:attrsChanged
};

Device.prototype.enable = function () {
    if (!this.isEnabled()) {
        this.net._enabled = true;
        this._fbEmit('_dev:netChanged', {
            id: this._id,
            permAddr: this.net.address.permanent,
            data: {
                enabled: true
            }
        });
    }
    return this;
};

Device.prototype.disable = function () {
    if (this.isEnabled()) {
        this.net._enabled = false;
        this._fbEmit('_dev:netChanged', {
            id: this._id,
            permAddr: this.net.address.permanent,
            data: {
                enabled: false
            }
        });
    }
    return this;
};

Device.prototype.resetTxTraffic = function () {
    this._traffic.out.bytes = 0;
    this._traffic.out.hits = 0;

    // only report@reset
    this._fbEmit('_dev:netChanged', {
        id: this._id,
        permAddr: this.net.address.permanent,
        data: {
            traffic: this.getTraffic()
        }
    });

    return this._traffic.out;
};

Device.prototype.resetRxTraffic = function () {
    this._traffic.in.bytes = 0;
    this._traffic.in.hits = 0;

    // only report@reset
    this._fbEmit('_dev:netChanged', {
        id: this._id,
        permAddr: this.net.address.permanent,
        data: {
            traffic: this.getTraffic()
        }
    });

    return this._traffic.in;
};

Device.prototype.dump = function () {
    return {
        netcore: this._netcore ? this._netcore._name : null,
        // no raw
        id: this._id,
        gads: this.getGadTable(),
        net: {
            enabled: this.isEnabled(),
            joinTime: this.getJoinTime(),
            timestamp: this.getTimestamp(),
            traffic: this.getTraffic(),
            role: this.net.role,
            parent: this.net.parent,
            maySleep: this.net.maySleep,
            sleepPeriod: this.net.sleepPeriod,
            address: _.cloneDeep(this.net.address),
            status: this.getStatus()
        },
        props: this.getProps(),
        attrs: this.getAttrs()
    };
};

Device.prototype.refresh = function () {
    // [TODO] attr changed?, net changed?
    

    // emit: '_nc:, { netcore, }'
};

/*************************************************************************************************/
/*** Device Protected APIs                                                                     ***/
/*************************************************************************************************/
Device.prototype._fbEmit = function (evt, data) {
    var nc = this.getNetcore(),
        emitted = false;

    if (this.isRegistered()) {
        nc._fbEmit(evt, data);
        emitted = true;
    }
    return emitted;
};

Device.prototype._poke = function () {
    return this.setNetInfo({
        timestamp: utils.nowSeconds()
    });
};

Device.prototype._incTxBytes = function (num) {
    var traffic = this.getTraffic(),
        hits = traffic.out.hits + 1,
        bytes = traffic.out.bytes + num;

    return this.setNetInfo({
        traffic: {
            out: {
                hits: hits,
                bytes: bytes
            }
        }
    });
};

Device.prototype._incRxBytes = function (num) {
    var traffic = this.getTraffic(),
        hits = traffic.in.hits + 1,
        bytes = traffic.in.bytes + num;

    return this.setNetInfo({
        traffic: {
            in: {
                hits: hits,
                bytes: bytes
            }
        }
    });
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
