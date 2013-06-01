var server = require('./server');
var router = require('./router');

var handle = require('./protocolHandle').protocolHandle;

server.start(router.resRoute, handle);
