var http = require('http'),
	url = require('url'),
	cluster = require('cluster'),
	cp = require('child_process'),
	numCPUs = require('os').cpus().length;

var build = require('./c2g-proto-build'),
	log = require('./log'),
	rank = cp.fork('./rank.js'),
	request = require('./g2l-request').request,
	toAuth = require('./a2g-client').toAuth;

var rankingList = [];

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
			route(request, handle, pathname, response, postData);
		});
	}

	if (cluster.isMaster) {		
//		metric();	
	
		log.mkdirLog();

		rank.on('message', function(m) {
			rankingList = m;
			exports.rankingList = rankingList;
		});

		console.log('rank calc has started.');	

		for (var i = 0; i < numCPUs; ++i) {
			cluster.fork();
		}

		cluster.on('exit', function (worker, code, signal) {
			console.log('worker ' + worker.process.pid + ' died');
		});
	} else {
		server = http.createServer(onRequest);
		server.timeout = 0;
		server.listen(8888);

		console.log('game server(' + process.pid + ') has started to listening on 8888 port.');

		toAuth.init();
	}
}

module.exports = {
	'start': start,
	'rankingList': rankingList,
};
