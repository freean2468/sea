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

function fetchEnum(stream) {
	var enumeration = 'enum';
	var message = 'message';
	var end = '}';
	var listOutput = '';
	var enumPos = 0;
	var pos = 0;
	var streamCp = stream;

	var i = 0;

	while (1) {
		enumPos = findSth(stream, 0, enumeration);
		pos = findSth(stream, 0, message);

		if (enumPos >= pos || enumPos === -1) {
			break;
		}

		var next = enumPos + enumeration.length;
		enumPos = findSth(stream, next, '{');

		var chunk = stream.slice(next+1, next+enumPos-1);
		var asciiSerial = '';
		
		listOutput += '\t\'' + chunk + '\',' + '\n';
		
		stream = stream.slice(enumPos);

		enumPos = findSth(stream, 0, end);
		
		stream = stream.slice(enumPos + end.length);		
	}

	var listVar = 'enumList';

	var output = 'var ' + listVar + ' = [' + '\n'
				+ listOutput
				+ '];' + '\n'
				+ '\n'
				+ 'exports.' + listVar + ' = ' + listVar + ';' + '\n'
				;

	return output;
}

function fetchMessage(stream, index) {
	var enumOutput = fetchEnum(stream);
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
		pos = findSth(stream, next, '{');

		var chunk = stream.slice(next+1, next+pos-1);
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

	output += enumOutput + '\n'
			+ 'var ' + listVar + ' = [' + '\n'
			+ listOutput
			+ '];' + '\n'
			+ '\n'
			+ 'var ' + protocolVar + ' = {' + '\n'
			+ chunks
			+ '};' + '\n'
			+ '\n'
			+ 'exports.' + listVar + ' = ' + listVar + ';' + '\n'
			+ 'exports.' + protocolVar + ' = ' + protocolVar + ';'
			;

	var outputFile = protoFileList[index] + '-id.js';

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
			var idLine = '\t' + 'optional uint64 id = 1 [default=' + msgWithIdList[messageCount++].id + '];' + '\n';
			protoFile += idLine;
			filter = true;
		}
		else if (line.search('// end') != -1) {
			filter = false;
		}

		streamCp = streamCp.slice(n+1);
	}

	outputFile = '../protocol/' + protoFileList[index] + '.proto';

	fs.writeFileSync(outputFile, protoFile);

	console.log(outputFile + ' file has been generated');
}

var idx = 0;

function hash(serial) {
//	console.log(serial);

	if (16 < serial.length) {
		++idx;
		while (1) {
			var newSerial = '';

			for (var i = 0; i < serial.length / 2; ++i) {
				newSerial += String(serial.charCodeAt(i) ^ serial.charCodeAt(serial.length-i-1)) + idx;
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

		fetchMessage(fs.readFileSync(protoFileList[i]+'.sample', opt), i);
	}
	else {
		if (!exists) {
			throw console.log('There isn\'t ' + protoFileList[i]);
		}
	}
}
