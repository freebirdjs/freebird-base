How to create your own netcore
========================

This document introduces things that you should know about how to create your own netcore for freebird framework.

## 1. What is netcore?

Netcore is a network controller which equips with implementation of freebird-defined methods to accomplish operations of network transportation and management.  


## 2. Unified Device and Gadget Data Model

## 3. Netcore Implementors Responsibilties




## 2. Provide implementation of cookRawDev() and cookRawGad() for netcore

Since freebird has its own unified **Device** and **Gadget** class, and freebird doesn't know what your raw device and raw gadget data is. Thus, you should implement cookRawDev() and cookRawGad() to transform your raw data into the unified things that freebird can understand.

To implememt these two method. There are something you should know first.
dev.setNetInfo(), dev.setAttrs(), gad.setPanelInfo(), and gad.setAttrs().

## 3. Freebird unified Device class

The freebird unified Device class defines what information a device should have. The most important information about a device is the network info and device attributes.

To set network information for a device, use its method setNetInfo() to do this.

### dev.setNetInfo(info)

| Property     | Type    | Mandatory | Description                                   |
|--------------|---------|-----------|-----------------------------------------------|
| role         | String  | optional  | Server name                                   |
| parent       | String  | optional  | Permanent address                             |
| maySleep     | Boolean | optional  |                                               |
| sleepPeriod  | Number  | optional  |                                               |
| address      | Object  | required  | { permanent, dynamic }                        |

To set attributes for a device, use its method setAttrs() to do this.

### dev.setAttrs(attrs)

| Property     | Type    | Mandatory | Description                                   |
|--------------|---------|-----------|-----------------------------------------------|
| manufacturer | String  | optional  | Server name                                   |
| model        | String  | optional  | Server name                                   |
| serial       | String  | optional  | Server name                                   |
| version      | Object  | optional  | Server name                                   |
| power        | Object  | optional  | Server name                                   |


## 4. Freebird unified Gadget class

The freebird unified Gadget class defines what information a gadget should have. The most important information about a device is the panel info and gadget attributes.

To set panel information for a gadget, use its method setPanelInfo() to do this.

### dev.setPanelInfo(info)

| Property     | Type    | Mandatory | Description                                   |
|--------------|---------|-----------|-----------------------------------------------|
| profile      | String  | optional  | Server name                                   |
| classId      | String  | required  | Permanent address                             |


## 5. cookRawDev()

I'll show you an example.

```js
{
    ieeeAddr: '0x12345678ABCD', // mac address
    nwkAddr: '0xABCD',          // ip address
    devType: 1,                 // router for a zigbee device
}
```

```js
var nc = new Netcore();

// cookRawDev = function(dev, rawDev, callback) { callback(err, dev) };

this.cookRawDev = function (dev, rawDev, callback) {

    dev.setNetInfo({
        role: 'router',
        maySleep: false,
        address: {
            permanent: rawDev.ieeeAddr,
            dynamic: rawDev.nwkAddr,
        }
    });

    dev.setAttrs({
        manufacturer: 'xxx',
        model: 'xxxx'
    });

    callback(null, dev);
};
```

## 6. cookRawGad()

```js
{
    ieeeAddr: '0x12345678ABCD', // mac address
    nwkAddr: '0xABCD',          // ip address
    devType: 1,                 // router for a zigbee device
}
```

```js
// cookRawGad = function(dev, rawGad, callback) { callback(err, dev) };

this.cookRawGad = function (gad, rawGad, callback) {

    gad.setPanelInfo({
        profile: 'home',
        classId: 'presence',
    });

    gad.setAttrs({
        dInState: 5500,
        counter: 5501,
        counterReset: 5505,
    });

    callback(null, gad);
};
```

## 7. Network Drivers
nc.registerNetDrivers(netDrvs)

## 8. Device Drivers
nc.registerDevDrivers(devDrvs)

## 9. Gadget Drivers
nc.registerDevDrivers(gadDrvs)

## 10. Tell freebird there is something incoming

nc.commitDevIncoming(permAddr, rawDev)
nc.commitGadIncoming(permAddr, auxId, rawGad)

