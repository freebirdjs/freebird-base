// [TODO] check offline while remote requesting
var _ = require('busyman'),
    validate = require('./utils.js').validate,
    EVTS = require('freebird-constants').EVENTS_FROM_BOTTOM;

function Netcore(name, controller, protocol, opt) {
    var self = this,
        __blacklist = [],
        writableProp = { writable: true, enumerable: false, configurable: false },
        unwritableProp = { writable: false, enumerable: false, configurable: false };

    validate.string(name, 'Netcore name should be a string.');

    if (_.isNil(controller))
        throw new Error('controller should be given.');

    validate.object(protocol, 'protocol should be an object.');

    if (!_.isString(protocol.phy) || !_.isString(protocol.nwk))
        throw new Error("Both 'phy' and 'nwk' layers name should be given.");

    Object.defineProperty(this, '_freebird', _.assign({ value: null }, writableProp));      // set@fb register
    Object.defineProperty(this, '_joinTimer', _.assign({ value: null }, writableProp));     // set@permitJoin
    Object.defineProperty(this, '_joinTicks', _.assign({ value: 0 }, writableProp));        // set@permitJoin
    Object.defineProperty(this, '_resetting', _.assign({ value: false }, writableProp));    // set@reset

    Object.defineProperty(this, 'name', { writable: false, enumerable: true, configurable: false, value: name });
    Object.defineProperty(this, '_controller', _.assign({ value: controller }, unwritableProp));
    Object.defineProperty(this, '_net', _.assign({
        value: {
            name: name,
            enabled: false,
            protocol: protocol,
            startTime: 0,
            defaultJoinTime: 180
        }
    }, unwritableProp));

    // option section for some flexibility
    if (opt) {
        this._net.defaultJoinTime = opt.defaultJoinTime || this._net.defaultJoinTime;
    }

    this.extra = null;

    /**************************************************************************************************/
    /*** Developer should implement, check@start                                                    ***/
    /**************************************************************************************************/
    this._cookRawDev = null;    // function(dev, rawDev, done) { done(err, dev); }
    this._cookRawGad = null;    // function(gad, rawGad, done) { done(err, gad); }

    Object.defineProperty(this, 'cookRawDev',{
        writable: false,
        enumerable: true,
        configurable: false,
        value: function (dev, rawDev, done) {
            if (_.isFunction(self._cookRawDev)) {
                self._cookRawDev(dev, rawDev, done);
            } else {
                setImmediate(done, new Error('_cookRawDev() is not implemented'));
            }
        }
    });

    Object.defineProperty(this, 'cookRawGad',{
        writable: false,
        enumerable: true,
        configurable: false,
        value: function (gad, rawGad, done) {
            if (_.isFunction(self._cookRawGad)) {
                self._cookRawGad(gad, rawGad, done);
            } else {
                setImmediate(done, new Error('_cookRawGad() is not implemented'));
            }
        }
    });
    /**************************************************************************************************/
    /*** Developer should implement and do registration, check@start                                ***/
    /**************************************************************************************************/
    Object.defineProperty(this, '_drivers', _.assign({
        value: {
            net: {
                start: null, stop: null, reset: null, permitJoin: null,
                remove: null, ban: null, unban: null, ping: null
            },
            dev: { read: null, write: null, identify: null },
            gad: { read: null, write: null, exec: null, readReportCfg: null, writeReportCfg: null }
        }
    }, unwritableProp));
    
    /**************************************************************************************************/
    /*** developer can implement this listenr to receive ready indication from low-layer controller ***/
    /**************************************************************************************************/
    this.onReady = null;
    /**************************************************************************************************/

    this.getBlacklist = function () {
        return _.cloneDeep(__blacklist);
    };

    this.clearBlacklist = function () {
        __blacklist = null;
        __blacklist = [];
        return this;
    };

    this.isBlacklisted = function (permAddr) {
        validate.string(permAddr, 'permAddr should be a string.');
        return _.includes(__blacklist, permAddr);
    };

    Object.defineProperty(this, '_block', _.assign({
        value: function (permAddr) {
            if (!this.isBlacklisted(permAddr))
                __blacklist.push(permAddr);
            return this;
        }
    }, unwritableProp));

    Object.defineProperty(this, '_unblock', _.assign({
        value: function (permAddr) {
            validate.string(permAddr, 'permAddr should be a string.');
            _.remove(__blacklist, function (n) {
                return n === permAddr;
            });
            return this;
        }
    }, unwritableProp));

    // [TODO] this._onReady? WTF?
    // Object.defineProperty(this, '_onReady', {
    //     value: function () {
    //         if (self._resetting) {
    //             self.start(function (err) {
    //                 // [TODO] emit error?
    //             });
    //             self._resetting = false;
    //         }
    //         // [TODO] receive?
    //         if (_.isFunction(self.onReady)) {
    //             setImmediate(function () {
    //                 self.onReady();
    //             });
    //         }
    //     }
    // });
}

