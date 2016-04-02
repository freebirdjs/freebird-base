var EventEmitter = require('events'),
    util = require('util'),
    _ = require('lodash');

var Device = require('./device'),
    Gadget = require('./gadget'),
    utils = require('./utils');

// ping regularly to check: online -> sleep, sleep -> offline
function Netcore(name, cfg) {
    // cfg = { controller, protocol, statusCheck }
    if (!_.isString(name)) throw new Error('Bad name');
    if (!_.isObject(cfg)) throw new Error('Bad cfg');
    if (!_.isPlainObject(cfg.protocol)) throw new Error('Bad protocol');
    if (!_.isObject(cfg.controller)) throw new Error('Bad contoller');

    var __blacklist = [];

    this._joinTimer = null; // set @ permit join
    this._joinTicks = 0;    // set @ permit join

    this._liveKeeper = null;

    this._name = name;
    this._controller = cfg.controller;              // required
    this._protocol = cfg.protocol;                  // required
    this._ticks = cfg.ticks;                        // optional
    this._defaultJoinTime = cfg.defaultJoinTime;    // optional

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

    this.findDevByAddr = null;
    this.findGadByAddrAuxId = null;
    this.getAllDevs = null;
    this.getAllGads = null;
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

    this.clearBlacklist = function () {
        __blacklist = null;
        __blacklist = [];
        return _.cloneDeep(__blacklist);
    };

    this.isBlacklisted = function (permAddr) {
        return _.includes(__blacklist, permAddr);
    };

    this.blacklist = function (permAddr) {
        if (!_.includes(__blacklist, permAddr))
            __blacklist.push(permAddr);

        return this;
    };

    this.unblacklist = function (permAddr) {
        _.remove(__blacklist, function (n) {
            return n === permAddr;
        });

        return this;
    };
}

Netcore.prototype._startLiveKeeper = function (raw) {
    var self = this;
        intvl = this._intvl || 180;

    if (this._liveKeeper)
        clearTimeout(this._liveKeeper);

    // start live keeper
    this._liveKeeper = setTimeout(function () {
        var allDevs = nc.getAllDevs(),
            nowSec = utils.nowSeconds(),
            devsToCheck;

        if (allDevs)
            devsToCheck = _.filter(allDevs, function (dev) {
                return (nowSec - dev._lastTime) > intvl || (nowSec - dev._lastTime) > dev.sleepTime;
            });

        if (devsToCheck.length)
            _.forEach(devsToCheck, function (dev) {
                dev.ping(function (err, result) {
                    // err: timeout
                    if (err) {}
                });
            });

    }, 180*1000);
};

Netcore.prototype._findDevByAddr = function (permAddr) {
    var finder = this.findDevByAddr;

    if (!_.isFunction(finder)) {
        if (this.isRegistered())
            finder = this._fb.findDevByAddr;
    }

    if (_.isFunction(finder))
        return finder(permAddr);
    else
        return;
};

Netcore.prototype._findGadByAddrAuxId = function (permAddr, auxId) {
    var finder = this.findGadByAddrAuxId;

    if (!_.isFunction(finder)) {
        if (this.isRegistered())
            finder = this._fb.findGadByAddrAuxId;
    }

    if (_.isFunction(finder))
        return finder(permAddr, auxId);
    else
        return;
};

Netcore.prototype._getAllDevs = function () {
    var self = this,
        getter = this.getAllDevs;

    if (!_.isFunction(getter)) {
        if (this.isRegistered())
            getter = function () {
                return self._fb.getAllDevs(self._name);
            };
    }

    if (_.isFunction(getter))
        return getter();
    else
        return;
};

Netcore.prototype._getAllGads = function (permAddr, auxId) {
    var self = this,
        getter = this.getAllGads;

    if (!_.isFunction(getter)) {
        if (this.isRegistered())
            getter = function () {
                return self._fb.getAllGads(self._name);
            };
    }

    if (_.isFunction(getter))
        return getter();
    else
        return;
};

