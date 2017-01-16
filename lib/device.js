'use strict';

var _ = require('busyman'),
    utils = require('./utils'),
    validate = utils.validate,
    BTM_EVTS = require('freebird-constants').EVENTS_FROM_BOTTOM;

var baseProp = { writable: true, enumerable: false, configurable: false };

function Device(netcore, rawDev) {
    if (!(this instanceof Device))
        return new Device(netcore, rawDev);

    validate.netcore(netcore);

    Object.defineProperty(this, '_recovering', _.assign({ value: false }, baseProp));   // helper, tag if it is reload from database
    Object.defineProperty(this, '_removing', _.assign({ value: false }, baseProp));     // devLeaving helper, tag if it is removed by remove()
    Object.defineProperty(this, '_netcore', _.assign({ value: netcore }, baseProp));
    Object.defineProperty(this, '_raw', _.assign({ value: rawDev }, baseProp));         // optional
    Object.defineProperty(this, '_id', _.assign({ value: null }, baseProp));            // register@fb
    Object.defineProperty(this, '_gads', _.assign({ value: [] }, baseProp));            // when register gad @fb, { gadId: null, auxId: auxId }

    Object.defineProperty(this, '_net', _.assign({
        value: {
            enabled: false,         // cannot set by set('net', info). should use enable() to enable it
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
    }, baseProp, { writable: false }));

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
    }, baseProp, { writable: false }));

    Object.defineProperty(this, '_props', _.assign({    // client-side user can set at will
        value: {
            name: '',
            description: '',
            location: ''
        }
    }, baseProp, { writable: false }));

    this.extra = null;  // developer can set at will
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

    // should enable first, or _handoff() will be blocked
    this._net.enabled = true;
    this._handoff(BTM_EVTS.DevNetChanged, { data: { enabled: true } });
    return this;
};

Device.prototype.disable = function () {
    if (!this.isEnabled())
        return this;

    // should emit first then change enabled to false, or _handoff() will be blocked
    this._handoff(BTM_EVTS.DevNetChanged, { data: { enabled: false } });
    this._net.enabled = false;
    return this;
};

Device.prototype.get = function (name, arg) {   // arg is for internal use, not declared in document
    var result;
    validate.string(name, 'name should be a string.');

    switch (name) {
        case 'id':
            result = this._id;
            break;
        case 'raw':
            result = this._raw;
            break;
        case 'netcore':
            result = this._netcore;
            break;
        case 'gadTable':
            result = _.cloneDeep(this._gads);
            break;
        case 'address':
            result = _.cloneDeep(this._net.address);
            break;
        case 'permAddr':
            result = this._net.address.permanent;
            break;
        case 'dynAddr':
            result = this._net.address.dynamic;
            break;
        case 'status':
            result = this._net.status;
            break;
        case 'traffic':
            // arg = dir 'in' or 'out'
            result = arg ? _.cloneDeep(this._net.traffic[arg]) : _.cloneDeep(this._net.traffic);
            break;
        case 'net':
            result = utils.getFrom(this, '_net', arg);    // arg = keys
            break;
        case 'props':
            result = utils.getFrom(this, '_props', arg);  // arg = keys
            break;
        case 'attrs':
            result = utils.getFrom(this, '_attrs', arg);  // arg = keys
            break;
        default:
            break;
    }
    return result;
};

