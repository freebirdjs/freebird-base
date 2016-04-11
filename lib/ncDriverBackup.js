/***********************************************************************/
/*** Drivers                                                         ***/
/***********************************************************************/
Netcore.prototype.start = function (callback) {
    var self = this,
        err,
        badDrvsName = '', 
        badDrvs = this._checkBadDrivers(),
        areDrvsReady = (badDrvs.length === 0),
        drvStart = this._findDriver('net', 'start');

    callback = callback || function () {};

    if (!_.isFunction(drvStart)) {
        err = new Error('Driver start() not implemented');  // start driver is required, should throw error if not given
        this._fbEmit('_nc:error', { error: err });
        return callback(err);
    }

    if (!areDrvsReady) {
        _.forEach(badDrvs, function (name) {
            badDrvsName = name + ', ';
        });

        err = new Error('Mandatory driver(s): ' + badDrvsName + 'not implemented.');
        this._fbEmit('_nc:error', { error: err });
        return callback(err);
    }

    drvStart(function (er, result) {
        if (er) {
            self._fbEmit('_nc:error', { error: er });
            callback(er);
        } else {
            callback(null, result);
            self.enable();
            self._fbEmit('_nc:started');
        }
    });
};

Netcore.prototype.stop = function (callback) {
    var self = this,
        err,
        drvStop = this._findDriver('net', 'stop');

    callback = callback || function () {};

    if (!_.isFunction(drvStop)) {
        err = new Error('Driver stop() not implemented');
        this._fbEmit('_nc:error', { error: err });
        return callback(err);
    }

    drvStop(function (er, result) {
        if (er) {
            self._fbEmit('_nc:error', { error: er });
            callback(err);
        } else {
            callback(null, result);
            self.disable();
            self._fbEmit('_nc:stopped');
        }
    });
};

Netcore.prototype.reset = function (mode, callback) {
    var self = this,
        err,
        drvReset = this._findDriver('net', 'reset');

    callback = callback || function () {};

    if (!this.isEnabled())
        err = new Error('Netcore not enabled.');
    else if (!_.isFunction(drvReset))
        err = new Error('Driver reset() not implemented');

    if (err) {
        this._fbEmit('_nc:error', { error: err });
        return callback(err);
    }

    if (mode)   // hard reset
        this.clearBlacklist();

    this.disable();

    // [XXX] reset logic?
    drvReset(mode, function (er, result) {
        if (er) {
            self._fbEmit('_nc:error', { error: er });
            callback(err);
        } else {
            self.start(callback);
        }
    });
};

Netcore.prototype.permitJoin = function (duration, callback) {
    var self = this,
        err,
        drvPermitJoin = this._findDriver('net', 'permitJoin');

    if (_.isFunction(duration)) {
        callback = duration;
        duration = this._net.defaultJoinTime;
    } else if (!_.isNumber(duration)) {
        duration = this._net.defaultJoinTime;
    }

    callback = callback || function () {};

    if (!this.isEnabled())
        err = new Error('Netcore not enabled.');
    else if (!_.isFunction(drvPermitJoin))
        err = new Error('Driver permitJoin() not implemented');

    if (err) {
        this._fbEmit('_nc:error', { error: err });
        return callback(err);
    } else {
        drvPermitJoin(duration, function (er) {
            if (er) {
                callback(er);
            } else {
                self._startJoinTimer(duration);
                callback(null);
            }
        });
    }
};

Netcore.prototype.remove = function (permAddr, callback) {
    var self = this,
        err,
        drvRemove = this._findDriver('net', 'remove');

    callback = callback || function () {};

    if (!this.isEnabled())
        err = new Error('Netcore not enabled.');
    else if (!_.isFunction(drvRemove))
        err = new Error('Driver permitJoin() not implemented');

    if (err) {
        this._fbEmit('_nc:error', { error: err });
        return callback(err);
    } else {
        drvRemove(permAddr, function (er, result) {
            if (er) {
                callback(er);
                self._fbEmit('_nc:error', { error: er });
            } else {
                callback(null);
                self._fbEmit('_nc:devLeaving', { permAddr: permAddr });
            }
        });
    }
    // dev._poke()@fb
};

