var protoList = [];

process.argv.forEach(function(val, index, array) {
	if (index > 1) {
		protoList.push(val);
	}
});

var protoIdList = [];

for (var i = 0; i < protoList.length; ++i) {
	protoIdList.push(require('./' + protoList[i] + '-id'));
}

var fs = require('fs');

var handlers = [];

for (var i = 0; i < protoList.length; ++i) {
	handlers.push('');
	for (var j = 0; j < protoIdList[i].list.length; ++j) {
		handlers[i] += '\t' + "'" + protoIdList[i].messageId[protoIdList[i].list[j]] + "'" + ': handler.' + protoIdList[i].list[j] + 'Handler,' + '\n';
	}
}

for (var i = 0; i < protoList.length; ++i) {
	var output = '';

	output += "var handler = require('./" + protoList[i] + "-handler');" + '\n'
			+ '\n'
			+ "var handle = {" + '\n'
			+ handlers[i]
			+ '};' + '\n'
			+ '\n'
			+ "exports.handle = handle;"
			+ '\n'
			;

	var file = protoList[i] + '-handle.js';

	fs.writeFileSync(file, output);	
	console.log(file + ' file has generated.');
}

var file = 'all-handle.js';
var output = '';

output += "var handler = require('./handler');" + '\n'
		+ '\n'
		+ "var handle = {" + '\n'
		;

for (var i = 0; i < protoList.length; ++i) {
	output += handlers[i];
}

output += '};' + '\n'
		+ '\n'
		+ "exports.handle = handle;"
		+ '\n'
		;

fs.writeFileSync(file, output);
console.log(file + ' file has been generated.');
