var http = require('http'),
	url = require('url'),
	cluster = require('cluster'),
	cp = require('child_process'),
	numCPUs = require('os').cpus().length
	;

var build = require('./c2g-proto-build'),
	LogMgr = require('../common/log').LogMgr,
//	rank = cp.fork('./rank.js'),
	request = require('./g2l-request').request,
	Client = require('./a2g-client').Client,
	Router = require('./c2g-router').Router,
	DataMgr = require('./data').DataMgr,
	DrawMgr = require('./draw').DrawMgr,
	MysqlMgr = require('../common/mysql').MysqlMgr
	;

var currentDate = new Date();

function Server() {
	// property
//	this.rankingList = [];
	this.logMgr = new LogMgr('../gameServer/LOG/', currentDate);
	this.clientList = {};
	this.server;
	this.router = new Router();
	this.dataMgr = new DataMgr();
	this.drawMgr = new DrawMgr();
	this.mysqlMgrList = {};

	// method
	this.start = function () {
		this.logMgr.init('GAME');
		this.router.init(this.logMgr);
		this.dataMgr.init();

		var that = this;
		function onRequest(request, response) {
			var postData = '';
			var pathname = url.parse(request.url).pathname;

			//console.log('Request for ' + pathname + ' received.');

			request.setEncoding('utf8');

			request.addListener('data', function (postDataChunk) {
				postData += postDataChunk;
				//console.log('Received POST data chunk \'' + postDataChunk + '\'.');
			});

			request.addListener('end', function () {
				that.router.route(request, pathname, response, postData);
			});

			request.addListener('error', function (e) {
				that.logMgr.addLog('SYSTEM', 'problem with request: ' + e.message);
			});
		}

		if (cluster.isMaster) {		
	//		metric();	

//			rank.on('message', function(m) {
//				this.rankingList = m;
//			});
//
//			console.log('rank calc has started.');	

			for (var i = 0; i < numCPUs; ++i) {
				cluster.fork();
			}

			cluster.on('exit', function (worker, code, signal) {
				console.log('worker ' + worker.process.pid + ' died');
			});
		} else {
			this.server = http.createServer(onRequest);
			this.server.timeout = 0;
			this.server.listen(8888);

			console.log('game server(' + process.pid + ') has started to listening on 8888 port.');

			var client = new Client('127.0.0.1', 8870);
			client.init();

			this.clientList[process.pid] = client;
			this.mysqlMgrList[process.pid] = new MysqlMgr('sea', numCPUs);
		}
	};

	this.getClient = function () {
		return this.clientList[process.pid];
	};

	this.getMysqlMgr = function () {
		return this.mysqlMgrList[process.pid];
	};
}

module.exports = {
	'Server': Server,
};
