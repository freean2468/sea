var fs = require('fs');
var protocolList = require('./protocol').list;

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

var headCommon = '';
var tailCommon = '';

mysql['head'] += "var mysql = require('./mysql');" + '\n';
mongodb['head'] += "var mongodb = require('./mongodb');" + '\n';

headCommon += "var log = require('./log');" + '\n'
				+ '\n'
				+ "var resTrue = {res: 'true'};" + '\n'
				+ "var resFalse = {res: 'false'};" + '\n'
				+ '\n'
				+ "function write(res, type, str) {" + '\n'
				+ '\t' + "res.writeHead(200, {'Content-Type': type, 'Content-Length':str.length});" + '\n'
				+ '\t' + "res.write(str);" + '\n'
				+ '\t' + "res.end();" + '\n'
				+ "}" + '\n'
				+ '\n'
				+ "function writeTrue(res) {" + '\n'
				+ '\t' + "write(res, 'application/json', JSON.stringify(resTrue));" + '\n'
				+ "}" + '\n'
				+ '\n'
				+ "function writeFalse(res) {" + '\n'
				+ '\t' + "write(res, 'application/json', JSON.stringify(resFalse));" + '\n'
				+ "}" + '\n'
				;

for (var i = 0; i < protocolList.length; ++i) {
	var startMark = 'function '+protocolList[i];
	var start = mysqlContents.search(startMark);

	if (start === -1) {
		mysql['body'] += 'function '+protocolList[i]+'(response, data){} // end'+protocolList[i]+'\n'
					+ '\n'
					;
	} 
	else {
		var endMark = 'end '+protocolList[i];
		var end = mysqlContents.search(endMark);
		
		mysql['body'] += mysqlContents.slice(start, end)
					+ mysqlContents.slice(end, end+endMark.length) + '\n'
					+ '\n'
					;
	}

	var start = mongodbContents.search(startMark);

	if (start === -1) {
		mongodb['body'] += 'function '+protocolList[i]+'(response, data){} // end'+protocolList[i]+'\n'
					+ '\n'
					;
	} 
	else {
		var endMark = 'end '+protocolList[i];
		var end = mongodbContents.search(endMark);
		
		mongodb['body'] += mongodbContents.slice(start, end)
					+ mongodbContents.slice(end, end+endMark.length) + '\n'
					+ '\n'
					;
	}

	tailCommon += 'exports.'+protocolList[i]+' = '+protocolList[i]+';\n'
				;
}

var file = 'requestHandler_MySQL.js';
var output = mysql['head']+headCommon+mysql['body']+tailCommon;

fs.writeFile(file, output, function (err) {
	if (err) {
		console.log(err);
		throw err;
	}
	console.log(file+' file is maded.');
});

file = 'requestHandler_MongoDB.js';
output = mongodb['head']+headCommon+mongodb['body']+tailCommon;

fs.writeFile(file, mongodb['head']+headCommon+mongodb['body']+tailCommon, function (err) {
	if (err) {
		console.log(err);
		throw err;
	}
	console.log(file+' file is maded.');
});
