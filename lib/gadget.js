var _ = require('lodash');
var Device = require('./device');

function Gadget(netcore, permAddr, auxId) {
    if (!(dev instanceof Device)) throw new Error('dev should be an instance of Device class.');
    if (!_.isNumber(auxId) && !_.isString(auxId)) throw new Error('auxId should be a number or a string.');

    this._id = null;
    this._dev = null;
    this._netcore = netcore;
    this._enabled = false;
    this._fb = null;

    this.profile = '';
    this.class = '';
    this.permanent = permAddr;  // delete after register@fb
    this.auxId = auxId;
    this.attrs = {
        name: 'unknown',
        description: ''
        // other kvps
    };

    this.extra = null;
}

Gadget.prototype.isRegistered = function () {
    var gadRecord = this._dev.findGad(auxId),
        registered = false;

    if (gadRecord && gadRecord.gadId === this._id)
        registered = true;

    return (this._fb && registered);
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
Gadget.prototype.recover =function (data) {

};

// [TODO]
Gadget.prototype.get = function (path) {
    var keys = path.split('.'),
        rootKey = keys[0],
        value;

    if (!_isProtectedKey(rootKey)) {
        if (_isPublicKey(rootKey))
            value = _.get(this, path);
        else
            value = _.get(this.attrs, path);
    }

    // if get address, attrs objects. return a cloned one
    if (value && _.isPlainObjec(value))
        value = _.cloneDeep(value);

    return value;
};

// [TODO]
Gadget.prototype.set = function () {

};

/*************************************************************************************************/
/*** Private Functions                                                                         ***/
/*************************************************************************************************/
// ok
function _isProtectedKey(key) {
    var protectedProps = [ '_netcore', '_dev', '_id', '_enabled', '_fb' ];

    return _.includes(protectedProps, key);
}

// ok
function _isPublicKey(key) {
    var publicProps = [ 'profile', 'class', 'auxId', 'attrs', 'extra' ];

    return _.includes(publicProps, key);
}

module.exports = Gadget;
