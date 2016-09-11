# Device Class
The Device Class defines a device which can have many gadgets(applications) on it. A device is a real machine-node in the network, such as a CC2530 ZigBee SoC, a CC2540 BLE SoC, a ESP8266 WiFi SoC, and a MT7688 WiFi module. This document will show you what methods does a device have.  

## APIs

* [new Device()](#API_Device)
* [isEnabled()](#API_isEnabled)
* [isRegistered()](#API_isRegistered)
* [enable()](#API_enable)
* [disable()](#API_disable)
* [resetTraffic()](#API_resetTraffic)
* [dump()](#API_dump)
* Getter and Setter
    - [get()](#API_get)
    - [set()](#API_set)
* Remote Operations
    - [read()](#API_read)
    - [write()](#API_write)
    - [identify()](#API_identify)
    - [ping()](#API_ping)
    - [refresh()](#API_refresh)
* Data Formats
    - [net](#Data_net)
    - [props](#Data_props)
    - [attrs](#Data_attrs)

********************************************
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
<a name="API_isEnabled"></a>
### .isEnabled()
Checks if this device is enabled.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Boolean_): Returns `true` if enabled, else `false`.  

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

* (_Boolean_): Returns `true` if registered, else `false`.  

**Examples:**  
  
```js
myDevice.isRegistered();   // false
```

********************************************
<a name="API_enable"></a>
### .enable()
Enable this device. Transportation is working when device is enabled.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Object_): device

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

* (_Object_): device

**Examples:**  
  
```js
myDevice.disable();
```

********************************************
<a name="API_resetTraffic"></a>
### .resetTraffic([dir])
Reset the traffic record.  
  
**Arguments:**  

1. `dir` (_String_): If given with `'in'`, the incoming traffic will be reset, else if given with `'out'`, the outgoing traffic will be reset. Both incoming and outgoing traffic records will be reset if `dir` is not specified.  

**Returns:**  

* (_Object_): device

**Examples:**  
  
```js
myDevice.resetTraffic('in');
myDevice.resetTraffic('out');
myDevice.resetTraffic();
```

********************************************
<a name="API_dump"></a>
### .dump()
Dump the information about this device.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Object_): Information about this device.  

| Property | Type   | Description                                                      |
|----------|--------|------------------------------------------------------------------|
| netcore  | String | Netcore name                                                     |
| id       | Number | Device id assigned by freebird                                   |
| gads     | Array  | Gadget records, each record has a shape of `{ gadId, auxId }`    |
| net      | Object | Network information obecjt ([net](#Data_net))                    |
| attrs    | Object | Device attributes ([attrs](#Data_attrs))                         |
| props    | Object | User-defined properties ([props](#Data_props))                   |


**Examples:**  
  
```js
myDevice.dump();
/*
{
    netcore: 'freebird-netcore-mqtt',
    id: 268,
    gads: [
        { gadId: 721, auxId: 'temperature/0' },
        { gadId: 722, auxId: 'temperature/1' },
        { gadId: 723, auxId: 'humidity/0' }
    ],
    net: {
        enabled: true,
        joinTime: 1458008311,
        timestamp: 1458008617,
        traffic: {
            in: { hits: 882, bytes: 77826 }
            out: { hits: 67, bytes: 1368  }
        },
        role: 'end-device',
        parent: '0x24576052CDEF',
        maySleep: true,
        sleepPeriod: 60,
        status: 'online',
        address: {
            permanent: '0x123456789abcdef',
            dynamic: 10163 
        }
    },
    attrs: {
        manufacturer: 'freebird',
        model: 'lwmqn-7688-duo',
        serial: 'lwmqn-2016-03-15-01',
        version: {
            hw: 'v1.2.0',
            sw: 'v0.8.4',
            fw: 'v2.0.0'
        },
        power: {
            type: 'line',
            voltage: '5V'
        }
    },
    props: {
        name: 'home sensor 1',
        description: 'It measures temp and humidity in kitchen.',
        location: 'kitchen'
    }
}
*/
```

********************************************
## Getter and Setter

<a name="API_get"></a>
### .get(name)
Getter to get the required information.  
  
**Arguments:**  

1. `name` (_String_): Possible names are listed in the follwoing table.  

| Name                | Description                                                                                                                             | Example                      | Returned Data Type             |  
|---------------------|-----------------------------------------------------------------------------------------------------------------------------------------|------------------------------|--------------------------------|  
| 'id'                | Get device id assigned by freebird. It will be `null` if it is not registered to freebird.                                              | `myDevice.get('id')`         |  Number \| String              |  
| 'rawDev'            | Get raw device data which may be `undefined` if it was not given at instance creation.                                                  | `myDevice.get('rawDev')`     |  Object                        |  
| 'raw'               | Alias of `'rawDev'`.                                                                                                                    | `myDevice.get('raw')`        |  -                             |  
| 'nectcore'          | Get the netcore that manages this device.                                                                                               | `myDevice.get('netcore')`    |  Object ([Netcore])            |
| 'nc'                | Alias of `'netcore'`.                                                                                                                   | `myDevice.get('nc')`         |  -                             |  
| 'address'           | Get device permanent and dynamic addresses. Returned object has a shape of `{ permanent, dynamic }`.                                    | `myDevice.get('address')`    |  Object                        |  
| 'addr'              | Alias of `'address'`.                                                                                                                   | `myDevice.get('addr')`       |  -                             |  
| 'permAddr'          | Get device permanent address. For exameple, `'00:0c:29:ff:ed:7c'`.                                                                      | `myDevice.get('permAddr')`   |  String                        |  
| 'dynAddr'           | Get device dynamic address. For exameple, `'192.168.1.96'`.                                                                             | `myDevice.get('dynAddr')`    |  String \| Number              |  
| 'status'            | Get device status. Could be `'online'`, `'offline'`, `'sleep'`, and `'unknown'`.                                                        | `myDevice.get('status')`     |  String                        |  
| 'gadTable'          | Get the table of gadget records on this device. Returned array has a shape of `[ { gadId, auxId }, ... ]`.                              | `myDevice.get('gadTable')`   |  Array                         |  
| 'traffic'           | Get the current traffic record of this device. Returned object has a shape of `{ in: { hits, bytes }, out: { hits, bytes } }`.          | `myDevice.get('traffic')`    |  Object                        |  
| 'net'               | Get network information of this device. You can give a single key or an array of keys to choose what information you'd like to get.     | `myDevice.get('net')`        |  Object ([net](#Data_net))     |  
| 'attrs'             | Get attributes of this device.                                                                                                          | `myDevice.get('attrs')`      |  Object ([attrs](#Data_attrs)) |  
| 'props'             | Get user-defined properties of this device. You can give a single key or an array of keys to choose what information you'd like to get. | `myDevice.get('props')`      |  Object ([props](#Data_props)) |  


**Returns:**  

* (_Depends_): If `name` is none of the listed property, always returns `undefined`.  

**Examples:**  
  
```js
myDevice.get('foo_name');   // undefined

myDevice.get('id');         // 18

myDevice.get('raw');
myDevice.get('rawGad');     // { ieeeAddr: '0x123456789abcdef', nwkAddr: 0x27B3, ... }

myDevice.get('nc');
myDevice.get('netcore');    // netcore instance

myDevice.get('addr');
myDevice.get('address');    // { permanent: '0x123456789abcdef', dynamic: 10163 };

myDevice.get('permAddr');   // '0x123456789abcdef'
myDevice.get('dynAddr');    // 10163

myDevice.get('status');   // 'online'. Can be `'online'`, `'offline'`, `'sleep'`, and `'unknown'`.  

myDevice.get('gadTable');
/*
[
    { gadId: 28, auxId: 'temperature/0' },
    { gadId: 29, auxId: 'temperature/1' },
    { gadId: 30, auxId: 'humidity/0' }
]
*/

myDevice.get('traffic');
/*
{
    in: { hits: 6, bytes: 220 },
    out: { hits: 8, bytes: 72 }
}
*/

myDevice.get('net');  // true
/*
{
    enabled: true,
    joinTime: 1458008311,
    timestamp: 1458008617,
    traffic: {
        in: { hits: 882, bytes: 77826 }
        out: { hits: 67, bytes: 1368  }
    },
    role: 'end-device',
    parent: '0x24576052CDEF',
    maySleep: true,
    sleepPeriod: 60,
    status: 'online',
    address: {
        permanent: '0x123456789abcdef',
        dynamic: 10163 
    }
}
*/

myDevice.get('attrs');
/*
{
    manufacturer: 'sivann',
    model: 'zb-temperature-sensor',
    serial: 'zb-2016-03-28-002',
    version: {
        hw: '0.8.0',
        sw: '0.4.2',
        fw: '0.4.2'
    },
    power: {
        type: 'battery',
        voltage: '3.3V'
    }
}
*/

myDevice.get('props');
/*
{
    name: 'home sensor 1',          // client user set at will
    description: 'detect heat',     // client user set at will
    location: 'kitchen'             // client user set at will
    // There may be other properties
}
*/
```

********************************************
<a name="API_set"></a>
### .set(name, value)
Setter to set the value to device.  
  
**Arguments:**  

1. `name` (_String_): Possible names are `'net'`, `'attrs'`, and `'props'`.
2. `value` (_Depends_)

* `set('net', value)`
    - Locally set network information on the device. Setting of `'enabled'` property will be ignored, should use `enable()` and `disable()` instead.
    - `value` (_Object_): An object contains key-value pairs of the network information.
* `set('attrs', value)`
    - Locally set attributes on the device. Only attributes listed in [attrs](#Data_attrs) are accepted. If you like to have some additional attributes, please use `set('props', value)`.
    - `value` (_Object_): An object contains key-value pairs of the attributes.
* `set('props', value)`
    - Locally set properties on the device. This is for customization, you are free to add any property you like.
    - `value` (_Object_): An object contains key-value pairs of the properties.

**Returns:**  

* (_Object_): device

**Examples:**  

```js
myDevice.set('net', {
    enabled: true,      // this will be ignore, use enable() or disable() instead
    status: 'online'
});

myDevice.set('attrs', {
    manufacturer: 'foo_brand'
});

myDevice.set('props', {
    greeting: 'hello world!'
});
````

********************************************
## Remote Operations

<a name="API_read"></a>
### .read(attrName, callback)
Read device attribute from the remote device.  
  
**Arguments:**  

1. `attrName` (_String_): Attribute name  
2. `callback` (_Function_): `function (err, data) {}`  

**Returns:**  

* _none_

**Examples:**  
  
```js
myDevice.read('model', function (err, data) {
    if (!err)
        console.log(data);  // 'lwmqn-7688-duo'
});
```

********************************************
<a name="API_write"></a>
### .write(attrName, val[, callback])
Remotely write a value to an attribue on this device.  
  
**Arguments:**  

1. `attrName` (_String_):  Attribute name  
2. `val` (_Depends_): Attribute value to write to the device  
3. `callback` (_Function_): `function (err, data) {}`  

**Returns:**  

* _none_

**Examples:**  
  
```js
myDevice.write('model', 'lwmqn-7688-happy-duo', function (err, data) {
    if (!err)
        console.log(data);  // 'lwmqn-7688-happy-duo'

    // Most devices don't accept writie operation upon the attribute!
    // Thus you probably will get an error.
});
```

********************************************
<a name="API_identify"></a>
### .identify(callback)
Identify this device. If remote device does not implement this freature, it would be no effect.  
  
**Arguments:**  

1. `callback` (_Function_): `function (err) {}`  

**Returns:**  

* _none_

**Examples:**  
  
```js
myDevice.identify(function (err) {
    if (err)
        console.log(err);

    // If no driver, an error will occur.
});
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
myDevice.ping(function (err, time) {
    if (!err)
        console.log(time);  // 26, this value is in milliseconds
});
```

********************************************
<a name="API_refresh"></a>
### .refresh(callback)
Refresh the status and attributes from the remote device.  
  
**Arguments:**  

1. `callback` (_Function_): `function (err, attrs) {}`  

**Returns:**  

* (_Object_): device

**Examples:**  
  
```js
myDevice.refresh(function (err, attrs) {
    if (!err)
        console.log('device refreshed.');
});
```

********************************************
## Data Formats

[TBD]

<a name="Data_net"></a>
### network information

| Property    | Type    | Description                                                                                                |  
|-------------|---------|------------------------------------------------------------------------------------------------------------|  
| enabled     | Boolean | Tells if this device is enabled.                                                                           |  
| joinTime    | Number  | Device joined time, which is an UNIX(POSIX) time in ms.                                                    |  
| timestamp   | Number  | Timestamp at the last activity.                                                                            |  
| traffic     | Object  | The traffic record of this device.                                                                         |  
| role        | String  | Device role, which depends on protocol. For example, it may be `'peripheral'` of a BLE device.             |  
| parent      | String  | The parent of this device. It is `'0'` if the parent is the netcore, otherwise parent's permanent address. |  
| maySleep    | Boolean | Tells whether this device may sleep or not.                                                                |  
| sleepPeriod | Number  | The sleep period in seconds. This property is only valid when maySleep is `true`.                          |  
| status      | String  | Can be `'unknown'`, `'online'`, `'offline'`, or `'sleep'`.                                                 |  
| address     | Object  | The permanent and dynamic adrresses of this device. This object is in the format of `{ permanent: '00:01:xx', dynamic: '192.168.0.99' }`. |  

<a name="Data_attrs"></a>
### User-defined properties on this device.

| Property    | Type      | Description                                                                                                |  
|-------------|-----------|------------------------------------------------------------------------------------------------------------|  
| name        | String    | Human-redable name of this device, default will be `'unknown'` if not set. [TODO]                          |  
| description | String    | Device description. Default will be `'unknown'` if not set. [TODO]                                         |  
| location    | String    | Location of this device. Default will be `'unknown'` if not set. [TODO]                                    |  
| _Others_    | _Depends_ | Other props                                                                                                |  


<a name="Data_props"></a>
### Attributes on this device. The arrtibutes are coming from the remote machine.  

| Property     | Type            | Description                                                                                           |
|--------------|-----------------|-------------------------------------------------------------------------------------------------------|
| manufacturer | String          | Manufacturer name                                                                                     |
| model        | String          | Model name                                                                                            |
| serial       | String          | Serial number of this device.                                                                         |
| version      | Object          | Version tags. { hw: '', sw: 'v1.2.2', fw: 'v0.0.8' }                                                  |
| power        | Object          | Power source. { type: 'battery', voltage: '5V' }. The type can be 'line', 'battery' or 'harvester'    |

