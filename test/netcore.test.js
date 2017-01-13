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
fb.findByNet = function () {};
fb.getAllDevs = function () { return []; };
fb.filter = function () { return []; };

fb.on('_nc:error', function (err) {
    // console.log(err);
});

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
    start: function (cb) { cb(); },
    stop: function (cb) { cb(); },
    reset: function (mode, cb) { cb(); },
    permitJoin: function (duration, cb) { cb(); },
    remove: function (permAddr, cb) { cb(); },
    ban: function (permAddr, cb) { cb(); },
    unban: function (permAddr, cb) { cb(); },
    ping: function (permAddr, cb) { cb(); }
};

var fakeDevDrvs = {
    read: function (permAddr, attr, cb) { cb(); },
    write: function (permAddr, attr, val, cb) { cb(); },
    identify: function (permAddr, cb) { cb(); }
};

var fakeGadDrvs = {
    read: function (permAddr, auxId, attr, cb) { cb(); },
    write: function (permAddr, auxId, attr, cb) { cb(); },
    exec: function (permAddr, auxId, attr, args, cb) { cb(); },
    writeReportCfg: function (permAddr, auxId, attrName, cfg, cb) { cb(); },
    readReportCfg: function (permAddr, auxId, attrName, cb) { cb(); }
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
    });

    it('has a null _cookRawDev method', function () {
        expect(nc._cookRawDev).to.be.equal(null);
    });

    it('has a null _cookRawGad method', function () {
        expect(nc._cookRawGad).to.be.equal(null);
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
        expect(drvs.writeReportCfg).to.be.equal(null);
        expect(drvs.readReportCfg).to.be.equal(null);
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
                writeReportCfg: function () {},
                readReportCfg: function () {}
            }); }).not.to.throw(TypeError);
        });
    });

    describe('#start(cb)', function() {
        it('should throw if callback is not a function', function () {
            nc._cookRawGad = function () {};
            nc._cookRawDev = function () {};
            nc._drivers.net = fakeNetDrvs;
            nc._drivers.dev = fakeDevDrvs;
            nc._drivers.gad = fakeGadDrvs;

            expect(function () { return nc.start([]); }).to.throw(TypeError);
            expect(function () { return nc.start({}); }).to.throw(TypeError);
            expect(function () { return nc.start(true); }).to.throw(TypeError);
            expect(function () { return nc.start('_id'); }).to.throw(TypeError);
            nc.cookRawGad = null;
            nc.cookRawDev = null;
            nc._drivers.net = {};
            nc._drivers.dev = {};
            nc._drivers.gad = {};
        });

        it('should not throw if callback is a function', function () {
            expect(function () { return nc.start(function () {}); }).not.to.throw(TypeError);
        });
    });

    describe('#stop(cb)', function() {
        it('should throw if callback is not a function', function () {
            expect(function () { return nc.stop([]); }).to.throw(TypeError);
            expect(function () { return nc.stop({}); }).to.throw(TypeError);
            expect(function () { return nc.stop(true); }).to.throw(TypeError);
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
            expect(function () { return nc.permitJoin(function () {}); }).to.throw(TypeError);
        });

        it('should not throw if duration is a number or not given', function () {
            expect(function () { return nc.permitJoin(1); }).not.to.throw(TypeError);
            expect(function () { return nc.permitJoin(100, function () {}); }).not.to.throw(TypeError);
        });

        it('should throw if cb is not a function when given', function () {
            expect(function () { return nc.permitJoin(1, []); }).to.throw(TypeError);
            expect(function () { return nc.permitJoin(1, {}); }).to.throw(TypeError);
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

    describe('#commitDevNetChanging(permAddr, changes)', function() {
        it('should throw if permAddr is not a string', function () {
            expect(function () { return nc.commitDevNetChanging([], {}); }).to.throw(TypeError);
            expect(function () { return nc.commitDevNetChanging({}, {}); }).to.throw(TypeError);
            expect(function () { return nc.commitDevNetChanging(null, {}); }).to.throw(TypeError);
            expect(function () { return nc.commitDevNetChanging(NaN, {}); }).to.throw(TypeError);
            expect(function () { return nc.commitDevNetChanging(true, {}); }).to.throw(TypeError);
            expect(function () { return nc.commitDevNetChanging(10, {}); }).to.throw(TypeError);
        });

        it('should not throw if permAddr is a string', function () {
            expect(function () { return nc.commitDevNetChanging('x', {}); }).not.to.throw(TypeError);
        });

        it('should throw if changes is not an object', function () {
            expect(function () { return nc.commitDevNetChanging('x', []); }).to.throw(TypeError);
            expect(function () { return nc.commitDevNetChanging('x', null); }).to.throw(TypeError);
            expect(function () { return nc.commitDevNetChanging('x', NaN); }).to.throw(TypeError);
            expect(function () { return nc.commitDevNetChanging('x', true); }).to.throw(TypeError);
        });
    });

    describe('#commitDevIncoming(permAddr, rawDev)', function() {
        it('should throw if permAddr is not a string', function () {
            expect(function () { return nc.commitDevIncoming([], {}); }).to.throw(TypeError);
            expect(function () { return nc.commitDevIncoming({}, {}); }).to.throw(TypeError);
            expect(function () { return nc.commitDevIncoming(null, {}); }).to.throw(TypeError);
            expect(function () { return nc.commitDevIncoming(NaN, {}); }).to.throw(TypeError);
            expect(function () { return nc.commitDevIncoming(true, {}); }).to.throw(TypeError);
            expect(function () { return nc.commitDevIncoming(10, {}); }).to.throw(TypeError);
        });

        it('should not throw if permAddr is a string', function () {
            expect(function () { return nc.commitDevIncoming('x', {}); }).not.to.throw(TypeError);
        });

        it('should throw if rawDev is not defined', function () {
            expect(function () { return nc.commitDevIncoming('x'); }).to.throw(TypeError);
        });
    });

    describe('#commitDevLeaving(permAddr)', function() {
        it('should throw if permAddr is not a string', function () {
            expect(function () { return nc.commitDevLeaving([]); }).to.throw(TypeError);
            expect(function () { return nc.commitDevLeaving({}); }).to.throw(TypeError);
            expect(function () { return nc.commitDevLeaving(null); }).to.throw(TypeError);
            expect(function () { return nc.commitDevLeaving(NaN); }).to.throw(TypeError);
            expect(function () { return nc.commitDevLeaving(true); }).to.throw(TypeError);
            expect(function () { return nc.commitDevLeaving(10); }).to.throw(TypeError);
        });

        it('should not throw if permAddr is a string', function () {
            expect(function () { return nc.commitDevLeaving('x'); }).not.to.throw(TypeError);
        });
    });

    describe('#commitGadIncoming(permAddr, auxId, rawGad)', function() {
        it('should throw if permAddr is not a string', function () {
            expect(function () { return nc.commitGadIncoming({}); }).to.throw(TypeError);
            expect(function () { return nc.commitGadIncoming(1, 'attr', {}); }).to.throw(TypeError);
            expect(function () { return nc.commitGadIncoming([], 'attr', {}); }).to.throw(TypeError);
            expect(function () { return nc.commitGadIncoming(null, 'attr', {}); }).to.throw(TypeError);
            expect(function () { return nc.commitGadIncoming(NaN, 'attr', {}); }).to.throw(TypeError);
            expect(function () { return nc.commitGadIncoming(true, 'attr', {}); }).to.throw(TypeError);
            expect(function () { return nc.commitGadIncoming(function () {}, 'attr', {}); }).to.throw(TypeError);
        });

        it('should throw if auxId is not a string or a number', function () {
            expect(function () { return nc.commitGadIncoming('addr', {}); }).to.throw(TypeError);
            expect(function () { return nc.commitGadIncoming('addr', [], {}); }).to.throw(TypeError);
            expect(function () { return nc.commitGadIncoming('addr', null, {}); }).to.throw(TypeError);
            expect(function () { return nc.commitGadIncoming('addr', NaN, {}); }).to.throw(TypeError);
            expect(function () { return nc.commitGadIncoming('addr', true, {}); }).to.throw(TypeError);
            expect(function () { return nc.commitGadIncoming('addr', function () {}, {}); }).to.throw(TypeError);
        });

        it('should not throw if auxId is a string or a number', function () {
            expect(function () { return nc.commitGadIncoming('addr', 'xxx', {}); }).not.to.throw(TypeError);
            expect(function () { return nc.commitGadIncoming('addr', 1, {}); }).not.to.throw(TypeError);
        });

        it('should throw if rawGad is not defined', function () {
            expect(function () { return nc.commitGadIncoming('addr', 'x'); }).to.throw(TypeError);
            expect(function () { return nc.commitGadIncoming('addr', 'x', 1); }).not.to.throw(TypeError);
        });
    });

    describe('#commitDevReporting(permAddr, devAttrs)', function() {
        it('should throw if permAddr is not a string', function () {
            expect(function () { return nc.commitDevReporting([], {}); }).to.throw(TypeError);
            expect(function () { return nc.commitDevReporting({}, {}); }).to.throw(TypeError);
            expect(function () { return nc.commitDevReporting(null, {}); }).to.throw(TypeError);
            expect(function () { return nc.commitDevReporting(NaN, {}); }).to.throw(TypeError);
            expect(function () { return nc.commitDevReporting(true, {}); }).to.throw(TypeError);
            expect(function () { return nc.commitDevReporting(10, {}); }).to.throw(TypeError);
        });

        it('should not throw if permAddr is a string', function () {
            expect(function () { return nc.commitDevReporting('x', {}); }).not.to.throw(TypeError);
        });

        it('should throw if devAttrs is not an object', function () {
            expect(function () { return nc.commitDevReporting('x'); }).to.throw(TypeError);
            expect(function () { return nc.commitDevReporting('x', 1); }).to.throw(TypeError);
        });
    });

    describe('#commitGadReporting(permAddr, auxId, gadAttrs)', function() {
        it('should throw if permAddr is not a string', function () {
            expect(function () { return nc.commitGadReporting({}); }).to.throw(TypeError);
            expect(function () { return nc.commitGadReporting(1, 'attr', {}); }).to.throw(TypeError);
            expect(function () { return nc.commitGadReporting([], 'attr', {}); }).to.throw(TypeError);
            expect(function () { return nc.commitGadReporting(null, 'attr', {}); }).to.throw(TypeError);
            expect(function () { return nc.commitGadReporting(NaN, 'attr', {}); }).to.throw(TypeError);
            expect(function () { return nc.commitGadReporting(true, 'attr', {}); }).to.throw(TypeError);
            expect(function () { return nc.commitGadReporting(function () {}, 'attr', {}); }).to.throw(TypeError);
        });

        it('should throw if auxId is not a string or a number', function () {
            expect(function () { return nc.commitGadReporting('addr', {}); }).to.throw(TypeError);
            expect(function () { return nc.commitGadReporting('addr', [], {}); }).to.throw(TypeError);
            expect(function () { return nc.commitGadReporting('addr', null, {}); }).to.throw(TypeError);
            expect(function () { return nc.commitGadReporting('addr', NaN, {}); }).to.throw(TypeError);
            expect(function () { return nc.commitGadReporting('addr', true, {}); }).to.throw(TypeError);
            expect(function () { return nc.commitGadReporting('addr', function () {}, {}); }).to.throw(TypeError);
        });

        it('should not throw if auxId is a string or a number', function () {
            expect(function () { return nc.commitGadReporting('addr', 'xxx', {}); }).not.to.throw(TypeError);
            expect(function () { return nc.commitGadReporting('addr', 1, {}); }).not.to.throw(TypeError);
        });

        it('should throw if gadAttrs is notan object', function () {
            expect(function () { return nc.commitGadReporting('addr', 'x'); }).to.throw(TypeError);
            expect(function () { return nc.commitGadReporting('addr', 'x', 1); }).to.throw(TypeError);
        });
    });

    describe('#dangerouslyCommitGadReporting(permAddr, auxId, gadAttrs)', function() {
        it('should throw if permAddr is not a string', function () {
            expect(function () { return nc.dangerouslyCommitGadReporting({}); }).to.throw(TypeError);
            expect(function () { return nc.dangerouslyCommitGadReporting(1, 'attr', {}); }).to.throw(TypeError);
            expect(function () { return nc.dangerouslyCommitGadReporting([], 'attr', {}); }).to.throw(TypeError);
            expect(function () { return nc.dangerouslyCommitGadReporting(null, 'attr', {}); }).to.throw(TypeError);
            expect(function () { return nc.dangerouslyCommitGadReporting(NaN, 'attr', {}); }).to.throw(TypeError);
            expect(function () { return nc.dangerouslyCommitGadReporting(true, 'attr', {}); }).to.throw(TypeError);
            expect(function () { return nc.dangerouslyCommitGadReporting(function () {}, 'attr', {}); }).to.throw(TypeError);
        });

        it('should throw if auxId is not a string or a number', function () {
            expect(function () { return nc.dangerouslyCommitGadReporting('addr', {}); }).to.throw(TypeError);
            expect(function () { return nc.dangerouslyCommitGadReporting('addr', [], {}); }).to.throw(TypeError);
            expect(function () { return nc.dangerouslyCommitGadReporting('addr', null, {}); }).to.throw(TypeError);
            expect(function () { return nc.dangerouslyCommitGadReporting('addr', NaN, {}); }).to.throw(TypeError);
            expect(function () { return nc.dangerouslyCommitGadReporting('addr', true, {}); }).to.throw(TypeError);
            expect(function () { return nc.dangerouslyCommitGadReporting('addr', function () {}, {}); }).to.throw(TypeError);
        });

        it('should not throw if auxId is a string or a number', function () {
            expect(function () { return nc.dangerouslyCommitGadReporting('addr', 'xxx', {}); }).not.to.throw(TypeError);
            expect(function () { return nc.dangerouslyCommitGadReporting('addr', 1, {}); }).not.to.throw(TypeError);
        });

        it('should throw if gadAttrs is notan object', function () {
            expect(function () { return nc.dangerouslyCommitGadReporting('addr', 'x'); }).to.throw(TypeError);
            expect(function () { return nc.dangerouslyCommitGadReporting('addr', 'x', 1); }).to.throw(TypeError);
        });
    });
});

describe('Functional Test', function () {
    describe('#getBlacklist() ', function () {
        it('should get an empty list', function () {
            expect(nc.getBlacklist()).to.deep.equal([]);
        });
    });

    describe('#_block() ', function () {
        it('should return nc', function () {
            expect(nc._block('abc')).to.equal(nc);
        });
    });

    describe('#isBlacklisted() ', function () {
        it('should return true if someone is blocked', function () {
            expect(nc.isBlacklisted('abc')).to.be.true;
        });

        it('should return false if someone is not blocked', function () {
            expect(nc.isBlacklisted('abcx')).to.be.false;
        });

        it('should return the correct blacklist', function () {
            expect(nc.getBlacklist()).to.deep.equal([ 'abc' ]);
        });

        it('should return the correct blacklist when block another', function () {
            expect(nc._block('cde')).to.equal(nc);
            expect(nc.getBlacklist()).to.deep.equal([ 'abc', 'cde' ]);
        });
    });

    describe('#_unblock() ', function () {
        it('should return nc and blacklist is updated', function () {
            expect(nc._unblock('abc')).to.equal(nc);
            expect(nc.getBlacklist()).to.deep.equal([ 'cde' ]);
        });
    });

    describe('#clearBlacklist() ', function () {
        it('should return nc and get an empty list after clean blacklist', function () {
            expect(nc.clearBlacklist()).to.equal(nc);
            expect(nc.getBlacklist()).to.deep.equal([]);
        });
    });

    describe('#_fireup() - registered', function () {
        it('should fire correctly', function (done) {
            nc.enable();
            fb.once('test', function (data) {
                nc.disable();
                if (data.d === 3)
                    data.done();
            });

            expect(nc._fireup('test', { d: 3, done: done })).to.be.true;
        });
    });

    describe('#_fireup() - registered, nc:error', function () {
        it('should fire correctly', function (done) {
            nc._freebird = fb;
            nc.enable();
            fb.once('_nc:error', function (errInfo) {
                nc.disable();
                if (errInfo.d === 3)
                    errInfo.done();
            });

            expect(nc._fireup('_nc:error', { error: new Error('x'), d: 3, done: done })).to.be.true;
        });
    });

    describe('#_findDriver(type, name)', function () {
        it('should find driver correctly', function () {
            nc._drivers.net = fakeNetDrvs;
            nc._drivers.dev = fakeDevDrvs;
            nc._drivers.gad = fakeGadDrvs;
            expect(nc._findDriver('net', 'start')).to.equal(fakeNetDrvs.start);
            expect(nc._findDriver('dev', 'read')).to.equal(fakeDevDrvs.read);
            expect(nc._findDriver('gad', 'read')).to.be.equal(fakeGadDrvs.read);
        });
    });

    describe('#isRegistered()', function () {
        it('should pass registration test', function () {
            nc._freebird = null;
            expect(nc.isRegistered()).to.be.false;
            nc._freebird = fb;
            expect(nc.isRegistered()).to.be.true;
        });
    });

    describe('#isJoinable()', function () {
        it('should pass joining test', function (done) {
            fakeNetDrvs.permitJoin = function (time, cb) { cb(); };
            nc.enable();
            expect(nc.isJoinable()).to.be.false;
            nc.permitJoin(3, function (err, t) {
                if (nc.isJoinable())
                    done();
            });
        });
    });

    describe('#isEnabled()', function () {
        it('should pass enable test', function () {
            expect(nc.isEnabled()).to.be.true;
            nc.disable();
            expect(nc.isEnabled()).to.be.false;
            nc.enable();
        });
    });

    describe('#enable()', function () {
        it('should pass enable test', function () {
            expect(nc.enable()).to.be.equal(nc);
            expect(nc.isEnabled()).to.be.true;
        });
    });

    describe('#disable()', function () {
        it('should pass disable test', function () {
            expect(nc.disable()).to.be.equal(nc);
            expect(nc.isEnabled()).to.be.false;
        });
    });

    describe('#dump()', function () {
        it('should pass dump test', function () {
            expect(nc.dump()).to.be.deep.equal({
                name: 'mync',
                enabled: false,
                protocol: { phy: 'myphy', nwk: 'mynwk' },
                startTime: 0
            });
        });
    });

    describe('#getName()', function () {
        it('should get the right name', function () {
            expect(nc.getName()).to.be.equal(ncname);
        });
    });

    describe('#getTraffic()', function () {
        it('should get 0 traffic', function () {
            expect(nc.getTraffic()).to.be.deep.equal({
                in: { hits: 0, bytes: 0 }, out: { hits: 0, bytes: 0 }
            });
        });
    });

    describe('#registerNetDrivers()', function () {
        it('should register any driver', function () {
            var q = function () {};
            expect(nc.registerNetDrivers({ q: q })).to.equal(nc);
            expect(nc._findDriver('net', 'q')).to.be.equal(q);
        });
    });

    describe('#registerDevDrivers()', function () {
        it('should register any driver', function () {
            var z = function () {};
            expect(nc.registerDevDrivers({ z: z })).to.equal(nc);
            expect(nc._findDriver('dev', 'z')).to.be.equal(z);
        });
    });

    describe('#registerGadDrivers()', function () {
        it('should register any driver', function () {
            var m = function () {};
            expect(nc.registerGadDrivers({ m: m })).to.equal(nc);
            expect(nc._findDriver('gad', 'm')).to.be.equal(m);
        });
    });

    describe('#commitDevIncoming(permAddr, rawDev) - not banned', function () {
        it('should receive _nc:devIncoming event', function (done) {
            nc.enable();
            var p = '0x1234',
                r = {};
            fb.once('_nc:devIncoming', function (data) {
                if (data.permAddr === p && data.raw === r)
                    done();
            });

            nc.commitDevIncoming(p, r);
        });
    });

    describe('#commitDevIncoming(permAddr, rawDev) - banned', function () {
        it('should receive _nc:bannedDevIncoming event', function (done) {
            nc.enable();
            var p = '0x1234',
                r = {};
            nc.ban(p, function (err, a) {});
            fb.once('_nc:bannedDevIncoming', function (data) {
                if (data.permAddr === p && data.raw === r)
                    done();
            });

            nc.commitDevIncoming(p, r);
        });
    });

    describe('#commitDevIncoming(permAddr, rawDev) - disable', function () {
        it('should not commit out', function () {
            var p = '0x1234',
                r = {};
            nc.disable();
            expect(nc.commitDevIncoming(p, r)).to.be.false;
            nc.enable();
            expect(nc.commitDevIncoming(p, r)).to.be.true;
        });
    });

    describe('#commitGadIncoming(permAddr, auxId, rawGad) - not banned', function () {
        it('should receiver _nc:gadIncoming', function (done) {
            nc.enable();
            var p = '0xABCD1234',
                aux = 3,
                r = {};
            fb.once('_nc:gadIncoming', function (data) {
                if (data.permAddr === p && data.raw === r && data.auxId === aux)
                    done();
            });

            nc.commitGadIncoming(p, aux, r);
        });
    });

    describe('#commitGadIncoming(permAddr, auxId, rawGad) - banned', function () {
        it('should receiver _nc:bannedGadIncoming', function (done) {
            nc.enable();
            var p = '0x1234',
                aux = 3,
                r = {};
            nc.ban(p, function () {});
            fb.once('_nc:bannedGadIncoming', function (data) {
                if (data.permAddr === p && data.raw === r && data.auxId === aux)
                    done();
            });

            nc.commitGadIncoming(p,aux, r);
        });
    });

    describe('#commitGadIncoming(permAddr, auxId, rawGad) - disable', function () {
        it('should not commit out', function () {
            var p = '0x1234',
                aux = 3,
                r = {};
            nc.disable();
            expect(nc.commitGadIncoming(p, aux, r)).to.be.false;
            nc.enable();
            expect(nc.commitGadIncoming(p, aux, r)).to.be.true;
        });
    });

    describe('#commitDevReporting(permAddr, devAttrs) - not banned', function () {
        it('should receive _nc:devReporting event', function (done) {
            nc.enable();
            var p = '0xABCD1234',
                attrs = {};
            fb.once('_nc:devReporting', function (data) {
                if (data.permAddr === p && data.data === attrs)
                    done();
            });

            nc.commitDevReporting(p, attrs);
        });
    });

    describe('#commitDevReporting(permAddr, devAttrs) - banned', function () {
        it('should receive _nc:bannedDevReporting event', function (done) {
            nc.enable();
            var p = '0x1234',
                attrs = {};
            nc.ban(p, function () {});
            fb.once('_nc:bannedDevReporting', function (data) {
                if (data.permAddr === p && data.data === attrs)
                    done();
            });

            nc.commitDevReporting(p, attrs);
        });
    });

    describe('#commitDevReporting(permAddr, devAttrs) - disable', function () {
        it('should not commit', function () {
            var p = '0x1234',
                attrs = {};
            nc.disable();
            expect(nc.commitDevReporting(p, attrs)).to.be.false;
            nc.enable();
            expect(nc.commitDevReporting(p, attrs)).to.be.true;
        });
    });

    describe('#commitGadReporting(permAddr, auxId, rawGad) - banned', function () {
        it('should receive _nc:bannedGadReporting event', function (done) {
            nc.enable();
            var p = '0xABCD1234',
                aux = 3,
                r = {};
            nc.ban(p, function () {});

            fb.once('_nc:bannedGadReporting', function (data) {
                if (data.permAddr === p && data.data === r && data.auxId === aux)
                    done();
            });

            nc.commitGadReporting(p, aux, r);
        });
    });

    describe('#commitGadReporting(permAddr, auxId, rawGad) - disable', function () {
        it('should not commit', function () {
            var p = '0x1234',
                aux = 3,
                r = {};
            nc.disable();
            expect(nc.commitGadReporting(p, aux, r)).to.be.false;
            nc.enable();
            expect(nc.commitGadReporting(p, aux, r)).to.be.true;
        });
    });
});