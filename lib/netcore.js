var _ = require('busyman'),
    validate = require('./utils.js').validate,
    BTM_EVTS = require('freebird-constants').EVENTS_FROM_BOTTOM;

var NC_UNKNOW_STATE = 0,
    NC_NORMAL_STATE = 1;

function Netcore(name, controller, protocol, opt) {
    if (!(this instanceof Netcore))
        return new Netcore(name, controller, protocol, opt);

    validate.string(name, 'Netcore name should be a string.');
    validate.object(protocol, 'protocol should be an object.');

    if (_.isNil(controller))
        throw new Error('controller should be given.');
    else if (!_.isString(protocol.phy) || !_.isString(protocol.nwk))
        throw new Error("Both 'phy' and 'nwk' layers name should be given.");

    var __blacklist = [],
        baseProp = { writable: true, enumerable: false, configurable: false },
        netInfo = { name: name, enabled: false, protocol: protocol, startTime: 0 };

    Object.defineProperty(this, 'name', _.assign({ value: name }, baseProp, { writable: false, enumerable: true }));
    Object.defineProperty(this, '_state', _.assign({ value: NC_UNKNOW_STATE }, baseProp, { writable: false, enumerable: true }));
    Object.defineProperty(this, '_freebird', _.assign({ value: null }, baseProp));      // set@fb register
    Object.defineProperty(this, '_joinTimer', _.assign({ value: null }, baseProp));     // set@permitJoin
    Object.defineProperty(this, '_joinTicks', _.assign({ value: 0 }, baseProp));        // set@permitJoin
    Object.defineProperty(this, '_resetting', _.assign({ value: false }, baseProp));    // set@reset

    Object.defineProperty(this, '_controller', _.assign({ value: controller }, baseProp, { writable: false }));
    Object.defineProperty(this, '_net', _.assign({ value: netInfo }, baseProp, { writable: false }));

    // Leave an option section for some flexibility
    if (opt) {
        // Currently, do nothing
    }

    this.extra = null;

    /**************************************************************************************************/
    /*** Developer should implement, check@start                                                    ***/
    /**************************************************************************************************/
    this._cookRawDev = null;    // function(dev, rawDev, done) { done(err, dev); }
    this._cookRawGad = null;    // function(gad, rawGad, done) { done(err, gad); }

    Object.defineProperty(this, 'cookRawDev', _.assign({
        value: function (dev, rawDev, done) {
            if (_.isFunction(this._cookRawDev))
                this._cookRawDev(dev, rawDev, done);
            else
                setImmediate(done, new Error('_cookRawDev() is not implemented'));
        }
    }, baseProp, { writable: false, enumerable: true }));

    Object.defineProperty(this, 'cookRawGad', _.assign({
        value: function (gad, rawGad, done) {
            if (_.isFunction(this._cookRawGad))
                this._cookRawGad(gad, rawGad, done);
            else
                setImmediate(done, new Error('_cookRawGad() is not implemented'));
        }
    }, baseProp, { writable: false, enumerable: true }));

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
    }, baseProp, { writable: false }));

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
            validate.string(permAddr, 'permAddr should be a string.');
            if (!this.isBlacklisted(permAddr))
                __blacklist.push(permAddr);
            return this;
        }
    }, baseProp, { writable: false }));

    Object.defineProperty(this, '_unblock', _.assign({
        value: function (permAddr) {
            validate.string(permAddr, 'permAddr should be a string.');
            _.remove(__blacklist, function (n) {
                return n === permAddr;
            });
            return this;
        }
    }, baseProp, { writable: false }));

    // called by commitReady()
    Object.defineProperty(this, '_onReady', _.assign({
        value: function () {
            var self = this;

            if (this._resetting) {
                this.start(function (err) {
                    this._resetting = false;

                    if (err)
                        self._fireup(BTM_EVTS.NcError, { error: err });
                    else if (_.isFunction(this.onReady))
                        self.onReady();
                });
            } else if (_.isFunction(this.onReady)) {
                this.onReady();
            }
        }
    }, baseProp, { writable: false }));
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
    return (this._joinTicks > 0);
};

Netcore.prototype.enable = function () {
    if (!this.isEnabled()) {
        this._net.enabled = true;
        this._fireup(BTM_EVTS.NcEnabled, {});
    }
    return this;
};

Netcore.prototype.disable = function () {
    var self = this;

    if (this.isEnabled()) {
        this.permitJoin(0, function (err) { // call permitJoin(0) to reject all device joining
            if (err)
                self._fireup(BTM_EVTS.NcError, { error: err });
        });

        this._net.enabled = false;
        this._fireup(BTM_EVTS.NcDisabled, {});
    }
    return this;
};

Netcore.prototype.getName = function () {
    return this.name;
};

