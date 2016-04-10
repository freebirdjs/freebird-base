var EventEmitter = require('events'),
    util = require('util'),
    _ = require('lodash');

var Device = require('./device'),
    Gadget = require('./gadget'),
    utils = require('./utils');

function Netcore(name, cfg) {
    // cfg = { controller, protocol, statusCheck }
    if (!_.isString(name)) throw new Error('Bad name');
    if (!_.isObject(cfg)) throw new Error('Bad cfg');
    if (!_.isPlainObject(cfg.protocol)) throw new Error('Bad protocol');
    if (!_.isObject(cfg.controller)) throw new Error('Bad contoller');

    var __blacklist = [];

    this._joinTimer = null; // set @ permit join
    this._joinTicks = 0;    // set @ permit join

//    this._liveKeeper = null;  // @freebird, maybe plugin?

    this._name = name;
    this._controller = cfg.controller;              // required
    this._protocol = cfg.protocol;                  // required
    // { PHY, DLL, NWK, TL, APL... }
    this._ticks = cfg.ticks;                        // sleep maintainer
    this._defaultJoinTime = cfg.defaultJoinTime;    // optional

    this._fb = null;
    this._enabled = false;
    this._startTime = 0;
    this._traffic = {
        in: {
            hits: 0,
            bytes: 0
        },
        out: {
            hits: 0,
            bytes: 0
        }
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
            // maintain: null,     // function([permAddr][, callback]) {}
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

    this._block = function (permAddr) {
        if (!_.includes(__blacklist, permAddr))
            __blacklist.push(permAddr);

        return this;
    };

    this._unblock = function (permAddr) {
        _.remove(__blacklist, function (n) {
            return n === permAddr;
        });

        return this;
    };
}

Netcore.prototype._fbEmit = function (evt, data) {
    var emitData,
        emitted = false;

    data = data || {};
    emitData = _.assign(data, {
        netcore: this
    });

    if (this.isRegistered()) {
        this._fb.emit(evt, data);
        emitted = true;
    }

    return emitted;
};

/***********************************************************************/
/*** Public APIs                                                     ***/
/***********************************************************************/
Netcore.prototype.getName = function () {
    return this._name;
};

Netcore.prototype.isRegistered = function () {
    return !!this._fb;
};

Netcore.prototype.isJoinable = function () {
    return !!this._joinTicks;
};

Netcore.prototype.isEnabled = function () {
    return this._enabled;
};

Netcore.prototype.enable = function () {
    if (!this._enabled) {
        this._enabled = true;
        this._fbEmit('_nc:enabled', {
            netcore: this
        });
    }

    return this;
};

Netcore.prototype.disable = function () {
    var self = this;

    // call permitJoin(0) to reject all device joining
    this.permitJoin(0, function (err, result) {
        if (err) {
            self._fbEmit('_nc:error', {
                netcore: self,
                error: err
            });
        } else if (self._enabled) {
            self._enabled = false;
            self._fbEmit('_nc:disabled', {
                netcore: self
            });
        }
    });

    return this;
};

Netcore.prototype.dump = function () {
    return {
        name: this._name,
        enabled: this._enabled,
        protocol: _.cloneDeep(this._protocol),
        startTime: this._startTime,
        traffic: {
            in: {
                hits: this._traffic.in.hits,
                bytes: this._traffic.in.bytes,
            },
            out: {
                hits: this._traffic.out.hits,
                bytes: this._traffic.out.bytes,
            }
        }
    };
};

/***********************************************************************/
/*** Developer Calls                                                 ***/
/***********************************************************************/
Netcore.prototype.commitDevIncoming = function (permAddr, rawDev) {
    // check blacklist
    if (!this.isEnabled()) { // nc disabled, ignore all messages
        return false;
    } else if (this.isBlacklisted(permAddr)) {
        this._fbEmit('_nc:bannedDevIncoming', {
            netcore: this,
            permAddr: permAddr,
            raw: rawDev
        }); // tell fb here comes a banned device
        return false;
    }

    // cook@fb, check cooker@fb, not here
    // check nc.joinable@fb, if not joinable and not a registered devce, ignored@fb
    this._fbEmit('_nc:devIncoming', {
        netcore: this,
        permAddr: permAddr,
        raw: rawDev
    }); // tell fb here comes a new device, register@fb or let fb find changes

    return true;    // accepted
};

Netcore.prototype.commitDevLeaving = function (permAddr) {
    if (!this.isEnabled())
        return false;

    this._fbEmit('_nc:devLeaving', { 
        netcore: this,
        permAddr: permAddr
    }); // unregister@fb, kill instance

    return true;    // accepted
};

Netcore.prototype.commitGadIncoming = function (permAddr, auxId, rawGad) {
    if (!this.isEnabled())  {
        return false;
    } else if (this.isBlacklisted(permAddr)) {
        this._fbEmit('_nc:bannedGadIncoming', {
            netcore: this,
            permAddr: permAddr,
            auxId: auxId,
            raw: rawGad
        }); // tell fb here comes a gadget on a banned device
        return false;
    }

    this._fbEmit('_nc:gadIncoming', {
        netcore: this,
        permAddr: permAddr,
        auxId: auxId,
        raw: rawGad
    });   // tell fb here comes a new gadget, register@fb

    return true;
};

Netcore.prototype.commitDevReporting = function (permAddr, attrs) {
    if (!this.isEnabled()) {
        return false;
    } else if (this.isBlacklisted(permAddr)) {
        this._fbEmit('_nc:bannedDevReporting', {
            netcore: this,
            permAddr: permAddr,
            attrs: attrs
        });
        return false;
    }

    // cook@fb, not here
    // devAttrs = this.cookRawDevAttrsReport(attrs);
    this._fbEmit('_nc:devReporting', {
        netcore: this,
        permAddr: permAddr,
        attrs: attrs
    });

    return true;
};

Netcore.prototype.commitGadReporting = function (permAddr, auxId, attrs) {
    if (!this.isEnabled()) {
        return false;
    } else if (this.isBlacklisted(permAddr)) {
        this._fbEmit('_nc:bannedGadReporting', {
            netcore: this,
            permAddr: permAddr,
            auxId: auxId,
            attrs: attrs
        });
        return false;
    }

    // cook@fb, not here
    // gadAttrs = this.cookRawGadAttrsReport(attrs);
    this._fbEmit('_nc:gadReporting', {
        netcore: this,
        permanent: permAddr,
        auxId: auxId,
        attrs: attrs
    });

    return true;
};

Netcore.prototype.incTxBytes = function (num) {     // ok
    this._traffic.out.bytes += num;
    this._traffic.out.hits += 1;

    return this._traffic.out;
};

Netcore.prototype.incRxBytes = function (num) {     // ok
    this._traffic.in.bytes += num;
    this._traffic.in.hits += 1;

    return this._traffic.in;
};

Netcore.prototype.resetTxTraffic = function () {    // ok
    this._traffic.out.bytes = 0;
    this._traffic.out.hits = 0;

    return this._traffic.out;
};

Netcore.prototype.resetRxTraffic = function () {   // ok
    this._traffic.in.bytes = 0;
    this._traffic.in.hits = 0;
    return this._traffic.in;
};

/***********************************************************************/
/*** Developer Provides                                              ***/
/***********************************************************************/
Netcore.prototype.registerNetDrivers = function (drvs) {
    // start, stop, reset, permitJoin, maintain, remove, ban, unban, ping
    var self = this,
        mandatory = [ 'start', 'stop', 'reset', 'permitJoin', 'maintain', 'remove', 'ping' ],
        optional = [ 'ban', 'unban' ],
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
    // read, write, [identify]
    var mandatory = [ 'read', 'write' ],
        drvNotFound = '';

    mandatory.forEach(function (drvName) {
        if (typeof drvs[drvName] !== 'function')
            drvNotFound = drvNotFound + drvName + ', ';
    });

    if (drvNotFound !== '')
        throw new Error('Device driver(s) ' + drvNotFound + 'should be implemented.');

    // attach drivers
    _.forEach(drvs, function (fn, key) {
        self.drivers.dev[key] = fn;
    });
};

Netcore.prototype.registerGadDrivers = function (drvs) {
    // read, write, exec, setReportCfg, getReportCfg
    _.forEach(drvs, function () {
        
    });
};

/***********************************************************************/
/*** Protected Methods                                               ***/
/***********************************************************************/
Netcore.prototype._findDriver = function (type, name) {

};

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

/***********************************************************************/
/*** Drivers                                                         ***/
/***********************************************************************/
    // CHECK DRIVER
    // // developer should tell netcore how to turn a raw device into a ripe device (Device class) 
    // if (!_.isFunction(this.cookRawDevice))
    //     throw new Error('Method cookRawDevice() should be implemented.');


Netcore.prototype.start = function (callback) {
    // (1) should work even not registered to fb
    // (2) check drivers, especially start
    // (3) after started
    //      reattach handlers, enable(msg control), emit '_ready'

    var self = this,
        drvStart = this._findDriver('net', start);

    // Should work even not registered to fb
    // if (!this.isRegistered())
    //     return callback(new Error('Not registered'));

    // enable after started

    // check drivers
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
                self._fbEmit('_nc:ready', {
                    netcore: self
                });
            }
        });
    } else {    // start driver is required, should throw error if not given
        callback(new Error('Driver start() not implemented'));
    }

    return this;
};

