var mysql = require('./mysql');
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

	var sql = 'SELECT ?? FROM ?? WHERE ?';
	var where = {k_id: data['k_id']};
	var escaped = ['k_id', 'user', where];

	var callback = function (response, results, fields) {
		if (results[0]) {
			log.addLog('DEBUG', 'Already exsisted account');
			writeFalse(response);
		}
		else {
			sql = 'INSERT INTO ?? SET ?';
			post = {k_id: data['k_id']};
			escaped = ['user', post];

			// could be a problem.
			callback = function (response, results, fields) {
				writeTrue(response);
			}

			mysql.query(response, sql, escaped, callback);
		}
	}

	mysql.query(response, sql, escaped, callback);
} // end registerUser

function getUserInfo(response, data) {
	if (!data['k_id']) {
		log.addLog('ERROR', '[getUserInfo] doesn\'t have any data');
		return;
	}
	var sql = 'SELECT ??, ?? FROM ?? WHERE ?';
	var where = {k_id: data['k_id']};
	var escaped = ['k_id', 'score', 'user', where];

	var callback = function (response, results, fields) {
		write(response, 'application/json', JSON.stringify(results));
	}

	mysql.query(response, sql, escaped, callback);
} // end getUserInfo

function saveUserInfo(response, data) {
	if (!data['k_id'] || !data['score']) {
		log.addLog('ERROR', '[saveUserInfo] doesn\'t have any data');
		return;
	}
	var sql = 'UPDATE ?? SET ? WHERE ?';
	var set = {score: data['score']}; 
	var where = {k_id: data['k_id']};
	var escaped = ['user', set, where];

	var callback =  function (response, results, fields) {
		writeTrue(response);
	}

	mysql.query(response, sql, escaped, callback);
} // end saveUserInfo

function getRanking(response, data) {
	var sql = 'SELECT ??, ?? FROM ?? ORDER BY ?? DESC';
	var escaped = ['k_id', 'score', 'user', 'score'];

	var callback =  function (response, results, fields) {
		write(response, 'application/json', JSON.stringify(results));
	}

	mysql.query(response, sql, escaped, callback);
} // end getRanking

exports.registerUser = registerUser;
exports.getUserInfo = getUserInfo;
exports.saveUserInfo = saveUserInfo;
exports.getRanking = getRanking;
