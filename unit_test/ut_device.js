var EventEmitter = require('events'),
    util = require('util'),
    should = require('should'),
    Device = require('../lib/device.js'),
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
    }
};

var fb = Object.create(new EventEmitter());
// fb = Object.assign(fb, new EventEmitter());
// fb.prototype = EventEmitter.prototype;

console.log(fb);
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
dev._id = 3;
dev.enable();
// Things to be tested
// 1. Device Constructor
//    - name
//    - other defaults
// 2. Methods Signature check - throw error
// 3. Methods Functionality and Output Check
//    - enable(), disable(), isEnabled(), setId(), getId()
//    - setProperty(), linkGadget(), unlinkGadget(), listGadgets()
//    - getAuxIdByGadId()
//    - joinTime(), upTime()

describe('Constructor Testing', function () {
    var mydev = dev;

    it('netcore', function () {
        (mydev.getNetcore()).should.be.equal(ncMock);
    });

    it('raw device', function () {
        (mydev.getRawDev()).should.be.equal(rawDev);
    });

    it('id', function () {
        should(mydev.getId()).be.null;
    });

    it('extra', function () {
        should(mydev.extra).be.eql(ext);
    });

    it('gadget table', function () {
        mydev.getGadTable().should.be.an.Array;
        (mydev.getGadTable().length).should.be.equal(0);
    });

    it('isRegistered', function () {
        mydev.isRegistered().should.be.true();
    });

    it('isEnabled', function () {
        mydev.isEnabled().should.be.true();
    });

    it('getAddr', function () {
        (mydev.getAddr()).should.be.eql({
            permanent: rawDev.permAddr,
            dynamic: rawDev.dynAddr
        });
    });

    it('getPermAddr', function () {
        (mydev.getPermAddr()).should.be.equal(rawDev.permAddr);
    });

    it('getStatus', function () {
        (mydev.getStatus()).should.be.equal('unknown');
    });

    it('getTraffic', function () {
        (mydev.getTraffic()).should.be.eql(mydev._net.traffic);
    });

    it('getNetInfo', function () {
        (mydev.getNetInfo()).should.be.eql(mydev._net);
    });

    it('getProps', function () {
        (mydev.getProps()).should.be.eql(mydev._props);
    });

    it('getAttrs', function () {
        (mydev.getAttrs()).should.be.eql(mydev._attrs);
    });
});

