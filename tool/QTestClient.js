var root = require('./QTestTable').root;
var msgs = require('./QTestMsgs').msgs;
var readline = require('readline');
var http = require('http');
var encrypt = require('./util').encrypt;
var toBuf = require('./util').toBuf;
var fetchId = require('./util').fetchId;
var toArrBuf = require('./util').toArrBuf;
var decrypt = require('./util').decrypt;
var cookie = 0;

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

var commands = [
	'SHOW TABLES',
	'SHOW [TABLE_NAME]',
	'USE [TABLE_NAME]',
	'SEND [MSG_NAME]',
	'QUIT',
];

var enumTable = [];

for (i = 0; i < root.length; ++i) {
	var table = root[i]['table'];

	for (j = 0; j < table.length; ++j) {
		if (table[j]['type'] === 'enum') {
			enumTable.push(table[j]);
		}
	}
}

// for use Table
var useTable = 0;
console.log("stranger? type --> 'HELP'");

rl.setPrompt('QTest> ');
rl.prompt();

rl.on('line', function(line) {
	var arr = line.split(' ');
	
	if (arr.length < 2) {
		if (arr[0] === 'QUIT'){
			rl.close();
		} else if (arr[0] === 'HELP') {
			printCommands();
		} else {
			printError('INVALID USAGE');
		}
	} else {
		if (arr[0] === 'SHOW') {
			if (arr[1] === 'TABLES') {
				showTables(root);
			} else {
				for (i = 0; i < root.length; ++i) {
					if (root[i]['namespace'] === arr[1]) {
						showTable(root[i]['table']);
						break;
					}
				}
			}
		} else if (arr[0] === 'USE') {
			var flag = false;

			for (i = 0; i < root.length; ++i) {
				if (root[i]['namespace'] === arr[1]) {
					useTable = root[i]['table'];		
					console.log("USE : " + arr[1]);
					flag = true;
					break;
				}
			}

			if (flag === false) {
				printError('INVALID TABLE_NAME');
			}
		} else if (arr[0] === 'SEND') {
			if (useTable === 0) {
				printError('use USE command before SEND');
			} else {
				var flag = false;

				for (i = 0; i < useTable.length; ++i) {
					if (useTable[i][0] === arr[1]) {
						var msg = useTable[i];
						showEnum(msg);
						showMsg(msg);
						makeMsg(msg);
						flag = true;
						break;
					}
				}		

				if (flag === false) {
					printError('INVALID MSG');
				}
			}
		} else {
			printError('INVALID USAGE');
		}
	}

	rl.prompt();
}).on('close', function() {
	console.log('QTest is closed');
	process.exit(0);
});

function printError(msg) {
	console.log('ERROR : ' + msg);
}

function printCommands() {
	console.log(' ');
	console.log('USAGE : ');
	for (i = 0; i < commands.length; ++i) {
		console.log(commands[i]);
	}
	console.log(' ');
}

function showTables(root) {
	var length = 0;

	for (var val in root) {
		++length;
	}

	console.log("TABLES : ");

	for (i = 0; i < length; ++i) {
		console.log('|'+'\t'+root[i]['namespace']);
	}

	console.log('##');
}

function showTable(table) {
	console.log(' ');
	for (j = 0; j < table.length; ++j) {
		if (table[j]['type'] === 'msg') {
			console.log('## ' + table[j][0]);
		}
	}
	console.log(' ');
}

function showEnum(msg) {
	var flag = false;
	var length = 0;

	for (var val in msg) {
		++length;
	}

	for (i = 1; i < length - 1; ++i) {
		for (j = 0; j < enumTable.length; ++j) {
			var str = msg[i] + '';
			var splited = str.split(' ');
			if ((splited[1]+'') === (enumTable[j][0]+'')) {
				console.log(' ');
				length = 0;

				for (var val in enumTable[j]) {
					++length;
				}
				console.log(enumTable[j][0]);
				for (i = 1; i < length-1; ++i) {
					console.log('|'+'\t'+enumTable[j][i]);
				}
		
				console.log(' ');		
			}
		}
	}
}

