/* jshint node: true */

var EventEmitter = require('events'),
    util = require('util'),
    should = require('should'),
    Device = require('../lib/device.js'),
    Gadget = require('../lib/gadget.js'),
    Netcore = require('../lib/netcore.js'),
    _ = require('lodash');

var ncname = 'mync';
var controller = {};
var protocol = {
    phy: 'myphy',
    nwk: 'mynwk'
};
var opt = {};

var nc = new Netcore(ncname, controller, protocol, opt);


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
        should(nc._fb).be.null;
    });

    it('_joinTimer', function () {
        should(nc._joinTimer).be.null;
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
        should(nc.cookRawDev).be.null;
    });

    it('cookRawGad', function () {
        should(nc.cookRawGad).be.null;
    });

    it('_drivers.net', function () {
        should(nc._drivers.net.start).be.null;
        should(nc._drivers.net.stop).be.null;
        should(nc._drivers.net.reset).be.null;
        should(nc._drivers.net.permitJoin).be.null;
        should(nc._drivers.net.remove).be.null;
        should(nc._drivers.net.ban).be.null;
        should(nc._drivers.net.unban).be.null;
        should(nc._drivers.net.ping).be.ping;
    });

    it('_drivers.dev', function () {
        should(nc._drivers.dev.read).be.null;
        should(nc._drivers.dev.write).be.null;
        should(nc._drivers.dev.identify).be.null;
    });

    it('_drivers.gad', function () {
        should(nc._drivers.gad.read).be.null;
        should(nc._drivers.gad.write).be.null;
        should(nc._drivers.gad.exec).be.null;
        should(nc._drivers.gad.setReportCfg).be.null;
        should(nc._drivers.gad.getReportCfg).be.null;
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
        (function () { nc.unban('x', function (err) { /*console.log(err);*/ }); }).should.not.throw();
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
});