Netcore.prototype.ban = function (permAddr, callback) {
    var self = this,
        err,
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
                callback(null, result);
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
                callback(null, result);
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
    var self = this,
        err,
        drvPing = this._findDriver('net', 'ping');

    callback = callback || function () {};

    if (!this.isEnabled())
        err = new Error('Netcore not enabled.');
    else if (!_.isFunction(drvPing))
        err = new Error('Driver ping() not implemented');

    if (err) {
        this._fbEmit('_nc:error', { error: err });
        return callback(err);
    } else {
        drvPing(permAddr, function (er, result) {
            if (er) {
                callback(er);
                self._fbEmit('_nc:error', { error: er });
            } else {
                callback(null, result);
                self._fbEmit('_nc:netPing', { permAddr: permAddr, data: result });
            }
        });
    }
    // dev._poke()@fb
};

Netcore.prototype.devRead = function (permAddr, attrName, callback) {
    var self = this,
        err,
        drvRead = this._findDriver('dev', 'read');

    callback = callback || function () {};

    if (!this.isEnabled())
        err = new Error('Netcore not enabled.');
    else if (!_.isFunction(drvRead))
        err = new Error('Device driver read() not implemented');

    if (err) {
        this._fbEmit('_nc:error', { error: err });
        return callback(err);
    } else {
        drvRead(permAddr, attrName, function (er, result) {
            var data = {};
            if (er) {
                callback(er);
                self._fbEmit('_nc:error', { error: er });
            } else {
                data = _.set(data, attrName, result);
                callback(null, result);
                self._fbEmit('_nc:devRead', { permAddr: permAddr, data: data });
            }
        });
    }
    // dev._poke()@fb
};

Netcore.prototype.devWrite = function (permAddr, attr, val, callback) {
    var self = this,
        err,
        drvWrite = this._findDriver('dev', 'write');

    callback = callback || function () {};

    if (!this.isEnabled())
        err = new Error('Netcore not enabled.');
    else if (!_.isFunction(drvWrite))
        err = new Error('Device driver write() not implemented');

    if (err) {
        this._fbEmit('_nc:error', { error: err });
        return callback(err);
    } else {
        drvWrite(permAddr, attrName, val, function (er, result) {
            var data = {};
            if (er) {
                callback(er);
                self._fbEmit('_nc:error', { error: er });
            } else {
                if (!result)
                    data = _.set(data, attrName, val);
                else
                    data = _.set(data, attrName, result);

                callback(null, result);
                self._fbEmit('_nc:devWrite', { permAddr: permAddr, data: data });
            }
        });
    }
    // dev._poke()@fb
};

Netcore.prototype.identify = function (permAddr, callback) {
    var self = this,
        err,
        drvIdentify = this._findDriver('dev', 'identify');

    callback = callback || function () {};

    if (!this.isEnabled())
        err = new Error('Netcore not enabled.');
    else if (!_.isFunction(drvIdentify))
        err = new Error('Device driver identify() not implemented');

    if (err) {
        this._fbEmit('_nc:error', { error: err });
        return callback(err);
    } else {
        drvIdentify(permAddr, function (er, result) {
            if (er) {
                callback(er);
                self._fbEmit('_nc:error', { error: er });
            } else {
                callback(null, result);
                self._fbEmit('_nc:devIdentify', { permAddr: permAddr });
            }
        });
    }
    // dev._poke()@fb
};

Netcore.prototype.gadRead = function (permAddr, auxId, attrName, callback) {
    var self = this,
        err,
        drvRead = this._findDriver('gad', 'read');

    callback = callback || function () {};

    if (!this.isEnabled())
        err = new Error('Netcore not enabled.');
    else if (!_.isFunction(drvRead))
        err = new Error('Gadget driver read() not implemented');

    if (err) {
        this._fbEmit('_nc:error', { error: err });
        return callback(err);
    } else {
        drvRead(permAddr, auxId, attrName, function (er, result) {
            var data = {};
            if (er) {
                callback(er);
                self._fbEmit('_nc:error', { error: er });
            } else {
                data = _.set(data, attrName, result);
                callback(null, result);
                self._fbEmit('_nc:gadRead', { permAddr: permAddr, auxId: auxId, data: data });
            }
        });
    }
    // dev._poke()@fb
};

