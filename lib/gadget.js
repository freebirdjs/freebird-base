var _ = require('lodash');
var Device = require('./device');

function Gadget(dev, auxId) {
    if (!(dev instanceof Device)) throw new Error('dev should be an instance of Device class.');
    if (!_.isNumber(auxId) && !_.isString(auxId)) throw new Error('auxId should be a number or a string.');

    this._id = null;
    this._dev = dev;
    this._enabled = false;
    this._fb = null;

    this.profile = '';
    this.class = '';
    this.auxId = auxId;
    this.attrs = {
        name: 'unknown',
        description: ''
        // other kvps
    };
}

Gadget.prototype.isRegistered = function () {
    return (this._fb && this._dev.findGad(auxId));
};

Gadget.prototype.isEnabled = function () {
    return this._enabled;
};

Gadget.prototype.enable = function () {
    this._enabled = true;
    return this;
};

Gadget.prototype.disable = function () {
    this._enabled = false;
    return this;
};

Gadget.prototype.getLocation = function () {
    return this._dev.attrs.location;
};

Gadget.prototype.dump = function () {
    return {
        id: this._id,
        dev: this._dev.getId(),
        enabled: this.isEnabled(),
        profile: this.profile,
        class: this.class,
        attrs: _.cloneDeep(this.attrs)
    };
};

Gadget.prototype.read = function (attrName, callback) {
    var permAddr = this._dev.address.permanent,
        auxId = this.auxId,
        nc = this._dev._netcore;

    return nc.read(permAddr, auxId, attrName, callback);
};

Gadget.prototype.write = function (attrName, val, callback) {
    var permAddr = this._dev.address.permanent,
        auxId = this.auxId,
        nc = this._dev._netcore;

    return nc.write(permAddr, auxId, attrName, val, callback);
};

Gadget.prototype.exec = function (attrName, args, callback) {
    var permAddr = this._dev.address.permanent,
        auxId = this.auxId,
        nc = this._dev._netcore;

    return nc.exec(permAddr, auxId, attrName, args, callback);
};

Gadget.prototype.setReportCfg = function (attrName, cfg, callback) {
    var permAddr = this._dev.address.permanent,
        auxId = this.auxId,
        nc = this._dev._netcore;

    return nc.setReportCfg(permAddr, auxId, attrName, cfg, callback);
};

Gadget.prototype.getReportCfg = function (attrName, cfg, callback) {
    var permAddr = this._dev.address.permanent,
        auxId = this.auxId,
        nc = this._dev._netcore;

    return nc.getReportCfg(permAddr, auxId, attrName, callback);
};

Gadget.prototype.get = function () {

};

Gadget.prototype.set = function () {

};

module.exports = Gadget;
