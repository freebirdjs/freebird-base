var EventEmitter = require('events'),
    util = require('util'),
    should = require('should'),
    Device = require('../lib/device.js'),
    Gadget = require('../lib/gadget.js'),
    _ = require('lodash');

/*************************************************************************************************/
/*** NetCore Mockup Generation                                                                 ***/
/*************************************************************************************************/
var rawDev = {
    name: 'fakeRaw',
    permAddr: '0x12345678',
    dynAddr: '111.222.333.444',
    attrs: {
        manufacturer: 'sivann',
        model: 'm0',
        serial: 's0',
        version: {
            hw: 'v1',
            sw: 'v2',
            fw: 'v3'
        },
        power: {
            type: 'dc',
            voltage: '5v'
        }
    },
    gads: [ { name: 'g1' }, { name: 'g2' } ]
};

var fb = Object.create(new EventEmitter());
// fb = Object.assign(fb, new EventEmitter());
// fb.prototype = EventEmitter.prototype;

fb.on('_dev:error', function (err) {
    console.log(err);
});

var ncMock = {
    _fb: fb,
    _controller: {},
    _net: {
        name: 'mock_nc',
        enabled: false,
        protocol: { phy: 'fake' },
        startTime: 0,
        defaultJoinTime: 180,
        traffic: {
            in: { hits: 0, bytes: 0 },
            out: { hits: 0, bytes: 0 }
        }
    },
    extra: null,
    cookRawDev: null,
    cookRawGad: null,
    _drivers: {},
    _findDriver: function () { return function () {}; },
    getName: function () { return ncMock._net.name; },
    _fbEmit: function (evt, data) {
        var emitData,
            emitted = false,
            isErrEvt = (evt === '_nc:error') || (evt === '_dev:error') || (evt === '_gad:error');

        if (!isErrEvt) {
            data = data || {};
            emitData = _.assign(data, {
                netcore: ncMock
            });
        } else {
            emitData = data.error;
            delete data.error;
            emitData.info =  _.assign(data, {
                netcore: ncMock.getName()
            });
        }

        if (true) {
            this._fb.emit(evt, emitData);
            emitted = true;
        }

        return emitted;
    }
};

var ext = {};
var gadext = {};
var dev = new Device(ncMock, rawDev);

dev.extra = ext;

dev = dev.setNetInfo({
    role: 'fake',
    parent: '0',
    maySleep: false,
    sleepPeriod: 30,
    address: {
        permanent: rawDev.permAddr,
        dynamic: rawDev.dynAddr
    }
});

dev = dev.setAttrs(rawDev.attrs);
dev = dev.setProps({ location: 'home' });
dev._id = 3;
dev.enable();

// Things to be tested
// 1. Gadget Constructor
//    - dev
//    - auxId
//    - other defaults
// 2. Methods Signature check - throw error
// 3. Methods Functionality and Output Check
//    - enable(), disable(), isEnabled(), isRegistered()
//    - getNetcore(), getRawGad(), getId(), getDev(), getPermAddr(), getAuxId(), getLocation(), getPanelInfo(), getProps(), getAttrs(),
//    - setPanelInfo(), setProps(), setAttrs(), dump()
//    - read(), write(), exec(), setReportCfg(), getReportCfg(), _callDriver(), _fbEmit(), _get()

var auxId = 60;
var gad = new Gadget(dev, auxId, rawDev.gads[0]);
gad.extra = gadext;

describe('Constructor Testing', function () {
    var mygad = gad;

    it('Constructor - no args', function () {
        (function () { return new Gadget(); }).should.throw();
    });

    it('Constructor - only dev', function () {
        (function () { return new Gadget(dev); }).should.throw();
    });

    it('Constructor - bad dev', function () {
        (function () { return new Gadget({}, 1); }).should.throw();
    });

    it('Constructor - bad auxId', function () {
        (function () { return new Gadget(dev, []); }).should.throw();
    });

    it('Constructor - valid dev and auxId', function () {
        (function () { return new Gadget(dev, 600); }).should.not.throw();
    });

    it('netcore', function () {
        (mygad.getNetcore()).should.be.equal(ncMock);
    });

    it('raw gad', function () {
        (mygad.getRawGad()).should.be.equal(rawDev.gads[0]);
    });

    it('id', function () {
        should(mygad.getId()).be.null;
    });

    it('extra', function () {
        should(mygad.extra).be.eql(gadext);
    });

    it('getDev', function () {
        mygad.getDev().should.be.equal(dev);
    });

    it('getPermAddr', function () {
        mygad.getPermAddr().should.be.a.String;
        mygad.getPermAddr().should.be.equal(rawDev.permAddr);
    });

    it('getAuxId', function () {
        mygad.getAuxId().should.be.equal(auxId);
    });

    it('getLocation', function () {
        mygad.getLocation().should.be.equal('home');
    });

    it('getPanelInfo', function () {
        mygad.getPanelInfo().should.be.eql({ enabled: false, profile: '', class: '' });
    });

    it('getProps', function () {
        (mygad.getProps()).should.be.eql(mygad._props);
    });

    it('getAttrs', function () {
        (mygad.getAttrs()).should.be.eql(mygad._attrs);
    });

    it('isRegistered', function () {
        mygad.isRegistered().should.be.false();
    });

    it('isRegistered', function () {
        mygad._id = 1;
        mygad.isRegistered().should.be.true();
    });

    it('isEnabled', function () {
        mygad.isEnabled().should.be.false();
    });

    it('isEnabled', function () {
        mygad.enable();
        mygad.isEnabled().should.be.true();
    });

    // test setter in functional tests
    // it('setPanelInfo', function () {
    //     mygad.setPanelInfo({ enabled: true, profile: 'my', class: 'test' }).should.be.equal(mygad);
    //     mygad.getPanelInfo().should.be.eql({ enabled: false, profile: 'my', class: 'test' });
    // });

    // it('setProps', function () {
    //     mygad.setPanelInfo({ enabled: true, profile: 'my', class: 'test' }).should.be.equal(mygad);
    //     mygad.getPanelInfo().should.be.eql({ enabled: false, profile: 'my', class: 'test' });
    // });
});
