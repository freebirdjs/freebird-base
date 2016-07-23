var _ = require('busyman');

var utils = require('./utils'),
    Device = require('./device'),
    GAD_EVT = require('./constants').EVENTS.GAD;

function Gadget(dev, auxId, rawGad) {
    if (!(dev instanceof Device))
        throw new TypeError('dev should be an instance of Device class.');

    if (!_.isNumber(auxId) && !_.isString(auxId))
        throw new TypeError('auxId should be a number or a string.');

    this._id = null;
    this._dev = dev;
    this._auxId = auxId;
    this._raw = rawGad;     // optional

    dev._linkGadWithAuxId(this._auxId, this);

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
}

Gadget.prototype.enable = function () {
    if (!this.isEnabled()) {
        this._panel.enabled = true;
        this._fbEmit(GAD_EVT.panelChanged, {
            data: { enabled: true }
        });
    }
    return this;
};

Gadget.prototype.disable = function () {
    if (this.isEnabled()) {
        this._panel.enabled = false;
        // if disabled, cannot fire event. use a temp event to bridge
        this._fbEmit(GAD_EVT.panelChangedDisabled, {
            data: { enabled: false }
        });
    }
    return this;
};

Gadget.prototype.isEnabled = function () {
    return this._panel.enabled;
};

Gadget.prototype.isRegistered = function () {
    return (!_.isNil(this._id));
};

/*************************************************************************************************/
/*** Gadget Public APIs: Protected Member Getters                                              ***/
/*************************************************************************************************/
Gadget.prototype.getId = function () {
    return this._id;
};

Gadget.prototype.getDev = function () {
    return this._dev;
};

Gadget.prototype.getRawGad = function () {
    return this._raw;
};

Gadget.prototype.getPermAddr = function () {
    var dev = this.getDev(),
        addr;

    if (dev)
        addr = dev.getPermAddr();

    return addr;
};

Gadget.prototype.getAuxId = function () {
    return this._auxId;
};

Gadget.prototype.getNetcore = function () {
    var dev = this.getDev(),
        nc;

    if (dev)
        nc = dev.getNetcore();

    return nc;
};

Gadget.prototype.getLocation = function () {
    var dev = this.getDev(),
        loc;

    if (dev)
        loc = dev.getProps('location');     // { location: 'xxx' }

    return loc.location;
};

Gadget.prototype.getPanelInfo = function (keys) {
    return this._get('_panel', keys);
};

Gadget.prototype.getProps = function (keys) {
    return this._get('_props', keys);
};

Gadget.prototype.getAttrs = function (keys) {
    return this._get('_attrs', keys);
};

Gadget.prototype.setPanelInfo = function (info) {
    var delta,
        err;

    if (!_.isPlainObject(info)) {
        err = new TypeError('Input info should be an object');
        this._fbEmit(GAD_EVT.error, { error: err });
        throw err;
    }

    delta = utils.getObjectDiff(info, this.getPanelInfo());

    delete delta.enabled;   // 'enabled' cannot be set through setPanelInfo()

    if (!_.isEmpty(delta)) {
        _.merge(this._panel, delta);

        this._fbEmit(GAD_EVT.panelChanged, { data: delta });
    }
    return this;
};

Gadget.prototype.setProps = function (props) {
    var delta,
        err;

    if (!_.isPlainObject(props)) {
        err = new TypeError('Input props should be an object');
        this._fbEmit(GAD_EVT.error, { error: err });
        throw err;
    }

    delta = utils.getObjectDiff(props, this.getProps());

    if (!_.isEmpty(delta)) {
        _.merge(this._props, delta);

        this._fbEmit(GAD_EVT.propsChanged, { data: delta });
    }
    return this;
};