## 11. Tell freebird there is something leaving

nc.commitDevLeaving(permAddr)

## 12. Tell freebird here is a device report
nc.commitDevReporting(permAddr, devAttrs)

## 13. Tell freebird here is a gadget report
nc.commitGadReporting(permAddr, auxId, gadAttrs)


That's all!


## Signatures for drivers

* net
    - start: `function(done) {}`
        * `done(err)` should be called after done
    - stop: `function(done) {}`
        * `done(err)` should be called after done
    - reset: `function(mode, done) {}`
        * `done(err)` should be called after done
    - permitJoin: `function(duration, done) {}`
        * `done(err, timeLeft)` should be called after done
        * timeLeft (_Number_): Time left for joining in seconds, e.g., 180.
    - remove: `function(permAddr, done) {}`
        * `done(err, permAddr)` should be called after done
        * permAddr (_String_): permAddr, e.g., '0x12345678'.
    - ban: `function(permAddr, done) {}`
        * `done(err, permAddr)` should be called after done
        * permAddr (_String_): permAddr, e.g., '0x12345678'.
    - unban: `function(permAddr, done) {}` should be called after done
        * `done(err, permAddr)` should be called after done
        * permAddr (_String_): permAddr, e.g., '0x12345678'.
    - ping: `function(permAddr, done) {}, done(err, time), `
        * `done(err, time)` should be called after done
        * time (_Number_): round-trip time in milliseconds, e.g., 16.
* dev
    - read: `function(permAddr, attrName, done) {}`
        * `done(err, val)` should be called after done
        * val (_Depends_): value read. Type denpends, e.g., `'hello'`, `12`, `false`.
    - write: `function(permAddr, attrName, val, done) {}, ),`
        * `done(err, val)`
        * val: value written (optional, Type denpends, ex: 'hello', 12, false)
    - identify: `function(permAddr, done) {}`
        * `done(err)`
* gad
    - read: `function(permAddr, auxId, attrName, done) {}`
        * `done(err, val)`
        * val (_Depends_): value read (Type denpends, ex: 'hello', 12, false)
    - write: `function(permAddr, auxId, attrName, val, done) {}`
        * `done(err, val)`
        * val (_Depends_): value written (optional, Type denpends, ex: 'hello', 12, false)
    - exec: `function(permAddr, auxId, attrName, args, done) {}`
        * `done(err, result)`
        * result (_Depends_): can be anything, depends on firmware
    - writeReportCfg: `function(permAddr, auxId, attrName, cfg, done) {}`
        * `done(err, result)`
        * result (_Depends_): set succeeds? (Boolean, true or false)
    - readReportCfg: `function(permAddr, auxId, attrName, done) {}`
        * `done(err, cfg)`
        * cfg (_Object_): config object (Object, ex: { pmin: 10, pmax: 60, gt: 200 })



