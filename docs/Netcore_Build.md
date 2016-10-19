## Signatures for drivers

* net
    - start: `function(done) {}`
        * `done(err)` should be called after done
    - stop: `function(done) {}`
        * `done(err)` should be called after done
    - reset: `function(mode, done) {}`
        * `done(err)` should be called after done
    - permitJoin: `function(duration, done) {}`
        * `done(err, timeLeft)` should be called after done
        * timeLeft (_Number_): Time left for joining in seconds, e.g., 180.
    - remove: `function(permAddr, done) {}`
        * `done(err, permAddr)` should be called after done
        * permAddr (_String_): permAddr, e.g., '0x12345678'.
    - ban: `function(permAddr, done) {}`
        * `done(err, permAddr)` should be called after done
        * permAddr (_String_): permAddr, e.g., '0x12345678'.
    - unban: `function(permAddr, done) {}` should be called after done
        * `done(err, permAddr)` should be called after done
        * permAddr (_String_): permAddr, e.g., '0x12345678'.
    - ping: `function(permAddr, done) {}, done(err, time), `
        * `done(err, time)` should be called after done
        * time (_Number_): round-trip time in milliseconds, e.g., 16.
* dev
    - read: `function(permAddr, attrName, done) {}`
        * `done(err, val)` should be called after done
        * val (_Depends_): value read. Type denpends, e.g., `'hello'`, `12`, `false`.
    - write: `function(permAddr, attrName, val, done) {}, ),`
        * `done(err, val)`
        * val: value written (optional, Type denpends, ex: 'hello', 12, false)
    - identify: `function(permAddr, done) {}`
        * `done(err)`
* gad
    - read: `function(permAddr, auxId, attrName, done) {}`
        * `done(err, val)`
        * val (_Depends_): value read (Type denpends, ex: 'hello', 12, false)
    - write: `function(permAddr, auxId, attrName, val, done) {}`
        * `done(err, val)`
        * val (_Depends_): value written (optional, Type denpends, ex: 'hello', 12, false)
    - exec: `function(permAddr, auxId, attrName, args, done) {}`
        * `done(err, result)`
        * result (_Depends_): can be anything, depends on firmware
    - setReportCfg: `function(permAddr, auxId, attrName, cfg, done) {}`
        * `done(err, result)`
        * result (_Depends_): set succeeds? (Boolean, true or false)
    - getReportCfg: `function(permAddr, auxId, attrName, done) {}`
        * `done(err, cfg)`
        * cfg (_Object_): config object (Object, ex: { pmin: 10, pmax: 60, gt: 200 })



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
Commit the network status when a device changes its status.  
  
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
Commit a device incoming message to netcore when a device comes in.  
  
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
Commit a device leaving message to netcore when a device leave from the network.  
  
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
Commit a gadget incoming message to netcore when a gadget comes in.  
  
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
Commit a device reporting message to netcore when a device reports its attribtue(s).  
  
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
Commit a gadget reporting message to netcore when a gadget reports its attribtue(s).  
  
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
Dangerously commit a gadget reporting message to netcore when a gadget reports its attribtue(s). This will restructure the attrs data in the gadget instance. Use this API when you do know what you are doing.  
  
**Arguments:**  

* _none_

**Returns:**  

* _none_

**Examples:**  
  
```js
nc.dangerouslyCommitGadReporting('0x12345678abcde', 'dIn/6', {
    xx: 1,
    yy: 2
});
```
* To create a netcore:  

```js
var fbbs = require('freebird-base');

var myNetcore = fbbs.createNetcore('my_netcore', controller, protocol);

var myNetDrivers = {
    start: function (callback) {
        // your implementation
        callback(err);
    },
    stop: function (callback) {
        // your implementation
        callback(err);
    },
    reset: function (mode, callback) {
        // your implementation
        callback(err);
    },
    permitJoin: function (duration, callback) {
        // your implementation
        callback(err, result);
    },
    remove: function (permAddr, callback) {
        // your implementation
        callback(err, result);
    },
    ban: function (permAddr, callback) {
        // your implementation
        callback(err, result);
    },
    unban: function (permAddr, callback) {
        // your implementation
        callback(err, result);
    },
    ping: function (permAddr, callback) {
        // your implementation
        callback(err, result);
    }
};

var myDevDrivers = {
    read: function (permAddr, attr, callback) {
        // your implementation
        callback(err, data);
    },
    write: function (permAddr, attr, val, callback) {
        // your implementation
        callback(err, data);
    },
    identify: function (permAddr, callback) {
        // your implementation
        callback(err);
    }
};

var myGadDrivers = {
    read: function (permAddr, auxId, attr, callback) {
        // your implementation
        callback(err, data);
    },
    write: function (permAddr, auxId, attr, val, callback) {
        // your implementation
        callback(err, data);
    },
    exec: function (permAddr, auxId, attr, args, callback) {
        // your implementation
        callback(err, data);
    },
    getReportCfg: function (permAddr, auxId, attrName, cfg, callback) {
        // your implementation
        callback(err, data);
    },
    setReportCfg: function (permAddr, auxId, attrName, callback) {
        // your implementation
        callback(err, data);
    }
};

// implement
myNetcore.cookRawDev = function (dev, rawDev, cb) {
    
    // your implementation here

    cb(null, dev);
};

myNetcore.cookRawGad = function (gad, rawGad, cb) {
    
    // your implementation here

    cb(null, gad);
};

myNetcore.registerNetDrivers(netDrivers);
myNetcore.registerDevDrivers(devDrivers);
myNetcore.registerGadDrivers(gadDrivers);

controller.on('controller_ready_event', function () {
    myNetcore.commitReady();
});

controller.on('device_incoming_event', function (rawDevObject) {
    myNetcore.commitDevIncoming(rawDevObject.permanentAddress, rawDevObject);

    // extact gadgets on your device [TODO]
    myNetcore.commitGadIncoming(rawDevObject.permanentAddress, auxId, rawGad);
});

controller.on('device_leaving_event', function (rawDevObject) {
    myNetcore.commitDevLeaving(rawDevObject.permanentAddress);
});

controller.on('device_reporting_event', function (devAttrChanges) {
    myNetcore.commitDevReporting(rawDevObject.permanentAddress, devAttrChanges);
});

controller.on('gadget_reporting_event', function (gadAttrChanges) {
    myNetcore.commitGadReporting(permanentAddress, auxId, gadAttrChanges);
});

```