var fs = require('fs');
var genList = [
	'ver',
	'c2s',
	's2c',
	'r2g',
	'g2r',
];
var protocolInfoList = [];

for (var i = 0; i < genList.length; ++i) {
	protocolInfoList.push(require('./' + genList[i] + 'ProtocolList'));
}

var formList = [];

for (var i = 0; i < genList.length; ++i) {
	formList.push('./' + genList[i] + 'ProtocolForm.js');
}

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

function parse(stream, protocolInfo) {
	var pos = 0;
	var content = {
		head: '',
		body: '',
		tail: '',
	};

	var namespace = getDataByDelimiter(stream, '#');

	content['head'] += 'using UnityEngine;' + '\n'
					+ 'using System.Collections;' + '\n'
					+ '\n'
					+ 'public class ' + namespace.toUpperCase() + 'Protocol : MonoBehaviour {' + '\n'
//					+ '\t' + 'public ProtocolElement element;' + '\n'
					+ '\n'
					;

	for (var i = 0; i < protocolInfo.list.length; ++i) {
		// Manual parsing.
		var obj = [];	
		
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
		content['body'] += '\t' + 'public class ' + protocolInfo.list[i] + ' {' + '\n'
						+ '\t\t' + 'public int id = ' + protocolInfo.protocolId[protocolInfo.list[i]] + ';' + '\n'
						;

		for (var j = 0; j < obj.length; ++j) {
			var value = null;

			if (obj[j]['type'] === 'int' || obj[j]['type'] === 'long') {
				value = 0;
			}
			else if (obj[j]['type'] === 'string') {

			}
			else if (obj[j]['type'] === 'version') {
				obj[j]['type'] = 'int';
				value = version;
			}
			else if (obj[j]['type'] === 'clientVer') {
				obj[j]['type'] = 'int';
				value = clientVer;
			}
			else if (obj[j]['type'] === 'obj') {

			}
			else {
				var realType = getDataByDelimiter(obj[j]['type'], '&');
				obj[j]['type'] = 'ProtocolElement.' + realType + '[]';
				value = 'null';
			}

			content['body'] += '\t\t' + 'public ' + obj[j]['type'] + ' ' + obj[j]['variable'] + ' = ' + value + ';' + '\n'
							;
		}


		content['body'] += '\t' + '} // end ' + protocolInfo.list[i] + '\n'
						+ '\n'
						;
	}

	content['tail'] += '}' + '\n'
					;

	var file = namespace + 'Protocol.cs';
	var output = content['head'] + content['body'] + content['tail'];

	fs.writeFile(file, output, function (err) {
		if (err) {
			console.log(err);
			throw err;
		}
		console.log(file+' file has been generated.');
	});
}

for (var i = 0; i < genList.length; ++i) {
	var opt = {
		encoding: 'utf8',
		flag: 'r',
	};

	var closure = function (index) {
		return function (err, data) {
			if (err) throw err;
			
			parse(data, protocolInfoList[index]);
		};
	};

	fs.readFile(formList[i], opt, closure(i));
}
