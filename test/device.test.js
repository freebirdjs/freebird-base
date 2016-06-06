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
            in: { hits: 10, bytes: 100 },
            out: { hits: 20, bytes: 20 }
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
    },
    isEnabled: function () {
        return this._net.enabled;
    },
    enable: function () {
        this._net.enabled = true;
    },
    disable: function () {
        this._net.enabled = false;
    },
    ping: function () {}
};

fb.on('_dev:error', function (err) {
    // console.log(err);
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
    var mydev = dev;

    describe('#getNetcore', function() {
        it('should have a netcore of ncMock', function () {
            expect(mydev.getNetcore()).to.be.equal(ncMock);
        });
    });

    describe('#getRawDev', function() {
        it('should have a raw device of rawDev', function () {
            expect(mydev.getRawDev()).to.be.equal(rawDev);
        });
    });

    describe('#getId', function() {
        it('should have an id of 3', function () {
            expect(mydev.getId()).to.be.equal(3);
        });
    });

    describe('#extra', function() {
        it('should have an extra information object of ext', function () {
            expect(mydev.extra).to.be.equal(ext);
        });
    });

    describe('#getGadTable', function() {
        it('should have gadget table of an array with length 0', function () {
            expect(mydev.getGadTable()).to.be.an('Array');
            expect(mydev.getGadTable().length).to.be.equal(0);
        });
    });

    describe('#isRegistered', function() {
        it('is registered', function () {
            expect(mydev.isRegistered()).to.be.true;
        });
    });

    describe('#isEnabled', function() {
        it('is enabled', function () {
            expect(mydev.isEnabled()).to.be.true;
        });
    });

    describe('#getAddr', function() {
        it('has permanent address equals to rawDev.permAddr and dynamic address equals to rawDev.dynAddr', function () {
            expect(mydev.getAddr()).to.be.eql({
                permanent: rawDev.permAddr,
                dynamic: rawDev.dynAddr
            });
        });
    });

    describe('#getPermAddr', function() {
        it('has permanent address equals to rawDev.permAddr', function () {
            expect(mydev.getPermAddr()).to.be.equal(rawDev.permAddr);
        });
    });

    describe('#getStatus', function() {
        it('is in unknown status', function () {
            expect(mydev.getStatus()).to.be.equal('unknown');
        });
    });

    describe('#getTraffic', function() {
        it('has traffic', function () {
            expect(mydev.getTraffic()).to.be.eql({
                in: { hits: 0, bytes: 0 },
                out: { hits: 0, bytes: 0 }
            });
        });
    });

    describe('#getNetInfo', function() {
        it('has net info', function () {
            expect(mydev.getNetInfo()).to.be.eql(mydev._net);
        });
    });

    describe('#getProps', function() {
        it('has an empty props', function () {
            expect(mydev.getProps()).to.be.eql({
                name: undefined,
                description: undefined,
                location: undefined
            });
        });
    });

    describe('#getAttrs', function() {
        it('has attrs of', function () {
            expect(mydev.getAttrs()).to.be.eql({
                manufacturer: 'sivann',
                model: 'm0',
                serial: 's0',
                version: { hw: 'v1', sw: 'v2', fw: 'v3' },
                power: { type: 'dc', voltage: '5v' }
            });
        });
    });
});