Gadget.prototype.setAttrs = function (attrs) {
    var delta,
        err;

    if (!_.isPlainObject(attrs)) {
        err = new TypeError('Input attrs should be an object');
        this._fbEmit(GAD_EVT.error, { error: err });
        throw err;
    }

    delta = utils.getObjectDiff(attrs, this.getAttrs());

    if (!_.isEmpty(delta)) {
        _.merge(this._attrs, delta);

        this._fbEmit(GAD_EVT.attrsChanged, { data: delta });
    }
    return this;
};

Gadget.prototype.dump = function () {
    return {
        netcore: this.getNetcore().getName(),
        id: this.getId(),
        auxId: this.getAuxId(),
        dev: {
            id: this.getDev().getId(),
            permAddr: this.getPermAddr()
        },
        panel: this.getPanelInfo(),
        props: this.getProps(),
        attrs: this.getAttrs()
    };
};

Gadget.prototype.recoverFromRecord = function (rec) {
    var wasEnabled,
        err;

    if (!_.isPlainObject(rec)) {
        err = new TypeError('Input rec should be an object');
        this._fbEmit(GAD_EVT.error, { error: err });
        throw err;
    }

    wasEnabled = rec.panel.enabled;

    this._recovered = true;
    this._setId(rec.id);
    this.setPanelInfo(rec.panel);   // enabled will be ignored
    this.setAttrs(rec.attrs);
    this.setProps(rec.props);
    // recover, but no raw, not extra

    // enabled after all 'setXXX()' completes, to avoid changed events
    if (wasEnabled)
        this.enable();

    return this;
};

/*************************************************************************************************/
/*** Gad Drivers                                                                               ***/
/*************************************************************************************************/
Gadget.prototype.read = function (attrName, callback) {
    var err;

    if (!_.isString(attrName)) {
        err = new TypeError('attrName should be a string.');
        this._fbEmit(GAD_EVT.error, { error: err });
        throw err;
    }

    return this._callDriver('gadRead', arguments);
};

Gadget.prototype.write = function (attrName, val, callback) {
    var err;

    if (!_.isString(attrName))
        err = new TypeError('attrName should be a string.');
    else if (_.isFunction(val) || _.isUndefined(val))
        err = new TypeError('val should be given.');

    if (err) {
        this._fbEmit(GAD_EVT.error, { error: err });
        throw err;
    }

    return this._callDriver('gadWrite', arguments);
};

Gadget.prototype.exec = function (attrName, args, callback) {
    var err,
        permAddr,
        auxId,
        nc;

    if (!_.isString(attrName)) {
        err = new TypeError('attrName should be a string.');
        this._fbEmit(GAD_EVT.error, { error: err });
        throw err;
    }

    permAddr = this.getPermAddr();
    auxId = this.getAuxId();
    nc = this.getNetcore();

    if (_.isFunction(args)) {
        callback = args;
        args = [];
    } 

    args = args || [];

    if (!_.isFunction(callback)) {
        callback = function (err) {};
    }

    if (!_.isArray(args))
        err = new TypeError('args should be an array');
    else if (!this.isEnabled())
        err = new Error('Gadget not enabled');
    else if (!nc.isEnabled())
        err = new Error('Netcore not enabled.');

    if (err) {
        this._fbEmit(GAD_EVT.error, { error: err });
        callback(err);
    } else {
        return nc.gadExec(permAddr, auxId, attrName, args, callback);
    }
};

Gadget.prototype.getReportCfg = function (attrName, cfg, callback) {
    var err;

    if (!_.isString(attrName)) {
        err = new TypeError('attrName should be a string.');
        this._fbEmit(GAD_EVT.error, { error: err });
        throw err;
    }

    return this._callDriver('getReportCfg', arguments);
};

Gadget.prototype.setReportCfg = function (attrName, cfg, callback) {
    var err;

    if (!_.isString(attrName))
        err = new TypeError('attrName should be a string.');
    else if (!_.isPlainObject(cfg))
        err = new TypeError('cfg should be a plain object.');


    if (err) {
        this._fbEmit(GAD_EVT.error, { error: err });
        throw err;
    } else {
        return this._callDriver('setReportCfg', arguments);
    }
};

