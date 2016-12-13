var EventEmitter = require('events'),
    util = require('util'),
    Device = require('../lib/device.js'),
    Gadget = require('../lib/gadget.js'),
    Netcore = require('../lib/netcore.js');

var _ = require('busyman'),
    expect = require('chai').expect,
    chance = require('chance').Chance();

// mock freebird
var fb = Object.create(new EventEmitter());

// mock controller
var cntrl = Object.create(new EventEmitter());
var nc = new Netcore('mync', cntrl, { phy: 'myphy', nwk: 'mynwk' }, {});

nc._cookRawDev = function(dev, rawDev, callback) {
    dev.set('net', {
        role: chance.string({ length: 5, pool: 'abcdefghijklmnopqrstuvwxyz' }),
        parent: '0x' + chance.string({ pool: '0123456789ABCDEF', length: 16 }),
        maySleep: chance.bool(),
        sleepPeriod: 30,
        status: 'unknown',
        address: {              // {RPT}
            permanent: rawDev.permAddr,
            dynamic: rawDev.dynAddr
        }
    });

    dev.set('attrs', {
        manufacturer: rawDev.manuf,
        model: rawDev.attrs.model,
        version: {
            hw: rawDev.attrs.hwVer,
            sw: rawDev.attrs.swVer,
            fw: rawDev.firm
        },
        power: {
            type: undefined,
            voltage: '5v'
        }
    });

    callback(null, dev);
};

nc._cookRawGad = function(gad, rawGad, callback) {
    gad.set('panel', {
        profile: rawGad.devId < 2 ? 'HA' : 'SE',
        classId: 'test'
    });

    gad.set('attrs', rawGad.attrs);

    callback(null, gad);
};

// mock drivers
nc.registerNetDrivers({
    start: function (cb) { return cb(null); },
    stop: function (cb) { return cb(null); },
    reset: function (mode, cb) { 
        return cb(null, mode);
    },
    permitJoin: function (duration, cb) { return cb(null, duration); },
    remove: function (permAddr, cb) { return cb(null, permAddr);  },
    ping: function (permAddr, cb) { return cb(null, 10); },
    ban: function (permAddr, cb) { return cb(null, 'ban'); },
    unban: function (permAddr, cb) { return cb(null, 'unban'); }
});

nc.registerDevDrivers({
    read: function (permAddr, attr, cb) { return cb(null, 'read'); },
    write: function (permAddr, attr, val, cb) { return cb(null, 'written'); },
    identify: function (permAddr, cb) { return cb(null, 'identify'); },
});

nc.registerGadDrivers({
    read: function (permAddr, auxId, attr, cb) { return cb(null, 'read'); },
    write: function (permAddr, auxId, attr, val, cb) { return cb(null, 'written'); },
    exec: function (permAddr, auxId, attr, args, cb) { return cb(null, 'exec'); },
    writeReportCfg: function (permAddr, auxId, attr, cfg, cb) { return cb(null, 'reportcfg'); },
    readReportCfg: function (permAddr, auxId, attr, cb) { return cb(null, 'reportcfg'); }
});

// registered to freebird
nc._freebird = fb;
nc.start(function () {});

