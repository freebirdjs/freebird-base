// Constructor


var EventEmitter = require('events'),
    util = require('util'),
    _ = require('busyman'),
    expect = require('chai').expect,
    sinon = require('sinon'),
    Device = require('../lib/device.js'),
    Gadget = require('../lib/gadget.js'),
    Netcore = require('../lib/netcore.js');

var fb = Object.create(new EventEmitter());
fb.getAllDevs = function () { return []; };

var ncname = 'mync';
var controller = {};
var protocol = {
    phy: 'myphy',
    nwk: 'mynwk'
};
var opt = {};

var nc = new Netcore(ncname, controller, protocol, opt);
nc._freebird = fb;

var fakeNetDrvs = {
    start: function () {},
    stop: function () {},
    reset: function () {},
    permitJoin: function () {},
    remove: function () {},
    ban: function () {},
    unban: function () {},
    ping: function () {}
};

var fakeDevDrvs = {
    read: function () {},
    write: function () {},
    identify: function () {}
};

var fakeGadDrvs = {
    read: function () {},
    write: function () {},
    exec: function () {},
    setReportCfg: function () {},
    getReportCfg: function () {}
};

describe('Netcore Constructor', function () {
    describe('#No Arg', function() {
        it('should throw if no argument input', function () {
            expect(function () { return new Netcore(); }).to.throw(TypeError);
        });
    });

    describe('#Only name', function() {
        it('should throw if only name input', function () {
            expect(function () { return new Netcore('my'); }).to.throw(Error);
        });
    });

    describe('#name, controller', function() {
        it('should throw if only name and controller', function () {
            expect(function () { return new Netcore('my', controller); }).to.throw(Error);
        });
    });

    describe('#name, controller, protocol', function() {
        it('should not throw if name, controller, and protocol are all given', function () {
            expect(function () { return new Netcore('my', controller, protocol); }).not.to.throw(Error);
        });
    });

    describe('#name not string', function() {
        it('should throw if name is not a string', function () {
            expect(function () { return new Netcore(5, controller, protocol); }).to.throw(TypeError);
        });
    });

    describe('#protocol not object', function() {
        it('should throw if protocol is not an object', function () {
            expect(function () { return new Netcore('my', controller, []); }).to.throw(TypeError);
        });
    });
});

describe('Constructor Base Property Check', function () {
    it('has _freebird equals to fb', function () {
        expect(nc._freebird).to.be.equal(fb);
    });

    it('has a null _joinTimer', function () {
        expect(nc._joinTimer).to.be.equal(null);
    });

    it('has a 0 _joinTicks', function () {
        expect(nc._joinTicks).to.be.equal(0);
    });

    it('has _controller equals to controller', function () {
        expect(nc._controller).to.be.equal(controller);
    });

    it('has correct _net memebers', function () {
        var net = nc._net;
        expect(net.name).to.be.equal(ncname);
        expect(net.enabled).to.be.equal(false);
        expect(net.protocol).to.be.equal(protocol);
        expect(net.startTime).to.be.equal(0);
        expect(net.defaultJoinTime).to.be.equal(180);
        expect(net.defaultJoinTime).to.be.equal(180);
    });

    it('has a null cookRawDev method', function () {
        expect(nc.cookRawDev).to.be.equal(null);
    });

    it('has a null cookRawGad method', function () {
        expect(nc.cookRawGad).to.be.equal(null);
    });

    it('has all null net drivers', function () {
        var drvs = nc._drivers.net;
        expect(drvs.start).to.be.equal(null);
        expect(drvs.stop).to.be.equal(null);
        expect(drvs.reset).to.be.equal(null);
        expect(drvs.permitJoin).to.be.equal(null);
        expect(drvs.remove).to.be.equal(null);
        expect(drvs.ban).to.be.equal(null);
        expect(drvs.unban).to.be.equal(null);
        expect(drvs.ping).to.be.equal(null);
    });

    it('has all null dev drivers', function () {
        var drvs = nc._drivers.dev;
        expect(drvs.read).to.be.equal(null);
        expect(drvs.write).to.be.equal(null);
        expect(drvs.identify).to.be.equal(null);
    });

    it('has all null gad drivers', function () {
        var drvs = nc._drivers.gad;
        expect(drvs.read).to.be.equal(null);
        expect(drvs.write).to.be.equal(null);
        expect(drvs.exec).to.be.equal(null);
        expect(drvs.setReportCfg).to.be.equal(null);
        expect(drvs.getReportCfg).to.be.equal(null);
    });
});

