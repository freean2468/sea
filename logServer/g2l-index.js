var Server = require('./g2l-server').Server;

var server = new Server();
server.start();

module.exports = {
	'server': server,
};
