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

var output = '';
var tail = '';

output += "var mysql = require('./protocolHandler_MySQL');" + '\n'
		+ "var mongodb = require('./protocolHandler_MongoDB');" + '\n'
		+ "var options = {MYSQL: 1, MONGODB: 2};" + '\n'
		+ "var flags = options['MYSQL'] /*+ options['MONGODB']*/;" + '\n'
		+ '\n'
		;

for (var i = 0; i < protocolInfoList.length; ++i) {
	for (var j = 0; j < protocolInfoList[i].list.length; ++j) {
		output += "function "+protocolInfoList[i].list[j]+"Handler(response, data) {"+'\n'
				+ '\t' + "if (flags & options['MYSQL']) mysql."+protocolInfoList[i].list[j]+"Handler(response, data);"+'\n'
				+ '\t' + "if (flags & options['MONGODB']) mongodb."+protocolInfoList[i].list[j]+"Handler(response, data);"+'\n'
				+ "}"+'\n'
				+ '\n'
				;

		tail += 'exports.' + protocolInfoList[i].list[j] + 'Handler = ' + protocolInfoList[i].list[j] + 'Handler;' + '\n'
				;
	}
}

output += tail;

fs.writeFile('protocolHandler.js', output, function (err) {
	if (err) throw err;

	console.log('protocolHandler.js file has generated');
});



