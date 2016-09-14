var Netcore = require('./lib/netcore.js'),
    Device = require('./lib/device.js'),
    Gadget = require('./lib/gadget.js');

module.exports = {
    Netcore: Netcore,
    Device: Device,
    Gadget: Gadget,
    EVENTS: require('./lib/constants.js').EVENTS,
    createNetcore: function (name, controller, protocol, opt) {
        return new Netcore(name, controller, protocol, opt);
    }
//    Errors: require('./lib/errors.js')    //[TODO]
};
