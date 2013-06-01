var mysql = require('./mysql');
var mongodb = require('./mongodb');

var count = 0;

function sort(results) {
	var sorted = results;

	process.send(sorted);

	setTimeout(calc, 1000);
}

function calc () { 
	var procedure = 'sea_Ranking';
	var params = '';

	var callback = function (results, fields) {
		if (results[0] === 0) {
			log.addLog('DEBUG', 'Something wrong happened');
		}
		else {
			sort(results[0]);
		}
	};

	mysql.call(procedure, params, callback);
}

calc();
