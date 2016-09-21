'use strict';

var _ = require('busyman');

var utils = require('./utils'),
    validate = utils.validate,
    Device = require('./device'),
    GAD_EVT = require('./constants').EVENTS.GAD;

function Gadget(dev, auxId, rawGad) {
    validate.device(dev);
    validate.stringOrNumber(auxId, 'auxId should be a number or a string.');

    this._id = null;
    this._auxId = auxId;
    this._dev = dev;
    this._raw = rawGad;     // optional

    this._panel = {
        enabled: false,     // 'enabled' cannot be set through setPanelInfo()
        profile: '',
        classId: '',        // required
    };

    this._props = {
        name: 'unknown',
        description: ''
    };

    this._attrs = {};       // other kvps from remote gadget

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
    this._fire(GAD_EVT.panelChanged, { data: { enabled: true } });
    return this;
};

Gadget.prototype.disable = function () {
    if (!this.isEnabled())
        return this;

    this._panel.enabled = false;
    // if disabled, cannot fire event. use this bridging event
    this._fire(GAD_EVT.panelChangedDisabled, { data: { enabled: false } });
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
        case 'dev':         // getDev
        case 'device':
            result = this._dev;
            break;
        case 'raw':         // getRawGad
        case 'rawGad':      // getRawGad
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
        case 'nc':
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
        case '_id':     // _setId, protected
            validate.stringOrNumber(value, '_id should be a number or a string.');
            this._id = value;     // value = id
            this.get('dev')._connectGadIdToAuxId(value, this.get('auxId'));
            break;
        case '_dev':
            validate.device(value);
            this._dev = value;    // value = dev
            break;
        case '_raw':
            this._raw = value;    // value = raw
            break;
        case 'panel':           // setPanelInfo
            validate.object(value, 'Input info should be an object');
            delta = utils.getObjectDiff(value, this.get('panel'));    // value = info
            delete delta.enabled;   // 'enabled' cannot be set through set('panel')

            if (!_.isEmpty(delta)) {
                _.merge(this._panel, delta);
                this._fire(GAD_EVT.panelChanged, { data: delta });
            }
            break;
        case 'props':           // setProps
            validate.object(value, 'Input props should be an object');
            delta = utils.getObjectDiff(value, this.get('props'));  // value = props

            if (!_.isEmpty(delta)) {
                _.merge(this._props, delta);
                this._fire(GAD_EVT.propsChanged, { data: delta });
            }
            break;
        case 'attrs':           // setAttrs
            validate.object(value, 'Input attrs should be an object');
            delta = utils.getObjectDiff(value, this.get('attrs'));  // value = attrs

            if (!_.isEmpty(delta)) {
                _.merge(this._attrs, delta);
                this._fire(GAD_EVT.attrsChanged, { data: delta });
            }
            break;
        default:
            break;
    }

    return this;
};

Gadget.prototype.dump = function () {
    var nc = this.get('netcore'),
        dev = this.get('dev');

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
    attrName = _.isFunction(attrName) ? undefined : attrName;
    validate.string(attrName, 'attrName should be a string.');
    validate.fn(callback);
    return this._callDriver('gadRead', arguments);
};

Gadget.prototype.write = function (attrName, val, callback) {
    val = _.isFunction(val) ? undefined : val;
    validate.string(attrName, 'attrName should be a string.');
    validate.defined(val, 'val should be given.');
    validate.fn (callback);
    return this._callDriver('gadWrite', arguments);
};

Gadget.prototype.exec = function (attrName, args, callback) {
    args = _.isFunction(args) ? undefined : args;
    validate.string(attrName, 'attrName should be a string.');
    validate.array(args, 'args should be an array.');
    validate.fn (callback);
    return this._callDriver('gadExec', arguments);
};

Gadget.prototype.getReportCfg = function (attrName, callback) {
    validate.string(attrName, 'attrName should be a string.');
    validate.fn (callback);
    return this._callDriver('getReportCfg', arguments);
};

Gadget.prototype.setReportCfg = function (attrName, cfg, callback) {
    cfg = _.isFunction(cfg) ? undefined : cfg;
    validate.string(attrName, 'attrName should be a string.');
    validate.object(cfg, 'cfg should be a plain object.');
    validate.fn (callback);
    return this._callDriver('setReportCfg', arguments);
};

// [TODO] refresh API
/*************************************************************************************************/
/*** Gadget Protected APIs                                                                     ***/
/*************************************************************************************************/
Gadget.prototype._callDriver = function (drvName, args) {
    validate.string(drvName, 'drvName should be a string.');
    var nc = this.get('netcore'),
        driver = nc ? nc[drvName] : undefined,
        callback = args[args.length - 1],
        err = anyEnableError(this);

    if (!_.isFunction(driver))
        err = err || new Error('Driver not found');

    if (err)
        return utils.feedbackNextTick(err, undefined, callback);

    args = _.concat([ this.get('permAddr'), this.get('auxId') ], Array.prototype.slice.call(args));
    return driver.apply(nc, args);
};

Gadget.prototype._fire = function (evt, data) { // try to _fire on  freebird
    validate.string(evt, 'evt should be a string.');
    var nc = this.get('netcore'),
        emitted = false,
        emitData,
        isErrEvt = (evt === GAD_EVT.error),
        isPanelChangedDisabled = (evt === GAD_EVT.panelChangedDisabled),
        isRegEn = (this.isRegistered() && this.isEnabled() && !this._recovered);

    if (!this.isRegistered() || this._recovered)
        return emitted;

    // 'panelChanged_Disabled' is a bridge event
    if (isErrEvt || isRegEn || isPanelChangedDisabled) {
        data = data || {};

        // if error, give gadget id, not gadget object
        emitData = isErrEvt ? _.assign(data, { gad: this.getId() }) : _.assign(data, { gad: this }); // [FIX get]
        evt = isPanelChangedDisabled ? GAD_EVT.panelChanged : evt;

        nc._fire(evt, emitData);
        emitted = true;
    }

    return emitted;
};

Gadget.prototype._clear = function () {
    var dev = this.get('dev');
    
    if (dev)    // this gad is not an orphan
        dev._unlinkGad(this.get('id'), this.get('auxId'));

    this._id = null;
    this._dev = null;
    this._raw = null;
    this.extra = null;
};

// [FIXME] Modify at freebird with dump(). This api is for freebird framework wsApis use
Gadget.prototype._dumpGadInfo = function () {
    return this.dump();
};

Gadget.prototype._dangerouslyAppendAttrs = function (attrs) {
    validate.object(attrs, 'Input attrs should be an object');

    if (!_.isEmpty(attrs)) {
        _.merge(this._attrs, attrs);
        this._fire(GAD_EVT.attrsAppend, { data: this._attrs });
    }
    return this;
};

/*************************************************************************************************/
/*** Private Helpers                                                                           ***/
/*************************************************************************************************/
function anyEnableError(gad) {
    var err;
    if (!gad.isEnabled())
        err = new Error('Gadget disabled');
    else if (!gad.get('dev').isEnabled())
        err = new Error('Device disabled.');
    else if (!gad.get('netcore').isEnabled())
        err = new Error('Netcore disabled.');

    return err;
}

module.exports = Gadget;
