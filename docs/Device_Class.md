# Device Class
The Device Class defines a device which can have many gadgets(applications) on it. A device is a real machine-node in the network, such as a CC2530 ZigBee SoC, a CC2540 BLE SoC, a ESP8266 WiFi SoC, and a MT7688 WiFi module. This document will show you what methods does a device have.  

## APIs

* [v new Device()](#API_Device)
* [v isEnabled()](#API_isEnabled)
* [v isRegistered()](#API_isRegistered)

* Getters
    * [v getNetcore()](#API_getNetcore)
    * [v getRawDev()](#API_getRawDev)
    * [v getId()](#API_getId)
    * [v getAddr()](#API_getAddr)
    * [v getPermAddr()](#API_getPermAddr)
    * [v getStatus()](#API_getStatus)
    * [v getGadTable()](#API_getGadTable)
    * [v getTraffic()](#API_getTraffic)
    * [getNetInfo()](#API_getNetInfo)
    * [getProps()](#API_getProps)
    * [getAttrs()](#API_getAttrs)
* Setters
    * [setNetInfo()](#API_setNetInfo)
    * [setProps()](#API_setProps)
    * [setAttrs()](#API_setAttrs)

* [v enable()](#API_enable)
* [v disable()](#API_disable)
* [resetTxTraffic()](#API_resetTxTraffic)
* [resetRxTraffic()](#API_resetRxTraffic)
* [read()](#API_read)
* [write()](#API_write)
* [identify()](#API_identify)
* [ping()](#API_ping)
* [refresh()](#API_refresh)
* [dump()](#API_dump)

********************************************
<a name="API_Device"></a>
### new Device(netcore[, rawDev])
New a device instance.  
  
**Arguments:**  

1. `netcore` (_Object_): The netcore to manage this device.  
2. `rawDev` (_Object_): Raw device, maybe a data object that contains many information about this device.  

**Returns:**  

* (_Object_): device, instance of Device class.

**Examples:**  
  
```js
var myNetcore = require('./my_foo_netcore');
var deviceRawData = {
    ieeeAddr: '0x123456789ABCDEF',
    nwkAddr: 0x27B3,
    // ...
};

var myDevice = new Device(myNetcore, deviceRawData);
```

********************************************
<a name="API_enable"></a>
### .enable()
Enable this device. Transportation is working if device is enabled.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Object_): device itself.

**Examples:**  
  
```js
myDevice.enable();
```

********************************************
<a name="API_disable"></a>
### .disable()
Disable this device. Any transportation will be ignore if device is disabled.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Object_): device itself.

**Examples:**  
  
```js
myDevice.disable();
```

********************************************
<a name="API_isEnabled"></a>
### .isEnabled()
Checks if this device is enabled.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Boolean_): Returns `true` if enabled, else `false.  

**Examples:**  
  
```js
myDevice.isEnabled();   // true
```

********************************************
<a name="API_isRegistered"></a>
### .isRegistered()
Checks if this device has been registered to freebird.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Boolean_): Returns `true` if registered, else `false.  

**Examples:**  
  
```js
myDevice.isRegistered();   // false
```

********************************************
<a name="API_getNetcore"></a>
### .getNetcore()
Get the netcore that manages this device.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Object_): The netcore, which is an instance of Netcore class.  

**Examples:**  
  
```js
myDevice.getNetcore();  // netcore instance
```

********************************************
<a name="API_getRawDev"></a>
### .getRawDev()
Get raw device data that came from the low-layer network controller. This is the data object used with the Device constructor. The raw data may be `undefined` if it was not given at instance creation.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Object_): The device raw data. Returns `undefined` if this device doesn't have raw data in it.  

**Examples:**  
  
```js
myDevice.getRawDev();   // { ieeeAddr: '0x123456789ABCDEF', nwkAddr: 0x27B3, ... }
```

********************************************
<a name="API_getId"></a>
### .getId()
Get device identifier assigned by freebird. It will be `null` if it is not registered to freebird.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Number_): Device identifier assigned by freebird. Returns `null` if not registered to freebird.  

**Examples:**  
  
```js
myDevice.getId();   // 18
```

********************************************
<a name="API_getAddr"></a>
### .getAddr()
Get device permanent and dynamic addresses.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Object_): The object has `permanent` and `dynamic` properties to show the permanent (e.g., mac) and the dynamic (e.g., ip) addresses of the device.  

| Property  | Type             | Description                                            |  
|-----------|------------------|--------------------------------------------------------|  
| permanent | String           | Permanent address, such as mac address, ieee address.  |  
| dynamic   | String \| Number | Dynamic address, such as ip address, network address.  |  


**Examples:**  
  
```js
myDevice.getAddr();   // { permanent: '0x123456789ABCDEF', dynamic: 10163 };
```

********************************************
<a name="API_getPermAddr"></a>
### .getPermAddr()
Get device permanent address.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_String_): Permanent address of the device.  

**Examples:**  
  
```js
myDevice.getPermAddr();   // '0x123456789ABCDEF'
```


********************************************
<a name="API_getStatus"></a>
### .getStatus()
Get device status.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_String_): Device status. Can be `'online'`, `'offline'`, `'sleep'`, and `'unknown'`.  

**Examples:**  
  
```js
myDevice.getStatus();   // 'online'
```

********************************************
<a name="API_getGadTable"></a>
### .getGadTable()
Get the table of gadget records on this device.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Array_): Returns an array that contains the record of gadgets on this device. The record is maintained by freebird. Each element in the array is an data object with keys given in the following table.  

| Property  | Type             | Description                                                                                                         |  
|-----------|------------------|---------------------------------------------------------------------------------------------------------------------|  
| gadId     | Number           | Gadget identifier assgined by frrebird.                                                                             |  
| auxId     | String \| Number | Auxiliary identifier to help allocate a gadget on the real device. The `auxId` is given by netcore driver designer. |  


**Examples:**  
  
```js
myDevice.getGadTable();
// [
//     { gadId: 28, auxId: 'temperature/0' },
//     { gadId: 29, auxId: 'temperature/1' },
//     { gadId: 30, auxId: 'humidity/0' }
// ]
```

********************************************
<a name="API_getTraffic"></a>
### .getTraffic([dir])
Get the current traffic record of this device.  
  
**Arguments:**  

1. `dir` (_String_): To tell the input or output traffic you'd like to get. Only accepts `'in'` or `'out'` if given.  

**Returns:**  

* (_Object_): The object has `in` and `out` properties to show traffic with this device.  

| Property  | Type   | Description                                                                                                |  
|-----------|--------|------------------------------------------------------------------------------------------------------------|  
| in        | Object | An object like `{ hits: 6, bytes: 220 }` to show the times and bytes of data that this device transmitted. |  
| out       | Object | An object like `{ hits: 8, bytes: 72 }` to show the times and bytes of data that this device received.     |  

**Examples:**  
  
```js
myDevice.getTraffic();
// {
//     in: { hits: 6, bytes: 220 },
//     out: { hits: 8, bytes: 72 }
// },

myDevice.getTraffic('in');  // { hits: 6, bytes: 220 }
myDevice.getTraffic('out'); // { hits: 8, bytes: 72 }
```

********************************************
<a name="API_getNetInfo"></a>
### .getNetInfo([keys])
Get network information of this device. You can give a single key or an array of keys to choose what information you'd like to get. The complete network info object has the following properties:   
  
| Property    | Type    | Description                                                                                                |  
|-------------|---------|------------------------------------------------------------------------------------------------------------|  
| enabled     | Boolean |                                                                                                            |  
| joinTime    | Number  |                                                                                                            |  
| timestamp   | Number  |                                                                                                            |  
| traffic     | Object  |                                                                                                            |  
| role        | String  |                                                                                                            |  
| parent      | String  |                                                                                                            |  
| maySleep    | Boolean |                                                                                                            |  
| sleepPeriod | Number  |                                                                                                            |  
| status      | String  |                                                                                                            |  
| address     | Object  |                                                                                                            |  



**Arguments:**  

1. `keys` (_String[]_): Array of keys. Return a whole object if not given.  

**Returns:**  

* _none_

**Examples:**  
  
```js
myDevice.getNetInfo('enabled'); // true
myDevice.getNetInfo([ 'enabled', 'status', 'address' ]);
// {
//     enabled: true,
//     status: 'online',
//     address: {
//         permanent: '0x123456789ABCDEF',
//         dynamic: 10163 
//     }
// }

myDevice.getNetInfo();
// {
//     enabled: true,
//     joinTime: 12222,
//     timestamp: 111,
//     traffic: {
//         in: { hits: 882, bytes: 77826 }
//         out: { hits: 67, bytes: 1368  }
//     },
//     role: 'end-device',
//     parent: '0x24576052CDEF',
//     maySleep: true,
//     sleepPeriod: 60,
//     status: 'online',
//     address: {
//         permanent: '0x123456789ABCDEF',
//         dynamic: 10163 
//     }
// }
```

********************************************
<a name="API_getProps"></a>
### .getProps([keys])
Get properties of this device.  
  
**Arguments:**  

1. `keys` (_String[]_): Array of keys. Return a whole object if not given.  

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_getAttrs"></a>
### .getAttrs([keys])
Get attributes of this device.  
  
**Arguments:**  

1. `keys` (_String[]_): Array of keys. Return a whole object if not given.  

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="setNetInfo"></a>
### .setNetInfo(info)
Locally set network information on the device. This may cause 'netChanged' event if device is enabled and registered to freebird.  
  
**Arguments:**  

1. `info` (_Object_): An object contains key-value pairs of the network information  

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="setProps"></a>
### .setProps(props)
Locally set properties on the device. This may cause 'propsChanged' event if device is enabled and registered to freebird.  
  
**Arguments:**  

1. `props` (_Object_): An object contains key-value pairs of the properties  

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="setAttrs"></a>
### .setAttrs(attrs)
Locally set attributes on the device. This may cause 'attrsChanged' event if device is enabled and registered to freebird.
  
**Arguments:**  

1. `attrs` (_Object_): An object contains key-value pairs of the attributes  

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_resetTxTraffic"></a>
### .resetTxTraffic()
Reset the transmitted traffic record.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_resetRxTraffic"></a>
### .resetRxTraffic()
Reset the received traffic record.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_dump"></a>
### .dump()
Dump the information about this device.  
  
**Arguments:**  

* _none_

**Returns:**  

* Object

**Examples:**  
  
```js

```

********************************************
<a name="API_refresh"></a>
### .refresh(callback)
Refresh the status and attributes from the remote device.  
  
**Arguments:**  

1. `callback` (_Function_): `function (err, attrs) {}`  

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_read"></a>
### .read(attrName, callback)
xx  
  
**Arguments:**  

1. `attrName` (_String_): Attribute name  
2. `callback` (_Function_): `function (err, data) {}`  

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_write"></a>
### .write(attrName, val[, callback])
Remotely write the value to an attribue on this device.  
  
**Arguments:**  

1. `attrName` (_String_):  Attribute name  
2. `val` (_Depends_): Attribute value to write to the device  
3. `callback` (_Function_): `function (err, data) {}`  

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_identify"></a>
### .identify([callback])
Identify this device. If remote device does not implement this freature, it would be no effect.  
  
**Arguments:**  

1. `callback` (_Function_): `function (err) {}`  

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_ping"></a>
### .ping(callback)
Ping this remote device.  
  
**Arguments:**  

1. `callback` (_Function_): `function (err, time) {}`  

**Returns:**  

* _none_

**Examples:**  
  
```js

```

