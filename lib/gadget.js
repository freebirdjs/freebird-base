'use strict';

var _ = require('busyman');

var utils = require('./utils.js'),
    validate = utils.validate,
    Device = require('./device.js'),
    EVTS = require('freebird-constants').EVENTS_FROM_BOTTOM;

var baseProp = { writable: true, enumerable: false, configurable: false };

function Gadget(dev, auxId, rawGad) {
    if (!(this instanceof Gadget))
        return new Gadget(dev, auxId, rawGad);

    validate.device(dev);
    validate.stringOrNumber(auxId, 'auxId should be a number or a string.');

    Object.defineProperty(this, '_recovering', _.assign({ value: false }, baseProp));   // helper, tag if it is reload from database
    Object.defineProperty(this, '_id', _.assign({ value: null }, baseProp));
    Object.defineProperty(this, '_auxId', _.assign({ value: auxId }, baseProp));
    Object.defineProperty(this, '_dev', _.assign({ value: dev }, baseProp));
    Object.defineProperty(this, '_raw', _.assign({ value: rawGad }, baseProp));         // optional

    Object.defineProperty(this, '_panel', _.assign({
        value: {
            enabled: false, // 'enabled' cannot be set through setPanelInfo()
            classId: '',    // required
            profile: ''
        }
    }, baseProp, { writable: false }));

    Object.defineProperty(this, '_props', _.assign({
        value: {
            name: 'unknown',
            description: ''
        }
    }, baseProp, { writable: false }));

    Object.defineProperty(this, '_attrs', _.assign({ value: {} }, baseProp, { writable: false }));  // other kvps from remote gadget

    this.extra = null;      // developer sets at will

    dev._linkGad(this._auxId, this);
}

/*************************************************************************************************/
/*** Gadget Public APIs                                                                        ***/
/*************************************************************************************************/
Gadget.prototype.isEnabled = function () {
    return this._panel.enabled;
};

Gadget.prototype.isRegistered = function () {
    return !_.isNil(this._id);
};

Gadget.prototype.enable = function () {
    if (!this.isEnabled()) {
        this._panel.enabled = true;
        this._handoff(EVTS.GadPanelChanged, { data: { enabled: true } });
    }
    return this;
};

Gadget.prototype.disable = function () {
    if (this.isEnabled()) {
        this._panel.enabled = false;
        // if disabled, cannot fire event. use this bridging event
        this._handoff(EVTS.GadPanelChangedDisabled, { data: { enabled: false } });
    }
    return this;
};

/*************************************************************************************************/
/*** Gadget Public APIs: Protected Member Getters                                              ***/
/*************************************************************************************************/
Gadget.prototype.get = function (name, arg) {
    var result;
    validate.string(name, 'name should be a string.');

    switch (name) {
        case 'id':
            result = this._id;
            break;
        case 'device':
            result = this._dev;
            break;
        case 'raw':
            result = this._raw;
            break;
        case 'permAddr':
            result = this._dev ? this._dev.get('permAddr') : undefined;
            break;
        case 'dynAddr':
            result = this._dev ? this._dev.get('dynAddr') : undefined;
            break;
        case 'auxId':
            result = this._auxId;
            break;
        case 'netcore':
            result = this._dev ? this._dev.get('netcore') : undefined;
            break;
        case 'location':
            var loc = this._dev ? this._dev.get('props', 'location') : undefined;   // { location: 'xxx' }
            result = _.isObject(loc) ? loc.location : undefined;
            break;
        case 'panel':
            result = utils.getFrom(this, '_panel', arg);
            break;
        case 'props':
            result = utils.getFrom(this, '_props', arg);
            break;
        case 'attrs':
            result = utils.getFrom(this, '_attrs', arg);
            break;
        default:
            break;
    }
    return result;
};

Gadget.prototype.set = function (name, value) {
    var self = this,
        oldData, delta;
    validate.string(name, 'name should be a string.');

    switch (name) {
        case '_id':
            validate.stringOrNumber(value, '_id should be a number or a string.');
            this._id = value;       // value = id
            this.get('device')._connectGadIdToAuxId(this._id, this.get('auxId'));
            break;
        case '_dev':
            validate.device(value);
            this._dev = value;      // value = dev
            break;
        case '_raw':
            this._raw = value;      // value = raw
            break;
        case 'panel':               // setPanelInfo
            validate.object(value, 'Input info should be an object');
            delta = utils.getObjectDiff(value, this.get('panel'));  // value = info
            delete delta.enabled;   // 'enabled' cannot be set through set('panel')

            if (!_.isEmpty(delta)) {
                // picks old data up to _data
                oldData = {};
                _.forEach(delta, function (v, k) {
                    oldData[k] = self._panel[k];
                });
                _.merge(this._panel, delta);
                this._handoff(EVTS.GadPanelChanged, { data: delta, _data: oldData });
            }
            break;
        case 'props':               // setProps
            validate.object(value, 'Input props should be an object');
            delta = utils.getObjectDiff(value, this.get('props'));  // value = props

            if (!_.isEmpty(delta)) {
                // picks old data up to _data
                oldData = {};
                _.forEach(delta, function (v, k) {
                    oldData[k] = self._props[k];
                });
                _.merge(this._props, delta);
                this._handoff(EVTS.GadPropsChanged, { data: delta, _data: oldData });
            }
            break;
        case 'attrs':               // setAttrs
            validate.object(value, 'Input attrs should be an object');
            delta = utils.getObjectDiff(value, this.get('attrs'));  // value = attrs

            if (!_.isEmpty(delta)) {
                // picks old data up to _data
                oldData = {};
                _.forEach(delta, function (v, k) {
                    oldData[k] = self._attrs[k];
                });
                _.merge(this._attrs, delta);
                this._handoff(EVTS.GadAttrsChanged, { data: delta, _data: oldData });
            }
            break;
        default:
            break;
    }

    return this;
};

