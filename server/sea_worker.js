var http = require('http');

var util = require('./sea_util'),
	handle = require('./sea_handle').handle
	;

var worker = new Worker();
worker.init();

function Worker() {
	// property
	this.httpServer = null;

	// method
	this.init = function () {
		this.httpServer = http.createServer(this.onRequest);
		this.httpServer.timeout = 0;
		this.httpServer.listen(8888);

		console.log('sea main http server(' + process.pid + ') has started listening on 8888 port.');
	};

	this.onRequest = function (request, response) {
		var postData = new Buffer(0);

		request.addListener('data', function (postDataChunk) {
			var buf = new Buffer(postDataChunk);
			var newBuf = new Buffer(postData.length + buf.length);
			
			postData.copy(newBuf);
			buf.copy(newBuf, postData.length);

			postData = newBuf;
		});

		request.addListener('end', function () {
			// Routes
			var buf = new Buffer(postData);
			var data = util.toArrBuf(buf);

			var id = util.fetchId(data);

			if (typeof handle[id] === 'function') {	
				handle[id](response, data);
			} else {
				console.log('ERROR', 'No request handler found');
				response.writeHead(404, {'Content-Type': 'text/plain'});
				response.write('404 Not found');
				response.end();
			}
		});

		request.addListener('error', function (e) {
			console.log('problem with request: ' + e.message);
		});
	};
}
