var EventEmitter = require('events'),
    util = require('util'),
    expect = require('chai').expect,
    Device = require('../lib/device.js'),
    Gadget = require('../lib/gadget.js'),
    Netcore = require('../lib/netcore.js'),
    _ = require('busyman');

var fb = Object.create(new EventEmitter());

var ncname = 'mync';
var controller = {};
var protocol = {
    phy: 'myphy',
    nwk: 'mynwk'
};
var opt = {};

var nc = new Netcore(ncname, controller, protocol, opt);
nc._freebird = fb;

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
    // console.log(err);
});

describe('Drivers test - with optional', function () {
    nc.registerNetDrivers({
        ban: function (permAddr, cb) { return cb(null, 'ban'); },
        unban: function (permAddr, cb) { return cb(null, 'unban'); }
    });

    nc.registerDevDrivers({
        identify: function (permAddr, cb) { return cb(null, 'identify'); },
    });

    nc.registerGadDrivers({
        exec: function (permAddr, auxId, attr, args, cb) { return cb(null, 'exec'); },
        writeReportCfg: function (permAddr, auxId, attr, cfg, cb) { return cb(null, 'reportcfg'); },
        readReportCfg: function (permAddr, auxId, attr, cb) { return cb(null, 'reportcfg'); },
    });

    nc.enable();

    describe('#ban()', function () {
        it('should call cb', function (done) {
            nc.ban('0x1111', function (err, d) {
                if (!err && d === '0x1111')
                    done();
            });
        });

        it('should receive _nc:netBan event', function (done) {
            fb.once('_nc:netBan', function (d) {
                if (d.permAddr === '0x1111')
                    done();
            });
            nc.ban('0x1111', function () {});
        });
    });

    describe('#unban()', function () {
        it('should call cb', function (done) {
            nc.unban('0x1111', function (err, d) {
                if (!err && d === '0x1111')
                    done();
            });
        });

        it('should receive _nc:netUnban event', function (done) {
            fb.once('_nc:netUnban', function (d) {
                if (d.permAddr === '0x1111')
                    done();
            });
            nc.unban('0x1111', function () {});
        });
    });

    describe('#identify()', function () {
        it('should call cb', function (done) {
            nc.identify('0x1111', function (err, d) {
                if (!err && d === 'identify')
                    done();
            });
        });
    });

    describe('#gadExec()', function () {
        it('should call cb', function (done) {
            var p = '0x1234',
                aux = 3,
                r = 33;

            nc.gadExec(p, aux, 'x', [ r ], function (err, da) {
                if (!err && da === 'exec')
                    done();
            });
        });

        it('should receive _nc:gadExec event', function (done) {
            var p = '0x1234',
                aux = 3,
                r = 33;

            fb.once('_nc:gadExec', function (d) {
                if (d.permAddr === p && d.auxId === aux && d.data.x === 'exec')
                    done();
            });

            nc.gadExec(p, aux, 'x', [ r ], function (err, da) {});
        });
    });

    describe('#writeReportCfg()', function () {
        it('should call cb', function (done) {
            var p = '0x1234',
                aux = 3,
                r = {};

            nc.writeReportCfg(p, aux, 'x', r, function (err, da) {
                if (!err && da === 'reportcfg')
                    done();
            });
        });

        it('should receive _nc:gadWriteReportCfg event', function (done) {
            var p = '0x1234',
                aux = 3,
                r = {};

            fb.once('_nc:gadWriteReportCfg', function (d) {
                if (d.permAddr === p && d.auxId === aux && d.data.x === 'reportcfg')
                    done();
            });

            nc.writeReportCfg(p, aux, 'x', r, function (err, da) {});
        });
    });

    describe('#readReportCfg()', function () {
        it('should call cb', function (done) {
            var p = '0x1234',
                aux = 3,
                r = {};

            nc.readReportCfg(p, aux, 'x', function (err, da) {
                if (!err && da === 'reportcfg')
                    done();
            });
        });

        it('should receive _nc:gadReadReportCfg event', function (done) {
            var p = '0x1234',
                aux = 3,
                r = {};

            fb.once('_nc:gadReadReportCfg', function (d) {
                if (d.permAddr === p && d.auxId === aux && d.data.x === 'reportcfg')
                    done();
            });

            nc.readReportCfg(p, aux, 'x', function (err, da) {});
        });
    });
});