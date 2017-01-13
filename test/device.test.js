var EventEmitter = require('events'),
    util = require('util'),
    _ = require('busyman'),
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
    _freebird: fb,
    _controller: {},
    _net: {
        name: 'mock_nc',
        enabled: false,
        protocol: { phy: 'fake' },
        startTime: 0,
        defaultJoinTime: 180,
        // traffic: {
        //     in: { hits: 10, bytes: 100 },
        //     out: { hits: 20, bytes: 20 }
        // }
    },
    extra: null,
    cookRawDev: null,
    cookRawGad: null,
    _drivers: {},
    _findDriver: function () { return function () {}; },
    getName: function () { return ncMock._net.name; },
    _fireup: function (evt, data) {
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

dev = dev.set('net', {
    role: 'fake',
    parent: '0',
    maySleep: false,
    sleepPeriod: 30,
    address: { permanent: rawDev.permAddr, dynamic: rawDev.dynAddr }
});

dev = dev.set('attrs', rawDev.attrs);
dev._id = 3;
dev.enable();

describe('Device Constructor', function() {
    var mydev = dev;

    describe('#get netcore', function() {
        it('should have a netcore of ncMock', function () {
            expect(mydev.get('netcore')).to.be.equal(ncMock);
        });
    });

    describe('#get raw device', function() {
        it('should have a raw device of rawDev', function () {
            expect(mydev.get('raw')).to.be.equal(rawDev);
        });
    });

    describe('#get dev id', function() {
        it('should have an id of 3', function () {
            expect(mydev.get('id')).to.be.equal(3);
        });
    });

    describe('#extra', function() {
        it('should have an extra information object of ext', function () {
            expect(mydev.extra).to.be.equal(ext);
        });
    });

    describe('#get gad table', function() {
        it('should have gadget table of an array with length 0', function () {
            expect(mydev.get('gadTable')).to.be.an('Array');
            expect(mydev.get('gadTable').length).to.be.equal(0);
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

    describe('#get address', function() {
        it('has permanent address equals to rawDev.permAddr and dynamic address equals to rawDev.dynAddr', function () {
            expect(mydev.get('address')).to.be.eql({
                permanent: rawDev.permAddr,
                dynamic: rawDev.dynAddr
            });
        });
    });

    describe('#get permanent addr', function() {
        it('has permanent address equals to rawDev.permAddr', function () {
            expect(mydev.get('permAddr')).to.be.equal(rawDev.permAddr);
        });
    });

    describe('#get dynamic addr', function() {
        it('has dynamic address equals to rawDev.dynamic', function () {
            expect(mydev.get('dynAddr')).to.be.equal(rawDev.dynAddr);
        });
    });

    describe('#get status', function() {
        it('is in unknown status', function () {
            expect(mydev.get('status')).to.be.equal('unknown');
        });
    });

    describe('#get traffic', function() {
        it('has traffic', function () {
            expect(mydev.get('traffic')).to.be.eql({
                in: { hits: 0, bytes: 0 },
                out: { hits: 0, bytes: 0 }
            });
        });
    });

    describe('#get net info', function() {
        it('has net info', function () {
            expect(mydev.get('net')).to.be.eql(mydev._net);
        });
    });

    describe('#get props', function() {
        it('has an empty props', function () {
            expect(mydev.get('props')).to.be.eql({
                name: '',
                description: '',
                location: ''
            });
        });
    });

    describe('#get attrs', function() {
        it('has attrs of', function () {
            expect(mydev.get('attrs')).to.be.eql({
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
            expect(function () { return mydev.get(); }).to.throw(TypeError);
            expect(function () { return mydev.get(1); }).to.throw(TypeError);
            expect(function () { return mydev.get([]); }).to.throw(TypeError);
            expect(function () { return mydev.get(null); }).to.throw(TypeError);
            expect(function () { return mydev.get(NaN); }).to.throw(TypeError);
            expect(function () { return mydev.get(true); }).to.throw(TypeError);
            expect(function () { return mydev.get(function () {}); }).to.throw(TypeError);
        });

        it('should not throw if propName is a string', function () {
            expect(function () { return mydev.get('xxx'); }).not.to.throw(TypeError);
        });
    });

    describe('#get(propName, arg) - net arg test', function() {
        it('should throw if arg is not a string or an array', function () {
            expect(function () { return mydev.get('net', 1); }).to.throw(TypeError);
            expect(function () { return mydev.get('net', {}); }).to.throw(TypeError);
            expect(function () { return mydev.get('net', null); }).to.throw(TypeError);
            expect(function () { return mydev.get('net', NaN); }).to.throw(TypeError);
            expect(function () { return mydev.get('net', true); }).to.throw(TypeError);
            expect(function () { return mydev.get('net', function () {}); }).to.throw(TypeError);
        });

        it('should not throw if arg is a string or an array', function () {
            expect(function () { return mydev.get('net'); }).not.to.throw(TypeError);
            expect(function () { return mydev.get('net', 'sleepPeriod'); }).not.to.throw(TypeError);
            expect(function () { return mydev.get('net', 'xxxx'); }).not.to.throw(TypeError);
            expect(function () { return mydev.get('net', []); }).not.to.throw(TypeError);
            expect(function () { return mydev.get('net', [ 'a', 'b', 'c' ]); }).not.to.throw(TypeError);
        });
    });

    describe('#get(propName, arg) - props arg test', function() {
        it('should throw if arg is not a string or an array', function () {
            expect(function () { return mydev.get('props', 1); }).to.throw(TypeError);
            expect(function () { return mydev.get('props', {}); }).to.throw(TypeError);
            expect(function () { return mydev.get('props', null); }).to.throw(TypeError);
            expect(function () { return mydev.get('props', NaN); }).to.throw(TypeError);
            expect(function () { return mydev.get('props', true); }).to.throw(TypeError);
            expect(function () { return mydev.get('props', function () {}); }).to.throw(TypeError);
        });

        it('should not throw if arg is a string or an array', function () {
            expect(function () { return mydev.get('props'); }).not.to.throw(TypeError);
            expect(function () { return mydev.get('props', 'name'); }).not.to.throw(TypeError);
            expect(function () { return mydev.get('props', 'xxxx'); }).not.to.throw(TypeError);
            expect(function () { return mydev.get('props', []); }).not.to.throw(TypeError);
            expect(function () { return mydev.get('props', [ 'a', 'b', 'c' ]); }).not.to.throw(TypeError);
        });
    });

    describe('#get(propName, arg) - attrs arg test', function() {
        it('should throw if arg is not a string or an array', function () {
            expect(function () { return mydev.get('attrs', 1); }).to.throw(TypeError);
            expect(function () { return mydev.get('attrs', {}); }).to.throw(TypeError);
            expect(function () { return mydev.get('attrs', null); }).to.throw(TypeError);
            expect(function () { return mydev.get('attrs', NaN); }).to.throw(TypeError);
            expect(function () { return mydev.get('attrs', true); }).to.throw(TypeError);
            expect(function () { return mydev.get('attrs', function () {}); }).to.throw(TypeError);
        });

        it('should not throw if arg is a string or an array', function () {
            expect(function () { return mydev.get('attrs'); }).not.to.throw(TypeError);
            expect(function () { return mydev.get('attrs', 'name'); }).not.to.throw(TypeError);
            expect(function () { return mydev.get('attrs', 'xxxx'); }).not.to.throw(TypeError);
            expect(function () { return mydev.get('attrs', []); }).not.to.throw(TypeError);
            expect(function () { return mydev.get('attrs', [ 'a', 'b', 'c' ]); }).not.to.throw(TypeError);
        });
    });

    describe('#set(propName, arg) - propName test', function() {
        it('should throw if propName is not a string', function () {
            expect(function () { return mydev.set(); }).to.throw(TypeError);
            expect(function () { return mydev.set(1); }).to.throw(TypeError);
            expect(function () { return mydev.set([]); }).to.throw(TypeError);
            expect(function () { return mydev.set(null); }).to.throw(TypeError);
            expect(function () { return mydev.set(NaN); }).to.throw(TypeError);
            expect(function () { return mydev.set(true); }).to.throw(TypeError);
            expect(function () { return mydev.set(function () {}); }).to.throw(TypeError);
        });

        it('should not throw if propName is a string', function () {
            expect(function () { return mydev.set('xxx'); }).not.to.throw(TypeError);
        });
    });

    describe('#set(propName, arg) - _id arg test', function() {
        it('should throw if arg is not a string or a number', function () {
            expect(function () { return mydev.set('_id'); }).to.throw(TypeError);
            expect(function () { return mydev.set('_id', []); }).to.throw(TypeError);
            expect(function () { return mydev.set('_id', {}); }).to.throw(TypeError);
            expect(function () { return mydev.set('_id', null); }).to.throw(TypeError);
            expect(function () { return mydev.set('_id', NaN); }).to.throw(TypeError);
            expect(function () { return mydev.set('_id', true); }).to.throw(TypeError);
            expect(function () { return mydev.set('_id', function () {}); }).to.throw(TypeError);
        });

        it('should not throw if propName is a string', function () {
            expect(function () { return mydev.set('_id', 1); }).not.to.throw(TypeError);
            expect(function () { return mydev.set('_id', 'xxx'); }).not.to.throw(TypeError);
        });
    });

    describe('#set(propName, arg) - _raw arg test', function() {
        it('should always pass - no restriction', function () {
            expect(function () { return mydev.set('_raw', 1); }).not.to.throw(Error);
            expect(function () { return mydev.set('_raw', 'xxx'); }).not.to.throw(Error);
        });
    });

    describe('#set(propName, arg) - net arg test', function() {
        it('should throw if arg is not an object', function () {
            expect(function () { return mydev.set('net'); }).to.throw(TypeError);
            expect(function () { return mydev.set('net', []); }).to.throw(TypeError);
            expect(function () { return mydev.set('net', null); }).to.throw(TypeError);
            expect(function () { return mydev.set('net', NaN); }).to.throw(TypeError);
            expect(function () { return mydev.set('net', true); }).to.throw(TypeError);
            expect(function () { return mydev.set('net', function () {}); }).to.throw(TypeError);
            expect(function () { return mydev.set('net', 1); }).to.throw(TypeError);
            expect(function () { return mydev.set('net', 'xxx'); }).to.throw(TypeError);
        });

        it('should not throw if propName is a string', function () {
            expect(function () { return mydev.set('net', {}); }).not.to.throw(TypeError);
        });
    });

    describe('#set(propName, arg) - props arg test', function() {
        it('should throw if arg is not an object', function () {
            expect(function () { return mydev.set('props'); }).to.throw(TypeError);
            expect(function () { return mydev.set('props', []); }).to.throw(TypeError);
            expect(function () { return mydev.set('props', null); }).to.throw(TypeError);
            expect(function () { return mydev.set('props', NaN); }).to.throw(TypeError);
            expect(function () { return mydev.set('props', true); }).to.throw(TypeError);
            expect(function () { return mydev.set('props', function () {}); }).to.throw(TypeError);
            expect(function () { return mydev.set('props', 1); }).to.throw(TypeError);
            expect(function () { return mydev.set('props', 'xxx'); }).to.throw(TypeError);
        });

        it('should not throw if propName is a string', function () {
            expect(function () { return mydev.set('props', {}); }).not.to.throw(TypeError);
        });
    });

    describe('#set(propName, arg) - attrs arg test', function() {
        it('should throw if arg is not an object', function () {
            expect(function () { return mydev.set('attrs'); }).to.throw(TypeError);
            expect(function () { return mydev.set('attrs', []); }).to.throw(TypeError);
            expect(function () { return mydev.set('attrs', null); }).to.throw(TypeError);
            expect(function () { return mydev.set('attrs', NaN); }).to.throw(TypeError);
            expect(function () { return mydev.set('attrs', true); }).to.throw(TypeError);
            expect(function () { return mydev.set('attrs', function () {}); }).to.throw(TypeError);
            expect(function () { return mydev.set('attrs', 1); }).to.throw(TypeError);
            expect(function () { return mydev.set('attrs', 'xxx'); }).to.throw(TypeError);
        });

        it('should not throw if propName is an object', function () {
            expect(function () { return mydev.set('attrs', {}); }).not.to.throw(TypeError);
        });
    });

    describe('#resetTraffic(dir)', function() {
        it('should throw if dir is not a string', function () {
            expect(function () { return mydev.resetTraffic([]); }).to.throw(TypeError);
            expect(function () { return mydev.resetTraffic({}); }).to.throw(TypeError);
            expect(function () { return mydev.resetTraffic(null); }).to.throw(TypeError);
            expect(function () { return mydev.resetTraffic(NaN); }).to.throw(TypeError);
            expect(function () { return mydev.resetTraffic(true); }).to.throw(TypeError);
            expect(function () { return mydev.resetTraffic(function () {}); }).to.throw(TypeError);
        });

        it('should not throw if dir is a string', function () {
            expect(function () { return mydev.resetTraffic(); }).not.to.throw(TypeError);
            expect(function () { return mydev.resetTraffic('_id'); }).not.to.throw(TypeError);
            expect(function () { return mydev.resetTraffic('in'); }).not.to.throw(TypeError);
            expect(function () { return mydev.resetTraffic('out'); }).not.to.throw(TypeError);
        });
    });

    describe('#dump(trim)', function() {
        it('should always pass - no restriction', function () {
            expect(function () { return mydev.dump(); }).not.to.throw(Error);
            expect(function () { return mydev.dump(true); }).not.to.throw(Error);
            expect(function () { return mydev.dump(false); }).not.to.throw(Error);
            expect(function () { return mydev.dump({}); }).not.to.throw(Error);
        });
    });

    describe('#_recoverFromRecord(rec)', function() {
        it('should throw if rec is not an object', function () {
            expect(function () { return mydev._recoverFromRecord(); }).to.throw(TypeError);
            expect(function () { return mydev._recoverFromRecord([]); }).to.throw(TypeError);
            expect(function () { return mydev._recoverFromRecord(null); }).to.throw(TypeError);
            expect(function () { return mydev._recoverFromRecord(NaN); }).to.throw(TypeError);
            expect(function () { return mydev._recoverFromRecord(true); }).to.throw(TypeError);
            expect(function () { return mydev._recoverFromRecord(function () {}); }).to.throw(TypeError);
            expect(function () { return mydev._recoverFromRecord(1); }).to.throw(TypeError);
            expect(function () { return mydev._recoverFromRecord('xxx'); }).to.throw(TypeError);
        });

        it('should not throw if propName is a string', function () {
            expect(function () { return mydev._recoverFromRecord({
                id: 100,
                net: {
                    enabled: false,
                    status: 'online'
                },
                attrs: {},
                props: {},
                gads: []
            }); }).not.to.throw(TypeError);
        });
    });

    describe('#maintain(cb)', function() {
        it('should throw if callback is not a function', function () {
            expect(function () { return mydev.maintain([]); }).to.throw(TypeError);
            expect(function () { return mydev.maintain({}); }).to.throw(TypeError);
            expect(function () { return mydev.maintain(null); }).to.throw(TypeError);
            expect(function () { return mydev.maintain(NaN); }).to.throw(TypeError);
            expect(function () { return mydev.maintain(true); }).to.throw(TypeError);
            expect(function () { return mydev.maintain('_id'); }).to.throw(TypeError);
        });

        it('should not throw if callback is a function or not given', function () {
            expect(function () { return mydev.maintain(function () {}); }).not.to.throw(TypeError);
            expect(function () { return mydev.maintain(); }).not.to.throw(TypeError);
        });
    });

    describe('#_poke', function() {
        it('should always pass - no signature', function (done) {
            done();
        });
    });

    describe('#_accumulateBytes(dir, num)', function() {
        it('should throw if dir is not a string', function () {
            expect(function () { return mydev._accumulateBytes([], 1); }).to.throw(TypeError);
            expect(function () { return mydev._accumulateBytes({}, 1); }).to.throw(TypeError);
            expect(function () { return mydev._accumulateBytes(null, 1); }).to.throw(TypeError);
            expect(function () { return mydev._accumulateBytes(NaN, 1); }).to.throw(TypeError);
            expect(function () { return mydev._accumulateBytes(true, 1); }).to.throw(TypeError);
            expect(function () { return mydev._accumulateBytes(function () {}, 1); }).to.throw(TypeError);
            expect(function () { return mydev._accumulateBytes(1); }).to.throw(TypeError);
        });

        it('should not throw if dir is a string', function () {
            expect(function () { return mydev._accumulateBytes('_id', 1); }).not.to.throw(TypeError);
            expect(function () { return mydev._accumulateBytes('in', 2); }).not.to.throw(TypeError);
            expect(function () { return mydev._accumulateBytes('out', 10); }).not.to.throw(TypeError);
        });

        it('should throw if num is not a number', function () {
            expect(function () { return mydev._accumulateBytes('x', []); }).to.throw(TypeError);
            expect(function () { return mydev._accumulateBytes('x', {}); }).to.throw(TypeError);
            expect(function () { return mydev._accumulateBytes('x', null); }).to.throw(TypeError);
            expect(function () { return mydev._accumulateBytes('x', NaN); }).to.throw(TypeError);
            expect(function () { return mydev._accumulateBytes('x', true); }).to.throw(TypeError);
            expect(function () { return mydev._accumulateBytes('x', function () {}); }).to.throw(TypeError);
        });

        it('should not throw if num is a number', function () {
            expect(function () { return mydev._accumulateBytes('x', 1); }).not.to.throw(TypeError);
        });
    });

    describe('#_linkGad(auxId)', function() {
        it('should throw if auxId is not a string or a number', function () {
            expect(function () { return mydev._linkGad([]); }).to.throw(TypeError);
            expect(function () { return mydev._linkGad({}); }).to.throw(TypeError);
            expect(function () { return mydev._linkGad(null); }).to.throw(TypeError);
            expect(function () { return mydev._linkGad(NaN); }).to.throw(TypeError);
            expect(function () { return mydev._linkGad(true); }).to.throw(TypeError);
            expect(function () { return mydev._linkGad(function () {}); }).to.throw(TypeError);
        });

        it('should not throw if auxId is a string or a number', function () {
            expect(function () { return mydev._linkGad(1); }).not.to.throw(TypeError);
            expect(function () { return mydev._linkGad('_idx'); }).not.to.throw(TypeError);
        });
    });

    describe('#_unlinkGad(gadId, auxId)', function() {
        it('should throw if gadId is not a number or a string', function () {
            expect(function () { return mydev._unlinkGad([]); }).to.throw(TypeError);
            expect(function () { return mydev._unlinkGad({}); }).to.throw(TypeError);
            expect(function () { return mydev._unlinkGad(null); }).to.throw(TypeError);
            expect(function () { return mydev._unlinkGad(NaN); }).to.throw(TypeError);
            expect(function () { return mydev._unlinkGad(true); }).to.throw(TypeError);
            expect(function () { return mydev._unlinkGad(function () {}); }).to.throw(TypeError);
        });

        it('should not throw if gadId is a number or a string', function () {
            expect(function () { return mydev._unlinkGad('x', 1); }).not.to.throw(TypeError);
            expect(function () { return mydev._unlinkGad(1, 'xxx'); }).not.to.throw(TypeError);
        });

        it('should throw if auxId is not a number or a string', function () {
            expect(function () { return mydev._unlinkGad(1, []); }).to.throw(TypeError);
            expect(function () { return mydev._unlinkGad(1, {}); }).to.throw(TypeError);
            expect(function () { return mydev._unlinkGad(1, null); }).to.throw(TypeError);
            expect(function () { return mydev._unlinkGad(1, NaN); }).to.throw(TypeError);
            expect(function () { return mydev._unlinkGad(1, true); }).to.throw(TypeError);
            expect(function () { return mydev._unlinkGad(1, function () {}); }).to.throw(TypeError);
        });

        it('should not throw if auxId is a number or a string', function () {
            expect(function () { return mydev._unlinkGad(1, 'xxx'); }).not.to.throw(TypeError);
            expect(function () { return mydev._unlinkGad(1, 1); }).not.to.throw(TypeError);
        });
    });

    describe('#_connectGadIdToAuxId(gadId, auxId)', function() {
        it('should throw if gadId is not a number or a string', function () {
            expect(function () { return mydev._connectGadIdToAuxId([]); }).to.throw(TypeError);
            expect(function () { return mydev._connectGadIdToAuxId({}); }).to.throw(TypeError);
            expect(function () { return mydev._connectGadIdToAuxId(null); }).to.throw(TypeError);
            expect(function () { return mydev._connectGadIdToAuxId(NaN); }).to.throw(TypeError);
            expect(function () { return mydev._connectGadIdToAuxId(true); }).to.throw(TypeError);
            expect(function () { return mydev._connectGadIdToAuxId(function () {}); }).to.throw(TypeError);
        });

        it('should not throw if gadId is a number', function () {
            expect(function () { return mydev._connectGadIdToAuxId('x', 1); }).not.to.throw(TypeError);
            expect(function () { return mydev._connectGadIdToAuxId(1, 'xxx'); }).not.to.throw(TypeError);
        });

        it('should throw if auxId is not a number or a string', function () {
            expect(function () { return mydev._connectGadIdToAuxId(1, []); }).to.throw(TypeError);
            expect(function () { return mydev._connectGadIdToAuxId(1, {}); }).to.throw(TypeError);
            expect(function () { return mydev._connectGadIdToAuxId(1, null); }).to.throw(TypeError);
            expect(function () { return mydev._connectGadIdToAuxId(1, NaN); }).to.throw(TypeError);
            expect(function () { return mydev._connectGadIdToAuxId(1, true); }).to.throw(TypeError);
            expect(function () { return mydev._connectGadIdToAuxId(1, function () {}); }).to.throw(TypeError);
        });

        it('should not throw if auxId is a number or a string', function () {
            expect(function () { return mydev._connectGadIdToAuxId(1, 'xxx'); }).not.to.throw(TypeError);
            expect(function () { return mydev._connectGadIdToAuxId(1, 1); }).not.to.throw(TypeError);
        });
    });

    describe('#_clear', function() {
        it('should always pass - no signature', function (done) {
            done();
        });
    });

    describe('#read(attrName, callback)', function() {
        var cb = function () {};
        it('should throw if attrName is not a string', function () {
            expect(function () { return mydev.read(cb); }).to.throw(TypeError);
            expect(function () { return mydev.read(1, cb); }).to.throw(TypeError);
            expect(function () { return mydev.read([], cb); }).to.throw(TypeError);
            expect(function () { return mydev.read(null, cb); }).to.throw(TypeError);
            expect(function () { return mydev.read(NaN, cb); }).to.throw(TypeError);
            expect(function () { return mydev.read(true, cb); }).to.throw(TypeError);
            expect(function () { return mydev.read(function () {}, cb); }).to.throw(TypeError);
        });

        it('should not throw if attrName is a string', function () {
            expect(function () { return mydev.read('xxx', cb); }).not.to.throw(TypeError);
        });

        it('should throw if cb is not a function', function () {
            expect(function () { return mydev.read('x'); }).to.throw(TypeError);
            expect(function () { return mydev.read('x', 1); }).to.throw(TypeError);
            expect(function () { return mydev.read('x', []); }).to.throw(TypeError);
            expect(function () { return mydev.read('x', null); }).to.throw(TypeError);
            expect(function () { return mydev.read('x', NaN); }).to.throw(TypeError);
            expect(function () { return mydev.read('x', true); }).to.throw(TypeError);
        });

        it('should not throw if cb is a function', function () {
            expect(function () { return mydev.read('xxx', cb); }).not.to.throw(TypeError);
        });
    });

    describe('#write', function() {
        var cb = function () {};
        it('should throw if attrName is not a string', function () {
            expect(function () { return mydev.write(cb); }).to.throw(TypeError);
            expect(function () { return mydev.write(1, 'x', cb); }).to.throw(TypeError);
            expect(function () { return mydev.write([], 'x', cb); }).to.throw(TypeError);
            expect(function () { return mydev.write(null, 'x', cb); }).to.throw(TypeError);
            expect(function () { return mydev.write(NaN, 'x', cb); }).to.throw(TypeError);
            expect(function () { return mydev.write(true, 'x', cb); }).to.throw(TypeError);
            expect(function () { return mydev.write(function () {}, 'x', cb); }).to.throw(TypeError);
        });

        it('should not throw if attrName is a string', function () {
            expect(function () { return mydev.write('xxx', 'x', cb); }).not.to.throw(TypeError);
        });

        it('should throw if cb is not a function', function () {
            expect(function () { return mydev.write('x', 'x'); }).to.throw(TypeError);
            expect(function () { return mydev.write('x', 'x', 1); }).to.throw(TypeError);
            expect(function () { return mydev.write('x', 'x', []); }).to.throw(TypeError);
            expect(function () { return mydev.write('x', 'x', null); }).to.throw(TypeError);
            expect(function () { return mydev.write('x', 'x', NaN); }).to.throw(TypeError);
            expect(function () { return mydev.write('x', 'x', true); }).to.throw(TypeError);
        });

        it('should not throw if cb is a function', function () {
            expect(function () { return mydev.write('xxx', 'x', cb); }).not.to.throw(TypeError);
        });

        it('should throw if val is undefined', function () {
            expect(function () { return mydev.write('xxx', undefined, cb); }).to.throw(TypeError);
        });
    });

    describe('#identify', function() {
        var cb = function () {};
        it('should throw if cb is not a function', function () {
            expect(function () { return mydev.identify(1); }).to.throw(TypeError);
            expect(function () { return mydev.identify([]); }).to.throw(TypeError);
            expect(function () { return mydev.identify(null); }).to.throw(TypeError);
            expect(function () { return mydev.identify(NaN); }).to.throw(TypeError);
            expect(function () { return mydev.identify(true); }).to.throw(TypeError);
            expect(function () { return mydev.identify('x'); }).to.throw(TypeError);
        });

        it('should not throw if cb is a function', function () {
            expect(function () { return mydev.identify(cb); }).not.to.throw(TypeError);
        });
    });

    describe('#ping', function() {
        var cb = function () {};
        it('should throw if cb is not a function', function () {
            expect(function () { return mydev.ping(1); }).to.throw(TypeError);
            expect(function () { return mydev.ping([]); }).to.throw(TypeError);
            expect(function () { return mydev.ping(null); }).to.throw(TypeError);
            expect(function () { return mydev.ping(NaN); }).to.throw(TypeError);
            expect(function () { return mydev.ping(true); }).to.throw(TypeError);
            expect(function () { return mydev.ping('x'); }).to.throw(TypeError);
        });

        it('should not throw if cb is a function', function () {
            expect(function () { return mydev.ping(cb); }).not.to.throw(TypeError);
        });
    });
});

describe('Remote operations should get err returned if netcore is disabled', function() {
    var mydev = dev;
    mydev.enable();
    ncMock.disable();
    describe('#read', function() {
        it('should get err returned if netcore is disabled', function (done) {
            mydev.read('xxx', function (err) {
                if (err && err.message === 'Netcore disabled.')
                    done();
            });
        });
    });

    describe('#write', function() {
        it('should get err returned if netcore is disabled', function (done) {
           mydev.write('xxx', 1, function (err) {
                if (err && err.message === 'Netcore disabled.')
                    done();
            });
        });
    });

    describe('#identify', function() {
        it('should get err returned if netcore is disabled', function (done) {
            mydev.identify(function (err) {
                if (err && err.message === 'Netcore disabled.')
                    done();
            });
        });
    });

    describe('#ping', function() {
        it('should get err returned if netcore is disabled', function (done) {
            mydev.ping(function (err) {
                if (err && err.message === 'Netcore disabled.')
                    done();
            });
        });
    });
});

describe('Remote operations should throw if device is disabled', function() {
    var mydev = dev;
    describe('#read', function() {
        it('should get err returned if device is disabled', function (done) {
            mydev.disable();
            ncMock.enable();
            mydev.read('xxx', function (err) {
                if (err && err.message === 'Device disabled.')
                    done();
            });
        });
    });

    describe('#write', function() {
        it('should get err returned if device is disabled', function (done) {
           mydev.write('xxx', 1, function (err) {
                if (err && err.message === 'Device disabled.')
                    done();
            });
        });
    });

    describe('#identify', function() {
        it('should get err returned if device is disabled', function (done) {
            mydev.identify(function (err) {
                if (err && err.message === 'Device disabled.')
                    done();
            });
        });
    });

    describe('#ping', function() {
        it('should get err returned if device is disabled', function (done) {
            mydev.ping(function (err) {
                if (err && err.message === 'Device disabled.')
                    done();
            });
        });
    });
});

// describe.skip('APIs functional check', function() {
//     // Test in integration part
// });