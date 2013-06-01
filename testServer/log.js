var fs = require('fs');
var currentDate = new Date();
var logType = {
	'ERROR': 'ERROR',
	'DEBUG': 'DEBUG',
};

Date.prototype.today = function() {
	return ((this.getDate() < 10)?'0':'') + this.getDate() + '_'
		+ (((this.getMonth()+1) < 10)?'0':'') + (this.getMonth()+1) + '_'
		+ this.getFullYear();
};

Date.prototype.timeNow = function() {
	return ((this.getHours() < 10)?'0':'') + this.getHours() + '_'
		+ ((this.getMinutes() < 10)?'0':'') + this.getMinutes() + '_'
		+ ((this.getSeconds() < 10)?'0':'') + this.getSeconds();
};

var start = getDateTime();
var path = './LOG/';
var file = start+'_LOG';

//for (var i = 0; i < logType.length; ++i) {
//	fs.writeFileSync('[' + logType[i] + ']_' + file, '');
//}

function mkdirLog() {
	if (!fs.existsSync('./LOG')) {
		fs.mkdirSync('./LOG');
	}
}

function addLog(type, line) {
	var opt = {
		'encoding': 'utf8',
		'flag': 'a'
	};

	if (logType[type]) {
		fs.appendFileSync(path + '[' + logType[type] + ']_' + file, getDateTime() + ' ' + line + '\n', opt);
	}
	else {
		console.log('Invalid log type');
	}
	console.log(line);
}

function getDateTime() {
	return currentDate.today() + '_' + currentDate.timeNow();
}

exports.mkdirLog = mkdirLog;
exports.addLog = addLog;
