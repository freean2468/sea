var qs = require('querystring');
var log = require('./log');

function route(handle, pathname, response, postData) {
	console.log('About to route a request for ' + pathname);

	if (typeof handle[pathname] === 'function')
	{
		console.log('GET methods routing');
		handle[pathname](response, postData);
	}
	else if (postData)
	{
		console.log('POST methods routing');
		var data = qs.parse(postData);

		handle[data['reqType']](response, postData);
	}	
	else
	{
		log.addLog('ERROR', 'No request handler found for ' + pathname);
		response.writeHead(404, {'Content-Type': 'text/plain'});
		response.write('404 Not found');
		response.end();
	}
}

exports.route = route;
