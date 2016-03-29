var EventEmitter = require('events'),
    util = require('util'),
    _ = require('lodash');

var Device = require('device');

function Netcore() {
    this.fb = null;

    this.name = name;
    this.busAttrs = {
        attr: null,
        show: function (nus_type) {},
        store: function (bus_type, buf, count) {}
    };
    this.devAttrs = {};
    this.drvAttrs = {};

    this.match = function (dev, devDrv) {};
    this.uevent = function (dev, uevt_env) {};
    this.probe = function (dev) {};
    this.remove = function (dev) {};

    //----------------------------
    this.cookDevice = null;
    this.cookGadget = null;
}

Netcore.prototype.registerDevice = function (raw) {
    // first find if this device already exists
    var dev = new Device(),
        oldDev;

    dev._netcore = this;
    dev._raw = raw;

    this.cookDevice(raw, dev);

    // already there?
    if (this.fb)
        oldDev = fb.findDevByAddr(dev.address.permanent);

    // how to check changes
    if (oldDev) {
        oldDev._netcore = this;
        oldDev._raw = raw;
        dev = null;         // no need a new one
    } else {
        nc.registerDevice(dev);
    }

    return cooked;
};

Netcore.prototype.registerGadget = function (dev, auxId) {
    var gad = new Gadget(),
        oldGad;

    gad._auxId = auxId;
    gad._owner = dev;

    this.cookGadget(gad);

    // already there?
    if (this.fb)
        oldGad = fb.findGadByAddrAuxId(dev.address.permanent, auxId);

    // how to check changes
    if (oldGad) {
        oldGad._netcore = this;
        oldGad._owner = dev;
        gad = null;         // no need a new one
    } else {
        nc.registerGadget(dev);
    }
};

Netcore.prototype._devDiff = function (o, n) {
    var diff = {};

    o._netcore = null;          // (replace)
    o._netcore = n._netcore;

    o._raw = null;              // (replace)
    o._raw = n._raw;

    // o._id          (old)
    // o._enabled     (old)
    // _gads
    o._maySleep = null;         // (replace)
    o._maySleep = n._maySleep;

    // o._joinTime    (old)
    // o._registered  (old)

    if (o.role !== n.role)      // (replace)   -> diff
        diff.role = o.role = n.role;

    if (o.parent !== n.parent)  // (replace)   -> diff
        diff.parent = o.parent = n.parent;

    if (o.status !== n.status)  // (replace)   -> diff
        diff.status = o.status = n.status;

    // if (o.address.permanent !== n.address.permanent)  // (replace)   -> diff
    //     diff.address = { permanent: null };

    if (o.address.dynamic !== n.address.dynamic)  // (replace)   -> diff
        diff.address = { dynamic: null };

    o.extra = null;         // (replace)
    o.extra = n.extra;



    // attributes =>
    //  (old) name, description, location
    //  (replace) manufacturer, model, serial, version { hw, sw, fmw }, power { type, volatge } -> diff

    if (o.attributes.manufacturer !== n.attributes.manufacturer) {
        diff.attributes = diff.attributes || {};
        diff.attributes.manufacturer = o.attributes.manufacturer = n.attributes.manufacturer;
    }

    if (o.attributes.model !== n.attributes.model) {
        diff.attributes = diff.attributes || {};
        diff.attributes.model = o.attributes.model = n.attributes.model;
    }

    if (o.attributes.serial !== n.attributes.serial) {
        diff.attributes = diff.attributes || {};
        diff.attributes.serial = o.attributes.serial = n.attributes.serial;
    }


    if (o.attributes.version !== n.attributes.version) {
        diff.attributes = diff.attributes || {};
        diff.attributes.version = o.attributes.version = n.attributes.version;
    }

};

// Netcore.prototype.registerDevice = function (dev) {
//     if (this.fb)
//         fb.registerDevice();
// };

// Netcore.prototype.registerGadget = function (gad) {
//     var dev = gad._owner;
//     if (dev)
//         dev.registerGadget(gad);

// };