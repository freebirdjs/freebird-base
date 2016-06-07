var _ = require('lodash'),
    utils = require('./utils');

function Device(netcore, rawDev) {
    if (!_.isObject(netcore) || !netcore._controller)
        throw new Error('netcore should be given when new Device()');

    this._netcore = netcore;
    this._raw = rawDev;         // optional
    this._id = null;            // register@fb
    this._gads = [];            // when register gad @fb, { gadId: null, auxId: auxId }
    this._removing = false;     // devLeaving helper, tag if it is removed by remove()

    this._net = {
        enabled: false,         // cannot set by setNetInfo(). should use enable()
        joinTime: null,         // POSIX Time, seconds since 1/1/1970, assigned by freebird@register
        timestamp: null,        // POSIX Time, seconds, fb should call dev._poke() to update it
        traffic: {              // only report@traffic reset
            in: { hits: 0, bytes: 0 },
            out: { hits: 0, bytes: 0 }
        },
        role: '',
        parent: '0',            // permanent address, default is '0' for netcore
        maySleep: false,        // developer tells
        sleepPeriod: 30,        // developer tells, seconds
        status: 'unknown',      // online, offline, sleep, unknown
        address: {
            permanent: '',
            dynamic: ''
        }
    };

    this._props = {
        name: undefined,        // client user set at will
        description: undefined, // client user set at will
        location: undefined     // client user set at will
    };

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

    this.extra = null;          // developer sets at will
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
    if (this.isEnabled())
        return this;

    this._net.enabled = true;           // should enable first,
    this._fbEmit('_dev:netChanged', {   // or _fbEmit() will be blocked
        data: { enabled: true }
    });
    return this;
};

