var fs = require('fs');
var protocolList = require('./protocol/protocolList').list;
var version = require('./protocolList').version;
var clientVer = require('./protocolList').clientVer;
var file = './protocolManual.js';

var mysqlContents = fs.readFileSync('./requestHandler_MySQL.js', {encoding: 'utf8'});
var mongodbContents = fs.readFileSync('./requestHandler_MongoDB.js', {encoding: 'utf8'});

var mysql = { 
	head: '',
	body: '',
};

var mongodb = {
	head: '',
	body: '',
};

// FIXME
var headCommon = "var protocol = require('./protocol');" + '\n'
				+ "var element = require('./protocolElement');" + '\n'
				+ "var assert = require('assert');" + '\n'
				+ "var toRank = require('./request');" + '\n'
				+ "var route = require('./router');" + '\n'
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

function parse(stream) {
	var pos = 0;
	
	for (var i = 0; i < protocolList.length; ++i) {
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
		
		var startMark = 'function ' + protocolList[i] + 'Handler';
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
				params += '\t' + protocolList[i] + '[\'' + obj[j]['variable'] + '\'] = data[\'' + obj[j]['variable'] + '\'];' + '\n'
							;
			}

			mysql['body'] += 'function '+protocolList[i]+'Handler(response, data){' + '\n'
							+ '\t' + 'var ' + protocolList[i] + ' = protocol.' + protocolList[i] + ';' +  '\n'
							+ params
							+ '} // end ' + protocolList[i] + 'Handler' + '\n'
							+ '\n'
							;
		} 
		else {
			var endMark = 'end ' + protocolList[i] + 'Handler';
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
				params += '\t' + protocolList[i] + '[\'' + obj[j]['variable'] + '\'] = data[\'' + obj[j]['variable'] + '\'];' + '\n'
							;
			}

			mongodb['body'] += 'function '+protocolList[i]+'Handler(response, data){' + '\n'
							+ '\t' + 'var ' + protocolList[i] + ' = protocol.' + protocolList[i] + ';' +  '\n'
							+ params
							+ '} // end ' + protocolList[i] + 'Handler' + '\n'
							+ '\n'
							;		
		} 
		else {
			var endMark = 'end ' + protocolList[i] + 'Handler';
			var end = mongodbContents.search(endMark);
			
			mongodb['body'] += mongodbContents.slice(start, end)
						+ mongodbContents.slice(end, end+endMark.length) + '\n'
						+ '\n'
						;
		}

		tailCommon += 'exports.'+protocolList[i]+'Handler = '+protocolList[i]+'Handler;\n'
					;
	}
	
	var mysqlFile = 'requestHandler_MySQL.js';
	var output = mysql['head']+headCommon+mysql['body']+tailCommon;

	fs.writeFile(mysqlFile, output, function (err) {
		if (err) {
			console.log(err);
			throw err;
		}
		console.log(mysqlFile+' file is maded.');
	});

	var mongodbFile = 'requestHandler_MongoDB.js';
	output = mongodb['head']+headCommon+mongodb['body']+tailCommon;

	fs.writeFile(mongodbFile, mongodb['head']+headCommon+mongodb['body']+tailCommon, function (err) {
		if (err) {
			console.log(err);
			throw err;
		}
		console.log(mongodbFile+' file is maded.');
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

