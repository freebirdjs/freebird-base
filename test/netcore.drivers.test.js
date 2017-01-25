var EventEmitter = require('events'),
    util = require('util'),
    expect = require('chai').expect,
    Device = require('../lib/device.js'),
    Gadget = require('../lib/gadget.js'),
    Netcore = require('../lib/netcore.js'),
    _ = require('busyman');

var fb = Object.create(new EventEmitter());

fb._fire = function (evt, emitData) {
    fb.emit(evt, emitData);
};
fb.findByNet = function () {};
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

describe('Drivers test', function () {
    describe('#start()', function () {
        it('start(callback) - no _cookRawDev', function () {
            expect(function () { return nc.start(function () {}); }).to.throw(Error);
        });

        it('start(callback) - no _cookRawGad', function () {
            nc._cookRawDev = function () {};
            expect(function () { nc.start(function (err) {}); }).to.throw(Error);
        });

        it('start(callback) - not enable - check enable after', function (done) {
            nc._cookRawGad = function () {};
            nc.start(function (err) {
                if (!err && nc.isEnabled())
                    done();
            });
        });

        it('start(callback) - should receive _nc:started event', function (done) {
            this.timeout(15000);
            fb.once('_nc:started', function () {
                done();
            });
            nc.start(function () {});
        });
    });

    describe('#stop()', function () {
        it('stop(callback) - should receive _nc:stopped event', function (done) {
            fb.once('_nc:stopped', function () {
                done();
            });
            nc.stop(function () {});
        });
    });

    describe('#reset()', function () {
        it('reset(mode, callback) - cb', function (done) {
            nc.enable();
            nc.reset('xxxx', function (err, d) {
                if (!err)
                    done();
            });
        });
    });

    describe('#permitJoin()', function () {
        it('should call cb', function (done) {
            nc.enable();
            nc.permitJoin(20, function (err, d) {
                if (!err && d === 20)
                    done();
            });
        });
    });

    describe('#remove()', function () {
        it('should call cb', function (done) {
            nc.enable();
            nc.remove('0x1111', function (err, d) {
                if (!err && d === '0x1111')
                    done();
            });
        });
    });

    describe('#ban()', function () {
        it('should call cb', function (done) {
            nc.enable();
            nc.ban('0x1111', function (err, d) {
                if (!err && d === '0x1111')
                    done();
            });
        });

        it('should receive _nc:netBan event', function (done) {
            nc.enable();
            fb.once('_nc:netBan', function (d) {
                if (d.permAddr === '0x1111')
                    done();
            });
            nc.ban('0x1111', function () {});
        });
    });

    describe('#unban()', function () {
        it('should call cb', function (done) {
            nc.enable();
            nc.unban('0x1111', function (err, d) {
                if (!err && d === '0x1111')
                    done();
            });
        });

        it('should receive _nc:netUnban event - 0x1111', function (done) {
            nc.enable();
            fb.once('_nc:netUnban', function (d) {
                if (d.permAddr === '0x1111')
                    done();
            });
            nc.unban('0x1111', function () {});
        });

        it('should receive _nc:netUnban event - 0x122221', function (done) {
            nc.enable();
            fb.once('_nc:netUnban', function (d) {
                if (d.permAddr === '0x122221')
                    done();
            });
            nc.unban('0x122221', function () {});
        });
    });

    describe('#ping()', function () {
        it('should call cb', function (done) {
            nc.enable();
            nc.ping('0x1111', function (err, d) {
                if (!err && d === 10)
                    done();
            });
        });

        it('should receive _nc:netUnban event - 0x122221', function (done) {
            nc.enable();
            fb.once('_nc:netPing', function (d) {
                if (d.permAddr === '0x1111' && d.data === 10)
                    done();
            });
            nc.ping('0x1111', function () {});
        });
    });
});