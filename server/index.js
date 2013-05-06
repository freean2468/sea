var server = require('./server');
var router = require('./router');
var requestHandlers = require('./requestHandlers');

var handle = {}

handle['/start'] = requestHandlers.start;
handle['/upload'] = requestHandlers.upload;
handle['/jsonTest'] = requestHandlers.jsonTest;

handle[0] = requestHandlers.registerUser;
handle[1] = requestHandlers.getUserInfo;
handle[2] = requestHandlers.saveUserInfo;
handle[3] = requestHandlers.getRanking;

server.start(router.route, handle);