function showMsg(table) {
	var msg = table[0];
	var length = 0;
	console.log(msg);

	for (var val in table) {
		++length;
	}

	for (i = 1; i < length-1; ++i) {
		console.log('|'+'\t'+table[i]);
	}
	console.log('##');
}

function makeMsg(table) {
	var msg = table[0];
	var instance;
	var length = 0;
	console.log(msg);

	var usage = 'INPUT( ';

	for (var val in table) {
		++length;
	}

	var i = 1;
	var fields = [];
	for (; i < length-1; ++i) {
		var arr = table[i].split(' ');
		usage += arr[2] + ' '
		fields.push(arr[2]);
	}

	usage += ') : ';

	rl.question(usage, function(answer) {
		var split = answer.split(' ');

		if (split.length !== --i) {
			printError('it needs ' + i + ' field values, but got ' + split.length);
			rl.prompt();
		} else {
			var flag = false;

			for (j = 0; j < msgs.length; ++j) {
				if (msgs[j]['msg'] === msg) {
					instance = msgs[j]['instance'];

					for (var idx in fields) {
						var field = fields[idx];
						instance[field] = split[idx];
					}
					
					flag = true;
					request(instance);
				}
			}

			if (flag === false) {
				printError('That msg does not exist.');
			}
		}
	});
}

function received(data) {
	console.log(' ');
	console.log("|	RECEIVED : ");

	var stream = decrypt(data);

	var res = toArrBuf(new Buffer(stream, 'hex'));
	var id = fetchId(res);
	console.log(data);

	for (i = 0; i < msgs.length; ++i) {
		var instance = msgs[i]['instance'];
		var build = msgs[i]['build'];
		if (id === instance['id']['low']) {
			var name = msgs[i]['msg'];
			console.log(name);
			var obj = build.decode(res);
			console.log(obj);

			var flag = false;

			for (j = 0; j < root.length; ++j) {
				var table = root[j]['table'];

				for (k = 0; k < table.length; ++k) {
					var msg = table[k];

					if (msg['0'] === name) {
						flag = true;
						showEnum(msg);
						var length = 0;

						for (var val in msg) {
							++length;
						}

						for (l = 1; l < length-1; ++l) {
							var elem = msg[l] + '';
							var splited = elem.split(' ');
							if (splited[0] === "repeated") {
								var arr = obj[splited[2]];
								for (var va in arr) {
									console.log(arr[va]);
								}
							}
						}
					}

					if (flag === true) {
						console.log(' ');
						return;
					}
				}
			}
		}
	}

	console.log(' ');
}

function request(data) {
	var callback = function(response) {
		var res_data = '';

		response.setEncoding('utf8');

		response.on('data', function(chunk) {
			res_data += chunk;
		});

		response.on('end', function() {
			received(res_data);
			fetchCookie(response);
			rl.prompt();
		});
	};

	console.log(' ');
	console.log("|	SEND : ");
	console.log(data);
	console.log(' ');

	var buf = toBuf(data.toArrayBuffer()).toString('hex');
	var stream = encrypt(buf);

	var opts = {
		host: 'localhost',
		port: 8888,
		method: 'POST',
		path: '/',
		headers: {
			'Content-Type': 'application/octet-stream',
			'Content-length': stream.length,
			'Cookie': 'piece=' + cookie['piece']
		}
	};

	var req = http.request(opts, callback);

	req.on('error', function(e) {
		console.log("Got error: " + e.message);
	});
	
	// write the data
	req.write(stream);
	req.end();
}

function fetchCookie(res) {
	var cookies = {};
	var part = res.headers['set-cookie'] && res.headers['set-cookie'][0].split('=');

	if (part !== undefined) {
		cookies[part[0].trim()] = (part[1] || '').trim();
		cookie = cookies;
	}
}
