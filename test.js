var _ = require('lodash');
// var utl = require('lwmqn-util');
var utl = require('./lib/utils');

var net = {
        enabled: true,       // @fb device registered
        joinTime: 3,       // @fb device registered
        timestamp: 100,      // @activity
        traffic: {              // netcore should tackle this at TRX
            in: { hits: 0, bytes: 0 },  // how many messages received, how many bytes received in
            out: { hits: 0, bytes: 0 }, // how many messages transmitted, how many bytes transmitted out
        },
        role: 'router',           // [opt] developer gives
        parent: '0x1234',         // [opt] developer gives, permanent address, '0' for netcore
        maySleep: true,      // [opt] developer gives
        sleepPeriod: 60,    // [opt] seconds
        status: 'online',         // [fb] 'online', 'offline', 'sleep'
        address: {              // developer gives
            permanent: '0xABCD',
            dynamic: '192.168.1.1'
        },
    };

var nnet = {
        enabled: true,       // @fb device registered
        joinTime: 3,       // @fb device registered
        timestamp: 101,      // @activity
        traffic: {              // netcore should tackle this at TRX
            in: { hits: 3, bytes: 0 },  // how many messages received, how many bytes received in
            out: { hits: 0, bytes: 0 }, // how many messages transmitted, how many bytes transmitted out
        },
        role: 'router',           // [opt] developer gives
        parent: '0x1234',         // [opt] developer gives, permanent address, '0' for netcore
        maySleep: true,      // [opt] developer gives
        sleepPeriod: 60,    // [opt] seconds
        status: 'online',         // [fb] 'online', 'offline', 'sleep'
        address: {              // developer gives
            permanent: '0xABCD',
            dynamic: '192.168.1.1'
        },
        hi: { hi1: 1 },
        x: 'hello'
    };

// var x = _.toPairs(net);
var x = utl.buildPathValuePairs(net);
var y = utl.getDevNetDiff(nnet, net);
var z = _.merge(net, y);
var k = utl.getDevNetDiff(nnet, net);
delete y.timestamp;
delete y.traffic;
console.log(net);
console.log(k);
console.log(y);