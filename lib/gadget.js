var _ = require('lodash');

var utils = require('./utils'),
    Device = require('./device');

function Gadget(dev, auxId, rawGad) {
    if (!(dev instanceof Device)) throw new Error('dev should be an instance of Device class.');
    if (!_.isNumber(auxId) && !_.isString(auxId)) throw new Error('auxId should be a number or a string.');

    this._id = null;
    this._dev = dev;
    this._auxId = auxId;
    this._raw = rawGad;         // optional

    dev._linkGadWithAuxId(this._auxId, this);

    this._panel = {
        enabled: false,         // 'enabled' cannot be set through setPanelInfo()
        profile: '',
        class: '',
    };

    this._props = {
        name: 'unknown',
        description: ''
    };

    this._attrs = {
        // other kvps
    };

    this.extra = null;
}

Gadget.prototype.enable = function () {
    if (!this.isEnabled()) {
        this._panel.enabled = true;
        this._fbEmit('_gad:panelChanged', {
            data: {
                enabled: true
            }
        });
    }
    return this;
};

Gadget.prototype.disable = function () {
    if (this.isEnabled()) {
        this._panel.enabled = false;
        // if disabled, cannot fire event. use a temp event to bridge
        this._fbEmit('_gad:panelChanged_Disabled', {
            data: {
                enabled: false
            }
        });
    }
    return this;
};

Gadget.prototype.isRegistered = function () {
    return (!_.isNil(this._id));
};

Gadget.prototype.isEnabled = function () {
    return this._panel.enabled;
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
        loc = dev.getProps('location');

    return _.get(loc, 'location');
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
    var delta = utils.getObjectDiff(info, this.getPanelInfo());

    delete delta.enabled;   // 'enabled' cannot be set through setPanelInfo()

    if (!_.isEmpty(delta)) {
        _.merge(this._panel, delta);

        this._fbEmit('_gad:panelChanged', {
            data: delta
        });
    }
    return this;
};

Gadget.prototype.setProps = function (props) {
    var delta = utils.getObjectDiff(props, this.getProps());

    if (!_.isEmpty(delta)) {
        _.merge(this._props, delta);

        this._fbEmit('_gad:propsChanged', {
            data: delta
        });
    }
    return this;
};

Gadget.prototype.setAttrs = function (attrs) {
   var delta = utils.getObjectDiff(attrs, this.getAttrs());
    
    if (!_.isEmpty(delta)) {
        _.merge(this._attrs, delta);

        this._fbEmit('_gad:attrsChanged', {
            data: delta
        });
    }
    return this;
};

Gadget.prototype.dump = function () {
    return {
        id: this.getId(),
        dev: {
            id: this.getDev().getId(),
            permAddr: this.getPermAddr()
        },
        auxId: this.getAuxId(),
        panel: this.getPanelInfo(),
        props: this.getProps(),
        attrs: this.getAttrs()
    };
};

/*************************************************************************************************/
/*** Gad Drivers                                                                               ***/
/*************************************************************************************************/
Gadget.prototype.read = function (attrName, callback) {
    return this._callDriver('gadRead', arguments);
};

Gadget.prototype.write = function (attrName, val, callback) {
    return this._callDriver('gadWrite', arguments);
};

Gadget.prototype.exec = function (attrName, args, callback) {
    var permAddr = this.getPermAddr(),
        auxId = this.getAuxId(),
        nc = this.getNetcore();

    if (_.isFunction(args)) {
        callback = args;
        args = [];
    } 

    // dev._poke@netcore
    if (!_.isArray(args))
        return callback(new Error('args should be an array'));
    else if (!this.isEnabled())
        return callback(new Error('Not enabled'));
    else if (!nc.isEnabled())
        return callback(new Error('Netcore not enabled.'));
    else
        return nc.gadExec(permAddr, auxId, attrName, args, callback);
};

Gadget.prototype.setReportCfg = function (attrName, cfg, callback) {
    return this._callDriver('setReportCfg', arguments);
};

Gadget.prototype.getReportCfg = function (attrName, callback) {
    return this._callDriver('getReportCfg', arguments);
};

Gadget.prototype._callDriver = function (drvName, args) {
    var self = this,
        auxId = this.getAuxId(),
        permAddr = this.getPermAddr(),
        nc = this.getNetcore(),
        driver = nc[drvName];

    args = Array.prototype.slice.call(args);
    args.unshift(auxId);
    args.unshift(permAddr);

    callback = args[args.length - 1];

    if (!_.isFunction(callback)) {
        callback = function (err) {};
        args.push(callback);
    }

    // dev._poke@netcore
    if (!this.isEnabled())
        return callback(new Error('Not enabled'));
    else if (!nc.isEnabled())
        return callback(new Error('Netcore not enabled.'));
    else if (!_.isFunction(driver))
        return callback(new Error('Driver not found'));
    else
        return driver.apply(nc, args);
};

/*************************************************************************************************/
/*** Gadget Protected APIs                                                                     ***/
/*************************************************************************************************/
Gadget.prototype._fbEmit = function (evt, data) {
    var nc = this.getNetcore(),
        emitted = false,
        emitData;

    if (!this.isRegistered())
        return emitted;

    // 'panelChanged_Disabled' is a bridge event
    if (this.isEnabled() || evt === '_gad:panelChanged_Disabled') {
        data = data || {};

        emitData = _.assign(data, { gad: this });

        if (evt === '_gad:panelChanged_Disabled')
            evt = '_gad:panelChanged';

        nc._fbEmit(evt, data);
        emitted = true;
    }
    return emitted;
};

Gadget.prototype._get = function (type, keys) {
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

Gadget.prototype._setId = function (id) {
    this._id = id;
};

Gadget.prototype._setDev = function (dev) {
    this._dev = dev;
};

Gadget.prototype._setRawGad = function (raw) {
    this._raw = raw;
};

Gadget.prototype._clear = function () {
    this._id = null;
    this._dev = null;
    this._raw = null;
};

// [TODO] This api is for freebird framework wsApis use
Gadget.prototype._dumpGadInfo = function () {
    var info = {};
    return info;
};

module.exports = Gadget;
