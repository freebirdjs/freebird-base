var _ = require('lodash');

function Device(netcore, raw) {
    this._netcore = netcore;
    this._raw = raw;

    this._id = null;            // fb storage
    // this._registered = false;   // is registered to fb

    this._enabled = false;
    this._joinTime = 0;         // POSIX Time, seconds since 1/1/1970, assigned by netcore at register
    this._gads = [];            // when register gad
    this._traffic = {
        in: 0,
        out: 0
    };

    this.role = '';
    this.parent = null;
    this.maySleep = false;     // developer

    this.address = {
        permanent: '',
        dynamic: ''
    };

    this.extra = null;

    this.attrs = {
        name: '',
        description: '',
        location: '',
        manufacturer: '',
        model: '',
        serial: '',
        version: {
            hw: '',
            sw: '',
            fmw: ''
        },
        power: {
            type: '',
            voltage: ''
        }
    };
}

/*************************************************************************************************/
/*** Device Public APIs                                                                        ***/
/*************************************************************************************************/
Device.prototype.netcore = function () {
    return this._netcore;
};  // Number

Device.prototype.raw = function () {
    return this._netcore;
};  // Number

Device.prototype.id = function () {
    return this._id;
};  // Number

Device.prototype.isEnabled  = function () {
    return this._enabled;
};  // true/false

Device.prototype.isRegistered  = function () {
    return !_.isNull(this._id);
};  // true/false

Device.prototype.joinTime = function () {
    return !_.isNull(this.info.joinTime) ? this.info.joinTime : undefined;
};  // number/undefined

Device.prototype.gads = function () {
    return _.cloneDeep(this._gads);
};  // Array

Device.prototype.enable = function () {
    this._enabled = true;
    return this;
};

Device.prototype.disable = function () {
    this._enabled = false;
    return this;
};

Device.prototype.set = function (key, val) {
    // [TODO] something can be set or not?
    this.attrs[key] = val;
};

Device.prototype.get = function (key) {
    return this.attrs[key];
};

Device.prototype.txBytes = function (num) {
    this._traffic.out = this._traffic.out + num;
};

Device.prototype.rxBytes = function (num) {
    this._traffic.in = this._traffic.in + num;
};

Device.prototype.dump = function () {
    // [TODO]
    return {
        id: this.getId(),
        data: {
            name: this.getName(),
            maySleep: this.maySleep,
            netcore: this.getNetCore().getName(),
            net: _.cloneDeep(this.net),
            info: _.cloneDeep(this.info),
            gadTable: this.gadgetTable()
        }
    };
};  // object

Device.prototype.read = function (attrName, callback) {
    // [TODO] check enable
    // [TODO] check register
    var drvRead;
    if (this._netcore)
        drvRead = this._netcore._getDriver('dev', 'read');

    if (_.isFunction(drvRead))
        drvRead(this, attrName, callback);
    else
        callback(); // [TODO] error
};

Device.prototype.write = function (attrName, val, callback) {
    // [TODO] check enable
    // [TODO] check register
    var drvWrite;
    if (this._netcore)
        drvWrite = this._netcore._getDriver('dev', 'write');

    if (_.isFunction(drvWrite))
        drvWrite(this, attrName, val, callback);
    else
        callback(); // [TODO] error
};

Device.prototype.identify = function (callback) {
    // [TODO] check enable
    // [TODO] check register
    var drvIdentify;
    if (this._netcore)
        drvIdentify = this._netcore._getDriver('dev', 'identify');

    if (_.isFunction(drvIdentify))
        drvIdentify(this, callback);
    else
        callback(); // [TODO] error
};

Device.prototype.ping = function (callback) {
    // [TODO] check enable
    // [TODO] check register
    var drvPing;
    if (this._netcore)
        drvPing = this._netcore._getDriver('dev', 'ping');

    if (_.isFunction(drvPing))
        drvPing(this, callback);
    else
        callback(); // [TODO] error
};

Device.prototype.addGad = function (gad) {
    // [TODO]
    var gadId = gad.getId(),
        auxId = gad.getAuxId(),
        record = _.find(this._gads, { auxId: auxId });

    if (_.isNull(gadId)) { throw new Error('Gadget is not registered yet.'); }
    if (!_.isUndefined(record)) { throw new Error('You must unlink a existed gadget before you link it to this device.'); }

    this._gadgetTable.push({ gadId: gadId, auxId: auxId });

    return this;
};  // this

module.exports = Device;
