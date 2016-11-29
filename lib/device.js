'use strict';

var _ = require('busyman'),
    utils = require('./utils'),
    validate = utils.validate,
    EVTS = require('freebird-constants').EVENTS_FROM_BOTTOM;

function Device(netcore, rawDev) {
    var writableProp = { writable: true, enumerable: false, configurable: false },
        unwritableProp = { writable: false, enumerable: false, configurable: false };

    validate.netcore(netcore);

    Object.defineProperty(this, '_netcore', _.assign({ value: netcore }, writableProp));
    Object.defineProperty(this, '_raw', _.assign({ value: rawDev }, writableProp));         // optional
    Object.defineProperty(this, '_id', _.assign({ value: null }, writableProp));            // register@fb
    Object.defineProperty(this, '_gads', _.assign({ value: [] }, writableProp));            // when register gad @fb, { gadId: null, auxId: auxId }

    Object.defineProperty(this, '_net', _.assign({
        value: {
            enabled: false,         // cannot set by set('net', info). should use enable()
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
        }
    }, unwritableProp));

    Object.defineProperty(this, '_attrs', _.assign({
        value: {
            manufacturer: '',
            model: '',
            serial: '',
            version: {
                hw: '',
                sw: '',
                fw: ''
            },
            power: {
                type: '',
                voltage: ''
            }
        }
    }, unwritableProp));

    Object.defineProperty(this, '_props', _.assign({
        value: {
            name: '',               // client user set at will
            description: '',        // client user set at will
            location: ''            // client user set at will
        }
    }, unwritableProp));

    Object.defineProperty(this, '_removing', _.assign({ value: false }, writableProp));     // devLeaving helper, tag if it is removed by remove()
    Object.defineProperty(this, '_recovered', _.assign({ value: false }, writableProp));    // device reloading helper, tag if it is reload from database

    this.extra = null;          // developer sets at will
}

/*************************************************************************************************/
/*** Device Public APIs                                                                        ***/
/*************************************************************************************************/
Device.prototype.isRegistered  = function () {
    return !_.isNil(this._id);
};

Device.prototype.isEnabled  = function () {
    return this._net.enabled;
};

Device.prototype.enable = function () {
    if (this.isEnabled())
        return this;

    // should enable first, or _fire() will be blocked
    this._net.enabled = true;
    this._fire(EVTS.DevNetChanged, { data: { enabled: true } });
    return this;
};

Device.prototype.disable = function () {
    if (!this.isEnabled())
        return this;

    // should emit first then change enabled to false, or _fire() will be blocked
    this._fire(EVTS.DevNetChanged, { data: { enabled: false } });
    this._net.enabled = false;
    return this;
};

Device.prototype.get = function (name, arg) {
    var result;
    validate.string(name, 'name should be a string.');

    switch (name) {
        case 'id':          // getId
            result = this._id;
            break;
        case 'raw':         // getRawDev
            result = this._raw;
            break;
        case 'netcore':     // getNetcore
            result = this._netcore;
            break;
        case 'gadTable':    // getGadTable
            result = _.cloneDeep(this._gads);
            break;
        case 'address':     // getAddr
            result = _.cloneDeep(this._net.address);
            break;
        case 'permAddr':    // getPermAddr
            result = this._net.address.permanent;
            break;
        case 'dynAddr':
            result = this._net.address.dynamic;
            break;
        case 'status':      // getStatus
            result = this._net.status;
            break;
        case 'traffic':     // getTraffic
            // arg = dir 'in' or 'out'
            result = arg ? _.cloneDeep(this._net.traffic[arg]) : _.cloneDeep(this._net.traffic);
            break;
        case 'net':         // getNetInfo
            result = utils.getFrom(this, '_net', arg);    // arg = keys
            break;
        case 'props':       // getProps
            result = utils.getFrom(this, '_props', arg);  // arg = keys
            break;
        case 'attrs':       // getAttrs
            result = utils.getFrom(this, '_attrs', arg);  // arg = keys
            break;
        default:
            break;
    }
    return result;
};

Device.prototype.set = function (name, value) {
    var delta;
    validate.string(name, 'name should be a string.');

    switch (name) {
        case '_id':     // _setId, protected
            validate.stringOrNumber(value, '_id should be a number or a string.');
            this._id = value;   // value = id
            break;
        case '_raw':    // _setRawDev
            this._raw = value;  // value = raw
            break;
        case 'net':     // setNetInfo
            validate.object(value, 'info should be an object');
            delta = utils.getObjectDiff(value, this.get('net'));
            delete delta.enabled;   // 'enabled' cannot be set through setNetInfo()
            _.merge(this._net, delta);
            delete delta.traffic;   // update, but dont care traffic and timestamp at emitting
            delete delta.timestamp;
            if (!_.isEmpty(delta))
                this._fire(EVTS.DevNetChanged, { data: delta });
            break;
        case 'props':   // setProps
            validate.object(value, 'props should be an object');
            delta = utils.getObjectDiff(value, this.get('props'));
            if (!_.isEmpty(delta)) {
                _.merge(this._props, delta);
                this._fire(EVTS.DevPropsChanged, { data: delta });
            }
            break;
        case 'attrs':   // setAttrs
            validate.object(value, 'attrs should be an object');
            delta = utils.getObjectDiff(value, this.get('attrs'));
            if (!_.isEmpty(delta)) {
                _.merge(this._attrs, delta);
                this._fire(EVTS.DevAttrsChanged, { data: delta });
            }
            break;
        default:
            break;
    }

    return this;
};

