var log = require('./log');

function route(handle, pathname, response, postData) {
	console.log('About to route a request for ' + pathname);
	var data = JSON.parse(postData);

	if (typeof handle[pathname] === 'function')
	{
		console.log('GET methods routing');
		handle[pathname](response, postData);
	}
	else if (postData && typeof handle[data['id']] === 'function')
	{
		console.log('POST methods routing');
		handle[data['id']](response, data);
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