describe('Device tests', function () {
    var rawDev1 = mockDevGen();
    var dev1 = new Device(nc, rawDev1);
    var rawGad1 = mockGadGen();
    var gad1 = new Gadget(dev1, rawGad1.auxId, rawGad1);
    var rawGad2 = mockGadGen();
    var gad2 = new Gadget(dev1, rawGad2.auxId, rawGad2);

    nc.cookRawDev(dev1, rawDev1, function () {});
    nc.cookRawGad(gad1, rawGad1, function () {});

    describe('#Availability test', function () {
        it('should be enabled', function () {
            expect(dev1.isEnabled()).to.be.equal(false);
            dev1.enable();
            expect(dev1.isEnabled()).to.be.equal(true);
            expect(dev1.isEnabled()).to.be.equal(true);
        });

        it('should be disabled', function () {
            dev1.disable();
            expect(dev1.isEnabled()).to.be.equal(false);
            expect(dev1.isRegistered()).to.be.equal(false);
        });

        it('should be registered', function () {
            dev1._id = 3;
            expect(dev1.isRegistered()).to.be.equal(true);
            dev1._id = null;
            expect(dev1.isEnabled()).to.be.equal(false);
            dev1.enable();
            expect(dev1.isEnabled()).to.be.equal(true);
        });
    });

    describe('#Getter test', function () {
        it('should get netcore', function () {
            expect(dev1.get('netcore')).to.be.equal(nc);
            // expect(dev1.get('nc')).to.be.equal(nc);
        });

        it('should get raw dev', function () {
            expect(dev1.get('raw')).to.be.equal(rawDev1);
            // expect(dev1.get('rawDev')).to.be.equal(rawDev1);
        });

        it('should get dev id', function () {
            expect(dev1.get('id')).to.be.equal(null);
        });

        it('should get gadget table', function () {
            expect(dev1.get('gadTable')).be.deep.equal([ { gadId: null, auxId: gad1.get('auxId') }, { gadId: null, auxId: gad2.get('auxId') } ]);
        });

        it('should get address object', function () {
            expect(dev1.get('address')).to.be.deep.equal({ permanent: rawDev1.permAddr, dynamic: rawDev1.dynAddr });
        });

        it('should get permanent address', function () {
            expect(dev1.get('permAddr')).to.be.equal(rawDev1.permAddr);
        });

        it('should get dynamic address', function () {
            expect(dev1.get('dynAddr')).to.be.equal(rawDev1.dynAddr);
        });

        it('should get unkown status', function () {
            expect(dev1.get('status')).to.be.equal('unknown');
        });

        it('should get 0 traffic', function () {
            expect(dev1.get('traffic')).to.be.deep.equal({
                in: { hits: 0, bytes: 0 },
                out: { hits: 0, bytes: 0 }
            });

            dev1._net.traffic.out.hits = 1;
            dev1._net.traffic.out.bytes = 20;
            expect(dev1.get('traffic', 'in')).be.eql({ hits: 0, bytes: 0 });
            expect(dev1.get('traffic', 'out')).be.eql({ hits: 1, bytes: 20 });

            dev1._net.traffic.out.hits = 0;
            dev1._net.traffic.out.bytes = 0;
        });

        it('should get network informaiton', function () {
            expect(dev1.get('net')).be.deep.equal({
                enabled: dev1.isEnabled(),
                joinTime: null,
                timestamp: null,
                traffic: {
                    in: { hits: 0, bytes: 0 },
                    out: { hits: 0, bytes: 0 }
                },
                role: dev1._net.role,
                parent: dev1._net.parent,
                maySleep: dev1._net.maySleep,
                sleepPeriod: 30,
                status: 'unknown',
                address: {
                    permanent: rawDev1.permAddr,
                    dynamic: rawDev1.dynAddr
                }
            });

            expect(dev1.get('net', 'role')).to.be.deep.equal({ role: dev1._net.role });
            expect(dev1.get('net', [ 'role', 'sleepPeriod', 'address' ])).to.be.deep.equal({
                role: dev1._net.role,
                sleepPeriod: 30,
                address: {
                    permanent: rawDev1.permAddr,
                    dynamic: rawDev1.dynAddr
                }
            });
        });

        it('should get props', function () {
            expect(dev1.get('props')).to.be.deep.equal({
                name: '', 
                description: '',
                location: ''
            });

            expect(dev1.get('props', 'name')).to.be.deep.equal({
                name: ''
            });

            expect(dev1.get('props', ['description', 'name'])).to.be.deep.equal({
                name: '', 
                description: ''
            });
        });

        it('should get attrs', function () {
            expect(dev1.get('attrs')).to.be.deep.equal({
                manufacturer: rawDev1.manuf,
                model: rawDev1.attrs.model,
                serial: '',
                version: {
                    hw: rawDev1.attrs.hwVer,
                    sw: rawDev1.attrs.swVer,
                    fw: rawDev1.firm
                },
                power: {
                    type: '',
                    voltage: '5v'
                }
            });

            expect(dev1.get('attrs', 'model')).to.be.deep.equal({
                model: rawDev1.attrs.model,
            });

            expect(dev1.get('attrs', ['manufacturer', 'version' ])).to.be.deep.equal({
                manufacturer: rawDev1.manuf,
                version: {
                    hw: rawDev1.attrs.hwVer,
                    sw: rawDev1.attrs.swVer,
                    fw: rawDev1.firm
                }
            });
        });
    });

    describe('#Setter test', function () {
        it('should set net info properly', function () {
            expect(dev1.set('net', { role: 'x', address: { dynamic: '1234' } })).to.be.deep.equal(dev1);
            expect(dev1.get('net', ['role', 'address'])).to.be.deep.equal({ role: 'x', address: { permanent: rawDev1.permAddr, dynamic: '1234' } });
        });

        it('should set props properly', function () {
            expect(dev1.set('props', { name: 'myname', location: 'room1' })).to.be.deep.equal(dev1);
            expect(dev1.get('props', [ 'name', 'location'])).to.be.deep.equal({ name: 'myname', location: 'room1' });
        });

        it('should set attrs properly', function () {
            expect(dev1.set('attrs', { manufacturer: 'sivann', power: { type: 'dc' } })).to.be.deep.equal(dev1);
            expect(dev1.get('attrs', [ 'manufacturer', 'power'])).to.be.deep.equal({ manufacturer: 'sivann', power: { type: 'dc', voltage: '5v' } });
        });
    });

    describe('#Traffic test', function () {
        it('should increase out bytes', function () {
            expect(dev1._accumulateBytes('out', 18)).to.be.equal(18);
        });

        it('should increase in bytes', function () {
            expect(dev1._accumulateBytes('in', 31)).to.be.equal(31);
        });

        it('should reset out traffic', function () {
            expect(dev1.get('traffic', 'out')).to.be.deep.equal({ hits: 1, bytes: 18 });
            expect(dev1.resetTraffic('out')).to.be.equal(dev1);
            expect(dev1.get('traffic', 'out')).to.be.deep.equal({ hits: 0, bytes: 0 });
        });

        it('should reset in traffic', function () {
            expect(dev1.get('traffic', 'in')).to.be.deep.equal({ hits: 1, bytes: 31 });
            expect(dev1.resetTraffic('in')).to.be.equal(dev1);
            expect(dev1.get('traffic', 'in')).to.be.deep.equal({ hits: 0, bytes: 0 });
        });
    });

    describe('#Dump test', function () {
        it('should dump properly', function () {
            expect(dev1.dump()).to.be.deep.equal({
                netcore: nc.getName(),
                id: dev1.get('id'),
                gads: dev1.get('gadTable'),
                net: dev1.get('net'),
                props: dev1.get('props'),
                attrs: dev1.get('attrs')
            });
        });
    });

    describe('#_fire test', function () {
        it('should fire properly', function (done) {
            dev1._id = 3;   // assume registered to freebird

            fb.once('noevt', function (d) {
                if (d.x === 'faa') {
                    done();
                }
            });

            expect(dev1._fire('noevt', { x: 'faa' })).to.be.true;
            dev1._id = null;
        });
    });

    describe('#_poke test', function () {
        it('should poke properly', function () {
            expect(dev1._poke()).to.be.equal(dev1);
            expect(dev1.get('net', 'timestamp')).to.be.deep.equal({ timestamp: dev1._net.timestamp });
        });
    });

    describe('#Gadget link/unlink tests', function () {
        it('should link properly', function () {
            expect(dev1._linkGad('xxx')).to.be.deep.equal({ gadId: null, auxId: 'xxx' });
        });

        it('should unlink properly', function () {
            dev1._gads[2].gadId = 5;
            expect(dev1._unlinkGad(5, 'xxx')).to.be.deep.equal({ gadId: 5, auxId: 'xxx' });
        });
    });

    describe('#Driver tests', function () {
        it('should read properly', function (done) {
            dev1.read('xx', function (err, r) {
                if (!err && r === 'read')
                    done();
            });
        });

        it('should write properly', function (done) {
            dev1.write('xx', 3, function (err, r) {
                if (!err && r === 'written')
                    done();
            });
        });

        it('should identify properly', function (done) {
            dev1.identify(function (err, r) {
                if (!err && r === 'identify')
                    done();
            });
        });

        it('should ping properly', function (done) {
            dev1.ping(function (err, r) {
                if (!err && r === 10)
                    done();
            });
        });
    });

    describe('#Event tests', function () {
        it('should receive _dev:netChanged event when disable()', function (done) {
            dev1._id = 3;   // registered

            fb.once('_dev:netChanged', function (d) {
                if (d.data.enabled === false)
                    done();
            });
            dev1.disable();
        });

        it('should receive _dev:netChanged event when enable()', function (done) {
            fb.once('_dev:netChanged', function (d) {
                if (d.data.enabled === true)
                    done();
            });
            dev1.enable();
        });

        it('should receive _dev:netChanged event when set("net") #1', function (done) {
            fb.once('_dev:netChanged', function (d) {
                if (d.data.status === 'online')
                    done();
            });
            dev1.set('net', { status: 'online' });
        });

        it('should receive _dev:netChanged event when set("net") #2', function (done) {
            fb.once('_dev:netChanged', function (d) {
                if (d.data.role === 'hi' && d.data.address.dynamic === '12345')
                    done();
            });
            dev1.set('net', { role: 'hi', address: { dynamic: '12345' } });
        });

        it('should receive _dev:netChanged event when set("net") #3', function (done) {
            fb.once('_dev:netChanged', function (d) {
                if (d.data.address.dynamic === '54321')
                    done();
            });
            dev1.set('net', { role: 'hi', address: { dynamic: '54321' } });
        });

        it('should receive _dev:propsChanged event when set("props") #1', function (done) {
            fb.once('_dev:propsChanged', function (d) {
                if (d.data.name === 'yo')
                    done();
            });
            dev1.set('props', { name: 'yo' });
        });

        it('should receive _dev:propsChanged event when set("props") #2', function (done) {
            fb.once('_dev:propsChanged', function (d) {
                if (d.data.name === 'hi' && d.data.location === 'nowhere')
                    done();
            });
            dev1.set('props', { name: 'hi', location: 'nowhere' });
        });

        it('should receive _dev:propsChanged event when set("props") #3', function (done) {
            fb.once('_dev:propsChanged', function (d) {
                if (d.data.location === 'here')
                    done();
            });
            dev1.set('props', { name: 'hi', location: 'here' });
        });

        it('should receive _dev:attrsChanged event when set("attrs") #1', function (done) {
            fb.once('_dev:attrsChanged', function (d) {
                if (d.data.manufacturer === 'yo')
                    done();
            });

            dev1.set('attrs', { manufacturer: 'yo' });
        });

        it('should receive _dev:attrsChanged event when set("attrs") #2', function (done) {
            fb.once('_dev:attrsChanged', function (d) {
                if (d.data.manufacturer === 'hi' && d.data.version.hw === 'v1')
                    done();
            });
            dev1.set('attrs', { manufacturer: 'hi', version: { hw: 'v1' } });
        });

        it('should receive _dev:attrsChanged event when set("attrs") #3', function (done) {
            fb.once('_dev:attrsChanged', function (d) {
                if (d.data.version.hw === 'v2')
                    done();
            });
            dev1.set('attrs', { manufacturer: 'hi', version: { hw: 'v2' } });
        });

        it('should receive _dev:netChanged event when resetTraffic("out")', function (done) {
            fb.once('_dev:netChanged', function (d) {
                if (d.data.traffic.out.hits === 0 && d.data.traffic.out.bytes === 0)
                    done();
            });
            dev1.resetTraffic('out');
        });

        it('should receive _dev:netChanged event when resetTraffic("in")', function (done) {
            fb.once('_dev:netChanged', function (d) {
                if (d.data.traffic.in.hits === 0 && d.data.traffic.in.bytes === 0)
                    done();
            });

            dev1.resetTraffic('in');
        });
    });
});

