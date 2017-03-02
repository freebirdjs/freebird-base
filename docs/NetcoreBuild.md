How to create your own netcore
========================

This document introduces things that you should know about how to create your own netcore for freebird framework.

<a name="Netcore"></a>
<br />
********************************************
## 1. What is netcore?

Netcore is a network controller which equips with implementation of freebird-defined methods to accomplish operations of network transportation and management.  

<a name="Data_Model"></a>
<br />
********************************************
## 2. Unified Device and Gadget Data Model

Freebird uses two unified data models to represent the real **device** and **gadget**. The definition of a device is a communication device, such as a zigbee module. The definition of a gadget is a single and small application implemented on the device, for example, a zigbee module has two bulbs, so we will say that this package, it uses a device (zigbee module), in its There are 2 gadgets(bulb).

* Device Class
    - About the information in a device, the most important is the network information. You can use the device's method `dev.set('net', netInfoObj)` to set its network information. 
    - Device has another additional information, such as manufacturer, hardware version, etc. You can use device's method `dev.set('attrs', devAttrsObj)` to set it. 
    - The format of `netInfoObj` and `devAttrsObj` is listed in [section 4](#Info_Dev). 
<br />

* Gadget Class
    - About the information in a gadget, the most important is the application information. You can use the gadget's method `gad.set('panel', panelInfoObj)` to set its basic information.
    - The gadget must have attributes associated with its application. As for what attributes should a gadget have, it is determined by the `classId` that defined by `panelInfoObj`.
    - `classId` should follow the 51 kinds of Objects provided by IPSO to define its name. [This document](https://github.com/PeterEB/smartobject/blob/master/docs/templates.md) of smartobject lists the supported Object Ids, which also indicates the attributes that a gadget must have. 
    - After the developer decides the `classId`, the developer also has the responsibility to fill the gadget attribute. You can use gadget's method `gad.set('attrs', gadAttrsObj)` to fill the attributes. 
    - The format of `panelInfoObj` and `gadAttrsObj` is listed in [section 5](#Info_Gad). 

<a name="Developers"></a>
<br />
********************************************
## 3. Netcore Implementors Responsibilties

1. Every time when netcore start and ready, the developer should call `nc.commitReady()` to notify freebird that it is ready (When the low-level boot, reboot, soft/hard reset, the low-level must use this API to notify freebird).
2. Need to implement `nc._cookRawDev()` and `nc._cookRawGad()` two methods to tell freebird how the low-level device or gadget raw data objects into Device Class and Gadget Class objects. In the implementation of the content, the developer must use `dev.set('net', netInfoObj)`, `dev.set('attrs', devAttrsObj)`, `gad.set('panel ', panelInfoObj)` and `gad.set('attrs', gadAttrsObj)` to complete the setup of the device and the gadget.
3. Need to implement network management, device control and gadget control drivers. These three types of drivers must use the netcore methods `nc.registerNetDrivers()`, `nc.registerDevDrivers()` and `nc.registerGadDrivers()` to register the driver to netcore. When netcore starts (`start ()`), it will checks drivers to see if they are complete. If not, netcore will throw an error to remind the developer to implement the driver.
4. When a new device is incoming to the low-level network, the developer must call `nc.commitDevIncoming()` to notify the netcore that the network has a device incoming.
5. When a device is incoming to the network. The developer has the responsibility to find what the application is on the device and generate the corresponding gadget raw data based on certain rules, and then call `nc.commitGadIncoming()` to notify the netcore.
6. When a device leaves the network. The developer has the responsibility to call `nc.commitDevLeaving()` to notify the netcore which device is leaving.
7. When the low-level receives a attribute change or notification about the device. It must using `nc.commitDevReporting()` to report to the netcore. 
8. When the low-level receives a attribute change or notification about the gadget. It must using `nc.commitGadReporting()` to report to the netcore.  
9. When the low-level receives a network change about the device. It must using `nc.commitDevNetChanging()` to report to the netcore. The network change include any attributes of `{role, parent, maySleep, sleepPeriod, address: { dynamic } }`.

When the developer meets the above requirements. Netcore will be able to work in the freebird framework. In summary, a netcore developer must provide the following implementation:

### Transform 

* `nc._cookRawDev(dev, rawDev, done)`
    - According to `rawDev` content, ues `dev.set('net')` and `dev.set('attrs')` fill in the device attributes. Then call `done(err, dev)` and fill the of the `dev` to netcore.
* `nc._cookRawGad(gad, rawGad, done)`
    - According to `rawGad` content, ues `gad.set('panel')` and `gad.set('attrs')` fill in the gadget attributes. Then call `done(err, dev)` and fill the of the `gad` to netcore.

### Driver 

* Network Drivers, package the driver with Object `{start, stop, reset, permitJoin, remove, ban, unban, ping}`, then use `nc.registerNetDrivers(netDrvs)` to register with netcore.
* Device Drivers, package the driver with Object `{ read, write, identify }`, then use `nc.registerDevDrivers(devDrvs)` to register with netcore.
* Gadget Drivers, package the driver with Object `{ read, write, exec, writeReportCfg, readReportCfg }`, then use `nc.registerGadDrivers(gadDrvs)` to register with netcore.

#### Arguments and Description for each Method of the Network Drivers 
* start: `function(done) {}`
    - Start low-level controller. Called `done(err)` after done.
* stop: `function(done) {}`
    - Stop low-level controller. Called `done(err)` after done.
* reset: `function(mode, done) {}`
    - Reset low-level controller. Given `mode` with `0` for a soft reset and `1` for a hard reset. Called `done(err)` after done.
* permitJoin: `function(duration, done) {}`
    - Let low-level controller allow devices to join its network. Where `duration` is duration in seconds for the netcore to allow devices to join the network. Set it to 0 will immediately close the admission. Called `done(err, timeLeft)` after done. Where `timeLeft` is time left for joining in seconds.
* remove: `function(permAddr, done) {}`
    - Remove device from the network. Where `permAddr` is the device permanent address. Called `done(err, permAddr)` after done. 
* ban: `function(permAddr, done) {}`
    - Ban the device from the network. Where `permAddr` is the device permanent address. Called `done(err, permAddr)` after done. This method is optional.
* unban: `function(permAddr, done) {}` 
    - Unban the device. Where `permAddr` is the device permanent address. Called `done(err, permAddr)` after done. This method is optional.
* ping: `function(permAddr, done) {}`
    - Ping the remote device. Where `permAddr` is the device permanent address. Called `done(err, time)` after done. Where `time` is the round-trip time in milliseconds.

#### Arguments and Description for each Method of the Device Drivers 
* read: `function(permAddr, attrName, done) {}`
    - Read device attribute from the remote device. Where `permAddr` is the device permanent address and `attrName` is attribute name. Called `done(err, val)` after done.
* write: `function(permAddr, attrName, val, done) {}, ),`
    - Remotely write a value to an attribute on the device. Where `permAddr` is the device permanent address, `attrName` is attribute name and `val` is attribute value to write to the device. Called `done(err, val)` after done.
* identify: `function(permAddr, done) {}`
    - Identify a device in the network. Where `permAddr` is the device permanent address. Called `done(err)` after done. This method is optional.

#### Arguments and Description for each Method of the Gadget Drivers 
* read: `function(permAddr, auxId, attrName, done) {}`
    - Read an attribute from a gadget on the remote device. Where `permAddr` is the device permanent address, `auxId` is auxiliary id to identify a gadget on the device and `attrName` is attribute name. Called `done(err, val)` after done.
* write: `function(permAddr, auxId, attrName, val, done) {}`
    - Remotely write the value to an attribute on the gadget. Where `permAddr` is the device permanent address, `auxId` is auxiliary id to identify a gadget on the device, `attrName` is attribute name and `val` is attribute value to write to the gadget.. Called `done(err, val)` after done.
* exec: `function(permAddr, auxId, attrName, args, done) {}`
    - Remotely invoke the procedure on this gadget. Where `permAddr` is the device permanent address, `auxId` is auxiliary id to identify a gadget on the device, `attrName` is attribute name and `args` is arguments to invoke with. Called `done(err, result)` after done. This method is optional.
* writeReportCfg: `function(permAddr, auxId, attrName, cfg, done) {}`
    - Remotely get the report settings from the gadget. Where `permAddr` is the device permanent address, `auxId` is auxiliary id to identify a gadget on the device, `attrName` is attribute name and `cfg` is report configuration. Called `done(err, result)` after done. This method is optional.
* readReportCfg: `function(permAddr, auxId, attrName, done) {}`
    - Write the report configuration to a gadget on the remote device. Where `permAddr` is the device permanent address, `auxId` is auxiliary id to identify a gadget on the device and `attrName` is attribute name. Called `done(err, cfg)` after done. This method is optional.

<a name="Info_Dev"></a>
<br />
********************************************
## 4. Unified Device Data Model: device instance data settings

To set network information for a device, use its method `dev.set('net', netInfoObj)` to do this; To set attributes for a device, use its method `dev.set('attrs', devAttrsObj)` to do this.

### dev.set('net', netInfoObj)

* The object `netInfoObj` accepts the fields as follows. Where only `address` is required. `address` is an object with permanent address (`permanent`) and dynamic address (`dynamic`).

| Property     | Type    | Mandatory | Description                                   |
|--------------|---------|-----------|-----------------------------------------------|
| address      | Object  | required  | Device address record object `{ permanent, dynamic }`. `permanent` is  permanent address and `dynamic` is dynamic address, these are required. `permanent` address can only be a string, and `dynamic` address can be a string or a number.                        |
| role         | String  | optional  | The network role of the device. Depending on the protocol may have a different string to represent its role. e.g., zigbee may use 'router', 'end-device', and BLE may use 'central', 'peripheral'               |
| parent       | String  | optional  | The permanent address of the parent node of the device. If not a mesh network, all devices may be centralized to the netcore. Which means that the netcore is the parent node of all nodes. Then this field should be filled with '0', The default is '0'.                            |
| maySleep     | Boolean | optional  | If you are sure your device might sleep. Please set this field `true`. It will be related to Freebird how to confirm whether the device online algorithm. The default is `false`.            |
| sleepPeriod  | Number  | optional  | This field is valid when `maySleep` is `true`. If you know the device sleep cycle. Please set the number of seconds for the cycle. Freebird will use this to adjust its current status checking algorithm.                           |


### dev.set('attrs', devAttrsObj)

* All of the propertys in `devAttrsObj` are optional. But should be filled in as much as possible. In order to meet these fields, you may need to remotely read the device attribute a few times.

| Property     | Type    | Mandatory | Description                                   |
|--------------|---------|-----------|-----------------------------------------------|
| manufacturer | String  | optional  | Manufacturer name or identifier               |
| model        | String  | optional  | Hardware module model                         |
| serial       | String  | optional  | Hardware serial or serial number              |
| version      | Object  | optional  | The attributes of this object `{ hw, sw, fw }` are used to record the version number of the hardware (`hw`), software (`sw`), and firmware (`fw`). The version number must be a string.                             |
| power        | Object  | optional  | This object `{ type, voltage }` is used to record the power supply type of the hardware. Where the `type` attribute accepts the `'line'`, `'battery'`, or `'harvester'` three strings to represent the power supply type, and the voltage is filled with the string containing the unit. e.g., `'5 V'`                        |

<a name="Info_Gad"></a>
<br />
********************************************
## 5. Unified Gadget Data Model: gadget instance data settings

To set panel information for a gadget, use its method `gad.set('panel', panelInfoObj)` to do this.

### gad.set('panel', panelInfoObj)

* Panel information means that an object seems to have a brand to show what it is. The object `panelInfoObj` currently has only two fields. One is `classId`  and the other is `profile`. `classId` is optional. Because it will show what the gadget is. e.g., a lamp, a temperature sensor, or a power switch.

| Property     | Type    | Mandatory | Description                                   |
|--------------|---------|-----------|-----------------------------------------------|
| classId      | String  | required  | The class identifier of this object. Currently accept only 51 kinds of smart objects defined by IPSO. Please use the string value of Object Id to fill in `classId`. e.g., `'dIn'`, `'aIn'`, `'generic'`, `'temperature'`, `'humidity'`, etc.                           |
| profile      | String  | optional  | The profile of this object. e.g., `'HA'`                                   |

* Currently accepted `classId` a total of 51 (IPSO definition), they are strings
    - 'dIn', 'dOut'  
    - 'aIn', 'aOut'  
    - 'generic', 'illuminance', 'presence', 'temperature', 'humidity'  
    - 'pwrMea' 
    - 'actuation', 'setPoint', 'loadCtrl', 'lightCtrl', 'pwrCtrl'  
    - 'accelerometer', 'magnetometer', 'barometer'
    - 'voltage', 'current', 'frequency', 'depth', 'percentage', 'altitude', 'load', 'pressure'
    - 'loudness', 'concentration', 'acidity', 'conductivity', 'power', 'powerFactor', 'distance'
    - 'energy', 'direction', 'time', 'gyrometer', 'colour', 'gpsLocation', 'positioner', 'buzzer'
    - 'audioClip', 'timer', 'addressableTextDisplay', 'onOffSwitch', 'levelControl'
    - 'upDownControl', 'multipleAxisJoystick', 'rate', 'pushButton', 'multistateSelector'

<a name="Apis"></a>
<br />
********************************************
## 6. Apis

### Constructor
* Netcore
    - [new Netcore()](#API_new_netcore)

### Implementer provides
* Netcore
    - [_cookRawDev()](#API__cookRawDev)
    - [_cookRawGad()](#API__cookRawGad)
    - [start()](#API_start)
    - [stop()](#API_stop)
    - [reset()](#API_reset)
    - [permitJoin()](#API_permitJoin)
    - [remove()](#API_remove)
    - [ban()](#API_ban)
    - [unban()](#API_unban)
    - [ping()](#API_ping)

* Device
    - [read()](#API_read)
    - [write()](#API_write)
    - [identify()](#API_identify)

* Gadget
    - [read()](#API_read)
    - [write()](#API_write)
    - [exec()](#API_exec)
    - [readReportCfg()](#API_readReportCfg)
    - [writeReportCfg()](#API_writeReportCfg)

### Implementer calls
* Netcore
    - [registerNetDrivers()](#API_registerNetDrivers)
    - [registerDevDrivers()](#API_registerDevDrivers)
    - [registerGadDrivers()](#API_registerGadDrivers)
    - [commitReady()](#API_commitReady)
    - [commitDevNetChanging()](#API_commitDevNetChanging)
    - [commitDevIncoming()](#API_commitDevIncoming)
    - [commitDevLeaving()](#API_commitDevLeaving)
    - [commitGadIncoming()](#API_commitGadIncoming)
    - [commitDevReporting()](#API_commitDevReporting)
    - [commitGadReporting()](#API_commitGadReporting)
    - [dangerouslyCommitGadReporting()](#API_dangerouslyCommitGadReporting)

<br />
********************************************
<br />
## Constructor
### Netcore

<a name ="API_Netcore"></a>
********************************************
### new Netcore(name, controller, protocol[, opt])

Netcore constructor. It is suggested to use freebird-base `.createNetcore()` method to create a new instance of Netcore.  
  

**Arguments:**  

1. `name` (_String_): Netcore name.  
2. `controller` (_Object_): Low-level controller. e.g., `ble-shepherd`.  
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

4. `opt` (_Object_): Reserved.  

**Returns:**  

* (_Object_): netcore  

**Examples:**  
  
```js
var BShepherd = require('ble-shepherd'),
    fbBase = require('freebird-base'),
    Netcore = fbBase.Netcore,
    controller = new BShepherd('noble');

var nc = new Netcore('freebird-netcore-ble', controller, {
    phy: 'ieee802.15.1',
    nwk: 'ble',
});

// recommended to use .createNetcore()
var nc = fbBase.createNetcore('freebird-netcore-ble', controller, {
    phy: 'ieee802.15.1',
    nwk: 'ble'
});
```

<br />
********************************************
<br />
## Implementer provides
### Netcore

<a name ="API__cookRawDev"></a>
********************************************
### _cookRawDev(dev, rawDev, done)

According to the low-level device data object `rawDev`, use `dev.set('net')` and `dev.set('attrs')` to fill the [**Device  Instance Data**](https://github.com/freebirdjs/freebird-base/blob/master/docs/NetcoreBuild_cht.md#Info_Dev). At the end, call `done(err, dev)` return to netcore。  

**Arguments:**  

1. `dev` (_Object_): Deivce instance.  
2. `rawDev` (_Object_): Raw device data object. 
3. `done` (_Function_): `function (err, dev) {}`. Return `dev` to netcore.

**Returns:**  

* _none_  

**Examples:**  
  
```js
nc._cookRawDev = function (dev, rawDev, done) {
    dev.set('net', {
        role: 'router',
        maySleep: false,
        address: {  // Required
            permanent: rawDev.ieeeAddr,
            dynamic: rawDev.nwkAddr,
        }
    });

    dev.set('attrs', {
        manufacturer: rawDev.manufacturerName,
        model: rawDev.modelNum
    });

    done(null, dev);
};
```

<a name ="API__cookRawGad"></a>
<br />
********************************************
### _cookRawGad(gad, rawGad, done)

According to the low-level gadget data object `rawGad`, Use `gad.set('panel')` and `gad.set('attrs')` to fill the [**Gadget Instance Data**](https://github.com/freebirdjs/freebird-base/blob/master/docs/NetcoreBuild_cht.md#Info_Gad). At the end, call `done(err, gad)` return to netcore。  

**Arguments:**  

1. `gad` (_Object_): gadget instance. 
2. `rawGad` (_Object_): Raw gadget data object.  
3. `done` (_Function_): `function (err, gad) {}`. Return `gad` to netcore.  

**Returns:**  

* _none_  

**Examples:**  
  
```js
nc._cookRawGad = function (gad, rawGad, done) {
    gad.set('panel', {
        profile: 'home',
        classId: 'presence'
    });

    gad.set('attrs', {
        dInState: 5500,
        counter: 5501,
        counterReset: 5505
    });

    done(null, gad);
};
```

<a name ="API_start"></a>
<br />
********************************************
### start(callback)

Start low-level controller.

**Arguments:**  

1. `callback` (_Function_): `function (err) {}`.  

**Returns:**  

* _none_  

**Examples:**  
  
```js
var netDrvs = {
    start: function (callback) {
        // your implementation

        callback(null);  // call at the end
    },
    ...
};
```

<a name ="API_stop"></a>
<br />
********************************************
### stop(callback)

Stop low-level controller.

**Arguments:**  

1. `callback` (_Function_): `function (err) {}`.  

**Returns:**  

* _none_  

**Examples:**  
  
```js
var netDrvs = {
    stop: function (callback) {
        // your implementation

        callback(null);  // call at the end
    },
    ...
};
```

<a name ="API_reset"></a>
<br />
********************************************
### reset(mode, callback)

Reset low-level controller.

**Arguments:**  

1. `mode` (_Number_): `0` for a soft reset and `1` for a hard reset. It will perform the soft reset if `mode` is not given.
2. `callback` (_Function_): `function (err) {}`.  

**Returns:**  

* _none_  

**Examples:**  
  
```js
var netDrvs = {
    reset: function (mode, callback) {
        // your implementation

        callback(null);  // call at the end
    },
    ...
};
```

<a name ="API_permitJoin"></a>
<br />
********************************************
### permitJoin(duration, callback)

Let low-level controller allow devices to join its network. 

**Arguments:**  

1. `duration` (_Number_): Duration in seconds for the netcore to allow devices to join the network. Set it to `0` can immediately close the admission.
2. `callback` (_Function_): `function (err, timeLeft) {}`. `timeLeft` (_Number_) is a number that indicates time left for device joining in seconds. 

**Returns:**  

* _none_  

**Examples:**  
  
```js
var netDrvs = {
    permitJoin: function (duration, callback) {
        // your implementation

        callback(null, timeLeft);  // call at the end
    },
    ...
};
```

<a name ="API_remove"></a>
<br />
********************************************
### remove(permAddr, callback)

Remove a remote device from the network.

**Arguments:**  

1. `permAddr` (_String_): Device permanent address.
2. `callback` (_Function_): `function (err, permAddr) {}`. `permAddr` (_String_) is the permananet address of that device.  

**Returns:**  

* _none_  

**Examples:**  
  
```js
var netDrvs = {
    remove: function (permAddr, callback) {
        // your implementation

        callback(null, permAddr);  // call at the end
    },
    ...
};
```

<a name ="API_ban"></a>
<br />
********************************************
### ban(permAddr, callback)

Ban a device from the network. This driver is optional. 

**Arguments:**  

1. `permAddr` (_String_): Device permanent address.
2. `callback` (_Function_): `function (err, permAddr) {}`. `permAddr` (_String_) is the permananet address of that device.

**Returns:**  

* _none_  

**Examples:**  
  
```js
var netDrvs = {
    ban: function (permAddr, callback) {
        // your implementation

        callback(null, permAddr);  // call at the end
    },
    ...
};
```

<a name ="API_unban"></a>
<br />
********************************************
### unban(permAddr, callback)

Unban a device. This driver is optional. 

**Arguments:**  

1. `permAddr` (_String_): Device permanent address.
2. `callback` (_Function_): `function (err, permAddr) {}`. `permAddr` (_String_) is the permananet address of that device.   

**Returns:**  

* _none_  

**Examples:**  
  
```js
var netDrvs = {
    unban: function (permAddr, callback) {
        // your implementation

        callback(null, permAddr);  // call at the end
    },
    ...
};
```

<a name ="API_ping"></a>
<br />
********************************************
### ping(permAddr, callback)

Ping a remote device.  

**Arguments:**  

1. `permAddr` (_String_): Device permanent address.
2. `callback` (_Function_): `function (err, time) {}`. `time` (_Number_) is the round-trip time in milliseconds, e.g., 16.  

**Returns:**  

* _none_  

**Examples:**  
  
```js
var netDrvs = {
    ping: function (permAddr, callback) {
        // your implementation

        callback(null, time);  // call at the end
    },
    ...
};
```

<br />
********************************************
<br />
### Device  

<a name ="API_read"></a>
********************************************
### read(permAddr, attrName, callback)

Read device attribute from the remote device.

**Arguments:**  

1. `permAddr` (_String_): Device permanent address.
2. `attrName` (_String_): Attribute name. 
3. `callback` (_Function_): `function (err, val) {}`. `val` (_Depends_) is the attribute value.  

**Returns:**  

* _none_  

**Examples:**  
  
```js
var devDrvs = {
    read: function (permAddr, attrName, callback) {
        // your implementation

        callback(null, data);  // call at the end
    },
    ...
};
```

<a name ="API_write"></a>
<br />
********************************************
### write(permAddr, attrName, val, callback)

Remotely write a value to an attribute on the device.

**Arguments:**  

1. `permAddr` (_String_): Device permanent address.
2. `attrName` (_String_): Attribute name.  
3. `val` (_Depends_): Attribute value to write to the device.  
4. `callback` (_Function_): `function (err[, val]) {}`. `val` (_Depends_) is the written value. 
**Returns:**  

* _none_  

**Examples:**  
  
```js
var devDrvs = {
    write: function (permAddr, attrName, val, callback) {
        // your implementation

        callback(null[, data]);  // call at the end
    },
    ...
};
```

<a name ="API_identify"></a>
<br />
********************************************
### identify(permAddr, callback)

Identify a device in the network. If remote device does not implement this feature, it would be inapplicable.

**Arguments:**  

1. `permAddr` (_String_): Device permanent address.
2. `callback` (_Function_): `function (err, permAddr) {}`. `permAddr` (_String_) is the permanent address which device to be identified.  

**Returns:**  

* _none_  

**Examples:**  
  
```js
var devDrvs = {
    identify: function (permAddr, callback) {
        // your implementation

        callback(null, permAddr);  // call at the end
    },
    ...
};
```

<br />
********************************************
<br />
### Gadget

<a name ="API_read"></a>
********************************************
### read(permAddr, auxId, attrName, callback)

Read an attribute from a gadget on the remote device.

**Arguments:**  

1. `permAddr` (_String_): Device permanent address.
2. `auxId` (_String_ | _Number_): Auxiliary id to identify a gadget on the device.
3. `attrName` (_String_): Attribute name.  
4. `callback` (_Function_): `function (err, val) {}`. `val` (_Depends_) is the attribute value.  

**Returns:**  

* _none_  

**Examples:**  
  
```js
var gadDrvs = {
    read: function (permAddr, auxId, attrName, callback) {
        // your implementation

        callback(null, data);  // call at the end
    },
    ...
};
```

<a name ="API_write"></a>
<br />
********************************************
### write(permAddr, auxId, attrName, val, callback)

Remotely write the value to an attribute on the gadget.

**Arguments:**  

1. `permAddr` (_String_): Device permanent address.
2. `auxId` (_String_ | _Number_): Auxiliary id to identify a gadget on the device.
3. `attrName` (_String_): Attribute name.  
4. `val` (_Depends_): Attribute value to write to the gadget.
5. `callback` (_Function_): `function (err[, val]) {}`. `val` (_Depends_) is the written value. 

**Returns:**  

* _none_  

**Examples:**  
  
```js
var gadDrvs = {
    write: function (permAddr, auxId, attrName, val, callback) {
        // your implementation

        callback(null[, data]);  // call at the end
    },
    ...
};
```

<a name ="API_exec"></a>
<br />
********************************************
### exec(permAddr, auxId, attrName, args, callback)

Remotely invoke the procedure on this gadget. This driver is optional. 

**Arguments:**  

1. `permAddr` (_String_): Device permanent address.
2. `auxId` (_String_ | _Number_): Auxiliary id to identify a gadget on the device.
3. `attrName` (_String_): Attribute name.  
4. `args` (_Array_): Arguments to invoke with.
5. `callback` (_Function_): `function (err, result) {}`. `result` (_Depends_) is the data returned by the procedure. 

**Returns:**  

* _none_  

**Examples:**  
  
```js
var gadDrvs = {
    exec: function (permAddr, auxId, attrName, args, callback) {
        // your implementation

        callback(null, result);  // call at the end
    },
    ...
};
```

<a name ="API_readReportCfg"></a>
<br />
********************************************
### readReportCfg(permAddr, auxId, attrName, callback)

Remotely get the report settings from the gadget. This driver is optional. 

**Arguments:**  

1. `permAddr` (_String_): Device permanent address.
2. `auxId` (_String_ | _Number_): Auxiliary id to identify a gadget on the device.  
3. `attrName` (_String_): Name of which attribute you'd like to read its reporting configuration.  
4. `callback` (_Function_): `function (err, cfg) {}`. `cfg` (_Object_) is the attribute settings object。

**Returns:**  

* _none_  

**Examples:**  
  
```js
var gadDrvs = {
    readReportCfg: function (permAddr, auxId, attrName, callback) {
        // your implementation

        callback(null, cfg);  // call at the end
    },
    ...
};
```

<a name ="API_writeReportCfg"></a>
<br />
********************************************
### writeReportCfg(permAddr, auxId, attrName, cfg, callback)

Write the report configuration to a gadget on the remote device. This driver is optional. 

**Arguments:**  

1. `permAddr` (_String_): Device permanent address.
2. `auxId` (_String_ | _Number_): Auxiliary id to identify a gadget on the device.  
3. `attrName` (_String_): Name of which attribute you'd like to set its reporting behavior.
4. `cfg` (_Object_): Report configuration.
5. `callback` (_Function_): `function (err, result) {}`. `result` (_Boolean_) show if the reporting configuration is written. 

**Returns:**  

* _none_  

**Examples:**  
  
```js
var gadDrvs = {
    writeReportCfg: function (permAddr, auxId, attrName, cfg, callback) {
        // your implementation

        callback(null, result);  // call at the end
    },
    ...
};
```

<br />
********************************************
<br />
##  Implementer calls
### Netcore

<a name="API_registerNetDrivers"></a>
********************************************
### .registerNetDrivers(netDrvs)
Register network drivers to the netcore.  
  
**Arguments:**  

1. `netDrvs` (_Object_): An object contains all network management drivers required by the netcore.  

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

* (_Object_): netcore 

**Examples:**  
  
```js
var netDrvs = {
    start: function (callback) {},
    stop: function (callback) {},
    reset: function (mode, callback) {},
    permitJoin: function (duration, callback) {},
    remove: function (permAddr, callback) {},
    ping: function (permAddr, callback) {}
};

nc.registerNetDrivers(netDrvs);
```

********************************************
<a name="API_registerDevDrivers"></a>
### .registerDevDrivers(devDrvs)
Register device drivers to the netcore.  
  
**Arguments:**  

1. `drvs` (_Object_): An object contains all device operation drivers required by the netcore.  

| Property   | Type     | Mandatory | Description                                                  |
|------------|----------|-----------|--------------------------------------------------------------|
| read       | Function | required  | Driver to read an attribute from a remote device             |
| write      | Function | required  | Driver to write an attribute value to a remote device        |
| identify   | Function | optional  | Driver to identify a remote device. This method is optional. If a device supoorts the identifying mode, it may, for example, start to blink a led to get users attention. |

**Returns:**  

* (_Object_): netcore 

**Examples:**  
  
```js
var devDrvs = {
    read: function (permAddr, attrName, callback) {},
    write: function (permAddr, attrName, val, callback) {},
    identify: function (permAddr, callback) {}
};

nc.registerDevDrivers(devDrvs);
```

********************************************
<a name="API_registerGadDrivers"></a>
### .registerGadDrivers(gadDrvs)
Register gadget drivers to the netcore.  
  
**Arguments:**  

1. `drvs` (_Object_): An object contains all device operation drivers required by the netcore.  

| Property       | Type     | Mandatory | Description                                                  |
|----------------|----------|-----------|--------------------------------------------------------------|
| read           | Function | required  | Driver to read an attribute from a remote gadget             |
| write          | Function | required  | Driver to write an attribute value to a remote gadget        |
| exec           | Function | optional  | Driver to invoke the procedure on a remote gadget            |
| readReportCfg  | Function | optional  | Driver to read the report configuration to a remote gadget   |
| writeReportCfg | Function | optional  | Driver to write the report configuration to a remote gadget  |

**Returns:**  

* (_Object_): netcore 

**Examples:**  
  
```js
var gadDrvs = {
    read: function (permAddr, auxId, attrName, callback) {},
    write: function (permAddr, auxId, attrName, val, callback) {},
    exec: function (permAddr, auxId, attrName, args, callback) {},
    readReportCfg: function (permAddr, auxId, attrName, callback) {},
    writeReportCfg: function (permAddr, auxId, attrName, cfg, callback) {}
};

nc.registerDevDrivers(gadDrvs);
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
nc.commitReady();
```

********************************************
<a name="API_commitDevNetChanging"></a>
### .commitDevNetChanging(permAddr, changes)
Commit the network status when a device changes its status.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Boolean_): `true` for a success, otherwise `false` for failure.

**Examples:**  
  
```js
nc.commitDevNetChanging('0x0123456789', { status: 'online' });
```

********************************************
<a name="API_commitDevIncoming"></a>
### .commitDevIncoming(permAddr, rawDev)
Commit a device incoming message to netcore when a device comes in.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Boolean_): `true` for a success, otherwise `false` for failure.

**Examples:**  
  
```js
nc.commitDevIncoming('0x0123456789', rawDev);
```

********************************************
<a name="API_commitDevLeaving"></a>
### .commitDevLeaving(permAddr)
Commit a device leaving message to netcore when a device leave from the network.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Boolean_): `true` for a success, otherwise `false` for failure.

**Examples:**  
  
```js
nc.commitDevLeaving('0x0123456789');
```

********************************************
<a name="API_commitGadIncoming"></a>
### .commitGadIncoming(permAddr, auxId, rawGad)
Commit a gadget incoming message to netcore when a gadget comes in.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Boolean_): `true` for a success, otherwise `false` for failure.

**Examples:**  
  
```js
nc.commitGadIncoming('0x0123456789', 'temperature/0', rawGad);
```

********************************************
<a name="API_commitDevReporting"></a>
### .commitDevReporting(permAddr, devAttrs)
Commit a device reporting message to netcore when a device reports its attribtue(s).  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Boolean_): `true` for a success, otherwise `false` for failure.

**Examples:**  
  
```js
nc.commitDevReporting('0x0123456789', { manufacturer: 'xxx' });
```

********************************************
<a name="API_commitGadReporting"></a>
### .commitGadReporting(permAddr, auxId, gadAttrs)
Commit a gadget reporting message to netcore when a gadget reports its attribtue(s).  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Boolean_): `true` for a success, otherwise `false` for failure.

**Examples:**  
  
```js
nc.commitGadReporting('0x0123456789', 'temperature/0', { sensorValue: 27.8 });
```

********************************************
<a name="API_dangerouslyCommitGadReporting"></a>
### .dangerouslyCommitGadReporting(permAddr, auxId, gadAttrs)
Dangerously commit a gadget reporting message to netcore when a gadget reports its attribtue(s). This will restructure the attrs data in the gadget instance. Use this API when you do know what you are doing.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Boolean_): `true` for a success, otherwise `false` for failure.

**Examples:**  
  
```js
nc.dangerouslyCommitGadReporting('0x12345678abcde', 'dIn/6', {
    xx: 1,
    yy: 2
});
```

********************************************