Device.prototype.disable = function () {
    if (!this.isEnabled())
        return this;

    this._fbEmit('_dev:netChanged', {   // should emit first then change enabled to false,
        data: { enabled: false }        // or _fbEmit() will be blocked
    });
    this._net.enabled = false;

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

Device.prototype.getTraffic = function (dir) {
    if (dir === 'in')
        return _.cloneDeep(this._net.traffic.in);
    else if (dir === 'out')
        return _.cloneDeep(this._net.traffic.out);
    else
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
    var delta;

    if (!_.isPlainObject(info))
        throw new TypeError('info should be an object');

    delta = utils.getObjectDiff(info, this.getNetInfo());

    delete delta.enabled;   // 'enabled' cannot be set through setNetInfo()
    _.merge(this._net, delta);

    delete delta.traffic;   // update, but dont care traffic and timestamp at emitting
    delete delta.timestamp;

    if (!_.isEmpty(delta))
        this._fbEmit('_dev:netChanged', { data: delta });

    return this;
};

Device.prototype.setProps = function (props) {
    var delta;

    if (!_.isPlainObject(props))
        throw new TypeError('props should be an object');

    delta = utils.getObjectDiff(props, this.getProps());

    if (!_.isEmpty(delta)) {
        _.merge(this._props, delta);
        this._fbEmit('_dev:propsChanged', { data: delta });
    }
    return this;
};

Device.prototype.setAttrs = function (attrs) {
    var delta;

    if (!_.isPlainObject(attrs))
        throw new TypeError('attrs should be an object');

    delta = utils.getObjectDiff(attrs, this.getAttrs());
    
    if (!_.isEmpty(delta)) {
        _.merge(this._attrs, delta);
        this._fbEmit('_dev:attrsChanged', { data: delta });
    }
    return this;
};

Device.prototype.resetTxTraffic = function () {
    this._net.traffic.out.bytes = 0;
    this._net.traffic.out.hits = 0;

    this._fbEmit('_dev:netChanged', {   // only report@reset
        data: {
            traffic: { out: _.cloneDeep(this._net.traffic.out) }
        }
    });
    return this;
};

Device.prototype.resetRxTraffic = function () {
    this._net.traffic.in.bytes = 0;
    this._net.traffic.in.hits = 0;

    this._fbEmit('_dev:netChanged', {   // only report@reset
        data: {
            traffic: { in: _.cloneDeep(this._net.traffic.in) }
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

Device.prototype.recoverFromRecord = function (rec) {
    var self = this,
        wasEnabled = rec.net.enabled;
    this._recovered = true;
    rec.net.status = 'unknown'; // dev status should be 'unknown' when recovered

    this._setId(rec.id);
    this.setNetInfo(rec.net);   // enabled will be ignored
    this.setAttrs(rec.attrs);
    this.setProps(rec.props);

    rec.gads.forEach(function (gRec) {
        self._gads.push(gRec);
    });
    // recovery completes, but no raw, not extra

    // enabled after all 'setXXX()' completes, to avoid changed events
    if (wasEnabled)     // if it was enabled, enable it
        this.enable();

    return this;
};

Device.prototype.refresh = function (callback) {
    var self = this,
        err,
        refreshing,
        clonedAttrs,
        numOfAttrs = 0;

    callback = callback || function () {};

    if (!this.isEnabled()) {
        err = new Error('Device not enabled');
        this._fbEmit('_dev:error', { error: err });
        return callback(err);
    }

    refreshing = function (newAttrs) {
        self.setAttrs(newAttrs);
        callback(null, newAttrs);
    };
    
    clonedAttrs = this.getAttrs();

    numOfAttrs = _.keys(clonedAttrs).length;

    _.forEach(clonedAttrs, function (val, key) {
        self.read(key, function (er, result) {
            // fill up clonedAttrs. delete it if error occurs (i.e., timeout)
            if (!er)
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
    var target = this[type],
        result;

    if (target) {
        if (_.isString(keys) || _.isArray(keys))
            result = _.pick(target, keys);
        else if (!keys)
            result = target;
    }
    return _.cloneDeep(result);
};

Device.prototype._setId = function (id) {
    this._id = id;
};

Device.prototype._setRawDev = function (raw) {
    this._raw = raw;
};

Device.prototype._fbEmit = function (evt, data) {
    var nc = this.getNetcore(),
        emitted = false,
        emitData,
        isErrEvt = (evt === '_dev:error'),
        isRegEn = (this.isRegistered() && this.isEnabled() && !this._recovered);

    if (isErrEvt || isRegEn) {
        data = data || {};
        // if error, give device id, not device object
        emitData = isErrEvt ? _.assign(data, { dev: this.getId() }) : _.assign(data, { dev: this });
        emitted = nc._fbEmit(evt, emitData);
        emitted = true;
    }

    return emitted;
};

Device.prototype._poke = function () {
    return this.setNetInfo({ timestamp: utils.nowSeconds() });
};

Device.prototype._incTxBytes = function (num) {
    var trfOut = this.getTraffic('out');

    trfOut.hits += 1;
    trfOut.bytes += num;

    this.setNetInfo({
        traffic: { out: trfOut }
    });
    return trfOut.bytes;
};

Device.prototype._incRxBytes = function (num) {
    var trfIn = this.getTraffic('in');

    trfIn.hits += 1;
    trfIn.bytes += num;

    this.setNetInfo({
        traffic: { in: trfIn }
    });
    return trfIn.bytes;
};

Device.prototype._findGadRecordByAuxId = function (auxId) {
    return _.find(this._gads, function (r) {
        return r.auxId === auxId;
    });
};

Device.prototype._linkGadWithAuxId = function (auxId) {
    var rec = this._findGadRecordByAuxId(auxId);

    if (!rec) {
        rec = { gadId: null, auxId: auxId };
        this._gads.push(rec);
    }
    return rec;
};

Device.prototype._unlinkGad = function (gadId, auxId) {
    var rec = this._findGadRecordByAuxId(auxId),
        idx;

    if (rec.gadId !== gadId)
        rec = undefined;

    if (rec) {
        idx = this._gads.indexOf(rec);

        if (idx !== -1)
            this._gads.splice(idx, 1);
    }
    return rec;
};

Device.prototype._setGadIdToAuxId = function (gadId, auxId) {
    var rec = this._findGadRecordByAuxId(auxId);

    if (!rec) {
        rec = { gadId: gadId, auxId: auxId };
        this._gads.push(rec);
    } else {
        rec.gadId = gadId;
    }

    return rec;
};

Device.prototype._callDriver = function (drvName, args) {
    var err,
        callback,
        permAddr = this.getPermAddr(),
        nc = this.getNetcore(),
        driver = nc._findDriver('dev', drvName);

    args = Array.prototype.slice.call(args);
    args.unshift(permAddr);
    callback = args[args.length - 1];

    if (!_.isFunction(callback)) {
        callback = function (err) {};
        args.push(callback);
    }

    if (!this.isEnabled())  // dev._poke@netcore
        err = new Error('Device not enabled.');
    else if (!nc.isEnabled())
        err = new Error('Netcore not enabled.');
    else if (!_.isFunction(driver))
        err = new Error('Driver ' + drvName + ' not found.');

    if (err) {
        this._fbEmit('_dev:error', { error: err });
        return callback(err);
    } else {
        return driver.apply(this, args);
    }
};

Device.prototype._clear = function () {
    this._netcore = null;
    this._raw = null;
    this._id = null;
    this._gads = null;
};

Device.prototype._dumpDevInfo = function () {
    var info = this.dump(),
        gadIds;
    delete info.net.maySleep;
    delete info.net.sleepPeriod;

    gadIds = _.map(info.gads, function (rec) {
        return rec.gadId;
    });

    info.gads = gadIds;
    return info;
};

/*************************************************************************************************/
/*** Device Drivers                                                                            ***/
/*************************************************************************************************/
Device.prototype.read = function (attrName, callback) {
    var err;

    if (_.isFunction(attrName) && !_.isFunction(callback)) {
        callback = attrName;
        attrName = null;
    }

    if (!_.isString(attrName)) {
        err = new TypeError('attrName of read() should be a string.');
        this._fbEmit('_dev:error', { error: err });
        callback(err);
        throw err;
    } else {
        return this._callDriver('read', arguments);
    }
};

Device.prototype.write = function (attrName, val, callback) {
    var err;

    if (_.isFunction(attrName)) {
        callback = attrName;
        attrName = undefined;
    } else if (_.isFunction(val)) {
        callback = val;
        val = undefined;
    }

    if (!_.isString(attrName))
        err = new TypeError('attrName of write() should be a string.');
    else if (_.isUndefined(val))
        err = new Error('val of write() should be given.');

    if (err) {
        this._fbEmit('_dev:error', { error: err });
        callback(err);
        throw err;
    } else {
        return this._callDriver('write', arguments);
    }
};

Device.prototype.identify = function (callback) {
    var err;
    if (!_.isUndefined(callback) && !_.isFunction(callback)) {
        err = new TypeError('callback should be a function');
        this._fbEmit('_dev:error', { error: err });
        throw err;
    } else {
        return this._callDriver('identify', arguments);
    }
};

Device.prototype.ping = function (callback) {
    var nc = this.getNetcore(),
        err;

    if (!_.isUndefined(callback) && !_.isFunction(callback)) {
        err = new TypeError('callback should be a function');
        this._fbEmit('_dev:error', { error: err });
        throw err;
    } else {
        return this._callDriver('ping', arguments);
    }
};

module.exports = Device;