describe('Gadget tests', function () {
    var rawDev1 = mockDevGen();
    var dev1 = new Device(nc, rawDev1);
    var rawGad1 = mockGadGen();
    var gad1 = new Gadget(dev1, rawGad1.auxId, rawGad1);
    var rawGad2 = mockGadGen();
    var gad2 = new Gadget(dev1, rawGad2.auxId, rawGad2);

    nc.cookRawDev(dev1, rawDev1, function () {});
    nc.cookRawGad(gad1, rawGad1, function () {});

    dev1.enable();

    describe('#Availability test', function () {
        it('should be enabled', function () {
            expect(gad1.isEnabled()).to.be.equal(false);
            expect(gad1.enable()).to.be.equal(gad1);
            expect(gad1.isEnabled()).to.be.equal(true);
        });

        it('should be disabled', function () {
            expect(gad1.isEnabled()).to.be.equal(true);
            expect(gad1.disable()).to.be.equal(gad1);
            expect(gad1.isEnabled()).to.be.equal(false);
        });

        it('should be registered', function () {
            expect(gad1.isRegistered()).to.be.equal(false);
            gad1._id = 3;
            expect(gad1.isRegistered()).to.be.equal(true);
            gad1._id = null;
            expect(gad1.isRegistered()).to.be.equal(false);
        });
    });

    describe('#Getter tests', function () {
        it('should get gadget id', function () {
            expect(gad1.get('id')).to.be.equal(null);
            gad1._id = 3;
            expect(gad1.get('id')).to.be.equal(3);
            gad1._id = null;
            expect(gad1.get('id')).to.be.equal(null);
        });

        it('should get device', function () {
            // expect(gad1.get('dev')).to.be.equal(dev1);
            // expect(gad2.get('dev')).to.be.equal(dev1);
            expect(gad1.get('device')).to.be.equal(dev1);
            expect(gad2.get('device')).to.be.equal(dev1);
        });

        it('should get raw gadget', function () {
            expect(gad1.get('raw')).to.be.equal(rawGad1);
            expect(gad2.get('raw')).to.be.equal(rawGad2);
            // expect(gad1.get('rawGad')).to.be.equal(rawGad1);
            // expect(gad2.get('rawGad')).to.be.equal(rawGad2);
        });

        it('should get permanent address', function () {
            expect(gad1.get('permAddr')).to.be.equal(dev1.get('permAddr'));
        });

        it('should get dynamic address', function () {
            expect(gad1.get('dynAddr')).to.be.equal(dev1.get('dynAddr'));
        });

        it('should get auxId', function () {
            expect(gad1.get('auxId')).to.be.equal(rawGad1.auxId);
            expect(gad2.get('auxId')).to.be.equal(rawGad2.auxId);
        });

        it('should get netcore', function () {
            expect(gad1.get('netcore')).to.be.equal(nc);
            expect(gad2.get('netcore')).to.be.equal(nc);
            // expect(gad1.get('nc')).to.be.equal(nc);
            // expect(gad2.get('nc')).to.be.equal(nc);
        });

        it('should get location', function () {
            dev1.set('props', { location: 'myhome' });
            expect(gad1.get('location')).to.be.equal(dev1.get('props', 'location').location);
            expect(gad2.get('location')).to.be.equal(dev1.get('props', 'location').location);
        });

        it('should get panel information #1', function () {
            expect(gad1.get('panel')).to.be.deep.equal({ profile: gad1._panel.profile, classId: 'test', enabled: false });
        });

        it('should get panel information #2', function () {
            expect(gad1.get('panel', 'classId')).to.be.deep.equal({ classId: 'test' });
        });

        it('should get props #1', function () {
            expect(gad1.get('props')).to.be.deep.equal({ name: 'unknown', description: ''});
        });

        it('should get props #2', function () {
            expect(gad1.get('props', 'name')).to.be.deep.equal({ name: 'unknown' });
        });

        it('should get attrs', function () {
            expect(gad1.get('attrs')).to.be.deep.equal(rawGad1.attrs);
        });
    });

    describe('#Setter tests', function () {
        it('should set panel properly', function () {
            expect(gad1.set('panel', { classId: 'test2' })).to.be.equal(gad1);
            expect(gad1.get('panel', 'classId')).to.be.deep.equal({ classId: 'test2' });

            expect(gad1.set('panel', { classId: 'test2', profile: 'M' })).to.be.equal(gad1);
            expect(gad1.get('panel', [ 'classId', 'profile' ])).to.be.deep.equal({ classId: 'test2', profile: 'M' });
        });

        it('should set props properly', function () {
            expect(gad1.set('props', { name: 'test2' })).to.be.equal(gad1);
            expect(gad1.get('props', 'name')).to.be.deep.equal({ name: 'test2' });

            expect(gad1.set('props', { name: 'test2', description: 'hihi' })).to.be.equal(gad1);
            expect(gad1.get('props', [ 'name', 'description' ])).to.be.deep.equal({ name: 'test2', description: 'hihi' });
        });

        it('should set attrs properly', function () {
            expect(gad1.set('attrs', { name: 'test2' })).to.be.equal(gad1);
            expect(gad1.get('attrs', 'name')).to.be.deep.equal({ name: 'test2' });

            expect(gad1.set('attrs', { name: 'test2', description: 'hihi' })).to.be.equal(gad1);
            expect(gad1.get('attrs', [ 'name', 'description' ])).to.be.deep.equal({ name: 'test2', description: 'hihi' });
        });
    });

    describe('#Deump test', function () {
        it('dump()', function () {
            expect(gad1.dump()).to.be.deep.equal({
                id: gad1.get('id'),
                netcore: gad1.get('device').get('netcore').getName(),
                dev: {
                    id: gad1.get('device').get('id'),
                    permAddr: gad1.get('permAddr')
                },
                auxId: gad1.get('auxId'),
                panel: gad1.get('panel'),
                props: gad1.get('props'),
                attrs: gad1.get('attrs')
            });
        });
    });

    describe('#Driver tests', function () {
        it('should read properly', function (done) {
            gad1.enable();
            gad1.read('P', function (err, d) {
                if (d === 'read')
                    done();
            });
        });

        it('should write properly', function (done) {
            gad1.write('x', 'x', function (err, d) {
                if (d === 'written')
                    done();
            });
        });

        it('should exec properly', function (done) {
            gad1.exec('x', ['x'], function (err, d) {
                if (d === 'exec')
                    done();
            });
        });

        it('should writeReportCfg properly', function (done) {
            gad1.writeReportCfg('x', {}, function (err, d) {
                if (d === 'reportcfg')
                    done();
            });
        });

        it('should readReportCfg properly', function (done) {
            gad1.readReportCfg('x', function (err, d) {
                if (d === 'reportcfg')
                    done();
            });
        });
    });

    describe('#Event tests', function () {
        it('should receive _gad:panelChanged event when disable()', function (done) {
            fb.on('_gad:panelChanged', function (d) {
                if (d.data.enabled === false && gad1.isEnabled() === false)
                    done();
            });
            gad1._id = 3;   // assume registered
            gad1.disable();
        });

        it('should receive _gad:panelChanged event when enable()', function (done) {
            fb.on('_gad:panelChanged', function (d) {
                if (d.data.enabled === true && gad1.isEnabled() === true)
                    done();
            });
            gad1.enable();
        });

        it('should receive _gad:panelChanged event when set("panel") #1', function (done) {
            fb.on('_gad:panelChanged', function (d) {
                if (d.data.profile === 'hi')
                    done();
            });
            gad1.set('panel', { profile: 'hi' });
        });

        it('should receive _gad:panelChanged event when set("panel") #2', function (done) {
            fb.on('_gad:panelChanged', function (d) {
                if (d.data.classId === 'hello')
                    done();
            });
            gad1.set('panel', { profile: 'hi', classId: 'hello' });
        });

        it('should receive _gad:propsChanged event when set("props") #1', function (done) {
            fb.on('_gad:propsChanged', function (d) {
                if (d.data.description === 'hi')
                    done();
            });
            gad1.set('props', { description: 'hi' });
        });

        it('should receive _gad:propsChanged event when set("props") #2', function (done) {
            fb.on('_gad:propsChanged', function (d) {
                if (d.data.some === 'yo')
                    done();
            });
            gad1.set('props', { description: 'hi', some: 'yo' });
        });

        it('should receive _gad:attrsChanged event when set("attrs") #1', function (done) {
            fb.on('_gad:attrsChanged', function (d) {
                if (d.data.description === 'hi')
                    done();
            });
            gad1.set('attrs', { description: 'hi' });
        });

        it('should receive _gad:attrsChanged event when set("attrs") #2', function (done) {
            gad1._attrs.x = 'hello';
            fb.on('_gad:attrsChanged', function (d) {
                if (d.data.x === 'hi')
                    done();
            });
            gad1.set('attrs', { x: 'hi' });
        });
    });
});

