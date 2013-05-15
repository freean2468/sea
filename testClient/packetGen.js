var fs = require('fs');
var protocol = require('./protocol').protocol;
var protocolList = require('./protocol').list;

var packetContents = fs.readFileSync('./packet.js', {encoding: 'utf8'});
var packet = {
	body: '',
	tail: '',
};

for (var i = 0; i < protocolList.length; ++i) {
	var startMark = 'var ' + protocolList[i];
	var start = packetContents.search(startMark);

	if (start === -1) {
		packet['body'] += 'var ' + protocolList[i] + '= {' + '\n'
					+ '\t' + 'id: ' + protocol[protocolList[i]] + ',' + '\n'
					+ '}; // end ' + protocolList[i] + '\n'
					+ '\n'
					;
	} 
	else {
		var endMark = 'end '+protocolList[i];
		var end = packetContents.search(endMark);
		
		packet['body'] += packetContents.slice(start, end)
					+ packetContents.slice(end, end+endMark.length) + '\n'
					+ '\n'
					;
	}

	packet['tail'] += 'exports.' + protocolList[i] + ' = ' + protocolList[i] + ';' + '\n'
					;
}

var file = 'packet.js';
var output = packet['body']+packet['tail'];

fs.writeFile(file, output, function (err) {
	if (err) {
		console.log(err);
		throw err;
	}
	console.log(file+' file is maded.');
});
