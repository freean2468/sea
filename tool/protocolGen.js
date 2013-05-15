var fs = require('fs');
var list = './protocolList.js';
var listOutput = '';
var output = '';
var chunks = '';

function parse(list) {
	for (var i = 0; i < list.length; ++i) {
		if ( list[i] < 'A' || list [i] > 'z')  {
			continue;
		}
		else {
			var chunk = '';
			var asciiSerial = '';

			while (1) {
				chunk += list[i];
				var code = list.charCodeAt(i);
				asciiSerial += String(code);

				++i;
				if (list[i] === ',') {
					++i;
					break;
				}
			}

			listOutput += '\t\'' + chunk + '\',' + '\n';
			chunks += '\t' + chunk	+ ': ';
			chunks += hash(asciiSerial) + ',';
			chunks += '\n';
		}
	}

	output += 'var version = 1;' + '\n'
			+ 'var list = [' + '\n'
			+ listOutput
			+ '];' + '\n\n'
			+ 'var protocol = {' + '\n'
			+ chunks
			+ '};' + '\n\n'
			+ 'exports.list = list;' + '\n'
			+ 'exports.protocol = protocol;';

	fs.writeFile('protocol.js', output, function (err) {
		if (err) throw err;
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

fs.exists(list, function (exists){
	if (!exists) {
		throw console.log('There isn\'t ' + list);
	}

	var opt = {
		encoding: 'utf8',
		flag: 'r',
	};

	fs.readFile(list, opt, function (err, data) {
		if (err) throw err;

		parse(data);
	});
});

