var protocols = [
	'ver',
	'c2s',
	's2c',
	'r2g',
	'g2r',
];

var protocolInfoList = [];

for (var i = 0; i < protocols.length; ++i) {
	protocolInfoList.push(require('./' + protocols[i] + 'ProtocolList'));
}

var fs = require('fs');

var handlers = [];

for (var i = 0; i < protocols.length; ++i) {
	handlers.push('');
	for (var j = 0; j < protocolInfoList[i].list.length; ++j) {
		handlers[i] += '\t' + "'" + protocolInfoList[i].protocolId[protocolInfoList[i].list[j]] + "'" + ': protocolHandler.' + protocolInfoList[i].list[j] + 'Handler,' + '\n';
	}
}

for (var i = 0; i < protocols.length; ++i) {
	var output = '';

	output += "var protocolHandler = require('./protocolHandler');" + '\n'
			+ '\n'
			+ "var protocolHandle = {" + '\n'
			+ handlers[i]
			+ '};' + '\n'
			+ '\n'
			+ "exports.protocolHandle = protocolHandle;"
			+ '\n'
			;

	var file = protocols[i] + 'ProtocolHandle.js';

	fs.writeFileSync(file, output);
	
	console.log(file + ' file has generated.');
}

var output = '';

output += "var protocolHandler = require('./protocolHandler');" + '\n'
		+ '\n'
		+ "var protocolHandle = {" + '\n'
		;

var file = '';
var usedProtocolList = [];

process.argv.forEach(function(val, index, array) {
	if (index === 2) {
		file = val;
	}
	
	if (index > 2) {
		usedProtocolList.push(val);
	}
});

for (var i = 0; i < protocols.length; ++i) {
	for (var j = 0; j < usedProtocolList.length; ++j) {
		if (usedProtocolList[j] === protocols[i]) {
			output += handlers[i];
			break;
		}
	}
}

output += '};' + '\n'
		+ '\n'
		+ "exports.protocolHandle = protocolHandle;"
		+ '\n'
		;

file += 'ProtocolHandle.js';

fs.writeFileSync(file, output);

console.log(file + ' file has generated.');