Device.prototype.resetTraffic = function (dir) {
    var traffic = {},
        self = this;

    if (!_.isUndefined(dir))
        validate.string(dir, "dir should be a string 'in' or 'out' if given");

    if (!dir || dir === 'out') {
        this._net.traffic.out.bytes = 0;
        this._net.traffic.out.hits = 0;
        traffic['out'] = _.cloneDeep(this._net.traffic.out);
    }

    if (!dir || dir === 'in') {
        this._net.traffic.in.bytes = 0;
        this._net.traffic.in.hits = 0;
        traffic['in'] = _.cloneDeep(this._net.traffic.in);
    }

    // to prevent fire all-at-once from netcore.resetTraffic()
    setImmediate(function () {
        self._fire(EVTS.DevNetChanged, {    // only report@reset
            data: { traffic: traffic }
        });
    });

    return this;
};

Device.prototype.dump = function () {
    var nc = this.get('netcore'),
        data = {
            netcore: nc ? nc.getName() : 'unknown',
            id: this.get('id'),
            gads: this.get('gadTable'),
            net: this.get('net'),
            attrs: this.get('attrs'),
            props: this.get('props')
        };
    return data;
};

Device.prototype.recoverFromRecord = function (rec) {
    validate.object(rec, 'rec should be an object.');
    var self = this,
        wasEnabled = rec.net.enabled;

    rec.net.status = 'unknown'; // dev status should be 'unknown' when recovered

    // recoverying, but no raw, not extra
    this._recovered = true;
    this.set('_id', rec.id);
    this.set('net', rec.net);   // enabled will be ignored
    this.set('attrs', rec.attrs);
    this.set('props', rec.props);

    rec.gads.forEach(function (gRec) {
        self._gads.push(gRec);
    });

    // enabled after all 'setXXX()' completes, to avoid changed events
    if (wasEnabled)             // if it was enabled, enable it
        this.enable();

    return this;
};

/*************************************************************************************************/
/*** Device Protected APIs                                                                     ***/
/*************************************************************************************************/
Device.prototype._poke = function () {
    return this.set('net', { timestamp: Math.floor(Date.now()/1000) }); // seconds
};

Device.prototype._accumulateBytes = function (dir, num) {
    validate.string(dir, 'dir should be a string.');
    validate.stringOrNumber(num, 'gadId should be a number or a string.');

    if (dir !== 'in' && dir !== 'out')
        return 0;

    var traffic = this.get('traffic', dir);
    traffic.hits += 1;
    traffic.bytes += num;

    if (dir === 'in')
        this.set('net', { traffic: { in: traffic } });
    else
        this.set('net', { traffic: { out: traffic } });

    return traffic.bytes;
};

Device.prototype._fire = function (evt, data) {
    validate.string(evt, 'evt should be a string.');
    var nc = this.get('netcore'),
        emitted = false,
        emitData,
        isErrEvt = (evt === EVTS.DevError),
        isRegEn = (this.isRegistered() && this.isEnabled() && !this._recovered);

    if (isErrEvt || isRegEn) {
        data = data || {};
        // if error, give device id, not device object
        emitData = isErrEvt ? _.assign(data, { dev: this.get('id') }) : _.assign(data, { dev: this });
        emitted = nc._fire(evt, emitData);
    }

    return emitted;
};

Device.prototype._callDriver = function (drvName, args) {
    validate.string(drvName, 'drvName should be a string.');

    var nc = this.get('netcore'),
        driver = nc ? nc[drvName] : undefined,
        callback = args[args.length - 1],
        err = anyEnableError.call(this);

    if (!_.isFunction(driver))
        err = err || new Error('Driver not found');

    if (err)
        return setImmediate(callback, err);

    args = _.concat([ this.get('permAddr') ], Array.prototype.slice.call(args));
    return driver.apply(nc, args);
};

Device.prototype._linkGad = function (auxId) {
    var rec = findGadRecordByAuxId.call(this, auxId);

    if (!rec) {
        rec = { gadId: null, auxId: auxId };
        this._gads.push(rec);
    }
    return rec;
};

