var mysql = require('mysql');
var log = require('./log');

var pool = mysql.createPool({
	host: 'localhost',
	port: 3306,
	database: 'sea_log',
	charset: 'UTF8_GENERAL_CI',
	supportBigNumbers: true,
	user: 'root',
	password: 'xmongames',
	waitForConnections: true,
	connectionLimit: 60,
});

function query(sql, escaped, callback) {
	pool.getConnection(function(err, connection) {
		handleDisconnect(connection);
	
		var query = connection.query(sql, escaped, function(err, results, fields) {
			if (err) throw err;
	
			connection.end();
			callback(results, fields);
		});
	});
}

function call(procedure, params, callback) {
	pool.getConnection(function(err, connection) {
		var call = 'CALL ' + procedure + '(' + params + ')';

		connection.query(call, function(err, results, fields) {
			if (err) throw err;

			connection.end();
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

exports.query = query;
exports.call = call;
