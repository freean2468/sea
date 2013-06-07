var log = require('./log');

function toArrBuf(buffer) {
	var ab = new ArrayBuffer(buffer.length);
	
	for (i = 0; i < buffer.length; ++i) {
		ab[i] = buffer[i];
	}

	return ab;
}

function fetchId(ab) {
	var id = 0;
	var arr = [];
	var base = 1 << 7;
	var exp = 0;

	for (i = 1; i < ab.byteLength; ++i) {
		if (ab[i] < base) {
			exp = ab[i];
			break;
		}
		
		arr.push(ab[i]);		
	}

	var j = 0;
	for (; j < arr.length; ++j) {
		id += ((arr[j]-base) * (1 << (7*j))); 
	}
	id += (exp * (1 << (7*j)));

	return id;
}

function resRoute(handle, pathname, response, postData) {
	var data = toArrBuf(new Buffer(postData, 'hex'));

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
