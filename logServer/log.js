var fs = require('fs');

var start = getDateTime();
var path = './LOG/';
var file = start+'_LOG';

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

var currentDate = new Date();

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
