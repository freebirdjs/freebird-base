# freebird-base
Base classes


## Table of Contents

1. [Overiew](#Overiew)  
2. [Installation](#Installation)  
3. [Basic Usage](#Basic)  
4. [Netcore Class](#Netcore)  
5. [Device Class](#Device)  
6. [Gadget Class](#Gadget)  

<a name="Overiew"></a>
## 1. Overview

**freebird-base** is the base classes for freebird framework. When you are willing to create your own netcore to operates well with freebird, you can simply install this module, and use createNetcore() method to help you with implementing the network drivers.

<a name="Installation"></a>
## 2. Installation

> $ npm install freebird-base --save
  
<a name="Basic"></a>
## 3. Basic Usage

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

<a name="Netcore"></a>
## 4. Netcore Class

    * [new Netcore()](#API_Netcore)
    * [enable()](#API_enable)
    * [disable()](#API_disable)
    * [isEnabled()](#API_isEnabled)
    * [isRegistered()](#API_isRegistered)
    * [isJoinable()](#API_isJoinable)
    * [getName()](#API_getName)
    * [getTraffic()](#API_getTraffic)
    * [resetTxTraffic()](#API_resetTxTraffic)
    * [resetRxTraffic()](#API_resetRxTraffic)
    * [getBlacklist()](#API_getBlacklist)
    * [clearBlacklist()](#API_clearBlacklist)
    * [isBlacklisted()](#API_isBlacklisted)
    * [dump()](#API_dump)

    * [registerNetDrivers()](#API_registerNetDrivers)
    * [registerDevDrivers()](#API_registerDevDrivers)
    * [registerGadDrivers()](#API_registerGadDrivers)

    * [commitReady()](#API_commitReady)
    * [commitDevNetChanging()](#API_commitDevNetChanging)
    * [commitDevIncoming()](#API_commitDevIncoming)
    * [commitDevLeaving()](#API_commitDevLeaving)
    * [commitGadIncoming()](#API_commitGadIncoming)
    * [commitDevReporting()](#API_commitDevReporting)
    * [commitGadReporting()](#API_commitGadReporting)
    * [dangerouslyCommitGadReporting()](#API_dangerouslyCommitGadReporting)

    * [start()](#API_start)
    * [stop()](#API_stop)
    * [reset()](#API_reset)
    * [permitJoin()](#API_permitJoin)
    * [remove()](#API_remove)
    * [ban()](#API_ban)
    * [unban()](#API_unban)
    * [ping()](#API_ping)

    * [devRead()](#API_devRead)
    * [devWrite()](#API_devWrite)
    * [identify()](#API_identify)
    * [gadRead()](#API_gadRead)

    * [gadWrite()](#API_gadWrite)
    * [gadExec()](#API_gadExec)
    * [getReportCfg()](#API_getReportCfg)
    * [setReportCfg()](#API_setReportCfg)

<a name="Device"></a>
## 5. Device Class

    * [new Device()](#API_Device)
    * [enable()](#API_enable)
    * [disable()](#API_disable)
    * [isEnabled()](#API_isEnabled)
    * [isRegistered()](#API_isRegistered)
    * [getNetcore()](#API_getNetcore)
    * [getRawDev()](#API_getRawDev)
    * [getId()](#API_getId)
    * [getAddr()](#API_getAddr)
    * [getPermAddr()](#API_getPermAddr)
    * [getStatus()](#API_getStatus)
    * [getGadTable()](#API_getGadTable)
    * [getTraffic()](#API_getTraffic)
    * [getNetInfo()](#API_getNetInfo)
    * [getProps()](#API_getProps)
    * [getAttrs()](#API_getAttrs)
    * [setNetInfo()](#API_setNetInfo)
    * [setProps()](#API_setProps)
    * [setAttrs()](#API_setAttrs)
    * [resetTxTraffic()](#API_resetTxTraffic)
    * [resetRxTraffic()](#API_resetRxTraffic)
    * [dump()](#API_dump)
    * [refresh()](#API_refresh)
    * [read()](#API_read)
    * [write()](#API_write)
    * [identify()](#API_identify)
    * [ping()](#API_ping)

<a name="Gadget"></a>
## 6. Gadget Class

    * [new Gadget()](#API_Gadget)
    * [enable()](#API_enable)
    * [disable()](#API_disable)
    * [isEnabled()](#API_isEnabled)
    * [isRegistered()](#API_isRegistered)
    * [getNetcore()](#API_getNetcore)
    * [getDev()](#API_getDev)
    * [getPermAddr()](#API_getPermAddr)
    * [getLocation()](#API_getLocation)
    * [getRawGad()](#API_getRawGad)
    * [getId()](#API_getId)
    * [getAuxId()](#API_getAuxId)
    * [getPanelInfo()](#API_getPanelInfo)
    * [getProps()](#API_getProps)
    * [getAttrs()](#API_getAttrs)
    * [setPanelInfo()](#API_setPanelInfo)
    * [setProps()](#API_setProps)
    * [setAttrs()](#API_setAttrs)
    * [dump()](#API_dump)
    * [read()](#API_read)
    * [write()](#API_write)
    * [exec()](#API_exec)
    * [getReportCfg()](#API_getReportCfg)
    * [setReportCfg()](#API_setReportCfg)