* Driver Registration (For developers who like to create their own netcore)
    * [registerNetDrivers()](#API_registerNetDrivers)
    * [registerDevDrivers()](#API_registerDevDrivers)
    * [registerGadDrivers()](#API_registerGadDrivers)

* Commit Message From Low-layer Controller (For developers who like to create their own netcore)
    * [commitReady()](#API_commitReady)
    * [commitDevNetChanging()](#API_commitDevNetChanging)
    * [commitDevIncoming()](#API_commitDevIncoming)
    * [commitDevLeaving()](#API_commitDevLeaving)
    * [commitGadIncoming()](#API_commitGadIncoming)
    * [commitDevReporting()](#API_commitDevReporting)
    * [commitGadReporting()](#API_commitGadReporting)
    * [dangerouslyCommitGadReporting()](#API_dangerouslyCommitGadReporting)

********************************************
<a name="API_registerNetDrivers"></a>
### .registerNetDrivers(drvs)
Register network drivers to the netcore.  
  
**Arguments:**  

1. `drvs` (_Object_): An object contains all network management drivers required by the netcore.  

    | Property   | Type     | Mandatory | Description                                 |
    |------------|----------|-----------|---------------------------------------------|
    | start      | Function | required  | Driver to start the network controller      |
    | stop       | Function | required  | Driver to stop the network controller       |
    | reset      | Function | required  | Driver to reset the network controller      |
    | permitJoin | Function | required  | Driver to allow devices to join the network |
    | remove     | Function | required  | Driver to remove a device from the network  |
    | ping       | Function | required  | Driver to ping a device in the network      |
    | ban        | Function | optional  | Driver to ban a device from the network     |
    | unban      | Function | optional  | Driver to unban a device from the network   |

**Returns:**  

* (_Object_): netcore itself

**Examples:**  
  
```js
var bleNetDrivers = {
    // [TODO] arguments
    start: function () {},
    stop: function () {},
    reset: function () {},
    permitJoin: function () {},
    remove: function () {},
    ping: function () {}
};

nc.registerNetDrivers(bleNetDrivers);
```

********************************************
<a name="API_registerDevDrivers"></a>
### .registerDevDrivers(drvs)
Register device drivers to the netcore.  
  
**Arguments:**  

1. `drvs` (_Object_): An object contains all device operation drivers required by the netcore.  

    | Property   | Type     | Mandatory | Description                                                  |
    |------------|----------|-----------|--------------------------------------------------------------|
    | read       | Function | required  | Driver to read an attribute from a remote device             |
    | write      | Function | required  | Driver to write an attribute value to a remote device        |
    | identify   | Function | optional  | Driver to identify a remote device. This method is optional. If a device supoorts the identifying mode, it may, for example, start to blink a led to get users attention. |

**Returns:**  

* (_Object_): netcore itself

**Examples:**  
  
```js
var bleDevDrivers = {
    // [TODO] arguments
    read: function () {},
    write: function () {},
    identify: function () {}
};

nc.registerDevDrivers(bleDevDrivers);
```

********************************************
<a name="API_registerGadDrivers"></a>
### .registerGadDrivers(drvs)
Register gadget drivers to the netcore.  
  
**Arguments:**  

1. `drvs` (_Object_): An object contains all device operation drivers required by the netcore.  

    | Property       | Type     | Mandatory | Description                                                  |
    |----------------|----------|-----------|--------------------------------------------------------------|
    | read           | Function | required  | Driver to read an attribute from a remote gadget             |
    | write          | Function | required  | Driver to write an attribute value to a remote gadget        |
    | exec           | Function | optional  | [TODO]                                                       |
    | readReportCfg  | Function | optional  | [TODO]                                                       |
    | writeReportCfg | Function | optional  | [TODO]                                                       |

**Returns:**  

* (_Object_): netcore itself

**Examples:**  
  
```js
var bleGadDrivers = {
    // [TODO] arguments
    read: function () {},
    write: function () {},
    exec: function () {},
    readReportCfg: function () {},
    writeReportCfg: function () {}
};

nc.registerDevDrivers(bleDevDrivers);
```

********************************************
<a name="API_commitReady"></a>
### .commitReady()
Commit ready to tell the netcore that the network controller is ready. Everytime the netcore starts, reboots, or resset, it must call `nc.commitReady()` to let the netcore know.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_commitDevNetChanging"></a>
### .commitDevNetChanging(permAddr, changes)
Commit the network status when a device changes its status.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_commitDevIncoming"></a>
### .commitDevIncoming(permAddr, rawDev)
Commit a device incoming message to netcore when a device comes in.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_commitDevLeaving"></a>
### .commitDevLeaving(permAddr)
Commit a device leaving message to netcore when a device leave from the network.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_commitGadIncoming"></a>
### .commitGadIncoming(permAddr, auxId, rawGad)
Commit a gadget incoming message to netcore when a gadget comes in.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_commitDevReporting"></a>
### .commitDevReporting(permAddr, devAttrs)
Commit a device reporting message to netcore when a device reports its attribtue(s).  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_commitGadReporting"></a>
### .commitGadReporting(permAddr, auxId, gadAttrs)
Commit a gadget reporting message to netcore when a gadget reports its attribtue(s).  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_dangerouslyCommitGadReporting"></a>
### .dangerouslyCommitGadReporting(permAddr, auxId, gadAttrs)
Dangerously commit a gadget reporting message to netcore when a gadget reports its attribtue(s). This will restructure the attrs data in the gadget instance. Use this API when you do know what you are doing.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.dangerouslyCommitGadReporting('0x12345678abcde', 'dIn/6', {
    xx: 1,
    yy: 2
});
```
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
    readReportCfg: function (permAddr, auxId, attrName, cfg, callback) {
        // your implementation
        callback(err, data);
    },
    writeReportCfg: function (permAddr, auxId, attrName, callback) {
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

    * [Netcore()](#API_Netcore)

<a name="API_Netcore"></a>
### Netcore(name, controller, protocol[, opt])
Netcore constructor. It is suggested to use freebird-base `.createNetcore()` method to create a new instance of Netcore.  
  
**Arguments:**  

1. `name` (_String_): Netocre name
2. `controller` (_Object_): Low-level controller, for example, `ble-shepherd`
3. `protocol` (_Object_): Information of the used protocol

    | Property | Type    | Mandatory | Description          |
    |----------|---------|-----------|----------------------|
    | phy      | String  | Required  | Physic layer         |
    | dll      | String  | Optional  | Data link layer      |
    | nwk      | String  | Required  | Network layer        |
    | tl       | String  | Optional  | Transportation layer |
    | sl       | String  | Optional  | Session layer        |
    | pl       | String  | Optional  | Presentation layer   |
    | apl      | String  | Optional  | Application layer    |

4. `opt` (_Object_): Optional settings

    | Property        | Type    | Description                                                                                                                                                  |
    |-----------------|---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | defaultJoinTime | Number  | Default timespan of 180 seconds to allow devices for joingiing the network. When calling `permitJoin()` without `duration`, this default value will be used. |

**Returns:**  

* (_Object_): netcore, the instance of Netcore class

**Examples:**  
  
```js
var FreebirdBase = require('freebird-base'),
    Netcore = FreebirdBase.Netcore,
    bShep = require('ble-shepherd');

var nc = new Netcore('my_netcore', bShep, {
    phy: 'ieee802.15.1',
    nwk: 'ble',
});

// Use shorthand
var nc = FreebirdBase.createNetcore('my_netcore', bShep, {
    phy: 'ieee802.15.1',
    nwk: 'ble',
});
```

********************************************

registerNetDrivers
registerDevDrivers
registerGadDrivers
commitReady
commitDevNetChanging
commitDevIncoming
commitDevLeaving
commitGadIncoming
commitDevReporting
commitGadReporting
dangerouslyCommitGadReporting


    - [new Device()](#API_Device)

<a name="API_Device"></a>
### new Device(netcore[, rawDev])
New a device instance.  
  
**Arguments:**  

1. `netcore` (_Object_): The netcore that manages this device. Should be an instance of the _Netcore_ class.  
2. `rawDev` (_Object_): Optional. The `rawDev` maybe a data object that contains many raw information about this device.  

**Returns:**  

* (_Object_): device

**Examples:**  
  
```js
var myNetcore = require('./my_foo_netcore');
var deviceRawData = {
    ieeeAddr: '0x123456789abcdef',
    nwkAddr: 0x27B3,
    // ...
};

var myDevice = new Device(myNetcore, deviceRawData);
```

********************************************

    - [new Gadget()](#API_Gadget)
<a name="API_Gadget"></a>
### new Gadget(dev, auxId[, rawGad])
New a gadget instance. If your are managing your machine network with freebird, the freebird will always create a gadget for you when there is a new gadget incoming to the network.  
  
**Arguments:**  

1. `dev` (_Device_): An instance of Device class  
2. `auxId` (_String | Number_): Auxiliary id to identify a gadget on the device
3. `rawGad` (_Object_): Raw data of the gadget  

**Returns:**  

* (_Gadget_): gadget

**Examples:**  
  
```js
var myGadget = new Gadget(fooDev, 28, barGadRawData);
```

********************************************