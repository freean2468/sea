var mysql = require('./requestHandler_MySQL');
var mongodb = require('./requestHandler_MongoDB');
var options = {MYSQL: 1, MONGODB: 2};
var flags = options['MYSQL'] + options['MONGODB'];

// GET METHODS
//function start(response, postData) {}
//function upload(response, postData) {}
//function jsonTest(response, postData) {}

// POST METHODS
function registerUser(response, data) {
	if (flags & options['MYSQL']) mysql.registerUser(response, data);
	if (flags & options['MONGODB']) mongodb.registerUser(response, data);
}

function getUserInfo(response, data) {
	if (flags & options['MYSQL']) mysql.getUserInfo(response, data);
	if (flags & options['MONGODB']) mongodb.getUserInfo(response, data);
}

function saveUserInfo(response, data) {
	if (flags & options['MYSQL']) mysql.saveUserInfo(response, data);
	if (flags & options['MONGODB']) mongodb.saveUserInfo(response, data);
}

function getRanking(response, data) {
	if (flags & options['MYSQL']) mysql.getRanking(response, data);
	if (flags & options['MONGODB']) mongodb.getRanking(response, data);
}

exports.registerUser = registerUser;
exports.getUserInfo = getUserInfo;
exports.saveUserInfo = saveUserInfo;
exports.getRanking = getRanking;
