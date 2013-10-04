var mysql = require('mysql');
var log = require('./log');

var pool = mysql.createPool({
	host: '127.0.0.1',
	port: 3306,
	database: 'sea_log',
	charset: 'UTF8_GENERAL_CI',
	supportBigNumbers: true,
	user: 'root',
	password: 'xmongames',
	waitForConnections: true,
	connectionLimit: 500,
});

function query(sql, escaped, callback) {
	pool.getConnection(function(err, connection) {
		handleDisconnect(connection);
	
		var query = connection.query(sql, escaped, function(err, results, fields) {
			if (err) throw err;
	
			connection.release();
			callback(results, fields);
		});
	});
}

function call(procedure, params, callback) {
	pool.getConnection(function(err, connection) {
		var call = 'CALL ' + procedure + '(' + params + ')';

		connection.query(call, function(err, results, fields) {
			if (err) throw err;

			connection.release();
			callback(results, fields);
		});
	});
}

function handleDisconnect(connection) {
	connection.on('error', function(err) {
		if (!err.fatal) {
			return;
		}

		if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
			throw err;
		}

		log.addLog('DEBUG', 'Re-connection lost connection: ' + err.stack);

		connection = mysql.createConnection(connection.config);

		handleDisconnect(connection);
		connection.connect();
	});
}

//
// MySQL Stored Procedure
//

function addLogLogin (k_id, callback) {
	var procedure = 'sea_AddLogLogin';
	var params = "'" + k_id + "'";
	call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

function addConcurrentUser (ccu, callback) {
	var procedure = 'sea_AddConcurrentUser';
	var params = ccu;
	call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

function peakConcurrentUser (callback) {
	var procedure = 'sea_PeakConcurrentUser';
	var params = '';
	call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

function addLogPayCharacter (k_id, character, coin, callback) {
	var procedure = 'sea_AddLogPayCharacter';
	var params = "'" + k_id + "', " + character + ', ' + coin;
	call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

function addLogPayCoin (k_id, coin, money, callback) {
	var procedure = 'sea_AddLogPayCoin';
	var params = "'" + k_id + "', " + coin + ', ' + money;
	call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

function addLogPayEnergy (k_id, energy, coin, callback) {
	var procedure = 'sea_AddLogPayEnergy';
	var params = "'" + k_id + "', " + energy + ', ' + coin;
	call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

function addLogPayItem (k_id, item, coin, callback) {
	var procedure = 'sea_AddLogPayItem';
	var params = "'" + k_id + "', " + item + ', ' + coin;
	call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

function addLogPayMoney (k_id, paid, rest, callback) {
	var procedure = 'sea_AddLogPayMoney';
	var params = "'" + k_id + "', " + paid + ', ' + rest;
	call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

function addPeakConcurrentUser (pccu, callback) {
	var procedure = 'sea_AddPeakConcurrentUser';
	var params = pccu;
	call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

function addRetentionRate (rr, callback) {
	var procedure = 'sea_AddRetentionRate';
	var params = rr;
	call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

function addUniqueVisitor (uv, callback) {
	var procedure = 'sea_AddUniqueVisitor';
	var params = uv;
	call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

function addLogPlay (k_id, character, score, kill, dist, time, exp_boost, item_last, shield, ghostify, immortal, random, callback) {
	var procedure = 'sea_AddLogPlay';
	var params = "'" + k_id + "', " + character + ', ' + score + ', ' + kill + ', ' + dist + ', ' + time + ', ' + exp_boost + ', ' + item_last + ', ' + shield + ', ' + ghostify + ', ' + immortal + ', ' + random;
	call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

function addLogRegister (k_id, callback) {
	var procedure = 'sea_AddLogRegister';
	var params = "'" + k_id + "'";
	call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

function addLogUnregister (k_id, callback) {
	var procedure = 'sea_AddLogUnregister';
	var params = "'" + k_id + "'";
	call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

//
//

module.exports = {
	'addConcurrentUser': addConcurrentUser,
	'peakConcurrentUser': peakConcurrentUser,

	'addLogLogin': addLogLogin,
	'addLogPayCharacter': addLogPayCharacter,
	'addLogPayCoin': addLogPayCoin,
	'addLogPayEnergy': addLogPayEnergy,
	'addLogPayItem': addLogPayItem,
	'addLogPayMoney': addLogPayMoney,
	'addLogPlay': addLogPlay,
	'addLogRegister': addLogRegister,
	'addLogUnregister': addLogUnregister,

	'addPeakConcurrentUser': addPeakConcurrentUser,
	'addRetentionRate': addRetentionRate,
	'addUniqueVisitor': addUniqueVisitor,
};
