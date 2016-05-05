// [TODO] check offline while remote requesting
var _ = require('lodash'),
    utils = require('./utils');

var netMandatoryDrvs = [ 'start', 'stop', 'reset', 'permitJoin', 'remove', 'ping' ],
    netOptionalDrvs = [ 'ban', 'unban' ],
    devMandatoryDrvs = [ 'read', 'write' ],
    devOptionalDrvs = [ 'identify' ],
    gadMandatoryDrvs = [ 'read', 'write' ],
    gadOptionalDrvs = [ 'exec', 'setReportCfg', 'getReportCfg' ];

function Netcore(name, controller, protocol, opt) {
    if (!_.isString(name)) throw new Error('Netcore name should be a string.');
    if (_.isNil(controller)) throw new Error('controller should be given.');
    if (!_.isPlainObject(protocol)) throw new Error('protocol should be an object.');

    if (!_.isString(protocol.phy) || !_.isString(protocol.nwk))
        throw new Error("Both 'phy' and 'nwk' layers name should be given.");

    var __blacklist = [];
    this._fb = null;        // set@fb register
    this._joinTimer = null; // set@permitJoin
    this._joinTicks = 0;    // set@permitJoin

    this._controller = controller;

    this._net = {
        name: name,
        enabled: false,
        protocol: protocol,
        startTime: 0,
        defaultJoinTime: 180,
        traffic: {
            in: { hits: 0, bytes: 0 },
            out: { hits: 0, bytes: 0 }
        }
    };

    // option section for some flexibility
    if (opt) {
        this._net.defaultJoinTime = opt.defaultJoinTime || this._net.defaultJoinTime;
    }

    this.extra = null;

    /*************************************************************************************/
    /*** Developer overrides, check@start                                              ***/
    /*************************************************************************************/
    /***                                                                               ***/
        this.cookRawDev = null; // function(dev, rawDev, callback) { callback(err, dev); }
        this.cookRawGad = null; // function(gad, rawGad, callback) { callback(err, gad); }
    /***                                                                               ***/
    /*************************************************************************************/
    /*** Developer registers, check@start                                              ***/
    /*************************************************************************************/
        this._drivers = {
            net: {
                start: null,        // function(callback) {}, callback(err)
                stop: null,         // function(callback) {}, callback(err)
                reset: null,        // function(mode, callback) {}, callback(err)
                permitJoin: null,   // function(duration, callback) {}, callback(err)
                remove: null,       // function(permAddr, callback) {}, callback(err)
                ban: null,          // function(permAddr, callback) {}, callback(err)
                unban: null,        // function(permAddr, callback) {}, callback(err)
                ping: null          // function(permAddr, callback) {}, callback(err)
            },
            dev: {
                read: null,         // function(permAddr, attr, callback) {}, callback(err)
                write: null,        // function(permAddr, attr, val, callback) {}, callback(err)
                identify: null,     // function(permAddr, callback) {}, callback(err)
            },
            gad: {
                read: null,         // function(permAddr, auxId, attr, callback) {}, callback(err)
                write: null,        // function(permAddr, auxId, attr, val, callback) {}, callback(err)
                exec: null,         // function(permAddr, auxId, attr, args, callback) {}, callback(err)
                setReportCfg: null, // function(permAddr, auxId, cfg, callback) {}, callback(err)
                getReportCfg: null, // function(permAddr, auxId, callback) {}, callback(err)
            }
        };
    /***                                                                               ***/
    /*************************************************************************************/

    this.getBlacklist = function () {
        return _.cloneDeep(__blacklist);
    };

    this.clearBlacklist = function () {
        __blacklist = null;
        __blacklist = [];
        return this;
    };

    this.isBlacklisted = function (permAddr) {
        if (!_.isString(permAddr))
            throw new TypeError('permAddr should be a string.');

        return _.includes(__blacklist, permAddr);
    };

    this._block = function (permAddr) {
        if (!this.isBlacklisted(permAddr))
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

/***********************************************************************/
/*** Protected Methods                                               ***/
/***********************************************************************/
Netcore.prototype._fbEmit = function (evt, data) {
    var emitData,
        emitted = false,
        isErrEvt = (evt === '_nc:error') || (evt === '_dev:error') || (evt === '_gad:error');

    if (!isErrEvt) {
        data = data || {};
        emitData = _.assign(data, {
            netcore: this
        });
    } else {
        // if error, give error object, and attach information to err.info
        emitData = data.error;
        delete data.error;
        emitData.info =  _.assign(data, { netcore: this.getName() });
    }

    if (this.isRegistered()) {
        this._fb.emit(evt, emitData);
        emitted = true;
    }

    return emitted;
};

Netcore.prototype._incTxBytes = function (num) {
    this._net.traffic.out.bytes += num;
    this._net.traffic.out.hits += 1;

    return this._net.traffic.out.bytes;
};

Netcore.prototype._incRxBytes = function (num) {
    this._net.traffic.in.bytes += num;
    this._net.traffic.in.hits += 1;

    return this._net.traffic.in.bytes;
};

Netcore.prototype._startJoinTimer = function (duration) {
    var self = this;

    this._clearJoinTimer();
    this._joinTicks = duration;

    if (this._joinTicks) {
        this._joinTimer = setInterval(function () {
            self._joinTicks = self._joinTicks - 1;
            self._fbEmit('_nc:permitJoin', { timeLeft: self._joinTicks });
            
            if (self._joinTicks === 0) 
                self._clearJoinTimer();
        }, 1000);
    } else {
        this._fbEmit('_nc:permitJoin', { timeLeft: 0 });
    }

};

Netcore.prototype._clearJoinTimer = function () {
    this._joinTicks = 0;

    if (this._joinTimer) {
        clearInterval(this._joinTimer);
        this._fbEmit('_nc:permitJoin', { timeLeft: 0 });
    }
};

Netcore.prototype._findDriver = function (type, name) {
    var drvFolder = this._drivers[type];

    if (drvFolder)
        return drvFolder[name];
    else
        return;
};

Netcore.prototype._checkBadDrivers = function () {
    var netDrvs = this._drivers.net,
        devDrvs = this._drivers.dev,
        gadDrvs = this._drivers.gad,
        badDrvs = [];

    _.forEach(netMandatoryDrvs, function (name) {
        if (!_.isFunction(netDrvs[name]))
            badDrvs.push('net.' + name);
    });

    _.forEach(devMandatoryDrvs, function (name) {
        if (!_.isFunction(devDrvs[name]))
            badDrvs.push('dev.' + name);
    });

    _.forEach(gadMandatoryDrvs, function (name) {
        if (!_.isFunction(gadDrvs[name]))
            badDrvs.push('gad.' + name);
    });

    return badDrvs;
};

/***********************************************************************/
/*** Public APIs                                                     ***/
/***********************************************************************/
Netcore.prototype.isRegistered = function () {
    return !!this._fb;
};

Netcore.prototype.isJoinable = function () {
    return (this._joinTicks !== 0);
};

Netcore.prototype.isEnabled = function () {
    return this._net.enabled;
};

Netcore.prototype.enable = function () {
    if (!this.isEnabled()) {
        this._net.enabled = true;
        this._fbEmit('_nc:enabled');
    }

    return this;
};

Netcore.prototype.disable = function () {
    var self = this;

    // call permitJoin(0) to reject all device joining
    this.permitJoin(0, function (err, result) {
        if (err) {
            self._fbEmit('_nc:error', { error: err });
        } else if (self.isEnabled()) {
            self._net.enabled = false;
            self._fbEmit('_nc:disabled');
        }
    });

    return this;
};

Netcore.prototype.dump = function () {
    return _.cloneDeep(this._net);
};

Netcore.prototype.getName = function () {
    return this._net.name;
};

Netcore.prototype.getTraffic = function () {
    return _.cloneDeep(this._net.traffic);
};

Netcore.prototype.resetTxTraffic = function () {
    this._net.traffic.out.bytes = 0;
    this._net.traffic.out.hits = 0;

    return this;
};

Netcore.prototype.resetRxTraffic = function () {
    this._net.traffic.in.bytes = 0;
    this._net.traffic.in.hits = 0;

    return this;
};

Netcore.prototype._registerDrivers = function (space, drvs) {
    if (!_.isString(space))
        throw new TypeError('space should be a string.');
    else if (!_.isObject(drvs) || _.isArray(drvs) || _.isFunction(drvs))
        throw new TypeError('Drivers should be wrapped in an object.');
    else if (!_.isEmpty(drvs) && !_.every(drvs, _.isFunction))
        throw new TypeError('Every driver should be a function.');
    else
        _.assign(this._drivers[space], drvs);  // attach drivers

    return this;
};

Netcore.prototype.registerNetDrivers = function (drvs) {
    return this._registerDrivers('net', drvs);
};

Netcore.prototype.registerDevDrivers = function (drvs) {
    return this._registerDrivers('dev', drvs);
};

Netcore.prototype.registerGadDrivers = function (drvs) {
    return this._registerDrivers('gad', drvs);
};

/***********************************************************************/
/*** Developer Calls                                                 ***/
/***********************************************************************/
Netcore.prototype.commitDevIncoming = function (permAddr, rawDev) {
    var err = checkArgTypes({ permAddr: permAddr, rawDev: rawDev });
    if (err)
        throw err;

    var committed = true;

    if (!this.isEnabled()) { // nc disabled, ignore all messages
        committed = false;
        return committed;
    } else if (this.isBlacklisted(permAddr)) {
        this._fbEmit('_nc:bannedDevIncoming', { permAddr: permAddr, raw: rawDev });
    } else {
        // cook@fb, check cooker@fb, not here
        // check nc.joinable@fb, if not joinable and not a registered devce, ignored@fb
        // tell fb here comes a new device, register@fb and let fb find changes
        this._fbEmit('_nc:devIncoming', { permAddr: permAddr, raw: rawDev });
    }

    return committed;
};

Netcore.prototype.commitDevLeaving = function (permAddr) {
    var committed = false;

    if (!_.isString(permAddr))
        throw new TypeError('permAddr should be a string.');

    if (!this.isEnabled()) {
        return committed;
    } else {
        this._fbEmit('_nc:devLeaving', { permAddr: permAddr }); // unregister@fb, kill instance
        committed = true;
    }

    return committed;
};

Netcore.prototype.commitGadIncoming = function (permAddr, auxId, rawGad) {
    var err = checkArgTypes({ permAddr: permAddr, auxId: auxId, rawGad: rawGad }),
        committed = true;

    if (err)
        throw err;

    if (!this.isEnabled())  {
        committed = false;
        return committed;
    } else if (this.isBlacklisted(permAddr)) {
        // tell fb here comes a gadget on a banned device
        this._fbEmit('_nc:bannedGadIncoming', { permAddr: permAddr, auxId: auxId, raw: rawGad });
    } else {
        // tell fb here comes a new gadget, register@fb
        this._fbEmit('_nc:gadIncoming', { permAddr: permAddr, auxId: auxId, raw: rawGad });
    }

    return committed;
};

Netcore.prototype.commitDevReporting = function (permAddr, devAttrs) {
    var err = checkArgTypes({ permAddr: permAddr, devAttrs: devAttrs }),
        committed = true;

    if (err)
        throw err;

    if (!this.isEnabled()) {
        committed = false;
        return committed;
    } else if (this.isBlacklisted(permAddr)) {
        this._fbEmit('_nc:bannedDevReporting', { permAddr: permAddr, data: devAttrs });
    } else {
        // user should commit devAttrs with correct format
        this._fbEmit('_nc:devReporting', { permAddr: permAddr, data: devAttrs });
    }

    return committed;
};

Netcore.prototype.commitGadReporting = function (permAddr, auxId, gadAttrs) {
    var err = checkArgTypes({ permAddr: permAddr, auxId: auxId, gadAttrs: gadAttrs }),
        committed = true;

    if (err)
        throw err;

    if (!this.isEnabled()) {
        committed = false;
        return committed;
    } else if (this.isBlacklisted(permAddr)) {
        this._fbEmit('_nc:bannedGadReporting', { permAddr: permAddr, auxId: auxId, data: gadAttrs });
    } else {
        // user should commit devAttrs with correct format
        this._fbEmit('_nc:gadReporting', { permAddr: permAddr, auxId: auxId, data: gadAttrs });
    }

    return committed;
};

/***********************************************************************/
/*** Drivers                                                         ***/
/***********************************************************************/
Netcore.prototype.start = function (callback) {
    var self = this,
        args = [],
        err,
        badDrvsName = '', 
        badDrvs = this._checkBadDrivers(),
        areDrvsReady = (badDrvs.length === 0),
        drvStart = this._findDriver('net', 'start');

    callback = callback || function () {};

    if (!areDrvsReady) {
        _.forEach(badDrvs, function (name) {
            badDrvsName = badDrvsName + name + ', ';
        });

        err = new Error('Mandatory driver(s): ' + badDrvsName + 'not implemented.');
        this._fbEmit('_nc:error', { error: err });
        return callback(err);
    } else if (!_.isFunction(this.cookRawDev)) {
        err = new Error('cookRawDev() not implemented.');
        this._fbEmit('_nc:error', { error: err });
        return callback(err);
    } else if (!_.isFunction(this.cookRawGad)) {
        err = new Error('cookRawGad() not implemented.');
        this._fbEmit('_nc:error', { error: err });
        return callback(err);
    } else {
        this._callDriver('net', 'start', args, callback, function (err, result) {
            if (!err) {
                self._net.startTime = utils.nowSeconds();
                self.enable();
                self._fbEmit('_nc:started');
            }
        });
    }
};

Netcore.prototype.stop = function (callback) {
    var self = this,
        args = [];

    this._callDriver('net', 'stop', args, callback, function (err, result) {
        if (!err) {
            self.disable();
            self._fbEmit('_nc:stopped');
        }
    });
};

// [TODO]
Netcore.prototype.reset = function (mode, callback) {
    var self = this,
        args = [];

    if (_.isFunction(mode)) {
        callback = mode;
        mode = 0;
    } else {
        mode = !!mode;
    }

    args.push(mode);

    if (mode)   // hard reset
        this.clearBlacklist();

    // this.disable(); -- [TODO] cannot disable here, dead loop

    // [TODO] reset logic?
    this._callDriver('net', 'reset', args, callback, function (err, result) {
        if (!err)
            self.start();
    });
};

Netcore.prototype.permitJoin = function (duration, callback) {
    var self = this,
        args;

    if (_.isFunction(duration)) {
        callback = duration;
        duration = this._net.defaultJoinTime;
    } else if (!_.isNumber(duration)) {
        throw new TypeError('duration should be a number in seconds.');
    }

    args = [ duration ];

    this._callDriver('net', 'permitJoin', args, callback, function (err) {
        if (!err)
            self._startJoinTimer(duration);
    });
};

Netcore.prototype.remove = function (permAddr, callback) {
    var self = this,
        args = [ permAddr ];

    if (!_.isString(permAddr))
        throw new TypeError('permAddr should be a string.');

    this._callDriver('net', 'remove', args, callback, function (err, result) {
        if (!err)
            self._fbEmit('_nc:devLeaving', { permAddr: permAddr });
    });
};

Netcore.prototype.ban = function (permAddr, callback) {
    var self = this,
        err,
        drvBan;

    if (!_.isString(permAddr))
        throw new TypeError('permAddr should be a string.');

    drvBan = this._findDriver('net', 'ban');
    callback = callback || function () {};

    if (!this.isEnabled()) {
        err = new Error('Netcore not enabled.');
        return callback(err);
    }

    if (_.isFunction(drvBan)) {
        drvBan(permAddr, function (er, result) {
            if (er) {
                callback(er);
                self._fbEmit('_nc:error', { error: er });
            } else {
                self._block(permAddr);
                callback(null, permAddr);
                self._fbEmit('_nc:netBan', { permAddr: permAddr });
            }
        });
    } else {
        self._block(permAddr);
        callback(null, permAddr);
        self._fbEmit('_nc:netBan', { permAddr: permAddr });
    }
};

Netcore.prototype.unban = function (permAddr, callback) {
    var self = this,
        err,
        drvUnban;

    if (!_.isString(permAddr))
        throw new TypeError('permAddr should be a string.');

    drvUnban = this._findDriver('net', 'unban');
    callback = callback || function () {};

    if (!this.isEnabled()) {
        err = new Error('Netcore not enabled.');
        return callback(err);
    }

    if (_.isFunction(drvUnban)) {
        drvUnban(permAddr, function (er, result) {
            if (er) {
                callback(er);
                self._fbEmit('_nc:error', { error: er });
            } else {
                self._unblock(permAddr);
                callback(null, permAddr);
                self._fbEmit('_nc:netUnban', { permAddr: permAddr });
            }
        });
    } else {
        self._unblock(permAddr);
        callback(null, permAddr);
        self._fbEmit('_nc:netUnban', { permAddr: permAddr });
    }
};

Netcore.prototype.ping = function (permAddr, callback) {
    var err = checkArgTypes({ permAddr: permAddr, callback: callback }),
        self = this,
        args;

    if (err)
        throw err;

    args = [ permAddr ];

    this._callDriver('net', 'ping', args, callback, function (err, result) {
        if (!err)
            self._fbEmit('_nc:netPing', { permAddr: permAddr, data: result });
    });
};

Netcore.prototype.devRead = function (permAddr, attrName, callback) {
    var err = checkArgTypes({ permAddr: permAddr, attrName: attrName, callback: callback }),
        self = this,
        args;

    if (err)
        throw err;

    args = [ permAddr, attrName ];

    this._callDriver('dev', 'read', args, callback, function (err, result) {
        // BE CAREFUL: EMIT { x: xxx }
        var data = {};
        if (!err) {
            data = _.set(data, attrName, result);
            self._fbEmit('_nc:devRead', { permAddr: permAddr, data: data });
        }
    });
};

Netcore.prototype.devWrite = function (permAddr, attrName, val, callback) {
    var err = checkArgTypes({ permAddr: permAddr, attrName: attrName, val: val }),
        self = this,
        args;

    if (err)
        throw err;

    args = [ permAddr, attrName, val ];

    this._callDriver('dev', 'write', args, callback, function (err, result) {
        var data = {};
        if (!err) {
            if (_.isNil(result))
                data = _.set(data, attrName, val);
            else
                data = _.set(data, attrName, result);

            self._fbEmit('_nc:devWrite', { permAddr: permAddr, data: data });
        }
    });
};

Netcore.prototype.identify = function (permAddr, callback) {
    var self = this,
        args;

    if (!_.isString(permAddr))
        throw new TypeError('permAddr should be a string.');

    args = [ permAddr ];

    this._callDriver('dev', 'identify', args, callback, function (err, result) {
        if (!err)
            self._fbEmit('_nc:devIdentify', { permAddr: permAddr });
    });
};

Netcore.prototype.gadRead = function (permAddr, auxId, attrName, callback) {
    var err = checkArgTypes({ permAddr: permAddr, auxId: auxId, attrName: attrName, callback: callback }),
        self = this,
        args;

    if (err)
        throw err;

    args = [ permAddr, auxId, attrName ];

    this._callDriver('gad', 'read', args, callback, function (err, result) {
        var data = {};
        if (!err) {
            data = _.set(data, attrName, result);
            self._fbEmit('_nc:gadRead', { permAddr: permAddr, auxId: auxId, data: data });
        }
    });
};

Netcore.prototype.gadWrite = function (permAddr, auxId, attrName, val, callback) {
    var err = checkArgTypes({ permAddr: permAddr, auxId: auxId, attrName: attrName, val: val }),
        self = this,
        args;

    if (err)
        throw err;

    args = [ permAddr, auxId, attrName, val ];

    this._callDriver('gad', 'write', args, callback, function (err, result) {
        var data = {};
        if (!err) {
            if (_.isNil(result))
                data = _.set(data, attrName, val);
            else
                data = _.set(data, attrName, result);

            self._fbEmit('_nc:gadWrite', { permAddr: permAddr, auxId: auxId, data: data });
        }
    });
};

Netcore.prototype.gadExec = function (permAddr, auxId, attrName, args, callback) {
    var err = checkArgTypes({ permAddr: permAddr, auxId: auxId, attrName: attrName }),
        self = this,
        argms;

    if (err)
        throw err;

    if (_.isFunction(args)) {
        callback = args;
        args = undefined;
    }

    args = args || [];

    if (!_.isArray(args))
        throw new TypeError('args should be an array of parameters.');

    argms = [ permAddr, auxId, attrName, args ];

    this._callDriver('gad', 'exec', argms, callback, function (err, result) {
        var data = {};
        if (!err) {
            data = _.set(data, attrName, result);
            self._fbEmit('_nc:gadExec', { permAddr: permAddr, auxId: auxId, data: data });
        }
    });
};

Netcore.prototype.setReportCfg = function (permAddr, auxId, attrName, cfg, callback) {
    var err = checkArgTypes({ permAddr: permAddr, auxId: auxId, attrName: attrName, cfg: cfg }),
        self = this,
        args;

    if (err)
        throw err;

    args = [ permAddr, auxId, attrName, cfg ];

    this._callDriver('gad', 'setReportCfg', args, callback, function (err, result) {
        var data = {};
        if (!err) {
            data = _.set(data, attrName, result);
            self._fbEmit('_nc:gadSetReportCfg', { permAddr: permAddr, auxId: auxId, data: data });
        }
    });
};

Netcore.prototype.getReportCfg = function (permAddr, auxId, attrName, callback) {
    var err = checkArgTypes({ permAddr: permAddr, auxId: auxId, attrName: attrName, callback: callback }),
        self = this,
        args;

    if (err)
        throw err;

    args = [ permAddr, auxId, attrName ];

    this._callDriver('gad', 'getReportCfg', args, callback, function (err, result) {
        var data = {};
        if (!err) {
            data = _.set(data, attrName, result);
            self._fbEmit('_nc:gadGetReportCfg', { permAddr: permAddr, auxId: auxId, data: data });
        }
    });
};

Netcore.prototype._callDriver = function (type, name, args, originCb, callback) {
    var self = this,
        err,
        driver = this._findDriver(type, name);

    originCb = originCb || function () {};

    if (type === 'net' && name === 'start') // when start, don't check isEnable(), or start will fail
        err = undefined;
    else if (!this.isEnabled())
        err = new Error('Netcore not enabled.');
    else if (!_.isFunction(driver))
        err = new Error(type + ' driver ' + name + '() not implemented');

    if (err) {
        this._fbEmit('_nc:error', { error: err });
        originCb(err);
        callback(err);
    } else {
        args.push(function (er, result) {  // inner callback
            originCb(er, result);
            callback(er, result);
        });
        driver.apply(this, args);
    }
};

// This api is for freebird framework wsApis use
Netcore.prototype._dumpNcInfo = function () {
    var freebird = this._fb,
        allDevs,
        allGads,
        info = this.dump();

    info.numDevs = 0;
    info.numGads = 0;
    delete info.defaultJoinTime;

    if (freebird) {
        allDevs = freebird.getAllDevs(this.getName());
        allGads = freebird.getAllGads(this.getName());
        info.numDevs = allDevs.length;
        info.numGads = allGads.length;
    }

    return info;
};

// Netcore.prototype._statusQuickCheck = function (permAddr, callback) {
//     var quickPing = this._findDriver('net', 'ping'),
//         checkerTimer;

//     if (!quickPing) {
//         callback(new Error('ping driver not found'));
//     } else {
//         quickPing(permAddr, function (err, time) {

//         });

//         checkerTimer = setTimeout(function () {

//         }, 1000);
//     }
// };

/***********************************************************************/
/*** Private Functions                                               ***/
/***********************************************************************/
function checkArgTypes(argsObj) {
    var err;

    for (var key in argsObj) {
        err = checkArgType(key, argsObj[key]);
        if (err)
            break;
    }

    return err;
}

function checkArgType(arg, val) {
    var err;

    switch (arg) {
        case 'permAddr':
        case 'attrName':
            if (!_.isString(val))
                err = new TypeError(arg + ' should be a string.');
            break;
        case 'auxId':
            if (!_.isString(val) && !_.isNumber(val))
                err = new TypeError('auxId should be a number or a string.');
            break;
        case 'cfg':
        case 'gadAttrs':
        case 'devAttrs':
            if (!_.isPlainObject(val))
                err = new TypeError(arg + ' should be an object.');
            break;
        case 'val':
            if (_.isFunction(val))
                err = new TypeError('val should not be a function.');
            else if (_.isUndefined(val))
                err = new TypeError('val should be given.');
            break;
        case 'callback':
            if (!_.isFunction(val))
                err = new TypeError('callback should be a function.');
            break;
        case 'rawGad':
        case 'rawDev':
            if (_.isUndefined(val))
                err = new TypeError(arg + ' should be given.');
            break;
        default:
            break;
    }

    return err;
}

module.exports = Netcore;
