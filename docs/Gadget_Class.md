# Gadget Class
The Gadget Class defines a gadget which is a single and small application, such as a temperature sensor, a light switch, and a barometer. This document will show you what methods does a gadget have.  

## APIs

* [new Gadget()](#API_Gadget)
* [enable()](#API_enable)
* [disable()](#API_disable)
* [isEnabled()](#API_isEnabled)
* [isRegistered()](#API_isRegistered)
* [getNetcore()](#API_getNetcore)
* [getDev()](#API_getDev)
* [getPermAddr()](#API_getPermAddr)
* [getLocation()](#API_getLocation)
* [getRawGad()](#API_getRawGad)
* [getId()](#API_getId)
* [getAuxId()](#API_getAuxId)
* [getPanelInfo()](#API_getPanelInfo)
* [getProps()](#API_getProps)
* [getAttrs()](#API_getAttrs)
* [setPanelInfo()](#API_setPanelInfo)
* [setProps()](#API_setProps)
* [setAttrs()](#API_setAttrs)
* [dump()](#API_dump)
* [read()](#API_read)
* [write()](#API_write)
* [exec()](#API_exec)
* [getReportCfg()](#API_getReportCfg)
* [setReportCfg()](#API_setReportCfg)

********************************************
<a name="API_Device"></a>
### new Gadget(dev, auxId, rawGad)
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
<a name="API_enable"></a>
### .enable()
Enable this gadget.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Gadget_): gadget itself

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

* (_Gadget_): gadget itself

**Examples:**  
  
```js
myGadget.disable();
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
To see if this gadget is registered to freebird framwork.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Boolean_): `true` if registered, otherwise `false`.  

**Examples:**  
  
```js
myGadget.isRegistered();    // false
```

********************************************
<a name="API_getNetcore"></a>
### .getNetcore()
Get the netcore of this gadget.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Netcore_): netcore instance.  

**Examples:**  
  
```js
myGadget.getNetcore();  // netcore instance
```

********************************************
<a name="API_getDev"></a>
### .getDev()
Get the device that owns this gadget.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Device_): device instance.  

**Examples:**  
  
```js
myGadget.getDev();  // device instance
```

********************************************
<a name="API_getPermAddr"></a>
### .getPermAddr()
Get the permanent address from which device owns this gadget.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_String_): device permananet address.  

**Examples:**  
  
```js
myGadget.getPermAddr(); // '0x12345678ABCD'
```

********************************************
<a name="API_getLocation"></a>
### .getLocation()
Get the location of which device owns this gadget.  

**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js
myGadget.getLocation(); // 'kitchen'
```

********************************************
<a name="API_getRawGad"></a>
### .getRawGad()
Get raw data of this gadget.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Object_): Raw data of this gadget passed from lower layer.  

**Examples:**  
  
```js
myGadget.getRawGad();   // { [TODO] }
```

********************************************
<a name="API_getId"></a>
### .getId()
Get the id of this gadget.  
  
**Arguments:**  

* _none_

**Returns:**  

* (_Number_): The gadget id of registration in freebird. Returns `null` if not registered.  

**Examples:**  
  
```js
myGadget.getId();   // 122
```

********************************************
<a name="API_getAuxId"></a>
### .getAuxId()
Get the auxiliary id of this gadget.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js
myGadget.getAuxId();    // 'temperature/3'
```

********************************************
<a name="API_getPanelInfo"></a>
### .getPanelInfo([keys])
Get panel information of this gadget. The panel information is a data object that includes the foloowing properties. 
  

    | Property  | Type    |  Description                                                 |
    |-----------|---------|--------------------------------------------------------------|
    | enabled   | Boolean | Indicate whether this gadget is enabled                      |
    | profile   | String  | Profile of this gadget, can be any string, such as 'Home'    |
    | classId   | String  | Gadget class to tell what kind of application is this gadget |

  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_getProps"></a>
### .getProps([keys])
Enable this device. Transportation is working.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_getAttrs"></a>
### .getAttrs([keys])
Enable this device. Transportation is working.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_setPanelInfo"></a>
### .setPanelInfo(info)
Enable this device. Transportation is working.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_setProps"></a>
### .setProps(props)
Enable this device. Transportation is working.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_setAttrs"></a>
### .setAttrs(attrs)
Enable this device. Transportation is working.  
  
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
Enable this device. Transportation is working.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_read"></a>
### .read(attrName, callback)
Enable this device. Transportation is working.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_write"></a>
### .write(attrName, args, callback)
Enable this device. Transportation is working.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_exec"></a>
### .exec(attrName, args, callback)
Enable this device. Transportation is working.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_getReportCfg"></a>
### .getReportCfg(attrName, cfg, callback)
Enable this device. Transportation is working.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_setReportCfg"></a>
### .setReportCfg(attrName, cfg, callback)
Enable this device. Transportation is working.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```
