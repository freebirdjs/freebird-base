function Gadget(dev, auxId) {

    this._id = null;
    this._dev = dev;
    this._enabled = false;
    this._registered = false;   // register to fb & dev
    this._fb = false;

    this.profile = '';
    this.class = '';
    this.auxId = null;
    this.attrs = {
        name: 'unknown',
        description: ''
        // other kvps
    };
}

Gadget.prototype.getLocation = function () {
    return this._dev.attrs.location;
};

Gadget.prototype.dump = function () {

};

Gadget.prototype.read = function (attrName, callback) {

};

Gadget.prototype.write = function (attrName, val, callback) {

};

Gadget.prototype.exec = function (attrName, args, callback) {

};

Gadget.prototype.setReportCfg = function (attrName, cfg, callback) {

};

Gadget.prototype.getReportCfg = function (attrName, cfg, callback) {

};

Gadget.prototype.get = function () {

};

Gadget.prototype.set = function () {

};

module.exports = Gadget;
