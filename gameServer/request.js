var http = require('http');
var toStream = require('./util').toStream;

// data is a proto message object.
function request(data) {
	var callback = function(req, res) {
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
		res.end();
	};

	var stream = toStream(data);

	var toLog = {
		host: 'localhost',
		port: 8889,
		method: 'POST',
		path: '/',
		headers: {
			'Content-Type': 'application/octet-stream',
			'Content-length': stream.length
		}
	};

	var req = http.request(toLog, callback);

	req.on('error', function(e) {
		console.log("Got error: " + e.message);
	});

	// write the data
	req.write(stream);
	req.end();
}

exports.request = request;
