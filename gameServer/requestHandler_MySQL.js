var mysql = require('./mysql');
var protocol = require('./protocol');
var element = require('./protocolElement');
var assert = require('assert');
var toRank = require('./request');
var route = require('./router');
var log = require('./log');

function write(res, type, str) {
	res.writeHead(200, {'Content-Type': type, 'Content-Length':str.length});
	res.write(str);
	res.end();
}

function versionInfoHandler(response, data){
	var versionInfo = protocol.versionInfo;
	assert.notEqual(data['version'], 0.4);
	versionInfo['version'] = data['version'];
} // end versionInfoHandler

function clientVersionInfoHandler(response, data){
	var clientVersionInfo = protocol.clientVersionInfo;
	assert.notEqual(data['version'], 0.1);
	clientVersionInfo['version'] = data['version'];
} // end clientVersionInfoHandler

function registerAccountHandler(response, data){
	var registerAccount = protocol.registerAccount;
	assert.notEqual(data['k_id'], '');
	registerAccount['k_id'] = data['k_id'];
	
	var now = new Date().getTime();

	var procedure = 'sea_CreateUser';
	var params = "'" + registerAccount['k_id'] + "', " + now + "";

	var res = protocol.registerAccountReply;
	res['k_id'] = registerAccount['k_id'];

	var callback = function (response, results, fields) {
		if (results[0] === 0) {
			log.addLog('DEBUG', 'Already exsisted account');
			res['result'] = false;
		}
		else {
			res['result'] = true;
		}
		write(response, 'application/json', JSON.stringify(res));
	}

	mysql.call(response, procedure, params, callback);
} // end registerAccountHandler

function unregisterAccountHandler(response, data){
	var unregisterAccount = protocol.unregisterAccount;
	assert.notEqual(data['k_id'], '');
	unregisterAccount['k_id'] = data['k_id'];

	var procedure = 'sea_LoadUser';
	var params = "'" + unregisterAccount['k_id'] + "'";

	var res = protocol.unregisterAccountReply;
	res['k_id'] = unregisterAccount['k_id'];

	var callback = function (response, results, fields) {
		if (results[0] === 0) {
			log.addLog('DEBUG', 'Invalid account');
			res['result'] = false;
			write(response, 'application/json', JSON.stringify(res));
		}
		else {
			procedure = 'sea_DeleteUser';
			params = results[0][0]['id'];

			var unregisterAccountCallback = function (response, results, fields) {
				res['result'] = true;
				write(response, 'application/json', JSON.stringify(res));
			};

			mysql.call(response, procedure, params, unregisterAccountCallback);
		}
	};

	mysql.call(response, procedure, params, callback);
} // end unregisterAccountHandler

function loadUserInfoHandler(response, data){
	var loadUserInfo = protocol.loadUserInfo;
	assert.notEqual(data['k_id'], '');
	loadUserInfo['k_id'] = data['k_id'];
	
	var procedure = 'sea_LoadUser';
	var params = "'" + loadUserInfo['k_id'] + "'";

	var res = protocol.accountInfo;
	res['k_id'] = loadUserInfo['k_id'];

	var callback = function (response, results, fields) {
		if (results[0] === 0) {
			log.addLog('DEBUG', 'Invalid account');
			res['result'] = false;
			write(response, 'application/json', JSON.stringify(res));
		}
		else {
			procedure = 'sea_LoadUserInfo';
			//console.log(results[0][0]['id']);
			params = results[0][0]['id'];

			var loadUserInfoCallback = function (response, results, fields) {
				for (var val in results[0][0]) {
					if (res[''+val] === 0 || res[''+val] === '') {
						res[''+val] = results[0][0][''+val];
					}
				}
				res['result'] = true;

				write(response, 'application/json', JSON.stringify(res));
			}

			mysql.call(response, procedure, params, loadUserInfoCallback);
		}
	}

	mysql.call(response, procedure, params, callback);
} // end loadUserInfoHandler

