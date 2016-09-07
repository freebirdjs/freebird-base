# Device Class
The Device Class defines a device which can have many gadgets(applications) on it. A device is a real machine-node in the network, such as a CC2530 ZigBee SoC, a CC2540 BLE SoC, a ESP8266 WiFi SoC, and a MT7688 WiFi module. This document will show you what methods does a device have.  

## APIs

* [v new Device()](#API_Device)
* [v isEnabled()](#API_isEnabled)
* [v isRegistered()](#API_isRegistered)
* [v enable()](#API_enable)
* [v disable()](#API_disable)
* [v resetTraffic()](#API_resetTraffic)
* [v dump()](#API_dump)
* Getter and Setter
    - [get()](#API_get)
    - [set()](#API_set)
* Remote Operations
    - [v read()](#API_read)
    - [v write()](#API_write)
    - [v identify()](#API_identify)
    - [v ping()](#API_ping)
    - [v refresh()](#API_refresh)
    
  
********************************************
<a name="API_Device"></a>
### new Device(netcore[, rawDev])
New a device instance.  
  
**Arguments:**  

1. `netcore` (_Object_): The netcore that manages this device.  
2. `rawDev` (_Object_): Raw device, maybe a data object that contains many information about this device.  

**Returns:**  

* (_Object_): device

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

1. `dir` (_String_): If given with `'in'`, the incoming traffic will be reset, else if given with `'out'`, the outgoing traffic will be reset. Both incoming and outgoing traffic records will be reset.  

**Returns:**  

* (_Object_): device

**Examples:**  
  
```js
myDevice.resetTraffic();
myDevice.resetTraffic('in');
myDevice.resetTraffic('out');
```

********************************************
<a name="API_dump"></a>
### .dump()
Dump the information about this device.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Object_): Information about this device.  

| Property | Type   | Description               |
|----------|--------|---------------------------|
| netcore  | String | Netcore name              |
| id       | Number | Device id in freebird     |
| gads     | Array  | Gadget records            |
| net      | Object | Network information       |
| props    | Object | User-defined properties   |
| attrs    | Object | Device attributes         |


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
            permanent: '0x123456789ABCDEF',
            dynamic: 10163 
        }
    },
    props: {
        name: 'home sensor 1',
        description: 'It measures temp and humidity in kitchen.',
        location: 'kitchen'
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
    }
}
*/
```

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
## Getter and Setter

<a name="API_get"></a>
### .get(propName[, arg])
Getter to get the required information.  
  
**Arguments:**  

1. `propName` (_String_): 
2. `arg`

| `propName`          | `arg`      | Description                                                                                                                             | Example                    |  
|---------------------|------------|-----------------------------------------------------------------------------------------------------------------------------------------|----------------------------|  
| 'id'                | _none_     | Get device id assigned by freebird. It will be `null` if it is not registered to freebird.                                              | `myDevice.get('id')`       |  
| 'raw' or 'rawGad'   | _none_     | Get raw device data which may be `undefined` if it was not given at instance creation.                                                  | `myDevice.get('raw')` or `myDevice.get('rawGad')` |  
| 'nc' or 'nectcore'  | _none_     | Get the netcore that manages this device.                                                                                               | `myDevice.get('nc')` or `myDevice.get('netcore')` |  
| 'gadTable'          | _none_     | Get the table of gadget records on this device.                                                                                         | `myDevice.get('gadTable')` |  
| 'addr' or 'address' | _none_     | Get device permanent and dynamic addresses.                                                                                             | `myDevice.get('addr')` or `myDevice.get('address')`  |  
| 'permAddr'          | _none_     | Get device permanent address.                                                                                                           | `myDevice.get('permAddr')` |  
| 'dynAddr'           | _none_     | Get device dynamic address.                                                                                                             | `myDevice.get('dynAddr')`  |  
| 'status'            | _none_     | Get device status. Could be `'online'`, `'offline'`, `'sleep'`, and `'unknown'`.                                                        | `myDevice.get('status')`   |  
| 'traffic'           | _optioanl_ | Get the current traffic record of this device.                                                                                          | `myDevice.get('traffic')`  |  
| 'net'               | _optioanl_ | Get network information of this device. You can give a single key or an array of keys to choose what information you'd like to get.     | `myDevice.get('net')`, `myDevice.get('net', 'parent')`, `myDevice.get('net', [ 'parent', 'joinTime'] )`   |  
| 'props'             | _optioanl_ | Get user-defined properties of this device. You can give a single key or an array of keys to choose what information you'd like to get. | `myDevice.get('props')`, `myDevice.get('props', 'name')`, `myDevice.get('props', [ 'name', 'location' ])` |  
| 'attrs'             | _optioanl_ | Get attributes of this device.                                                                                                          | `myDevice.get('attrs')`, `myDevice.get('attrs', 'version')`, `myDevice.get('attrs', [ 'model', 'version' ])`    |  
      

* (_Object_): The object has `in` and `out` properties to show traffic with this device.  

| Property  | Type   | Description                                                                                                |  
|-----------|--------|------------------------------------------------------------------------------------------------------------|  
| in        | Object | An object like `{ hits: 6, bytes: 220 }` to show the times and bytes of data that this device transmitted. |  
| out       | Object | An object like `{ hits: 8, bytes: 72 }` to show the times and bytes of data that this device received.     |  


**Examples:**  
  
```js
myDevice.get('netcore');  // netcore instance
myDevice.get('raw');      // { ieeeAddr: '0x123456789ABCDEF', nwkAddr: 0x27B3, ... }
myDevice.get('id');       // 18
myDevice.get('addr');     // { permanent: '0x123456789ABCDEF', dynamic: 10163 };
myDevice.get('permAddr'); // '0x123456789ABCDEF'
myDevice.get('dynAddr');  // 10163
myDevice.get('status');   // 'online'. Can be `'online'`, `'offline'`, `'sleep'`, and `'unknown'`.  
myDevice.get('gadTab;e');
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

myDevice.get('traffic', 'in');  // { hits: 6, bytes: 220 }
myDevice.get('traffic', 'out'); // { hits: 6, bytes: 220 }
myDevice.get('traffic', 'foo'); // undefined

myDevice.get('net', 'enabled'); // true
myDevice.get('net', [ 'enabled', 'status', 'address' ]);
/*
{
    enabled: true,
    status: 'online',
    address: {
        permanent: '0x123456789ABCDEF',
        dynamic: 10163 
    }
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
        permanent: '0x123456789ABCDEF',
        dynamic: 10163 
    }
}
*/

myDevice.get('props', [ 'name', 'location' ]);              // { name: 'temp sensor', location: 'kitchen' }
myDevice.getAttrs('attrs', [ 'manufacturer', 'power' ]);    // { manufacturer: 'sivann', power: { type: 'line', voltage: '12V' } }
```


* (_Object_): The object has `permanent` and `dynamic` properties to show the permanent (e.g., mac) and the dynamic (e.g., ip) addresses of the device.  

| Property  | Type             | Description                                            |  
|-----------|------------------|--------------------------------------------------------|  
| permanent | String           | Permanent address, such as mac address, ieee address.  |  
| dynamic   | String \| Number | Dynamic address, such as ip address, network address.  |  

* (_Array_): Returns an array that contains the record of gadgets on this device. The record is maintained by freebird. Each element in the array is an data object with keys given in the following table.  

| Property  | Type             | Description                                                                                                         |  
|-----------|------------------|---------------------------------------------------------------------------------------------------------------------|  
| gadId     | Number           | Gadget identifier assgined by frrebird.                                                                             |  
| auxId     | String \| Number | Auxiliary identifier to help allocate a gadget on the real device. The `auxId` is given by netcore driver designer. |  

* (_Object_): Network information about this device.  

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



* (_Object_): User-defined properties on this device.  

| Property    | Type      | Description                                                                                                |  
|-------------|-----------|------------------------------------------------------------------------------------------------------------|  
| name        | String    | Human-redable name of this device, default will be `'unknown'` if not set. [TODO]                          |  
| description | String    | Device description. Default will be `'unknown'` if not set. [TODO]                                         |  
| location    | String    | Location of this device. Default will be `'unknown'` if not set. [TODO]                                    |  
| _Others_    | _Depends_ | Other props                                                                                                |  

* (_Object_): Attributes on this device.  

| Property     | Type            | Description                                                                                           |
|--------------|-----------------|-------------------------------------------------------------------------------------------------------|
| manufacturer | String          | Manufacturer name                                                                                     |
| model        | String          | Model name                                                                                            |
| serial       | String          | Serial number of this device.                                                                         |
| version      | Object          | Version tags. { hw: '', sw: 'v1.2.2', fw: 'v0.0.8' }                                                  |
| power        | Object          | Power source. { type: 'battery', voltage: '5V' }. The type can be 'line', 'battery' or 'harvester'    |


********************************************
<a name="API_set"></a>
### .set(propName, data)
Setter to set the information.  
  
**Arguments:**  

1. `propName` (_String_): 
2. `data` (_Depends_):


********************************************
<a name="setNetInfo"></a>
### .setNetInfo(info)
[TODO MOVE TO DEV SECTION] Locally set network information on the device. This may cause 'netChanged' event if device is enabled and registered to freebird. Setting of `'enabled'` will be ignored. 
  
**Arguments:**  

1. `info` (_Object_): An object contains key-value pairs of the network information  

**Returns:**  

* (_Object_): device itself

**Examples:**  
  
```js
myDevice.setNetInfo({
    enabled: true,
    status: 'online',
    address: {
        permanent: '0x123456789ABCDEF',
        dynamic: 10163 
    }
});
```

********************************************
<a name="setProps"></a>
### .setProps(props)
Locally set properties on the device. This may cause 'propsChanged' event if device is enabled and registered to freebird.  
  
**Arguments:**  

1. `props` (_Object_): An object contains key-value pairs of the properties  

**Returns:**  

* (_Object_): device itself

**Examples:**  
  
```js
myDevice.setProps({
    greeting: 'hello world!'
});
```

********************************************
<a name="setAttrs"></a>
### .setAttrs(attrs)
[TODO MOVE TO DEV SECTION] Locally set attributes on the device. This may cause 'attrsChanged' event if device is enabled and registered to freebird. Only attributes listed in [TODO]() are accepted.  
  
**Arguments:**  

1. `attrs` (_Object_): An object contains key-value pairs of the attributes  

**Returns:**  

* (_Object_): device itself

**Examples:**  
  
```js
myDevice.setAttrs({
    manufacturer: 'foo_brand'
});
```




