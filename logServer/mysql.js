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
	var param = "'" + k_id + "'";
	mysql.call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

function addConcurrentUser (ccu, callback) {
	var procedure = 'sea_AddConcurrentUser';
	var param = ccu;
	mysql.call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

function peakConcurrentUser (callback) {
	var procedure = 'sea_PeakConcurrentUser';
	var param = '';
	mysql.call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

function addLogPayCharacter (k_id, character, coin, callback) {
	var procedure = 'sea_AddLogPayCharacter';
	var param = "'" + k_id + "', " + character + ', ' + coin;
	mysql.call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

function addLogPayCoin (k_id, coin, money, callback) {
	var procedure = 'sea_AddLogPayCoin';
	var param = "'" + k_id + "', " + coin + ', ' + money;
	mysql.call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

function addLogPayEnergy (k_id, energy, coin, callback) {
	var procedure = 'sea_AddLogPayEnergy';
	var param = "'" + k_id + "', " + energy + ', ' + coin;
	mysql.call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

function addLogPayItem (k_id, item, coin, callback) {
	var procedure = 'sea_AddLogPayItem';
	var param = "'" + k_id + "', " + item + ', ' + coin;
	mysql.call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

function addLogPayMoney (k_id, paid, rest, callback) {
	var procedure = 'sea_AddLogPayMoney';
	var param = "'" + k_id + "', " + paid + ', ' + rest;
	mysql.call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

function addPeakConcurrentUser (pccu, callback) {
	var procedure = 'sea_AddPeakConcurrentUser';
	var param = pccu;
	mysql.call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

function addRetentionRate (rr, callback) {
	var procedure = 'sea_AddRetentionRate';
	var param = rr;
	mysql.call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

function addUniqueVisitor (uv, callback) {
	var procedure = 'sea_AddUniqueVisitor';
	var param = uv;
	mysql.call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

function addLogPlay (k_id, character, score, kill, dist, time, exp_boost, item_last, max_attack, shield, ghostify, weapon_reinforce, bonus_heart, drop_up, magnet, bonus_score, callback) {
	var procedure = 'sea_AddPeakConcurrentUser';
	var param = "'" + k_id + "', " + character + ', ' + score + ', ' + kill + ', ' + dist + ', ' + time + ', ' + exp_boost + ', ' + item_last + ', ' + max_attack + ', ' + shield + ', ' + ghostify + ', ' + weapon_reinforce + ', ' + bonus_heart + ', ' + drop_up + ', ' + magnet + ', ' + bonus_score;
	mysql.call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

function addLogRegister (k_id, callback) {
	var procedure = 'sea_AddLogRegister';
	var param = "'" + k_id + "'";
	mysql.call(procedure, params, function (results, fields) { callback(results[0][0]); });
}

function addLogUnregister (k_id, callback) {
	var procedure = 'sea_AddLogUnregister';
	var param = "'" + k_id + "'";
	mysql.call(procedure, params, function (results, fields) { callback(results[0][0]); });
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
