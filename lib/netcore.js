var EventEmitter = require('events'),
    util = require('util'),
    _ = require('lodash');

var Device = require('./device'),
    utils = require('./utils');

function Netcore(name, protocol, controller) {
    var __blacklist = [],
        __pmjCount = 0;

    this._setPmjCount = function (sec) {
        __pmjCount = sec;
    };

    this._getPmjCount = function (sec) {
        return __pmjCount;
    };

    this._fb = null;
    this._enabled = false;
    // this._registered = false;
    this._startTime = 0;
    this._traffic = {
        in: 0,
        out: 0
    };
    this._controller = controller;
    this._drivers = {
        net: {
            start: null,
            stop: null,
            reset: null,
            permitJoin: null,
            maintain: null,
            enable: null,
            disable: null,
            remove: null,
            ban: null,
            unban: null,
            ping: null
        },
        dev: {
            read: null,
            write: null,
            identify: null,
        },
        gad: {
            read: null,
            write: null,
            exec: null,
            setReportCfg: null,
            getReportCfg: null
        }
    };

    this.name = name;
    this.protocol = protocol;

    /* Developer overrides      */
      this.cookRawDevice = null;
      this.cookRawGadget = null;
    /* ------------------------ */


    this.getBlacklist = function () {
        return _.cloneDeep(__blacklist);
    };

    this.setBlacklist = function (permAddr) {
        // [TODO] check if there
        __blacklist.push();
        // return _.cloneDeep(__blacklist);
    };

    // [TODO] event bridge
}

Netcore.prototype.registerDevice = function (raw) {
    if (this._checkEngine())
        return;     // engine dead, do nothing

    var devNew = new Device(this, raw),
        fb = this._fb,
        devOld,
        delta;

    this.cookRawDevice(raw, devNew);

    devOld = fb.findDevByAddr(devNew.address.permanent);

    if (!devOld) {
        // register, get a new id
        // fb.registerDevice(devNew);
        this.emit('devIncoming', devNew);   // register@fb, attach driver
    } else {
        // re-assign
        devOld._netcore = null;
        devOld._raw = null;
        devOld._netcore = this;
        devOld._raw = raw;

        // compare devOld and devNew to find diff
        delta = utils.getDevDiff(devOld, devNew);

        // then
        devNew = null;

        this.emit('devAttrsChanged', devOld, delta);
    }

    return; // return who?
};

Netcore.prototype.registerGadget = function (dev, auxId, info) {
    if (this._checkEngine())
        return;     // engine dead, do nothing

    var gadNew = new Gadget(dev, auxId),
        gadOld;

    this.cookGadget(gad, rawInfo, info);

    gadOld = fb.findGadByAddrAuxId(dev.address.permanent, auxId);

    if (!gadOld) {
        // register, get a new id
        // fb.registerGadget(gadNew);
        this.emit('gadIncoming', gadNew);   // register@fb, attach driver
    } else {
        // re-assign
        gadOld._netcore = null;
        gadOld._raw = null;
        gadOld._netcore = this;
        gadOld._raw = raw;

        // compare devOld and devNew to find diff
        delta = utils.getGadDiff(gadOld, gadNew);

        // then
        gadNew = null;

        this.emit('gadAttrsChanged', gadOld, delta);
    }

};

Netcore.prototype.dump = function () {
    
};

/***********************************************************************/
/*** Developer Calls                                                 ***/
/***********************************************************************/
Netcore.prototype.txBytesUp = function (num) {
    this._traffic.out += num;
    return this._traffic.out;
};

Netcore.prototype.rxBytesUp = function (num) {
    this._traffic.in += num;
    return this._traffic.in;
};

/***********************************************************************/
/*** Developer Provides                                              ***/
/***********************************************************************/
Netcore.prototype.registerNetDrivers = function (drvs) {
    // check drivers?
    _.forEach(drvs, function () {

    });
};

Netcore.prototype.registerDevDrivers = function (drvs) {
    // check drivers?
    _.forEach(drvs, function () {
        
    });
};

Netcore.prototype.registerGadDrivers = function (drvs) {
    // check drivers?
    _.forEach(drvs, function () {
        
    });
};


/***********************************************************************/
/*** Protected Methods                                               ***/
/***********************************************************************/
Netcore.prototype._callDriver = function (namespace, drvName, args) {
    var callback = args[args.length - 1],
        err = this._checkEngine(),
        driver;

    if (err)
        return callback(err);
    else
        driver = this._findDriver(namespace, drvName);

    if (_.isFunction(driver))
        driver(this, duration, callback);
    else
        callback(new Error('Driver not found'));
};

Netcore.prototype.permitJoin = function (duration, callback) {
    // (1) var duration -> setCountdown
    // (2) call driver -> success -> start count
    //                 -> fails -> reset count
    // (3) 

    return this._callDriver('net', 'permitJoin', arguments);
};

Netcore.prototype.maintain = function () {
    return this._callDriver('net', 'maintain', arguments);
};

Netcore.prototype.reset = function () {
    return this._callDriver('net', 'reset', arguments);
};

Netcore.prototype.enable = function () {

};

Netcore.prototype.disable = function () {

};

Netcore.prototype.remove = function (dev, callback) {
    return this._callDriver('net', 'remove', arguments);
};

Netcore.prototype.ban = function (addr, callback) {
    return this._callDriver('net', 'ban', arguments);
};

Netcore.prototype.unban = function (addr, callback) {
    return this._callDriver('net', 'ban', arguments);
};

Netcore.prototype.start = function () {
    return this._callDriver('net', 'start', arguments);
};

Netcore.prototype._checkEngine = function () {
    var err;
    if (!this._fb)
        err = new Error('Not registered');
    else if (!this._enabled)
        err = new Error('Not enabled');

    return err;
};


