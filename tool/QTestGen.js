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
	var pos = 0;
	var body = '';

	while (1) {
		var n = stream.indexOf('\n');

		if ( n == -1 ) {
			break;
		} else {
			var line = stream.slice(0, n);
			pos = findSth(line, 0, enumeration);

			if (pos !== -1) {
				var next = pos + enumeration.length;
				pos = findSth(line, next, '{');

				var chunk = stream.slice(next+1, next+pos-1);
				var count = 0;
				body += '\t' + "{'type': 'enum', '" + count++ + "': '" + chunk + "', "; 

				stream = stream.slice(n+1);

				while (1) {
					var n = stream.indexOf('\n');
					var line = stream.slice(0, n);

					if (line.indexOf("}") !== -1) {
						break;
					} else {
						line = line.replace('\t', '');
						line = line.replace('\t', '');
						body += "'" + count++ + "': " + "'" + line + "', ";
					}

					stream = stream.slice(n+1);
				}

				body += "}, \n";
			}
			stream = stream.slice(n+1);
		}
	}

	return body;
}

function GenQTestTable(namespace, stream, index) {
	var enumBody = fetchEnum(stream);
	var message = 'message';
	var end = '// end';
	var listOutput = '';
	var head = 'var ' + namespace + ' = [' + '\n';
	var body = '';
	var tail = '];' + '\n';
	var output = '';
	var chunks = '';
	var pos = 0;

	var streamCp = stream;

	while (1) {
		pos = findSth(stream, 0, message);

		if (pos === -1) {
			break;
		}

		var next = pos + message.length;
		pos = findSth(stream, next, '{');

		var chunk = stream.slice(next+1, next+pos-1);
	
		stream = stream.slice(pos);
		pos = findSth(stream, 0, end);		
//		stream = stream.slice(pos + end.length);

		var count = 0;

		body += '\t' + "{'type': 'msg', '" + count++ + "': '" + chunk + "', "; 

		while (1) {
			var n = stream.indexOf('\n');

			if ( n == -1 ) {
				break;
			}

			var line = stream.slice(0, n);
			var pos;

			if (line.indexOf("// end") !== -1) {
				break;
			} else if ((pos = line.indexOf('required')) !== -1) {
				line = line.slice(pos, line.length);
				body += "'" + count++ + "': " + "'" + line + "', ";
			} else if ((pos = line.indexOf('repeated')) !== -1) {
				line = line.slice(pos, line.length);
				body += "'" + count++ + "': " + "'" + line + "', ";
			}

			stream = stream.slice(n+1);
		}

		body += "}, \n";
	}

	output += head
			+ enumBody
			+ body
			+ tail
			+ '\n'
//			+ 'exports.' + namespace + ' = ' + namespace + ';' + '\n'
			;
	
	return output;
}

var contents = '';
var head = 'var root = [' + '\n';
var body = '';
var tail = '];' + '\n';
tail += '\n' + 'exports.root = root;' + '\n';

for (var i = 0; i < protoFileList.length; ++i) {
	if (fs.existsSync(protoFileList[i]+'.proto')) {
		var opt = {
			encoding: 'utf8',
			flag: 'r',
		};

		contents += GenQTestTable(protoFileList[i], fs.readFileSync(protoFileList[i]+'.proto', opt), i) + '\n';
		body += '\t' + "{'namespace': '" + protoFileList[i] + "', " + "'table': " + protoFileList[i] + '}, ' + '\n';
	} else {
		if (!exists) {
			throw console.log('There isn\'t ' + protoFileList[i]);
		}
	}
}

var outputFile = 'QTestTable.js';
fs.writeFileSync(outputFile, contents + head + body + tail);
console.log(outputFile + ' file has been generated');

var root = require('./QTestTable.js').root;
head = "var build = require('./gameProtoBuild');" + '\n'
	+ '\n'
	+ "var msgs = [" + '\n'
	;

body = '';
tail = "];" + '\n'
	+ '\n'
	+ "exports.msgs = msgs;"
	;

for (i = 0; i < root.length; ++i) {
	var table = root[i]['table'];
	for (j = 0; j < table.length; ++j) {
		if (table[j]['type'] === 'msg') {
			body += '\t' + "{'msg': '" + table[j]['0'] + "', 'instance': new build." + table[j]['0'] + "(), 'build': build." + table[j]['0'] + "}, " + '\n'; 
		}
	}
}

outputFile = 'QTestMsgs.js';
fs.writeFileSync(outputFile, head + body + tail);
console.log(outputFile + ' file has been generated');
