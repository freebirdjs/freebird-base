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
            fw: undefined
        },
        power: {
            type: undefined,
            voltage: undefined
        }
    };

    this.extra = null;
}

/*************************************************************************************************/
/*** Device Public APIs                                                                        ***/
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

Device.prototype.getStatus = function () {
    return this._net.status;
};

Device.prototype.getTraffic = function () {
    return _.cloneDeep(this._net.traffic);
};

Device.prototype.getNetInfo = function (keys) {
    return this._get('_net', keys);
};

Device.prototype.getProps = function (keys) {
    return this._get('_props', keys);
};

Device.prototype.getAttrs = function (keys) {
    return this._get('_attrs', keys);
};

Device.prototype.setNetInfo = function (info) {
    var delta = utils.getObjectDiff(info, this.getNetInfo());

    _.merge(this._net, delta);
    // update, but dont care traffic and timestamp while emitting
    delete delta.traffic;
    delete delta.timestamp;

    if (!_.isEmpty(delta)) {
        this._fbEmit('_dev:netChanged', {
            data: delta
        });
    }
    return this;
};

Device.prototype.setProps = function (props) {
    var delta = utils.getObjectDiff(props, this.getProps());

    if (!_.isEmpty(delta)) {
        _.merge(this._props, delta);

        this._fbEmit('_dev:propsChanged', {
            data: delta
        });
    }
    return this;
};

Device.prototype.setAttrs = function (attrs) {
    var delta = utils.getObjectDiff(attrs, this.getAttrs());
    
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

    return this;
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

    return this;
};

Device.prototype.dump = function () {
    return {
        netcore: this.getNetcore().getName(),
        id: this.getId(),
        gads: this.getGadTable(),
        net: this.getNetInfo(),
        props: this.getProps(),
        attrs: this.getAttrs()
    };
};

Device.prototype.refresh = function (callback) {
    var self = this,
        refreshing,
        clonedAttrs,
        numOfAttrs = 0;

    if (!this.isEnabled())
        return callback(new Error('Not enabled'));

    refreshing = function (newAttrs) {
        self.setAttrs(newAttrs);
        callback(null, newAttrs);
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
                refreshing(clonedAttrs);
        });
    });

    return this;
};

/*************************************************************************************************/
/*** Device Protected APIs                                                                     ***/
/*************************************************************************************************/
Device.prototype._get = function (type, keys) {
    var self = this,
        target = this[type],
        result;

    if (!target)
        return;

    if (_.isString(keys) || _.isArray(keys))
        result = _.pick(target, keys);
    else if (!keys)
        result = target;

    return _.cloneDeep(result);
};

Device.prototype._fbEmit = function (evt, data) {
    var nc = this.getNetcore(),
        emitted = false,
        emitData;

    if (this.isRegistered() && this.isEnabled()) {
        data = data || {};

        emitData = _.assign(data, { dev: this });
        nc._fbEmit(evt, emitData);
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

    this.setNetInfo({
        traffic: {
            out: {
                hits: hits,
                bytes: bytes
            }
        }
    });

    return bytes;
};

Device.prototype._incRxBytes = function (num) {
    var nc = this.getNetcore(),
        traffic = this.getTraffic(),
        hits = traffic.in.hits + 1,
        bytes = traffic.in.bytes + num;

    this.setNetInfo({
        traffic: {
            in: {
                hits: hits,
                bytes: bytes
            }
        }
    });

    return bytes;
};

Device.prototype._findGadRecordByAuxId = function (auxId) {
    return _.find(this._gads, function (r) {
        return r.auxId === auxId;
    });
};

Device.prototype._linkGadWithAuxId = function (auxId) {
    var rec = this._findGadRecordByAuxId(auxId);

    if (!rec) {
        rec = {
            gadId: null,
            auxId: auxId
        };

        this._gads.push(rec);
    }

    return rec;
};

Device.prototype._callDriver = function (drvName, args) {
    var self = this,
        permAddr = this.getPermAddr(),
        nc = this.getNetcore(),
        driver = nc[drvName];

    args = Array.prototype.slice.call(args);
    args.unshift(permAddr);

    // dev._poke@netcore
    if (!this.isEnabled())
        return callback(new Error('Not enabled'));
    else if (!_.isFunction(driver))
        return callback(new Error('Driver not found'));
    else
        return driver.apply(this, args);
};

/*************************************************************************************************/
/*** Device Drivers                                                                            ***/
/*************************************************************************************************/
Device.prototype.read = function (attrName, callback) {
    return this._callDriver('read', arguments);
};

Device.prototype.write = function (attrName, val, callback) {
    return this._callDriver('write', arguments);
};

Device.prototype.identify = function (callback) {
    return this._callDriver('identify', arguments);
};

Device.prototype.ping = function (callback) {
    return this._callDriver('ping', arguments);
};

module.exports = Device;
