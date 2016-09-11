# Netcore Class
The Netcore Class provides methods of network management.  

<a name="Basic"></a>
## 1. Basic Methods

* [Netcore()](#API_Netcore)
* [getName()](#API_getName)
* [isEnabled()](#API_isEnabled)
* [isRegistered()](#API_isRegistered)
* [isJoinable()](#API_isJoinable)
* [enable()](#API_enable)
* [disable()](#API_disable)
* [dump()](#API_dump)

* Network Management
    * [start()](#API_start)
    * [stop()](#API_stop)
    * [reset()](#API_reset)
    * [permitJoin()](#API_permitJoin)
    * [remove()](#API_remove)
    * [ban()](#API_ban)
    * [unban()](#API_unban)
    * [ping()](#API_ping)
    * [getTraffic()](#API_getTraffic)
    * [resetTraffic()](#API_resetTraffic)
    * [getBlacklist()](#API_getBlacklist)
    * [clearBlacklist()](#API_clearBlacklist)
    * [isBlacklisted()](#API_isBlacklisted)

* Remote Device Operations
    * [devRead()](#API_devRead)
    * [devWrite()](#API_devWrite)
    * [identify()](#API_identify)

* Remote Gadget Operations
    * [gadRead()](#API_gadRead)
    * [gadWrite()](#API_gadWrite)
    * [gadExec()](#API_gadExec)
    * [getReportCfg()](#API_getReportCfg)
    * [setReportCfg()](#API_setReportCfg)

********************************************
<a name="API_Netcore"></a>
### Netcore(name, controller, protocol[, opt])
Netcore constructor. It is suggested to use freebird-base `.createNetcore()` method to create a new instance of Netcore.  
  
**Arguments:**  

1. `name` (_String_): Netocre name
2. `controller` (_Object_): Low-level controller, for example, `ble-shepherd`
3. `protocol` (_Object_): Information of the used protocol

    | Property | Type    | Mandatory | Description          |
    |----------|---------|-----------|----------------------|
    | phy      | String  | required  | Physic layer         |
    | dll      | String  | optional  | Data link layer      |
    | nwk      | String  | required  | Network layer        |
    | tl       | String  | optional  | Transportation layer |
    | sl       | String  | optional  | Session layer        |
    | pl       | String  | optional  | Presentation layer   |
    | apl      | String  | optional  | Application layer    |

4. `opt` (_Object_): Optional settings

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
<a name="API_getName"></a>
### .getName()
Get netcore name.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_String_): Name of the netcore.  

**Examples:**  
  
```js
nc.getName();  // 'my_netcore'
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
To see if the netcore is currently allowing for devices to join the network.  

**Arguments:**  

* _none_

**Returns:**  

* (_Boolean_): `true` if joinable, otherwise `false`.  

**Examples:**  
  
```js
nc.isJoinable();  // true
```

********************************************
<a name="API_enable"></a>
### .enable()
Enable netcore. Transportation is working when netcore is enabled.   
  
**Arguments:**  

* _none_

**Returns:**  

* (_Object_): netcore

**Examples:**  
  
```js
nc.enable();
```

********************************************
<a name="API_disable"></a>
### .disable()
Disable network. Any transportation will be ignore if netcore is disabled, and all remote operations become no use as well.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Object_): netcore

**Examples:**  
  
```js
nc.disable();
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

/*
{
    name: 'my_netcore',
    enabled: true,
    protocol: {
        phy: 'ieee802.15.1',
        nwk: 'ble'
    },
    startTime: 12345678,
    defaultJoinTime: 180
}
*/
```

********************************************
<a name="API_start"></a>
### .start(callback)
Start the network controller.  

**Arguments:**  

1. `callback` (_Function_): `function (err) {}`. Get called after started.  

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.start(function (err) {
    if (!err)
        console.log('netcore is up.');
});
```

********************************************
<a name="API_stop"></a>
### .stop(callback)
Stop the network controller.  
  
**Arguments:**  

1. `callback` (_Function_): `function (err) {}`. Get called after stopped.  

**Returns:**  

* _none_

**Examples:**  
  
```js
```js
nc.stop(function (err) {
    if (!err)
        console.log('netcore is down.');
});
```

********************************************
<a name="API_reset"></a>
### .reset([mode,] callback)   [TBD]
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

1. `duration` (_Number_): Duration in seconds for netcore allowing devices to join the network. Set it to `0` can immediately close the admission.  
2. `callback` (_Function_):  `function (err, timeLeft) { }`. Get called when netcore starts/stops to permit joining, where `timeLeft` is a number that indicates time left for device joining in seconds, e.g., 180.

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.permitJoin(180, function (err, timeLeft) {
    if (!err)
        console.log(timeLeft);  // 160
});

nc.permitJoin(0, function (err, timeLeft) {
    if (!err)
        console.log(timeLeft);  // 0
});
```

********************************************
<a name="API_remove"></a>
### .remove(permAddr, callback)
Remove a remote device from the network.  
  
**Arguments:**  

1. `permAddr` (_String_): Device permanent address  
2. `callback` (_Function_):  `function (err, permAddr) { }`. Get called after removal, where `permAddr` is permananet address of that device.

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.remove('00:0c:29:ff:ed:7c', function (err, permAddr) {
    if (!err)
        console.log(permAddr);  // 00:0c:29:ff:ed:7c
});
```

********************************************
<a name="API_ban"></a>
### .ban(permAddr, callback)
Ban a device from the network. Once a device is banned, it can never join the network till you unban it.  
  
**Arguments:**  

1. `permAddr` (_String_): Device permanent address  
2. `callback` (_Function_):  `function (err, permAddr) { }`. Get called after device banned, where `permAddr` is permananet address of that device.  

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.ban('00:0c:29:ff:ed:7c', function (err, permAddr) {
    if (!err)
        console.log(permAddr);  // 00:0c:29:ff:ed:7c
});
```

********************************************
<a name="API_unban"></a>
### .unban(permAddr, callback)
Unban a device.  
  
**Arguments:**  

1. `permAddr` (_String_): Device permanent address  
2. `callback` (_Function_):  `function (err, val) { }`. Get called after device unbanned, where `permAddr` is permananet address of that device.  

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.unban('00:0c:29:ff:ed:7c', function (err, permAddr) {
    if (!err)
        console.log(permAddr);  // 00:0c:29:ff:ed:7c
});
```

********************************************
<a name="API_ping"></a>
### .ping(permAddr, callback)
Ping a remote device.  
  
**Arguments:**  

1. `permAddr` (_String_): Device permanent address  
2. `callback` (_Function_):  `function (err, time) { }`. Get called after ping response comes back, where `time` is the round-trip time in milliseconds, e.g., 16.

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.ping('00:0c:29:ff:ed:7c', function (err, time) {
    if (!err)
        console.log(time);  // 42
});
```

********************************************
<a name="API_getTraffic"></a>
### .getTraffic()
Get traffic record of the netcore.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Object_): Traffic record of this netcore.  

**Examples:**  
  
```js
nc.getTraffic();
/*
{
    in: {
        hits: 1422,
        bytes: 896632
    },
    out: {
        hits: 884,
        bytes: 36650
    }
}
*/
```

********************************************
<a name="API_resetTraffic"></a>
### .resetTraffic([dir])
Reset the traffic record.  
  
**Arguments:**  

1. `dir` (_String_): If given with `'in'`, the incoming traffic will be reset, else if given with `'out'`, the outgoing traffic will be reset. Both incoming and outgoing traffic records will be reset if `dir` is not specified.  

**Returns:**  

* (_Object_): netcore

**Examples:**  
  
```js
nc.resetTraffic();
nc.resetTraffic('in');
nc.resetTraffic('out');
nc.resetTraffic();
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

* (_Object_): netcore

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
## Remote Device Operations

<a name="API_devRead"></a>
### .devRead(permAddr, attrName, callback)
Read device attribute from the remote device.  
  
**Arguments:**  

1. `permAddr` (_String_): Device permanent address  
2. `attrName` (_Object_): Attribute name  
3. `callback` (_Function_):  `function (err, data) { }`  

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.devRead('00:0c:29:ff:ed:7c', 'model', function (err, val) {
    if (!err)
        console.log(data);  // 'lwmqn-7688-duo'
});
```

********************************************
<a name="API_devWrite"></a>
### .devWrite(permAddr, attrName, val, callback)
Remotely write a value to an attribue on this device.  
  
**Arguments:**  

1. `permAddr` (_String_): Device permanent address  
2. `attrName` (_Object_): Attribute name  
3. `val` (_Depends_): Attribute value to write to the device  
4. `callback` (_Function_):  `function (err, data) { }`  

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.devWrite('00:0c:29:ff:ed:7c', 'model', 'lwmqn-7688-happy-duo', function (err, data) {
    if (!err)
        console.log(data);  // 'lwmqn-7688-happy-duo'

    // Most devices don't accept writie operation upon the attribute!
    // Thus you probably will get an error.
});
```

********************************************
<a name="API_identify"></a>
### .identify(permAddr, callback)
Identify a remote device. If remote device does not implement this freature, it would be no effect.  
  
**Arguments:**  

1. `permAddr` (_String_): Device permanent address  
2. `callback` (_Function_):  `function (err) { }`  

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.identify('00:0c:29:ff:ed:7c', function (err) {
    if (!err)
        console.log('The device is enter identifying mode.');
});
```

********************************************
## Remote Gadget Operations

<a name="API_gadRead"></a>
### .gadRead(permAddr, auxId, attrName, callback)
Read an attribute from a gadget on the remote device.  
  
**Arguments:**  

1. `permAddr` (_String_): Device permanent address  
2. `auxId` (_String_ | _Number_): Auxiliary id of the gadget on a device  
3. `attrName` (_Object_): Attribute name  
4. `callback` (_Function_):  `function (err, data) { }`  

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.gadRead('00:0c:29:ff:ed:7c', 'humidity/2', 'sensorValue', function (err, data) {
    if (!err)
        console.log(data);  // 52.6
});
```

********************************************
<a name="API_gadWrite"></a>
### .gadWrite(permAddr, auxId, attrName, val, callback)
Write a value to an attribute to a gadget on the remote device.  
  
**Arguments:**  

1. `permAddr` (_String_): Device permanent address  
2. `auxId` (_String_ | _Number_): Auxiliary id of the gadget on a device  
3. `attrName` (_Object_): Attribute name  
4. `val` (_Depends_): Attribute value to write to the gadget   
5. `callback` (_Function_):  `function (err, data) { }`.  

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.gadWrite('00:0c:29:ff:ed:7c', 'lightCtrl/0', 'onOff', 1, function (err, data) {
    if (!err)
        console.log(data); // 1
});
```

********************************************
<a name="API_gadExec"></a>
### .gadExec(permAddr, auxId, attrName, args, callback)
Remotely invoke the procedure on this gadget.  
  
**Arguments:**  

1. `permAddr` (_String_): Device permanent address  
2. `auxId` (_String_ | _Number_): Auxiliary id of the gadget on a device  
3. `attrName` (_Object_): Attribute name  
4. `args` (_Array_): Arguments to invoke with  
5. `callback` (_Function_):  `function (err, data) { }`  

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.gadExec('00:0c:29:ff:ed:7c', 'led/3', 'blink', [ 3 ], function (err, data) {
    if (!err)
        console.log(data);  // Depends
});

```

********************************************
<a name="API_getReportCfg"></a>
### .getReportCfg(permAddr, auxId, attrName, callback)
Get the report configuration from a gadget on the remote device.  
  
**Arguments:**  

1. `permAddr` (_String_): Device permanent address  
2. `auxId` (_String_ | _Number_): Auxiliary id of the gadget on a device  
3. `attrName` (_Object_): Attribute name  
4. `callback` (_Function_):  `function (err, cfg) { }`  

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.getReportCfg('00:0c:29:ff:ed:7c', 'temperature/0', 'sensorValue', function (err, cfg) {
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
2. `auxId` (_String_ | _Number_): Auxiliary id of the gadget on a device  
3. `attrName` (_Object_): Attribute name  
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
nc.setReportCfg('00:0c:29:ff:ed:7c', 'temperature/0', 'sensorValue', { pmin: 60, pmax: 180 }, function (err) {
    if (!err)
        console.log('success!');
});
```

********************************************
## Standalone Usage

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