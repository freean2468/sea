var fs = require('fs');
var element = require('./protocolElementList').element;
var elementList = require('./protocolElementList').elementList;

var file = './protocolElementManual.js';

var packetContents = fs.readFileSync('./protocolElement.js', {encoding: 'utf8'});
var packet = {
	body: '',
	tail: '',
};

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
	var pos = 0;

	for (var i = 0; i < stream.length; ++i) {
		if (stream.slice(i, i+start.length) === start) {
			++namespaceCount;
		}
	}

	for (var i = 0; i < elementList.length; ++i) {
		// Manual parsing.
		var obj = [];
		
		if (namespaceCount > 0) {
			if (findSth(stream, 0, '#') < findSth(stream, 0, '{')) {
				var namespace = getDataByDelimiter(stream, "#");
	
				packet['body'] += '// ' + namespace + '\n'
								+ '\n'
								;

				--namespaceCount;
			}
		}

		pos = findSth(stream, 0, '{');
		stream = stream.slice(pos + 2);

		var close;
		while (1) {
			var ret = findSth(stream, 0, '\n');
			close = findSth(stream, 0, '}');
			
			if (ret < close) {
				var variable = getDataByDelimiter(stream, "'");
				var type = getDataByDelimiter(stream, '"');

				obj.push({'variable': variable, 'type': type});
				stream = stream.slice(ret + 1);
			}
			else {
				stream = stream.slice(close + 1);
				break;
			}
		}
		
		packet['body'] += 'var ' + elementList[i] + ' = {' + '\n'
						+ '\t' + 'id: ' + element[elementList[i]] + ',' + '\n'
						;
					
		for (var j = 0; j < obj.length; ++j) {
			var value = undefined;

			if (obj[j]['type'] === 'string') {
				value = "''";
			}
			else if (obj[j]['type'] === 'int') {
				value = 0;
			}
			else if (obj[j]['type'] === 'version') {
				value = version;
			}
			else if (obj[j]['type'] === 'clientVer') {
				value = clientVer;
			}
			else {
				value = obj[j]['type'];
			}
			
			packet['body'] += '\t' + obj[j]['variable'] + ': ' + value + ',' + '\n'
							;
		}

		packet['body'] += '}; // end ' + elementList[i] + '\n'
						+ '\n'
						;

		packet['tail'] += 'exports.' + elementList[i] + ' = ' + elementList[i] + ';' + '\n'
						;
	}

	var file = 'protocolElement.js';
	var output = packet['body']+packet['tail'];

	fs.writeFile(file, output, function (err) {
		if (err) {
			console.log(err);
			throw err;
		}
		console.log(file+' file has been generated.');
	});
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


