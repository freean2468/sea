var fs = require('fs');
var file = './protocolElementManual.js';
var listOutput = '';
var output = '';
var chunks = '';
var pos = 0;

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

function parse(stream) {
	var namespaceCount = 0;
	var start = '[';

	for (var i = 0; i < stream.length; ++i) {
		if (stream.slice(i, i+start.length) === start) {
			++namespaceCount;
		}
	}

	var version = getData(stream, '!', 'v');
	pos = findSth(stream, 0, '!');
	stream = stream.slice(pos+1);
	var clientVer = getData(stream, '!', 'v');

	for (var i = 0; i < namespaceCount; ++i) {
		var namespace = getDataByDelimiter(stream, '#');
		pos = findSth(stream, 0, '#');
		stream = stream.slice(pos);

		chunks += '\n'
				+ '\t' + '// ' + namespace + '\n'
				+ '\n'
				;

		while (1) {
			var chunk = '';
			var asciiSerial = '';
			
			pos = findSth(stream, 0, ',');

			if (findSth(stream, 0, ';') < pos) {
				stream = stream.slice(pos + 1);
				break;
			}

			chunk = getData(stream, '@', ' ');
			stream = stream.slice(pos+1);

			for (var j = 0; j < chunk.length; ++j) {
				var code = chunk.charCodeAt(j);
				asciiSerial += String(code);
			}

			listOutput += '\t\'' + chunk + '\',' + '\n';
			chunks += '\t' + chunk	+ ': ';
			chunks += hash(asciiSerial) + ',';
			chunks += '\n';
		}
	}

	output += 'var elementList = [' + '\n'
			+ listOutput
			+ '];' + '\n\n'
			+ 'var element = {' + '\n'
			+ chunks
			+ '};' + '\n\n'
			+ 'exports.elementList = elementList;' + '\n'
			+ 'exports.element = element;';

	fs.writeFile('protocolElementList.js', output, function (err) {
		if (err) throw err;

		console.log('protocolElementList.js file has been generated');
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

fs.exists(file, function (exists){
	if (!exists) {
		throw console.log('There isn\'t ' + file);
	}

	var opt = {
		encoding: 'utf8',
		flag: 'r',
	};

	fs.readFile(file, opt, function (err, data) {
		if (err) throw err;
		
		parse(data);
	});
});

