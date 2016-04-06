var _ = require('lodash');
var Device = require('./device');

function Gadget(dev, auxId) {
    if (!(dev instanceof Device)) throw new Error('dev should be an instance of Device class.');
    if (!_.isNumber(auxId) && !_.isString(auxId)) throw new Error('auxId should be a number or a string.');

    this._id = null;
    this._dev = dev;
    // [TODO] attach gad to dev

    this._netcore = dev._netcore;
    // this._enabled = false;

    this.states = {
        _enabled: false,
        profile: '',
        class: '',
        auxId: '',
        name: 'unknown',
        description: ''
    };

    // this.profile = '';
    // this.class = '';
    // this.auxId = auxId;
    this.attrs = {
        // other kvps
    };

    this.extra = null;
}

Gadget.prototype.isRegistered = function () {
    return (!_.isNil(this._id));
};

Gadget.prototype.isEnabled = function () {
    return this._enabled;
};

Gadget.prototype.enable = function () {
    // [TODO] attr changed, net changed?
    this._enabled = true;
    return this;
};

Gadget.prototype.disable = function () {
    // [TODO] attr changed, net changed?
    this._enabled = false;
    return this;
};

Gadget.prototype.getLocation = function () {
    return this._dev.attrs.location;
};

Gadget.prototype.dump = function () {
    return {
        id: this._id,
        permAddr: this._dev.getId(),    // [TODO]
        auxId: this.auxId,
        enabled: this.isEnabled(),
        profile: this.profile,
        class: this.class,
        attrs: _.cloneDeep(this.attrs)
    };
};

/*************************************************************************************************/
/*** Gad Drivers                                                                               ***/
/*************************************************************************************************/
Gadget.prototype.read = function (attrName, callback) {
    var permAddr = this._dev.address.permanent,
        auxId = this.auxId,
        nc = this._netcore;

    return nc.read(permAddr, auxId, attrName, callback);
};

Gadget.prototype.write = function (attrName, val, callback) {
    var permAddr = this._dev.address.permanent,
        auxId = this.auxId,
        nc = this._netcore;

    return nc.write(permAddr, auxId, attrName, val, callback);
};

Gadget.prototype.exec = function (attrName, args, callback) {
    var permAddr = this._dev.address.permanent,
        auxId = this.auxId,
        nc = this._netcore;

    if (_.isFunction(args)) {
        callback = args;
        args = [];
    } else if (!_.isArray(args)) {
        return callback(new Error('args should be an array'));
    }

    return nc.exec(permAddr, auxId, attrName, args, callback);
};

Gadget.prototype.setReportCfg = function (attrName, cfg, callback) {
    var permAddr = this._dev.address.permanent,
        auxId = this.auxId,
        nc = this._netcore;

    return nc.setReportCfg(permAddr, auxId, attrName, cfg, callback);
};

Gadget.prototype.getReportCfg = function (attrName, cfg, callback) {
    var permAddr = this._dev.address.permanent,
        auxId = this.auxId,
        nc = this._netcore;

    return nc.getReportCfg(permAddr, auxId, attrName, callback);
};

// [TODO]
Gadget.prototype.get = function (path) {
    var value = _.get(this.attrs, path);

    // if get address, attrs objects. return a cloned one
    if (value && _.isPlainObjec(value))
        value = _.cloneDeep(value);

    return value;
};

// [TODO]
Gadget.prototype.set = function () {

};

module.exports = Gadget;
