var fs = require('fs');
var list = require('./c2sId.js').list;
var messageId = require('./c2sId.js').messageId;
var unmanaged = [];
var unregister = [];
var unmanagedId = [];
var unregisterId = [];

var unmanagedOn = false;
var unregisterOn = false;

process.argv.forEach(function(val, index, array) {
	if (val === '-unmanaged') {
		unmanagedOn = true;
		return;
	} else if (val === '-unregister') {
		unregisterOn = true;
		unmanagedOn = false;
		return;
	}

	if (unmanagedOn === true) {
		unmanaged.push(val);
	} else if (unregisterOn === true) {
		unregister.push(val);
	}
});

for (var i = 0, l = list.length; i < l; ++i) {
	for (var j = 0, l1 = unmanaged.length; j < l1; ++j) {
		if (list[i] === unmanaged[j]) {
			unmanagedId.push(messageId[list[i]]);
			break;
		}
	}

	for (var j = 0, l2 = unregister.length; j < l2; ++j) {
		if (list[i] === unregister[j]) {
			unregisterId.push(messageId[list[i]]);
			break;
		}
	}
}

var filename = 'sessionInfo.js';
var data = '';

data += 'var unmanaged = [ ' + '\n';

for (var i = 0, l = unmanagedId.length; i < l; ++i) {
	data += '\t' + unmanagedId[i] + ', ' + '\n';
}

data += '];' + '\n';
data += '\n';

data += 'var unregister = [ ' + '\n';

for (var i = 0, l = unregisterId.length; i < l; ++i) {
	data += '\t' + unregisterId[i] + ', ' + '\n';
}

data += '];' + '\n';
data += '\n';

data += 'module.exports = {' + '\n'
	+ '\t' + "'unmanaged': unmanaged," + '\n'
	+ '\t' + "'unregister': unregister," + '\n'
	+ '};'
	;

fs.writeFileSync(filename, data);
