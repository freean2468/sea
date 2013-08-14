var fs = require('fs');
var PATH = './LOG/';

function LogMgr() {
	// property
	this.currentDate = new Date();
	this.owner = '';
	this.currentDate;
	this.startTime;
	this.fullPath;

	// method
	this.init = function (owner) {
		this.owner = owner;
		this.startTime = this.getDateTime();
		this.fullPath = PATH + this.startTime + '/';
		this.mkdirLog();
	};

	this.mkdirLog = function () {
		if (!fs.existsSync(PATH)) {
			fs.mkdirSync(PATH);
		}
		fs.mkdirSync(this.fullPath);
	};

	this.addLog = function (type, line) {
		fs.appendFileSync(this.fullPath + '[' + type + ']_' + this.owner, this.getDateTime() + ' ' + line + '\n');
		console.log(line);
	};
	
	this.getDateTime = function () {
		return this.today(this.currentDate) + '_' + this.timeNow(this.currentDate);
	};

	this.today = function (currentDate) {
		return ((currentDate.getDate() < 10)?'0':'') + currentDate.getDate() + '_'
			+ (((currentDate.getMonth()+1) < 10)?'0':'') + (currentDate.getMonth()+1) + '_'
			+ currentDate.getFullYear();
	};

	this.timeNow = function (currentDate) {
		return ((currentDate.getHours() < 10)?'0':'') + currentDate.getHours() + '_'
			+ ((currentDate.getMinutes() < 10)?'0':'') + currentDate.getMinutes() + '_'
			+ ((currentDate.getSeconds() < 10)?'0':'') + currentDate.getSeconds();
	};
};

module.exports = {
	'LogMgr': LogMgr,
};