// [TODO] Should fix in the future 
//        netcore itself has traffic too, not taken into account here
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

    _.forEach(allDevs, function (dev) {
        dev.resetTraffic(dir);
    });

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
        start = this._findDriver('net', 'start'),
        cb;

    validate.cookers(this);
    validate.drivers(this);
    if (!_.isNil(callback))
        validate.fn(callback, 'callback should be a function if given');

    cb = function (err) {
        if (!err) {
            self._net.startTime = Math.floor(Date.now()/1000);  // seconds
            self.enable();
            this._state = NC_NORMAL_STATE;
            self._fireup(BTM_EVTS.NcStarted, {});
            self._fireup(BTM_EVTS.NcReady, {});
        } else {
            self._fireup(BTM_EVTS.NcError, { error: err });
        }

        if (_.isFunction(callback))
            callback(err);
    };

    // Dont check enabled or not
    if (!_.isFunction(start))
        setImmediate(cb, new Error('Driver start is not implemented'));
    else
        start(cb);
};

Netcore.prototype.stop = function (callback) {
    var self = this,
        stop = this._findDriver('net', 'stop'),
        cb;

    if (!_.isNil(callback))
        validate.fn(callback, 'callback should be a function if given');

    cb = function (err) {
        if (!err) {
            self._fireup(BTM_EVTS.NcStopped, {});
            this._state = NC_UNKNOW_STATE;
            self.disable(); // Must diable afrer NcStopped emitted, or event will be blocked
        } else {
            self._fireup(BTM_EVTS.NcError, { error: err });
        }

        if (_.isFunction(callback))
            callback(err);
    };

    if (!this.isEnabled())
        setImmediate(cb, new Error('Netcore not enabled'));
    else if (!_.isFunction(stop))
        setImmediate(cb, new Error('Driver stop is not implemented'));
    else
        stop(cb);
};

// [TODO] NOT TEST YET
Netcore.prototype.reset = function (mode, callback) {
    var self = this,
        reset = this._findDriver('net', 'reset'),
        cb;

    if (_.isFunction(mode)) {
        callback = mode;
        mode = false;
    } else {
        mode = !!mode;
    }

    mode = mode ? 1 : 0;
    validate.argTypes({ callback: callback });

    cb = function (err) {
        if (!err) {
            // if no err, also clear blacklist (SOFT/HARD will both clear blacklist)
            // why clear here: clear when reset is definitely success, or blacklist gone is gone
            self.clearBlacklist();
        } else {
            self._resetting = false;
            self.enable();
            self._fireup(BTM_EVTS.NcError, { error: err });
        }

        if (_.isFunction(callback))
            callback(err);
    };

    if (!_.isFunction(reset)) {
        setImmediate(cb, new Error('Driver reset is not implemented'));
    } else {
        this.stop(function (err) {  // this will stop and disable netcore
            if (err) {
                cb(err);
            } else {
                self._resetting = true;
                reset(mode, cb);
            }
        });
    }
};

Netcore.prototype.permitJoin = function (duration, callback) {  // callback is optional
    var self = this,
        permitJoin = this._findDriver('net', 'permitJoin'),
        cb;

    validate.number(duration, 'duration should be an integer in seconds.');
    duration = _.parseInt(duration, 10);

    if (!_.isNil(callback))
        validate.fn(callback, 'callback should be a function if given');

    cb = function (err, timeLeft) {
        if (!err) {
            startJoinTimer(self, duration);
        } else {
            self._fireup(BTM_EVTS.NcError, { error: err });
        }

        if (_.isFunction(callback))
            callback(err, timeLeft);
    };

    if (!this.isEnabled())
        setImmediate(cb, new Error('Netcore not enabled'));
    else if (!_.isFunction(permitJoin))
        setImmediate(cb, new Error('Driver permitJoin is not implemented'));
    else
        permitJoin(duration, cb);
};

Netcore.prototype.remove = function (permAddr, callback) {
    var self = this,
        remove = this._findDriver('net', 'remove'),
        ncName = this.getName(),
        freebird = this._freebird,
        dev = freebird ? freebird.findByNet('device', ncName, permAddr) : undefined,
        cb;

    validate.argTypes({ permAddr: permAddr });

    if (!_.isNil(callback))
        validate.fn(callback, 'callback should be a function if given');

    if (dev)
        dev._removing = true;

    cb = function (err, pAddr) {
        if (err) {
            if (dev)
                dev._removing = false;
            self._fireup(BTM_EVTS.NcError, { error: err });
        }

        if (_.isFunction(callback))
            callback(err, pAddr);
    };

    if (!this.isEnabled())
        setImmediate(cb, new Error('Netcore not enabled'));
    else if (!_.isFunction(remove))
        setImmediate(cb, new Error('Driver remove is not implemented'));
    else
        remove(permAddr, cb);
};

