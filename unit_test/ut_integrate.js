/* jshint node: true */

var EventEmitter = require('events'),
    util = require('util'),
    Device = require('../lib/device.js'),
    Gadget = require('../lib/gadget.js'),
    Netcore = require('../lib/netcore.js');

var _ = require('lodash'),
    should = require('should'),
    chance = require('chance').Chance();

// mock freebird
var fb = Object.create(new EventEmitter());

// mock controller
var cntrl = Object.create(new EventEmitter());
var nc = new Netcore('mync', cntrl, { phy: 'myphy', nwk: 'mynwk' }, {});

nc.cookRawDev = function(dev, rawDev, callback) {
    dev.setNetInfo({
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

    dev.setAttrs({
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

nc.cookRawGad = function(gad, rawGad, callback) {
    gad.setPanelInfo({
        profile: rawGad.devId < 2 ? 'HA' : 'SE',
        classId: 'test'
    });

    gad.setAttrs(rawGad.attrs);

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
    setReportCfg: function (permAddr, auxId, attr, cfg, cb) { return cb(null, 'reportcfg'); },
    getReportCfg: function (permAddr, auxId, attr, cb) { return cb(null, 'reportcfg'); }
});

// registered to freebird
nc._fb = fb;
nc.start();

// var rawDev1 = mockDevGen();
// var dev1 = new Device(nc, rawDev1);
// var rawGad1 = mockGadGen();
// var gad1 = new Gadget(dev1, rawGad1.auxId, rawGad1);

// console.log(dev1.dump());




describe('Device test', function () {
    var rawDev1 = mockDevGen();
    var dev1 = new Device(nc, rawDev1);
    var rawGad1 = mockGadGen();
    var gad1 = new Gadget(dev1, rawGad1.auxId, rawGad1);
    var rawGad2 = mockGadGen();
    var gad2 = new Gadget(dev1, rawGad2.auxId, rawGad2);

    nc.cookRawDev(dev1, rawDev1, function () {});
    nc.cookRawGad(gad1, rawGad1, function () {});

    it('getNetcore()', function () {
        should(dev1.getNetcore()).be.equal(nc);
    });

    it('getRawDev()', function () {
        should(dev1.getRawDev()).be.equal(rawDev1);
    });

    it('getId()', function () {
        should(dev1.getId()).be.eql(null);
    });

    it('getGadTable()', function () {
        should(dev1.getGadTable()).be.eql([ { gadId: null, auxId: gad1.getAuxId() }, { gadId: null, auxId: gad2.getAuxId() } ]);
    });

    it('enable()', function () {
        should(dev1.isEnabled()).be.eql(false);
        dev1.enable();
        should(dev1.isEnabled()).be.eql(true);
    });

    it('disable()', function () {
        should(dev1.isEnabled()).be.eql(true);
        dev1.disable();
        should(dev1.isEnabled()).be.eql(false);
    });

    it('isRegistered()', function () {
        should(dev1.isRegistered()).be.eql(false);
        dev1._id = 3;
        should(dev1.isRegistered()).be.eql(true);
        dev1._id = null;
    });

    it('isEnabled()', function () {
        should(dev1.isEnabled()).be.eql(false);
        dev1.enable();
        should(dev1.isEnabled()).be.eql(true);
    });

    it('getAddr()', function () {
        should(dev1.getAddr()).be.eql({ permanent: rawDev1.permAddr, dynamic: rawDev1.dynAddr });
    });

    it('getPermAddr()', function () {
        should(dev1.getPermAddr()).be.eql(rawDev1.permAddr);
    });

    it('getStatus()', function () {
        should(dev1.getStatus()).be.eql('unknown');
    });

    it('getTraffic()', function () {
        should(dev1.getTraffic()).be.eql({
            in: { hits: 0, bytes: 0 },
            out: { hits: 0, bytes: 0 }
        });

        dev1._net.traffic.out.hits = 1;
        dev1._net.traffic.out.bytes = 20;
        should(dev1.getTraffic('in')).be.eql({ hits: 0, bytes: 0 });
        should(dev1.getTraffic('out')).be.eql({ hits: 1, bytes: 20 });

        dev1._net.traffic.out.hits = 0;
        dev1._net.traffic.out.bytes = 0;
    });

    it('getNetInfo()', function () {
        should(dev1.getNetInfo()).be.eql({
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
    });

    it('getNetInfo()', function () {
        should(dev1.getNetInfo('role')).be.eql({ role: dev1._net.role });
        should(dev1.getNetInfo([ 'role', 'sleepPeriod', 'address' ])).be.eql({
            role: dev1._net.role,
            sleepPeriod: 30,
            address: {
                permanent: rawDev1.permAddr,
                dynamic: rawDev1.dynAddr
            }
        });
    });

    it('getProps()', function () {
        should(dev1.getProps()).be.eql({
            name: undefined, 
            description: undefined,
            location: undefined
        });

        should(dev1.getProps('name')).be.eql({
            name: undefined
        });

        should(dev1.getProps(['description', 'name'])).be.eql({
            name: undefined, 
            description: undefined
        });
    });

    it('getAttrs()', function () {
        should(dev1.getAttrs()).be.eql({
            manufacturer: rawDev1.manuf,
            model: rawDev1.attrs.model,
            serial: undefined,
            version: {
                hw: rawDev1.attrs.hwVer,
                sw: rawDev1.attrs.swVer,
                fw: rawDev1.firm
            },
            power: {
                type: undefined,
                voltage: '5v'
            }
        });

        should(dev1.getAttrs('model')).be.eql({
            model: rawDev1.attrs.model,
        });

        should(dev1.getAttrs(['manufacturer', 'version' ])).be.eql({
            manufacturer: rawDev1.manuf,
            version: {
                hw: rawDev1.attrs.hwVer,
                sw: rawDev1.attrs.swVer,
                fw: rawDev1.firm
            }
        });
    });

    it('setNetInfo()', function () {
        should(dev1.setNetInfo({ role: 'x', address: { dynamic: '1234' } })).be.equal(dev1);
        should(dev1.getNetInfo(['role', 'address'])).be.eql({ role: 'x', address: { permanent: rawDev1.permAddr, dynamic: '1234' } });
    });

    it('setProps()', function () {
        should(dev1.setProps({ name: 'myname', location: 'room1' })).be.equal(dev1);
        should(dev1.getProps([ 'name', 'location'])).be.eql({ name: 'myname', location: 'room1' });
    });

    it('setAttrs()', function () {
        should(dev1.setAttrs({ manufacturer: 'sivann', power: { type: 'dc' } })).be.equal(dev1);
        should(dev1.getAttrs([ 'manufacturer', 'power'])).be.eql({ manufacturer: 'sivann', power: { type: 'dc', voltage: '5v' } });
    });

    it('_incTxBytes()', function () {
        should(dev1._incTxBytes(18)).be.equal(18);
    });

    it('_incRxBytes()', function () {
        should(dev1._incRxBytes(31)).be.equal(31);
    });

    it('resetTxTraffic()', function () {
        should(dev1.getTraffic('out')).be.eql({ hits: 1, bytes: 18 });
        should(dev1.resetTxTraffic()).be.equal(dev1);
        should(dev1.getTraffic('out')).be.eql({ hits: 0, bytes: 0 });
    });

    it('resetRxTraffic()', function () {
        should(dev1.getTraffic('in')).be.eql({ hits: 1, bytes: 31 });
        should(dev1.resetRxTraffic()).be.equal(dev1);
        should(dev1.getTraffic('in')).be.eql({ hits: 0, bytes: 0 });
    });

    it('dump()', function () {
        should(dev1.dump()).be.eql({
            netcore: nc.getName(),
            id: dev1.getId(),
            gads: dev1.getGadTable(),
            net: dev1.getNetInfo(),
            props: dev1.getProps(),
            attrs: dev1.getAttrs()
        });
    });

    // Ignore
    // it('refresh()', function () {
    //     should(dev1.refresh()).be.eql(dev1);
    //     // yes, it will update. But I pass this test here to avoid mutating data object
    //     // { manufacturer: 'read',
    //     //   model: 'read',
    //     //   serial: 'read',
    //     //   version: 'read',
    //     //   power: 'read' }
    // });

    it('_get(type, keys)', function () {
        should(dev1._get('no', 'faa')).be.eql(undefined);
        should(dev1._get('_net', 'faa')).be.eql({});
        should(dev1._get('_props', 'faa')).be.eql({});
        should(dev1._get('_attrs', 'faa')).be.eql({});
        should(dev1._get('_net', 'enabled')).be.eql({ enabled: true });
        should(dev1._get('_props', 'name')).be.eql({ name: 'myname' });
        should(dev1._get('_attrs', 'model')).be.eql({ model: rawDev1.attrs.model });
    });

    it('_fbEmit(evt, data)', function (done) {
        dev1._id = 3;   // assume registered to freebird

        // console.log(dev1.isRegistered());
        // console.log(dev1.isEnabled());
        // console.log(nc.isRegistered());
        fb.once('noevt', function (d) {
            if (d.x === 'faa') {
                done();
            }
        });

        should(dev1._fbEmit('noevt', { x: 'faa' })).be.eql(true);
        dev1._id = null;
    });

    it('_poke()', function () {
        should(dev1._poke()).be.equal(dev1);
        should(dev1.getNetInfo('timestamp')).be.eql({ timestamp: dev1._net.timestamp });
    });

    it('_incRxBytes()', function () {
        should(dev1._incRxBytes(100)).be.eql(dev1._net.traffic.in.bytes);
        // console.log(dev1._net.traffic.in.bytes);
    });

    it('_incTxBytes()', function () {
        should(dev1._incTxBytes(200)).be.eql(dev1._net.traffic.out.bytes);
        // console.log(dev1._net.traffic.out.bytes);
    });

    it('_findGadRecordByAuxId()', function () {
        should(dev1._findGadRecordByAuxId('xxx')).be.eql(undefined);
        should(dev1._findGadRecordByAuxId(gad1.getAuxId())).be.eql({ gadId: null, auxId: gad1.getAuxId() });
    });

    it('_linkGadWithAuxId()', function () {
        should(dev1._linkGadWithAuxId('xxx')).be.eql({ gadId: null, auxId: 'xxx' });
        should(dev1._findGadRecordByAuxId('xxx')).be.eql({ gadId: null, auxId: 'xxx' });
    });

    // just do read, write... tests
    // it('_callDriver()', function () { });

    it('read()', function (done) {
        dev1.read('xx', function (err, r) {
            // console.log(err);
            // console.log(r);
            if (!err && r === 'read')
                    done();
        });
    });

    it('write()', function (done) {
        dev1.write('xx', 3, function (err, r) {
            // console.log(err);
            // console.log(r);
            if (!err && r === 'written')
                    done();
        });
    });

    it('identify()', function (done) {
        dev1.identify(function (err, r) {
            // console.log(err);
            // console.log(r);
            if (!err && r === 'identify')
                    done();
        });
    });

    it('ping()', function (done) {
        dev1.ping(function (err, r) {
            // console.log(dev1.getNetcore().isEnabled());
            // console.log(err);
            // console.log(r);
            if (!err && r === 10)
                    done();
        });
    });

    it('event check - disable()', function (done) {
        dev1._id = 3;   // registered

        fb.once('_dev:netChanged', function (d) {
            if (d.data.enabled === false)
                done();
        });

        dev1.disable();
    });

    it('event check - enable()', function (done) {
        fb.once('_dev:netChanged', function (d) {
            if (d.data.enabled === true)
                done();
        });

        dev1.enable();
    });

    it('event check - setNetInfo()', function (done) {
        fb.once('_dev:netChanged', function (d) {
            if (d.data.status === 'online')
                done();
        });

        dev1.setNetInfo({ status: 'online' });
    });

    it('event check - setNetInfo()', function (done) {
        fb.once('_dev:netChanged', function (d) {
            if (d.data.role === 'hi' && d.data.address.dynamic === '12345')
                done();
        });

        dev1.setNetInfo({ role: 'hi', address: { dynamic: '12345' } });
    });

    it('event check - setNetInfo()', function (done) {
        fb.once('_dev:netChanged', function (d) {
            if (d.data.address.dynamic === '54321')
                done();
        });

        dev1.setNetInfo({ role: 'hi', address: { dynamic: '54321' } });
    });

    it('event check - setProps()', function (done) {
        fb.once('_dev:propsChanged', function (d) {
            if (d.data.name === 'yo')
                done();
        });

        dev1.setProps({ name: 'yo' });
    });

    it('event check - setProps()', function (done) {
        fb.once('_dev:propsChanged', function (d) {
            if (d.data.name === 'hi' && d.data.location === 'nowhere')
                done();
        });

        dev1.setProps({ name: 'hi', location: 'nowhere' });
    });

    it('event check - setProps()', function (done) {
        fb.once('_dev:propsChanged', function (d) {
            // console.log(d.data);
            if (d.data.location === 'here')
                done();
        });

        dev1.setProps({ name: 'hi', location: 'here' });
    });

    it('event check - setAttrs()', function (done) {
        fb.once('_dev:attrsChanged', function (d) {
            if (d.data.manufacturer === 'yo')
                done();
        });

        dev1.setAttrs({ manufacturer: 'yo' });
    });

    it('event check - setAttrs()', function (done) {
        fb.once('_dev:attrsChanged', function (d) {
            // console.log(d.data);
            if (d.data.manufacturer === 'hi' && d.data.version.hw === 'v1')
                done();
        });

        dev1.setAttrs({ manufacturer: 'hi', version: { hw: 'v1' } });
    });

    it('event check - setAttrs()', function (done) {
        fb.once('_dev:attrsChanged', function (d) {
            // console.log(d.data);
            if (d.data.version.hw === 'v2')
                done();
        });

        dev1.setAttrs({ manufacturer: 'hi', version: { hw: 'v2' } });
    });

    it('event check - resetTxTraffic()', function (done) {
        fb.once('_dev:netChanged', function (d) {
            // console.log(d.data);
            if (d.data.traffic.out.hits === 0 && d.data.traffic.out.bytes === 0)
                done();
        });

        dev1.resetTxTraffic();
    });

    it('event check - resetRxTraffic()', function (done) {
        fb.once('_dev:netChanged', function (d) {
            // console.log(d.data);
            if (d.data.traffic.in.hits === 0 && d.data.traffic.in.bytes === 0)
                done();
        });

        dev1.resetRxTraffic();
    });
});

describe('Gadget test', function () {
    var rawDev1 = mockDevGen();
    var dev1 = new Device(nc, rawDev1);
    var rawGad1 = mockGadGen();
    var gad1 = new Gadget(dev1, rawGad1.auxId, rawGad1);
    var rawGad2 = mockGadGen();
    var gad2 = new Gadget(dev1, rawGad2.auxId, rawGad2);

    nc.cookRawDev(dev1, rawDev1, function () {});
    nc.cookRawGad(gad1, rawGad1, function () {});

    dev1.enable();

    it('enable()', function () {
        should(gad1.isEnabled()).be.equal(false);
        should(gad1.enable()).be.equal(gad1);
        should(gad1.isEnabled()).be.equal(true);
    });

    it('disable()', function () {
        should(gad1.isEnabled()).be.equal(true);
        should(gad1.disable()).be.equal(gad1);
        should(gad1.isEnabled()).be.equal(false);
    });

    it('isRegistered()', function () {
        should(gad1.isRegistered()).be.equal(false);
        gad1._id = 3;
        should(gad1.isRegistered()).be.equal(true);
        gad1._id = null;
        should(gad1.isRegistered()).be.equal(false);
    });

    it('getId()', function () {
        should(gad1.getId()).be.equal(null);
        gad1._id = 3;
        should(gad1.getId()).be.equal(3);
        gad1._id = null;
        should(gad1.getId()).be.equal(null);
    });

    it('getDev()', function () {
        should(gad1.getDev()).be.equal(dev1);
        should(gad2.getDev()).be.equal(dev1);
    });

    it('getRawGad()', function () {
        should(gad1.getRawGad()).be.equal(rawGad1);
        should(gad2.getRawGad()).be.equal(rawGad2);
    });

    it('getPermAddr()', function () {
        // console.log(gad1.getPermAddr());
        should(gad1.getPermAddr()).be.equal(dev1.getPermAddr());
    });

    it('getAuxId()', function () {
        should(gad1.getAuxId()).be.equal(rawGad1.auxId);
        should(gad2.getAuxId()).be.equal(rawGad2.auxId);
    });

    it('getNetcore()', function () {
        should(gad1.getNetcore()).be.equal(nc);
        should(gad2.getNetcore()).be.equal(nc);
    });

    it('getLocation()', function () {
        dev1.setProps({ location: 'myhome' });
        // console.log(gad1.getLocation());
        should(gad1.getLocation()).be.equal(dev1.getProps('location').location);
        should(gad2.getLocation()).be.equal(dev1.getProps('location').location);
    });

    it('getPanelInfo()', function () {
        should(gad1.getPanelInfo()).be.eql({ profile: gad1._panel.profile, classId: 'test', enabled: false });
    });

    it('getPanelInfo()', function () {
        should(gad1.getPanelInfo('classId')).be.eql({ classId: 'test' });
    });

    it('getProps()', function () {
        should(gad1.getProps()).be.eql({ name: 'unknown', description: ''});
    });

    it('getAttrs()', function () {
        // console.log(gad1.getAttrs());
        should(gad1.getAttrs()).be.eql(rawGad1.attrs);
    });

    it('setPanelInfo()', function () {
        should(gad1.setPanelInfo({ classId: 'test2' })).be.equal(gad1);
        should(gad1.getPanelInfo('classId')).be.eql({ classId: 'test2' });

        should(gad1.setPanelInfo({ classId: 'test2', profile: 'M' })).be.equal(gad1);
        should(gad1.getPanelInfo([ 'classId', 'profile' ])).be.eql({ classId: 'test2', profile: 'M' });
    });

    it('setProps()', function () {
        should(gad1.setProps({ name: 'test2' })).be.equal(gad1);
        should(gad1.getProps('name')).be.eql({ name: 'test2' });

        should(gad1.setProps({ name: 'test2', description: 'hihi' })).be.equal(gad1);
        should(gad1.getProps([ 'name', 'description' ])).be.eql({ name: 'test2', description: 'hihi' });
    });

    it('setAttrs()', function () {
        should(gad1.setAttrs({ name: 'test2' })).be.equal(gad1);
        should(gad1.getAttrs('name')).be.eql({ name: 'test2' });

        should(gad1.setAttrs({ name: 'test2', description: 'hihi' })).be.equal(gad1);
        should(gad1.getAttrs([ 'name', 'description' ])).be.eql({ name: 'test2', description: 'hihi' });
    });


    it('dump()', function () {
        should(gad1.dump()).be.eql({
            id: gad1.getId(),
            dev: {
                id: gad1.getDev().getId(),
                permAddr: gad1.getPermAddr()
            },
            auxId: gad1.getAuxId(),
            panel: gad1.getPanelInfo(),
            props: gad1.getProps(),
            attrs: gad1.getAttrs()
        });
    });


    it('read()', function (done) {
        gad1.enable();
        // console.log(gad1.isEnabled());
        gad1.read('P', function (err, d) {
            if (d === 'read')
                done();
        });
    });

    it('write()', function (done) {
        // console.log(gad1.isEnabled());
        gad1.write('x', 'x', function (err, d) {
            if (d === 'written')
                done();
        });
    });

    it('exec()', function (done) {
        // console.log(gad1.isEnabled());
        gad1.exec('x', ['x'], function (err, d) {
            if (d === 'exec')
                done();
        });
    });

    it('setReportCfg()', function (done) {
        // console.log(gad1.isEnabled());
        gad1.setReportCfg('x', {}, function (err, d) {
            if (d === 'reportcfg')
                done();
        });
    });

    it('getReportCfg()', function (done) {
        // console.log(gad1.isEnabled());
        gad1.getReportCfg('x', function (err, d) {
            if (d === 'reportcfg')
                done();
        });
    });


    it('disable() - evt check', function (done) {
        fb.on('_gad:panelChanged', function (d) {
            if (d.data.enabled === false && gad1.isEnabled() === false)
                done();
        });
        gad1._id = 3;   // assume registered
        gad1.disable();
    });

    it('enable() - evt check', function (done) {
        fb.on('_gad:panelChanged', function (d) {
            if (d.data.enabled === true && gad1.isEnabled() === true)
                done();
        });
        gad1.enable();
    });

    it('setPanelInfo() - evt check', function (done) {
        fb.on('_gad:panelChanged', function (d) {
            if (d.data.profile === 'hi')
                done();
        });
        gad1.setPanelInfo({ profile: 'hi' });
    });

    it('setPanelInfo() - evt check', function (done) {
        fb.on('_gad:panelChanged', function (d) {
            if (d.data.classId === 'hello')
                done();
        });
        gad1.setPanelInfo({ profile: 'hi', classId: 'hello' });
    });

    it('setProps() - evt check', function (done) {
        fb.on('_gad:propsChanged', function (d) {
            if (d.data.description === 'hi')
                done();
        });
        gad1.setProps({ description: 'hi' });
    });

    it('setProps() - evt check', function (done) {
        fb.on('_gad:propsChanged', function (d) {
            if (d.data.some === 'yo')
                done();
        });
        gad1.setProps({ description: 'hi', some: 'yo' });
    });

    it('setAttrs() - evt check', function (done) {
        fb.on('_gad:attrsChanged', function (d) {
            if (d.data.description === 'hi')
                done();
        });
        gad1.setAttrs({ description: 'hi' });
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

// power: {
//     type: 'dc',
//     voltage: '5v'
// }
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



// function Device(netcore, rawDev) {
// function Gadget(dev, auxId, rawGad)

// var rawDev1 = mockDevGen();
// var dev1 = new Device(nc, rawDev1);
// var rawGad1 = mockGadGen();
// var gad1 = new Gadget(dev1, rawGad1.auxId, rawGad1);

// console.log(dev1.dump());

// nc.cookRawDev(dev1, rawDev1, function (err, dev) {
//     console.log(dev1.dump());
// });

// nc.cookRawGad(gad1, rawGad1, function (err, gad) {
//     console.log(gad1.dump());
// });