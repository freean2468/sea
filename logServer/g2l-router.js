var util = require('../common/util'),
	handle = require('./g2l-handle').handle
	;

function Router() {
	// property
	this.logMgr;
	
	// method
	this.init = function (logMgr) {
		this.logMgr = logMgr;
	};

	this.route = function (pathname, response, postData) {
		var stream = util.decrypt(postData);
		var data = util.toArrBuf(new Buffer(stream, 'hex'));

		id = util.fetchId(data);

		if (typeof handle[id] === 'function') {
			handle[id](response, data);
		}
		else
		{
			this.logMgr.addLog('ERROR', 'No request handler found for ' + pathname);
			response.writeHead(404, {'Content-Type': 'text/plain'});
			response.write('404 Not found');
			response.end();
		}
	};
}

module.exports = {
	'Router': Router,
};
