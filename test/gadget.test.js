var EventEmitter = require('events'),
    util = require('util'),
    _ = require('lodash'),
    expect = require('chai').expect,
    Device = require('../lib/device.js'),
    Gadget = require('../lib/gadget.js');

/*************************************************************************************************/
/*** NetCore Mockup Generation                                                                 ***/
/*************************************************************************************************/
var fb = Object.create(new EventEmitter()), // freebird mock
    rawDev,                                 // raw device mock
    ncMock,                                 // netcore mock
    ext = {},                               // device extra information
    dev,                                    // ripe device mock
    gadext = {},                            // gadget extra information
    auxId = 60,                             // gadget auxId
    gad ;                                   // ripe gadget mock

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
    },
    gads: [ { name: 'g1' }, { name: 'g2' } ]
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
    ping: function () {},
    gadExec: function () {}
};

fb.on('_gad:error', function (err) {
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
dev = dev.setProps({ location: 'home' });
dev._id = 3;
dev.enable();

/*************************************************************************************************/
/*** Gadget Mockup Generation                                                                  ***/
/*************************************************************************************************/
auxId = 60;
gad = new Gadget(dev, auxId, rawDev.gads[0]);
gad.extra = gadext;
gad._id = 100;

// Things to be tested
// 1. Gadget Constructor
//    - dev
//    - auxId
//    - other defaults
// 2. Methods Signature check - throw error
// 3. Methods Functionality and Output Check
//    - enable(), disable(), isEnabled(), isRegistered()
//    - getNetcore(), getRawGad(), getId(), getDev(), getPermAddr(), getAuxId(), getLocation(), getPanelInfo(), getProps(), getAttrs(),
//    - setPanelInfo(), setProps(), setAttrs(), dump()
//    - read(), write(), exec(), setReportCfg(), getReportCfg(), _callDriver(), _fbEmit(), _get()

describe('Device Constructor', function() {
    var mygad = gad;

    describe('#No Arg', function() {
        it('should throw if no argument input', function () {
            expect(function () { return new Gadget(); }).to.throw(Error);
        });
    });

    describe('#Only dev', function() {
        it('should throw if only device given', function () {
            expect(function () { return new Gadget(dev); }).to.throw(Error);
        });
    });

    describe('#Bad dev', function() {
        it('should throw if bad device given', function () {
            expect(function () { return new Gadget({}, 1); }).to.throw(TypeError);
        });
    });

    describe('#Bad auxId', function() {
        it('should throw if given with a bad auxId', function () {
            expect(function () { return new Gadget(dev, []); }).to.throw(TypeError);
        });
    });

    describe('#Given with a valid device and a valid auxId', function() {
        it('should throw if given with a bad auxId', function () {
            expect(function () { return new Gadget(dev, 1); }).not.to.throw(Error);
        });
    });

    describe('#getNetcore', function() {
        it('should equal to ncMock', function () {
            expect(mygad.getNetcore()).to.be.equal(ncMock);
        });
    });

    describe('#getRawGad', function() {
        it('should equal to rawDev.gads[0]', function () {
            expect(mygad.getRawGad()).to.be.equal(rawDev.gads[0]);
        });
    });

    describe('#getId', function() {
        it('should be 100', function () {
            expect(mygad.getId()).to.be.equal(100);
        });
    });

    describe('#extra', function() {
        it('should equal to gadext', function () {
            expect(mygad.extra).to.be.equal(gadext);
        });
    });

    describe('#getDev', function() {
        it('should equal to dev', function () {
            expect(mygad.getDev()).to.be.equal(dev);
        });
    });

    describe('#getPermAddr', function() {
        it('should equal to rawDev.permAddr', function () {
            expect(mygad.getPermAddr()).to.be.a('string');
            expect(mygad.getPermAddr()).to.be.equal(rawDev.permAddr);
        });
    });

    describe('#getAuxId', function() {
        it('should equal to auxId', function () {
            expect(mygad.getAuxId()).to.be.equal(auxId);
        });
    });

    describe('#getLocation', function() {
        it('should equal to home', function () {
            expect(mygad.getLocation()).to.be.equal('home');
        });
    });

    describe('#getPanelInfo', function() {
        it('should equal to { enabled: false, profile: "", class: "" }', function () {
            mygad.disable();
            expect(mygad.getPanelInfo()).to.be.eql({ enabled: false, profile: '', class: '' });
        });
    });

    describe('#getProps', function() {
        it('should equal to mygad._props', function () {
            expect(mygad.getProps()).to.be.eql(mygad._props);
        });
    });

    describe('#getAttrs', function() {
        it('should equal to mygad._attrs', function () {
            expect(mygad.getAttrs()).to.be.eql(mygad._attrs);
        });
    });

    describe('#isRegistered', function() {
        it('should be false', function () {
            expect(mygad.isRegistered()).to.be.true;
        });
    });

    describe('#isRegistered', function() {
        it('should be true if _id is assgined', function () {
            mygad._id = 1;
            expect(mygad.isRegistered()).to.be.true;
        });
    });

    describe('#isEnabled', function() {
        it('should be false', function () {
            mygad.disable();
            expect(mygad.isEnabled()).to.be.false;
        });
    });

    describe('#isEnabled', function() {
        it('should be true if enabled', function () {
            mygad.enable();
            expect(mygad.isEnabled()).to.be.true;
        });
    });
});

describe('APIs Signature Check', function() {
    var mydev = dev,
        mygad = gad;

    ncMock.enable();
    mydev.enable();
    mygad.enable();

    describe('#getPanelInfo', function() {
        it('should throw if input keys is not an array of string or not a single string', function () {
            expect(function () { return mygad.getPanelInfo(1); }).to.throw(TypeError);
            expect(function () { return mygad.getPanelInfo(null); }).to.throw(TypeError);
            expect(function () { return mygad.getPanelInfo(NaN); }).to.throw(TypeError);
            expect(function () { return mygad.getPanelInfo(true); }).to.throw(TypeError);
            expect(function () { return mygad.getPanelInfo(function () {}); }).to.throw(TypeError);
            expect(function () { return mygad.getPanelInfo({}); }).to.throw(TypeError);
            expect(function () { return mygad.getPanelInfo([ 'a', 1, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.getPanelInfo([ 'a', null, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.getPanelInfo([ 'a', NaN, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.getPanelInfo([ 'a', true, 'c' ]); }).to.throw(TypeError);
        });

        it('should not throw if input is undefined, a string, or an array of string', function () {
            expect(function () { return mygad.getPanelInfo(); }).not.to.throw(TypeError);
            expect(function () { return mygad.getPanelInfo('xxx'); }).not.to.throw(TypeError);
            expect(function () { return mygad.getPanelInfo([]); }).not.to.throw(TypeError);
            expect(function () { return mygad.getPanelInfo([ 'a', 'b', 'c' ]); }).not.to.throw(TypeError);
        });
    });

    describe('#getProps', function() {
        it('should throw if input keys is not an array of string or not a single string', function () {
            expect(function () { return mygad.getProps(1); }).to.throw(TypeError);
            expect(function () { return mygad.getProps(null); }).to.throw(TypeError);
            expect(function () { return mygad.getProps(NaN); }).to.throw(TypeError);
            expect(function () { return mygad.getProps(true); }).to.throw(TypeError);
            expect(function () { return mygad.getProps(function () {}); }).to.throw(TypeError);
            expect(function () { return mygad.getProps({}); }).to.throw(TypeError);
            expect(function () { return mygad.getProps([ 'a', 1, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.getProps([ 'a', null, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.getProps([ 'a', NaN, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.getProps([ 'a', true, 'c' ]); }).to.throw(TypeError);
        });

        it('should not throw if input is undefined, a string, or an array of string', function () {
            expect(function () { return mygad.getProps(); }).not.to.throw(TypeError);
            expect(function () { return mygad.getProps('xxx'); }).not.to.throw(TypeError);
            expect(function () { return mygad.getProps([]); }).not.to.throw(TypeError);
            expect(function () { return mygad.getProps([ 'a', 'b', 'c' ]); }).not.to.throw(TypeError);
        });
    });

    describe('#getAttrs', function() {
        it('should throw if input keys is not an array of string or not a single string', function () {
            expect(function () { return mygad.getAttrs(1); }).to.throw(TypeError);
            expect(function () { return mygad.getAttrs(null); }).to.throw(TypeError);
            expect(function () { return mygad.getAttrs(NaN); }).to.throw(TypeError);
            expect(function () { return mygad.getAttrs(true); }).to.throw(TypeError);
            expect(function () { return mygad.getAttrs(function () {}); }).to.throw(TypeError);
            expect(function () { return mygad.getAttrs({}); }).to.throw(TypeError);
            expect(function () { return mygad.getAttrs([ 'a', 1, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.getAttrs([ 'a', null, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.getAttrs([ 'a', NaN, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.getAttrs([ 'a', true, 'c' ]); }).to.throw(TypeError);
        });

        it('should not throw if input is undefined, a string, or an array of string', function () {
            expect(function () { return mygad.getAttrs(); }).not.to.throw(TypeError);
            expect(function () { return mygad.getAttrs('xxx'); }).not.to.throw(TypeError);
            expect(function () { return mygad.getAttrs([]); }).not.to.throw(TypeError);
            expect(function () { return mygad.getAttrs([ 'a', 'b', 'c' ]); }).not.to.throw(TypeError);
        });
    });

    describe('#setPanelInfo', function() {
        it('should throw if input info is not an object', function () {
            expect(function () { return mygad.setPanelInfo(1); }).to.throw(TypeError);
            expect(function () { return mygad.setPanelInfo(null); }).to.throw(TypeError);
            expect(function () { return mygad.setPanelInfo(NaN); }).to.throw(TypeError);
            expect(function () { return mygad.setPanelInfo(true); }).to.throw(TypeError);
            expect(function () { return mygad.setPanelInfo(function () {}); }).to.throw(TypeError);
            expect(function () { return mygad.setPanelInfo([ 'a', 1, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.setPanelInfo([ 'a', null, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.setPanelInfo([ 'a', NaN, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.setPanelInfo([ 'a', true, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.setPanelInfo(); }).to.throw(TypeError);
            expect(function () { return mygad.setPanelInfo('xxx'); }).to.throw(TypeError);
            expect(function () { return mygad.setPanelInfo([]); }).to.throw(TypeError);
            expect(function () { return mygad.setPanelInfo([ 'a', 'b', 'c' ]); }).to.throw(TypeError);
        });

        it('should not throw if input info is an object', function () {
            expect(function () { return mygad.setPanelInfo({}); }).not.to.throw(TypeError);
            expect(function () { return mygad.setPanelInfo({ a: 1 }); }).not.to.throw(TypeError);
        });
    });

    describe('#setProps', function() {
        it('should throw if input props is not an object', function () {
            expect(function () { return mygad.setProps(1); }).to.throw(TypeError);
            expect(function () { return mygad.setProps(null); }).to.throw(TypeError);
            expect(function () { return mygad.setProps(NaN); }).to.throw(TypeError);
            expect(function () { return mygad.setProps(true); }).to.throw(TypeError);
            expect(function () { return mygad.setProps(function () {}); }).to.throw(TypeError);
            expect(function () { return mygad.setProps([ 'a', 1, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.setProps([ 'a', null, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.setProps([ 'a', NaN, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.setProps([ 'a', true, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.setProps(); }).to.throw(TypeError);
            expect(function () { return mygad.setProps('xxx'); }).to.throw(TypeError);
            expect(function () { return mygad.setProps([]); }).to.throw(TypeError);
            expect(function () { return mygad.setProps([ 'a', 'b', 'c' ]); }).to.throw(TypeError);
        });

        it('should not throw if input props is an object', function () {
            expect(function () { return mygad.setProps({}); }).not.to.throw(TypeError);
            expect(function () { return mygad.setProps({ a: 1 }); }).not.to.throw(TypeError);

        });
    });

    describe('#setAttrs', function() {
        it('should throw if input attrs is not an object', function () {
            expect(function () { return mygad.setAttrs(1); }).to.throw(TypeError);
            expect(function () { return mygad.setAttrs(null); }).to.throw(TypeError);
            expect(function () { return mygad.setAttrs(NaN); }).to.throw(TypeError);
            expect(function () { return mygad.setAttrs(true); }).to.throw(TypeError);
            expect(function () { return mygad.setAttrs(function () {}); }).to.throw(TypeError);
            expect(function () { return mygad.setAttrs([ 'a', 1, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.setAttrs([ 'a', null, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.setAttrs([ 'a', NaN, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.setAttrs([ 'a', true, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.setAttrs(); }).to.throw(TypeError);
            expect(function () { return mygad.setAttrs('xxx'); }).to.throw(TypeError);
            expect(function () { return mygad.setAttrs([]); }).to.throw(TypeError);
            expect(function () { return mygad.setAttrs([ 'a', 'b', 'c' ]); }).to.throw(TypeError);
        });

        it('should not throw if input attrs is an object', function () {
            expect(function () { return mygad.setAttrs({}); }).not.to.throw(TypeError);
            expect(function () { return mygad.setAttrs({ a: 1 }); }).not.to.throw(TypeError);
        });
    });

    describe('#read', function() {
        it('should throw if input attrName is not a string', function () {
            expect(function () { return mygad.read(1); }).to.throw(TypeError);
            expect(function () { return mygad.read(null); }).to.throw(TypeError);
            expect(function () { return mygad.read(NaN); }).to.throw(TypeError);
            expect(function () { return mygad.read(true); }).to.throw(TypeError);
            expect(function () { return mygad.read(function () {}); }).to.throw(TypeError);
            expect(function () { return mygad.read([ 'a', 1, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.read([ 'a', null, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.read([ 'a', NaN, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.read([ 'a', true, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.read(); }).to.throw(TypeError);
            expect(function () { return mygad.read([]); }).to.throw(TypeError);
            expect(function () { return mygad.read([ 'a', 'b', 'c' ]); }).to.throw(TypeError);
        });

        it('should not throw if input attrName is a string', function () {
            expect(function () { return mygad.read('xxx'); }).not.to.throw(Error);
        });
    });

    describe('#write', function() {
        it('should throw if input attrName is not a string', function () {
            expect(function () { return mygad.write(1); }).to.throw(TypeError);
            expect(function () { return mygad.write(null); }).to.throw(TypeError);
            expect(function () { return mygad.write(NaN); }).to.throw(TypeError);
            expect(function () { return mygad.write(true); }).to.throw(TypeError);
            expect(function () { return mygad.write(function () {}); }).to.throw(TypeError);
            expect(function () { return mygad.write([ 'a', 1, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.write([ 'a', null, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.write([ 'a', NaN, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.write([ 'a', true, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.write(); }).to.throw(TypeError);
            expect(function () { return mygad.write([]); }).to.throw(TypeError);
            expect(function () { return mygad.write([ 'a', 'b', 'c' ]); }).to.throw(TypeError);
        });

        it('should throw if input val is not given', function () {
            expect(function () { return mygad.write('xxx'); }).to.throw(Error);
            expect(function () { return mygad.write('xxx', function () {}); }).to.throw(Error);
        });

        it('should not throw if input attrName is a string and val is given', function () {
            expect(function () { return mygad.write('xxx', 1); }).not.to.throw(Error);
            expect(function () { return mygad.write('xxx', 'x'); }).not.to.throw(Error);
            expect(function () { return mygad.write('xxx', true); }).not.to.throw(Error);
            expect(function () { return mygad.write('xxx', NaN); }).not.to.throw(Error);
            expect(function () { return mygad.write('xxx', []); }).not.to.throw(Error);
            expect(function () { return mygad.write('xxx', {}); }).not.to.throw(Error);
        });
    });

    describe('#exec', function() {
        it('should throw if input attrName is not a string', function () {
            expect(function () { return mygad.exec(1); }).to.throw(TypeError);
            expect(function () { return mygad.exec(null); }).to.throw(TypeError);
            expect(function () { return mygad.exec(NaN); }).to.throw(TypeError);
            expect(function () { return mygad.exec(true); }).to.throw(TypeError);
            expect(function () { return mygad.exec(function () {}); }).to.throw(TypeError);
            expect(function () { return mygad.exec([ 'a', 1, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.exec([ 'a', null, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.exec([ 'a', NaN, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.exec([ 'a', true, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.exec(); }).to.throw(TypeError);
            expect(function () { return mygad.exec([]); }).to.throw(TypeError);
            expect(function () { return mygad.exec([ 'a', 'b', 'c' ]); }).to.throw(TypeError);
        });

        it('should not throw if input attrName is a string', function () {
            expect(function () { return mygad.exec('xxx', [1]); }).not.to.throw(Error);
            expect(function () { return mygad.exec('xxx', 'x'); }).not.to.throw(Error);
            expect(function () { return mygad.exec('xxx', true); }).not.to.throw(Error);
            expect(function () { return mygad.exec('xxx', NaN); }).not.to.throw(Error);
            expect(function () { return mygad.exec('xxx', []); }).not.to.throw(Error);
            expect(function () { return mygad.exec('xxx', {}); }).not.to.throw(Error);
        });
    });


    // This recovery test should left to the last one
    describe('#recoverFromRecord', function() {
        it('should throw if input rec is not an object', function () {
            expect(function () { return mygad.recoverFromRecord(1); }).to.throw(TypeError);
            expect(function () { return mygad.recoverFromRecord(null); }).to.throw(TypeError);
            expect(function () { return mygad.recoverFromRecord(NaN); }).to.throw(TypeError);
            expect(function () { return mygad.recoverFromRecord(true); }).to.throw(TypeError);
            expect(function () { return mygad.recoverFromRecord(function () {}); }).to.throw(TypeError);
            expect(function () { return mygad.recoverFromRecord([ 'a', 1, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.recoverFromRecord([ 'a', null, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.recoverFromRecord([ 'a', NaN, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.recoverFromRecord([ 'a', true, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad.recoverFromRecord(); }).to.throw(TypeError);
            expect(function () { return mygad.recoverFromRecord('xxx'); }).to.throw(TypeError);
            expect(function () { return mygad.recoverFromRecord([]); }).to.throw(TypeError);
            expect(function () { return mygad.recoverFromRecord([ 'a', 'b', 'c' ]); }).to.throw(TypeError);
        });

        it('should not throw if input rec is an object', function () {
            expect(function () { return mygad.recoverFromRecord({ panel: { enabled: true }, attrs: {}, props: {} } ); }).not.to.throw(TypeError);
        });
    });
});

describe.skip('APIs functional check', function() {
    // Test in integration part
});