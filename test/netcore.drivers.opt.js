var EventEmitter = require('events'),
    expect = require('chai').expect;

var Gadget = require('../lib/gadget.js'),
    Device = require('../lib/device.js'),
    Netcore = require('../lib/netcore.js');

var fb = Object.create(new EventEmitter());
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

describe('NetDrivers test - with optional', function () {
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

describe('DevDrivers test - with optional', function () {
    describe('#identify()', function () {
        it('should identify properly', function (done) {
            dev.enable();
            dev.identify(function (err, r) {
                if (!err && r === 'identify')
                    done();
            });
        });
    });
});

describe('GadDrivers test - with optional', function () {
    describe('#exec()', function () {
        it('should exec properly', function (done) {
            gad.enable();
            gad.exec('xx', [], function (err, r) {
                if (!err && r === 'exec')
                    done();
            });
        });
    });

    describe('#writeReportCfg()', function () {
        it('should read properly', function (done) {
            gad.writeReportCfg('xx', {}, function (err, r) {
                if (!err && r === 'reportcfg')
                    done();
            });
        });
    });

    describe('#readReportCfg()', function () {
        it('should read properly', function (done) {
            gad.readReportCfg('xx', function (err, r) {
                if (!err && r === 'reportcfg')
                    done();
            });
        });
    });
});
