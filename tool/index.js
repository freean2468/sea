var server = require('./server');
var router = require('./router');
var requestHandler = require('./requestHandler');

var handle = {}

//handle['/start'] = requestHandler.start;
//handle['/upload'] = requestHandler.upload;
//handle['/jsonTest'] = requestHandler.jsonTest;

handle[505016796] = requestHandler.registerUser;
handle[1242298] = requestHandler.getUserInfo;
handle[4125211] = requestHandler.saveUserInfo;
handle[2029296] = requestHandler.getRanking;

server.start(router.route, handle)