Netcore.prototype.ban = function (permAddr, callback) {
    var self = this,
        ban = this._findDriver('net', 'ban'),
        cb;

    validate.argTypes({ permAddr: permAddr, callback: callback });

    cb = function (err, pAddr) {
        if (err) {
            self._fireup(BTM_EVTS.NcError, { error: err });
        } else {
            self._block(permAddr);  // block at netcore as well
            self._fireup(BTM_EVTS.NcNetBan, { permAddr: pAddr || permAddr });
        }

        callback(err, pAddr);
    };

    if (!this.isEnabled()) {
        setImmediate(cb, new Error('Netcore not enabled'));
    } else if (!_.isFunction(ban)) {   // use default blocker
        this._block(permAddr);
        setImmediate(cb, null, permAddr);
    } else {
        ban(permAddr, cb);
    }
};

Netcore.prototype.unban = function (permAddr, callback) {
    var self = this,
        unban = this._findDriver('net', 'unban'),
        cb;

    validate.argTypes({ permAddr: permAddr, callback: callback });

    cb = function (err, pAddr) {
        if (err) {
            self._fireup(BTM_EVTS.NcError, { error: err });
        } else {
            self._unblock(permAddr);  // unblock at netcore as well
            self._fireup(BTM_EVTS.NcNetUnban, { permAddr: pAddr || permAddr });
        }

        callback(err, pAddr);
    };

    if (!this.isEnabled()) {
        setImmediate(cb, new Error('Netcore not enabled'));
    } else if (!_.isFunction(unban)) {  // use default blocker
        this._unblock(permAddr);
        setImmediate(cb, null, permAddr);
    } else {
        unban(permAddr, cb);
    }
};

Netcore.prototype.ping = function (permAddr, callback) {
    var self = this,
        ping = this._findDriver('net', 'ping'),
        cb;

    validate.argTypes({ permAddr: permAddr, callback: callback });

    cb = function (err, time) {
        if (err)
            self._fireup(BTM_EVTS.NcError, { error: err });
        else
            self._fireup(BTM_EVTS.NcNetPing, { permAddr: permAddr, data: time });

        callback(err, time);
    };

    if (!this.isEnabled())
        setImmediate(cb, new Error('Netcore not enabled'));
    else if (!_.isFunction(ping))
        setImmediate(cb, new Error('Driver ping is not implemented'));
    else
        ping(permAddr, cb);
};

Netcore.prototype.maintain = function (callback) {  // callback is optional
    var self = this,
        devs,
        cbCalled = false,
        freebird = this._freebird;

    callback = callback || function (err, maintained) {
        if (err)
            self._fireup(BTM_EVTS.NcError, { error: err });
    };

    if (!_.isFunction(callback))
        throw new TypeError('callback should be a function if given');

    if (!freebird)
        return setImmediate(callback, new Error('Cannot maintain. Netcore is not registered properly'));
    else if (!this.isEnabled())
        return setImmediate(callback, null);    // netcore disabled, no need to maintain

    devs = freebird.filter('device', function (dev) {
        return dev.get('netcore') === self;
    });

    function keepDevSyncing() {
        var dev;

        if (cbCalled)
            return;

        if (devs.length === 0) {
            cbCalled = true;
            return callback(null);
        }

        dev = devs.pop();

        dev.maintain(function (err) {
            keepDevSyncing();   // don't care error, keep syncing
        });
    }
};

/***********************************************************************/
/*** Developer Should Call When Build a Netcore                      ***/
/***********************************************************************/
Netcore.prototype.commitReady = function () {
    this.enable();
    this._onReady();
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

    return this._fireup(BTM_EVTS.NcDevNetChanging, { permAddr: permAddr, data: changes });
};

Netcore.prototype.commitDevIncoming = function (permAddr, rawDev) {
    validate.argTypes({ permAddr: permAddr, rawDev: rawDev });
    if (!this.isEnabled())  // nc disabled, ignore all messages
        return false;

    return this.isBlacklisted(permAddr) ?
        this._fireup(BTM_EVTS.NcBannedDevIncoming, { permAddr: permAddr, raw: rawDev }) :
        this._fireup(BTM_EVTS.NcDevIncoming, { permAddr: permAddr, raw: rawDev });
        // cook@freebird, check cooker@freebird, not here
        // check nc.joinable@freebird, if not joinable and not a registered devce, ignored@freebird
        // tell freebird here comes a new device, register@freebird and let freebird find changes
};

Netcore.prototype.commitDevLeaving = function (permAddr) {
    validate.string(permAddr, 'permAddr should be a string.');
    return this.isEnabled() ?
        this._fireup(BTM_EVTS.NcDevLeaving, { permAddr: permAddr }) : // unregister@freebird, kill instance
        false;
};

