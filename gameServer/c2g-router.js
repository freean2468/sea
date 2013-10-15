var util = require('../common/util');
var handle = require('./c2g-handle').handle;

function Router() {
	// property
	this.logMgr;
	
	// method
	this.init = function (logMgr) {
		this.logMgr = logMgr;
	};

	this.fetchSessionId = function (request) {
		var cookies = {};
		var cookie = request.headers['cookie'];
		
		if (cookie === undefined) {
			cookies['piece'] = '';
			return cookies;
		}

		var part = cookie.split('=');

		cookies[part[0].trim()] = (part[1] || '').trim();

		return cookies['piece'];
	};

	this.route = function (request, pathname, response, postData) {
		var stream = util.decrypt(postData);
		var data = util.toArrBuf(new Buffer(stream, 'hex'));

		id = util.fetchId(data);

		if (typeof handle[id] === 'function') {	
			var sessionId = this.fetchSessionId(request);
			handle[id](response, data, sessionId);
		} else {
			this.logMgr.addLog('ERROR', 'No request handler found for ' + pathname);
			response.writeHead(404, {'Content-Type': 'text/plain'});
			response.write('404 Not found');
			response.end();
		}
	};
}

//function reqRoute(response, resData) {
//	console.log('\nin reqRoute');
//	console.log(resData);
//	var data = JSON.parse(resData);
//
//	if (resData && typeof reqHandle[data['id']] === 'function')	{
//		console.log('POST methods routing in reqRoute');
//		reqHandle[data['id']](response, data);
//	} else {
//		log.addLog('ERROR', 'No response handler found for ' + resData);
//	}
//}

module.exports = {
	'Router': Router,
};