function checkInChargeHandler(response, data){
	var checkInCharge = protocol.checkInCharge;
	assert.notEqual(data['k_id'], '');
	checkInCharge['k_id'] = data['k_id'];

	var procedure = 'sea_LoadUser';
	var params = "'" + checkInCharge['k_id'] + "'";

	var res = protocol.chargeInfo;
	res['k_id'] = checkInCharge['k_id'];

	var callback = function (response, results, fields) {
		if (results[0] === 0) {
			log.addLog('DEBUG', 'Invalid account');
			res['result'] = false;
			write(response, 'application/json', JSON.stringify(res));
		}
		else {
			var id = results[0][0]['id'];
			procedure = 'sea_CheckInCharge';
			params = id;
			res['result'] = true;

			var checkInChargeCallback = function (response, results, fields) {
				var last = results[0][0]['last_charged_time'];
				var heart = results[0][0]['heart'];
				var heartMax = 99;
				var now = new Date().getTime();

				if (heartMax === heart) {
					procedure = 'sea_UpdateLastChargeTime';
					params = id + ', ' + now;
					res['heart'] = heartMax;
					res['last_charged_time'] = now;

					mysql.call(response, procedure, params, function (response, results, fields) {
						write(response, 'application/json', JSON.stringify(res));
					});
				}
				else {
					var diff = now - last;
					var quotient = diff / 600;
					var uptodate = last + (600 * quotient);

					if (quotient) {
						heart += quotient;
						if (heart >= heartMax) {
							heart = heartMax;
						}						
						procedure = 'sea_UpdateLastChargeTime';
						params = id + ', ' + uptodate;
						res['heart'] = heartMax;
						res['last_charged_time'] = uptodate;
					
						mysql.call(response, procedure, params, function (response, results, fields) {
							procedure = 'sea_UpdateHeart';
							params = id + ', ' + heart;

							mysql.call(response, procedure, params, function (response, results, fields) {
								write(response, 'application/json', JSON.stringify(res));
							});
						});
					}
					else {
						chargeInfo['heart'] = heart;
						chargeInfo['last_charged_time'] = last;
						write(response, 'application/json', JSON.stringify(res));
					} // end else
				} // end else
			} // checkInChargeCallback
			mysql.call(response, procedure, params, checkInChargeCallback);
		} // end else
	} // sea_LoadUser

	mysql.call(response, procedure, params, callback);
} // end checkInChargeHandler

function startGameHandler(response, data){
	var startGame = protocol.startGame;
	assert.notEqual(data['k_id'], '');
	startGame['k_id'] = data['k_id'];
	assert.notEqual(data['selected_character'], 0);
	startGame['selected_character'] = data['selected_character'];
	assert.notEqual(data['selected_assistant'], 0);
	startGame['selected_assistant'] = data['selected_assistant'];

	var procedure = 'sea_LoadUser';
	var params = "'" + startGame['k_id'] + "'";

	var res = protocol.startGameReply;
	res['k_id'] = startGame['k_id'];

	var heartMax = 99;

	var callback = function (response, results, fields) {
		if (results[0] === 0) {
			log.addLog('DEBUG', 'Invalid account');
			res['result'] = false;
			write(response, 'application/json', JSON.stringify(res));
		}
		else {
			var id = results[0][0]['id'];
			procedure = 'sea_StartGame';
			params = id;

			var startGameCallback = function (response, results, fields) {
				var character = results[0][0]['selected_character'];
				var assistant = results[0][0]['selected_assistant'];
				var heart = results[0][0]['heart'];
				var last = results[0][0]['last_charged_time'];

				if (heart < 1) {
					log.addLog('DEBUG', 'Not enough heart');
					// FIXME
					res['result'] = false;
					write(response, 'application/json', JSON.stringify(res));
				}
				else if (character != startGame['selected_character'] 
						|| assistant != startGame['selected_assistant']) {
					log.addLog('ERROR', 'doesn\'t match with DB'); 
					// FIXME
					res['result'] = false;
					write(response, 'application/json', JSON.stringify(res));
				}
				else {
					res['result'] = true;
					
					if (heart == heartMax) {
						last = new Date().getTime();	
					}
					heart -= 1;

					procedure = 'sea_UpdateLastChargeTime';
					params = id + ', ' + last;
					res['heart'] = heart;
					res['last_charged_time'] = last;
				
					mysql.call(response, procedure, params, function (response, results, fields) {
						procedure = 'sea_UpdateHeart';
						params = id + ', ' + heart;

						mysql.call(response, procedure, params, function (response, results, fields) {
							write(response, 'application/json', JSON.stringify(res));
						});
					});
				}
			}
			mysql.call(response, procedure, params, startGameCallback);
		} // end else
	}; // end sea_LoadUser

	mysql.call(response, procedure, params, callback);
} // end startGameHandler

