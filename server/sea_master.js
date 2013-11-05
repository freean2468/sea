var	cluster = require('cluster'),
	cp = require('child_process'),
	numCPUs = require('os').cpus().length
	;

var build = require('./sea_build'),
	handle = require('./sea_handle').handle,
	util = require('./sea_util'),
	DrawMgr = require('./sea_draw').DrawMgr
	;

(function () {
	var _instance = null;
	
	global.MASTER = function (from) {
		if (!_instance) {
			_instance = new Master();
			_instance.on();
			console.log('A master instance is just create.');
		}
		return _instance;
	};
})();

function Master() {
	// Property
	this.drawMgr = new DrawMgr();

	// Method
	this.on = function () {
		var that = this;

		// master
		cluster.setupMaster({
			exec : './sea_worker.js',
			args : [],
			silert : true,
		});

		for (var i = 0; i < numCPUs; ++i) {
			this.fork();
		}

		cluster.on('exit', function (worker, code, signal) {
			console.log('worker ' + worker.process.pid + ' died');
			// Re-spawns a worker.
			this.fork();
		});
	};

	this.fork = function () {
		var worker = cluster.fork();
	}
}

module.exports = {
	'MASTER': MASTER,
};
