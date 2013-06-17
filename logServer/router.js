var log = require('./log');
var toArrBuf = require('./util').toArrBuf;
var decrypt = require('./util').decrypt;
var fetchId = require('./util').fetchId;

function resRoute(handle, pathname, response, postData) {
	var stream = decrypt(postData);
	var data = toArrBuf(new Buffer(stream, 'hex'));

	id = fetchId(data);

	if (typeof handle[id] === 'function') {
		handle[id](response, data);
	}
//	else if (postData && typeof handle[data['id']] === 'function')
//	{
//		console.log('POST methods routing in resRoute');
//		console.log(data);
//		handle[data['id']](response, data);
//	}	
	else
	{
		log.addLog('ERROR', 'No request handler found for ' + pathname);
		response.writeHead(404, {'Content-Type': 'text/plain'});
		response.write('404 Not found');
		response.end();
	}
}

function reqRoute(response, resData) {
	console.log('\nin reqRoute');
	console.log(resData);
	var data = JSON.parse(resData);

	if (resData && typeof reqHandle[data['id']] === 'function')
	{
		
		console.log('POST methods routing in reqRoute');
		reqHandle[data['id']](response, data);
	}	
	else {
		log.addLog('ERROR', 'No response handler found for ' + resData);
	}
}

exports.resRoute = resRoute;
