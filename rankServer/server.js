var http = require('http');
var url = require('url');
var log = require('./log');
var cp = require('child_process');
var rank = cp.fork('./rank.js');

var rankingList = [];

rank.on('message', function(m) {
	rankingList = m;
	exports.rankingList = rankingList;
});

function start(route, handle) {
	function onRequest(request, response) {
		var postData = '';
		var pathname = url.parse(request.url).pathname;

		console.log('Rank server area...');

		request.setEncoding('utf8');

		request.addListener('data', function data(postDataChunk) {
			postData += postDataChunk;
			console.log('Received POST data chunk \'' +
				postDataChunk + '\'.');
		});

		request.addListener('end', function end() {
			route(handle, pathname, response, postData);
		});
	}
	
	log.mkdirLog();

	http.createServer(onRequest).listen(8889);

	console.log('rank server has started.');
	console.log('rank calc has started.');
}

exports.start = start;
exports.rankingList = rankingList;
