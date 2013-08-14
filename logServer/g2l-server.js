var http = require('http'),
	url = require('url');

var LogMgr = require('./log').LogMgr;

function Server() {
	// property
	this.logMgr = new LogMgr();

	// method
	this.start = function (route, handle) {
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
				route(handle, pathname, response, postData, this.logMgr);
			});
		}
		
		this.logMgr.init('LOG');

		server = http.createServer(onRequest)
		server.timeout = 0;
		server.listen(8889);

		console.log('log server has started.');
	};
}

module.exports = {
	'Server': Server,
};
