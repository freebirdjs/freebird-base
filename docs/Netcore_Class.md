# Netcore Class
The Netcore Class provides methods of network management.  

<a name="Netcore"></a>
## 1. List of Methods

* Basic
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
Enable this device. Transportation is working.  
  
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
Enable this device. Transportation is working.  
  
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
Enable this device. Transportation is working.  
  
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
Enable this device. Transportation is working.  
  
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
Enable this device. Transportation is working.  
  
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
Enable this device. Transportation is working.  
  
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
Enable this device. Transportation is working.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

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

```

********************************************
<a name="API_stop"></a>
### .stop(callback)
Enable this device. Transportation is working.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_reset"></a>
### .reset(mode, callback)
Enable this device. Transportation is working.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_permitJoin"></a>
### .permitJoin(duration, callback)
Enable this device. Transportation is working.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_remove"></a>
### .remove(permAddr, callback)
Enable this device. Transportation is working.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_ban"></a>
### .ban(permAddr, callback)
Enable this device. Transportation is working.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_unban"></a>
### .unban(permAddr, callback)
Enable this device. Transportation is working.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_ping"></a>
### .ping(permAddr, callback)
Enable this device. Transportation is working.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_devRead"></a>
### .devRead(permAddr, attrName, callback)
Enable this device. Transportation is working.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_devWrite"></a>
### .devWrite(permAddr, attrName, val, callback)
Enable this device. Transportation is working.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_identify"></a>
### .identify(permAddr, callback)
Enable this device. Transportation is working.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_gadRead"></a>
### .gadRead(permAddr, auxId, attrName, callback)
Enable this device. Transportation is working.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_gadWrite"></a>
### .gadWrite(permAddr, auxId, attrName, val, callback)
Enable this device. Transportation is working.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```

********************************************
<a name="API_gadExec"></a>
### .gadExec(permAddr, auxId, attrName, args, callback)
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
### .getReportCfg(permAddr, auxId, attrName, callback)
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
### .setReportCfg(permAddr, auxId, attrName, cfg, callback)
Enable this device. Transportation is working.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js

```