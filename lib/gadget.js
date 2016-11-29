'use strict';

var _ = require('busyman');

var utils = require('./utils.js'),
    validate = utils.validate,
    Device = require('./device.js'),
    EVTS = require('freebird-constants').EVENTS_FROM_BOTTOM;

function Gadget(dev, auxId, rawGad) {
    validate.device(dev);
    validate.stringOrNumber(auxId, 'auxId should be a number or a string.');

    var writableProp = { writable: true, enumerable: false, configurable: false },
        unwritableProp = { writable: false, enumerable: false, configurable: false };

    Object.defineProperty(this, '_id', _.assign({ value: null }, writableProp));
    Object.defineProperty(this, '_auxId', _.assign({ value: auxId }, writableProp));
    Object.defineProperty(this, '_dev', _.assign({ value: dev }, writableProp));
    Object.defineProperty(this, '_raw', _.assign({ value: rawGad }, writableProp));         // optional
    Object.defineProperty(this, '_recovered', _.assign({ value: false }, writableProp));    // device reloading helper, tag if it is reload from database

    Object.defineProperty(this, '_panel', _.assign({
        value: {
            enabled: false,     // 'enabled' cannot be set through setPanelInfo()
            profile: '',
            classId: '',        // required
        }
    }, unwritableProp));

    Object.defineProperty(this, '_props', _.assign({
        value: {
            name: 'unknown',
            description: ''
        }
    }, unwritableProp));

    Object.defineProperty(this, '_attrs', _.assign({ value: {} }, unwritableProp));         // other kvps from remote gadget

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
    if (this.isEnabled())
        return this;

    this._panel.enabled = true;
    this._fire(EVTS.GadPanelChanged, { data: { enabled: true } });
    return this;
};

Gadget.prototype.disable = function () {
    if (!this.isEnabled())
        return this;

    this._panel.enabled = false;
    // if disabled, cannot fire event. use this bridging event
    this._fire(EVTS.GadPanelChangedDisabled, { data: { enabled: false } });
    return this;
};

/*************************************************************************************************/
/*** Gadget Public APIs: Protected Member Getters                                              ***/
/*************************************************************************************************/
Gadget.prototype.get = function (name, arg) {
    var result;
    validate.string(name, 'name should be a string.');

    switch (name) {
        case 'id':          // getId
            result = this._id;
            break;
        case 'device':
            result = this._dev;
            break;
        case 'raw':         // getRawGad
            result = this._raw;
            break;
        case 'permAddr':    // getPermAddr
            result = this._dev ? this._dev.get('permAddr') : undefined;
            break;
        case 'dynAddr':
            result = this._dev ? this._dev.get('dynAddr') : undefined;
            break;
        case 'auxId':       // getAuxId
            result = this._auxId;
            break;
        case 'netcore':     // getNetcore
            result = this._dev ? this._dev.get('netcore') : undefined;
            break;
        case 'location':    // getLocation
            var loc = this._dev ? this._dev.get('props', 'location') : undefined;   // { location: 'xxx' }
            result = _.isObject(loc) ? loc.location : undefined;
            break;
        case 'panel':       // getPanelInfo
            result = utils.getFrom(this, '_panel', arg);
            break;
        case 'props':       // getProps
            result = utils.getFrom(this, '_props', arg);
            break;
        case 'attrs':       // getAttrs
            result = utils.getFrom(this, '_attrs', arg);
            break;
        default:
            break;
    }
    return result;
};

