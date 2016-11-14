# Netcore Class
The Netcore Class provides methods for network management, remote operations upon devices and gadgets.  

* Netcore Constructor and Basic Methods
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

********************************************
## Netcore Constructor and Basic Methods

<a name="API_Netcore"></a>
### Netcore(name, controller, protocol[, opt])
Netcore constructor. It is suggested to use freebird-base `.createNetcore()` method to create a new instance of Netcore.  
  
**Arguments:**  

1. `name` (_String_): Netocre name
2. `controller` (_Object_): Low-level controller, for example, `ble-shepherd`
3. `protocol` (_Object_): Information of the used protocol

    | Property | Type    | Mandatory | Description          |
    |----------|---------|-----------|----------------------|
    | phy      | String  | Required  | Physic layer         |
    | dll      | String  | Optional  | Data link layer      |
    | nwk      | String  | Required  | Network layer        |
    | tl       | String  | Optional  | Transportation layer |
    | sl       | String  | Optional  | Session layer        |
    | pl       | String  | Optional  | Presentation layer   |
    | apl      | String  | Optional  | Application layer    |

4. `opt` (_Object_): Optional settings

    | Property        | Type    | Description                                                                                                                                                  |
    |-----------------|---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | defaultJoinTime | Number  | Default timespan of 180 seconds to allow devices for joingiing the network. When calling `permitJoin()` without `duration`, this default value will be used. |

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
To see if the netcore is currently allowing devices to join the network.  

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
Disable network. Any transportation will be ignore if netcore is disabled, and all remote operations become inapplicable as well.  
  
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
## Network Management

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
        console.log('netcore is up');
    else
        console.log(err);
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
        console.log('netcore is down');
    else
        console.log(err);
});
```

********************************************
<a name="API_reset"></a>
### .reset([mode,] callback)
Reset the network controller.  
  
**Arguments:**  

1. `mode` (_Number_): `0` for a soft reset and `1` for a hard reset. It will be a soft reset if `mode` is not given.  
2. `callback` (_Function_):  `function (err) {}`. Get called after reset is applied. When netcore restarted, `nc.onReady()` will be called.  

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.onReady = function () {
    console.log('Netcore is ready');
};

nc.reset(0, function (err) {
    if (!err)
        console.log('netcore starts to run its reset procedure');
    else
        console.log(err);
});
```

********************************************
<a name="API_permitJoin"></a>
### .permitJoin(duration[, callback])
Let the network controller allow devices to join its network.  
  
**Arguments:**  

1. `duration` (_Number_): Duration in seconds for netcore allowing devices to join the network. Set it to `0` can immediately close the admission.  
2. `callback` (_Function_):  `function (err, timeLeft) {}`. Get called when netcore starts/stops to permit joining, where `timeLeft` is a number that indicates time left for device joining in seconds, e.g., 180.

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.permitJoin(180, function (err, timeLeft) {
    if (!err)
        console.log(timeLeft);  // 180
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
2. `callback` (_Function_):  `function (err, permAddr) {}`. Get called after device removed, where `permAddr` is permananet address of that device.

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
Ban a device from the network. Once a device is banned, it can never join the network unless you unban it.  
  
**Arguments:**  

1. `permAddr` (_String_): Device permanent address  
2. `callback` (_Function_):  `function (err, permAddr) {}`. Get called after device banned, where `permAddr` is permananet address of that device.  

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
2. `callback` (_Function_):  `function (err, val) {}`. Get called after device unbanned, where `permAddr` is permananet address of that device.  

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
2. `callback` (_Function_):  `function (err, time) {}`. Get called after ping response comes back, where `time` is the round-trip time in milliseconds, e.g., 16.

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
