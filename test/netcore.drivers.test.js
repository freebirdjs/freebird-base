var EventEmitter = require('events'),
    util = require('util'),
    expect = require('chai').expect,
    Device = require('../lib/device.js'),
    Gadget = require('../lib/gadget.js'),
    Netcore = require('../lib/netcore.js'),
    _ = require('busyman');

var fb = Object.create(new EventEmitter());

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

    describe('#gadRead()', function () {
        it('should call cb', function (done) {
            var p = '0x1234',
                aux = 3,
                r = {};

            nc.gadRead(p, aux, 'x', function (err, d) {
                if (!err && d === 'read')
                    done();
            });
        });

        it('should receive _nc:gadRead event', function (done) {
            var p = '0x1234',
                aux = 3,
                r = {};
            fb.once('_nc:gadRead', function (d) {
                if (d.permAddr === p && d.auxId === aux && d.data.x === 'read')
                    done();
            });
            nc.gadRead(p, aux, 'x', function () {});
        });
    });

    describe('#gadWrite()', function () {
        it('should call cb', function (done) {
            var p = '0x1234',
                aux = 3,
                r = 33;

            nc.gadWrite(p, aux, 'x', r, function (err, d) {
                if (!err && d === 'written')
                    done();
            });
        });

        it('should receive _nc:gadWrite event', function (done) {
            var p = '0x1234',
                aux = 3,
                r = 33;

            fb.once('_nc:gadWrite', function (d) {
                if (d.permAddr === p && d.auxId === aux && d.data.x === 'written')
                    done();
            });
            nc.gadWrite(p, aux, 'x', r, function () {});
        });
    });

    describe('#gadExec()', function () {
        it('should get erro back [Need to be test with real gadget]', function (done) {
            var p = '0x1234',
                aux = 3,
                r = 33;

            // [TODO] should test with implementation
            nc.gadExec(p, aux, 'x', [ r ], function (err, da) {
                if (err)    // exec not implemented
                    done();
            });
        });
    });

    describe('#writeReportCfg()', function () {
        it('should get erro back [Need to be test with real gadget]', function (done) {
            var p = '0x1234',
                aux = 3,
                cfg = {};

            // [TODO] should test with implementation
            nc.writeReportCfg(p, aux, 'x', cfg, function (err, da) {
                if (err)    // writeReportCfg not implemented
                    done();
            });
        });
    });

    describe('#readReportCfg()', function () {
        it('should get erro back [Need to be test with real gadget]', function (done) {
            var p = '0x1234',
                aux = 3,
                cfg = {};

            // [TODO] should test with implementation
            nc.readReportCfg(p, aux, 'x', function (err, da) {
                if (err)    // exec not implemented
                    done();
            });
        });
    });
});