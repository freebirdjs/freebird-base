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
        ban: function (permAddr, cb) { return cb(null, permAddr); },
        unban: function (permAddr, cb) { return cb(null, permAddr); }
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

});