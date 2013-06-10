var fs = require('fs');

var protoFileList = [];

process.argv.forEach(function(val, index, array) {
	if (index >= 2) {
		protoFileList.push(val);
	}
});

function findSth(stream, start, find) {
	var sth = stream.slice(start).search(find);

	return sth;
}

function parse(stream, index) {
	var message = 'message';
	var end = '// end';
	var listOutput = '';
	var output = '';
	var chunks = '';
	var pos = 0;

	var protoFile = '';
	var streamCp = stream;

	var i = 0;
	var msgWithIdList = [];

	while (1) {
		pos = findSth(stream, 0, message);

		if (pos === -1) {
			break;
		}

		var next = pos + message.length;
		pos = findSth(stream, 0, '{');

		var chunk = stream.slice(next+1, pos-1);
		var asciiSerial = '';
		
		for (var j = 0; j < chunk.length; ++j) {
			var code = chunk.charCodeAt(j);
			asciiSerial += String(code);
		}

		var id = hash(asciiSerial);

		if (id < 0) {
			id *= -1;
		}

		msgWithIdList.push({'message': chunk, 'id': id});

		listOutput += '\t\'' + chunk + '\',' + '\n';
		chunks += '\t' + chunk	+ ': ';
		chunks += id + ',';
		chunks += '\n';
		
		stream = stream.slice(pos);

		pos = findSth(stream, 0, end);
		
		stream = stream.slice(pos + end.length);		
	}

	var listVar = 'list';
	var protocolVar = 'messageId';

	output += 'var ' + listVar + ' = [' + '\n'
			+ listOutput
			+ '];' + '\n'
			+ '\n'
			+ 'var ' + protocolVar + ' = {' + '\n'
			+ chunks
			+ '};' + '\n'
			+ '\n'
			+ 'exports.' + listVar + ' = ' + listVar + ';' + '\n'
			+ 'exports.' + protocolVar + ' = ' + protocolVar + ';';

	var outputFile = protoFileList[index] + 'Id.js';

	fs.writeFileSync(outputFile, output);

	console.log(outputFile + ' file has been generated');

	var messageCount = 0;
	var filter = false;

	while (1) {
		var n = streamCp.indexOf('\n');

		if ( n == -1 ) {
			break;
		}

		var line = streamCp.slice(0, n);

		protoFile += line + '\n';

		if (line.search('message') != -1 && filter === false) {
			var idLine = '\t' + 'optional int64 id = 1 [default=' + msgWithIdList[messageCount++].id + '];' + '\n';
			protoFile += idLine;
			filter = true;
		}
		else if (line.search('// end') != -1) {
			filter = false;
		}

		streamCp = streamCp.slice(n+1);
	}

	outputFile = protoFileList[index] + '.proto';

	fs.writeFileSync(outputFile, protoFile);

	console.log(outputFile + ' file has been generated');
}

function hash(serial) {
//	console.log(serial);

	if (16 < serial.length) {
		while (1) {
			var newSerial = '';

			for (var i = 0; i < serial.length / 2; ++i) {
				newSerial += String(serial.charCodeAt(i) ^ serial.charCodeAt(serial.length-i-1));
//				console.log(newSerial);
			}			
			
			if (newSerial.length < 14) {
				break;
			}
			serial = newSerial;
			serial = serial.slice(0, serial.length / 2);
		}
	}

	serial |= 0xf000;

	return serial;
}

for (var i = 0; i < protoFileList.length; ++i) {
	if (fs.existsSync(protoFileList[i]+'.sample')) {
		var opt = {
			encoding: 'utf8',
			flag: 'r',
		};

		parse(fs.readFileSync(protoFileList[i]+'.sample', opt), i);
	}
	else {
		if (!exists) {
			throw console.log('There isn\'t ' + protoFileList[i]);
		}
	}
}