Netcore.prototype.gadWrite = function (permAddr, auxId, attr, val, callback) {
    var self = this,
        err,
        drvWrite = this._findDriver('gad', 'write');

    callback = callback || function () {};

    if (!this.isEnabled())
        err = new Error('Netcore not enabled.');
    else if (!_.isFunction(drvWrite))
        err = new Error('Gadget driver write() not implemented');

    if (err) {
        this._fbEmit('_nc:error', { error: err });
        return callback(err);
    } else {
        drvWrite(permAddr, auxId, attrName, val, function (er, result) {
            var data = {};
            if (er) {
                callback(er);
                self._fbEmit('_nc:error', { error: er });
            } else {
                if (!result)
                    data = _.set(data, attrName, val);
                else
                    data = _.set(data, attrName, result);

                callback(null, result);
                self._fbEmit('_nc:gadWrite', { permAddr: permAddr, auxId: auxId, data: data });
            }
        });
    }
    // dev._poke()@fb
};

Netcore.prototype.gadExec = function (permAddr, auxId, attrName, args, callback) {
    var self = this,
        err,
        drvExec = this._findDriver('gad', 'exec');

    callback = callback || function () {};

    if (!this.isEnabled())
        err = new Error('Netcore not enabled.');
    else if (!_.isFunction(drvExec))
        err = new Error('Gadget driver exec() not implemented');

    if (err) {
        this._fbEmit('_nc:error', { error: err });
        return callback(err);
    } else {
        drvExec(permAddr, auxId, attrName, args, function (er, result) {
            var data = {};
            if (er) {
                callback(er);
                self._fbEmit('_nc:error', { error: er });
            } else {
                if (result)
                    data = _.set(data, attrName, result);

                callback(null, result);
                self._fbEmit('_nc:gadExec', { permAddr: permAddr, auxId: auxId, data: data });
            }
        });
    }
    // dev._poke()@fb
};

Netcore.prototype.setReportCfg = function (permAddr, auxId, attrName, cfg, callback) {
    var self = this,
        err,
        drvSetReportCfg = this._findDriver('gad', 'setReportCfg');

    callback = callback || function () {};

    if (!this.isEnabled())
        err = new Error('Netcore not enabled.');
    else if (!_.isFunction(drvSetReportCfg))
        err = new Error('Gadget driver setReportCfg() not implemented');

    if (err) {
        this._fbEmit('_nc:error', { error: err });
        return callback(err);
    } else {
        drvSetReportCfg(permAddr, auxId, attrName, cfg, function (er, result) {
            var data = {};
            if (er) {
                callback(er);
                self._fbEmit('_nc:error', { error: er });
            } else {
                if (result)
                    data = _.set(data, attrName, result);

                callback(null, result);
                self._fbEmit('_nc:gadSetReportCfg', { permAddr: permAddr, auxId: auxId, data: data });
            }
        });
    }
    // dev._poke()@fb
};

Netcore.prototype.getReportCfg = function (permAddr, auxId, attrName, callback) {
    var self = this,
        err,
        drvGetReportCfg = this._findDriver('gad', 'getReportCfg');

    callback = callback || function () {};

    if (!this.isEnabled())
        err = new Error('Netcore not enabled.');
    else if (!_.isFunction(drvGetReportCfg))
        err = new Error('Gadget driver getReportCfg() not implemented');

    if (err) {
        this._fbEmit('_nc:error', { error: err });
        return callback(err);
    } else {
        drvSetReportCfg(permAddr, auxId, attrName, function (er, result) {
            var data = {};
            if (er) {
                callback(er);
                self._fbEmit('_nc:error', { error: er });
            } else {
                if (result)
                    data = _.set(data, attrName, result);

                callback(null, result);
                self._fbEmit('_nc:gadGetReportCfg', { permAddr: permAddr, auxId: auxId, data: data });
            }
        });
    }
    // dev._poke()@fb
};