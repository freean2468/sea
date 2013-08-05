var server = require('./server'),
	router = require('./router'),
	handle = require('./handle').handle;

server.start(router.resRoute, handle);
