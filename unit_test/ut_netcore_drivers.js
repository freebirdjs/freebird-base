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

// var netMandatoryDrvs = [ 'start', 'stop', 'reset', 'permitJoin', 'remove', 'ping' ],
//     netOptionalDrvs = [ 'ban', 'unban' ],
//     devMandatoryDrvs = [ 'read', 'write' ],
//     devOptionalDrvs = [ 'identify' ],
//     gadMandatoryDrvs = [ 'read', 'write' ],
//     gadOptionalDrvs = [ 'exec', 'setReportCfg', 'getReportCfg' ];

nc.registerNetDrivers({
    start: function (cb) { return cb(null); },
    stop: function (cb) { return cb(null); },
    reset: function (mode, cb) { 
        return cb(null, mode);
    },
    permitJoin: function (duration, cb) { return cb(null, duration); },
    remove: function (permAddr, cb) { return cb(null, permAddr);  },
    ping: function (permAddr, cb) { return cb(null, 10); }
});

nc.registerDevDrivers({
    read: function (permAddr, attr, cb) { return cb(null, 'read'); },
    write: function (permAddr, attr, val, cb) { return cb(null, 'written'); }
});

nc.registerGadDrivers({
    read: function (permAddr, auxId, attr, cb) { return cb(null, 'read'); },
    write: function (permAddr, auxId, attr, val, cb) { return cb(null, 'written'); }
});

fb.on('_nc:error', function (err) {
    console.log(err);
});

