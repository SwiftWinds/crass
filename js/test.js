var p = require('./grammar');
var objects = require('./objects');

var parser = new p.Parser();
parser.yy = objects;
require('fs').readFile(process.argv[2], function(err, data) {
    if (err) {
        console.error('error', err);
        return;
    }
    var output = parser.parse(data + '');
    // console.log(output.toString().replace(/\}/g, '}\n'));
    console.log(output.optimize().toString().replace(/\}/g, '}\n'));
    // console.log(output.toString());
    // output.optimize();
});
