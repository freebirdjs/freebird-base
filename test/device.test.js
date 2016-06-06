var EventEmitter = require('events'),
    util = require('util'),
    _ = require('lodash'),
    expect = require('chai').expect,
    Device = require('../lib/device.js');

/*************************************************************************************************/
/*** NetCore Mockup Generation                                                                 ***/
/*************************************************************************************************/
var fb = Object.create(new EventEmitter()), // freebird mock
    rawDev,                                 // raw device mock
    ncMock,                                 // netcore mock
    ext = {},                               // device extra information
    dev;                                    // ripe device mock

rawDev = {
    name: 'fakeRaw',
    permAddr: '0x12345678',
    dynAddr: '111.222.333.444',
    attrs: {
        manufacturer: 'sivann',
        model: 'm0',
        serial: 's0',
        version: { hw: 'v1', sw: 'v2', fw: 'v3' },
        power: { type: 'dc', voltage: '5v' }
    }
};

ncMock = {
    _fb: fb,
    _controller: {},
    _net: {
        name: 'mock_nc',
        enabled: false,
        protocol: { phy: 'fake' },
        startTime: 0,
        defaultJoinTime: 180,
        traffic: {
            in: { hits: 0, bytes: 0 },
            out: { hits: 0, bytes: 0 }
        }
    },
    extra: null,
    cookRawDev: null,
    cookRawGad: null,
    _drivers: {},
    _findDriver: function () { return function () {}; },
    getName: function () { return ncMock._net.name; },
    _fbEmit: function (evt, data) {
        var emitData,
            emitted = false,
            isErrEvt = (evt === '_nc:error') || (evt === '_dev:error') || (evt === '_gad:error');

        if (!isErrEvt) {
            data = data || {};
            emitData = _.assign(data, {
                netcore: ncMock
            });
        } else {
            emitData = data.error;
            delete data.error;
            emitData.info =  _.assign(data, {
                netcore: ncMock.getName()
            });
        }

        if (true) {
            this._fb.emit(evt, emitData);
            emitted = true;
        }

        return emitted;
    }
};

fb.on('_dev:error', function (err) {
    console.log(err);
});

/*************************************************************************************************/
/*** Device Mockup Generation                                                                  ***/
/*************************************************************************************************/
dev = new Device(ncMock, rawDev);
dev.extra = ext;

dev = dev.setNetInfo({
    role: 'fake',
    parent: '0',
    maySleep: false,
    sleepPeriod: 30,
    address: { permanent: rawDev.permAddr, dynamic: rawDev.dynAddr }
});

dev = dev.setAttrs(rawDev.attrs);
dev._id = 3;
dev.enable();

// Things to be tested
// 1. Device Constructor
//    - name
//    - other defaults
// 2. Methods Signature check - throw error
// 3. Methods Functionality and Output Check
//    - enable(), disable(), isEnabled(), setId(), getId()
//    - setProperty(), linkGadget(), unlinkGadget(), listGadgets()
//    - getAuxIdByGadId()
//    - joinTime(), upTime()

describe('Device Constructor', function() {

});