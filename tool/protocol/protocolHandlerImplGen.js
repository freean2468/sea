var fs = require('fs');
var protocols = [
	'ver',
	'c2s',
	's2c',
	'r2g',
	'g2r',
];

var protocolInfoList = [];
var protocolFiles = [];

for (var i = 0; i < protocols.length; ++i) {
	protocolInfoList.push(require('./' + protocols[i] + 'ProtocolList'));
	protocolFiles.push('./' + protocols[i] + 'ProtocolForm.js');
}

var whatFor = '';
var limits = [];

process.argv.forEach(function(val, index, array) {
	if (index == 2) {
		whatFor = val;
	}
	if (index > 2) {
		limits.push(val);
	}
});

var mysqlContents = fs.readFileSync('./' + whatFor + 'ProtocolHandler_MySQL.js', {encoding: 'utf8', flag: 'r'});
var mongodbContents = fs.readFileSync('./' + whatFor + 'ProtocolHandler_MongoDB.js', {encoding: 'utf8', flag: 'r'});

var mysql = { 
	head: '',
	body: '',
};

var mongodb = {
	head: '',
	body: '',
};

var headCommon = '';

for (var i = 0; i < protocols.length; ++i) {
	headCommon += 'var ' + protocols[i] + "Protocol = require('./" + protocols[i] + "Protocol');" + '\n';
}

headCommon += "var element = require('./protocolElement');" + '\n'
			+ "var assert = require('assert');" + '\n'
			+ "var toRank = require('./request');" + '\n'
			;
var tailCommon = '';

mysql['head'] += "var mysql = require('./mysql');" + '\n'
				;
mongodb['head'] += "var mongodb = require('./mongodb');" + '\n'
				;

headCommon += "var log = require('./log');" + '\n'
				+ '\n'
				+ "function write(res, type, str) {" + '\n'
				+ '\t' + "res.writeHead(200, {'Content-Type': type, 'Content-Length':str.length});" + '\n'
				+ '\t' + "res.write(str);" + '\n'
				+ '\t' + "res.end();" + '\n'
				+ "}" + '\n'
				+ '\n'
				;

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
	var pos = 0;
	
	for (var i = 0; i < protocolInfoList[index].list.length; ++i) {
		var obj = [];

		// Manual parsing.
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
		
		var startMark = 'function ' + protocolInfoList[index].list[i] + 'Handler';
		var start = mysqlContents.search(startMark);

		if (start === -1) {
			var params = '';
			for (var j = 0; j < obj.length; ++j) {
				var init = undefined;

				if (obj[j]['type'] === 'string') {
					init = "''";	
				}
				else if (obj[j]['type'] === 'int' || obj[j]['type'] === 'long') {
					init = 0;
				}
				else if (obj[j]['type'] === 'version') {
					init = version;
				}
				else if (obj[j]['type'] === 'clientVer') {
					init = clientVer;
				}
				else {
					init = '[]';
				}

				params += '\t' + 'assert.notEqual(' + 'data[\'' + obj[j]['variable'] + '\'], ' + init + ');' + '\n'
							;
				params += '\t' + protocolInfoList[index].list[i] + '[\'' + obj[j]['variable'] + '\'] = data[\'' + obj[j]['variable'] + '\'];' + '\n'
							;
			}

			mysql['body'] += 'function '+protocolInfoList[index].list[i]+'Handler(response, data){' + '\n'
							+ '\t' + 'var ' + protocolInfoList[index].list[i] + ' = ' + protocols[index] + 'Protocol.' + protocolInfoList[index].list[i] + ';' +  '\n'
							+ params
							+ '} // end ' + protocolInfoList[index].list[i] + 'Handler' + '\n'
							+ '\n'
							;
		} 
		else {
			var endMark = 'end ' + protocolInfoList[index].list[i] + 'Handler';
			var end = mysqlContents.search(endMark);
			
			mysql['body'] += mysqlContents.slice(start, end)
						+ mysqlContents.slice(end, end+endMark.length) + '\n'
						+ '\n'
						;
		}

		var start = mongodbContents.search(startMark);

		if (start === -1) {
			var params = '';
			for (var j = 0; j < obj.length; ++j) {
				var init = undefined;

				if (obj[j]['type'] === 'string') {
					init = "''";	
				}
				else if (obj[j]['type'] === 'int' || obj[j]['type'] === 'long') {
					init = 0;
				}
				else if (obj[j]['type'] === 'version') {
					init = version;
				}
				else if (obj[j]['type'] === 'clientVer') {
					init = clientVer;
				}
				else {
					init = '[]';
				}

				params += '\t' + 'assert.notEqual(' + 'data[\'' + obj[j]['variable'] + '\'], ' + init + ');' + '\n'
							;
				params += '\t' + protocolInfoList[index].list[i] + '[\'' + obj[j]['variable'] + '\'] = data[\'' + obj[j]['variable'] + '\'];' + '\n'
							;
			}

			mongodb['body'] += 'function '+protocolInfoList[index].list[i]+'Handler(response, data){' + '\n'
							+ '\t' + 'var ' + protocolInfoList[index].list[i] + ' = ' + protocols[index] + 'Protocol.' + protocolInfoList[index].list[i] + ';' +  '\n'
							+ params
							+ '} // end ' + protocolInfoList[index].list[i] + 'Handler' + '\n'
							+ '\n'
							;		
		} 
		else {
			var endMark = 'end ' + protocolInfoList[index].list[i] + 'Handler';
			var end = mongodbContents.search(endMark);
			
			mongodb['body'] += mongodbContents.slice(start, end)
						+ mongodbContents.slice(end, end+endMark.length) + '\n'
						+ '\n'
						;
		}

		tailCommon += 'exports.'+protocolInfoList[index].list[i]+'Handler = '+protocolInfoList[index].list[i]+'Handler;\n'
					;
	}
}

var opt = {
	encoding: 'utf8',
	flag: 'r',
};

for (var i = 0; i < protocols.length; ++i) {
	for (var j = 0; j < limits.length; ++j) {
		if (protocols[i] === limits[j]) {
			data = fs.readFileSync(protocolFiles[i], opt);

			parse(data, i);
	
			break;
		}
	}
}

var mysqlFile = whatFor + 'ProtocolHandler_MySQL.js';
var output = mysql['head']+headCommon+mysql['body']+tailCommon;

fs.writeFile(mysqlFile, output, function (err) {
	if (err) {
		console.log(err);
		throw err;
	}
	console.log(mysqlFile+' file has been generated.');
});

var mongodbFile = whatFor + 'ProtocolHandler_MongoDB.js';
output = mongodb['head']+headCommon+mongodb['body']+tailCommon;

fs.writeFile(mongodbFile, mongodb['head']+headCommon+mongodb['body']+tailCommon, function (err) {
	if (err) {
		console.log(err);
		throw err;
	}
	console.log(mongodbFile+' file has been generated.');
});
