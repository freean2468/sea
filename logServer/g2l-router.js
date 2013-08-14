var log = require('./log'),
	util = require('../common/util');

function resRoute(handle, pathname, response, postData, logMgr) {
	var stream = util.decrypt(postData);
	var data = util.toArrBuf(new Buffer(stream, 'hex'));

	id = util.fetchId(data);

	if (typeof handle[id] === 'function') {
		handle[id](response, data, logMgr);
	}
//	else if (postData && typeof handle[data['id']] === 'function')
//	{
//		console.log('POST methods routing in resRoute');
//		console.log(data);
//		handle[data['id']](response, data);
//	}	
	else
	{
		logMgr.addLog('ERROR', 'No request handler found for ' + pathname);
		response.writeHead(404, {'Content-Type': 'text/plain'});
		response.write('404 Not found');
		response.end();
	}
}

exports.resRoute = resRoute;