Gadget.prototype.dump = function () {
    var nc = this.get('netcore'),
        dev = this.get('device');

    return {
        netcore: nc ? nc.getName() : 'unknown',
        id: this.get('id'),
        auxId: this.get('auxId'),
        dev: {
            id: dev ? dev.get('id') : null,
            permAddr: dev ? dev.get('permAddr') : ''
        },
        panel: this.get('panel'),
        props: this.get('props'),
        attrs: this.get('attrs')
    };
};

/*************************************************************************************************/
/*** Gad Drivers                                                                               ***/
/*************************************************************************************************/
Gadget.prototype.read = function (attrName, callback) {
    validate.argTypes({ attrName: attrName, callback: callback });

    var self = this,
        nc = this.get('netcore'),
        read = nc ? nc._findDriver('gad', 'read') : undefined,
        err = anyEnableError.call(this),
        permAddr = this.get('permAddr'),
        auxId = this.get('auxId');

    if (err)
        return setImmediate(callback, err);
    else if (!_.isFunction(read))
        return setImmediate(callback, 'Gadget driver read is not implemented');

    read(permAddr, auxId, attrName, function (err, data) {
        var result;

        if (!err) {
            result = _.set({}, attrName, data);

            self.set('attrs', result);
            self._handoff(EVTS.GadRead, { permAddr: permAddr, auxId: auxId, data: result });
        }

        callback(err, data);
    });
};

Gadget.prototype.write = function (attrName, val, callback) {
    validate.argTypes({ attrName: attrName, val: val, callback: callback });

    var self = this,
        nc = this.get('netcore'),
        write = nc ? nc._findDriver('gad', 'write') : undefined,
        err = anyEnableError.call(this),
        permAddr = this.get('permAddr'),
        auxId = this.get('auxId');

    if (err)
        return setImmediate(callback, err);
    else if (!_.isFunction(write))
        return setImmediate(callback, 'Gadget driver write is not implemented');

    write(permAddr, auxId, attrName, val, function (err, data) {
        var result;

        if (!err) {
            result =  _.set({}, attrName, _.isNil(data) ? val : data); 
            self.set('attrs', result);
            self._handoff(EVTS.GadWrite, { permAddr: permAddr, auxId: auxId, data: result });
        }

        callback(err, _.isNil(data) ? val : data);
    });
};

Gadget.prototype.exec = function (attrName, args, callback) {
    if (_.isFunction(args)) {
        callback = args;
        args = undefined;
    }

    validate.argTypes({ attrName: attrName, callback: callback });
    validate.array(args, 'args should be an array.');

    var self = this,
        nc = this.get('netcore'),
        exec = nc ? nc._findDriver('gad', 'exec') : undefined,
        err = anyEnableError.call(this),
        permAddr = this.get('permAddr'),
        auxId = this.get('auxId');

    if (err)
        return setImmediate(callback, err);
    else if (!_.isFunction(exec))
        return setImmediate(callback, 'Gadget driver exec is not implemented');

    exec(permAddr, auxId, attrName, args, function (err, data) {
        var result;

        if (!err) {
            result =  _.set({}, attrName, data); 
            self._handoff(EVTS.GadExec, { permAddr: permAddr, auxId: auxId, data: result });
        }

        callback(err, data);
    });
};

Gadget.prototype.readReportCfg = function (attrName, callback) {
    validate.argTypes({ attrName: attrName, callback: callback });

    var self = this,
        nc = this.get('netcore'),
        readReportCfg = nc ? nc._findDriver('gad', 'readReportCfg') : undefined,
        err = anyEnableError.call(this),
        permAddr = this.get('permAddr'),
        auxId = this.get('auxId');

    if (err)
        return setImmediate(callback, err);
    else if (!_.isFunction(readReportCfg))
        return setImmediate(callback, 'Gadget driver readReportCfg is not implemented');

    readReportCfg(permAddr, auxId, attrName, function (err, data) {
        var result;

        if (!err) {
            result = _.set({}, attrName, data);
            self._handoff(EVTS.GadReadReportCfg, { permAddr: permAddr, auxId: auxId, data: result });
        }

        callback(err, data);
    });
};