/***********************************************************************/
/*** Public APIs                                                     ***/
/***********************************************************************/
Netcore.prototype.isRegistered = function () {
    return !!this._freebird;
};

Netcore.prototype.isEnabled = function () {
    return this._net.enabled;
};

Netcore.prototype.isJoinable = function () {
    return (this._joinTicks !== 0);
};

Netcore.prototype.enable = function () {
    this._net.enabled = true;
    this._fire(EVTS.NcEnabled);
    return this;
};

Netcore.prototype.disable = function () {
    var self = this;
    
    this.permitJoin(0, function (err) { // call permitJoin(0) to reject all device joining
        if (err)
            self._fire(EVTS.NcError, { error: err });
    });

    this._net.enabled = false;
    this._fire(EVTS.NcDisabled);
    return this;
};

Netcore.prototype.getName = function () {
    return this.name;
};

Netcore.prototype.getTraffic = function () {
    // only valid when registered to freebird
    var self = this,
        allDevs,
        inHits = 0,
        inBytes = 0,
        outHits = 0,
        outBytes = 0;

    if (this._freebird) {
        allDevs = this._freebird.filter('device', function (dev) {
            return dev.get('netcore') === self;
        });
    } else {
        allDevs = [];
    }

    _.forEach(allDevs, function (dev) {
        var trfIn = dev._net.traffic.in,
            trfOut = dev._net.traffic.out;
        inHits = inHits + trfIn.hits;
        inBytes = inBytes + trfIn.bytes;
        outHits = outHits + trfOut.hits;
        outBytes = outBytes + trfOut.bytes;
    });

    return {
        in: { hits: inHits, bytes: inBytes },
        out: { hits: outHits, bytes: outBytes }
    };
};

Netcore.prototype.resetTraffic = function (dir) {
    var self = this,
        allDevs;

    if (!_.isUndefined(dir))
        validate.string(dir);

    if (this._freebird) {
        allDevs = this._freebird.filter('device', function (dev) {
            return dev.get('netcore') === self;
        });
    } else {
        allDevs = [];
    }

    // Avoid all-at-once reset (too many events fired)
    function resetDevTraffic() {
        var dev,
            devsPerFire = 10,
            numDevs = allDevs.length;

        for (var i = 0; i < devsPerFire; i++) {
            if (allDevs.length > 0) {
                dev = allDevs.pop();
                dev.resetTraffic(dir);
            }
        }

        if (allDevs.length > 0)
            setImmediate(resetDevTraffic);
    }

    return this;
};

Netcore.prototype.dump = function () {
    var netInfo = _.cloneDeep(this._net);
    netInfo.name = this.getName();

    return netInfo;
};

Netcore.prototype.registerNetDrivers = function (drvs) {
    return registerDrivers(this, 'net', drvs);
};

Netcore.prototype.registerDevDrivers = function (drvs) {
    return registerDrivers(this, 'dev', drvs);
};

Netcore.prototype.registerGadDrivers = function (drvs) {
    return registerDrivers(this, 'gad', drvs);
};

/***********************************************************************/
/*** Driver Wrappers - For User to call                              ***/
/***********************************************************************/
Netcore.prototype.start = function (callback) {
    var self = this,
        args = [];

    validate.cookers(this);
    validate.drivers(this);
    validate.fn(callback);

    this._callDriver('net', 'start', args, callback, function (err, result) {
        if (!err) {
            self._net.startTime = Math.floor(Date.now()/1000);  // seconds
            self.enable();
            self._fire(EVTS.NcReady);
            self._fire(EVTS.NcStarted);
        }
    });
};

Netcore.prototype.stop = function (callback) {
    var self = this,
        args = [];

    validate.fn(callback);
    this._callDriver('net', 'stop', args, callback, function (err, result) {
        if (!err) {
            self.disable();
            self._fire(EVTS.NcStopped);
        }
    });
};