describe('Drivers test', function () {

    it('start(callback) - no cookRawDev', function () {
        should(function () { nc.start(function (err) { if (err) throw err; }); }).throw();
    });

    it('start(callback) - no cookRawGad', function () {
        nc.cookRawDev = function () {};
        should(function () { nc.start(function (err) { if (err) throw err; }); }).throw();
    });

    it('start(callback) - not enable', function () {
        should(function () {
            nc.cookRawGad = function () {};
            nc.start(function (err) {
                if (err) {
                    throw err;
                }
        }); }).throw();
    });

    it('start(callback)', function () {
        nc.enable();
        should(function () { nc.start(function (err) { if (err) throw err; }); }).not.throw();
    });

    it('start(callback)', function (done) {
        this.timeout(15000);
        fb.once('_nc:started', function () {
            done();
        });
        nc.start();
    });

    it('stop(callback) - cb', function () {
        should(function () { nc.start(function (err) { if (err) throw err; }); }).not.throw();
    });

    it('stop(callback) - lsn', function (done) {
        fb.once('_nc:stopped', function () {
            done();
        });
        nc.stop();
    });

    it('reset(mode, callback) - cb', function (done) {
        nc.enable();
        nc.reset('xxxx', function (err, d) {
            if (!err)
                done();
        });
    });

    it('permitJoin(duration, callback) - cb', function (done) {
        nc.permitJoin(20, function (err, d) {
            // console.log(err);
            // console.log(d);
            if (!err && d === 20)
                done();
        });
    });

    it('remove(permAddr, callback) - cb', function (done) {
        nc.remove('0x1111', function (err, d) {
            if (!err && d === '0x1111')
                done();
        });
    });

    it('ban(permAddr, callback) - cb', function (done) {
        nc.ban('0x1111', function (err, d) {
            if (!err && d === '0x1111')
                done();
        });
    });

    it('ban(permAddr, callback) - lsn', function (done) {
        fb.once('_nc:netBan', function (d) {
            if (d.permAddr === '0x1111')
                done();
        });
        nc.ban('0x1111');
    });

    it('unban(permAddr, callback) - cb', function (done) {
        nc.unban('0x1111', function (err, d) {
            if (!err && d === '0x1111')
                done();
        });
    });

    it('unban(permAddr, callback) - lsn', function (done) {
        fb.once('_nc:netUnban', function (d) {
            if (d.permAddr === '0x1111')
                done();
        });
        nc.unban('0x1111');
    });

    it('unban(permAddr, callback) - lsn', function (done) {
        fb.once('_nc:netUnban', function (d) {
            if (d.permAddr === '0x122221')
                done();
        });
        nc.unban('0x122221');
    });

    it('ping(permAddr, callback) - cb', function (done) {
        nc.ping('0x1111', function (err, d) {
            if (!err && d === 10)
                done();
        });
    });

    it('ping(permAddr, callback) - lsn', function (done) {
        fb.once('_nc:netPing', function (d) {
            if (d.permAddr === '0x1111' && d.data === 10)
                done();
        });
        nc.ping('0x1111', function () {});
    });

    it('devRead(permAddr, attrName, callback) - cb', function (done) {
        nc.devRead('0x1111', 'x', function (err, d) {
            if (!err && d === 'read')
                done();
        });
    });

    it('devRead(permAddr, attrName, callback) - lsn', function (done) {
        fb.once('_nc:devRead', function (d) {
            if (d.permAddr === '0x1111' && d.data.x === 'read')
                done();
        });
        nc.devRead('0x1111', 'x', function () {});
    });

    it('devWrite(permAddr, attrName, val, callback) - cb', function (done) {
        nc.devWrite('0x1111', 'x', 2, function (err, d) {
            if (!err && d === 'written')
                done();
        });
    });

    it('devWrite(permAddr, attrName, val, callback) - lsn', function (done) {
        fb.once('_nc:devWrite', function (d) {
            if (d.permAddr === '0x1111' && d.data.x === 'written')
                done();
        });
        nc.devWrite('0x1111', 'x', 3, function () {});
    });

    // [TODO] should test with implementation
    it('identify(permAddr, callback) - cb', function (done) {
        nc.identify('0x1111', function (err, d) {
            if (err)    // not implemented
                done();
        });
    });

    it('gadRead(permAddr, auxId, attrName, callback) - cb', function (done) {
        var p = '0x1234',
            aux = 3,
            r = {};

        nc.gadRead(p, aux, 'x', function (err, d) {
            if (!err && d === 'read')
                done();
        });
    });

    it('gadRead(permAddr, auxId, attrName, callback) - lsn', function (done) {
        var p = '0x1234',
            aux = 3,
            r = {};
        fb.once('_nc:gadRead', function (d) {
            if (d.permAddr === p && d.auxId === aux && d.data.x === 'read')
                done();
        });
        nc.gadRead(p, aux, 'x', function () {});
    });

    it('gadWrite(permAddr, auxId, attrName, val, callback) - cb', function (done) {
        var p = '0x1234',
            aux = 3,
            r = 33;

        nc.gadWrite(p, aux, 'x', r, function (err, d) {
            if (!err && d === 'written')
                done();
        });
    });

    it('gadWrite(permAddr, auxId, attrName, val, callback) - lsn', function (done) {
        var p = '0x1234',
            aux = 3,
            r = 33;

        fb.once('_nc:gadWrite', function (d) {
            if (d.permAddr === p && d.auxId === aux && d.data.x === 'written')
                done();
        });
        nc.gadWrite(p, aux, 'x', r, function () {});
    });

    it('gadExec(permAddr, auxId, attrName, args, callback) - lsn', function (done) {
        var p = '0x1234',
            aux = 3,
            r = 33;

        // [TODO] should test with implementation
        nc.gadExec(p, aux, 'x', [ r ], function (err, da) {
            if (err)    // exec not implemented
                done();
        });
    });

    it('setReportCfg(permAddr, auxId, attrName, cfg, callback) - lsn', function (done) {
        var p = '0x1234',
            aux = 3,
            cfg = {};

        // [TODO] should test with implementation
        nc.setReportCfg(p, aux, 'x', cfg, function (err, da) {
            if (err)    // setReportCfg not implemented
                done();
        });
    });

    it('getReportCfg(permAddr, auxId, attrName, callback) - lsn', function (done) {
        var p = '0x1234',
            aux = 3,
            cfg = {};

        // [TODO] should test with implementation
        nc.getReportCfg(p, aux, 'x', function (err, da) {
            if (err)    // exec not implemented
                done();
        });
    });

});
