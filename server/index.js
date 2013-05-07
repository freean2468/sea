var server = require('./server');
var router = require('./router');
var requestHandlers = require('./requestHandlers');

var handle = {}

handle['/start'] = requestHandlers.start;
handle['/upload'] = requestHandlers.upload;
handle['/jsonTest'] = requestHandlers.jsonTest;

handle[505000412] = requestHandlers.registerUser;
handle[339976] = requestHandlers.getUserInfo;
handle[4117019] = requestHandlers.saveUserInfo;
handle[2021104] = requestHandlers.getRanking;

server.start(router.route, handle)
