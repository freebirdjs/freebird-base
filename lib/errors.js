var util = require('util');

var freebirdErr = {
    // NetMuxError: NetMuxError,
    // FabError: FabError,
    // NetCoreError: NetCoreError,
    // IdError:  IdError,
    // AttrError: AttrError,
    // ApiError: ApiError
};

function FreebirdError (settings, implementationContext) {
    settings = settings || {};
    this.name = 'FreebirdError';

    this.type = (settings.type || 'Freebird.GeneralError');
    this.message = (settings.message || 'An error occurred in freebird framework.');
    this.detail = (settings.detail || '');
    this.extendedInfo = ( settings.extendedInfo || '' );
    this.errorCode = (settings.errorCode || '');
    this.isFreebirdError = true;

     Error.captureStackTrace(this, (implementationContext || FreebirdError));
}

util.inherits(FreebirdError, Error);

// function NetMuxError(message) {
//     return new CoatError({
//         type: 'NetMuxError',
//         message: ( message || '' )
//     });
// }

module.exports = freebirdErr;

// error code
// 0x00 - 0x0F (0 - 15)     web status codes
// 0x10 - 0x1F (16 - 31)

// 0x20 - 0x2F (32 - 47)    netcore error
// 0x30 - 0x3F (48 - 63)
// 0x40 - 0x4F (64 - 79)    device error
// 0x50 - 0x5F (80 - 95)
// 0x60 - 0x6F (96 - 111)   gadget error
// 0x70 - 0x7F (112 - 127)
// 0x80 - 0x8F (128 - 143)  storage error
// 0x90 - 0x9F (144 - 159)
// 0xA0 - 0xAF (160 - 175)
// 0xB0 - 0xBF (176 - 191)
// 0xC0 - 0xCF (192 - 207)
// 0xD0 - 0xDF (208 - 223)
// 0xE0 - 0xEF (224 - 239)
// 0xF0 - 0xFF (240 - 255)

// // netcore
// new Error('Not registered');
// new Error('Not enabled'); dev, gad
// new Error('Driver not found');

// new Error('info should be an object');
// new Error('props should be an object');
// new Error('attrs should be an object');

// new Error('Netcore not enabled.');
// new Error('attrName of read() should be a string.');
// new Error('attrName of write() should be a string.');
// new Error('val of write() should be given.');
// new Error('callback should be a function');

// new Error('dev should be an instance of Device class.');
// new Error('auxId should be a number or a string.');
// new Error('args should be an array')

// new TypeError('space should be a string.');
// new TypeError('Drivers should be wrapped in an object.');
// new TypeError('Every driver should be a function.');
// throw new TypeError('permAddr should be a string.');
// new Error('Mandatory driver(s): ' + badDrvsName + 'not implemented.');
// new Error('cookRawDev() not implemented.');
// new Error('cookRawGad() not implemented.');
// throw new TypeError('duration should be a number in seconds.');
// throw new TypeError('permAddr should be a string.');
// throw new TypeError('args should be an array of parameters.');
// new Error(type + ' driver ' + name + '() not implemented');

// new TypeError(arg + ' should be a string.');
// new TypeError('auxId should be a number or a string.');
// new TypeError(arg + ' should be an object.');
// new TypeError('val should not be a function.');
// new TypeError('val should be given.');
// new TypeError('callback should be a function.');

// new TypeError(arg + ' should be given.');