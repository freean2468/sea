var server = require('./g2l-server');
var router = require('./g2l-router');

var handle = require('./g2l-handle').handle;

server.start(router.resRoute, handle);
