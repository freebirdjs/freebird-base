# Gadget Class
The Gadget Class defines a gadget which is a single and small application, such as a temperature sensor, a light switch, and a barometer. This document will show you what methods does a gadget have.  

* Basic Methods
    - [isEnabled()](#API_isEnabled)
    - [isRegistered()](#API_isRegistered)
    - [enable()](#API_enable)
    - [disable()](#API_disable)
    - [dump()](#API_dump)
* Getter and Setter
    - [get()](#API_get)
    - [set()](#API_set)
* Remote Operations
    - [read()](#API_read)
    - [write()](#API_write)
    - [exec()](#API_exec)
    - [readReportCfg()](#API_readReportCfg)
    - [writeReportCfg()](#API_writeReportCfg)
* Data Formats
    - [panelInfoObj](#Gad_panel)
    - [gadAttrsObj](#Gad_attrs)
    - [gadPropsObj](#Gad_props)

********************************************
## Basic Methods

<a name="API_isEnabled"></a>
<br />
********************************************
### .isEnabled()
To see if this gadget is enabled.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Boolean_): `true` if enabled, otherwise `false`.  

**Examples:**  
  
```js
myGadget.isEnabled();  // false
```

<a name="API_isRegistered"></a>
<br />
********************************************
### .isRegistered()
To see if this gadget is registered to freebird framework.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Boolean_): `true` if registered, otherwise `false`.  

**Examples:**  
  
```js
myGadget.isRegistered();  // false
```

<a name="API_enable"></a>
<br />
********************************************
### .enable()
Enable this gadget.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Object_): gadget  

**Examples:**  
  
```js
myGadget.enable();
```

<a name="API_disable"></a>
<br />
********************************************
### .disable()
Disable this gadget. Any transportation to this gadget will be inactivated if it is disabled, and any remote operation upon this gadget is inapplicable.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Object_): gadget  

**Examples:**  
  
```js
myGadget.disable();
```

<a name="API_dump"></a>
<br />
********************************************
### .dump()
Dump the information of this gadget.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Object_): Information about this gadget.  

| Property | Type                       | Description                                                                     |
|----------|----------------------------|---------------------------------------------------------------------------------|
| netcore  | String                     | Netcore name                                                                    |
| id       | Number                     | Gadget id in freebird                                                           |
| auxId    | String \| Number           | Auxiliary id to identify the gadget on a device                                 |
| dev      | Object                     | Owner device information, `{ id: 3, permAddr: '0x12345678' }`                   |
| panel    | [panelInfoObj](#Gad_panel) | Panel information, `{ enabled: true, profile: 'Home', classId: 'temperature' }` |
| attrs    | [gadAttrsObj](#Gad_attrs)  | Gadget attributes                                                               |
| props    | [gadPropsObj](#Gad_props)  | User-defined properties                                                         |

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
    attrs: {
        sensorValue: 26.4 ,
        unit: 'Cels'
    },
    props: {
        name: 'sivann temperature sensor',
        description: 'Do not remove this sensor'
    }
}
*/
```

********************************************
## Getter and Setter

<a name="API_get"></a>
<br />
********************************************
### .get(name)
Getter to get the information by the property `name`.  
  
**Arguments:**  

1. `name` (_String_):  

| Name                 | Description                                                                                  | Example                    | Returned Data Type                  |  
|----------------------|----------------------------------------------------------------------------------------------|----------------------------|-------------------------------------|  
| 'id'                 | Get gadget id assigned by freebird. It will be `null` if it is not registered to freebird.   | `myGadget.get('id')`       | Number \| `null`                    |  
| 'auxId'              | Get gadget auxiliary id.                                                                     | `myGadget.get('auxId')`    | Number \| String                    |  
| 'raw'                | Get raw data which may be `undefined` if it was not given at instance creation.              | `myGadget.get('raw')`      | Object \| `undefined`               |  
| 'device'             | Get the device that owns this gadget.                                                        | `myGadget.get('device')`   | Object (device instance)            |  
| 'netcore'            | Get the netcore that manages this gadget.                                                    | `myGadget.get('netcore')`  | Object (netcore instance)           |  
| 'permAddr'           | Get the permanent address from which device owns this gadget.                                | `myGadget.get('permAddr')` | String                              |  
| 'dynAddr'            | Get the dynamic address from which device owns this gadget.                                  | `myGadget.get('dynAddr')`  | Number \| String                    |  
| 'location'           | Get the location of which device owns this gadget.                                           | `myGadget.get('location')` | String                              |  
| 'panel'              | Get panel information of this gadget.                                                        | `myGadget.get('panel')`    | Object ([panelInfoObj](#Gad_panel)) |  
| 'attrs'              | Get attributes of this gadget.                                                               | `myGadget.get('attrs')`    | Object ([gadAttrsObj](#Gad_attrs))  |  
| 'props'              | Get user-defined properties of this gadget.                                                  | `myGadget.get('props')`    | Object ([gadPropsObj](#Gad_props))  |  

**Returns:**  

* (_Depends_): If `name` is none of the listed property, always returns `undefined`.  

**Examples:**  
  
```js
myGadget.get('id');        // 122
myGadget.get('auxId');     // 'temperature/3'

myGadget.get('raw');       // { ... } or undefined
myGadget.get('device');    // device instance
myGadget.get('netcore');   // netcore instance
myGadget.get('permAddr');  // '0x123456789abcdef'
myGadget.get('dynAddr');   // 10163
myGadget.get('location');  // 'kitchen'

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
    ...             // There may be other attributes
}
*/

myGadget.get('props');
/*
{
    name: 'sivann temperature sensor',
    description: 'Do not remove this sensor',
    ...             // There may be other properties
}
*/
```

<a name="API_set"></a>
<br />
********************************************
### .set(name, data)
Setter to set data to the gadget.  
  
**Arguments:**  

1. `name` (_String_): Possible names are `'panel'`, `'attrs'`, and `'props'`.
2. `data` (_Depends_): See descriptions below.  

* `set('panel', data)`
    - Locally set panel information on the gadget. Setting of `'enabled'` property will be ignored, one should use `enable()` and `disable()` instead to enable or disable the gadget.
    - `data` ([panelInfoObj](#Gad_panel)): An object contains partial key-value pairs of the panel information.
* `set('attrs', data)`
    - Locally set attributes on the gadget. If you like to have some additional attributes, please use `set('props', data)`.
    - `data` ([gadAttrsObj](#Gad_attrs)): An object contains partial key-value pairs of the attributes.
* `set('props', data)`
    - Locally set properties on the gadget. This is for customization, you are free to add any property you like.
    - `data` ([gadPropsObj](#Gad_props)): An object contains partial key-value pairs of the properties.

**Returns:**  

* (_Object_): gadget  

**Examples:**  
  
```js
myGadget.set('panel', {
    enabled: true,  // this will be ignore, use enable() or disable() instead
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
## Remote Operations

<a name="API_read"></a>
<br />
********************************************
### .read(attrName, callback)
Read an attribute from a gadget on the remote device.  
  
**Arguments:**  

1. `attrName` (_String_): Attribute name.  
2. `callback` (_Function_): `function (err, data) {}`.  

**Returns:**  

* _none_  

**Examples:**  
  
```js
myGadget.read('sensorValue', function (err, data) {
    if (!err)
        console.log(data);  // 21.2
});
```

<a name="API_write"></a>
<br />
********************************************
### .write(attrName, val, callback)
Remotely write the value to an attribute on this gadget.  
  
**Arguments:**  

1. `attrName` (_String_): Attribute name.  
2. `val` (_Depends_): Attribute value to write to the gadget.  
3. `callback` (_Function_): `function (err, data) {}`.  

**Returns:**  

* _none_  

**Examples:**  
  
```js
myGadget.write('sensorValue', 18, function (err, data) {
    if (err)
        console.log(err);
});

myGadget.write('onOff', 1, function (err, data) {
    if (!err)
        console.log(data);  // 1
});
```

<a name="API_exec"></a>
<br />
********************************************
### .exec(attrName, args, callback)
Remotely invoke the procedure on this gadget.  
  
**Arguments:**  

1. `attrName` (_String_): Attribute name.  
2. `args` (_Array_): Arguments to invoke with.  
3. `callback` (_Function_): `function (err, data) {}`.  

**Returns:**  

* _none_  

**Examples:**  
  
```js
myGadget.exec('blink', [ 10 ], function (err, data) {
    if (!err)
        console.log(data);  // Depends
});
```

<a name="API_readReportCfg"></a>
<br />
********************************************
### .readReportCfg(attrName, callback)
Remotely get the report settings from the gadget.  
  
**Arguments:**  

1. `attrName` (_String_): Name of which attribute you'd like to read its reporting configuration.  
2. `callback` (_Function_): `function (err, cfg) {}`. The `cfg` object is the reporting configuration.  


**Returns:**  

* _none_  

**Examples:**  
  
```js
myGadget.readReportCfg('sensorValue', function (err, cfg) {
    if (!err)
        console.log(cfg);  // { pmin: 60, pmax: 180 }
});
```

<a name="API_writeReportCfg"></a>
<br />
********************************************
### .writeReportCfg(attrName, cfg, callback)
Write the report configuration to a gadget on the remote device. To start the reporting, one must set `cfg.enable = true`.  
  
**Arguments:**  

1. `attrName` (_String_): Name of which attribute you'd like to set its reporting behavior.  
2. `cfg` (_Object_): Report configuration.  

    | Property | Type    | Mandatory | Description                                                                                                                                                                                             |
    |----------|---------|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | pmin     | Number  | optional  | Minimum Period. Minimum time in seconds the Client Device should wait from the time when sending the last notification to the time when sending a new notification.                                     |
    | pmax     | Number  | optional  | Maximum Period. Maximum time in seconds the Client Device should wait from the time when sending the last notification to the time sending the next notification (regardless if the value has changed). |
    | gt       | Number  | optional  | Greater Than. The Client Device should notify its value when the value is greater than this setting. Only valid for the Resource typed as a number.                                                     |
    | lt       | Number  | optional  | Less Than. The Client Device should notify its value when the value is smaller than this setting. Only valid for the Resource typed as a number.                                                        |
    | stp      | Number  | optional  | Step. The Client Device should notify its value when the change of the Resource value, since the last report happened, is greater than this setting.                                                    |
    | enable   | Boolean | optional  | Set to `true` for a Client Device to enable observation on the allocated Resource or Object Instance.                                                                                                   |

3. `callback` (_Function_):  `function (err, data) {}`.  

**Returns:**  

* _none_  

**Examples:**  
  
```js
myGadget.writeReportCfg('sensorValue', { pmin: 60, pmax: 180 }, function (err, data) {
    if (!err)
        console.log(data);  // { sensorValue: true }, true for success and false for fail
});
```

********************************************
## Data Formats

<a name="Gad_panel"></a>
<br />
********************************************
### `panelInfoObj`: Panel information

| Property  | Type    |  Description                                                       |
|-----------|---------|--------------------------------------------------------------------|
| enabled   | Boolean | Indicate whether this gadget is enabled                            |
| profile   | String  | Profile of this gadget, can be any string, such as 'Home'          |
| classId   | String  | Gadget class to tell what kind of an application is on this gadget |

<a name="Gad_attrs"></a>
<br />
********************************************
### `gadAttrsObj`: Attributes on the remote gadget

| Property    | Type      | Description                                                                                                                                                                       |  
|-------------|-----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|  
| _Others_    | _Depends_ | Remote attributes depend on classId of gadget. For a temperature sensor, it will have an attribute `sensorValue`, and may have attributes like `units` and `resetMinMaxMeaValues`. The possible attributes are listed [here](https://github.com/PeterEB/smartobject/blob/master/docs/templates.md). |  

<a name="Gad_props"></a>
<br />
********************************************
### `gadPropsObj`: User-defined properties on this gadget

| Property    | Type      | Description                                                                                                |  
|-------------|-----------|------------------------------------------------------------------------------------------------------------|  
| name        | String    | Human-readable name of this gadget, default will be a string of `'unknown'` if not set                     |  
| description | String    | Gadget description. Default will be an empty string `''` if not set                                        |  
| _Others_    | _Depends_ | Other props                                                                                                |  
