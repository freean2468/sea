var http = require('http');

function request(response, data, handle) {
	var jsonData = JSON.stringify(data);

	var toRank = {
		host: 'localhost',
		port: 8889,
		method: 'POST',
		path: '/',
		headers: {
			'Content-Type': 'application/json',
			'Content-Type': jsonData.length
		}
	};

	var callback = function(res) {
		var res_data = '';

		console.log('STATUS: ' + res.statusCode);
		console.log('HEADERS: ' + JSON.stringify(res.headers));
		
		res.setEncoding('utf8');

		res.on('data', function(chunk) {
			res_data += chunk;
		});

		res.on('end', function() {
			var data = JSON.parse(res_data);
			handle(response, data);
		});
	};

	var req = http.request(toRank, callback);

	req.on('error', function(e) {
		console.log("Got error: " + e.message);
	});

	// write the data
	req.write(jsonData);
	req.end();
}

exports.request = request;