Gadget.prototype.set = function (name, value) {
    var delta;
    validate.string(name, 'name should be a string.');

    switch (name) {
        case '_id':                 // _setId, protected
            validate.stringOrNumber(value, '_id should be a number or a string.');
            this._id = value;       // value = id
            this.get('device')._connectGadIdToAuxId(value, this.get('auxId'));
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
                _.merge(this._panel, delta);
                this._fire(EVTS.GadPanelChanged, { data: delta });
            }
            break;
        case 'props':               // setProps
            validate.object(value, 'Input props should be an object');
            delta = utils.getObjectDiff(value, this.get('props'));  // value = props

            if (!_.isEmpty(delta)) {
                _.merge(this._props, delta);
                this._fire(EVTS.GadPropsChanged, { data: delta });
            }
            break;
        case 'attrs':               // setAttrs
            validate.object(value, 'Input attrs should be an object');
            delta = utils.getObjectDiff(value, this.get('attrs'));  // value = attrs

            if (!_.isEmpty(delta)) {
                _.merge(this._attrs, delta);
                this._fire(EVTS.GadAttrsChanged, { data: delta });
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

Gadget.prototype.recoverFromRecord = function (rec) {
    validate.object(rec, 'Input rec should be an object');
    // recovering, but no raw, not extra
    this._recovered = true;
    this.set('_id', rec.id);
    this.set('panel', rec.panel);   // enabled will be ignored
    this.set('attrs', rec.attrs);
    this.set('props', rec.props);

    // it was enabled. Enable after all 'setXXX()' completes, to avoid changed events
    if (rec.panel.enabled)
        this.enable();
    return this;
};

/*************************************************************************************************/
/*** Gad Drivers                                                                               ***/
/*************************************************************************************************/
Gadget.prototype.read = function (attrName, callback) {
    validate.argTypes({ attrName: attrName, callback: callback });

    var self = this,
        readCb = function (err, data) {
            if (!err)
                self.set('attrs', _.set({}, attrName, data));
            callback(err, data);
        };

    return this._callDriver('gadRead', [ attrName, readCb ]);
};

Gadget.prototype.write = function (attrName, val, callback) {
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

    return this._callDriver('gadWrite', [ attrName, writeCb ]);
};

Gadget.prototype.exec = function (attrName, args, callback) {
    validate.string(attrName, 'attrName should be a string.');
    validate.array(args, 'args should be an array.');
    validate.fn(callback);
    return this._callDriver('gadExec', arguments);
};

Gadget.prototype.getReportCfg = function (attrName, callback) {
    validate.argTypes({ attrName: attrName, callback: callback });
    return this._callDriver('getReportCfg', arguments);
};

Gadget.prototype.setReportCfg = function (attrName, cfg, callback) {
    validate.argTypes({ attrName: attrName, cfg: cfg, callback: callback });
    return this._callDriver('setReportCfg', arguments);
};

Gadget.prototype.maintain = function (callback) {
    var self = this,
        dev = this.get('device');
        nc = this.get('netcore');

    callback = callback || function (err, maintained) {
        if (err)
            self._fire(EVTS.GadError, { error: err });
    };

    if (!nc || !dev)
        return setImmediate(callback, new Error('Cannot maintain. Gadget is not registered properly'));
    else if (!_.isFunction(callback))
        return setImmediate(callback, new TypeError('callback should be a function if given'));
    else if (!this.isEnabled() || dev.get('status') === 'offline')
        return setImmediate(callback, null, false); // offline or disabled, no need to maintain

    var clonedAttrs = this.get('attrs'),
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
                callback(err);
            } else {
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
Gadget.prototype._callDriver = function (drvName, args) {
    validate.string(drvName, 'drvName should be a string.');
    var nc = this.get('netcore'),
        driver = nc ? nc[drvName] : undefined,
        callback = args[args.length - 1],
        err = anyEnableError.call(this);

    if (!_.isFunction(driver))
        err = err || new Error('Driver not found');

    if (err)
        return setImmediate(callback, err);

    args = _.concat([ this.get('permAddr'), this.get('auxId') ], Array.prototype.slice.call(args));
    return driver.apply(nc, args);
};

Gadget.prototype._fire = function (evt, data) { // try to _fire on  freebird
    validate.string(evt, 'evt should be a string.');
    var nc = this.get('netcore'),
        emitted = false,
        emitData,
        isErrEvt = (evt === EVTS.GadError),
        isPanelChangedDisabled = (evt === EVTS.GadPanelChangedDisabled),
        isRegEn = (this.isRegistered() && this.isEnabled() && !this._recovered);

    if (!this.isRegistered() || this._recovered)
        return emitted;

    // 'panelChanged_Disabled' is a bridge event
    if (isErrEvt || isRegEn || isPanelChangedDisabled) {
        data = data || {};

        // if error, give gadget id, not gadget object
        emitData = isErrEvt ? _.assign(data, { gad: this.get('id') }) : _.assign(data, { gad: this });
        evt = isPanelChangedDisabled ? EVTS.GadPanelChanged : evt;

        emitted = nc._fire(evt, emitData);
    }

    return emitted;
};

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
        this._fire(EVTS.GadAttrsAppend, { data: this._attrs });
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
