var protocol = require('./protocol');
var fs = require('fs');

var handlers = '';

for (var i = 0; i < protocol.list.length; ++i) {
	//handle[protocol['registerUser']] = requestHandlers.registerUser;
	handlers += 'handle[' + protocol.protocol[protocol.list[i]] + '] = requestHandler.' + protocol.list[i]  + ';\n';
}

var output = '';

output += "var server = require('./server');" + '\n'
		+ "var router = require('./router');" + '\n'
		+ "var requestHandler = require('./requestHandler');" + '\n'
		+ '\n'
		+ "var handle = {}" + '\n'
		+ '\n'
		+ "//handle['/start'] = requestHandler.start;" + '\n'
		+ "//handle['/upload'] = requestHandler.upload;" + '\n'
		+ "//handle['/jsonTest'] = requestHandler.jsonTest;" + '\n'
		+ '\n'
		+ handlers + '\n'
		+ "server.start(router.route, handle)"
		;

fs.writeFile('index.js', output, function (err) {
	if (err) throw err;
});
