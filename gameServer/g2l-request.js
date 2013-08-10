var http = require('http');
var toStream = require('../common/util').toStream;

// data is a proto message object.
function request(data) {
	var stream = toStream(data);

	var option = {
		host: 'localhost',
		port: 8889,
		method: 'POST',
		path: '/',
		headers: {
			'content-type': 'application/octet-stream',
			'content-length': stream.length,
			'connection': 'close',
		},
		agent: false,
	};

	var req = http.request(option, function(res) {
//		var res_data = '';
//
//		console.log('STATUS: ' + res.statusCode);
//		console.log('HEADERS: ' + JSON.stringify(res.headers));
//		
//		res.setEncoding('utf8');
//
//		res.on('data', function(chunk) {
//			res_data += chunk;
//		});
//
//		res.on('end', function() {
//			var data = JSON.parse(res_data);
//			handle(response, data);
//		});
//		res.end();
	});

	req.on('error', function(e) {
		console.log('Problem with request: ' + e.message);
	});

	// write the data
	req.write(stream);
	req.end();
}

exports.request = request;
