var mysql = require('./mysql');
var verProtocol = require('./verProtocol');
var c2sProtocol = require('./c2sProtocol');
var s2cProtocol = require('./s2cProtocol');
var r2gProtocol = require('./r2gProtocol');
var g2rProtocol = require('./g2rProtocol');
var element = require('./protocolElement');
var assert = require('assert');
var toRank = require('./request');
var log = require('./log');

function write(res, type, str) {
	res.writeHead(200, {'Content-Type': type, 'Content-Length':str.length});
	res.write(str);
	res.end();
}

function requestRankingHandler(response, data){
	var requestRanking = g2rProtocol.requestRanking;
	assert.notEqual(data['k_id'], '');
	requestRanking['k_id'] = data['k_id'];
	assert.notEqual(data['result'], 0);
	requestRanking['result'] = data['result'];

	var procedure = 'sea_LoadUser';
	var params = "'" + requestRanking['k_id'] + "'";

	var res = r2gProtocol.requestRankingReply;
	res['k_id'] = requestRanking['k_id'];

	var callback = function (results, fields) {
		if (results[0] === 0) {
			log.addLog('DEBUG', 'Invalid account');
			res['result'] = false;
			write(response, 'application/json', JSON.stringify(res));
		}
		else {
			var rankingList = require('./server').rankingList;
			res['result'] = true;
			// FIXME
			res['ranking_list'] = []; 

			console.log('res["k_id"]: ', res['k_id']);

			for (var i = 0; i < rankingList.length; ++i) {
				var friendRankInfo = r2gProtocol.friendRankInfo;

				res['ranking_list'].push({'k_id': rankingList[i]['k_id'], 'highest_score': rankingList[i]['highest_score']});

				console.log('rankingList[', i, ']["k_id"]: ', rankingList[i]['k_id']);
				if (rankingList[i]['k_id'] === res['k_id']) {
					res['overall_ranking'] = i+1;
				}
			}

			write(response, 'application/json', JSON.stringify(res));
		}
	};

	mysql.call(procedure, params, callback);
} // end requestRankingHandler

exports.requestRankingHandler = requestRankingHandler;
