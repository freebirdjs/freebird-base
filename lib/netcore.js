var EventEmitter = require('events'),
    util = require('util'),
    _ = require('lodash');

var Device = require('./device'),
    Gadget = require('./gadget'),
    utils = require('./utils');

function Netcore(name, controller, protocol) {
    var __blacklist = [],
        __joinCounter = 0;

    this._joinCountDown = null;

    this._name = name;
    this._protocol = protocol;
    this._controller = controller;

    this._fb = null;
    this._enabled = false;
    this._startTime = 0;
    this._traffic = {
        in: 0,
        out: 0
    };

    /* Developer overrides                                                                   */
    this.cookRawDev = null;         // function(dev, raw, callback) { callback(err, dev); }
    this.cookRawGad = null;         // function(gad, meta, callback) { callback(err, gad); }
    this.unifyRawDevAttrs = null;   // function(attrs) { return attrsObj; }
    this.unifyRawGadAttrs = null;   // function(attrs) { return attrsObj; }
    /* ------------------------------------------------------------------------------------- */

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

    this.getBlacklist = function () {
        return _.cloneDeep(__blacklist);
    };

    this.isBanned = function () {
        return _.includes(__blacklist, permAddr);
    };

    this.addToBlacklist = function (permAddr) {
        if (!_.includes(__blacklist, permAddr))
            __blacklist.push(permAddr);
    };

    this.rmFromBlacklist = function (permAddr) {
        _.remove(__blacklist, function (n) {
            return n === permAddr;
        });
    };

    this.clearBlacklist = function () {
        __blacklist = null;
        __blacklist = [];
    };

    this.setJoinCounter = function (sec) {
        joinCounter = sec;
        return __joinCounter;
    };

    this.getJoinCounter = function (sec) {
        return __joinCounter;
    };
}

Netcore.prototype.devIncoming = function (raw) {
    if (this._checkEngine())
        throw new Error('Netcore is not registered or enabled.'); // engine dead, throw error

    var self = this,
        devNew = new Device(this, raw),
        fb = this._fb,
        devOld,
        delta;

    // developer overrider
    if (!_.isFunction(this.cookRawDevice))
        throw new Error('Method cookRawDevice() should be implemented.');

    this.cookRawDevice(devNew, raw, function (err, dev) {
        if (dev)
            devOld = fb.findDevByAddr(devNew.address.permanent);

        var isBanned = self.isBanned(devNew.address.permanent);

        if (!devOld) {
            // register, get a new id
            // fb.registerDevice(devNew);
            if (!isBanned)
                self.emit('devIncoming', devNew);   // register@fb, attach driver
            else
                self.remove();  // [TODO]
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
    });
};

Netcore.prototype.devLeaving = function (permAddr) {
    var dev = fb.findDevByAddr(permAddr);
    if (dev)
        this.emit('devLeaving', dev);   // unregister@fb, kill instance
};

// Netcore.prototype.registerDevice = function (raw) {
// };

// Netcore.prototype.registerGadget = function (raw) {
// };

Netcore.prototype.gadIncoming = function (permAddr, auxId, meta) {
    if (this._checkEngine())
        return;     // engine dead, do nothing

    var dev = fb.findDevByAddr(permAddr);

    var isBanned = self.isBanned(devNew.address.permanent);

    var gadNew = new Gadget(dev, auxId),
        gadOld;

    this.cookGadget(gadNew, meta, function (err, gad) {
        gadOld = fb.findGadByAddrAuxId(dev.address.permanent, auxId);

        if (!gadOld) {
            // register, get a new id
            // fb.registerGadget(gadNew);
            this.emit('gadIncoming', gadNew);   // register@fb, attach driver
        } else {
            // re-assign
            gadOld._owner = dev;

            // compare devOld and devNew to find diff
            delta = utils.getGadDiff(gadOld, gadNew);

            // then
            gadNew = null;

            this.emit('gadAttrsChanged', gadOld, delta);
        }
    });
};

Netcore.prototype.reportDevAttrs = function (permAddr, attrs) {
    var isBanned = self.isBanned(permAddr);

    var dev = fb.findDevByAddr(permAddr),
        devAttrs = this.cookRawDevAttrsReport(attrs);

    // check if net changed

    // check if dev attrs changed

    // check if status changed

    if (dev)
        this.emit('attrReport', gad, attr);
};

Netcore.prototype.reportGadAttrs = function (permAddr, auxId, attrs) {
    var isBanned = self.isBanned(permAddr);

    var gad = fb.findGadByAddrAuxId(permAddr, auxId);

    // check if attrs changed

    if (gad)
        this.emit('attrReport', gad, attr);
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
    // start, stop, reset, permitJoin, maintain, enable, disable, remove, ban, unban, ping
    var self = this,
        mandatory = [ 'start', 'stop', 'reset', 'permitJoin', 'maintain', 'remove', 'ping' ],
        lackof = [];

    _.forEach(mandatory, function (m) {
        if (!_.isFunction(drvs[m]))
            lackof.push(m);
    });

    if (lackof.length) {
        var lack = '';
        _.forEach(lackof, function (dname) {
            lack = lack + dname + ', ';
        });
        throw new Error('Network driver(s) ' + lack + ' should be implemented.');
    }

    // attach drivers
    _.forEach(drvs, function (fn, key) {
        self.drivers.net[key] = fn;
    });
};

Netcore.prototype.registerDevDrivers = function (drvs) {
    // read, write, identify
};

Netcore.prototype.registerGadDrivers = function (drvs) {
    // read, write, exec, setReportCfg, getReportCfg
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
    var self = this;
    // duration = duration * 1000; // sec to ms

    if (this._joinCountDown)
        clearInterval(this._joinCountDown);

    if (duration) {
        this.setJoinCounter(duration);
        this._joinCountDown = setInterval(function () {
            var secs = self.getJoinCounter() - 1;
            secs = self.setJoinCounter(secs);

            if (secs === 0) {
                // timeout, emit, close for joining
            }
        }, 1000);
    }

    return this._callDriver('net', 'permitJoin', arguments);
};

Netcore.prototype.maintain = function (permAddrs) {

    // maintain single

    // maintain array

    // maintain all

    var isBanned = self.isBanned(permAddr);



    return this._callDriver('net', 'maintain', arguments);
};

Netcore.prototype.reset = function () {
    return this._callDriver('net', 'reset', arguments);
};

Netcore.prototype.enable = function () {

};

Netcore.prototype.disable = function () {

};

Netcore.prototype.remove = function (permAddr, callback) {
    return this._callDriver('net', 'remove', arguments);
};

Netcore.prototype.ban = function (permAddr, callback) {
    this.addToBlacklist(permAddr);


    return this._callDriver('net', 'ban', arguments);
};

Netcore.prototype.unban = function (permAddr, callback) {
    this.rmFromBlacklist(permAddr);
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

