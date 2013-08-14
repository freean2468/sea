var Server = require('./g2l-server').Server,
	router = require('./g2l-router'),
	handle = require('./g2l-handle').handle;

var server = new Server();
server.start(router.resRoute, handle);

module.exports = {
	'server': server,
};
