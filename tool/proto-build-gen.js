var fs = require('fs');
var protoList = [];

var subject = '';

process.argv.forEach(function(val, index, array) {
	if (index == 2) {
		subject = val;
	}

	if (index > 2) {
		protoList.push(val);
		console.log(val);
	}
});

var head = "var pb = require('protobufjs');" + '\n';
var body = '';
var tail = '';

for (var i = 0; i < protoList.length; ++i) {
	head += 'var ' + protoList[i] + " = pb.protoFromFile('../protocol/" + protoList[i] + ".proto');" + '\n';
}

head += '\n';

var protoIdList = [];

for (var i = 0; i < protoList.length; ++i) {
	protoIdList.push(require('./' + protoList[i] + '-id.js'));

	for (var j = 0; j < protoIdList[i].enumList.length; ++j) {
		var obj = protoIdList[i].enumList[j];

		body += 'var ' + obj + ' = ' + protoList[i] + ".build('" + protoList[i].toUpperCase() + "')." + obj + ';' + '\n';
		tail += 'exports.' + obj + ' = ' + obj + ';' + '\n';
	}

	for (var j = 0; j < protoIdList[i].list.length; ++j) {
		var obj = protoIdList[i].list[j];

		body += 'var ' + obj + ' = ' + protoList[i] + ".build('" + protoList[i].toUpperCase() + "')." + obj + ';' + '\n';
		tail += 'exports.' + obj + ' = ' + obj + ';' + '\n';
	}
}

body += '\n';

var file = subject + '-proto-build.js';

fs.writeFile(file, head + body + tail, function (err) {
	if (err) {
		console.log(err);
		throw err;
	}
	console.log(file + ' file has been generated.');
});
