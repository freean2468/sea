var server = require('./c2g-server'),
	router = require('./c2g-router'),
	handle = require('./c2g-handle').handle;

server.start(router.resRoute, handle);