function endGameHandler(response, data){
	var endGame = protocol.endGame;
	assert.notEqual(data['k_id'], '');
	endGame['k_id'] = data['k_id'];
	assert.notEqual(data['dist'], 0);
	endGame['dist'] = data['dist'];
	assert.notEqual(data['kill'], 0);
	endGame['kill'] = data['kill'];
//	assert.notEqual(data['usedItem'], 0);
	endGame['usedItem'] = data['usedItem'];

	var procedure = 'sea_LoadUser';
	var params = "'" + endGame['k_id'] + "'";

	var res = protocol.gameResult;
	res['k_id'] = endGame['k_id'];

	var callback = function (response, results, fields) {
		if (results[0] === 0) {
			log.addLog('DEBUG', 'Invalid account');
			res['result'] = false;
			write(response, 'application/json', JSON.stringify(res));
		}
		else {
			// FIXME
			var id = results[0][0]['id'];
			var score = 10*(1+endGame['dist']) * (1+endGame['kill']);
			procedure = 'sea_UpdateUserLog';
			params = id + ', ' + score + ', ' + endGame['dist'] + ', ' + endGame['kill'];
			res['result'] = true;

			var updateUserLogCallback = function (response, results, fields) {
				res['k_id'] = endGame['k_id'];
				res['score'] = score;

				write(response, 'application/json', JSON.stringify(res));
			};

			mysql.call(response, procedure, params, updateUserLogCallback);

			if (endGame['usedItem'] > 0) {
				procedure = 'sea_AddUserItem';
				params = "'" + id + ', ' + 1 + "'";

				mysql.call(response, procedure, params, function (response, results, fields) {
					
				});
			}
		}
	};

	mysql.call(response, procedure, params, callback);
} // end endGameHandler

function loadRankInfoHandler(response, data){
	var loadRankInfo = protocol.loadRankInfo;
	assert.notEqual(data['k_id'], '');
	loadRankInfo['k_id'] = data['k_id'];

	var requestRanking = protocol.requestRanking;
	requestRanking['k_id'] = loadRankInfo['k_id'];
	
	toRank.request(response, requestRanking, route.reqRoute);
} // end loadRankInfoHandler

function requestPointRewardHandler(response, data){
	var requestPointReward = protocol.requestPointReward;
	assert.notEqual(data['k_id'], '');
	requestPointReward['k_id'] = data['k_id'];
	assert.notEqual(data['point'], 0);
	requestPointReward['point'] = data['point'];

	// TODO
} // end requestPointRewardHandler

function registerAccountReplyHandler(response, data){
	var registerAccountReply = protocol.registerAccountReply;
	assert.notEqual(data['k_id'], '');
	registerAccountReply['k_id'] = data['k_id'];
	assert.notEqual(data['result'], 0);
	registerAccountReply['result'] = data['result'];
} // end registerAccountReplyHandler

function unregisterAccountReplyHandler(response, data){
	var unregisterAccountReply = protocol.unregisterAccountReply;
	assert.notEqual(data['k_id'], '');
	unregisterAccountReply['k_id'] = data['k_id'];
	assert.notEqual(data['result'], 0);
	unregisterAccountReply['result'] = data['result'];
} // end unregisterAccountReplyHandler

