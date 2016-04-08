var _ = require('lodash');
var Device = require('./device');

function Gadget(dev, auxId) {
    if (!(dev instanceof Device)) throw new Error('dev should be an instance of Device class.');
    if (!_.isNumber(auxId) && !_.isString(auxId)) throw new Error('auxId should be a number or a string.');

    this._id = null;
    this._dev = dev;
    this._auxId = auxId;

    dev._linkGadWithAuxId(this._auxId, this);

    this._panel = {
        enabled: false,
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
        this._fbEmit('_gad:panelChanged', {
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

    return loc;
};

Gadget.prototype.getPanelInfo = function (paths) {
    return this._get('_panel', paths);
};

Gadget.prototype.getProps = function (paths) {
    return this._get('_props', paths);
};

Gadget.prototype.getAttrs = function (paths) {
    return this._get('_attrs', paths);
};

Gadget.prototype.setPanelInfo = function (info) {
    var delta = utils.getGadPanelDiff(info, this.getPanelInfo());    // [TODO] utils: find delta

    if (!_.isEmpty(delta)) {
        _.merge(this._panel, delta);

        this._fbEmit('_gad:panelChanged', {
            data: delta
        });
    }
    return this;
};

Gadget.prototype.setProps = function (props) {
    var delta = utils.getGadPropsDiff(props, this.getProps());    // [TODO] utils: find delta

    if (!_.isEmpty(delta)) {
        _.merge(this._props, delta);

        this._fbEmit('_gad:propsChanged', {
            data: delta
        });
    }
    return this;
};

Gadget.prototype.setAttrs = function (attrs) {
   var delta = utils.getDevAttrsDiff(attrs, this.getAttrs());    // [TODO] utils: find delta
    
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
        id: this._id,
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
    var permAddr = this.getPermAddr(),
        auxId = this.getAuxId(),
        nc = this.getNetcore();

    return nc.gadRead(permAddr, auxId, attrName, callback);
};

Gadget.prototype.write = function (attrName, val, callback) {
    var permAddr = this.getPermAddr(),
        auxId = this.getAuxId(),
        nc = this.getNetcore();

    return nc.gadWrite(permAddr, auxId, attrName, val, callback);
};

Gadget.prototype.exec = function (attrName, args, callback) {
    var permAddr = this.getPermAddr(),
        auxId = this.getAuxId(),
        nc = this.getNetcore();

    if (_.isFunction(args)) {
        callback = args;
        args = [];
    } else if (!_.isArray(args)) {
        return callback(new Error('args should be an array'));
    }

    return nc.exec(permAddr, auxId, attrName, args, callback);
};

Gadget.prototype.setReportCfg = function (attrName, cfg, callback) {
    var permAddr = this.getPermAddr(),
        auxId = this.getAuxId(),
        nc = this.getNetcore();

    return nc.setReportCfg(permAddr, auxId, attrName, cfg, callback);
};

Gadget.prototype.getReportCfg = function (attrName, callback) {
    var permAddr = this.getPermAddr(),
        auxId = this.getAuxId(),
        nc = this.getNetcore();

    return nc.getReportCfg(permAddr, auxId, attrName, callback);
};

/*************************************************************************************************/
/*** Gadget Protected APIs                                                                     ***/
/*************************************************************************************************/
Gadget.prototype._fbEmit = function (evt, data) {
    var nc = this.getNetcore(),
        emitted = false,
        emitData;

    if (this.isRegistered() && this.isEnabled()) {
        data = data || {};

        emitData = _.assign(data, {
            permAddr: this.getPermAddr(),
            id: this.getId(),
            auxId: this.getAuxId(),
        });

        nc._fbEmit(evt, data);
        emitted = true;
    }
    return emitted;
};

Gadget.prototype._get = function (type, paths) {
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

module.exports = Gadget;
