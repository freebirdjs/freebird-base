var EventEmitter = require('events'),
    util = require('util'),
    _ = require('busyman'),
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
    _freebird: fb,
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
    _fire: function (evt, data) {
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
            this._freebird.emit(evt, emitData);
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
    gadRead: function () {},
    gadWrite: function () {},
    gadExec: function () {},
    writeReportCfg: function () {},
    readReportCfg: function () {}
};

// fb.on('_gad:error', function (err) {
//     console.log(err);
// });

/*************************************************************************************************/
/*** Device Mockup Generation                                                                  ***/
/*************************************************************************************************/
dev = new Device(ncMock, rawDev);
dev.extra = ext;

dev = dev.set('net', {
    role: 'fake',
    parent: '0',
    maySleep: false,
    sleepPeriod: 30,
    address: { permanent: rawDev.permAddr, dynamic: rawDev.dynAddr }
});

dev = dev.set('attrs', rawDev.attrs);
dev = dev.set('props', { location: 'home' });
dev._id = 3;
dev.enable();

/*************************************************************************************************/
/*** Gadget Mockup Generation                                                                  ***/
/*************************************************************************************************/
auxId = 60;
gad = new Gadget(dev, auxId, rawDev.gads[0]);
gad.extra = gadext;
gad._id = 100;

