var EventEmitter = require('events'),
    expect = require('chai').expect;

var Gadget = require('../lib/gadget.js'),
    Device = require('../lib/device.js'),
    Netcore = require('../lib/netcore.js');

var fb = Object.create(new EventEmitter());

fb.findByNet = function () {};
fb.filter = function () { return []; };
fb._fire = function (evt, emitData) {
    fb.emit(evt, emitData);
};

fb.on('_nc:error', function (err) {
    // console.log(err);
});

var ncName = 'mync',
    controller = {},
    opt = {},
    protocol = {
        phy: 'myphy',
        nwk: 'mynwk'
    };

var nc = new Netcore(ncName, controller, protocol, opt),
    dev = new Device(nc, {}),
    gad = new Gadget(dev, 'xxx', {});

nc._freebird = fb;

nc.registerNetDrivers({
    start: function (cb) { return cb(null); },
    stop: function (cb) { return cb(null); },
    reset: function (mode, cb) { return cb(null, mode); },
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

describe('NetDrivers test', function () {
    describe('#start()', function () {
        it('start(callback) - no _cookRawDev', function () {
            expect(function () { return nc.start(function () {}); }).to.throw(Error);
        });

        it('start(callback) - no _cookRawGad', function () {
            nc._cookRawDev = function () {};
            expect(function () { return nc.start(function () {}); }).to.throw(Error);
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
        it('reset(mode, callback) - should call cb', function (done) {
            nc.enable();
            nc.reset('xxxx', function (err) {
                if (!err)
                    done();
            });
        });
    });

    describe('#permitJoin()', function () {
        it('permitJoin(duration, callback) - should call cb', function (done) {
            nc.enable();
            nc.permitJoin(20, function (err, d) {
                if (!err && d === 20)
                    done();
            });
        });
    });

    describe('#remove()', function () {
        it('remove(permAddr, callback) - should call cb', function (done) {
            nc.enable();
            nc.remove('0x1111', function (err, p) {
                if (!err && p === '0x1111')
                    done();
            });
        });
    });

    describe('#ban()', function () {
        it('ban(permAddr, callback) - should call cb', function (done) {
            nc.enable();
            nc.ban('0x1111', function (err, p) {
                if (!err && p === '0x1111')
                    done();
            });
        });

        it('ban(permAddr, callback) - should receive _nc:netBan event', function (done) {
            nc.enable();
            fb.once('_nc:netBan', function (msg) {
                if (msg.permAddr === '0x1111')
                    done();
            });
            nc.ban('0x1111', function () {});
        });
    });

    describe('#unban()', function () {
        it('unban(permAddr, callback) - should call cb', function (done) {
            nc.enable();
            nc.unban('0x1111', function (err, p) {
                if (!err && p === '0x1111')
                    done();
            });
        });

        it('unban(permAddr, callback) - should receive _nc:netUnban event - 0x1111', function (done) {
            nc.enable();
            fb.once('_nc:netUnban', function (msg) {
                if (msg.permAddr === '0x1111')
                    done();
            });
            nc.unban('0x1111', function () {});
        });

        it('unban(permAddr, callback) - should receive _nc:netUnban event - 0x122221', function (done) {
            nc.enable();
            fb.once('_nc:netUnban', function (msg) {
                if (msg.permAddr === '0x122221')
                    done();
            });
            nc.unban('0x122221', function () {});
        });
    });

    describe('#ping()', function () {
        it('ping(permAddr, callback) - should call cb', function (done) {
            nc.enable();
            nc.ping('0x1111', function (err, d) {
                if (!err && d === 10)
                    done();
            });
        });

        it('ping(permAddr, callback) - should receive _nc:netPing event', function (done) {
            nc.enable();
            fb.once('_nc:netPing', function (msg) {
                if (msg.permAddr === '0x1111' && msg.data === 10)
                    done();
            });
            nc.ping('0x1111', function () {});
        });
    });
});

describe('DevDrivers test', function () {
    describe('#read()', function () {
        it('should read properly', function (done) {
            dev.enable();
            dev.read('xx', function (err, r) {
                if (!err && r === 'read')
                    done();
            });
        });
    });

    describe('#write()', function () {
        it('should write properly', function (done) {
            dev.write('xx', 3, function (err, r) {
                if (!err && r === 'written')
                    done();
            });
        });
    });
});

describe('GadDrivers test', function () {
    describe('#read()', function () {
        it('should read properly', function (done) {
            gad.enable();
            gad.read('xx', function (err, r) {
                if (!err && r === 'read')
                    done();
            });
        });
    });

    describe('#write()', function () {
        it('should write properly', function (done) {
            gad.write('xx', 3, function (err, r) {
                if (!err && r === 'written')
                    done();
            });
        });
    });
});