Netcore.prototype.stop = function (callback) {
    // (1) should work even not registered to fb
    // (2) call driver stop
    // (3) after stopped
    //      remove handlers, disable, emit '_stop'

    var self = this,
        drvStop = this._findDriver('net', stop);

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

// [TODO]
Netcore.prototype.reset = function (mode, callback) {
    // (1) should work even not registered to fb
    // (2) call driver reset
    // (3) ------------------------------------------
    //      remove handlers, disable, emit '_stop'

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

Netcore.prototype.devRead = function (permAddr, attrName, callback) {
    // [TODO] check stamp
    // [TODO] dev._markActivity()
    return this._callDriver('dev', 'read', arguments);
};

Netcore.prototype.devWrite = function (permAddr, attr, val, callback) {
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
Netcore.prototype.gadRead = function (permAddr, auxId, attr, callback) {
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

Netcore.prototype.gadWrite = function (permAddr, auxId, attr, val, callback) {
    var write = this._findDriver('gad', 'write');

    if (write)
        write(permAddr, auxId, attr, val, callback);
    else
        callback(new Error('Driver not found')); // error
};

Netcore.prototype.gadExec = function (permAddr, attr, args, callback) {
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
    var self = this;
    this.addToBlacklist(permAddr);
    // find dev -> yes -> remove it

    self._fbEmit('_nc:ban', {
        netcore: self,
        permAddr: permAddr
    });

    return this._callDriver('net', 'ban', arguments);
};

Netcore.prototype.unban = function (permAddr, callback) {
    var self = this;
    return this._callDriver('net', 'ban', arguments, function () {
        self.unblacklist(permAddr);
        self._fbEmit('_nc:unban', {
            netcore: self,
            permAddr: permAddr
        });
        callback();

    });
};

/***********************************************************************/
/*** Private Functions                                               ***/
/***********************************************************************/

Netcore.prototype._callNetDriver = function (method, args, callback) {
    var driver = this._drivers.net[method];

    if (!this.isEnabled())
        return callback(new Error('netcore disabled'));
    else if (typeof driver !== 'function')
        return callback(new Error('driver not found'));

    return driver.apply(this, args, function () {
        callback();
    });
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