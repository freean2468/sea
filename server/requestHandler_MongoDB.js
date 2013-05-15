var mongodb = require('./mongodb');
var log = require('./log');

var resTrue = {res: 'true'};
var resFalse = {res: 'false'};

function write(res, type, str) {
	res.writeHead(200, {'Content-Type': type, 'Content-Length':str.length});
	res.write(str);
	res.end();
}

function writeTrue(res) {
	write(res, 'application/json', JSON.stringify(resTrue));
}

function writeFalse(res) {
	write(res, 'application/json', JSON.stringify(resFalse));
}
function registerUser(response, data) {
	if (!data['k_id']){
		log.addLog('ERROR', '[registerUser] doesn\'t have any data');
		return;
	}

	var doc = {
		k_id: data['k_id'],
	};

	var callback = function (res){
		console.log(res);
	};
	
	mongodb.insert('user', doc, callback);
} // end registerUser

function getUserInfo(response, data) {
	if (!data['k_id']){
		log.addLog('ERROR', '[getUserInfo] doesn\'t have any data');
		return;
	}

	var doc = {
		k_id: data['k_id'],
	};

	var callback = function (items) {
		console.log(items);
	};

	mongodb.find('user', doc, callback);
} // end getUserInfo

function saveUserInfo(response, data) {
	if (!data['k_id'] || !data['score']){
		log.addLog('ERROR', '[saveUserInfo] doesn\'t have any data');
		return;
	}

	var doc = {
		score: data['score'],
	};

	var callback = function (res) {
		console.log(res);
	};

	mongodb.update('user', {k_id: data['k_id']}, doc, callback);
} // end saveUserInfo

function getRanking(response, data) {
	var doc = {	};

	var callback = function (items) {
		console.log(items);
	};

	mongodb.find('user', doc, callback);
} // end getRanking

exports.registerUser = registerUser;
exports.getUserInfo = getUserInfo;
exports.saveUserInfo = saveUserInfo;
exports.getRanking = getRanking;
