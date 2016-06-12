* To create a netcore:  

```js
var fbbs = require('freebird-base');

var myNetcore = fbbs.createNetcore('my_netcore', controller, protocol);

var myNetDrivers = {
    start: function (callback) {
        // your implementation
        callback(err);
    },
    stop: function (callback) {
        // your implementation
        callback(err);
    },
    reset: function (mode, callback) {
        // your implementation
        callback(err);
    },
    permitJoin: function (duration, callback) {
        // your implementation
        callback(err, result);
    },
    remove: function (permAddr, callback) {
        // your implementation
        callback(err, result);
    },
    ban: function (permAddr, callback) {
        // your implementation
        callback(err, result);
    },
    unban: function (permAddr, callback) {
        // your implementation
        callback(err, result);
    },
    ping: function (permAddr, callback) {
        // your implementation
        callback(err, result);
    }
};

var myDevDrivers = {
    read: function (permAddr, attr, callback) {
        // your implementation
        callback(err, data);
    },
    write: function (permAddr, attr, val, callback) {
        // your implementation
        callback(err, data);
    },
    identify: function (permAddr, callback) {
        // your implementation
        callback(err);
    }
};

var myGadDrivers = {
    read: function (permAddr, auxId, attr, callback) {
        // your implementation
        callback(err, data);
    },
    write: function (permAddr, auxId, attr, val, callback) {
        // your implementation
        callback(err, data);
    },
    exec: function (permAddr, auxId, attr, args, callback) {
        // your implementation
        callback(err, data);
    },
    getReportCfg: function (permAddr, auxId, attrName, cfg, callback) {
        // your implementation
        callback(err, data);
    },
    setReportCfg: function (permAddr, auxId, attrName, callback) {
        // your implementation
        callback(err, data);
    }
};

// implement
myNetcore.cookRawDev = function (dev, rawDev, cb) {
    
    // your implementation here

    cb(null, dev);
};

myNetcore.cookRawGad = function (gad, rawGad, cb) {
    
    // your implementation here

    cb(null, gad);
};

myNetcore.registerNetDrivers(netDrivers);
myNetcore.registerDevDrivers(devDrivers);
myNetcore.registerGadDrivers(gadDrivers);

controller.on('controller_ready_event', function () {
    myNetcore.commitReady();
});

controller.on('device_incoming_event', function (rawDevObject) {
    myNetcore.commitDevIncoming(rawDevObject.permanentAddress, rawDevObject);

    // extact gadgets on your device [TODO]
    myNetcore.commitGadIncoming(rawDevObject.permanentAddress, auxId, rawGad);
});

controller.on('device_leaving_event', function (rawDevObject) {
    myNetcore.commitDevLeaving(rawDevObject.permanentAddress);
});

controller.on('device_reporting_event', function (devAttrChanges) {
    myNetcore.commitDevReporting(rawDevObject.permanentAddress, devAttrChanges);
});

controller.on('gadget_reporting_event', function (gadAttrChanges) {
    myNetcore.commitGadReporting(permanentAddress, auxId, gadAttrChanges);
});

```