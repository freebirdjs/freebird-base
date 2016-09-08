# Netcore Class
The Netcore Class provides methods of network management.  

<a name="Basic"></a>
## 1. Basic Methods

* [Netcore()](#API_Netcore)
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
* [dump()](#API_dump)

* Network Managing
    * [start()](#API_start)
    * [stop()](#API_stop)
    * [reset()](#API_reset)
    * [permitJoin()](#API_permitJoin)
    * [remove()](#API_remove)
    * [ban()](#API_ban)
    * [unban()](#API_unban)
    * [ping()](#API_ping)
    * [isBlacklisted()](#API_isBlacklisted)

* Remote Device Operation
    * [devRead()](#API_devRead)
    * [devWrite()](#API_devWrite)
    * [identify()](#API_identify)

* Remote Gadget Operation
    * [gadRead()](#API_gadRead)
    * [gadWrite()](#API_gadWrite)
    * [gadExec()](#API_gadExec)
    * [getReportCfg()](#API_getReportCfg)
    * [setReportCfg()](#API_setReportCfg)

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
<a name="API_Device"></a>
### Netcore(name, controller, protocol[, opt])
Netcore constructor. It is suggested to use freebird-base `.createNetcore()` method to create a new instance of Netcore.  
  
**Arguments:**  

1. `name` (_String_): Netocre name  
2. `controller` (_Object_): Low-level controller, for example, `ble-shepherd`  
3. `protocol` (_Object_): Information of the used protocol  
4. `opt` (_Object_): Optional settings  

    | Property | Type    | Mandatory | Description          |
    |----------|---------|-----------|----------------------|
    | phy      | String  | required  | Physic layer         |
    | dll      | String  | optional  | Data link layer      |
    | nwk      | String  | required  | Network layer        |
    | tl       | String  | optional  | Transportation layer |
    | sl       | String  | optional  | Session layer        |
    | pl       | String  | optional  | Presentation layer   |
    | apl      | String  | optional  | Application layer    |

**Returns:**  

* (_Object_): netcore, the instance of Netcore class

**Examples:**  
  
```js
var FreebirdBase = require('freebird-base'),
    Netcore = FreebirdBase.Netcore,
    bShep = require('ble-shepherd');

// [TODO]
var nc = new Netcore('my_netcore', bShep, {
    phy: 'ieee802.15.1',
    tl: '',
    nwk: '',
    apl: ''
});
```

********************************************
<a name="API_enable"></a>
### .enable()
Enable netcore. Once the netcore is enabled, the traffic is alive.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Object_): netcore itself

**Examples:**  
  
```js
nc.enable();
```

********************************************
<a name="API_disable"></a>
### .disable()
Disable network. The traffic is dead an all APIs with remote operations are disabled.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Object_): netcore itself

**Examples:**  
  
```js
nc.disable();
```

********************************************
<a name="API_isEnabled"></a>
### .isEnabled()
To see if the netcore is enabled.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Boolean_): `true` if enabled, otherwise `false`.  

**Examples:**  
  
```js
nc.isEnabled(); // true
```

********************************************
<a name="API_isRegistered"></a>
### .isRegistered()
To see if the netcore has been registered to freebird.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Boolean_): `true` if registered, otherwise `false`.  

**Examples:**  
  
```js
nc.isRegistered();  // false
```

********************************************
<a name="API_isJoinable"></a>
### .isJoinable()
To see if the netcore is currently allowed for devices to join the network.  

**Arguments:**  

* _none_

**Returns:**  

* (_Boolean_): `true` if joinable, otherwise `false`.  

**Examples:**  
  
```js
nc.isJoinable();  // true
```

********************************************
<a name="API_getName"></a>
### .getName()
Get name of this netcore.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_String_): Name of the netcore.  

**Examples:**  
  
```js
nc.getName();  // 'my_netcore'
```

********************************************
<a name="API_getTraffic"></a>
### .getTraffic()
Get traffic record on the netcore.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Object_): Traffic record of this netcore.  

**Examples:**  
  
```js
nc.getTraffic();
// {
//     in: {
//         hits: 0,
//         bytes: 0
//     },
//     out: {
//         hits: 0,
//         bytes: 0
//     }
// }
```

********************************************
<a name="API_resetTxTraffic"></a>
### .resetTxTraffic()
Reset the traffic record of transmitting out.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Object_): netcore itself

**Examples:**  
  
```js
nc.resetTxTraffic();
```

********************************************
<a name="API_resetRxTraffic"></a>
### .resetRxTraffic()
Reset the traffic record of receiving in.  
  
**Arguments:**  

* (_Object_): netcore itself

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.resetRxTraffic();
```

********************************************
<a name="API_getBlacklist"></a>
### .getBlacklist()
Get the blacklist of banned devices. This method returns an array of permanent addresses.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_String[]_): An array of permanent addresses of devices been banned.  

**Examples:**  
  
```js
nc.getBlacklist();
// [ '0x12345678', '0xabcd5768', '0x1234abcd', '0x5678abcd' ]
```

********************************************
<a name="API_clearBlacklist"></a>
### .clearBlacklist()
Clear the blacklist.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Object_): netcore itself

**Examples:**  
  
```js
nc.clearBlacklist();
```

********************************************
<a name="API_isBlacklisted"></a>
### .isBlacklisted(permAddr)
To see if a device is banned.  
  
**Arguments:**  

1. `permAddr` (_String_): Permanent address of the device to check for.  

**Returns:**  

* (_Boolean_): `true` if banned, otherwise `false`.  

**Examples:**  
  
```js
nc.isBlacklisted('0x1234abcd'); // true
nc.isBlacklisted('0x2e3c5a11'); // false
```

********************************************
<a name="API_dump"></a>
### .dump()
Dump information about this netcore.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Object_): A data object to describe information about this netcore.  

**Examples:**  
  
```js
nc.dump();

// {
//     name: 'my_netcore',
//     enabled: true,
//     protocol: {
//         // [TODO]
//     },
//     startTime: 12345678,
//     defaultJoinTime: 180,
//     traffic: {
//         in: { hits: 21, bytes: 168 },
//         out: { hits: 6, bytes: 72 }
//     }
// }
```

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

    | Property     | Type     | Mandatory | Description                                                  |
    |--------------|----------|-----------|--------------------------------------------------------------|
    | read         | Function | required  | Driver to read an attribute from a remote gadget             |
    | write        | Function | required  | Driver to write an attribute value to a remote gadget        |
    | exec         | Function | optional  | [TODO]                                                       |
    | getReportCfg | Function | optional  | [TODO]                                                       |
    | setReportCfg | Function | optional  | [TODO]                                                       |

**Returns:**  

* (_Object_): netcore itself

**Examples:**  
  
```js
var bleGadDrivers = {
    // [TODO] arguments
    read: function () {},
    write: function () {},
    exec: function () {},
    getReportCfg: function () {},
    setReportCfg: function () {}
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

********************************************
<a name="API_start"></a>
### .start(callback)
Start the network controller.  

**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.start(function (err, result) {
    
});
```

********************************************
<a name="API_stop"></a>
### .stop(callback)
Stop the network controller.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js
```js
nc.stop(function (err, result) {
    
});
```

********************************************
<a name="API_reset"></a>
### .reset(mode, callback)
Reset the network controller.  
  
**Arguments:**  

1. `mode` (_Number_): [TODO]  
2. `callback` (_Function_):  `function (err, result) { }`. The `rsp` object has a status code to indicate whether the operation is successful.  

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.reset(0, function (err, result) {
    
});
```

********************************************
<a name="API_permitJoin"></a>
### .permitJoin(duration[, callback])
Let the network controller allow devices to join its network.  
  
**Arguments:**  

1. `duration` (_Number_): [TODO]  
2. `callback` (_Function_):  `function (err, result) { }`. The `rsp` object has a status code to indicate whether the operation is successful.  

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.permitJoin(180, function (err, result) {
    
});
```

********************************************
<a name="API_remove"></a>
### .remove(permAddr, callback)
Remove a remote device from the network.  
  
**Arguments:**  

1. `permAddr` (_String_): Device permanent address  
2. `callback` (_Function_):  `function (err, val) { }`. The `rsp` object has a status code to indicate whether the operation is successful.  

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.remove('00:2c:3d:..', function (err, result) {
    
});
```

********************************************
<a name="API_ban"></a>
### .ban(permAddr, callback)
Ban a device from the network. Once a device is banned, it can never join the network till you unban it.  
  
**Arguments:**  

1. `permAddr` (_String_): Device permanent address  
2. `callback` (_Function_):  `function (err, val) { }`. The `rsp` object has a status code to indicate whether the operation is successful.  

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.ban('00:2c:3d:..', function (err, result) {
    
});
```

********************************************
<a name="API_unban"></a>
### .unban(permAddr, callback)
Unban a device.  
  
**Arguments:**  

1. `permAddr` (_String_): Device permanent address  
2. `callback` (_Function_):  `function (err, val) { }`. The `rsp` object has a status code to indicate whether the operation is successful.  

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.unban('00:2c:3d:..', function (err, result) {
    
});
```

********************************************
<a name="API_ping"></a>
### .ping(permAddr, callback)
Ping a remote device.  
  
**Arguments:**  

1. `permAddr` (_String_): Device permanent address  
2. `callback` (_Function_):  `function (err, val) { }`. The `rsp` object has a status code to indicate whether the operation is successful.  

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.ping('00:2c:3d:..', function (err, time) {
    
});
```

********************************************
<a name="API_devRead"></a>
### .devRead(permAddr, attrName, callback)
Read an attribute from the remote device.  
  
**Arguments:**  

1. `permAddr` (_String_): Device permanent address  
2. `attrName` (_Object_): Name of which attribute you'd like to [TODO]  
3. `callback` (_Function_):  `function (err, val) { }`. The `rsp` object has a status code to indicate whether the operation is successful.  

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.devRead('00:2c:3d:..', 'version', function (err, val) {
    
});
```

********************************************
<a name="API_devWrite"></a>
### .devWrite(permAddr, attrName, val, callback)
Write a value to an attribute to the remote device.  
  
**Arguments:**  

1. `permAddr` (_String_): Device permanent address  
2. `attrName` (_Object_): Name of which attribute you'd like to [TODO]  
3. `val` (_Depends_): [TODO]  
4. `callback` (_Function_):  `function (err, val) { }`. The `rsp` object has a status code to indicate whether the operation is successful.  

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.devWrite('00:2c:3d:..', 'version', '0.1.2', function (err, val) {
    
});
```

********************************************
<a name="API_identify"></a>
### .identify(permAddr, callback)
Identify a remote device. If the remote device does not support this feature, invoking this API will be ineffective.  
  
**Arguments:**  

1. `permAddr` (_String_): Device permanent address  
2. `callback` (_Function_):  `function (err, val) { }`. The `rsp` object has a status code to indicate whether the operation is successful.  

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.identify('00:2c:3d:..', function (err, data) {
    
});
```

********************************************
<a name="API_gadRead"></a>
### .gadRead(permAddr, auxId, attrName, callback)
Read an attribute from a gadget on the remote device.  
  
**Arguments:**  

1. `permAddr` (_String_): Device permanent address  
2. `auxId` (_String_ | _Number_): Auxiliary id to indentify the gadget on a device  
3. `attrName` (_Object_): Name of which attribute you'd like to [TODO]  
4. `callback` (_Function_):  `function (err, val) { }`. The `rsp` object has a status code to indicate whether the operation is successful.  

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.gadRead('00:2c:3d:..', 'humidity/2, 'sensorValue', function (err, data) {
    
});
```

********************************************
<a name="API_gadWrite"></a>
### .gadWrite(permAddr, auxId, attrName, val, callback)
Write a value to an attribute to a gadget on the remote device.  
  
**Arguments:**  

1. `permAddr` (_String_): Device permanent address  
2. `auxId` (_String_ | _Number_): Auxiliary id to indentify the gadget on a device  
3. `attrName` (_Object_): Name of which attribute you'd like to [TODO]  
4. `val` (_Depends_): [TODO]  
5. `callback` (_Function_):  `function (err, val) { }`. The `rsp` object has a status code to indicate whether the operation is successful.  

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.gadWrite('00:2c:3d:..', 'lightCtrl/0', 'onOff', 1, function (err, val) {
    
});
```

********************************************
<a name="API_gadExec"></a>
### .gadExec(permAddr, auxId, attrName, args, callback)
Issue a remote process call to a gadget on the remote device.  
  
**Arguments:**  

1. `permAddr` (_String_): Device permanent address  
2. `auxId` (_String_ | _Number_): Auxiliary id to indentify the gadget on a device  
3. `attrName` (_Object_): Name of which attribute you'd like to [TODO]  
4. `args` (_Array_): [TODO]  
5. `callback` (_Function_):  `function (err, rsp) { }`. The `rsp` object has a status code to indicate whether the operation is successful.  

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.gadExec('00:2c:3d:..', 'led/3', 'blink', [ 3 ], function (err, rsp) {
    
});

```

********************************************
<a name="API_getReportCfg"></a>
### .getReportCfg(permAddr, auxId, attrName, callback)
Get the report configuration from a gadget on the remote device.  
  
**Arguments:**  

1. `permAddr` (_String_): Device permanent address  
2. `auxId` (_String_ | _Number_): Auxiliary id to indentify the gadget on a device  
3. `attrName` (_Object_): Name of which attribute you'd like to get its reporting configuration  
4. `callback` (_Function_):  `function (err, cfg) { }`. The `rsp` object has a status code to indicate whether the operation is successful.  

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.getReportCfg('00:2c:3d:..', 'temperature/0', 'sensorValue', function (err, cfg) {
    if (!err)
        console.log(cfg);
        // { pmin: 60, pmax: 180 }
});
```

********************************************
<a name="API_setReportCfg"></a>
### .setReportCfg(permAddr, auxId, attrName, cfg, callback)
Set the report configuration to a gadget on the remote device.  
  
**Arguments:**  

1. `permAddr` (_String_): Device permanent address  
2. `auxId` (_String_ | _Number_): Auxiliary id to indentify the gadget on a device  
3. `attrName` (_Object_): Name of which attribute you'd like to set its reporting behavior  
4. `cfg` (_Object_): Report configuration  

    | Property | Type    | Mandatory | Description |
    |----------|---------|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | pmin     | Number  | optional  | Minimum Period. Minimum time in seconds the Client Device should wait from the time when sending the last notification to the time when sending a new notification.                                     |
    | pmax     | Number  | optional  | Maximum Period. Maximum time in seconds the Client Device should wait from the time when sending the last notification to the time sending the next notification (regardless if the value has changed). |
    | gt       | Number  | optional  | Greater Than. The Client Device should notify its value when the value is greater than this setting. Only valid for the Resource typed as a number.                                                     |
    | lt       | Number  | optional  | Less Than. The Client Device should notify its value when the value is smaller than this setting. Only valid for the Resource typed as a number.                                                        |
    | stp      | Number  | optional  | Step. The Client Device should notify its value when the change of the Resource value, since the last report happened, is greater than this setting.                                                    |
    | enable   | Boolean | optional  | Set to `true` for a Client Device to enable observation on the allocated Resource or Object Instance.                                                                                                   |

4. `callback` (_Function_):  `function (err, rsp) { }`. The `rsp` object has a status code to indicate whether the operation is successful.  

    | Property | Type    | Description                                                             |
    |----------|---------|-------------------------------------------------------------------------|
    |  status  | Number  | Status code of the response. Possible status codes are 204, 400, 404, and 408. See [Status Code](#).                      |

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.setReportCfg('00:2c:3d:..', 'temperature/0', 'sensorValue', { pmin: 60, pmax: 180 }, function (err) {
    
});
```

## Signatures for drivers

* net
    - start: `function(callback) {}`
        * `callback(err)` should be called after done
    - stop: `function(callback) {}`
        * `callback(err)` should be called after done
    - reset: `function(mode, callback) {}`
        * `callback(err)` should be called after done
    - permitJoin: `function(duration, callback) {}`
        * `callback(err, timeLeft)` should be called after done
        * timeLeft (_Number_): Time left for joining in seconds, e.g., 180.
    - remove: `function(permAddr, callback) {}`
        * `callback(err, permAddr)` should be called after done
        * permAddr (_String_): permAddr, e.g., '0x12345678'.
    - ban: `function(permAddr, callback) {}`
        * `callback(err, permAddr)` should be called after done
        * permAddr (_String_): permAddr, e.g., '0x12345678'.
    - unban: `function(permAddr, callback) {}` should be called after done
        * `callback(err, permAddr)` should be called after done
        * permAddr (_String_): permAddr, e.g., '0x12345678'.
    - ping: `function(permAddr, callback) {}, callback(err, time), `
        * `callback(err, time)` should be called after done
        * time (_Number_): round-trip time in milliseconds, e.g., 16.
* dev
    - read: `function(permAddr, attr, callback) {}`
        * `callback(err, val)` should be called after done
        * val (_Depends_): value read. Type denpends, e.g., `'hello'`, `12`, `false`.
    - write: `function(permAddr, attr, val, callback) {}, ),`
        * `callback(err, val)`
        * val: value written (optional, Type denpends, ex: 'hello', 12, false)
    - identify: `function(permAddr, callback) {}`
        * `callback(err)`
* gad
    - read: `function(permAddr, auxId, attr, callback) {}`
        * `callback(err, val)`
        * val (_Depends_): value read (Type denpends, ex: 'hello', 12, false)
    - write: `function(permAddr, auxId, attr, val, callback) {}`
        * `callback(err, val)`
        * val (_Depends_): value written (optional, Type denpends, ex: 'hello', 12, false)
    - exec: `function(permAddr, auxId, attr, args, callback) {}`
        * `callback(err, result)`
        * result (_Depends_): can be anything, depends on firmware
    - setReportCfg: `function(permAddr, auxId, attrName, cfg, callback) {}`
        * `callback(err, result)`
        * result (_Depends_): set succeeds? (Boolean, true or false)
    - getReportCfg: `function(permAddr, auxId, attrName, callback) {}`
        * `callback(err, cfg)`
        * cfg (_Object_): config object (Object, ex: { pmin: 10, pmax: 60, gt: 200 })


// For standalone usage
// function attachOnEventHandlers(nc) {
//     nc.onError = null;
//     nc.onReady = null;
//     nc.onEnabled = null;
//     nc.onPermitJoin = null;
//     nc.onDevIncoming = null;
//     nc.onDevLeaving = null;
//     nc.onDevReporting = null;
//     nc.onDevNetChanging = null;
//     nc.onGadIncoming = null;
//     nc.onGadReporting = null;
//     nc.onBannedDevIncoming = null;
//     nc.onBannedDevReporting = null;
//     nc.onBannedGadIncoming = null;
//     nc.onBannedGadReporting = null;

//     nc.onDevError = null;
//     nc.onDevNetChanged = null;
//     nc.onDevPropsChanged = null;
//     nc.onDevAttrsChanged = null;

//     nc.onGadError = null;
//     nc.onGadPanelChanged = null;
//     nc.onGadPropsChanged = null;
//     nc.onGadAttrsChanged = null;
// }