describe('Check Signature', function () {
    // need check
    // setNetInfo(info), setProps(props), setAttrs(attrs)
    // read(attrName, callback): attrName, cb is optional
    // write(attrName, val, callback)
    // identify(callback), ping(callback)

    // refresh(callback)

    var mydev = dev;
    it('setNetInfo(info)', function () {
        (function () { mydev.setNetInfo(); }).should.throw();
        (function () { mydev.setNetInfo(1); }).should.throw();
        (function () { mydev.setNetInfo([]); }).should.throw();
        (function () { mydev.setNetInfo('xxx'); }).should.throw();
        (function () { mydev.setNetInfo(null); }).should.throw();
        (function () { mydev.setNetInfo({}); }).should.not.throw();
    });

    it('setProps(props)', function () {
        (function () { mydev.setProps(); }).should.throw();
        (function () { mydev.setProps(1); }).should.throw();
        (function () { mydev.setProps([]); }).should.throw();
        (function () { mydev.setProps('xxx'); }).should.throw();
        (function () { mydev.setProps(null); }).should.throw();
        (function () { mydev.setProps({}); }).should.not.throw();
    });

    it('setAttrs(attrs)', function () {
        (function () { mydev.setAttrs(); }).should.throw();
        (function () { mydev.setAttrs(1); }).should.throw();
        (function () { mydev.setAttrs([]); }).should.throw();
        (function () { mydev.setAttrs('xxx'); }).should.throw();
        (function () { mydev.setAttrs(null); }).should.throw();
        (function () { mydev.setAttrs({}); }).should.not.throw();
    });

    it('read(attrName, cb)', function () {
        (function () { mydev.read(function (err) {
            if (err) 
                throw err;
        }); }).should.throw();

        (function () { mydev.read(1, function (err) {
            if (err) 
                throw err;
        }); }).should.throw();

        (function () { mydev.read(1); }).should.throw();

        (function () { mydev.read([], function (err) {
            if (err) 
                throw err;
        }); }).should.throw();

        (function () { mydev.read(null, function (err) {
            if (err) 
                throw err;
        }); }).should.throw();

        (function () { mydev.read({}, function (err) {
            if (err) 
                throw err;
        }); }).should.throw();

        (function () { mydev.read('xxx', function (err) {
            if (err) 
                throw err;
        }); }).should.not.throw();

        // [TOOD] functional
        mydev.disable();
        (function () { return mydev.read('xxx'); }).should.not.throw();

        (function () { mydev.read('xxx', function (err) {
            if (err) 
                throw err;
        }); }).should.throw();

    });

    it('write(attrName, val, cb)', function () {
        (function () { mydev.write(function (err) {
            if (err)
                throw err;
        }); }).should.throw();

        (function () { mydev.write(1, function (err) {
            if (err) 
                throw err;
        }); }).should.throw();

        (function () { mydev.write([], function (err) {
            if (err) 
                throw err;
        }); }).should.throw();

        (function () { mydev.write(null, function (err) {
            if (err) 
                throw err;
        }); }).should.throw();

        (function () { mydev.write({}, function (err) {
            if (err) 
                throw err;
        }); }).should.throw();

        mydev.enable();
        (function () { mydev.write('xxx', 3, function (err) {
            if (err) 
                throw err;
        }); }).should.not.throw();

        (function () { return mydev.write('xxx'); }).should.throw();
        (function () { return mydev.write('xxx', 6); }).should.not.throw();

        mydev.disable();
        (function () { return mydev.write('xxx', 6); }).should.not.throw();

        (function () { mydev.write('xxx', 6, function (err) {
            if (err) 
                throw err;
        }); }).should.throw();
    });


    it('identify(callback)', function () {
        mydev.enable();

        (function () { mydev.identify(function (err) {
            if (err) 
                throw err;
        }); }).should.not.throw();

        (function () { mydev.identify(); }).should.not.throw();

        (function () { mydev.identify('xxx'); }).should.throw();

        mydev.disable();
        (function () { mydev.identify(function (err) {
            if (err) 
                throw err;
        }); }).should.throw();

        (function () { mydev.identify(); }).should.not.throw();
    });

    it('ping(callback)', function () {
        mydev.enable();

        (function () { mydev.ping(function (err) {
            if (err) 
                throw err;
        }); }).should.not.throw();

        (function () { mydev.ping(); }).should.not.throw();

        (function () { mydev.ping('xxx'); }).should.throw();

        mydev.disable();
        (function () { mydev.ping(function (err) {
            if (err) 
                throw err;
        }); }).should.throw();

        (function () { mydev.ping(); }).should.not.throw();
    });
});

// describe('Methods Functionality and Output Check', function () {

// });

// APIs
// enable()
// disable()
// isRegistered()
// isEnabled()
// getters
    // getNetcore()
    // getRawDev()
    // getId()
    // getGadTable()
    // getAddr()
    // getPermAddr()
    // getStatus()
    // getTraffic()
    // getNetInfo(keys)
    // getProps(keys)
    // getAttrs(keys)
    // dump()

// setters
    // setNetInfo(info) v - driver implementor will need
    // setProps(props)  v - driver implementor will need
    // setAttrs(attrs)  v - driver implementor will need
    // resetTxTraffic()
    // resetRxTraffic()

// refresh(callback)

// _get(type, keys)
// _fbEmit(evt, data)
// _poke
// _incTxBytes(num)
// _incRxBytes(num)

// _findGadRecordByAuxId(auxId)
// _linkGadWithAuxId(auxId)

// _callDriver(drvName, args)

// read(attrName, callback)
// write(attrName, val, callback)
// identify(callback)
// ping(callback)
