var fs = require('fs');

(function () {
	var _instance = null;
	
	global.LOG = function () {
		if (!_instance) {
			_instance = new Log();
			console.log('A log instance is just created.');
		}
		return _instance;
	};
})();

function Log() {
	// property
	this.currentDate = new Date();
	this.startTime;
	this.fullPath;
	this.path = './LOG/';

	// method
	this.init = function () {
		this.startTime = this.getDateTime();
		this.fullPath = this.path + '-' + process.pid + '-' + this.startTime + '/';
		this.mkdirLog();
	};

	this.mkdirLog = function () {
		if (!fs.existsSync(this.path)) {
			fs.mkdirSync(this.path);
		}
		if (!fs.existsSync(this.fullPath)) {
			fs.mkdirSync(this.fullPath);
		}
	};

	// FIXME
	this.addLog = function (type, line) {
		fs.appendFileSync(this.fullPath + '[' + type + ']', this.getDateTime() + ' ' + line + '\n');
		console.log(line);
	};
	
	this.getDateTime = function () {
		return this.today(this.currentDate) + '-' + this.timeNow(this.currentDate);
	};

	this.today = function (currentDate) {
		return ((currentDate.getDate() < 10)?'0':'') + currentDate.getDate() + '-'
			+ (((currentDate.getMonth()+1) < 10)?'0':'') + (currentDate.getMonth()+1) + '-'
			+ currentDate.getFullYear();
	};

	this.timeNow = function (currentDate) {
		return ((currentDate.getHours() < 10)?'0':'') + currentDate.getHours() + '-'
			+ ((currentDate.getMinutes() < 10)?'0':'') + currentDate.getMinutes() + '-'
			+ ((currentDate.getSeconds() < 10)?'0':'') + currentDate.getSeconds();
	};
};

module.exports = {
	'LOG': LOG,
};
