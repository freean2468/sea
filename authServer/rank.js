var mysql = require('./mysql');
var mongodb = require('./mongodb');

var count = 0;

function pickCriteria(list) {
	return (list[0]['highest_score'] + list[list.length-1]['highest_score'] + list[parseInt(list.length/2)]['highest_score']) / 3;
}

function quickSort(list) {
	if (2 < list.length) {
		var criteria = pickCriteria(list);

		var little = [];
		var bigger = [];

		for (i = 0; i < list.length; ++i) {
			var score = list[i]['highest_score'];

			if (criteria < score) {
				bigger.push(list[i]);
			}
			else {
				little.push(list[i]);
			}
		}

		if (list.length === little.length ||
			list.length === bigger.length) {
			return list;
		}

		little = quickSort(little);
		bigger = quickSort(bigger);

		return bigger.concat(little);
	}
	else if (list.length < 2) {
		return list;
	}
	else if (list.length < 3) {
		if (list[1]['highest_score'] < list[0]['highest_score']) {
			var val = list[0];
			list[0] = list[1];
			list[0] = val;
		}
		return list;
	}	
}

// TODO sort user lists with score using quick sort
function sort(results) {
	var sorted = quickSort(results);

	process.send(sorted);

	setTimeout(calc, 1000);
}

function calc () { 
	var procedure = 'sea_Ranking';
	var params = '';

	var callback = function (results, fields) {
		if (results[0] === 0) {
			log.addLog('DEBUG', 'Something wrong happened in rank calc');
		}
		else {
			sort(results[0]);
		}
	};

	mysql.call(procedure, params, callback);
}

calc();