Netcore.prototype.devIncoming = function (raw) {
    // At very beginning, check if netcore is enabled. If not, ignore all messages.
    // Since netcore can run independtly without freebird, we need not to check 
    // if it is registered to freebird.
    if (!this.isEnabled()) 
        return;

    // [TODO] check dev enabled

    var self = this,
        newDev = new Device(this, raw),
        oldDev,
        delta;

    // developer should tell netcore how to turn a raw device into a ripe device (Device class) 
    if (!_.isFunction(this.cookRawDevice))
        throw new Error('Method cookRawDevice() should be implemented.');

    this.cookRawDevice(newDev, raw, function (ripeDev) {
        var isDevBanned = false;

        if (newDev !== ripeDev)
            newDev = ripeDev;

        // find if device is banned
        isDevBanned = self.isBlacklisted(newDev.address.permanent);

        // find if device is already there
        oldDev = self._findDevByAddr(newDev.address.permanent);

        if (!isDevBanned && !oldDev) {          // a brain new device which is allowed to come in
            newDev._markActivity();                       // stamp current time to tell its lastest activity
            self.emit('devIncoming', newDev);       // tell fb here comes a new device, register@fb
        } else if (!isDevBanned && oldDev) {    // device already exists
            // re-assign
            oldDev._netcore = null;
            oldDev._raw = null;
            oldDev._netcore = newDev._netcore;
            oldDev._raw = newDev._raw;

            delta = utils.getDevDiff(newDev, oldDev);       // find delta of these two device
            oldDev._markActivity();
            newDev = null;
            self.emit('devAttrsChanged', oldDev, delta);    // update@fb
        } else if (isDevBanned && !oldDev) {    // a new device, but not allowed to come in
            self.remove(newDev.address.permanent, function () {
                newDev._markActivity();
                newDev = null;
            });
            return;
        } else if (isDevBanned && oldDev) {     // an old one, but should be banned (remove it!)
            newDev = null;
            // we should remove it by ourselves
            self.remove(oldDev.address.permanent, function () {
                oldDev._markActivity();
                self.emit('devLeaving', oldDev);            // tell fb someone is leaving, kill@fb
            });
            return;
        }
    });
};

Netcore.prototype.devLeaving = function (permAddr) {
    if (!this.isEnabled()) 
        return;

    var dev = this._findDevByAddr(permAddr);

    if (dev) {
        dev._markActivity();                  // stamp current time to tell its lastest activity
        this.emit('devLeaving', dev);   // unregister@fb, kill instance
    }
};

Netcore.prototype.gadIncoming = function (permAddr, auxId, meta) {
    if (!this.isEnabled()) 
        return;

    // [TODO] check dev enabled
    // [TODO] check gad enabled
    var self = this,
        dev = this._findDevByAddr(permAddr),
        isDevBanned = this.isBlacklisted(permAddr),
        delta,
        newGad,
        oldGad;

    if (!isDevBanned && dev) {
        dev._markActivity();
    } else if (!isDevBanned && !dev) {  // no dev for the gadget to attach on, just do nothing
        return;
    } else if (isDevBanned && dev) {
        dev._markActivity();
        this.remove(permAddr, function () {
            self.emit('devLeaving', dev);
        });
        return;
    } else if (isDevBanned && !dev) {
        this.remove(permAddr);
        return;
    }

    //**** If we are here, it means the device is very ok ****//
    newGad = new Gadget(dev, auxId);

    this.cookGadget(newGad, meta, function (ripeGad) {
        if (newGad !== ripeGad)
            newGad = ripeGad;

        oldGad = self._findGadByAddrAuxId(dev.address.permanent, auxId);

        if (oldGad) {   // gadget already there
            oldGad._dev = dev;
            delta = utils.getGadDiff(newGad, oldGad);
            newGad = null;
            this.emit('gadAttrsChanged', oldGad, delta);
        } else {        // a brain new gadget
            self.emit('gadIncoming', newGad);   // tell fb here comes a new gadget, register@fb
        }
    });
};