Device.prototype.set = function (name, value) {
    var self = this,
        oldData, delta;

    validate.string(name, 'name should be a string.');

    switch (name) {
        case '_id':     // protected, value = id
            if (!this._recovering)
                validate.stringOrNumber(value, '_id should be a number or a string.');
            this._id = value;
            break;
        case '_raw':    // protected, value = raw
            this._raw = value;
            break;
        case 'net':
            validate.object(value, 'info should be an object');
            delta = utils.getObjectDiff(value, this.get('net'));
            delete delta.enabled;   // 'enabled' cannot be set through set('net')

            _.merge(this._net, delta);
            delete delta.traffic;   // updated, but ignore the traffic 
            delete delta.timestamp; // and timestamp changes at emitting

            if (!_.isEmpty(delta))
                this._handoff(BTM_EVTS.DevNetChanged, { data: delta });
            break;
        case 'props':
            validate.object(value, 'props should be an object');
            delta = utils.getObjectDiff(value, this.get('props'));

            if (!_.isEmpty(delta)) {
                oldData = {};   // picks old data up to _data, this is for app-level binding

                _.forEach(delta, function (v, k) {
                    oldData[k] = self._props[k];
                });

                _.merge(this._props, delta);

                this._handoff(BTM_EVTS.DevPropsChanged, { data: delta, _data: oldData });
            }
            break;
        case 'attrs': 
            validate.object(value, 'attrs should be an object');
            delta = utils.getObjectDiff(value, this.get('attrs'));

            if (!_.isEmpty(delta)) {
                oldData = {};   // picks old data up to _data, this is for app-level binding

                _.forEach(delta, function (v, k) {
                    oldData[k] = self._attrs[k];
                });

                _.merge(this._attrs, delta);

                this._handoff(BTM_EVTS.DevAttrsChanged, { data: delta, _data: oldData });
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

    // No need to emit traffic changes, too noisy
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

/*************************************************************************************************/
/*** Device Drivers                                                                            ***/
/*************************************************************************************************/
Device.prototype.read = function (attrName, callback) {
    validate.argTypes({ attrName: attrName, callback: callback });

    var self = this,
        nc = this.get('netcore'),
        read = nc ? nc._findDriver('dev', 'read') : undefined,
        err = anyEnableError.call(this),
        permAddr = this.get('permAddr');

    if (err)
        return setImmediate(callback, err);
    else if (!_.isFunction(read))
        return setImmediate(callback, new Error('Device driver read is not implemented'));

    read(permAddr, attrName, function (err, data) {
        var result;

        if (!err) {
            result = _.set({}, attrName, data);

            self._handoff(BTM_EVTS.DevRead, { permAddr: permAddr, data: result });
            self.set('attrs', result);
        }

        callback(err, data);
    });
};

Device.prototype.write = function (attrName, val, callback) {
    validate.argTypes({ attrName: attrName, val: val, callback: callback });

    var self = this,
        nc = this.get('netcore'),
        write = nc ? nc._findDriver('dev', 'write') : undefined,
        err = anyEnableError.call(this),
        permAddr = this.get('permAddr');

    if (err)
        return setImmediate(callback, err);
    else if (!_.isFunction(write))
        return setImmediate(callback, new Error('Device driver write is not implemented'));

    write(permAddr, attrName, val, function (err, data) {
        var result;

        if (!err) {
            result = _.set({}, attrName, _.isNil(data) ? val : data); 

            self._handoff(BTM_EVTS.DevWrite, { permAddr: permAddr, data: result });
            self.set('attrs', result);
        }

        callback(err, _.isNil(data) ? val : data);
    });
};

Device.prototype.identify = function (callback) {
    validate.fn(callback);

    var self = this,
        nc = this.get('netcore'),
        identify = nc ? nc._findDriver('dev', 'identify') : undefined,
        err = anyEnableError.call(this),
        permAddr = this.get('permAddr');

    if (err)
        return setImmediate(callback, err);
    else if (!_.isFunction(identify))
        return setImmediate(callback, new Error('Device driver identify is not implemented'));

    identify(permAddr, function (err, data) {
        if (!err) 
            self._handoff(BTM_EVTS.DevIdentify, { permAddr: permAddr });

        callback(err, data);
    });
};

Device.prototype.ping = function (callback) {
    validate.fn(callback);

    var self = this,
        nc = this.get('netcore'),
        ping = nc ? nc.ping : undefined,
        err = anyEnableError.call(this),
        permAddr = this.get('permAddr');

    if (err)
        return setImmediate(callback, err);
    else if (!_.isFunction(ping))
        return setImmediate(callback, new Error('Net driver ping is not implemented'));

    ping.call(nc, permAddr, callback);
};

Device.prototype.maintain = function (callback) {
    var self = this,
        cbCalled = false,
        nc = this.get('netcore'),
        clonedGadTable = this.get('gadTable'),
        numGads = clonedGadTable.length,    // [ { gadId: null, auxId: auxId }, ... ]
        freebird = _.isObject(nc) ? nc._freebird : undefined;

    callback = callback || function (err) {
        if (err)
            self._handoff(EVTS.DevError, { error: err });
    };

    if (!_.isFunction(callback))
        throw new TypeError('callback should be a function if given');

    if (!nc || !freebird)
        return setImmediate(callback, new Error('Cannot maintain. Device is not registered properly'));
    else if (!this.isEnabled() || this.get('status') === 'offline')
        return setImmediate(callback, null);    // offline or disabled, no need to maintain

    this._syncAttrs(function (err) {
        keepGadSyncing();   // don't care error, keep syncing
    });

    function keepGadSyncing() {
        var gad;

        if (cbCalled)
            return;

        if (self.get('status') === 'offline') {
            cbCalled = true;
            return setImmediate(callback, null);    // offline or disabled, no need to continue maintaining
        }

        if (clonedGadTable.length === 0) {
            cbCalled = true;
            return callback(null);
        }

        gad = clonedGadTable.pop();
        gad = freebird.findById(gad.gadId);

        if (!gad) {
            keepGadSyncing();       // gad not found, keep doing next gad syncing
        } else {
            gad.maintain(function (err) {
                keepGadSyncing();   // don't care error, keep syncing
            });
        }
    }
};

Device.prototype._syncAttrs = function (callback) {
    var self = this,
        clonedAttrs = this.get('attrs'),
        attrNames = _.keys(clonedAttrs),
        isModified = false,
        cbCalled = false;

    function keepReading() {
        var attrName;

        if (cbCalled)
            return;

        if (self.get('status') === 'offline') {
            cbCalled = true;
            return setImmediate(callback, null);    // offline or disabled, no need to continue maintaining
        }

        if (attrNames.length === 0) {
            if (isModified)
                self.set('attrs', clonedAttrs);

            cbCalled = true;
            return callback(null);
        }

        attrName = attrNames.pop();

        self.read(attrName, function (err, data) {  // don't care error, keep reading
            if (!err) {
                clonedAttrs[attrName] = data;
                isModified = true;
            }
            keepReading();
        });
    }
};

/*************************************************************************************************/
/*** Device Protected APIs                                                                     ***/
/*************************************************************************************************/
Device.prototype._handoff = function (evt, data) {  // pass event to netcore
    var nc = this.get('netcore'),
        isRegEn = (this.isRegistered() && this.isEnabled() && !this._recovering),
        emittable = isRegEn || (evt === BTM_EVTS.DevError);

    if (!emittable)
        return false;

    return nc._fireup(evt, _.assign({}, data || {}, { permAddr: this.get('permAddr'), id: this.get('id') }));
};  // { ncName: 'xxx', id: 68, ... }, ncName tagged@netcore

Device.prototype._recoverFromRecord = function (rec) {
    var self = this,
        wasEnabled = rec.net.enabled;

    rec.net.status = 'unknown'; // dev status should be 'unknown' at recovering

    // apply recovery, but no raw, no extra
    this._recovering = true;
    this.set('_id', rec.id);
    this.set('net', rec.net);   // enabled will be ignored
    this.set('attrs', rec.attrs);
    this.set('props', rec.props);

    rec.gads.forEach(function (gRec) {
        self._gads.push(gRec);
    });

    // enabled after all 'setXXX()' completes, to avoid changed events
    if (wasEnabled)     // if it was enabled before, enable it after recovery
        this.enable();

    return this;
};

Device.prototype._poke = function () {
    return this.set('net', { timestamp: Math.floor(Date.now()/1000) }); // seconds
};

Device.prototype._accumulateBytes = function (dir, num) {
    validate.string(dir, 'dir should be a string.');
    validate.stringOrNumber(num, 'Number of bytes should be a number or a string.');

    if (dir !== 'in' && dir !== 'out')
        return 0;

    var traffic = this.get('traffic', dir);
    traffic.hits += 1;
    traffic.bytes += num;

    // Will not emit traffic change
    if (dir === 'in')
        this.set('net', { traffic: { in: traffic } });
    else
        this.set('net', { traffic: { out: traffic } });

    return traffic.bytes;
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
