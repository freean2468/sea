var fs = require('fs');

var file = [];
file.push('./verProtocolForm.js');
file.push('./c2sProtocolForm.js');
file.push('./s2cProtocolForm.js');
file.push('./r2gProtocolForm.js');
file.push('./g2rProtocolForm.js');

function getDataByDelimiter(stream, delimiter) {
	var start = stream.search(delimiter);
	var restStream = stream.slice(start+1);
	var end = restStream.search(delimiter);

	var data = stream.slice(start+1, start + end + 1);
	
	return data;
}

function getData(stream, start, end) {
	var startPos = stream.search(start);
	var restStream = stream.slice(startPos);
	var endPos = restStream.search(end);

	var data = stream.slice(startPos+1, startPos + endPos);
	
	return data;
}

function findSth(stream, start, find) {
	var sth = stream.slice(start).search(find);

	return sth;
}

function parse(stream, index) {
	var start = '[';
	var listOutput = '';
	var output = '';
	var chunks = '';
	var pos = 0;

	var namespace = getDataByDelimiter(stream, '#');
	pos = findSth(stream, 0, '#');
	stream = stream.slice(pos);

	while (1) {
		var chunk = '';
		var asciiSerial = '';
		
		chunk = getData(stream, '@', ' ');
		
		for (var j = 0; j < chunk.length; ++j) {
			var code = chunk.charCodeAt(j);
			asciiSerial += String(code);
		}

		listOutput += '\t\'' + chunk + '\',' + '\n';
		chunks += '\t' + chunk	+ ': ';
		chunks += hash(asciiSerial) + ',';
		chunks += '\n';

		pos = findSth(stream, 0, ',');

		if (pos === -1) {
			break;
		}

		stream = stream.slice(pos+1);
	}

	var listVar = 'list';
	var protocolVar = 'protocolId';

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

	var outputFile = namespace + 'ProtocolList.js';

	fs.writeFile(outputFile, output, function (err) {
		if (err) throw err;

		console.log(outputFile + ' file has been generated');
	});
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

for (var i = 0; i < file.length; ++i) {
	var closure = function (index){
		return function (exists) {
			if (!exists) {
				throw console.log('There isn\'t ' + file[index]);
			}

			var opt = {
				encoding: 'utf8',
				flag: 'r',
			};

			fs.readFile(file[index], opt, function (err, data) {
				if (err) throw err;

				parse(data, index);
			});
		}
	};

	fs.exists(file[i], closure(i));
}