Gadget.prototype._callDriver = function (drvName, args) {
    var auxId = this.getAuxId(),
        permAddr = this.getPermAddr(),
        nc = this.getNetcore(),
        driver = nc[drvName],
        err;

    args = Array.prototype.slice.call(args);
    args.unshift(auxId);
    args.unshift(permAddr);

    callback = args[args.length - 1];

    if (!_.isFunction(callback)) {
        callback = function (err) {};
        args.push(callback);
    }

    if (!this.isEnabled())
        err = callback(new Error('Gadget not enabled'));
    else if (!nc.isEnabled())
        err = callback(new Error('Netcore not enabled.'));
    else if (!_.isFunction(driver))
        err = callback(new Error('Driver not found'));

    if (err) {
        this._fbEmit(GAD_EVT.error, { error: err });
        callback(err);
    } else {
        return driver.apply(nc, args);
    }
};

/*************************************************************************************************/
/*** Gadget Protected APIs                                                                     ***/
/*************************************************************************************************/
Gadget.prototype._fbEmit = function (evt, data) {
    var nc = this.getNetcore(),
        emitted = false,
        emitData,
        isErrEvt = (evt === GAD_EVT.error),
        isRegEn = (this.isRegistered() && this.isEnabled() && !this._recovered);

    if (!this.isRegistered() || this._recovered)
        return emitted;

    // 'panelChanged_Disabled' is a bridge event
    if (isErrEvt || isRegEn || evt === GAD_EVT.panelChangedDisabled) {
        data = data || {};

        // if error, give gadget id, not gadget object
        emitData = isErrEvt ? _.assign(data, { gad: this.getId() }) : _.assign(data, { gad: this });

        if (evt === GAD_EVT.panelChangedDisabled)
            evt = GAD_EVT.panelChanged;

        nc._fbEmit(evt, emitData);
        emitted = true;
    }
    return emitted;
};

Gadget.prototype._get = function (type, keys) {
    var target = this[type],
        result,
        isValid = true,
        err;

    if (keys === undefined) {
        result = target;
    } else {
        if (!_.isArray(keys) && !_.isString(keys)) {
            err = new TypeError('keys should be an array of string or a single string.');
        } else if (_.isArray(keys)) {
            keys.forEach(function (k) {
                isValid = isValid && _.isString(k);
            });

            if (!isValid)
                err = new TypeError('keys should be an array of string or a single string.');
        }
    }

    if (err) {
        this._fbEmit(GAD_EVT.error, { error: err });
        throw err;
    }

    if (!target)
        return;
    else if (!result)
        result = _.pick(target, keys);

    return _.cloneDeep(result);
};

Gadget.prototype._setId = function (id) {
    var dev = this.getDev(),
        auxId = this.getAuxId();

    this._id = id;
    dev._setGadIdToAuxId(id, auxId);
};

Gadget.prototype._setDev = function (dev) {
    this._dev = dev;
};

Gadget.prototype._setRawGad = function (raw) {
    this._raw = raw;
};

Gadget.prototype._clear = function () {
    var dev = this.getDev();
    
    if (dev)    // this gad is not an orphan
        dev._unlinkGad(this.getId(), this.getAuxId());

    this._id = null;
    this._dev = null;
    this._raw = null;
    this.extra = null;
};

// This api is for freebird framework wsApis use
Gadget.prototype._dumpGadInfo = function () {
    return this.dump();
};

Gadget.prototype._dangerouslyAppendAttrs = function (attrs) {
    var err;

    if (!_.isPlainObject(attrs)) {
        err = new TypeError('Input attrs should be an object');
        this._fbEmit(GAD_EVT.error, { error: err });
        throw err;
    }

    if (!_.isEmpty(attrs)) {
        _.merge(this._attrs, attrs);

        this._fbEmit(GAD_EVT.attrsAppend, { data: this._attrs });
    }
    return this;
};

module.exports = Gadget;
