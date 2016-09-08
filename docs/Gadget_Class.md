# Gadget Class
The Gadget Class defines a gadget which is a single and small application, such as a temperature sensor, a light switch, and a barometer. This document will show you what methods does a gadget have.  

## APIs

* [new Gadget()](#API_Gadget)
* [isEnabled()](#API_isEnabled)
* [isRegistered()](#API_isRegistered)
* [enable()](#API_enable)
* [disable()](#API_disable)
* [dump()](#API_dump)
* Getter and Setter
    - [get()](#API_get)
    - [set()](#API_set)
* Remote Operations
    * [read()](#API_read)
    * [write()](#API_write)
    * [exec()](#API_exec)
    * [getReportCfg()](#API_getReportCfg)
    * [setReportCfg()](#API_setReportCfg)

********************************************
<a name="API_Device"></a>
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
<a name="API_isEnabled"></a>
### .isEnabled()
To see if this gadget is enabled.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Boolean_): `true` if enabled, otherwise `false`.  

**Examples:**  
  
```js
myGadget.isEnabled();   // false
```

********************************************
<a name="API_isRegistered"></a>
### .isRegistered()
To see if this gadget is registered to freebird framework.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Boolean_): `true` if registered, otherwise `false`.  

**Examples:**  
  
```js
myGadget.isRegistered();    // false
```

********************************************
<a name="API_enable"></a>
### .enable()
Enable this gadget.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Gadget_): gadget

**Examples:**  
  
```js
myGadget.enable();
```

********************************************
<a name="API_disable"></a>
### .disable()
Enable this device. Any message will not be recevied and remote operations will be ineffective if this gadget is disabled.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Gadget_): gadget

**Examples:**  
  
```js
myGadget.disable();
```

********************************************
<a name="API_dump"></a>
### .dump()
Dump the information about this gadget.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Object_): Information about this device.  

| Property | Type             | Description                                                                     |
|----------|------------------|---------------------------------------------------------------------------------|
| netcore  | String           | Netcore name                                                                    |
| id       | Number           | Device id in freebird                                                           |
| auxId    | String \| Number | Auxiliary id to identify the gadget on a device                                 |
| dev      | Object           | Owner device info, `{ id: 3, permAddr: '0x12345678' }`                          |
| panel    | Object           | Panel information, `{ enabled: true, profile: 'Home', classId: 'temperature' }` |
| props    | Object           | User-defined properties                                                         |
| attrs    | Object           | Gadget attributes                                                               |

**Examples:**  
  
```js
myGadget.dump();
/*
{
    netcore: 'freebird-netcore-mqtt',
    id: 648,
    auxId: 'temperature/0',
    dev: {
        id: 573,
        permAddr: '0x123456789abcdef'
    },
    panel: {
        enabled: true,
        profile: 'Home',
        classId: 'temperature'
    },
    props: {
        name: 'sivann temperature sensor' ,
        description: 'Do not remove this sensor'
    }.
    attrs: {
        sensorValue: 26.4 ,
        unit: 'Cels'
    }
}
*/
```

********************************************
## Remote Operations

<a name="API_read"></a>
### .read(attrName, callback)
Read gadget attribute from the remote device.  
  
**Arguments:**  

1. `attrName` (_String_): Attribute name  
2. `callback` (_Function_): `function (err, data) {}`  

**Returns:**  

* _none_

**Examples:**  
  
```js
myGadget.read('sensorValue', function (err, data) {
    if (!err)
        console.log(data);  // 21.2
});
```

********************************************
<a name="API_write"></a>
### .write(attrName, val, callback)
Remotely write the value to an attribue on this gadget.  
  
**Arguments:**  

1. `attrName` (_String_):  Attribute name  
2. `val` (_Depends_): Attribute value to write to the gadget  
3. `callback` (_Function_): `function (err, data) {}`  

**Returns:**  

* _none_

**Examples:**  
  
```js
myGadget.write('sensorValue', 18, function (err, data) {
    if (err)
        console.log(err);  // Error: unwritable [TODO] ERROR FORMAT?
});
```

********************************************
<a name="API_exec"></a>
### .exec(attrName, args, callback)
Remotely invoke the procedure on this gadget.  
  
**Arguments:**  

1. `attrName` (_String_):  Attribute name  
2. `args` (_Array_): Arguments to invoke with  
3. `callback` (_Function_): `function (err, data) {}`  

**Returns:**  

* _none_

**Examples:**  
  
```js
myGadget.exec('blink', [ 10 ], function (err, data) {
    if (!err)
        console.log(data);  // Depends
});
```

********************************************
<a name="API_getReportCfg"></a>
### .getReportCfg(attrName, cfg, callback)
Remotely get the report settings from the gadget.  
  
**Arguments:**  

1. `attrName` (_Object_): Name of which attribute you'd like to get its reporting configuration  
2. `callback` (_Function_):  `function (err, cfg) { }`. The `rsp` object has a status code to indicate whether the operation is successful.  


**Returns:**  

* _none_

**Examples:**  
  
```js
myGadget.getReportCfg('sensorValue', function (err, cfg) {
    if (!err)
        console.log(cfg);
        // { pmin: 60, pmax: 180 }
});
```

********************************************
<a name="API_setReportCfg"></a>
### .setReportCfg(attrName, cfg, callback)
Set the report configuration to a gadget on the remote device.  
  
**Arguments:**  

1. `attrName` (_Object_): Name of which attribute you'd like to set its reporting behavior  
2. `cfg` (_Object_): Report configuration  

    | Property | Type    | Mandatory | Description |
    |----------|---------|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | pmin     | Number  | optional  | Minimum Period. Minimum time in seconds the Client Device should wait from the time when sending the last notification to the time when sending a new notification.                                     |
    | pmax     | Number  | optional  | Maximum Period. Maximum time in seconds the Client Device should wait from the time when sending the last notification to the time sending the next notification (regardless if the value has changed). |
    | gt       | Number  | optional  | Greater Than. The Client Device should notify its value when the value is greater than this setting. Only valid for the Resource typed as a number.                                                     |
    | lt       | Number  | optional  | Less Than. The Client Device should notify its value when the value is smaller than this setting. Only valid for the Resource typed as a number.                                                        |
    | stp      | Number  | optional  | Step. The Client Device should notify its value when the change of the Resource value, since the last report happened, is greater than this setting.                                                    |
    | enable   | Boolean | optional  | Set to `true` for a Client Device to enable observation on the allocated Resource or Object Instance.                                                                                                   |

33. `callback` (_Function_):  `function (err, rsp) { }`. The `rsp` object has a status code to indicate whether the operation is successful.  

**Returns:**  

* _none_

**Examples:**  
  
```js
myGadget.setReportCfg('sensorValue', { pmin: 60, pmax: 180 }, function (err) {
    if (!err)
        console.log('success!');
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

| `propName`           | `arg`      | Description                                                                                                                             | Example                    |  
|----------------------|------------|-----------------------------------------------------------------------------------------------------------------------------------------|----------------------------|  
| v 'id'                 | _none_     | Get gadget id assigned by freebird. It will be `null` if it is not registered to freebird.                                              | `myGadget.get('id')`       |  
| v 'auxId'              | _none_     | Get gadget auxiliary id.                                                                                                                | `myGadget.get('auxId')`    |  
| v 'raw' or 'rawGad'  | _none_     | Get raw data which may be `undefined` if it was not given at instance creation.                                                         | `myGadget.get('raw')` or `myGadget.get('rawGad')` |  
| v 'dev' or 'device'  | _none_     | Get the device that owns this gadget.                                                                                                   | `myGadget.get('dev')` or `myGadget.get('device')` |  
| v 'nc' or 'nectcore' | _none_     | Get the netcore that manages this gadget.                                                                                               | `myGadget.get('nc')` or `myGadget.get('netcore')` |  
| v 'permAddr'         | _none_     | Get the permanent address from which device owns this gadget.                                                                           | `myGadget.get('permAddr')` |  
| v 'dynAddr'          | _none_     | Get the dynamic address from which device owns this gadget.                                                                             | `myGadget.get('dynAddr')`  |  
| v 'location'         | _none_     | Get the location of which device owns this gadget.                                                                                      | `myGadget.get('location')` |  
| 'panel'              | _optioanl_ | Get panel information of this gadget. You can give a single key or an array of keys to choose what information you'd like to get.       | `myGadget.get('panel')`, `myGadget.get('panel', 'enabled')`, `myGadget.get('panel', [ 'enabled', 'classId'] )`   |  
| 'props'              | _optioanl_ | Get user-defined properties of this gadget. You can give a single key or an array of keys to choose what information you'd like to get. | `myGadget.get('props')`, `myGadget.get('props', 'name')`, `myGadget.get('props', [ 'name', 'description' ])` |  
| 'attrs'              | _optioanl_ | Get attributes of this device.                                                                                                          | `myGadget.get('attrs')`, `myGadget.get('attrs', 'sensorValue')`, `myGadget.get('attrs', [ 'sensorValue', 'unit' ])`    |  
      

**Examples:**  
  
```js
myGadget.get('netcore');  // netcore instance
myGadget.get('device');   // device instance
myDevice.get('raw');      // { ... } or null
myGadget.get('id');       // 122
myGadget.get('auxId');    // 'temperature/3'

myGadget.get('permAddr'); // '0x123456789ABCDEF'
myGadget.get('dynAddr');  // 10163
myGadget.get('location'); // 'kitchen'



myGadget.get('addr');     // { permanent: '0x123456789ABCDEF', dynamic: 10163 };
myGadget.get('dynAddr');  // 10163
myGadget.get('status');   // 'online'. Can be `'online'`, `'offline'`, `'sleep'`, and `'unknown'`.  



myGadget.get('panel');
/*
{
    enabled: true,
    profile: 'Home',
    classId: 'temperature'
}
*/

myGadget.get('props');
/*
{
    name: 'sivann temperature sensor',
    description: 'Do not remove this sensor'
}
*/

myGadget.get('attrs');
/*
{
    sensorValue: 26.4,
    unit: 'Cels'
}
*/

myGadget.get('props', [ 'name', 'location' ]);              // { name: 'temp sensor', location: 'kitchen' }
myGadget.getAttrs('attrs', [ 'manufacturer', 'power' ]);    // { manufacturer: 'sivann', power: { type: 'line', voltage: '12V' } }
```
* (_Object_): Panel information about this gadget.  

| Property  | Type    |  Description                                                 |
|-----------|---------|--------------------------------------------------------------|
| enabled   | Boolean | Indicate whether this gadget is enabled                      |
| profile   | String  | Profile of this gadget, can be any string, such as 'Home'    |
| classId   | String  | Gadget class to tell what kind of application is this gadget |

* (_Object_): User-defined properties on this device.  

| Property    | Type      | Description                                                                                                |  
|-------------|-----------|------------------------------------------------------------------------------------------------------------|  
| name        | String    | Human-redable name of this gadget, default will be `'unknown'` if not set. [TODO]                          |  
| description | String    | Gadget description. Default will be `'unknown'` if not set. [TODO]                                         |  
| _Others_    | _Depends_ | Other props                                                                                                |  




********************************************
<a name="API_setPanelInfo"></a>
### .setPanelInfo(info)
[TODO MOVE TO DEV SECTION]  Locally set panel information of the gadget. This may cause 'panelChanged' event if gadget is enabled and registered to freebird. Setting of `'enabled'` will be ignored.  
  
**Arguments:**  

1. `info` (_Object_): Panel information to set.  

**Returns:**  

* (_Gadget_): gadget itself.  

**Examples:**  
  
```js
myGadget.setPanelInfo({ classId: 'humidity' });
```

********************************************
<a name="API_setProps"></a>
### .setProps(props)
Locally set properties on the gadget. This may cause 'propsChanged' event if device is enabled and registered to freebird.  
  
**Arguments:**  

1. `props` (_Object_): Properties to set.  

**Returns:**  

* (_Gadget_): gadget itself.  

**Examples:**  
  
```js
myGadget.setProps({ greeting: 'hello world' });
```

********************************************
<a name="API_setAttrs"></a>
### .setAttrs(attrs)
[TODO MOVE TO DEV SECTION] Locally set attributes on the gadget. This may cause 'attrsChanged' event if gadget is enabled and registered to freebird. Only attributes listed in [TODO]() are accepted.  

**Arguments:**  

1. `attrs` (_Object_): An object contains key-value pairs of the attributes  

**Returns:**  

* _none_

**Examples:**  
  
```js
myGadget.setAttrs({ sensorValue: '86', unit: 'F' });
```

********************************************