describe('Check Signature', function () {
    describe('#getBlacklist()', function() {
        it('should always pass - no signature', function (done) {
            done();
        });
    });

    describe('#clearBlacklist()', function() {
        it('should always pass - no signature', function (done) {
            done();
        });
    });

    describe('#isBlacklisted(permAddr)', function() {
        it('should throw if permAddr is not a string', function () {
            expect(function () { return nc.isBlacklisted(); }).to.throw(TypeError);
            expect(function () { return nc.isBlacklisted(1); }).to.throw(TypeError);
            expect(function () { return nc.isBlacklisted([]); }).to.throw(TypeError);
            expect(function () { return nc.isBlacklisted(null); }).to.throw(TypeError);
            expect(function () { return nc.isBlacklisted(NaN); }).to.throw(TypeError);
            expect(function () { return nc.isBlacklisted(true); }).to.throw(TypeError);
            expect(function () { return nc.isBlacklisted(function () {}); }).to.throw(TypeError);
        });

        it('should not throw if permAddr is a string', function () {
            expect(function () { return nc.isBlacklisted('xxx'); }).not.to.throw(TypeError);
        });
    });

    describe('#_block(permAddr)', function() {
        it('should throw if permAddr is not a string', function () {
            expect(function () { return nc._block(); }).to.throw(TypeError);
            expect(function () { return nc._block(1); }).to.throw(TypeError);
            expect(function () { return nc._block([]); }).to.throw(TypeError);
            expect(function () { return nc._block(null); }).to.throw(TypeError);
            expect(function () { return nc._block(NaN); }).to.throw(TypeError);
            expect(function () { return nc._block(true); }).to.throw(TypeError);
            expect(function () { return nc._block(function () {}); }).to.throw(TypeError);
        });

        it('should not throw if permAddr is a string', function () {
            expect(function () { return nc._block('xxx'); }).not.to.throw(TypeError);
        });
    });

    describe('#_unblock(permAddr)', function() {
        it('should throw if permAddr is not a string', function () {
            expect(function () { return nc._unblock(); }).to.throw(TypeError);
            expect(function () { return nc._unblock(1); }).to.throw(TypeError);
            expect(function () { return nc._unblock([]); }).to.throw(TypeError);
            expect(function () { return nc._unblock(null); }).to.throw(TypeError);
            expect(function () { return nc._unblock(NaN); }).to.throw(TypeError);
            expect(function () { return nc._unblock(true); }).to.throw(TypeError);
            expect(function () { return nc._unblock(function () {}); }).to.throw(TypeError);
        });

        it('should not throw if permAddr is a string', function () {
            expect(function () { return nc._unblock('xxx'); }).not.to.throw(TypeError);
        });
    });

    describe('#No signature methods:', function() {
        it('_onReady(), isRegistered(), isEnabled() should always pass - no signature', function (done) {
            done();
        });

        it('isJoinable(), enable(), disable() should always pass - no signature', function (done) {
            done();
        });

        it('getName(), getTraffic(), dump() should always pass - no signature', function (done) {
            done();
        });

        it('commitReady(), _dumpNcInfo() should always pass - no signature', function (done) {
            done();
        });
    });

    describe('#resetTraffic(dir)', function() {
        it('should throw if dir is not a string if given', function () {
            expect(function () { return nc.resetTraffic(1); }).to.throw(TypeError);
            expect(function () { return nc.resetTraffic([]); }).to.throw(TypeError);
            expect(function () { return nc.resetTraffic(null); }).to.throw(TypeError);
            expect(function () { return nc.resetTraffic(NaN); }).to.throw(TypeError);
            expect(function () { return nc.resetTraffic(true); }).to.throw(TypeError);
            expect(function () { return nc.resetTraffic(function () {}); }).to.throw(TypeError);
        });

        it('should not throw if permAddr is a string or not given', function () {
            expect(function () { return nc.resetTraffic(); }).not.to.throw(TypeError);
            expect(function () { return nc.resetTraffic('xxx'); }).not.to.throw(TypeError);
        });
    });

    describe('#registerNetDrivers(drvs)', function() {
        it('should throw if drvs is not an object filled with functions', function () {
            expect(function () { return nc.registerNetDrivers(); }).to.throw(TypeError);
            expect(function () { return nc.registerNetDrivers([]); }).to.throw(TypeError);
            expect(function () { return nc.registerNetDrivers(null); }).to.throw(TypeError);
            expect(function () { return nc.registerNetDrivers(NaN); }).to.throw(TypeError);
            expect(function () { return nc.registerNetDrivers(true); }).to.throw(TypeError);
            expect(function () { return nc.registerNetDrivers(function () {}); }).to.throw(TypeError);
            expect(function () { return nc.registerNetDrivers(1); }).to.throw(TypeError);
            expect(function () { return nc.registerNetDrivers('xxx'); }).to.throw(TypeError);
            expect(function () { return nc.registerNetDrivers({ start: 3 }); }).to.throw(TypeError);

        });

        it('should not throw if propName is a string', function () {
            expect(function () { return nc.registerNetDrivers({
                start: function () {},
                stop: function () {},
                reset: function () {},
                permitJoin: function () {},
                remove: function () {},
                ban: function () {},
                unban: function () {},
                ping: function () {}
            }); }).not.to.throw(TypeError);
        });
    });

    describe('#registerDevDrivers(drvs)', function() {
        it('should throw if drvs is not an object filled with functions', function () {
            expect(function () { return nc.registerDevDrivers(); }).to.throw(TypeError);
            expect(function () { return nc.registerDevDrivers([]); }).to.throw(TypeError);
            expect(function () { return nc.registerDevDrivers(null); }).to.throw(TypeError);
            expect(function () { return nc.registerDevDrivers(NaN); }).to.throw(TypeError);
            expect(function () { return nc.registerDevDrivers(true); }).to.throw(TypeError);
            expect(function () { return nc.registerDevDrivers(function () {}); }).to.throw(TypeError);
            expect(function () { return nc.registerDevDrivers(1); }).to.throw(TypeError);
            expect(function () { return nc.registerDevDrivers('xxx'); }).to.throw(TypeError);
            expect(function () { return nc.registerDevDrivers({ read: 3 }); }).to.throw(TypeError);

        });

        it('should not throw if propName is a string', function () {
            expect(function () { return nc.registerDevDrivers({
                read: function () {},
                write: function () {},
                identify: function () {}
            }); }).not.to.throw(TypeError);
        });
    });

    describe('#registerGadDrivers(drvs)', function() {
        it('should throw if drvs is not an object filled with functions', function () {
            expect(function () { return nc.registerGadDrivers(); }).to.throw(TypeError);
            expect(function () { return nc.registerGadDrivers([]); }).to.throw(TypeError);
            expect(function () { return nc.registerGadDrivers(null); }).to.throw(TypeError);
            expect(function () { return nc.registerGadDrivers(NaN); }).to.throw(TypeError);
            expect(function () { return nc.registerGadDrivers(true); }).to.throw(TypeError);
            expect(function () { return nc.registerGadDrivers(function () {}); }).to.throw(TypeError);
            expect(function () { return nc.registerGadDrivers(1); }).to.throw(TypeError);
            expect(function () { return nc.registerGadDrivers('xxx'); }).to.throw(TypeError);
            expect(function () { return nc.registerGadDrivers({ read: 3 }); }).to.throw(TypeError);

        });

        it('should not throw if propName is a string', function () {
            expect(function () { return nc.registerGadDrivers({
                read: function () {},
                write: function () {},
                exec: function () {},
                setReportCfg: function () {},
                getReportCfg: function () {}
            }); }).not.to.throw(TypeError);
        });
    });

    describe('#start(cb)', function() {
        it('should throw if callback is not a function', function () {
            nc.cookRawGad = function () {};
            nc.cookRawDev = function () {};
            nc._drivers.net = fakeNetDrvs;
            nc._drivers.dev = fakeDevDrvs;
            nc._drivers.gad = fakeGadDrvs;

            expect(function () { return nc.start([]); }).to.throw(TypeError);
            expect(function () { return nc.start({}); }).to.throw(TypeError);
            expect(function () { return nc.start(null); }).to.throw(TypeError);
            expect(function () { return nc.start(NaN); }).to.throw(TypeError);
            expect(function () { return nc.start(true); }).to.throw(TypeError);
            expect(function () { return nc.start(); }).to.throw(TypeError);
            expect(function () { return nc.start('_id'); }).to.throw(TypeError);
            nc.cookRawGad = null;
            nc.cookRawDev = null;
            nc._drivers.net = null;
            nc._drivers.dev = null;
            nc._drivers.gad = null;
        });

        it('should not throw if callback is a function', function () {
            expect(function () { return nc.start(function () {}); }).not.to.throw(TypeError);
        });
    });

    describe('#stop(cb)', function() {
        it('should throw if callback is not a function', function () {
            expect(function () { return nc.stop([]); }).to.throw(TypeError);
            expect(function () { return nc.stop({}); }).to.throw(TypeError);
            expect(function () { return nc.stop(null); }).to.throw(TypeError);
            expect(function () { return nc.stop(NaN); }).to.throw(TypeError);
            expect(function () { return nc.stop(true); }).to.throw(TypeError);
            expect(function () { return nc.stop(); }).to.throw(TypeError);
            expect(function () { return nc.stop('_id'); }).to.throw(TypeError);
        });

        it('should not throw if callback is a function', function () {
            expect(function () { return nc.stop(function () {}); }).not.to.throw(TypeError);
        });
    });

    describe.skip('#reset()', function() {
        it('should always pass - no signature', function () {
        });
    });

    describe('#permitJoin(duration, cb)', function() {
        it('should throw if duration is not a number if given', function () {
            expect(function () { return nc.permitJoin([]); }).to.throw(TypeError);
            expect(function () { return nc.permitJoin({}); }).to.throw(TypeError);
            expect(function () { return nc.permitJoin(null); }).to.throw(TypeError);
            expect(function () { return nc.permitJoin(NaN); }).to.throw(TypeError);
            expect(function () { return nc.permitJoin(true); }).to.throw(TypeError);
        });

        it('should not throw if duration is a number or not given', function () {
            expect(function () { return nc.permitJoin(1); }).not.to.throw(TypeError);
            expect(function () { return nc.permitJoin(function () {}); }).not.to.throw(TypeError);
            expect(function () { return nc.permitJoin(100, function () {}); }).not.to.throw(TypeError);
        });

        it('should throw if cb is not a function when given', function () {
            expect(function () { return nc.permitJoin(1, []); }).to.throw(TypeError);
            expect(function () { return nc.permitJoin(1, {}); }).to.throw(TypeError);
            expect(function () { return nc.permitJoin(1, null); }).to.throw(TypeError);
            expect(function () { return nc.permitJoin(1, NaN); }).to.throw(TypeError);
            expect(function () { return nc.permitJoin(1, true); }).to.throw(TypeError);
        });
    });

    describe('#remove(permAddr, callback)', function() {
        var cb = function () {};
        it('should throw if permAddr is not a string', function () {
            expect(function () { return nc.remove([], cb); }).to.throw(TypeError);
            expect(function () { return nc.remove({}, cb); }).to.throw(TypeError);
            expect(function () { return nc.remove(null, cb); }).to.throw(TypeError);
            expect(function () { return nc.remove(NaN), cb; }).to.throw(TypeError);
            expect(function () { return nc.remove(true, cb); }).to.throw(TypeError);
            expect(function () { return nc.remove(10, cb); }).to.throw(TypeError);
        });

        it('should not throw if permAddr is a tring', function () {
            expect(function () { return nc.remove('x', cb); }).not.to.throw(TypeError);
        });

        it('should throw if cb is not a function', function () {
            expect(function () { return nc.remove('x', []); }).to.throw(TypeError);
            expect(function () { return nc.remove('x', {}); }).to.throw(TypeError);
            expect(function () { return nc.remove('x', null); }).to.throw(TypeError);
            expect(function () { return nc.remove('x', NaN); }).to.throw(TypeError);
            expect(function () { return nc.remove('x', true); }).to.throw(TypeError);
        });
    });

    describe('#ban(permAddr, callback)', function() {
        var cb = function () {};
        it('should throw if permAddr is not a string', function () {
            expect(function () { return nc.ban([], cb); }).to.throw(TypeError);
            expect(function () { return nc.ban({}, cb); }).to.throw(TypeError);
            expect(function () { return nc.ban(null, cb); }).to.throw(TypeError);
            expect(function () { return nc.ban(NaN), cb; }).to.throw(TypeError);
            expect(function () { return nc.ban(true, cb); }).to.throw(TypeError);
            expect(function () { return nc.ban(10, cb); }).to.throw(TypeError);
        });

        it('should not throw if permAddr is a tring', function () {
            expect(function () { return nc.ban('x', cb); }).not.to.throw(TypeError);
        });

        it('should throw if cb is not a function', function () {
            expect(function () { return nc.ban('x', []); }).to.throw(TypeError);
            expect(function () { return nc.ban('x', {}); }).to.throw(TypeError);
            expect(function () { return nc.ban('x', null); }).to.throw(TypeError);
            expect(function () { return nc.ban('x', NaN); }).to.throw(TypeError);
            expect(function () { return nc.ban('x', true); }).to.throw(TypeError);
        });
    });

    describe('#unban(permAddr, callback)', function() {
        var cb = function () {};
        it('should throw if permAddr is not a string', function () {
            expect(function () { return nc.unban([], cb); }).to.throw(TypeError);
            expect(function () { return nc.unban({}, cb); }).to.throw(TypeError);
            expect(function () { return nc.unban(null, cb); }).to.throw(TypeError);
            expect(function () { return nc.unban(NaN), cb; }).to.throw(TypeError);
            expect(function () { return nc.unban(true, cb); }).to.throw(TypeError);
            expect(function () { return nc.unban(10, cb); }).to.throw(TypeError);
        });

        it('should not throw if permAddr is a tring', function () {
            expect(function () { return nc.unban('x', cb); }).not.to.throw(TypeError);
        });

        it('should throw if cb is not a function', function () {
            expect(function () { return nc.unban('x', []); }).to.throw(TypeError);
            expect(function () { return nc.unban('x', {}); }).to.throw(TypeError);
            expect(function () { return nc.unban('x', null); }).to.throw(TypeError);
            expect(function () { return nc.unban('x', NaN); }).to.throw(TypeError);
            expect(function () { return nc.unban('x', true); }).to.throw(TypeError);
        });
    });

    describe('#ping(permAddr, callback)', function() {
        var cb = function () {};
        it('should throw if permAddr is not a string', function () {
            expect(function () { return nc.ping([], cb); }).to.throw(TypeError);
            expect(function () { return nc.ping({}, cb); }).to.throw(TypeError);
            expect(function () { return nc.ping(null, cb); }).to.throw(TypeError);
            expect(function () { return nc.ping(NaN), cb; }).to.throw(TypeError);
            expect(function () { return nc.ping(true, cb); }).to.throw(TypeError);
            expect(function () { return nc.ping(10, cb); }).to.throw(TypeError);
        });

        it('should not throw if permAddr is a tring', function () {
            expect(function () { return nc.ping('x', cb); }).not.to.throw(TypeError);
        });

        it('should throw if cb is not a function', function () {
            expect(function () { return nc.ping('x', []); }).to.throw(TypeError);
            expect(function () { return nc.ping('x', {}); }).to.throw(TypeError);
            expect(function () { return nc.ping('x', null); }).to.throw(TypeError);
            expect(function () { return nc.ping('x', NaN); }).to.throw(TypeError);
            expect(function () { return nc.ping('x', true); }).to.throw(TypeError);
        });
    });

    describe('#devRead(permAddr, attrName, callback)', function() {
        var cb = function () {};

        it('should throw if permAddr is not a string', function () {
            expect(function () { return nc.devRead(cb); }).to.throw(TypeError);
            expect(function () { return nc.devRead(1, 'attr', cb); }).to.throw(TypeError);
            expect(function () { return nc.devRead([], 'attr', cb); }).to.throw(TypeError);
            expect(function () { return nc.devRead(null, 'attr', cb); }).to.throw(TypeError);
            expect(function () { return nc.devRead(NaN, 'attr', cb); }).to.throw(TypeError);
            expect(function () { return nc.devRead(true, 'attr', cb); }).to.throw(TypeError);
            expect(function () { return nc.devRead(function () {}, 'attr', cb); }).to.throw(TypeError);
        });

        it('should throw if attrName is not a string', function () {
            expect(function () { return nc.devRead('addr', cb); }).to.throw(TypeError);
            expect(function () { return nc.devRead('addr', 1, cb); }).to.throw(TypeError);
            expect(function () { return nc.devRead('addr', [], cb); }).to.throw(TypeError);
            expect(function () { return nc.devRead('addr', null, cb); }).to.throw(TypeError);
            expect(function () { return nc.devRead('addr', NaN, cb); }).to.throw(TypeError);
            expect(function () { return nc.devRead('addr', true, cb); }).to.throw(TypeError);
            expect(function () { return nc.devRead('addr', function () {}, cb); }).to.throw(TypeError);
        });

        it('should not throw if attrName is a string', function () {
            expect(function () { return nc.devRead('addr', 'xxx', cb); }).not.to.throw(TypeError);
        });

        it('should throw if cb is not a function', function () {
            expect(function () { return nc.devRead('addr', 'x'); }).to.throw(TypeError);
            expect(function () { return nc.devRead('addr', 'x', 1); }).to.throw(TypeError);
            expect(function () { return nc.devRead('addr', 'x', []); }).to.throw(TypeError);
            expect(function () { return nc.devRead('addr', 'x', null); }).to.throw(TypeError);
            expect(function () { return nc.devRead('addr', 'x', NaN); }).to.throw(TypeError);
            expect(function () { return nc.devRead('addr', 'x', true); }).to.throw(TypeError);
        });

        it('should not throw if cb is a function', function () {
            expect(function () { return nc.devRead('addr', 'xxx', cb); }).not.to.throw(TypeError);
        });
    });

    describe('#devWrite(permAddr, attrName, val, callback)', function() {
        var cb = function () {};
        it('should throw if permAddr is not a string', function () {
            expect(function () { return nc.devWrite(1, 'x', 'x', cb); }).to.throw(TypeError);
            expect(function () { return nc.devWrite([], 'x', 'x', cb); }).to.throw(TypeError);
            expect(function () { return nc.devWrite(null, 'x', 'x', cb); }).to.throw(TypeError);
            expect(function () { return nc.devWrite(NaN, 'x', 'x', cb); }).to.throw(TypeError);
            expect(function () { return nc.devWrite(true, 'x', 'x', cb); }).to.throw(TypeError);
            expect(function () { return nc.devWrite(function () {}, 'x', 'x', cb); }).to.throw(TypeError);
        });

        it('should throw if attrName is not a string', function () {
            expect(function () { return nc.devWrite('addr', cb); }).to.throw(TypeError);
            expect(function () { return nc.devWrite('addr', 1, 'x', cb); }).to.throw(TypeError);
            expect(function () { return nc.devWrite('addr', [], 'x', cb); }).to.throw(TypeError);
            expect(function () { return nc.devWrite('addr', null, 'x', cb); }).to.throw(TypeError);
            expect(function () { return nc.devWrite('addr', NaN, 'x', cb); }).to.throw(TypeError);
            expect(function () { return nc.devWrite('addr', true, 'x', cb); }).to.throw(TypeError);
            expect(function () { return nc.devWrite('addr', function () {}, 'x', cb); }).to.throw(TypeError);
        });

        it('should not throw if attrName is a string', function () {
            expect(function () { return nc.devWrite('addr', 'xxx', 'x', cb); }).not.to.throw(TypeError);
        });

        it('should throw if cb is not a function', function () {
            expect(function () { return nc.devWrite('addr', 'x', 'x'); }).to.throw(TypeError);
            expect(function () { return nc.devWrite('addr', 'x', 'x', 1); }).to.throw(TypeError);
            expect(function () { return nc.devWrite('addr', 'x', 'x', []); }).to.throw(TypeError);
            expect(function () { return nc.devWrite('addr', 'x', 'x', null); }).to.throw(TypeError);
            expect(function () { return nc.devWrite('addr', 'x', 'x', NaN); }).to.throw(TypeError);
            expect(function () { return nc.devWrite('addr', 'x', 'x', true); }).to.throw(TypeError);
        });

        it('should not throw if cb is a function', function () {
            expect(function () { return nc.devWrite('addr', 'xxx', 'x', cb); }).not.to.throw(TypeError);
        });

        it('should throw if val is undefined', function () {
            expect(function () { return nc.devWrite('addr', 'xxx', undefined, cb); }).to.throw(TypeError);
            expect(function () { return nc.devWrite('addr', 'xxx', cb); }).to.throw(TypeError);

        });
    });

    describe('#identify(permAddr, callback)', function() {
        var cb = function () {};
        it('should throw if permAddr is not a string', function () {
            expect(function () { return nc.identify([], cb); }).to.throw(TypeError);
            expect(function () { return nc.identify({}, cb); }).to.throw(TypeError);
            expect(function () { return nc.identify(null, cb); }).to.throw(TypeError);
            expect(function () { return nc.identify(NaN), cb; }).to.throw(TypeError);
            expect(function () { return nc.identify(true, cb); }).to.throw(TypeError);
            expect(function () { return nc.identify(10, cb); }).to.throw(TypeError);
        });

        it('should not throw if permAddr is a tring', function () {
            expect(function () { return nc.identify('x', cb); }).not.to.throw(TypeError);
        });

        it('should throw if cb is not a function', function () {
            expect(function () { return nc.identify('x', []); }).to.throw(TypeError);
            expect(function () { return nc.identify('x', {}); }).to.throw(TypeError);
            expect(function () { return nc.identify('x', null); }).to.throw(TypeError);
            expect(function () { return nc.identify('x', NaN); }).to.throw(TypeError);
            expect(function () { return nc.identify('x', true); }).to.throw(TypeError);
        });
    });

    // describe('#gadRead()', function() {
    //     it('should always pass - no signature', function () {
    //     });
    // });

    // describe('#gadWrite()', function() {
    //     it('should always pass - no signature', function () {
    //     });
    // });

    // describe('#gadExec()', function() {
    //     it('should always pass - no signature', function () {
    //     });
    // });

    // describe('#setReportCfg()', function() {
    //     it('should always pass - no signature', function () {
    //     });
    // });

    // describe('#getReportCfg()', function() {
    //     it('should always pass - no signature', function () {
    //     });
    // });

    // describe('#commitDevNetChanging()', function() {
    //     it('should always pass - no signature', function () {
    //     });
    // });

    // describe('#commitDevIncoming()', function() {
    //     it('should always pass - no signature', function () {
    //     });
    // });

    // describe('#commitDevLeaving()', function() {
    //     it('should always pass - no signature', function () {
    //     });
    // });

    // describe('#commitGadIncoming()', function() {
    //     it('should always pass - no signature', function () {
    //     });
    // });

    // describe('#commitDevReporting()', function() {
    //     it('should always pass - no signature', function () {
    //     });
    // });

    // describe('#commitGadReporting()', function() {
    //     it('should always pass - no signature', function () {
    //     });
    // });

    // describe('#dangerouslyCommitGadReporting()', function() {
    //     it('should always pass - no signature', function () {
    //     });
    // });

    // describe('#_findDriver()', function() {
    //     it('should always pass - no signature', function () {
    //     });
    // });

    // describe('#_fire()', function() {
    //     it('should always pass - no signature', function () {
    //     });
    // });

    // describe('#_callDriver()', function() {
    //     it('should always pass - no signature', function () {
    //     });
    // });
});
