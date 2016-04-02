var fun1 = function (x1, args) {
    console.log(x1);
    console.log(args);

    var len = args.length;
    var cb = args[len - 1];
    if (typeof cb === 'function')
        cb();
};

var fun2 = function (p1, p2, p3, cb) {
    console.log('arguments');
    console.log(arguments);
    return fun1('hello', arguments);
};

var fun3 = function () 

fun2('p1', 'p2', 'p3', function () {
    console.log('done');
});