Device.prototype._unlinkGad = function (gadId, auxId) {
    validate.stringOrNumber(gadId, 'gadId should be a number or a string.');
    var rec = findGadRecordByAuxId.call(this, auxId),
        idx;

    if (rec) {
        rec = (rec.gadId === gadId) ? rec : undefined;
        idx = this._gads.indexOf(rec);

        if (idx !== -1)
            this._gads.splice(idx, 1);
    }
    return rec;
};

Device.prototype._connectGadIdToAuxId = function (gadId, auxId) {
    validate.stringOrNumber(gadId, 'gadId should be a number or a string.');
    var rec = findGadRecordByAuxId.call(this, auxId);

    if (!rec) {
        rec = { gadId: gadId, auxId: auxId };
        this._gads.push(rec);
    } else {
        rec.gadId = gadId;
    }

    return rec;
};

Device.prototype._clear = function () {
    this._netcore = null;
    this._raw = null;
    this._id = null;
    this._gads = null;
};

/*************************************************************************************************/
/*** Device Drivers                                                                            ***/
/*************************************************************************************************/
Device.prototype.read = function (attrName, callback) {
    validate.argTypes({ attrName: attrName, callback: callback });

    var self = this,
        readCb = function (err, data) {
            if (!err)
                self.set('attrs', _.set({}, attrName, data));

            callback(err, data);
        };

    return this._callDriver('devRead', [ attrName, readCb ]);
};

Device.prototype.write = function (attrName, val, callback) {
    val = _.isFunction(val) ? undefined : val;
    validate.argTypes({ attrName: attrName, val: val, callback: callback });

    var self = this,
        writeCb = function (err, data) {
            if (!err) {
                if (!_.isNil(data))
                    self.set('attrs', _.set({}, attrName, data));
                else
                    self.set('attrs', _.set({}, attrName, val));
            }

            callback(err, data);
        };

    return this._callDriver('devWrite', [ attrName, writeCb ]);
};

Device.prototype.identify = function (callback) {
    validate.fn(callback);
    return this._callDriver('identify', arguments);
};

Device.prototype.ping = function (callback) {
    validate.fn(callback);
    return this._callDriver('ping', arguments);
};

Device.prototype.maintain = function (callback) {
    var cbCalled = false,
        nc = this.get('netcore'),
        clonedGadTable = this.get('gadTable'),
        numGads = clonedGadTable.length,    // [ { gadId: null, auxId: auxId }, ... ]
        freebird = _.isObject(nc) ? nc._freebird : undefined;

    callback = callback || function (err, maintained) {
        if (err)
            self._fire(EVTS.DevError, { error: err });
    };

    if (!nc || !freebird)
        return setImmediate(callback, new Error('Cannot maintain. Device is not registered properly'));
    else if (!_.isFunction(callback))
        return setImmediate(callback, new TypeError('callback should be a function if given'));
    else if (!this.isEnabled() || this.get('status') === 'offline')
        return setImmediate(callback, null, false); // offline or disabled, no need to maintain

    this._resync(function (err) {
        if (err) {
            cbCalled = true;
            return callback(err, false);
        } else {
            keepGadSyncing();
        }
    });

    function keepGadSyncing() {
        var gad;

        if (cbCalled)
            return;

        if (clonedGadTable.length === 0) {
            cbCalled = true;
            return callback(null, true);
        }

        gad = clonedGadTable.pop();
        gad = freebird.findById(gad.gadId);

        if (!gad) {
            keepGadSyncing();   // gad not found, keep doing next gad syncing
        } else {
            gad.maintain(function (err, maintained) {
                if (err) {
                    cbCalled = true;
                    callback(null, false);
                }
                keepGadSyncing();
            });
        }
    }
};

Device.prototype._resync = function (callback) {
    var self = this,
        clonedAttrs = this.get('attrs'),
        attrNames = _.keys(clonedAttrs),
        isModified = false,
        cbCalled = false;

    function keepReading() {
        var attrName;

        if (cbCalled)
            return;

        if (attrNames.length === 0) {
            if (isModified)
                self.set('attrs', clonedAttrs);

            cbCalled = true;
            return callback(null, true);
        }

        attrName = attrNames.pop();
        self.read(attrName, function (err, data) {
            if (err) {
                if (isModified)
                    self.set('attrs', clonedAttrs);

                cbCalled = true;
                callback(err, isModified);
            } else {
                clonedAttrs[attrName] = data;
                isModified = true;
            }
            keepReading();
        });
    }
};

/*************************************************************************************************/
/*** Private Helpers                                                                           ***/
/*************************************************************************************************/
function anyEnableError() {
    var err;
    if (!this.isEnabled())
        err = new Error('Device disabled.');
    else if (!this.get('netcore').isEnabled())
        err = new Error('Netcore disabled.');

    return err;
}

function findGadRecordByAuxId(auxId) {
    validate.stringOrNumber(auxId, 'auxId should be a number or a string.');
    return _.find(this._gads, function (r) {
        return r.auxId === auxId;
    });
}

module.exports = Device;