describe('APIs Signature Check', function() {
    var mydev = dev;
    mydev.enable();
    ncMock.enable();
    describe('#setNetInfo', function() {
        it('should throw if input info is not an object', function () {
            expect(function () { return mydev.setNetInfo(); }).to.throw(TypeError);
            expect(function () { return mydev.setNetInfo(1); }).to.throw(TypeError);
            expect(function () { return mydev.setNetInfo([]); }).to.throw(TypeError);
            expect(function () { return mydev.setNetInfo('xxx'); }).to.throw(TypeError);
            expect(function () { return mydev.setNetInfo(null); }).to.throw(TypeError);
            expect(function () { return mydev.setNetInfo(NaN); }).to.throw(TypeError);
            expect(function () { return mydev.setNetInfo(true); }).to.throw(TypeError);
            expect(function () { return mydev.setNetInfo(function () {}); }).to.throw(TypeError);
        });

        it('should not throw if input info is an object', function () {
            expect(function () { mydev.setNetInfo({}); }).not.to.throw(Error);
        });
    });

    describe('#setProps', function() {
        it('should throw if input info is not an object', function () {
            expect(function () { return mydev.setProps(); }).to.throw(TypeError);
            expect(function () { return mydev.setProps(1); }).to.throw(TypeError);
            expect(function () { return mydev.setProps([]); }).to.throw(TypeError);
            expect(function () { return mydev.setProps('xxx'); }).to.throw(TypeError);
            expect(function () { return mydev.setProps(null); }).to.throw(TypeError);
            expect(function () { return mydev.setProps(NaN); }).to.throw(TypeError);
            expect(function () { return mydev.setProps(true); }).to.throw(TypeError);
            expect(function () { return mydev.setProps(function () {}); }).to.throw(TypeError);
        });

        it('should not throw if input info is an object', function () {
            expect(function () { return mydev.setProps({}); }).not.to.throw(Error);
        });
    });

    describe('#setAttrs', function() {
        it('should throw if input info is not an object', function () {
            expect(function () { return mydev.setAttrs(); }).to.throw(TypeError);
            expect(function () { return mydev.setAttrs(1); }).to.throw(TypeError);
            expect(function () { return mydev.setAttrs([]); }).to.throw(TypeError);
            expect(function () { return mydev.setAttrs('xxx'); }).to.throw(TypeError);
            expect(function () { return mydev.setAttrs(null); }).to.throw(TypeError);
            expect(function () { return mydev.setAttrs(NaN); }).to.throw(TypeError);
            expect(function () { return mydev.setAttrs(true); }).to.throw(TypeError);
            expect(function () { return mydev.setAttrs(function () {}); }).to.throw(TypeError);
        });

        it('should not throw if input info is an object', function () {
            expect(function () { return mydev.setAttrs({}); }).not.to.throw(Error);
        });
    });

    describe('#read', function() {
        it('should throw if input attrName is not a string', function () {
            expect(function () { return mydev.read(function (err) { if (err) throw err; }); }).to.throw(TypeError);
            expect(function () { return mydev.read(1, function (err) { if (err) throw err; }); }).to.throw(TypeError);
            expect(function () { return mydev.read([], function (err) { if (err) throw err; }); }).to.throw(TypeError);
            expect(function () { return mydev.read(null, function (err) { if (err) throw err; }); }).to.throw(TypeError);
            expect(function () { return mydev.read({}, function (err) { if (err) throw err; }); }).to.throw(TypeError);
            expect(function () { return mydev.read(NaN, function (err) { if (err) throw err; }); }).to.throw(TypeError);
            expect(function () { return mydev.read(true, function (err) { if (err) throw err; }); }).to.throw(TypeError);
            expect(function () { return mydev.read(function () {}, function (err) { if (err) throw err; }); }).to.throw(TypeError);
        });

        it('should not throw if input attrName is a string', function () {
            expect(function () { return mydev.read('xxx'); }).not.to.throw(Error);
        });
    });

    describe('#write', function() {
        it('should throw if input attrName is not a string', function () {
            expect(function () { return mydev.write(function (err) { if (err) throw err; }); }).to.throw(TypeError);
            expect(function () { return mydev.write(1, 1, function (err) { if (err) throw err; }); }).to.throw(TypeError);
            expect(function () { return mydev.write([], 1, function (err) { if (err) throw err; }); }).to.throw(TypeError);
            expect(function () { return mydev.write(null, 1, function (err) { if (err) throw err; }); }).to.throw(TypeError);
            expect(function () { return mydev.write({}, 1, function (err) { if (err) throw err; }); }).to.throw(TypeError);
            expect(function () { return mydev.write(NaN, 1, function (err) { if (err) throw err; }); }).to.throw(TypeError);
            expect(function () { return mydev.write(true, 1, function (err) { if (err) throw err; }); }).to.throw(TypeError);
            expect(function () { return mydev.write(function () {}, 1, function (err) { if (err) throw err; }); }).to.throw(TypeError);
        });

        it('should not throw if input attrName is a string', function () {
            expect(function () { return mydev.write('xxx', 1); }).not.to.throw(Error);
        });

        it('should throw if input val is not given', function () {
            expect(function () { return mydev.write('xxx'); }).to.throw(Error);
            expect(function () { return mydev.write('xxx', function (err) {}); }).to.throw(Error);
        });
    });

    describe('#identify', function() {
        it('should throw if callback is not a function', function () {
            expect(function () { return mydev.identify(1); }).to.throw(TypeError);
            expect(function () { return mydev.identify({}); }).to.throw(TypeError);
            expect(function () { return mydev.identify('xx'); }).to.throw(TypeError);
            expect(function () { return mydev.identify([]); }).to.throw(TypeError);
            expect(function () { return mydev.identify(NaN); }).to.throw(TypeError);
            expect(function () { return mydev.identify(null); }).to.throw(TypeError);
            expect(function () { return mydev.identify(true); }).to.throw(TypeError);
         });

        it('should not throw if input is undefined', function () {
            expect(function () { return mydev.identify(); }).not.to.throw(Error);
        });

        it('should not throw if input is a callback', function () {
            expect(function () { return mydev.identify(function (err) {}); }).not.to.throw(Error);
        });
    });

    describe('#ping', function() {
        it('should throw if callback is not a function', function () {
            expect(function () { return mydev.ping(1); }).to.throw(TypeError);
            expect(function () { return mydev.ping({}); }).to.throw(TypeError);
            expect(function () { return mydev.ping('xx'); }).to.throw(TypeError);
            expect(function () { return mydev.ping([]); }).to.throw(TypeError);
            expect(function () { return mydev.ping(NaN); }).to.throw(TypeError);
            expect(function () { return mydev.ping(null); }).to.throw(TypeError);
            expect(function () { return mydev.ping(true); }).to.throw(TypeError);
         });

        it('should not throw if input is undefined', function () {
            expect(function () { return mydev.ping(); }).not.to.throw(Error);
        });

        it('should not throw if input is a callback', function () {
            expect(function () { return mydev.ping(function (err) {}); }).not.to.throw(Error);
        });
    });
});

describe('Remote operations should throw if netcore is disabled', function() {
    var mydev = dev;
    mydev.enable();
    ncMock.disable();
    describe('#read', function() {
        it('should throw if netcore is disabled', function () {
            expect(function () { return mydev.read('xxx', function (err) { if (err) throw err; }); }).to.throw(Error);
        });
    });

    describe('#write', function() {
        it('should throw if netcore is disabled', function () {
            expect(function () { return mydev.write('xxx', 1, function (err) { if (err) throw err; }); }).to.throw(Error);
        });
    });

    describe('#identify', function() {
        it('should throw if netcore is disabled', function () {
            expect(function () { return mydev.identify(function (err) { if (err) throw err; }); }).to.throw(Error);
        });
    });

    describe('#ping', function() {
        it('should throw if netcore is disabled', function () {
            expect(function () { return mydev.ping(function (err) { if (err) throw err; }); }).to.throw(Error);
        });
    });
});

describe.skip('APIs functional check', function() {

});