/*************************************************************************************************/
/*** Utilities                                                                                 ***/
/*************************************************************************************************/
function mockDevGen() {
    var name = chance.string({ length: 5, pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' }),
        permAddr = '0x' + chance.string({ pool: '0123456789ABCDEF', length: 16 }),
        dynAddr = chance.integer({ min: 1, max: 255 }) + '.' + chance.integer({ min: 0, max: 255 }) + '.' + chance.integer({ min: 0, max: 255 }) + '.' + chance.integer({ min: 1, max: 255 }),
        manuf = 'manuf_' + chance.string({ length: 3, pool: 'abcdefgh' }),
        model = 'm_' + chance.string({ length: 4, pool: 'abcdefgh' }) + chance.string({ pool: '0123456789', length: 4 }),
        hwVer = 'v' + chance.integer({ min: 0, max: 9 }) + '.' + chance.integer({ min: 0, max: 9 }) + '.' + chance.integer({ min: 0, max: 9 }),
        swVer = 'v' + chance.integer({ min: 0, max: 9 }) + '.' + chance.integer({ min: 0, max: 9 }) + '.' + chance.integer({ min: 0, max: 9 }),
        fwVer = 'v' + chance.integer({ min: 0, max: 9 }) + '.' + chance.integer({ min: 0, max: 9 }) + '.' + chance.integer({ min: 0, max: 9 });

    return {
        name: name,
        permAddr: permAddr,
        dynAddr: dynAddr,
        manuf: manuf,
        firm: fwVer,
        attrs: {
            model: model,
            hwVer: hwVer,
            swVer: swVer
        }
    };
}

function mockGadGen() {
    var attrs = {},
        mockKey,
        mockVal,
        mockKeyLen,
        attrsNo = chance.integer({ min: 1, max: 10 });

    for (var i = 0; i < attrsNo; i++) {
        mockKeyLen = chance.integer({ min: 1, max: 5 });
        mockKey = chance.string({ length: mockKeyLen, pool: 'abcdefghijklmnopqrstuvwxyz'});
        mockVal = mockKeyLen < 3 ? chance.string({ length: 5-mockKeyLen, pool: 'abcdefghijklmnopqrstuvwxyz'}) : chance.integer({ min: 1, max: 500 });
        attrs[mockKey] = mockVal;
    }

    return {
        profileId: chance.integer({ min: 1, max: 10 }),
        devId: chance.integer({ min: 0, max: 100 }),
        auxId: chance.integer({ min: 1, max: 100 }),
        attrs : attrs
    };
}