Netcore.prototype.reportDevAttrs = function (permAddr, attrs) {
    if (!this.isEnabled()) 
        return;
    // [TODO] check dev enabled

    var self = this,
        dev = this._findDevByAddr(permAddr),
        isDevBanned = this.isBlacklisted(permAddr),
        devAttrs = this.cookRawDevAttrsReport(attrs),
        delta;

    if (!isDevBanned && dev) {
        dev._markActivity();
    } else if (!isDevBanned && !dev) {  // no dev, just do nothing
        return;
    } else if (isDevBanned && dev) {
        dev._markActivity();
        this.remove(permAddr, function () {
            self.emit('devLeaving', dev);
        });
        return;
    } else if (isDevBanned && !dev) {   // no dev, just do nothing
        this.remove(permAddr);
        return;
    }

    //**** If we are here, it means the device is very ok ****//

    // check if net changed
    var netAttrs = [ 'role', 'parent', 'maySleep', 'sleepTime', 'status', 'address' ],
        ddevAttrs = [ 'attrs' ],
        netDelta = {},
        attrsDelta = {};

    _.forEach(devAttrs, function (val, key) {

    });

    if (!_.isEmpty(netDelta))
        this.emit('netChanged', dev, netDelta);

    // check if dev attrs changed
    if (!_.isEmpty(netDelta))
        this.emit('devAttrsChanged', dev, attrsDelta);

    // check if status changed
    if (netDelta.status)
        this.emit('statusChanged', dev, netDelta.status);
};

Netcore.prototype.reportGadAttrs = function (permAddr, auxId, attrs) {
    // [TODO] dev._markActivity()
    // [TODO] check gad enabled
    var isBlacklisted = self.isBlacklisted(permAddr);

    var gad = fb.findGadByAddrAuxId(permAddr, auxId);

    // check if attrs changed

    if (gad)
        this.emit('attrReport', gad, attr);
};

Netcore.prototype.dump = function () {
    return {
        name: this._name,
        enabled: this._enabled,
        protocol: _.cloneDeep(this._protocol),
        numDevs: this.getAllDevs().length,
        numGads: this.getAllGads().length,
        startTime: this._startTime,
        traffic: {
            in: this._traffic.in,
            out: this._traffic.out
        }
    };
};

/***********************************************************************/
/*** Developer Calls                                                 ***/
/***********************************************************************/
Netcore.prototype.incTxBytes = function (num) {
    this._traffic.out += num;
    return this._traffic.out;
};

Netcore.prototype.incRxBytes = function (num) {
    this._traffic.in += num;
    return this._traffic.in;
};

Netcore.prototype.resetTxBytes = function () {
    this._traffic.out = 0;
    return this._traffic.out;
};