Gadget.prototype.writeReportCfg = function (attrName, cfg, callback) {
    validate.argTypes({ attrName: attrName, cfg: cfg, callback: callback });

    if (_.isFunction(cfg)) {
        callback = cfg;
        cfg = undefined;
    }


    var self = this,
        nc = this.get('netcore'),
        writeReportCfg = nc ? nc._findDriver('gad', 'writeReportCfg') : undefined,
        err = anyEnableError.call(this),
        permAddr = this.get('permAddr'),
        auxId = this.get('auxId');

    if (err)
        return setImmediate(callback, err);
    else if (!_.isFunction(writeReportCfg))
        return setImmediate(callback, 'Gadget driver writeReportCfg is not implemented');

    writeReportCfg(permAddr, auxId, attrName, cfg, function (err, data) {
        var result;

        if (!err) {
            result =  _.set({}, attrName, data); 
            self._handoff(EVTS.GadWriteReportCfg, { permAddr: permAddr, auxId: auxId, data: result });
        }

        callback(err, data);
    });
};

Gadget.prototype.maintain = function (callback) {
    var self = this,
        dev = this.get('device'),
        nc = this.get('netcore');

    callback = callback || function (err) {
        if (err)
            self._handoff(EVTS.GadError, { error: err });
    };

    if (!_.isFunction(callback))
        throw new TypeError('callback should be a function if given');

    if (!nc || !dev)
        return setImmediate(callback, new Error('Cannot maintain. Gadget is not registered properly'));
    else if (!this.isEnabled() || dev.get('status') === 'offline')
        return setImmediate(callback, null); // offline or disabled, no need to maintain

    var clonedAttrs = this.get('attrs'),
        attrNames = _.keys(clonedAttrs),
        isModified = false,
        cbCalled = false;

    function keepReading() {
        var attrName;

        if (cbCalled)
            return;

        if (dev.get('status') === 'offline') {
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
/*** Gadget Protected APIs                                                                     ***/
/*************************************************************************************************/
Gadget.prototype._recoverFromRecord = function (rec) {
    // recovering, but no raw, no extra
    this._recovering = true;
    this.set('_id', rec.id);
    this.set('panel', rec.panel);   // enabled will be ignored
    this.set('attrs', rec.attrs);
    this.set('props', rec.props);

    // it was enabled before. Enable after all 'setXXX()' completes, to avoid changed events
    if (rec.panel.enabled)
        this.enable();

    return this;
};

Gadget.prototype._handoff = function (evt, data) {
    // validate.string(evt, 'evt should be a string.');
    var nc = this.get('netcore'),
        emitData = {},
        isErrEvt = (evt === EVTS.GadError),
        isPanelChangedDisabled = (evt === EVTS.GadPanelChangedDisabled),    // 'panelChanged_Disabled' is a bridge event
        isRegEn = (this.isRegistered() && this.isEnabled() && !this._recovering),
        emittable = isErrEvt || isRegEn || isPanelChangedDisabled;

    if (!this.isRegistered() || this._recovering)
        return false;

    if (!emittable)
        return false;

    data = data || {};
    _.assign(emitData, data, { permAddr: this.get('permAddr'), auxId: this.get('auxId'), id: this.get('id') });
    evt = isPanelChangedDisabled ? EVTS.GadPanelChanged : evt;

    return nc._fireup(evt, emitData);
};  // { ncName: 'xxx', id: 68, ... }, ncName tagged@netcore

Gadget.prototype._clear = function () {
    var dev = this.get('device');
    
    if (dev)    // this gad is not an orphan
        dev._unlinkGad(this.get('id'), this.get('auxId'));

    this._id = null;
    this._dev = null;
    this._raw = null;
    this.extra = null;
};

Gadget.prototype._dangerouslyAppendAttrs = function (attrs) {
    validate.object(attrs, 'Input attrs should be an object');

    if (!_.isEmpty(attrs)) {
        _.merge(this._attrs, attrs);
        this._handoff(EVTS.GadAttrsAppend, { data: this._attrs });
    }
    return this;
};

/*************************************************************************************************/
/*** Private Helpers                                                                           ***/
/*************************************************************************************************/
function anyEnableError() {
    var err;
    if (!this.isEnabled())
        err = new Error('Gadget disabled');
    else if (!this.get('device').isEnabled())
        err = new Error('Device disabled.');
    else if (!this.get('netcore').isEnabled())
        err = new Error('Netcore disabled.');

    return err;
}

module.exports = Gadget;