Netcore.prototype.commitGadIncoming = function (permAddr, auxId, rawGad) {
    validate.argTypes({ permAddr: permAddr, auxId: auxId, rawGad: rawGad });
    if (!this.isEnabled())
        return false;

    return this.isBlacklisted(permAddr) ? 
        this._fireup(BTM_EVTS.NcBannedGadIncoming, { permAddr: permAddr, auxId: auxId, raw: rawGad }) : // tell freebird here comes a gadget on a banned device
        this._fireup(BTM_EVTS.NcGadIncoming, { permAddr: permAddr, auxId: auxId, raw: rawGad });        // tell freebird here comes a new gadget, register@freebird
};

Netcore.prototype.commitDevReporting = function (permAddr, devAttrs) {
    validate.argTypes({ permAddr: permAddr, devAttrs: devAttrs });
    if (!this.isEnabled())
        return false;

    return this.isBlacklisted(permAddr) ?
        this._fireup(BTM_EVTS.NcBannedDevReporting, { permAddr: permAddr, data: devAttrs }) :
        this._fireup(BTM_EVTS.NcDevReporting, { permAddr: permAddr, data: devAttrs });        // user should commit devAttrs with correct format
};

Netcore.prototype.commitGadReporting = function (permAddr, auxId, gadAttrs) {
    validate.argTypes({ permAddr: permAddr, auxId: auxId, gadAttrs: gadAttrs });
    if (!this.isEnabled())
        return false;

    return this.isBlacklisted(permAddr) ?
        this._fireup(BTM_EVTS.NcBannedGadReporting, { permAddr: permAddr, auxId: auxId, data: gadAttrs, appendFlag: false }) :
        this._fireup(BTM_EVTS.NcGadReporting, { permAddr: permAddr, auxId: auxId, data: gadAttrs });  // user should commit devAttrs with correct format
};

Netcore.prototype.dangerouslyCommitGadReporting = function (permAddr, auxId, gadAttrs) {
    validate.argTypes({ permAddr: permAddr, auxId: auxId, gadAttrs: gadAttrs });
    if (!this.isEnabled())
        return false;

    return this.isBlacklisted(permAddr) ?
        this._fireup(BTM_EVTS.NcBannedGadReporting, { permAddr: permAddr, auxId: auxId, data: gadAttrs }) :
        this._fireup(BTM_EVTS.NcGadReporting, { permAddr: permAddr, auxId: auxId, data: gadAttrs, appendFlag: true });    // user should commit devAttrs with correct format
};

/*************************************************************************************************/
/*** Netcore Protected APIs                                                                    ***/
/*************************************************************************************************/
Netcore.prototype._fireup = function (evt, data) {
    var self = this,
        emitData = {};

    if (!this.isRegistered())
        return false;   // not emitted

    if (!this.isEnabled() && evt !== BTM_EVTS.NcDisabled)
        return false;   // ignore errors, except a 'nc disabled' thing

    _.assign(emitData, data || {}, { ncName: this.getName() });

    self._freebird._fire(evt, emitData);

    return true;    // emitted
};  // { ncName: 'xxx', ... }, { ncName: 'xxx'[, id: 51], error: err }

Netcore.prototype._findDriver = function (type, name) {
    var drvFolder = this._drivers[type];
    return drvFolder ? drvFolder[name] : undefined;
};

/***********************************************************************/
/*** Private Functions                                               ***/
/***********************************************************************/
function registerDrivers(nc, namespace, drvs) {
    if (!_.isObject(drvs) || _.isArray(drvs) || _.isFunction(drvs))
        throw new TypeError('Drivers should be wrapped in an object.');
    else if (!_.isEmpty(drvs) && !_.every(drvs, _.isFunction))
        throw new TypeError('Every driver must be a function.');

    _.assign(nc._drivers[namespace], drvs);
    return nc;
}

function clearJoinTimer(nc) {
    nc._joinTicks = 0;

    if (nc._joinTimer) {
        clearInterval(nc._joinTimer);
        nc._fireup(BTM_EVTS.NcPermitJoin, { timeLeft: 0 });
    }
}

function startJoinTimer(nc, duration) {
    clearJoinTimer(nc);
    nc._joinTicks = duration;

    if (nc._joinTicks > 0) {
        nc._fireup(BTM_EVTS.NcPermitJoin, { timeLeft: nc._joinTicks });

        nc._joinTimer = setInterval(function () {
            nc._joinTicks -= 1;

            if (nc._joinTicks === 0)
                clearJoinTimer(nc);
            else
                nc._fireup(BTM_EVTS.NcPermitJoin, { timeLeft: nc._joinTicks });
        }, 1000);
    } else {
        nc._joinTicks = 0;
        nc._fireup(BTM_EVTS.NcPermitJoin, { timeLeft: 0 });
    }
}

module.exports = Netcore;
