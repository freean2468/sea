var fs = require('fs');
var currentDate = new Date();
var logType = {
	'ERROR': 1,
	'DEBUG': 2,
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
var file = './LOG/'+start+'_LOG';

function mkdirLog() {
	if (!fs.existsSync('./LOG')) {
		fs.mkdirSync('./LOG');
	}
}

function addLog(type, line) {
	if (logType[type]) {
		fs.appendFileSync('['+logType[type]+']_'+file, getDateTime() + ' ' + line + '\n');
		console.log(line);
	}
	else {
		console.log('Invalid log type');
	}
}

function getDateTime() {
	return currentDate.today() + '_' + currentDate.timeNow();
}

exports.mkdirLog = mkdirLog;
exports.addLog = addLog;