describe('Device Constructor', function() {
    var mygad = gad;

    describe('#No Arg', function() {
        it('should throw if no argument input', function () {
            expect(function () { return new Gadget(); }).to.throw(TypeError);
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

    describe('#get netcore', function() {
        it('should equal to ncMock', function () {
            expect(mygad.get('netcore')).to.be.equal(ncMock);
            // expect(mygad.get('nc')).to.be.equal(ncMock);
        });
    });

    describe('#get raw gad', function() {
        it('should equal to rawDev.gads[0]', function () {
            expect(mygad.get('raw')).to.be.equal(rawDev.gads[0]);
            // expect(mygad.get('rawGad')).to.be.equal(rawDev.gads[0]);
        });
    });

    describe('#get gad id', function() {
        it('should be 100', function () {
            expect(mygad.get('id')).to.be.equal(100);
        });
    });

    describe('#extra', function() {
        it('should equal to gadext', function () {
            expect(mygad.extra).to.be.equal(gadext);
        });
    });

    describe('#get dev', function() {
        it('should equal to dev', function () {
            // expect(mygad.get('dev')).to.be.equal(dev);
            expect(mygad.get('device')).to.be.equal(dev);
        });
    });

    describe('#get perm addr', function() {
        it('should equal to rawDev.permAddr', function () {
            expect(mygad.get('permAddr')).to.be.a('string');
            expect(mygad.get('permAddr')).to.be.equal(rawDev.permAddr);
        });
    });

    describe('#get dynamic addr', function() {
        it('should equal to rawDev.dynAddr', function () {
            expect(mygad.get('dynAddr')).to.be.a('string');
            expect(mygad.get('dynAddr')).to.be.equal(rawDev.dynAddr);
        });
    });

    describe('#get auxId', function() {
        it('should equal to auxId', function () {
            expect(mygad.get('auxId')).to.be.equal(auxId);
        });
    });

    describe('#get location', function() {
        it('should equal to home', function () {
            expect(mygad.get('location')).to.be.equal('home');
        });
    });

    describe('#get panel info', function() {
        it('should equal to { enabled: false, profile: "", classId: "" }', function () {
            mygad.disable();
            expect(mygad.get('panel')).to.be.eql({ enabled: false, profile: '', classId: '' });
        });
    });

    describe('#get props', function() {
        it('should equal to mygad._props', function () {
            expect(mygad.get('props')).to.be.eql(mygad._props);
        });
    });

    describe('#get attrs', function() {
        it('should equal to mygad._attrs', function () {
            expect(mygad.get('attrs')).to.be.eql(mygad._attrs);
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

    describe('#isEnabled - disable', function() {
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

    describe('#isRegistered()', function() {
        it('should always pass - no signature', function (done) {
            done();
        });
    });

    describe('#isEnabled()', function() {
        it('should always pass - no signature', function (done) {
            done();
        });
    });

    describe('#enable()', function() {
        it('should always pass - no signature', function (done) {
            done();
        });
    });

    describe('#disable()', function() {
        it('should always pass - no signature', function (done) {
            done();
        });
    });

    describe('#get(propName, arg) - propName test', function() {
        it('should throw if propName is not a string', function () {
            expect(function () { return mygad.get(); }).to.throw(TypeError);
            expect(function () { return mygad.get(1); }).to.throw(TypeError);
            expect(function () { return mygad.get([]); }).to.throw(TypeError);
            expect(function () { return mygad.get(null); }).to.throw(TypeError);
            expect(function () { return mygad.get(NaN); }).to.throw(TypeError);
            expect(function () { return mygad.get(true); }).to.throw(TypeError);
            expect(function () { return mygad.get(function () {}); }).to.throw(TypeError);
        });

        it('should not throw if propName is a string', function () {
            expect(function () { return mygad.get('xxx'); }).not.to.throw(TypeError);
        });
    });

    describe('#get(propName, arg) - panel arg test', function() {
        it('should throw if arg is not a string or an array', function () {
            expect(function () { return mygad.get('panel', 1); }).to.throw(TypeError);
            expect(function () { return mygad.get('panel', {}); }).to.throw(TypeError);
            expect(function () { return mygad.get('panel', null); }).to.throw(TypeError);
            expect(function () { return mygad.get('panel', NaN); }).to.throw(TypeError);
            expect(function () { return mygad.get('panel', true); }).to.throw(TypeError);
            expect(function () { return mygad.get('panel', function () {}); }).to.throw(TypeError);
        });

        it('should not throw if arg is a string or an array', function () {
            expect(function () { return mygad.get('panel'); }).not.to.throw(TypeError);
            expect(function () { return mygad.get('panel', 'sleepPeriod'); }).not.to.throw(TypeError);
            expect(function () { return mygad.get('panel', 'xxxx'); }).not.to.throw(TypeError);
            expect(function () { return mygad.get('panel', []); }).not.to.throw(TypeError);
            expect(function () { return mygad.get('panel', [ 'a', 'b', 'c' ]); }).not.to.throw(TypeError);
        });
    });

    describe('#get(propName, arg) - props arg test', function() {
        it('should throw if arg is not a string or an array', function () {
            expect(function () { return mygad.get('props', 1); }).to.throw(TypeError);
            expect(function () { return mygad.get('props', {}); }).to.throw(TypeError);
            expect(function () { return mygad.get('props', null); }).to.throw(TypeError);
            expect(function () { return mygad.get('props', NaN); }).to.throw(TypeError);
            expect(function () { return mygad.get('props', true); }).to.throw(TypeError);
            expect(function () { return mygad.get('props', function () {}); }).to.throw(TypeError);
        });

        it('should not throw if arg is a string or an array', function () {
            expect(function () { return mygad.get('props'); }).not.to.throw(TypeError);
            expect(function () { return mygad.get('props', 'name'); }).not.to.throw(TypeError);
            expect(function () { return mygad.get('props', 'xxxx'); }).not.to.throw(TypeError);
            expect(function () { return mygad.get('props', []); }).not.to.throw(TypeError);
            expect(function () { return mygad.get('props', [ 'a', 'b', 'c' ]); }).not.to.throw(TypeError);
        });
    });

    describe('#get(propName, arg) - attrs arg test', function() {
        it('should throw if arg is not a string or an array', function () {
            expect(function () { return mygad.get('attrs', 1); }).to.throw(TypeError);
            expect(function () { return mygad.get('attrs', {}); }).to.throw(TypeError);
            expect(function () { return mygad.get('attrs', null); }).to.throw(TypeError);
            expect(function () { return mygad.get('attrs', NaN); }).to.throw(TypeError);
            expect(function () { return mygad.get('attrs', true); }).to.throw(TypeError);
            expect(function () { return mygad.get('attrs', function () {}); }).to.throw(TypeError);
        });

        it('should not throw if arg is a string or an array', function () {
            expect(function () { return mygad.get('attrs'); }).not.to.throw(TypeError);
            expect(function () { return mygad.get('attrs', 'name'); }).not.to.throw(TypeError);
            expect(function () { return mygad.get('attrs', 'xxxx'); }).not.to.throw(TypeError);
            expect(function () { return mygad.get('attrs', []); }).not.to.throw(TypeError);
            expect(function () { return mygad.get('attrs', [ 'a', 'b', 'c' ]); }).not.to.throw(TypeError);
        });
    });

    describe('#set(propName, arg) - propName test', function() {
        it('should throw if propName is not a string', function () {
            expect(function () { return mygad.set(); }).to.throw(TypeError);
            expect(function () { return mygad.set(1); }).to.throw(TypeError);
            expect(function () { return mygad.set([]); }).to.throw(TypeError);
            expect(function () { return mygad.set(null); }).to.throw(TypeError);
            expect(function () { return mygad.set(NaN); }).to.throw(TypeError);
            expect(function () { return mygad.set(true); }).to.throw(TypeError);
            expect(function () { return mygad.set(function () {}); }).to.throw(TypeError);
        });

        it('should not throw if propName is a string', function () {
            expect(function () { return mygad.set('xxx'); }).not.to.throw(TypeError);
        });
    });

    describe('#set(propName, arg) - _id arg test', function() {
        it('should throw if arg is not a string or a number', function () {
            expect(function () { return mygad.set('_id'); }).to.throw(TypeError);
            expect(function () { return mygad.set('_id', []); }).to.throw(TypeError);
            expect(function () { return mygad.set('_id', {}); }).to.throw(TypeError);
            expect(function () { return mygad.set('_id', null); }).to.throw(TypeError);
            expect(function () { return mygad.set('_id', NaN); }).to.throw(TypeError);
            expect(function () { return mygad.set('_id', true); }).to.throw(TypeError);
            expect(function () { return mygad.set('_id', function () {}); }).to.throw(TypeError);
        });

        it('should not throw if propName is a string', function () {
            expect(function () { return mygad.set('_id', 1); }).not.to.throw(TypeError);
            expect(function () { return mygad.set('_id', 'xxx'); }).not.to.throw(TypeError);
        });
    });

    describe('#set(propName, arg) - _raw arg test', function() {
        it('should always pass - no restriction', function () {
            expect(function () { return mygad.set('_raw', 1); }).not.to.throw(Error);
            expect(function () { return mygad.set('_raw', 'xxx'); }).not.to.throw(Error);
        });
    });

    describe('#set(propName, arg) - panel arg test', function() {
        it('should throw if arg is not an object', function () {
            expect(function () { return mygad.set('panel'); }).to.throw(TypeError);
            expect(function () { return mygad.set('panel', []); }).to.throw(TypeError);
            expect(function () { return mygad.set('panel', null); }).to.throw(TypeError);
            expect(function () { return mygad.set('panel', NaN); }).to.throw(TypeError);
            expect(function () { return mygad.set('panel', true); }).to.throw(TypeError);
            expect(function () { return mygad.set('panel', function () {}); }).to.throw(TypeError);
            expect(function () { return mygad.set('panel', 1); }).to.throw(TypeError);
            expect(function () { return mygad.set('panel', 'xxx'); }).to.throw(TypeError);
        });

        it('should not throw if propName is a string', function () {
            expect(function () { return mygad.set('panel', {}); }).not.to.throw(TypeError);
        });
    });

    describe('#set(propName, arg) - props arg test', function() {
        it('should throw if arg is not an object', function () {
            expect(function () { return mygad.set('props'); }).to.throw(TypeError);
            expect(function () { return mygad.set('props', []); }).to.throw(TypeError);
            expect(function () { return mygad.set('props', null); }).to.throw(TypeError);
            expect(function () { return mygad.set('props', NaN); }).to.throw(TypeError);
            expect(function () { return mygad.set('props', true); }).to.throw(TypeError);
            expect(function () { return mygad.set('props', function () {}); }).to.throw(TypeError);
            expect(function () { return mygad.set('props', 1); }).to.throw(TypeError);
            expect(function () { return mygad.set('props', 'xxx'); }).to.throw(TypeError);
        });

        it('should not throw if propName is a string', function () {
            expect(function () { return mygad.set('props', {}); }).not.to.throw(TypeError);
        });
    });

    describe('#set(propName, arg) - attrs arg test', function() {
        it('should throw if arg is not an object', function () {
            expect(function () { return mygad.set('attrs'); }).to.throw(TypeError);
            expect(function () { return mygad.set('attrs', []); }).to.throw(TypeError);
            expect(function () { return mygad.set('attrs', null); }).to.throw(TypeError);
            expect(function () { return mygad.set('attrs', NaN); }).to.throw(TypeError);
            expect(function () { return mygad.set('attrs', true); }).to.throw(TypeError);
            expect(function () { return mygad.set('attrs', function () {}); }).to.throw(TypeError);
            expect(function () { return mygad.set('attrs', 1); }).to.throw(TypeError);
            expect(function () { return mygad.set('attrs', 'xxx'); }).to.throw(TypeError);
        });

        it('should not throw if propName is an object', function () {
            expect(function () { return mygad.set('attrs', {}); }).not.to.throw(TypeError);
        });
    });

    describe('#dump()', function() {
        it('should always pass - no restriction', function () {
            expect(function () { return mygad.dump(); }).not.to.throw(Error);
            expect(function () { return mygad.dump(true); }).not.to.throw(Error);
            expect(function () { return mygad.dump(false); }).not.to.throw(Error);
            expect(function () { return mygad.dump({}); }).not.to.throw(Error);
        });
    });

    describe('#recoverFromRecord(rec)', function() {
        it('should throw if rec is not an object', function () {
            expect(function () { return mygad.recoverFromRecord(); }).to.throw(TypeError);
            expect(function () { return mygad.recoverFromRecord([]); }).to.throw(TypeError);
            expect(function () { return mygad.recoverFromRecord(null); }).to.throw(TypeError);
            expect(function () { return mygad.recoverFromRecord(NaN); }).to.throw(TypeError);
            expect(function () { return mygad.recoverFromRecord(true); }).to.throw(TypeError);
            expect(function () { return mygad.recoverFromRecord(function () {}); }).to.throw(TypeError);
            expect(function () { return mygad.recoverFromRecord(1); }).to.throw(TypeError);
            expect(function () { return mygad.recoverFromRecord('xxx'); }).to.throw(TypeError);
        });

        it('should not throw if propName is a string', function () {
            expect(function () { return mygad.recoverFromRecord({
                id: 100,
                panel: {
                    enabled: false,
                    profile: 'xxxx',
                    classId: 'temperature'
                },
                attrs: {},
                props: {}
            }); }).not.to.throw(TypeError);
        });
    });

    describe('#read(attrName, callback)', function() {
        var cb = function () {};
        it('should throw if attrName is not a string', function () {
            expect(function () { return mygad.read(cb); }).to.throw(TypeError);
            expect(function () { return mygad.read(1, cb); }).to.throw(TypeError);
            expect(function () { return mygad.read([], cb); }).to.throw(TypeError);
            expect(function () { return mygad.read(null, cb); }).to.throw(TypeError);
            expect(function () { return mygad.read(NaN, cb); }).to.throw(TypeError);
            expect(function () { return mygad.read(true, cb); }).to.throw(TypeError);
            expect(function () { return mygad.read(function () {}, cb); }).to.throw(TypeError);
        });

        it('should not throw if attrName is a string', function () {
            expect(function () { return mygad.read('xxx', cb); }).not.to.throw(TypeError);
        });

        it('should throw if cb is not a function', function () {
            expect(function () { return mygad.read('x'); }).to.throw(TypeError);
            expect(function () { return mygad.read('x', 1); }).to.throw(TypeError);
            expect(function () { return mygad.read('x', []); }).to.throw(TypeError);
            expect(function () { return mygad.read('x', null); }).to.throw(TypeError);
            expect(function () { return mygad.read('x', NaN); }).to.throw(TypeError);
            expect(function () { return mygad.read('x', true); }).to.throw(TypeError);
        });

        it('should not throw if cb is a function', function () {
            expect(function () { return mygad.read('xxx', cb); }).not.to.throw(TypeError);
        });
    });

    describe('#write(attrName, val, callback)', function() {
        var cb = function () {};
        it('should throw if attrName is not a string', function () {
            expect(function () { return mygad.write(cb); }).to.throw(TypeError);
            expect(function () { return mygad.write(1, 'x', cb); }).to.throw(TypeError);
            expect(function () { return mygad.write([], 'x', cb); }).to.throw(TypeError);
            expect(function () { return mygad.write(null, 'x', cb); }).to.throw(TypeError);
            expect(function () { return mygad.write(NaN, 'x', cb); }).to.throw(TypeError);
            expect(function () { return mygad.write(true, 'x', cb); }).to.throw(TypeError);
            expect(function () { return mygad.write(function () {}, 'x', cb); }).to.throw(TypeError);
        });

        it('should not throw if attrName is a string', function () {
            expect(function () { return mygad.write('xxx', 'x', cb); }).not.to.throw(TypeError);
        });

        it('should throw if cb is not a function', function () {
            expect(function () { return mygad.write('x', 'x'); }).to.throw(TypeError);
            expect(function () { return mygad.write('x', 'x', 1); }).to.throw(TypeError);
            expect(function () { return mygad.write('x', 'x', []); }).to.throw(TypeError);
            expect(function () { return mygad.write('x', 'x', null); }).to.throw(TypeError);
            expect(function () { return mygad.write('x', 'x', NaN); }).to.throw(TypeError);
            expect(function () { return mygad.write('x', 'x', true); }).to.throw(TypeError);
        });

        it('should not throw if cb is a function', function () {
            expect(function () { return mygad.write('xxx', 'x', cb); }).not.to.throw(TypeError);
        });

        it('should throw if val is undefined', function () {
            expect(function () { return mygad.write('xxx', undefined, cb); }).to.throw(TypeError);
        });
    });

    describe('#exec(attrName, args, callback)', function() {
        var cb = function () {};
        it('should throw if attrName is not a string', function () {
            expect(function () { return mygad.exec(cb); }).to.throw(TypeError);
            expect(function () { return mygad.exec(1, ['x'], cb); }).to.throw(TypeError);
            expect(function () { return mygad.exec([], ['x'], cb); }).to.throw(TypeError);
            expect(function () { return mygad.exec(null, ['x'], cb); }).to.throw(TypeError);
            expect(function () { return mygad.exec(NaN, ['x'], cb); }).to.throw(TypeError);
            expect(function () { return mygad.exec(true, ['x'], cb); }).to.throw(TypeError);
            expect(function () { return mygad.exec(function () {}, ['x'], cb); }).to.throw(TypeError);
        });

        it('should not throw if attrName is a string', function () {
            expect(function () { return mygad.exec('xxx', ['x'], cb); }).not.to.throw(TypeError);
        });

        it('should throw if cb is not a function', function () {
            expect(function () { return mygad.exec('x', ['x']); }).to.throw(TypeError);
            expect(function () { return mygad.exec('x', ['x'], 1); }).to.throw(TypeError);
            expect(function () { return mygad.exec('x', ['x'], []); }).to.throw(TypeError);
            expect(function () { return mygad.exec('x', ['x'], null); }).to.throw(TypeError);
            expect(function () { return mygad.exec('x', ['x'], NaN); }).to.throw(TypeError);
            expect(function () { return mygad.exec('x', ['x'], true); }).to.throw(TypeError);
        });

        it('should not throw if cb is a function', function () {
            expect(function () { return mygad.exec('xxx', ['x'], cb); }).not.to.throw(TypeError);
        });

        it('should throw if val is not an array', function () {
            expect(function () { return mygad.exec('xxx', undefined, cb); }).to.throw(TypeError);
            expect(function () { return mygad.exec('xxx', 'x', cb); }).to.throw(TypeError);
            expect(function () { return mygad.exec('xxx', null, cb); }).to.throw(TypeError);
            expect(function () { return mygad.exec('xxx', {}, cb); }).to.throw(TypeError);
        });
    });

    describe('#readReportCfg(attrName, callback)', function() {
        var cb = function () {};
        it('should throw if attrName is not a string', function () {
            expect(function () { return mygad.readReportCfg(cb); }).to.throw(TypeError);
            expect(function () { return mygad.readReportCfg(1, cb); }).to.throw(TypeError);
            expect(function () { return mygad.readReportCfg([], cb); }).to.throw(TypeError);
            expect(function () { return mygad.readReportCfg(null, cb); }).to.throw(TypeError);
            expect(function () { return mygad.readReportCfg(NaN, cb); }).to.throw(TypeError);
            expect(function () { return mygad.readReportCfg(true, cb); }).to.throw(TypeError);
            expect(function () { return mygad.readReportCfg(function () {}, cb); }).to.throw(TypeError);
        });

        it('should not throw if attrName is a string', function () {
            expect(function () { return mygad.readReportCfg('xxx', cb); }).not.to.throw(TypeError);
        });

        it('should throw if cb is not a function', function () {
            expect(function () { return mygad.readReportCfg('x'); }).to.throw(TypeError);
            expect(function () { return mygad.readReportCfg('x', 1); }).to.throw(TypeError);
            expect(function () { return mygad.readReportCfg('x', []); }).to.throw(TypeError);
            expect(function () { return mygad.readReportCfg('x', null); }).to.throw(TypeError);
            expect(function () { return mygad.readReportCfg('x', NaN); }).to.throw(TypeError);
            expect(function () { return mygad.readReportCfg('x', true); }).to.throw(TypeError);
        });

        it('should not throw if cb is a function', function () {
            expect(function () { return mygad.readReportCfg('xxx', cb); }).not.to.throw(TypeError);
        });
    });

    describe('#writeReportCfg(attrName, cfg, callback)', function() {
        var cb = function () {};
        it('should throw if attrName is not a string', function () {
            expect(function () { return mygad.writeReportCfg(cb); }).to.throw(TypeError);
            expect(function () { return mygad.writeReportCfg(1, {}, cb); }).to.throw(TypeError);
            expect(function () { return mygad.writeReportCfg([], {}, cb); }).to.throw(TypeError);
            expect(function () { return mygad.writeReportCfg(null, {}, cb); }).to.throw(TypeError);
            expect(function () { return mygad.writeReportCfg(NaN, {}, cb); }).to.throw(TypeError);
            expect(function () { return mygad.writeReportCfg(true, {}, cb); }).to.throw(TypeError);
            expect(function () { return mygad.writeReportCfg(function () {}, {}, cb); }).to.throw(TypeError);
        });

        it('should not throw if attrName is a string', function () {
            expect(function () { return mygad.writeReportCfg('xxx', {}, cb); }).not.to.throw(TypeError);
        });

        it('should throw if cb is not a function', function () {
            expect(function () { return mygad.writeReportCfg('x', {}); }).to.throw(TypeError);
            expect(function () { return mygad.writeReportCfg('x', {}, 1); }).to.throw(TypeError);
            expect(function () { return mygad.writeReportCfg('x', {}, []); }).to.throw(TypeError);
            expect(function () { return mygad.writeReportCfg('x', {}, null); }).to.throw(TypeError);
            expect(function () { return mygad.writeReportCfg('x', {}, NaN); }).to.throw(TypeError);
            expect(function () { return mygad.writeReportCfg('x', {}, true); }).to.throw(TypeError);
        });

        it('should not throw if cb is a function', function () {
            expect(function () { return mygad.writeReportCfg('xxx', {}, cb); }).not.to.throw(TypeError);
        });

        it('should throw if val is not an object', function () {
            expect(function () { return mygad.writeReportCfg('xxx', undefined, cb); }).to.throw(TypeError);
            expect(function () { return mygad.writeReportCfg('xxx', 'x', cb); }).to.throw(TypeError);
            expect(function () { return mygad.writeReportCfg('xxx', null, cb); }).to.throw(TypeError);
            expect(function () { return mygad.writeReportCfg('xxx', [], cb); }).to.throw(TypeError);
        });
    });

    describe('#_callDriver(drvName, args)', function() {
        it('should throw if drvName is not a string', function () {
            expect(function () { return mygad._callDriver([], 1); }).to.throw(TypeError);
            expect(function () { return mygad._callDriver({}, 1); }).to.throw(TypeError);
            expect(function () { return mygad._callDriver(null, 1); }).to.throw(TypeError);
            expect(function () { return mygad._callDriver(NaN, 1); }).to.throw(TypeError);
            expect(function () { return mygad._callDriver(true, 1); }).to.throw(TypeError);
            expect(function () { return mygad._callDriver(function () {}, 1); }).to.throw(TypeError);
            expect(function () { return mygad._callDriver(1); }).to.throw(TypeError);
        });

        it('should not throw if drvName is a string', function () {
            expect(function () { return mygad._callDriver('_id', 1); }).not.to.throw(TypeError);
            expect(function () { return mygad._callDriver('in', 2); }).not.to.throw(TypeError);
            expect(function () { return mygad._callDriver('out', 10); }).not.to.throw(TypeError);
        });
    });

    describe('#_fire(evt, data)', function() {
        it('should throw if evt is not a string', function () {
            expect(function () { return mygad._fire([], 1); }).to.throw(TypeError);
            expect(function () { return mygad._fire({}, 1); }).to.throw(TypeError);
            expect(function () { return mygad._fire(null, 1); }).to.throw(TypeError);
            expect(function () { return mygad._fire(NaN, 1); }).to.throw(TypeError);
            expect(function () { return mygad._fire(true, 1); }).to.throw(TypeError);
            expect(function () { return mygad._fire(function () {}, 1); }).to.throw(TypeError);
            expect(function () { return mygad._fire(1); }).to.throw(TypeError);
        });

        it('should not throw if evt is a string', function () {
            expect(function () { return mygad._fire('_id', 1); }).not.to.throw(TypeError);
            expect(function () { return mygad._fire('in', 2); }).not.to.throw(TypeError);
            expect(function () { return mygad._fire('out', 10); }).not.to.throw(TypeError);
        });
    });

    describe('#_clear()', function() {
        it('should always pass - no signature', function (done) {
            done();
        });
    });

    describe('#_dumpGadInfo()', function() {
        it('should always pass - no signature', function (done) {
            done();
        });
    });

    describe('#_dangerouslyAppendAttrs', function() {
        it('should throw if input attrs is not an object', function () {
            expect(function () { return mygad._dangerouslyAppendAttrs(1); }).to.throw(TypeError);
            expect(function () { return mygad._dangerouslyAppendAttrs(null); }).to.throw(TypeError);
            expect(function () { return mygad._dangerouslyAppendAttrs(NaN); }).to.throw(TypeError);
            expect(function () { return mygad._dangerouslyAppendAttrs(true); }).to.throw(TypeError);
            expect(function () { return mygad._dangerouslyAppendAttrs(function () {}); }).to.throw(TypeError);
            expect(function () { return mygad._dangerouslyAppendAttrs([ 'a', 1, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad._dangerouslyAppendAttrs([ 'a', null, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad._dangerouslyAppendAttrs([ 'a', NaN, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad._dangerouslyAppendAttrs([ 'a', true, 'c' ]); }).to.throw(TypeError);
            expect(function () { return mygad._dangerouslyAppendAttrs(); }).to.throw(TypeError);
            expect(function () { return mygad._dangerouslyAppendAttrs('xxx'); }).to.throw(TypeError);
            expect(function () { return mygad._dangerouslyAppendAttrs([]); }).to.throw(TypeError);
            expect(function () { return mygad._dangerouslyAppendAttrs([ 'a', 'b', 'c' ]); }).to.throw(TypeError);
        });

        it('should not throw if input attrs is an object', function () {
            expect(function () { return mygad._dangerouslyAppendAttrs({}); }).not.to.throw(TypeError);
            expect(function () { return mygad._dangerouslyAppendAttrs({ a: 1 }); }).not.to.throw(TypeError);
        });
    });
});