// [TODO] not test yet
Netcore.prototype.reset = function (mode, callback) {   // callback is optional
    var self = this,
        args = [];

    if (_.isFunction(mode)) {
        callback = mode;
        mode = false;
    } else {
        mode = !!mode;
    }

    args.push(mode ? 1 : 0);

    // [TODO] SOFT/HARD will both clear blacklist
    this.stop(function (err) {  // this will stop and disable netcore
        if (err) {
            callback(err);
        } else {
            self._callDriver('net', 'reset', args, callback, function (err, result) {
                if (err) {
                    self.enable();
                } else {
                    self._resetting = true;
                    // if no err and hard reset applied, also clear blacklist
                    if (mode)   // why clear here: clear when reset is definitely success, or blacklist gone is gone
                        self.clearBlacklist();
                }
            });
        }
    });
};

Netcore.prototype.permitJoin = function (duration, callback) {  // callback is optional
    var self = this,
        args;

    if (_.isFunction(duration)) {
        callback = duration;
        duration = this._net.defaultJoinTime;
    }

    validate.number(duration, 'duration should be an integer in seconds.');
    if (!_.isUndefined(callback))
        validate.fn(callback, 'callback should be a function if given.');
    args = [ duration ];

    this._callDriver('net', 'permitJoin', args, callback, function (err) {
        if (!err)
            startJoinTimer(self, duration);
    });
};

Netcore.prototype.remove = function (permAddr, callback) {
    var self = this,
        ncName = this.getName(),
        freebird = this._freebird,
        dev,
        args = [ permAddr ];

    validate.argTypes({ permAddr: permAddr, callback: callback });

    if (freebird) {
        if (dev = freebird.findByNet('device', ncName, permAddr))
            dev._removing = true;
    }

    this._callDriver('net', 'remove', args, callback, function (err, result) {
        if (dev)
            self._fire(EVTS.NcDevLeaving, { permAddr: permAddr });
    });
};

Netcore.prototype.ban = function (permAddr, callback) {
    var self = this,
        drvBan = this._findDriver('net', 'ban');

    validate.argTypes({ permAddr: permAddr, callback: callback });

    if (!this.isEnabled())
        return setImmediate(callback, new Error('Netcore not enabled'));

    if (!_.isFunction(drvBan)) {    // use default blocker
        self._block(permAddr);
        
        return setImmediate(function () {
            callback(null, permAddr);
            self._fire(EVTS.NcNetBan, { permAddr: permAddr });
        });
    }

    drvBan(permAddr, function (err, result) {
        if (err) {
            callback(er);
        } else {
            self._block(permAddr);      // block at netcore as well
            callback(null, permAddr);
            self._fire(EVTS.NcNetBan, { permAddr: permAddr });
        }
    });
};

Netcore.prototype.unban = function (permAddr, callback) {
    var self = this,
        drvUnban = this._findDriver('net', 'unban');

    validate.argTypes({ permAddr: permAddr, callback: callback });

    if (!this.isEnabled())
        return setImmediate(callback, new Error('Netcore not enabled'));

    if (!_.isFunction(drvUnban)) {  // use default blocker
        self._unblock(permAddr);

        return setImmediate(function () {
            callback(null, permAddr);
            self._fire(EVTS.NcNetUnban, { permAddr: permAddr });
        });
    }

    drvUnban(permAddr, function (err, result) {
        if (err) {
            callback(er);
        } else {
            self._unblock(permAddr);
            callback(null, permAddr);
            self._fire(EVTS.NcNetUnban, { permAddr: permAddr });
        }
    });
};

Netcore.prototype.ping = function (permAddr, callback) {
    var self = this,
        args = [ permAddr ];

    validate.argTypes({ permAddr: permAddr, callback: callback });

    this._callDriver('net', 'ping', args, callback, function (err, result) {
        if (!err)
            self._fire(EVTS.NcNetPing, { permAddr: permAddr, data: result });
    });
};