function startGameReplyHandler(response, data){
	var startGameReply = protocol.startGameReply;
	assert.notEqual(data['k_id'], '');
	startGameReply['k_id'] = data['k_id'];
	assert.notEqual(data['result'], 0);
	startGameReply['result'] = data['result'];
	assert.notEqual(data['heart'], 0);
	startGameReply['heart'] = data['heart'];
	assert.notEqual(data['last_charged_time'], 0);
	startGameReply['last_charged_time'] = data['last_charged_time'];
} // end startGameReplyHandler

function accountInfoHandler(response, data){
	var accountInfo = protocol.accountInfo;
	assert.notEqual(data['k_id'], '');
	accountInfo['k_id'] = data['k_id'];
	assert.notEqual(data['coin'], 0);
	accountInfo['coin'] = data['coin'];
	assert.notEqual(data['mineral'], 0);
	accountInfo['mineral'] = data['mineral'];
	assert.notEqual(data['lv'], 0);
	accountInfo['lv'] = data['lv'];
	assert.notEqual(data['exp'], 0);
	accountInfo['exp'] = data['exp'];
	assert.notEqual(data['point'], 0);
	accountInfo['point'] = data['point'];
	assert.notEqual(data['heart'], 0);
	accountInfo['heart'] = data['heart'];
	assert.notEqual(data['last_charged_time'], 0);
	accountInfo['last_charged_time'] = data['last_charged_time'];
	assert.notEqual(data['selected_character'], 0);
	accountInfo['selected_character'] = data['selected_character'];
	assert.notEqual(data['selected_assistant'], 0);
	accountInfo['selected_assistant'] = data['selected_assistant'];
	assert.notEqual(data['characters'], 0);
	accountInfo['characters'] = data['characters'];
	assert.notEqual(data['basic_charac_lv'], 0);
	accountInfo['basic_charac_lv'] = data['basic_charac_lv'];
	assert.notEqual(data['assistants'], 0);
	accountInfo['assistants'] = data['assistants'];
	assert.notEqual(data['basic_assist_lv'], 0);
	accountInfo['basic_assist_lv'] = data['basic_assist_lv'];
	assert.notEqual(data['items'], 0);
	accountInfo['items'] = data['items'];
	assert.notEqual(data['count'], 0);
	accountInfo['count'] = data['count'];
} // end accountInfoHandler

function chargeInfoHandler(response, data){
	var chargeInfo = protocol.chargeInfo;
	assert.notEqual(data['k_id'], '');
	chargeInfo['k_id'] = data['k_id'];
	assert.notEqual(data['heart'], 0);
	chargeInfo['heart'] = data['heart'];
	assert.notEqual(data['last_charged_time'], 0);
	chargeInfo['last_charged_time'] = data['last_charged_time'];
} // end chargeInfoHandler

function rankInfoHandler(response, data){
	var rankInfo = protocol.rankInfo;
	assert.notEqual(data['k_id'], '');
	rankInfo['k_id'] = data['k_id'];
	assert.notEqual(data['overall_ranking'], 0);
	rankInfo['overall_ranking'] = data['overall_ranking'];
	assert.notEqual(data['rank_list'], []);
	rankInfo['rank_list'] = data['rank_list'];
} // end rankInfoHandler

function gameResultHandler(response, data){
	var gameResult = protocol.gameResult;
	assert.notEqual(data['k_id'], '');
	gameResult['k_id'] = data['k_id'];
	assert.notEqual(data['score'], 0);
	gameResult['score'] = data['score'];
} // end gameResultHandler

function versionInfoReplyHandler(response, data){
	var versionInfoReply = protocol.versionInfoReply;
	assert.notEqual(data['result'], 0);
	versionInfoReply['result'] = data['result'];
} // end versionInfoReplyHandler

function clientVerionInfoReplyHandler(response, data){
	var clientVerionInfoReply = protocol.clientVerionInfoReply;
	assert.notEqual(data['result'], 0);
	clientVerionInfoReply['result'] = data['result'];
} // end clientVerionInfoReplyHandler

