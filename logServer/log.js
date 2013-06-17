var fs = require('fs');
var currentDate = require('./util').currentDate;

var start = getDateTime();
var path = './LOG/';
var file = start+'_LOG';

function mkdirLog() {
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path);
	}
}

function addLog(type, line) {
	fs.appendFileSync(path + '[' + type + ']_' + file, getDateTime() + ' ' + line + '\n');
	console.log(line);
}

function getDateTime() {
	return currentDate.today() + '_' + currentDate.timeNow();
}

exports.mkdirLog = mkdirLog;
exports.addLog = addLog;
