var Server = require('./c2g-server').Server;

var server = new Server();
server.start();

module.exports = {
	'server': server,
};