function requestRankingReplyHandler(response, data){
	var requestRankingReply = protocol.requestRankingReply;
	assert.notEqual(data['k_id'], '');
	requestRankingReply['k_id'] = data['k_id'];
	assert.notEqual(data['overall_ranking'], 0);
	requestRankingReply['overall_ranking'] = data['overall_ranking'];

	var procedure = 'sea_LoadUser';
	var params = "'" + requestRankingReply['k_id'] + "'";

	var res = protocol.rankInfo;
	res['k_id'] = requestRankingReply['k_id'];
	res['overall_ranking'] = requestRankingReply['overall_ranking'];

	var callback = function (response, results, fields) {
		if (results[0] === 0) {
			log.addLog('DEBUG', 'Invalid account');
			res['result'] = false;
			write(response, 'application/json', JSON.stringify(res));
		}
		else {
			var id = results[0][0]['id'];
			procedure = 'sea_RankingList';
			params = '';
			res['result'] = true;

			var rankingListCallback = function (response, results, fields) {
				for (var i = 0; i < results[0].length; ++i) {
					var k_id = results[0][i]['k_id'];
					var highest_score = results[0][i]['highest_score'];

					res.rank_list.push({'k_id':k_id, 'highest_score':highest_score});
				}

				write(response, 'application/json', JSON.stringify(res));
			};

			mysql.call(response, procedure, params, rankingListCallback);
		}
	};

	mysql.call(response, procedure, params, callback);
} // end requestRankingReplyHandler

function requestRankingHandler(response, data){
	var requestRanking = protocol.requestRanking;
	assert.notEqual(data['k_id'], '');
	requestRanking['k_id'] = data['k_id'];

	var procedure = 'sea_LoadUser';
	var params = "'" + requestRanking['k_id'] + "'";

	var res = protocol.requestRankingReply;
	res['k_id'] = requestRanking['k_id'];

	var callback = function (response, results, fields) {
		if (results[0] === 0) {
			log.addLog('DEBUG', 'Invalid account');
			res['result'] = false;
			write(response, 'application/json', JSON.stringify(res));
		}
		else {
			var id = results[0][0]['id'];
			procedure = 'sea_Ranking';
			params = id;
			res['result'] = true;

			var rankingCallback = function (response, results, fields) {
				res['overall_ranking'] = results[0][0]['rank'];

				write(response, 'application/json', JSON.stringify(res));
			};

			mysql.call(response, procedure, params, rankingCallback);
		}
	};

	mysql.call(response, procedure, params, callback);

} // end requestRankingHandler

exports.versionInfoHandler = versionInfoHandler;
exports.clientVersionInfoHandler = clientVersionInfoHandler;
exports.registerAccountHandler = registerAccountHandler;
exports.unregisterAccountHandler = unregisterAccountHandler;
exports.loadUserInfoHandler = loadUserInfoHandler;
exports.checkInChargeHandler = checkInChargeHandler;
exports.startGameHandler = startGameHandler;
exports.endGameHandler = endGameHandler;
exports.loadRankInfoHandler = loadRankInfoHandler;
exports.requestPointRewardHandler = requestPointRewardHandler;
exports.registerAccountReplyHandler = registerAccountReplyHandler;
exports.unregisterAccountReplyHandler = unregisterAccountReplyHandler;
exports.startGameReplyHandler = startGameReplyHandler;
exports.accountInfoHandler = accountInfoHandler;
exports.chargeInfoHandler = chargeInfoHandler;
exports.rankInfoHandler = rankInfoHandler;
exports.gameResultHandler = gameResultHandler;
exports.versionInfoReplyHandler = versionInfoReplyHandler;
exports.clientVerionInfoReplyHandler = clientVerionInfoReplyHandler;
exports.requestRankingReplyHandler = requestRankingReplyHandler;
exports.requestRankingHandler = requestRankingHandler;
