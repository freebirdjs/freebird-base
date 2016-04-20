/* jshint node: true */

var EventEmitter = require('events'),
    util = require('util'),
    should = require('should'),
    Device = require('../lib/device.js'),
    Gadget = require('../lib/gadget.js'),
    Netcore = require('../lib/netcore.js'),
    _ = require('lodash');

var fb = Object.create(new EventEmitter());

var ncname = 'mync';
var controller = {};
var protocol = {
    phy: 'myphy',
    nwk: 'mynwk'
};
var opt = {};

var nc = new Netcore(ncname, controller, protocol, opt);
nc._fb = fb;

describe('Constructor Testing', function () {
    it('Constructor - no args', function () {
        (function () { return new Netcore(); }).should.throw();
    });

    it('Constructor - only name', function () {
        (function () { return new Netcore('my'); }).should.throw();
    });

    it('Constructor - name, controller', function () {
        (function () { return new Netcore('my', controller); }).should.throw();
    });

    it('Constructor - name, controller', function () {
        (function () { return new Netcore('my', controller, protocol); }).should.not.throw();
    });

    it('Constructor - name not string', function () {
        (function () { return new Netcore(5, controller, protocol); }).should.throw();
    });

    it('Constructor - protocol not object', function () {
        (function () { return new Netcore('my', controller, []); }).should.throw();
    });
});

describe('Constructor Base Property Check', function () {
    it('_fb', function () {
        should(nc._fb).be.equal(fb);
    });

    it('_joinTimer', function () {
        should(nc._joinTimer).be.eql(null);
    });

    it('_joinTicks', function () {
        should(nc._joinTicks).be.equal(0);
    });

    it('_controller', function () {
        should(nc._controller).be.equal(controller);
    });

    it('_net', function () {
        should(nc._net.name).be.equal(ncname);
        should(nc._net.enabled).be.equal(false);
        should(nc._net.protocol).be.equal(protocol);
        should(nc._net.startTime).be.equal(0);
        should(nc._net.defaultJoinTime).be.equal(180);
        should(nc._net.traffic).be.eql({
            in: { hits: 0, bytes: 0 },
            out: { hits: 0, bytes: 0 }
        });
    });

    it('cookRawDev', function () {
        should(nc.cookRawDev).be.eql(null);
    });

    it('cookRawGad', function () {
        should(nc.cookRawGad).be.eql(null);
    });

    it('_drivers.net', function () {
        should(nc._drivers.net.start).be.eql(null);
        should(nc._drivers.net.stop).be.eql(null);
        should(nc._drivers.net.reset).be.eql(null);
        should(nc._drivers.net.permitJoin).be.eql(null);
        should(nc._drivers.net.remove).be.eql(null);
        should(nc._drivers.net.ban).be.eql(null);
        should(nc._drivers.net.unban).be.eql(null);
        should(nc._drivers.net.ping).be.eql(null);
    });

    it('_drivers.dev', function () {
        should(nc._drivers.dev.read).be.eql(null);
        should(nc._drivers.dev.write).be.eql(null);
        should(nc._drivers.dev.identify).be.eql(null);
    });

    it('_drivers.gad', function () {
        should(nc._drivers.gad.read).be.eql(null);
        should(nc._drivers.gad.write).be.eql(null);
        should(nc._drivers.gad.exec).be.eql(null);
        should(nc._drivers.gad.setReportCfg).be.eql(null);
        should(nc._drivers.gad.getReportCfg).be.eql(null);
    });
});


