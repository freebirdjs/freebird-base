<a name="Device"></a>
## 5. Device Class

    * [new Device()](#API_Device)
    * [enable()](#API_enable)
    * [disable()](#API_disable)
    * [isEnabled()](#API_isEnabled)
    * [isRegistered()](#API_isRegistered)
    * [getNetcore()](#API_getNetcore)
    * [getRawDev()](#API_getRawDev)
    * [getId()](#API_getId)
    * [getAddr()](#API_getAddr)
    * [getPermAddr()](#API_getPermAddr)
    * [getStatus()](#API_getStatus)
    * [getGadTable()](#API_getGadTable)
    * [getTraffic()](#API_getTraffic)
    * [getNetInfo()](#API_getNetInfo)
    * [getProps()](#API_getProps)
    * [getAttrs()](#API_getAttrs)
    * [setNetInfo()](#API_setNetInfo)
    * [setProps()](#API_setProps)
    * [setAttrs()](#API_setAttrs)
    * [resetTxTraffic()](#API_resetTxTraffic)
    * [resetRxTraffic()](#API_resetRxTraffic)
    * [dump()](#API_dump)
    * [refresh()](#API_refresh)
    * [read()](#API_read)
    * [write()](#API_write)
    * [identify()](#API_identify)
    * [ping()](#API_ping)

********************************************
<a name="API_Device"></a>
### new Device(netcore, rawDev)
New a device instance.  
  
**Arguments:**  

1. `netcore` (_String | Number_): Object id  
2. `rawDev` (_String | Number_): Object Instance id  

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_enable"></a>
### .enable()
Enable this device. Transportation is working.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_disable"></a>
### .disable()
Disable this device. Any transportation will be ignore if device is disabled.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_isEnabled"></a>
### .isEnabled()
To see if this device is enabled.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_isRegistered"></a>
### .isRegistered()
To see if this device has been registered to freebird.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_getNetcore"></a>
### .getNetcore()
Get the netcore which manages this device.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```


********************************************
<a name="API_getRawDev"></a>
### .getRawDev()
Get device raw data that came from the low-layer network controller.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_getId"></a>
### .getId()
Get device identifier. It will be null if not registered to freebird.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_getAddr"></a>
### .getAddr()
Get device permanent and dynamic addresses.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_getPermAddr"></a>
### .getPermAddr()
Get device permanent address.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```


********************************************
<a name="API_getStatus"></a>
### .getStatus()
Get device status.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_getGadTable"></a>
### .getGadTable()
Get the table of gadget records on this device.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_getTraffic"></a>
### .getTraffic()
Get the current traffic record of this device.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_getNetInfo"></a>
### .getNetInfo([keys])
Get network information of this device.  
  
**Arguments:**  

1. `keys` (_String[]_): Array of keys. Return a whole object if not given.  

**Returns:**  

* _none_

**Examples:**  
  
```js

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

