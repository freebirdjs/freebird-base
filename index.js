var Netcore = require('./lib/netcore.js'),
    Device = require('./lib/device.js'),
    Gadget = require('./lib/gadget.js');

module.exports = {
    Netcore: Netcore,
    Device: Device,
    Gadget: Gadget,
    createNetcore: function (name, controller, protocol, opt) {
        return new Netcore(name, controller, protocol, opt);
    },
    createDevice: function (netcore, rawDev) {
        return new Device(netcore, rawDev);
    },
    createGadget: function (dev, auxId, rawGad) {
        return new Gadget(dev, auxId, rawGad);
    }
};
