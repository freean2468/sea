var qs = require("querystring");
var mysql = require('./mysql');
var log = require('./log');

function write(res, type, str) {
	res.writeHead(200, {"Content-Type": type, 'Content-Length':str.length});
	res.write(str);
	res.end();
}

//
//	GetRequestHandlers
//

function start(response, postData) {
	//exec("ls -lah", function(eror, stdout, stderr) {
	//	action(response, stdout);
	//});
	
	var body = '<html>' +
		'<head>' +
		'<meta http-equiv="Content-Type" content="text/html; ' +
		'charset=UTF-8" />' +
		'</head>' +
		'<body>' +
		'<form action="/upload" method="post">' +
		'<textarea name="text" rows="20" cols="60"></textarea>' +
		'<input type="submit" value="Submit text" />' +
		'</form>' +
		'</body>' +
		'</html>';

	write(response, "text/html", body);
}

function upload(response, postData) {
	write(response, "text/plain", "You've sent: " + 
		qs.parse(postData).text);	
}

function jsonTest(response, postData) {
	var test = {
		username: 'Test Hi there',
		nestedData: {
			first:1,
			second:2,
			third:3,			
		},
		body: 'good or bed',
	};

	write(response, 'application/json', JSON.stringify(test));
}

//
//	PostRequestHandlers
//

function registerUser(response, data) {
	var sql = 'SELECT ?? FROM ?? WHERE ?';
	var where = {k_id: data['k_id']};
	var escaped = ['k_id', 'user', where];

	var callback = function (response, results, fields) {
		if (results[0]) {
			log.addLog('DEBUG', 'Already exsisted account');
			write(response, 'text/plain', 'false');
		}
		else {
			sql = 'INSERT INTO ?? SET ?';
			data = qs.parse(postData);
			post = {k_id: data['k_id']};
			escaped = ['user', post];

			// could be a problem.
			callback = function (response, results, fields) {
				write(response, 'text/plain', 'true');
			}

			mysql.query(response, sql, escaped, callback);
		}
	}

	mysql.query(response, sql, escaped, callback);
}

function getUserInfo(response, data) {
	var sql = 'SELECT ??, ?? FROM ?? WHERE ?';
	var where = {k_id: data['k_id']};
	var escaped = ['k_id', 'score', 'user', where];

	var callback = function (response, results, fields) {
		write(response, 'application/json', JSON.stringify(results));
	}

	mysql.query(response, sql, escaped, callback);
}

function saveUserInfo(response, data) {
	var sql = 'UPDATE ?? SET ? WHERE ?';
	var set = {score: data['score']}; 
	var where = {k_id: data['k_id']};
	var escaped = ['user', set, where];

	var callback =  function (response, results, fields) {
		write(response, 'text/plain', 'true');
	}

	mysql.query(response, sql, escaped, callback);
}

function getRanking(response, data) {
	var sql = 'SELECT ??, ?? FROM ?? ORDER BY ?? DESC';
	var escaped = ['k_id', 'score', 'user', 'score'];

	var callback =  function (response, results, fields) {
		write(response, 'application/json', JSON.stringify(results));
	}

	mysql.query(response, sql, escaped, callback);
}

exports.start = start;
exports.upload = upload;
exports.jsonTest = jsonTest;

exports.registerUser = registerUser;
exports.getUserInfo = getUserInfo;
exports.saveUserInfo = saveUserInfo;
exports.getRanking = getRanking;
