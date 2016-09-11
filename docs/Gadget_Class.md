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
* Data Formats
    - [panel](#Data_panel)
    - [props](#Data_props)
    - [attrs](#Data_attrs)

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
Read an attribute from a gadget on the remote device.  
  
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

myGadget.write('onOff', 1, function (err, data) {
    if (!err)
        console.log(data); // 1
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
### .get(name)
Getter to get the required information.  
  
**Arguments:**  

1. `name` (_String_): 

| Name                 | Description                                                                                  | Example                    | Returned Data Type            |  
|----------------------|----------------------------------------------------------------------------------------------|----------------------------|-------------------------------|  
| 'id'                 | Get gadget id assigned by freebird. It will be `null` if it is not registered to freebird.   | `myGadget.get('id')`       | Number \| String              |  
| 'auxId'              | Get gadget auxiliary id.                                                                     | `myGadget.get('auxId')`    | Number \| String              |  
| 'rawGad'             | Get raw data which may be `undefined` if it was not given at instance creation.              | `myGadget.get('rawGad')`   | Object                        |  
| 'raw'                | Alias of 'rawGad'.                                                                           | `myGadget.get('raw')`      | -                             |  
| 'device'             | Get the device that owns this gadget.                                                        | `myGadget.get('device')`   | Object ([Device])             |  
| 'dev'                | Alias of 'device'.                                                                           | `myGadget.get('dev')`      | -                             |  
| 'nectcore'           | Get the netcore that manages this gadget.                                                    | `myGadget.get('netcore')`  | Object ([Netcore])            |  
| 'nc'                 | Alias of 'netcore'.                                                                          | `myGadget.get('nc')`       | -                             |  
| 'permAddr'           | Get the permanent address from which device owns this gadget.                                | `myGadget.get('permAddr')` | String                        |  
| 'dynAddr'            | Get the dynamic address from which device owns this gadget.                                  | `myGadget.get('dynAddr')`  | Number \| String              |  
| 'location'           | Get the location of which device owns this gadget.                                           | `myGadget.get('location')` | String                        |  
| 'panel'              | Get panel information of this gadget.                                                        | `myGadget.get('panel')`    | Object ([panel](#Data_panel)) |  
| 'attrs'              | Get attributes of this device.                                                               | `myGadget.get('attrs')`    | Object ([attrs](#Data_attrs)) |  
| 'props'              | Get user-defined properties of this gadget.                                                  | `myGadget.get('props')`    | Object ([props](#Data_props)) |  

**Examples:**  
  
```js
myGadget.get('id');         // 122
myGadget.get('auxId');      // 'temperature/3'

myDevice.get('raw');
myDevice.get('rawGad');     // { ... } or null

myGadget.get('dev');
myGadget.get('device');     // device instance

myGadget.get('nc');
myGadget.get('netcore');    // netcore instance

myGadget.get('permAddr');   // '0x123456789abcdef'
myGadget.get('dynAddr');    // 10163

myGadget.get('location');   // 'kitchen'

myGadget.get('panel');
/*
{
    enabled: true,
    profile: 'Home',
    classId: 'temperature'
}
*/

myGadget.get('attrs');
/*
{
    sensorValue: 26.4,
    unit: 'Cels',
    // There may be other properties
}
*/

myGadget.get('props');
/*
{
    name: 'sivann temperature sensor',
    description: 'Do not remove this sensor',
    // There may be other properties
}
*/

```

********************************************
<a name="API_get"></a>
### .set(name, value)
Setter to set the value to gadget.  
  
**Arguments:**  

1. `name` (_String_): Possible names are `'panel'`, `'attrs'`, and `'props'`.
2. `value` (_Depends_)

* `set('panel', value)`
    - Locally set panel information on the gadget. Setting of `'enabled'` property will be ignored, should use `enable()` and `disable()` instead.
    - `value` (_Object_): An object contains key-value pairs of the panel information.
* `set('attrs', value)`
    - Locally set attributes on the gadget. If you like to have some additional attributes, please use `set('props', value)`.
    - `value` (_Object_): An object contains key-value pairs of the attributes.
* `set('props', value)`
    - Locally set properties on the gadget. This is for customization, you are free to add any property you like.
    - `value` (_Object_): An object contains key-value pairs of the properties.

**Returns:**  

* (_Object_): gadget

**Examples:**  

```js
myGadget.set('panel', {
    enabled: true,      // this will be ignore, use enable() or disable() instead
    profile: 'Smart Energy'
});

myGadget.set('attrs', {
    sensorValue: 24
});

myGadget.set('props', {
    name: 'temp sensor',
    greeting: 'hello world!'
});
````

********************************************
## Data Formats

[TBD]

<a name="Data_panel"></a>
### panel information
* (_Object_): Panel information about this gadget.  

| Property  | Type    |  Description                                                 |
|-----------|---------|--------------------------------------------------------------|
| enabled   | Boolean | Indicate whether this gadget is enabled                      |
| profile   | String  | Profile of this gadget, can be any string, such as 'Home'    |
| classId   | String  | Gadget class to tell what kind of application is this gadget |

<a name="Data_attrs"></a>
### attrs information
* (_Object_): User-defined properties on this device.  

| Property    | Type      | Description                                                                                                |  
|-------------|-----------|------------------------------------------------------------------------------------------------------------|  
| name        | String    | Human-redable name of this gadget, default will be `'unknown'` if not set. [TODO]                          |  
| description | String    | Gadget description. Default will be `'unknown'` if not set. [TODO]                                         |  
| _Others_    | _Depends_ | Other props                                                                                                |  

<a name="Data_props"></a>
### props information
* (_Object_): User-defined properties on this device.  

| Property    | Type      | Description                                                                                                |  
|-------------|-----------|------------------------------------------------------------------------------------------------------------|  
| name        | String    | Human-redable name of this gadget, default will be `'unknown'` if not set. [TODO]                          |  
| description | String    | Gadget description. Default will be `'unknown'` if not set. [TODO]                                         |  
| _Others_    | _Depends_ | Other props                                                                                                |  