Netcore.prototype.maintain = function (callback) {  // callback is optional
    var self = this,
        devs,
        cbCalled = false,
        freebird = this._freebird;

    callback = callback || function (err, maintained) {
        if (err)
            self._fire(EVTS.NcError, { error: err });
    };

    if (!freebird)
        return setImmediate(callback, new Error('Cannot maintain. Netcore is not registered properly'));
    else if (!_.isFunction(callback))
        return setImmediate(callback, new TypeError('callback should be a function if given'));
    else if (!this.isEnabled())
        return setImmediate(callback, null, false); // netcore disabled, no need to maintain

    devs = freebird.filter('device', function (dev) {
        return dev.get('netcore') === self;
    });

    function keepDevSyncing() {
        var dev;

        if (cbCalled)
            return;

        if (devs.length === 0) {
            cbCalled = true;
            return callback(null, true);
        }

        dev = devs.pop();
        dev.maintain(function (err, maintained) {
            if (err) {
                cbCalled = true;
                callback(null, false);
            }
            keepDevSyncing();
        });
    }
};

/***********************************************************************/
/*** Developer Should Call When Build a Netcore - ok                 ***/
/***********************************************************************/
Netcore.prototype.commitReady = function () {
    this.enable();
    this._onReady();
    return this._fire(EVTS._NcReady, {});
};

Netcore.prototype.commitDevNetChanging = function (permAddr, changes) {
    // changes: { role, parent, maySleep, sleepPeriod, address: { dynamic } }
    // nc disabled or dev is blocked, ignore all messages
    validate.string(permAddr, 'permAddr should be a string.');
    validate.object(changes, 'changes should be an object.');
    if (!this.isEnabled() || this.isBlacklisted(permAddr))
        return false;

    if (changes.address && changes.address.permanent)
        delete changes.address.permanent;

    return this._fire(EVTS.NcDevNetChanging, { permAddr: permAddr, data: changes });
};

Netcore.prototype.commitDevIncoming = function (permAddr, rawDev) {
    validate.argTypes({ permAddr: permAddr, rawDev: rawDev });
    if (!this.isEnabled())  // nc disabled, ignore all messages
        return false;

    return this.isBlacklisted(permAddr) ?
        this._fire(EVTS.NcBannedDevIncoming, { permAddr: permAddr, raw: rawDev }) :
        this._fire(EVTS.NcDevIncoming, { permAddr: permAddr, raw: rawDev });
        // cook@freebird, check cooker@freebird, not here
        // check nc.joinable@freebird, if not joinable and not a registered devce, ignored@freebird
        // tell freebird here comes a new device, register@freebird and let freebird find changes
};

Netcore.prototype.commitDevLeaving = function (permAddr) {
    validate.string(permAddr, 'permAddr should be a string.');
    return this.isEnabled() ?
        this._fire(EVTS.NcDevLeaving, { permAddr: permAddr }) : // unregister@freebird, kill instance
        false;
};

Netcore.prototype.commitGadIncoming = function (permAddr, auxId, rawGad) {
    validate.argTypes({ permAddr: permAddr, auxId: auxId, rawGad: rawGad });
    if (!this.isEnabled())
        return false;

    return this.isBlacklisted(permAddr) ? 
        this._fire(EVTS.NcBannedGadIncoming, { permAddr: permAddr, auxId: auxId, raw: rawGad }) : // tell freebird here comes a gadget on a banned device
        this._fire(EVTS.NcGadIncoming, { permAddr: permAddr, auxId: auxId, raw: rawGad });        // tell freebird here comes a new gadget, register@freebird
};

Netcore.prototype.commitDevReporting = function (permAddr, devAttrs) {
    validate.argTypes({ permAddr: permAddr, devAttrs: devAttrs });
    if (!this.isEnabled())
        return false;

    return this.isBlacklisted(permAddr) ?
        this._fire(EVTS.NcBannedDevReporting, { permAddr: permAddr, data: devAttrs }) :
        this._fire(EVTS.NcDevReporting, { permAddr: permAddr, data: devAttrs });        // user should commit devAttrs with correct format
};

Netcore.prototype.commitGadReporting = function (permAddr, auxId, gadAttrs) {
    validate.argTypes({ permAddr: permAddr, auxId: auxId, gadAttrs: gadAttrs });
    if (!this.isEnabled())
        return false;

    return this.isBlacklisted(permAddr) ?
        this._fire(EVTS.NcBannedGadReporting, { permAddr: permAddr, auxId: auxId, data: gadAttrs, appendFlag: false }) :
        this._fire(EVTS.NcGadReporting, { permAddr: permAddr, auxId: auxId, data: gadAttrs });  // user should commit devAttrs with correct format
};