Netcore.prototype.resetRxBytes = function () {
    this._traffic.in = 0;
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
Netcore.prototype._checkEngine = function () {
    var err;
    if (!this._fb)
        err = new Error('Not registered');
    else if (!this._enabled)
        err = new Error('Not enabled');

    return err;
};

Netcore.prototype._callDriver = function (namespace, drvName, args) {
    // Check isBlacklisted(permAddr)
    // [TODO] dev._markActivity()
    var dev = nc.findDevByAddr(),
        lastTime = dev._lastTime,
        howLong = utils.nowSeconds() - lastTime;

    //  in callback: call dev._markActivity()

    var callback = args[args.length - 1],
        err = this._checkEngine(),
        driver;

    if (err)
        return callback(err);

    driver = this._findDriver(namespace, drvName);

    if (_.isFunction(driver))
        driver.apply(this, arguments);
    else
        callback(new Error('Driver not found'));
};

Netcore.prototype.enable = function () {
    this._enabled = true;
    this.emit('_enabled');
};

Netcore.prototype.disable = function () {
    var self = this;
    this._enabled = false;

    // call permitJoin(0) to reject all device joining
    this.permitJoin(0, function (err, result) {
        if (!err)
            this.emit('_disabled');
    });
};

Netcore.prototype.isRegistered = function () {
    return !!this._fb;
};

Netcore.prototype.isEnabled = function () {
    return this._enabled;
};

/***********************************************************************/
/*** Drivers                                                         ***/
/***********************************************************************/
Netcore.prototype.start = function (callback) {
    var self = this,
        drvStart = this._findDriver('net', start);

    // [TODO] check things
    if (!this.isRegistered())
        return callback(new Error('Not registered'));

    if (this.isEnabled())
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

    this.disable(); // disable first

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

    this.disable();
    // push this callback to '_ready' event handler

    // soft reset
    // hard reset? what's the difference?

    // stop
        // should we clear something?
        // should we listen 'reset ind or something?'

    // start
};

Netcore.prototype.permitJoin = function (duration, callback) {
    if (_.isFunction(duration)) {
        callback = duration;
        duration = this._defaultJoinTime;
    } else if (!_.isNumber(duration)) {
        duration = this._defaultJoinTime;
    }

    if (duration === 0) {
            // kill permit join timer
        if (this._joinTimer)
            clearInterval(this._joinTimer);

        // reset join time ticks
        this._joinTicks = 0;
    }

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

// [FIXME] not permAddrs
Netcore.prototype.maintain = function (permAddr) {

    // maintain single

    // maintain array

    // maintain all

    var isBlacklisted = self.isBlacklisted(permAddr);


    return this._callDriver('net', 'maintain', arguments);
};

Netcore.prototype.remove = function (permAddr, callback) {
    // [TODO] dev._markActivity()
    return this._callDriver('net', 'remove', arguments);
};


Netcore.prototype.ping = function (permAddr, callback) {
    // [TODO] check stamp
    // [TODO] dev._markActivity()
    return this._callDriver('net', 'ping', arguments);
};

Netcore.prototype.readDev = function (permAddr, attr, callback) {
    // [TODO] check stamp
    // [TODO] dev._markActivity()
    return this._callDriver('dev', 'read', arguments);
};

Netcore.prototype.writeDev = function (permAddr, attr, val, callback) {
    // [TODO] check stamp
    // [TODO] dev._markActivity()
    return this._callDriver('dev', 'write', arguments);
};

Netcore.prototype.identify = function (permAddr, callback) {
    // [TODO] check stamp
    // [TODO] dev._markActivity()
    return this._callDriver('dev', 'identify', arguments);
};

//------------------------------------------------------------------
Netcore.prototype.read = function (permAddr, auxId, attr, callback) {
    var read = this._findDriver('gad', 'read'),
        dev = this._findDevByAddr(permAddr);

    if (!dev)
        return callback(new Error('Device not found'));

    if (read)
        read(permAddr, auxId, attr, function (err, result) {
            if (!err) {
                dev._markActivity();
            }

        });
    else
        callback(new Error('Driver not found')); // error
};

Netcore.prototype.write = function (permAddr, auxId, attr, val, callback) {
    var write = this._findDriver('gad', 'write');

    if (write)
        write(permAddr, auxId, attr, val, callback);
    else
        callback(new Error('Driver not found')); // error
};

Netcore.prototype.exec = function (permAddr, attr, args, callback) {
    var exec = this._findDriver('gad', 'exec');

    if (exec)
        exec(permAddr, attr, args, callback);
    else
        callback(new Error('Driver not found')); // error
};

Netcore.prototype.setReportCfg = function (permAddr, auxId, attr, cfg, callback) {
    var setReportCfg = this._findDriver('gad', 'setReportCfg');

    if (setReportCfg)
        setReportCfg(permAddr, auxId, attr, cfg, callback);
    else
        callback(new Error('Driver not found')); // error
};

Netcore.prototype.getReportCfg = function (permAddr, auxId, attrName, callback) {
    var getReportCfg = this._findDriver('gad', 'getReportCfg');

    if (getReportCfg)
        getReportCfg(permAddr, auxId, attrName, callback);
    else
        callback(new Error('Driver not found')); // error
};

Netcore.prototype.ban = function (permAddr, callback) {
    this.addToBlacklist(permAddr);
    // find dev -> yes -> remove it

    return this._callDriver('net', 'ban', arguments);
};

Netcore.prototype.unban = function (permAddr, callback) {
    this.rmFromBlacklist(permAddr);
    return this._callDriver('net', 'ban', arguments);
};

/***********************************************************************/
/*** Private Functions                                               ***/
/***********************************************************************/

Netcore.prototype._callNetDriver = function (method, args) {
    // [TODO] check net enabled
};

Netcore.prototype._callDevDriver = function (method, args) {
    // [TODO] check net enabled
    // [TODO] check dev enabled
};

Netcore.prototype._callGadDriver = function (method, args) {
    // [TODO] check net enabled
    // [TODO] check dev enabled
    // [TODO] check gad enabled

    var permAddrs = args[0],
        callback = args[args.length-1],
        dev = this._findDevByAddr(permAddrs);

    if (!_.isFunction(callback))
        callback = undefined;

    if (!dev && callback)
        callback(new Error('Device not found'));

};

// getReportCfg(permAddr, auxId, attrName, callback)
// setReportCfg(permAddr, auxId, attr, cfg, callback)
// exec(permAddr, attr, args, callback)
// write(permAddr, auxId, attr, val, callback)
// read(permAddr, auxId, attr, callback)