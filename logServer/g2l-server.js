var http = require('http');
var url = require('url');
var log = require('./log');

function start(route, handle) {
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
			route(handle, pathname, response, postData);
		});
	}
	
	log.mkdirLog();

	server = http.createServer(onRequest)
	server.timeout = 0;
	server.listen(8889);

	console.log('log server has started.');
}

exports.start = start;