describe('Check Signature', function () {
// isBlacklisted = function (permAddr)
// registerNetDrivers = function (drvs)
// registerDevDrivers = function (drvs)
// registerGadDrivers = function (drvs)

    it('isBlacklisted(permAddr)', function () {
        (function () { nc.isBlacklisted(); }).should.throw();
        (function () { nc.isBlacklisted(1); }).should.throw();
        (function () { nc.isBlacklisted([]); }).should.throw();
        (function () { nc.isBlacklisted(null); }).should.throw();
        (function () { nc.isBlacklisted({}); }).should.throw();
        (function () { nc.isBlacklisted('xxx'); }).should.not.throw();
    });

    it('registerNetDrivers(drvs)', function () {
        (function () { nc.registerNetDrivers(); }).should.throw();
        (function () { nc.registerNetDrivers(1); }).should.throw();
        (function () { nc.registerNetDrivers([]); }).should.throw();
        (function () { nc.registerNetDrivers(null); }).should.throw();
        (function () { nc.registerNetDrivers('xxx'); }).should.throw();
        (function () { nc.registerNetDrivers({}); }).should.not.throw();
        (function () { nc.registerNetDrivers({ my1: 1 }); }).should.throw();
        (function () { nc.registerNetDrivers({ my1: {} }); }).should.throw();
        (function () { nc.registerNetDrivers({ my1: function () {} }); }).should.not.throw();
        (function () { nc.registerNetDrivers({ my1: function () {}, my2: 3 } ); }).should.throw();

    });

    it('registerDevDrivers(drvs)', function () {
        (function () { nc.registerDevDrivers(); }).should.throw();
        (function () { nc.registerDevDrivers(1); }).should.throw();
        (function () { nc.registerDevDrivers([]); }).should.throw();
        (function () { nc.registerDevDrivers(null); }).should.throw();
        (function () { nc.registerDevDrivers('xxx'); }).should.throw();
        (function () { nc.registerDevDrivers({}); }).should.not.throw();
        (function () { nc.registerDevDrivers({ my1: 1 }); }).should.throw();
        (function () { nc.registerDevDrivers({ my1: {} }); }).should.throw();
        (function () { nc.registerDevDrivers({ my1: function () {} }); }).should.not.throw();
        (function () { nc.registerDevDrivers({ my1: function () {}, my2: 3 } ); }).should.throw();
    });

    it('registerGadDrivers(drvs)', function () {
        (function () { nc.registerGadDrivers(); }).should.throw();
        (function () { nc.registerGadDrivers(1); }).should.throw();
        (function () { nc.registerGadDrivers([]); }).should.throw();
        (function () { nc.registerGadDrivers(null); }).should.throw();
        (function () { nc.registerGadDrivers('xxx'); }).should.throw();
        (function () { nc.registerGadDrivers({}); }).should.not.throw();
        (function () { nc.registerGadDrivers({ my1: 1 }); }).should.throw();
        (function () { nc.registerGadDrivers({ my1: {} }); }).should.throw();
        (function () { nc.registerGadDrivers({ my1: function () {} }); }).should.not.throw();
        (function () { nc.registerGadDrivers({ my1: function () {}, my2: 3 } ); }).should.throw();
    });
// commitDevIncoming = function (permAddr, rawDev)
// commitDevLeaving = function (permAddr) 
// commitGadIncoming = function (permAddr, auxId, rawGad)
// commitDevReporting = function (permAddr, devAttrs)
// commitGadReporting = function (permAddr, auxId, gadAttrs)

    it('commitDevIncoming(permAddr, rawDev)', function () {
        var rawDev = {};
        (function () { nc.commitDevIncoming(); }).should.throw();
        (function () { nc.commitDevIncoming(1); }).should.throw();
        (function () { nc.commitDevIncoming([]); }).should.throw();
        (function () { nc.commitDevIncoming(null); }).should.throw();
        (function () { nc.commitDevIncoming({}); }).should.throw();
        (function () { nc.commitDevIncoming('xxx'); }).should.throw();
        (function () { nc.commitDevIncoming(rawDev); }).should.throw();

        (function () { nc.commitDevIncoming(1, rawDev); }).should.throw();
        (function () { nc.commitDevIncoming([], rawDev); }).should.throw();
        (function () { nc.commitDevIncoming(null, rawDev); }).should.throw();
        (function () { nc.commitDevIncoming({}, rawDev); }).should.throw();
        (function () { nc.commitDevIncoming('xxx', rawDev); }).should.not.throw();
    });

    it('commitDevLeaving(permAddr)', function () {
        var rawDev = {};
        (function () { nc.commitDevLeaving(); }).should.throw();
        (function () { nc.commitDevLeaving(1); }).should.throw();
        (function () { nc.commitDevLeaving([]); }).should.throw();
        (function () { nc.commitDevLeaving(null); }).should.throw();
        (function () { nc.commitDevLeaving({}); }).should.throw();
        (function () { nc.commitDevLeaving('xxx'); }).should.not.throw();
    });

    it('commitGadIncoming(permAddr, auxId, rawGad)', function () {
        var rawGad = {};
        (function () { nc.commitGadIncoming(); }).should.throw();
        (function () { nc.commitGadIncoming(1); }).should.throw();
        (function () { nc.commitGadIncoming([]); }).should.throw();
        (function () { nc.commitGadIncoming(null); }).should.throw();
        (function () { nc.commitGadIncoming({}); }).should.throw();
        (function () { nc.commitGadIncoming('xxx'); }).should.throw();

        (function () { nc.commitGadIncoming('xxx', 1); }).should.throw();
        (function () { nc.commitGadIncoming('xxx', []); }).should.throw();
        (function () { nc.commitGadIncoming('xxx', null); }).should.throw();
        (function () { nc.commitGadIncoming('xxx', {}); }).should.throw();
        (function () { nc.commitGadIncoming('xxx', 'yyy'); }).should.throw();

        (function () { nc.commitGadIncoming('xxx', [], rawGad); }).should.throw();
        (function () { nc.commitGadIncoming('xxx', null, rawGad); }).should.throw();
        (function () { nc.commitGadIncoming('xxx', {}, rawGad); }).should.throw();

        (function () { nc.commitGadIncoming('xxx', 1, rawGad); }).should.not.throw();
        (function () { nc.commitGadIncoming('xxx', 'yyy', rawGad); }).should.not.throw();
    });

    it('commitDevReporting(permAddr, devAttrs)', function () {
        var devAttrs = {};
        (function () { nc.commitDevReporting(); }).should.throw();
        (function () { nc.commitDevReporting(1); }).should.throw();
        (function () { nc.commitDevReporting([]); }).should.throw();
        (function () { nc.commitDevReporting(null); }).should.throw();
        (function () { nc.commitDevReporting({}); }).should.throw();
        (function () { nc.commitDevReporting('xxx'); }).should.throw();
        (function () { nc.commitDevReporting(devAttrs); }).should.throw();

        (function () { nc.commitDevReporting(1, devAttrs); }).should.throw();
        (function () { nc.commitDevReporting([], devAttrs); }).should.throw();
        (function () { nc.commitDevReporting(null, devAttrs); }).should.throw();
        (function () { nc.commitDevReporting({}, devAttrs); }).should.throw();
        (function () { nc.commitDevReporting('xxx', devAttrs); }).should.not.throw();
    });

    it('commitGadReporting(permAddr, auxId, gadAttrs)', function () {
        var gadAttrs = {};
        (function () { nc.commitGadReporting(); }).should.throw();
        (function () { nc.commitGadReporting(1); }).should.throw();
        (function () { nc.commitGadReporting([]); }).should.throw();
        (function () { nc.commitGadReporting(null); }).should.throw();
        (function () { nc.commitGadReporting({}); }).should.throw();
        (function () { nc.commitGadReporting('xxx'); }).should.throw();

        (function () { nc.commitGadReporting('xxx', 1); }).should.throw();
        (function () { nc.commitGadReporting('xxx', []); }).should.throw();
        (function () { nc.commitGadReporting('xxx', null); }).should.throw();
        (function () { nc.commitGadReporting('xxx', {}); }).should.throw();
        (function () { nc.commitGadReporting('xxx', 'yyy'); }).should.throw();

        (function () { nc.commitGadReporting('xxx', [], gadAttrs); }).should.throw();
        (function () { nc.commitGadReporting('xxx', null, gadAttrs); }).should.throw();
        (function () { nc.commitGadReporting('xxx', {}, gadAttrs); }).should.throw();

        (function () { nc.commitGadReporting('xxx', 1, gadAttrs); }).should.not.throw();
        (function () { nc.commitGadReporting('xxx', 'yyy', gadAttrs); }).should.not.throw();
    });


// start = function (callback) - err emit
// stop = function (callback)
// reset = function (mode, callback)
// permitJoin = function (duration, callback)
// remove = function (permAddr, callback)
// ban = function (permAddr, callback)
// unban = function (permAddr, callback)
// ping = function (permAddr, callback)

    it('start(callback)', function () {
        (function () { nc.start(function (err) { /*console.log(err);*/ }); }).should.not.throw();
    });

    it('stop(callback)', function () {
        nc.enable();
        (function () { nc.stop(function (err) { /*console.log(err);*/ }); }).should.not.throw();
    });

    it('reset(mode, callback)', function () {
        (function () { nc.reset(function (err) { /*console.log(err);*/ }); }).should.not.throw();
        (function () { nc.reset('x', function (err) { /*console.log(err);*/ }); }).should.not.throw();
    });

    it('permitJoin(duration, callback)', function () {
        (function () { nc.permitJoin(function (err) { /*console.log(err);*/ }); }).should.not.throw();
        (function () { nc.permitJoin('x', function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.permitJoin(60, function (err) { /*console.log(err);*/ }); }).should.not.throw();
    });

    it('remove(permAddr, callback)', function () {
        (function () { nc.remove(function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.remove('x', function (err) { /*console.log(err);*/ }); }).should.not.throw();
    });

    it('ban(permAddr, callback)', function () {
        (function () { nc.ban(function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.ban("xxxx"); }).should.not.throw();
    });

    it('unban(permAddr, callback)', function () {
        (function () { nc.unban(function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.unban('xxxx', function (err) { /*console.log(err);*/ }); }).should.not.throw();
    });

    it('ping(permAddr, callback)', function () {
        (function () { nc.ping(function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.ping("xxxx"); }).should.throw();
        (function () { nc.ping("xxxx", function (err) { /*console.log(err);*/ }); }).should.not.throw();
    });

// devRead = function (permAddr, attrName, callback)
// devWrite = function (permAddr, attrName, val, callback)
// identify = function (permAddr, callback)
// gadRead = function (permAddr, auxId, attrName, callback)
// gadWrite = function (permAddr, auxId, attrName, val, callback)
// gadExec = function (permAddr, auxId, attrName, args, callback)

    it('devRead(permAddr, attrName, callback)', function () {
        (function () { nc.devRead(function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.devRead("xxxx"); }).should.throw();
        (function () { nc.devRead("xxxx", function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.devRead("xxxx", "xxx"); }).should.throw();
        (function () { nc.devRead("xxxx", "xxx", function (err) { /*console.log(err);*/ }); }).should.not.throw();
    });

    it('devWrite(permAddr, attrName, val, callback)', function () {
        (function () { nc.devWrite(function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.devWrite("xxxx"); }).should.throw();
        (function () { nc.devWrite("xxxx", function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.devWrite("xxxx", "xxx"); }).should.throw();
        (function () { nc.devWrite("xxxx", "xxx", function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.devWrite("xxxx", "xxx", 1); }).should.not.throw();
        (function () { nc.devWrite("xxxx", "xxx", 1, function (err) { /*console.log(err);*/ }); }).should.not.throw();
    });

    it('identify(permAddr, callback)', function () {
        (function () { nc.identify(function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.identify("xxxx"); }).should.not.throw();
        (function () { nc.identify("xxxx", function (err) { /*console.log(err);*/ }); }).should.not.throw();
    });

    it('gadRead(permAddr, auxId, attrName, callback)', function () {
        (function () { nc.gadRead(function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.gadRead("xxxx"); }).should.throw();
        (function () { nc.gadRead("xxxx", function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.gadRead("xxxx", "xxx"); }).should.throw();
        (function () { nc.gadRead("xxxx", "xxx", 3); }).should.throw();
        (function () { nc.gadRead("xxxx", "xxx", function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.gadRead("xxxx", "xxx", 'dd', function (err) { /*console.log(err);*/ }); }).should.not.throw();
    });

    it('gadWrite(permAddr, auxId, attrName, val, callback)', function () {
        (function () { nc.gadWrite(function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.gadWrite("xxxx"); }).should.throw();
        (function () { nc.gadWrite("xxxx", function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.gadWrite("xxxx", "xxx"); }).should.throw();
        (function () { nc.gadWrite("xxxx", "xxx", 3); }).should.throw();
        (function () { nc.gadWrite("xxxx", "xxx", function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.gadWrite("xxxx", "xxx", 'dd', function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.gadWrite("xxxx", "xxx", 'dd', 3); }).should.not.throw();
        (function () { nc.gadWrite("xxxx", "xxx", 'dd', 3, function (err) { /*console.log(err);*/ }); }).should.not.throw();
    });

    it('gadExec(permAddr, auxId, attrName, args, callback)', function () {
        (function () { nc.gadExec(function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.gadExec("xxxx"); }).should.throw();
        (function () { nc.gadExec("xxxx", function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.gadExec("xxxx", "xxx"); }).should.throw();
        (function () { nc.gadExec("xxxx", "xxx", function (err) { /*console.log(err);*/ }); }).should.throw();

        (function () { nc.gadExec("xxxx", "xxx", 'dd'); }).should.not.throw();
        (function () { nc.gadExec("xxxx", "xxx", 'dd', function (err) { /*console.log(err);*/ }); }).should.not.throw();
        (function () { nc.gadExec("xxxx", "xxx", 'dd', [3]); }).should.not.throw();
        (function () { nc.gadExec("xxxx", "xxx", 'dd', [3,2], function (err) { /*console.log(err);*/ }); }).should.not.throw();
    });

// setReportCfg = function (permAddr, auxId, attrName, cfg, callback)
// getReportCfg = function (permAddr, auxId, attrName, callback)
    it('setReportCfg(permAddr, auxId, attrName, cfg, callback)', function () {
        (function () { nc.setReportCfg(function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.setReportCfg("xxxx"); }).should.throw();
        (function () { nc.setReportCfg("xxxx", function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.setReportCfg("xxxx", "xxx"); }).should.throw();
        (function () { nc.setReportCfg("xxxx", "xxx", 3); }).should.throw();
        (function () { nc.setReportCfg("xxxx", "xxx", function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.setReportCfg("xxxx", "xxx", 'dd', function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.setReportCfg("xxxx", "xxx", 'dd', 3); }).should.throw();
        (function () { nc.setReportCfg("xxxx", "xxx", 'dd', 3, function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.setReportCfg("xxxx", "xxx", 'dd', {}); }).should.not.throw();
        (function () { nc.setReportCfg("xxxx", "xxx", 'dd', {}, function (err) { /*console.log(err);*/ }); }).should.not.throw();
    });

    it('getReportCfg(permAddr, auxId, attrName, callback)', function () {
        (function () { nc.getReportCfg(function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.getReportCfg("xxxx"); }).should.throw();
        (function () { nc.getReportCfg("xxxx", function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.getReportCfg("xxxx", "xxx"); }).should.throw();
        (function () { nc.getReportCfg("xxxx", "xxx", 3); }).should.throw();
        (function () { nc.getReportCfg("xxxx", "xxx", function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc.getReportCfg("xxxx", "xxx", 'dd', function (err) { /*console.log(err);*/ }); }).should.not.throw();
    });


    it('_registerDrivers(space, drvs)', function () {
        (function () { nc._registerDrivers(function (err) { /*console.log(err);*/ }); }).should.throw();
        (function () { nc._registerDrivers("xxxx"); }).should.throw();
        (function () { nc._registerDrivers([], {}); }).should.throw();
        (function () { nc._registerDrivers(1, {}); }).should.throw();
        (function () { nc._registerDrivers({}, {}); }).should.throw();
        (function () { nc._registerDrivers("xxxx", "xxx"); }).should.throw();
        (function () { nc._registerDrivers("xxxx", []); }).should.throw();
        (function () { nc._registerDrivers("xxxx", {}); }).should.not.throw();
        (function () { nc._registerDrivers("xxxx", function (err) { /*console.log(err);*/ }); }).should.throw();
    });
});

describe('Functional Test', function () {
    it('getBlacklist()', function () {
        nc.getBlacklist().should.eql([]);
    });

    it('_block()', function () {
        nc._block('abc').should.equal(nc);
    });

    it('isBlacklisted()', function () {
        nc.isBlacklisted('abc').should.equal(true);
        nc.isBlacklisted('abc1').should.equal(false);
        nc.getBlacklist().should.eql([ 'abc' ]);
        nc._block('cde').should.equal(nc);
        nc.getBlacklist().should.eql([ 'abc', 'cde' ]);
    });

    it('_unblock()', function () {
        nc._unblock('abc').should.equal(nc);
        nc.getBlacklist().should.eql([ 'cde' ]);
    });

    it('clearBlacklist()', function () {
        nc.clearBlacklist().should.equal(nc);
        nc.getBlacklist().should.eql([]);
    });

    it('_fbEmit(evt, data) - registered', function (done) {
        fb.once('test', function (data) {
            if (data.d === 3)
                data.done();
        });
        nc._fbEmit('test', { d: 3, done: done }).should.equal(true);
    });

    it('_fbEmit(evt, data) - registered', function () {
        nc._fb = null;
        nc._fbEmit('test', { d: 3 }).should.equal(false);
    });

    it('_fbEmit(evt, data) - registered, nc:error', function (done) {
        nc._fb = fb;
        fb.once('_nc:error', function (err) {
            if (err.info.d === 3)
                err.info.done();
        });
        nc._fbEmit('_nc:error', { error: new Error('x'), d: 3, done: done }).should.equal(true);
    });

    it('_incTxBytes()', function () {
        nc._incTxBytes(10).should.equal(10);
        nc._net.traffic.out.hits.should.equal(1);
    });

    it('_incRxBytes()', function () {
        nc._incRxBytes(20).should.equal(20);
        nc._incRxBytes(20).should.equal(40);
        nc._net.traffic.in.hits.should.equal(2);
    });


    it('_startJoinTimer()', function (done) {
        this.timeout(15000);

        var fun1 = function (data) {
            if (data.timeLeft === 0) {
                done();
                fb.removeListener('_nc:permitJoin', fun1);
            }
        };
        fb.on('_nc:permitJoin', fun1);

        nc._startJoinTimer(1);
    });

    it('_clearJoinTimer()', function (done) {
        this.timeout(15000);
        var fun2 = function (data) {
            if (data.timeLeft === 0) {
                fb.removeListener('_nc:permitJoin', fun2);
                done();
            }
        };
        fb.on('_nc:permitJoin', fun2);
        nc._startJoinTimer(10);
        nc._clearJoinTimer();
    });

    it('_findDriver(type, name)', function () {
        var drv1 = function () {};
        should(nc._findDriver('net', 'start')).be.equal(null);
        nc._drivers.net.start = drv1;
        should(nc._findDriver('net', 'start')).be.equal(drv1);
        nc._drivers.net.start = null;

        should(nc._findDriver('dev', 'read')).be.equal(null);
        nc._drivers.dev.read = drv1;
        should(nc._findDriver('dev', 'read')).be.equal(drv1);
        nc._drivers.dev.read = null;

        should(nc._findDriver('gad', 'read')).be.equal(null);
        nc._drivers.gad.read = drv1;
        should(nc._findDriver('gad', 'read')).be.equal(drv1);
        nc._drivers.gad.read = null;
    });


    it('_checkBadDrivers()', function () {
        should(nc._checkBadDrivers()).eql([
            'net.start', 'net.stop', 'net.reset', 'net.permitJoin', 'net.remove',
            'net.ping', 'dev.read', 'dev.write', 'gad.read', 'gad.write'
        ]);
    });

    it('isRegistered()', function () {
        nc._fb = null;
        should(nc.isRegistered()).eql(false);
        nc._fb = fb;
        should(nc.isRegistered()).eql(true);
    });

    it('isJoinable()', function () {
        should(nc.isJoinable()).eql(false);
        nc._startJoinTimer(3);
        should(nc.isJoinable()).eql(true);
    });

    it('isEnabled()', function () {
        should(nc.isEnabled()).eql(true);
        // disable should wait for permitJoin implementation
        // nc.disable();
        // should(nc.isEnabled()).eql(false);
        // nc.enable();
        // should(nc.isEnabled()).eql(true);
    });

    it('enable()', function () {
        should(nc.enable()).equal(nc);
        should(nc.isEnabled()).eql(true);
    });

    it('disable()', function () {
        should(nc.disable()).equal(nc);
        // disable should wait for permitJoin implementation
    });

    it('dump()', function () {
        should(nc.dump()).be.eql({
            name: 'mync',
            enabled: true,
            protocol: { phy: 'myphy', nwk: 'mynwk' },
            startTime: 0,
            defaultJoinTime: 180,
            traffic: { in: { hits: 2, bytes: 40 }, out: { hits: 1, bytes: 10 } }
        });
    });

    it('getName()', function () {
        should(nc.getName()).equal(ncname);
    });

    it('getTraffic()', function () {
        should(nc.getTraffic()).eql({ in: { hits: 2, bytes: 40 }, out: { hits: 1, bytes: 10 } });
    });

    it('resetTxTraffic()', function () {
        should(nc.resetTxTraffic()).equal(nc);
        should(nc.getTraffic()).eql({ in: { hits: 2, bytes: 40 }, out: { hits: 0, bytes: 0 } });
    });

    it('resetRxTraffic()', function () {
        should(nc.resetRxTraffic()).equal(nc);
        should(nc.getTraffic()).eql({ in: { hits: 0, bytes: 0 }, out: { hits: 0, bytes: 0 } });
    });

    it('_registerDrivers()', function () {
        var x = function () {};
        should(nc._registerDrivers('net', { x: x })).equal(nc);
        should(nc._findDriver('net', 'x')).equal(x);
    });

    it('registerNetDrivers()', function () {
        var y = function () {};
        should(nc.registerNetDrivers({ y: y })).equal(nc);
        should(nc._findDriver('net', 'y')).equal(y);
    });

    it('registerDevDrivers()', function () {
        var z = function () {};
        should(nc.registerDevDrivers({ z: z })).equal(nc);
        should(nc._findDriver('dev', 'z')).equal(z);
    });

    it('registerGadDrivers()', function () {
        var m = function () {};
        should(nc.registerGadDrivers({ m: m })).equal(nc);
        should(nc._findDriver('gad', 'm')).equal(m);
    });

    it('commitDevIncoming(permAddr, rawDev) - not banned', function (done) {
        var p = '0x1234',
            r = {};
        fb.once('_nc:devIncoming', function (data) {
            if (data.permAddr === p && data.raw === r)
                done();
        });

        nc.commitDevIncoming(p, r);
    });

    it('commitDevIncoming(permAddr, rawDev) - banned', function (done) {
        var p = '0x1234',
            r = {};
        nc.ban(p);
        fb.once('_nc:bannedDevIncoming', function (data) {
            if (data.permAddr === p && data.raw === r)
                done();
        });

        nc.commitDevIncoming(p, r);
    });

    it('commitDevIncoming(permAddr, rawDev) - disable', function () {
        var p = '0x1234',
            r = {};
        nc._net.enabled = false;
        should(nc.commitDevIncoming(p, r)).be.equal(false);
        nc._net.enabled = true;
        should(nc.commitDevIncoming(p, r)).be.equal(true);
        nc.unban(p);
        should(nc.commitDevIncoming(p, r)).be.equal(true);
    });
});

