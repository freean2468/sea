var fs = require('fs');
var protoList = [];

var whatFor = '';
var option = '';

process.argv.forEach(function(val, index, array) {
	if (index == 2) {
		whatFor = val;
	}
	
	if (index > 2) {
		if (val[0] != '-') {
			protoList.push(val);
		}
	}

	if (val === '-request') {
		option += "var request = require('./request').request;" + '\n';
	}
});

var protoIdList = [];
var protoFileList = [];

for (var i = 0; i < protoList.length; ++i) {
	protoIdList.push(require('./' + protoList[i] + 'Id.js'));
	protoFileList.push('./' + protoList[i] + '.proto');
}

var mysqlContents = fs.readFileSync('./' + whatFor + 'Handler_MySQL.js', {encoding: 'utf8', flag: 'r'});
var mongodbContents = fs.readFileSync('./' + whatFor + 'Handler_MongoDB.js', {encoding: 'utf8', flag: 'r'});

var mysql = { 
	head: '',
	body: '',
};

var mongodb = {
	head: '',
	body: '',
};

var headCommon = "var build = require('./protoBuild');" + '\n'
				+ "var assert = require('assert');" + '\n'
				+ "var encrypt = require('./util').encrypt;" + '\n'
				+ "var toStream = require('./util').toStream;" + '\n'
//				+ "var toRank = require('./request');" + '\n'
				+ option
				;

var tailCommon = '';

mysql['head'] += "var mysql = require('./mysql');" + '\n'
				;
mongodb['head'] += "var mongodb = require('./mongodb');" + '\n'
				;

headCommon += "var log = require('./log');" + '\n'
				+ '\n'
				+ "function write(res, stream) {" + '\n'
				+ '\t' + "res.writeHead(200, {'Content-Type': 'application/octet-stream', 'Content-Length':stream.length});" + '\n'
				+ '\t' + "res.write(stream);" + '\n'
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
	
	for (var i = 0; i < protoIdList[index].list.length; ++i) {
		var obj = protoIdList[index].list[i];

		// Manual parsing.
		pos = findSth(stream, 0, '{');
		stream = stream.slice(pos + 2);

		var close;
		
		var startMark = 'function ' + obj + 'Handler';
		var start = mysqlContents.search(startMark);

		if (start === -1) {
			mysql['body'] += 'function ' + obj + 'Handler(response, data){' + '\n'
							+ '\t' + 'var msg = build.' + obj + '.decode(data);' + '\n'
							+ '} // end ' + obj + 'Handler' + '\n'
							+ '\n'
							;
		} 
		else {
			var endMark = 'end ' + obj + 'Handler';
			var end = mysqlContents.search(endMark);
			
			mysql['body'] += mysqlContents.slice(start, end)
						+ mysqlContents.slice(end, end+endMark.length) + '\n'
						+ '\n'
						;
		}

		var start = mongodbContents.search(startMark);

		if (start === -1) {
			mongodb['body'] += 'function ' + obj + 'Handler(response, data){' + '\n'
							+ '\t' + 'var msg = build.' + obj + '.decode(data);' + '\n'
							+ '} // end ' + obj + 'Handler' + '\n'
							+ '\n'
							;		
		} 
		else {
			var endMark = 'end ' + obj + 'Handler';
			var end = mongodbContents.search(endMark);
			
			mongodb['body'] += mongodbContents.slice(start, end)
						+ mongodbContents.slice(end, end+endMark.length) + '\n'
						+ '\n'
						;
		}

		tailCommon += 'exports.' + obj + 'Handler = ' + obj + 'Handler;\n'
					;
	}
}

var opt = {
	encoding: 'utf8',
	flag: 'r',
};

for (var i = 0; i < protoFileList.length; ++i) {
	data = fs.readFileSync(protoFileList[i], opt);

	parse(data, i);
}

var mysqlFile = whatFor + 'Handler_MySQL.js';
var output = mysql['head']+headCommon+mysql['body']+tailCommon;

fs.writeFile(mysqlFile, output, function (err) {
	if (err) {
		console.log(err);
		throw err;
	}
	console.log(mysqlFile+' file has been generated.');
});

var mongodbFile = whatFor + 'Handler_MongoDB.js';
output = mongodb['head']+headCommon+mongodb['body']+tailCommon;

fs.writeFile(mongodbFile, mongodb['head']+headCommon+mongodb['body']+tailCommon, function (err) {
	if (err) {
		console.log(err);
		throw err;
	}
	console.log(mongodbFile+' file has been generated.');
});
