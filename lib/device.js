var _ = require('lodash');
var utils = require('./utils');

function Device(netcore, rawDev) {
    if (!_.isObject(netcore) || !netcore._controller)
        throw new Error('netcore should be given when new Device()');

    this._netcore = netcore;
    this._raw = rawDev;         // optional
    this._id = null;            // register@fb
    this._gads = [];            // when register gad @fb

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
Device.prototype.enable = function () {
    if (!this.isEnabled()) {
        this._net.enabled = true;
        this._fbEmit('_dev:netChanged', {
            data: {
                enabled: true
            }
        });
    }
    return this;
};

Device.prototype.disable = function () {
    if (this.isEnabled()) {
        this._net.enabled = false;
        this._fbEmit('_dev:netChanged', {
            data: {
                enabled: false
            }
        });
    }
    return this;
};

Device.prototype.isRegistered  = function () {
    return !_.isNil(this._id);
};

Device.prototype.isEnabled  = function () {
    return this._net.enabled;
};

Device.prototype.getAddr = function () {
    return _.cloneDeep(this._net.address);
};

Device.prototype.getPermAddr = function () {
    return this._net.address.permanent;
};

Device.prototype.getTraffic = function () {
    return _.cloneDeep(this._net.traffic);
};

Device.prototype.getStatus = function () {
    return this._net.status;
};

Device.prototype.getNetInfo = function (paths) {
    return this._get('_net', paths);
};

Device.prototype.getProps = function (paths) {
    return this._get('_props', paths);
};

Device.prototype.getAttrs = function (paths) {
    return this._get('_attrs', paths);
};

Device.prototype.setNetInfo = function (info) {
    var delta = utils.getDevNetDiff(info, this.getNetInfo());    // [TODO] utils: find delta, traffic, timestamp dont care

    if (!_.isEmpty(delta)) {
        _.merge(this._net, delta);

        this._fbEmit('_dev:netChanged', {
            data: delta
        });
    }
    return this;
};

Device.prototype.setProps = function (props) {
    var delta = utils.getDevPropsDiff(props, this.getProps());    // [TODO] utils: find delta
    
    if (!_.isEmpty(delta)) {
        _.merge(this._props, delta);

        this._fbEmit('_dev:propsChanged', {
            data: delta
        });
    }
    return this;
};

Device.prototype.setAttrs = function (attrs) {
    var delta = utils.getDevAttrsDiff(attrs, this.getAttrs());    // [TODO] utils: find delta
    
    if (!_.isEmpty(delta)) {
        _.merge(this._attrs, delta);

        this._fbEmit('_dev:attrsChanged', {
            data: delta
        });
    }
    return this;
};

Device.prototype.resetTxTraffic = function () {
    var permAddr = this.getAddress().permanent,
        traffic;

    this._net.traffic.out.bytes = 0;
    this._net.traffic.out.hits = 0;

    traffic = this.getTraffic();
    // only report@reset
    this._fbEmit('_dev:netChanged', {
        data: {
            traffic: {
                out: traffic.out
            }
        }
    });

    return traffic.out;
};

Device.prototype.resetRxTraffic = function () {
    var permAddr = this.getAddress().permanent,
        traffic;

    this._traffic.in.bytes = 0;
    this._traffic.in.hits = 0;

    traffic = this.getTraffic();
    // only report@reset
    this._fbEmit('_dev:netChanged', {
        data: {
            traffic: {
                in: traffic.in
            }
        }
    });

    return traffic.in;
};

Device.prototype.dump = function () {
    return {
        netcore: this._netcore ? this._netcore._name : null,
        id: this._id,
        gads: this.getGadTable(),
        net: this.getNetInfo(),
        props: this.getProps(),
        attrs: this.getAttrs()
    };
};

Device.prototype.refresh = function (callback) {
    var self = this,
        refreshed,
        clonedAttrs,
        numOfAttrs = 0;

    if (!this.isEnabled())
        return callback(new Error('Not enabled'));

    refreshed = function () {
        self.setAttrs(clonedAttrs);
        callback(null, clonedAttrs);
    };
    
    clonedAttrs = this.getAttrs();

    _.forEach(clonedAttrs, function (val, key) {
        numOfAttrs += 1;
    });

    _.forEach(clonedAttrs, function (val, key) {
        self.read(key, function (err, result) {
            // fill up clonedAttrs. delete it if error occurs (i.e., timeout)
            if (!err)
                clonedAttrs[key] = result;
            else
                delete clonedAttrs[key];

            numOfAttrs -= 1;

            if (numOfAttrs === 0)
                refreshed();
        });
    });

    return this;
};

/*************************************************************************************************/
/*** Device Protected APIs                                                                     ***/
/*************************************************************************************************/
Device.prototype._get = function (type, paths) {
    var self = this,
        target = this[type],
        result;

    if (!target)
        return;

    if (_.isString(paths)) {
        result = _.get(target, paths);
    } else if (_.isArray(paths)) {
        result = [];
        _.forEach(paths, function (path) {
            var val = _.get(target, path);

            if (_.isObject(val))
                val = _.cloneDeep(val);

            result.push(val);
        });
    } else if (!paths) {
        result = _.cloneDeep(target);
    }

    return result;
};

Device.prototype._fbEmit = function (evt, data) {
    var nc = this.getNetcore(),
        emitted = false,
        emitData;

    if (this.isRegistered() && this.isEnabled()) {
        data = data || {};

        emitData = _.assign(data, {
            id: this.getId(),
            permAddr: this.getPermAddr()
        });

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

Device.prototype._linkGadWithAuxId = function (auxId) {
    var rec = this._findGadRecordByAuxId(auxId);

    if (!rec) {
        this._gads.push({
            gadId: null,
            auxId: auxId
        });
    }
    return this;
};

Device.prototype._findGadRecordByAuxId = function (auxId) {
    return _.find(this._gads, function (r) {
        return r.auxId === auxId;
    });
};
/*************************************************************************************************/
/*** Device Drivers                                                                            ***/
/*************************************************************************************************/
Device.prototype.read = function (attrName, callback) {
    var self = this,
        nc = this.getNetcore,
        drvRead = nc._getDriver('dev', 'read');

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
        return callback(new Error('Not enabled'));
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
