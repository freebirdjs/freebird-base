var _ = require('lodash');
var utils = require('./utils');

function Device(netcore, raw) {
    if (!netcore)
        throw new Error('netcore should be given when new Device()');

    this._netcore = netcore;
    this._raw = raw;

    this._id = null;        // fb storage
    this._enabled = false;
    this._joinTime = null;  // POSIX Time, seconds since 1/1/1970, assigned by netcore at register
    this._timestamp = null; // POSIX Time, seconds, nc should call dev._markActivity() to update it
    this._gads = [];        // when register gad

    this._traffic = {
        in: 0,
        out: 0
    };

    this.role = '';
    this.parent = null;         // permanent address
    this.maySleep = false;      // developer
    this.sleepPeriod = 0;       // developer, seconds
    this.status = 'offline';
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
/*** Device Protected APIs                                                                     ***/
/*************************************************************************************************/
// ok
Device.prototype._incTxBytes = function (num) {     // called in nc.send
    this._traffic.out = this._traffic.out + num;
    return this._traffic.out;
};

// ok
Device.prototype._incRxBytes = function (num) {     // called in nc.send
    this._traffic.in = this._traffic.in + num;
    return this._traffic.in;
};

// ok
Device.prototype._isWorking = function () {         // should work even not registered to freebird
    return (this._netcore && this._enabled);
};

Device.prototype._markActivity = function () {
    this._timestamp = utils.nowSeconds();
    this.status = 'online'; // [TODO] turn online here? how to check status?

    return this;
};

// Device.prototype._online = function () {
//     this.status = 'online';
// };

Device.prototype._statusUp = function () {
    if (this.maySleep) {
        if (this.status === 'online')
            this.status = 'sleep';
        else if (this.status === 'sleep')
            this.status = 'offline';
    } else {
        if (this.status !== 'offline')
            this.status = 'offline';
    }
};

Device.prototype._statusDown = function () {
    if (this.maySleep) {
        if (this.status === 'online')
            this.status = 'sleep';
        else if (this.status === 'sleep')
            this.status = 'offline';
    } else {
        if (this.status !== 'offline')
            this.status = 'offline';
    }
};

/*************************************************************************************************/
/*** Device Public APIs                                                                        ***/
/*************************************************************************************************/
// ok
Device.prototype.resetTxBytes = function () {
    this._traffic.out = 0;
    return this._traffic.out;
};

// ok
Device.prototype.resetRxBytes = function () {
    this._traffic.in = 0;
    return this._traffic.out;
};

// [TODO] how to check id uniquity? gadid is unique and auxid is unique too
// If not unique, how to do? return true/false? or throw?
Device.prototype.linkGad = function (gadId, auxId) {
    var record = _.find(this._gads, { gadId: gadId });

    if (record) {
        if (record.auxId !== auxId)
            return null;            // gadId conflicts
        else
            return record;
    } else {
        record = _.find(this._gads, { auxId: auxId });
    }

    if (record) {
        if (record.gadId !== gadId)
            return null;            // auxId conflicts
        else
            return record;
    } else {
        record = {
            gadId: gadId,
            auxId: auxId
        };
        this._gads.push(record);
        return record;
    }
};

Device.prototype.unlinkGad = function (gadId, auxId) {
    var record = _.find(this._gads, { gadId: gadId, auxId: auxId });

    if (record) {
        _.remove(this._gads, function (g) {
            return ((g.gadId === gadId) && (g.auxId === auxId));
        });
    }

    return record ? record : null;
};

// ok
Device.prototype.isRegistered  = function () {
    return !this._id;
};  // true/false

// ok
Device.prototype.isEnabled  = function () {
    return this._enabled;
};  // true/false

// ok
Device.prototype.enable = function () {
    this._enabled = true;
    return this;
};

// ok
Device.prototype.disable = function () {
    this._enabled = false;
    return this;
};

// getter and setter
Device.prototype.get = function (path) {
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

Device.prototype.set = function (path, val) {
    var keys = path.split('.'),
        rootKey = keys[0],
        value;

    if (_isProtectedKey(rootKey))
        return;

    // [TODO] cannot set attrs directly
    if (_isPublicKey(rootKey))
        _.set(this, path, val);
    else
        _.set(this.attrs, path, val);

    // [TODO] val is a object?
    return val;
};

// protected props getters
// ok
Device.prototype.getNetcore = function () {
    return this._netcore;
};  // Number

// ok
Device.prototype.getRaw = function () {
    return this._raw;
};  // Number

// ok
Device.prototype.getId = function () {
    return this._id;
};  // Number

// ok
Device.prototype.getJoinTime = function () {
    return this._joinTime;
};  // number/undefined

// ok
Device.prototype.getGadRecords = function () {
    return _.cloneDeep(this._gads);
};  // Array

// ok
Device.prototype.dump = function () {
    return {
        netcore: this._netcore ? this._netcore._name : null,
        // no raw
        id: this._id,
        enabled: this._enabled,
        status: this.status,
        joinTime: this._joinTime,
        lastTime: this._lastTime,
        gads: _.cloneDeep(this._gads),
        traffic: _.cloneDeep(this._traffic),
        role: this.role,
        parent: this.parent,
        maySleep: this.maySleep,
        address: _.cloneDeep(this.address),
        attrs: _.cloneDeep(this.attrs)
    };
};  // object

Device.prototype.recover = function (data) {
    // _netcore and _raw 
    // [TODO] this._netcore = // how to find? isWorking check-> cannot be a string
   
    this._id = data.id;
    this._enabled = data.enabled;
    this._joinTime = data._joinTime;
    this._gads = data.gads;

    _.assign(this._traffic, data.traffic);


    this.role = data.role;
    this.parent = data.parent;
    this.maySleep = data.maySleep;
    this.status = 'offline';        // always offline after recovery

    _.assign(this.address, data.address);

    // this.extra = null;

    _.assign(this.attrs, data.attrs);

    return this;
};

/*************************************************************************************************/
/*** Drivers                                                                                   ***/
/*************************************************************************************************/
Device.prototype.read = function (attrName, callback) {
    if (!this._isWorking())
        return callback(new Error('Not working'));

    var self = this;
    var drvRead = this._netcore._getDriver('dev', 'read');

    if (_.isFunction(drvRead))
        drvRead(this, attrName, function (err, result) {
            if (err) {
                callback(err);
            } else {
                if (result !== self[attrName])  // [TODO] in self or in attrs?
                    self._netcore.emit('devAttrsChanged', self, _.set({}, attrName, result));
            }
        });
    else
        callback(); // [TODO] error

    // how to update? => let nc emit changes
};

Device.prototype.write = function (attrName, val, callback) {
    if (!this._isWorking())
        return callback(new Error('Not working'));
    // [TODO] check enable
    // [TODO] check register
    var drvWrite;
    if (this._netcore)
        drvWrite = this._netcore._getDriver('dev', 'write');

    if (_.isFunction(drvWrite))
        drvWrite(this, attrName, val, callback);
    else
        callback(); // [TODO] error

    // how to update? => let nc emit changes
};

Device.prototype.identify = function (callback) {
    if (!this._isWorking())
        return callback(new Error('Not working'));
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
    var self = this,
        drvPing,
        nc;

    if (!this._isWorking())
        return callback(new Error('Not working'));

    nc = this._netcore;
    drvPing = nc._getDriver('net', 'ping');

    if (!_.isFunction(drvPing))
        return callback(new Error('No driver'));

    drvPing(this, function (err, result) {
        if (!err) {
            self._reportNetChangeIfNotMeet('online');
        } else {
            if (self.maySleep)
                self._reportNetChangeIfNotMeet('sleep');
            else
                self._reportNetChangeIfNotMeet('offline');
        }

        callback(err, result);
    });

    // how to update? => let nc emit changes => online, offline
};

Device.prototype._reportNetChangeIfNotMeet = function (status) {
    if (this.status !== status)
        this._netcore.emit('netChanged', { status: status });
};

/*************************************************************************************************/
/*** Private Functions                                                                         ***/
/*************************************************************************************************/
// ok
function _isProtectedKey(key) {
    var protectedProps = [ '_netcore', '_raw', '_id', '_enabled', '_joinTime', '_gads', '_traffic' ];

    return _.includes(protectedProps, key);
}

// ok
function _isPublicKey(key) {
    var publicProps = [ 'role', 'parent', 'maySleep', 'address', 'extra', 'attrs' ];

    return _.includes(publicProps, key);
}

module.exports = Device;
