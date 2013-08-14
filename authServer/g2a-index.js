var Server = require('./g2a-server').Server,
    Router = require('./g2a-router').Router,
	Proto = require('./g2a-proto').Proto;

var PORT = 8870;

var server = new Server(new Router(new Proto()));
server.create();
server.listen(PORT);

module.exports = {
	'server': server,
};
