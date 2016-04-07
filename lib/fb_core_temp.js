// ping regularly to check: online -> sleep, sleep -> offline

    if (!_.isFunction(this.cookRawDevice)) {
        this._fbEmit('_nc:error', {
            netcore: this,
            error: new Error('Method cookRawDevice() should be implemented.')
        });
        return; // if
    }

Netcore.prototype.devIncoming = function (raw) {
    // At very beginning, check if netcore is enabled. If not, ignore all messages.
    // Since netcore can run independtly without freebird, we need not to check 
    // if it is registered to freebird.
    if (!this.isEnabled()) 
        return;

    // [TODO] check dev enabled

    var self = this,
        newDev = new Device(this, raw),
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
        self._findDevByAddr(newDev.address.permanent, function (err, oldDev) {
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
    });
};


Netcore.prototype.reportDevAttrs = function (permAddr, attrs) {
    if (!this.isEnabled() || this.isBlacklisted(permAddr)) 
        return;

    var self = this,
        devAttrs = this.cookRawDevAttrsReport(attrs);

    this.emit('devAttrsReport', permAddr, devAttrs);


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

// recover@fb
// Device.prototype.recover = function (data) {
//     // _netcore and _raw 
//     // [TODO] this._netcore = // how to find? isWorking check-> cannot be a string
   
//     this._id = data.id;
//     this._enabled = data.enabled;
//     this._joinTime = data._joinTime;
//     this._gads = data.gads;

//     _.assign(this._traffic, data.traffic);


//     this.role = data.role;
//     this.parent = data.parent;
//     this.maySleep = data.maySleep;
//     this.status = 'offline';        // always offline after recovery

//     _.assign(this.address, data.address);

//     // this.extra = null;

//     _.assign(this.attrs, data.attrs);

//     return this;
// };

// Netcore.prototype.recoverDev = function (dbData) {
//     var dev = new Device(this);

//     this._id = dbData.id;
//     this._enabled = dbData.enabled;
//     this._joinTime = dbData._joinTime;
//     this._timestamp = dbData._timestamp;
//     this._gads = dbData.gads;

//     _.assign(this._traffic, dbData.traffic);


//     this.role = dbData.role;
//     this.parent = dbData.parent;
//     this.maySleep = dbData.maySleep;

//     _.assign(this.address, dbData.address);

//     this.status = 'offline';        // always offline after recovery

//     _.assign(this.attrs, dbData.attrs);

//     this._fbEmit('_nc:devRecovering', dev);

//     return dev; // no raw, no extra
// };

// Netcore.prototype.recoverGad = function (dbData) {
//     var gad = new Gadget(this, dbData.permAddr, dbData.auxId);

//     this._id = dbData.id;
//     this._dev = null;
//     this._enabled = dbData.enabled;

//     this.profile = dbData.profile;
//     this.class = dbData.class;

//     _.assign(this.attrs, dbData.attrs);

//     this._fbEmit('_nc:gadRecovering', gad);
//     return gad; // no extra
// };