Netcore.prototype.dangerouslyCommitGadReporting = function (permAddr, auxId, gadAttrs) {
    validate.argTypes({ permAddr: permAddr, auxId: auxId, gadAttrs: gadAttrs });
    if (!this.isEnabled())
        return false;

    return this.isBlacklisted(permAddr) ?
        this._fire(EVTS.NcBannedGadReporting, { permAddr: permAddr, auxId: auxId, data: gadAttrs }) :
        this._fire(EVTS.NcGadReporting, { permAddr: permAddr, auxId: auxId, data: gadAttrs, appendFlag: true });    // user should commit devAttrs with correct format
};

/*************************************************************************************************/
/*** Netcore Protected APIs                                                                    ***/
/*************************************************************************************************/
Netcore.prototype._fire = function (evt, data) {
    validate.string(evt, 'evt should be a string.');

    var self = this,
        emitData,
        isErrEvt = (evt === EVTS.NcError) || (evt === EVTS.DevError) || (evt === EVTS.GadError);

    if (!isErrEvt) {
        data = data || {};
        emitData = _.assign(data, { netcore: this });
    } else {
        // if error, give error object, and attach information to err.info
        emitData = data.error;
        delete data.error;
        emitData.info =  _.assign(data, { netcore: this.getName() });
    }

    if (this.isRegistered()) {
        // devIncoming should fire as soon as possilbe for first-time device creation
        if (evt === EVTS.NcDevIncoming) {
            self._freebird.emit(evt, emitData);
        } else {
            setImmediate(function () {
                self._freebird.emit(evt, emitData);
            });
        }
        return true;    // emitted
    } else {
        return false;
    }
};

Netcore.prototype._findDriver = function (type, name) {
    validate.string(type, 'type should be a string.');
    validate.string(name, 'name should be a string.');
    var drvFolder = this._drivers[type];
    return drvFolder ? drvFolder[name] : undefined;
};

Netcore.prototype._callDriver = function (type, name, args, originCb, callback) {
    var self = this,
        driver = this._findDriver(type, name),
        err;

    validate.fn(callback);

    function tryFireError(er, res) {
        // if no callback given , and error occurs, emit error instead
        if (_.isFunction(originCb)) {
            process.nextTick(function () {
                originCb(er, res);
            });
        } else if (er) {
            self._fire(EVTS.NcError, { error: er });
        }
    }

    if (type === 'net' && (name === 'start' || name === 'reset'))   // when start or reset, don't check isEnabled(), or start will fail
        err = undefined;
    else if (!this.isEnabled())
        err = new Error('Netcore not enabled.');
    else if (!_.isFunction(driver))
        err = new Error(type + ' driver ' + name + '() not implemented');

    if (err) {
        callback(err);  // driver wrapper inner processor
        tryFireError(err);
    } else {
        args.push(function (drvErr, result) {   // inner callback
            callback(drvErr, result);           // driver wrapper inner processor
            tryFireError(drvErr, result);
        });
        driver.apply(this, args);
    }
};

/***********************************************************************/
/*** Private Functions                                               ***/
/***********************************************************************/
function registerDrivers(nc, namespace, drvs) {
    validate.string(namespace, 'namespace should be a string.');

    if (!_.isObject(drvs) || _.isArray(drvs) || _.isFunction(drvs))
        throw new TypeError('Drivers should be wrapped in an object.');
    else if (!_.isEmpty(drvs) && !_.every(drvs, _.isFunction))
        throw new TypeError('Every driver should be a function.');

    _.assign(nc._drivers[namespace], drvs);  // attach drivers
    return nc;
}

function clearJoinTimer(nc) {
    nc._joinTicks = 0;

    if (nc._joinTimer) {
        clearInterval(nc._joinTimer);
        nc._fire(EVTS.NcPermitJoin, { timeLeft: 0 });
    }
}

function startJoinTimer(nc, duration) {
    clearJoinTimer(nc);
    nc._joinTicks = duration;

    if (nc._joinTicks) {
        nc._joinTimer = setInterval(function () {
            nc._joinTicks = nc._joinTicks - 1;
            nc._fire(EVTS.NcPermitJoin, { timeLeft: nc._joinTicks });
            
            if (nc._joinTicks === 0) 
                clearJoinTimer(nc);
        }, 1000);
    } else {
        nc._fire(EVTS.NcPermitJoin, { timeLeft: 0 });
    }
}

module.exports = Netcore;
