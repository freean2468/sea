var protocol = require('./protocol');
var fs = require('fs');

var handlers = '';

for (var i = 0; i < protocol.list.length; ++i) {
	//handle[protocol['registerUser']] = requestHandlers.registerUser;
	handlers += 'handle[' + protocol.protocol[protocol.list[i]] + '] = requestHandlers.' + protocol.list[i]  + ';\r\n';
}

var output = '';

output += "var server = require('./server');" + '\r\n'
		+ "var router = require('./router');" + '\r\n'
		+ "var requestHandlers = require('./requestHandlers');" + '\r\n'
		+ '\r\n'
		+ "var handle = {}" + '\r\n'
		+ '\r\n'
		+ "handle['/start'] = requestHandlers.start;" + '\r\n'
		+ "handle['/upload'] = requestHandlers.upload;" + '\r\n'
		+ "handle['/jsonTest'] = requestHandlers.jsonTest;" + '\r\n'
		+ '\r\n'
		+ handlers + '\r\n'
		+ "server.start(router.route, handle)"
		;

fs.writeFile('index.js', output, function (err) {
	if (err) throw err;
});
