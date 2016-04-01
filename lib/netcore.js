var EventEmitter = require('events'),
    util = require('util'),
    _ = require('lodash');

var Device = require('./device'),
    Gadget = require('./gadget'),
    utils = require('./utils');

// ping regularly to check:
//  online -> sleep
//  sleep -> offline
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
            start: null,        // function(callback) {}
            stop: null,         // function(callback) {}
            reset: null,        // function(callback) {}
            permitJoin: null,   // function(duration, callback) {}
            maintain: null,     // function([permAddr][, callback]) {}
            // enable: null,
            // disable: null,
            remove: null,       // function(permAddr, callback) {}
            ban: null,          // function(permAddr, callback) {}
            unban: null,        // function(permAddr, callback) {}
            ping: null          // function(permAddr, callback) {}
        },
        dev: {
            read: null,         // function(permAddr, attr, callback) {}
            write: null,        // function(permAddr, attr, val, callback) {}
            identify: null,     // function(permAddr, callback) {}
        },
        gad: {
            read: null,         // function(permAddr, auxId, attr, callback) {}
            write: null,        // function(permAddr, auxId, attr, val, callback) {}
            exec: null,         // function(permAddr, auxId, attr, args, callback) {}
            setReportCfg: null, // function(permAddr, auxId, cfg, callback) {}
            getReportCfg: null  // function(permAddr, auxId, callback) {}
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


    this.findDevByAddr = function (permAdd) {
        // default, use fb method
        // someone can override this method to get his dev stored somewhere
    };


    this.findGadByAddrAuxId = function (permAdd, auxId) {
        // default, use fb method
        // someone can override this method to get his dev stored somewhere
    };

    this.allDevices = function () {
        // default, use fb method
        // someone can override this method to get his dev stored somewhere
    };

    this.allGadgets = function () {
        // default, use fb method
        // someone can override this method to get his dev stored somewhere
    };
}

// Netcore.prototype._startLiveChecker = function (interval) {
//     this._liveChecker
// };

Netcore.prototype.devIncoming = function (raw) {
    // [TODO] dev._active()
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
    // [TODO] dev._active()
    var dev = fb.findDevByAddr(permAddr);
    if (dev)
        this.emit('devLeaving', dev);   // unregister@fb, kill instance
};

// Netcore.prototype.registerDevice = function (raw) {
// };

// Netcore.prototype.registerGadget = function (raw) {
// };

Netcore.prototype.gadIncoming = function (permAddr, auxId, meta) {
    // [TODO] dev._active()

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
    // [TODO] dev._active()
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
    // [TODO] dev._active()
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

/***********************************************************************/
/*** Drivers                                                         ***/
/***********************************************************************/
Netcore.prototype.isRegistered = function () {
    return !!this._fb;
};

Netcore.prototype.start = function (callback) {
    var self = this,
        drvStart = this._findDriver('net', start);

    if (!this.isRegistered())
        return callback(new Error('Not registered'));

    if (this._enabled)
        return callback(null, true);

    if (!this._areDriversReady())
        return callback(new Error('Drivers not ready'));

    // [TODO] re-attach listeners if any

    // enable
    if (drvStart) {
        drvStart(function (err, result) {
            if (err) {
                callback(err);
            } else {
                callback(null, result);
                self.enable();
                self.emit('_ready');
            }
        });
    } else {    // start driver is required, should throw error if not given
        callback(new Error('Driver start() not implemented'));
    }

    return this;
};

Netcore.prototype.stop = function (callback) {
    var self = this,
        drvStop = this._findDriver('net', stop);

    if (!this._enabled)
        return callback(null, true);

    // [TODO] remove listeners if any

    if (drvStop)
        drvStop(function (err, result) {
            if (err) {
                callback(err);
            } else {
                callback(null, result);
                self.disable();
            }
        });
    else
        this.disable();

    return this;
};

Netcore.prototype.reset = function (mode, callback) {
    var self = this,
        drvReset = this._findDriver('net', reset);

    // push this callback to '_ready' event handler

    // soft reset
    // hard reset? what's the difference?

    // stop
        // should we clear something?
        // should we listen 'reset ind or something?'

    // start
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

Netcore.prototype.remove = function (permAddr, callback) {
    // [TODO] dev._active()
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

Netcore.prototype.ping = function () {
    // [TODO] check stamp
    // [TODO] dev._active()
    var ping = nc._findDriver('dev', 'ping');

    if (ping)
        ping(permAddr, callback);
    else
        callback(); // error
};

Netcore.prototype.enable = function () {
    this.emit('_enabled');
};

Netcore.prototype.disable = function () {
    this.emit('_disabled');
};


Netcore.prototype.readDev = function (permAddr, attr, callback) {
    // [TODO] check stamp
    // [TODO] dev._active()
    var read = nc._findDriver('dev', 'read');

    if (read)
        read(permAddr, attr, callback);
    else
        callback(); // error
};

Netcore.prototype.writeDev = function (permAddr, attr, val, callback) {
    // [TODO] check stamp
    // [TODO] dev._active()
    var write = nc._findDriver('dev', 'write');

    if (write)
        write(permAddr, attr, val, callback);
    else
        callback(); // error
};

Netcore.prototype.identify = function (permAddr, callback) {
    // [TODO] check stamp
    // [TODO] dev._active()
    var identify = nc._findDriver('dev', 'identify');

    if (identify)
        identify(permAddr, callback);
    else
        callback(); // error
};

Netcore.prototype.read = function (permAddr, auxId, attr, callback) {
    // [TODO] check stamp
    // [TODO] dev._active()
    var write = nc._findDriver('gad', 'write');

    if (write)
        write(gad, attr, val, callback);
    else
        callback(); // error
};

Netcore.prototype.write = function (permAddr, auxId, attr, val, callback) {
    // [TODO] check stamp
    // [TODO] dev._active()
    var write = nc._findDriver('gad', 'write');

    if (write)
        write(gad, attr, val, callback);
    else
        callback(); // error
};

Netcore.prototype.exec = function (permAddr, attr, args, callback) {
    // [TODO] check stamp
    // [TODO] dev._active()
    var exec = nc._findDriver('gad', 'exec');

    if (exec)
        exec(gad, attr, args, callback);
    else
        callback(); // error
};

Netcore.prototype.setReportCfg = function (permAddr, auxId, attr, cfg, callback) {
    var setReportCfg = nc._findDriver('gad', 'setReportCfg');

    if (setReportCfg)
        setReportCfg(gad, attr, cfg, callback);
    else
        callback(); // error
};

Netcore.prototype.getReportCfg = function (permAddr, auxId, attr, callback) {
    var getReportCfg = nc._findDriver('gad', 'getReportCfg');

    if (getReportCfg)
        getReportCfg(permAddr, auxId, attr, callback);
    else
        callback(); // error
};


Netcore.prototype._checkEngine = function () {
    var err;
    if (!this._fb)
        err = new Error('Not registered');
    else if (!this._enabled)
        err = new Error('Not enabled');

    return err;
};

