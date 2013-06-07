var server = require('./server');
var router = require('./router');

var handle = require('./handle').handle;

server.start(router.resRoute, handle);
