var http = require('http'),
	url = require('url')
	;

var LogMgr = require('../common/log').LogMgr,
	MysqlMgr = require('../common/mysql').MysqlMgr,
	Router = require('./g2l-router').Router
	;

var currentDate = new Date();

function Server() {
	// property
	this.logMgr = new LogMgr('../logServer/LOG/', currentDate);
	this.mysqlMgr = new MysqlMgr('sea_log', 1);
	this.router = new Router();

	// method
	this.start = function () {
		this.router.init(this.logMgr);		
		this.logMgr.init('LOG');

		var that = this;

		function onRequest(request, response) {
			var postData = '';
			var pathname = url.parse(request.url).pathname;

			//console.log('Request for ' + pathname + ' received.');

			request.setEncoding('utf8');

			request.addListener('data', function data(postDataChunk) {
				postData += postDataChunk;
				//console.log('Received POST data chunk \'' + postDataChunk + '\'.');
			});

			request.addListener('end', function end() {
				that.router.route(pathname, response, postData);
			});
		}

		server = http.createServer(onRequest)
		server.timeout = 0;
		server.listen(8889);

		console.log('log server has started.');
	};
}

module.exports = {
	'Server': Server,
};
