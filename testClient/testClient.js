var dataForm = require('./postData').dataForm;
var http = require('http');

var opts = {
	host: 'localhost',
	port: 8888,
	method: 'POST',
	path: '/',
	headers: {}
};

var req = http.request(opts, function(response) {
	var res_data = '';

	console.log('STATUS: ' + response.statusCode);
	console.log('HEADERS: ' + JSON.stringify(response.headers));
	
	response.setEncoding('utf8');

	response.on('data', function(chunk) {
		res_data += chunk;
	});

	response.on('end', function() {
		console.log(res_data);
	});
});

req.on('error', function(e) {
	console.log("Got error: " + e.message);
});

opts.headers['Content-Type'] = 'application/json';

req.data = JSON.stringify(dataForm['packet']);

opts.headers['Content-Length'] = req.data.length;

// write the data
req.write(req.data);

//req.write('data\n');
//req.write('data\n');

req.end();
