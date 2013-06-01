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

function versionInfoHandler(response, data){
	var versionInfo = verProtocol.versionInfo;
	assert.notEqual(data['version'], []);
	versionInfo['version'] = data['version'];
} // end versionInfoHandler

function clientVersionInfoHandler(response, data){
	var clientVersionInfo = verProtocol.clientVersionInfo;
	assert.notEqual(data['version'], []);
	clientVersionInfo['version'] = data['version'];
} // end clientVersionInfoHandler

function registerAccountHandler(response, data){
	var registerAccount = c2sProtocol.registerAccount;
	assert.notEqual(data['k_id'], '');
	registerAccount['k_id'] = data['k_id'];
	
	var now = new Date().getTime();

	var procedure = 'sea_CreateUser';
	var params = "'" + registerAccount['k_id'] + "', " + now + "";

	var res = s2cProtocol.registerAccountReply;
	res['k_id'] = registerAccount['k_id'];

	var callback = function (results, fields) {
		if (results[0] === 0) {
			log.addLog('DEBUG', 'Already exsisted account');
			res['result'] = false;
		}
		else {
			res['result'] = true;
		}
		write(response, 'application/json', JSON.stringify(res));
	}

	mysql.call(procedure, params, callback);
} // end registerAccountHandler

function unregisterAccountHandler(response, data){
	var unregisterAccount = c2sProtocol.unregisterAccount;
	assert.notEqual(data['k_id'], '');
	unregisterAccount['k_id'] = data['k_id'];

	var procedure = 'sea_LoadUser';
	var params = "'" + unregisterAccount['k_id'] + "'";

	var res = s2cProtocol.unregisterAccountReply;
	res['k_id'] = unregisterAccount['k_id'];

	var callback = function (results, fields) {
		if (results[0] === 0) {
			log.addLog('DEBUG', 'Invalid account');
			res['result'] = false;
			write(response, 'application/json', JSON.stringify(res));
		}
		else {
			procedure = 'sea_DeleteUser';
			params = results[0][0]['id'];

			var unregisterAccountCallback = function (results, fields) {
				res['result'] = true;
				write(response, 'application/json', JSON.stringify(res));
			};

			mysql.call(procedure, params, unregisterAccountCallback);
		}
	};

	mysql.call(procedure, params, callback);
} // end unregisterAccountHandler

function loadUserInfoHandler(response, data){
	var loadUserInfo = c2sProtocol.loadUserInfo;
	assert.notEqual(data['k_id'], '');
	loadUserInfo['k_id'] = data['k_id'];
	
	var procedure = 'sea_LoadUser';
	var params = "'" + loadUserInfo['k_id'] + "'";

	var res = s2cProtocol.accountInfo;
	res['k_id'] = loadUserInfo['k_id'];

	var callback = function (results, fields) {
		if (results[0] === 0) {
			log.addLog('DEBUG', 'Invalid account');
			res['result'] = false;
			write(response, 'application/json', JSON.stringify(res));
		}
		else {
			procedure = 'sea_LoadUserInfo';
			//console.log(results[0][0]['id']);
			params = results[0][0]['id'];

			var loadUserInfoCallback = function (results, fields) {
				for (var val in results[0][0]) {
					if (res[''+val] === 0 || res[''+val] === '') {
						res[''+val] = results[0][0][''+val];
					}
				}
				res['result'] = true;

				write(response, 'application/json', JSON.stringify(res));
			}

			mysql.call(procedure, params, loadUserInfoCallback);
		}
	}

	mysql.call(procedure, params, callback);
} // end loadUserInfoHandler

function checkInChargeHandler(response, data){
	var checkInCharge = c2sProtocol.checkInCharge;
	assert.notEqual(data['k_id'], '');
	checkInCharge['k_id'] = data['k_id'];

	var procedure = 'sea_LoadUser';
	var params = "'" + checkInCharge['k_id'] + "'";

	var res = s2cProtocol.chargeInfo;
	res['k_id'] = checkInCharge['k_id'];

	var callback = function (results, fields) {
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

			var checkInChargeCallback = function (results, fields) {
				var last = results[0][0]['last_charged_time'];
				var heart = results[0][0]['heart'];
				var heartMax = 99;
				var now = new Date().getTime();

				if (heartMax === heart) {
					procedure = 'sea_UpdateLastChargeTime';
					params = id + ', ' + now;
					res['heart'] = heartMax;
					res['last_charged_time'] = now;

					mysql.call(procedure, params, function (results, fields) {
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
					
						mysql.call(procedure, params, function (results, fields) {
							procedure = 'sea_UpdateHeart';
							params = id + ', ' + heart;

							mysql.call(procedure, params, function (results, fields) {
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
			mysql.call(procedure, params, checkInChargeCallback);
		} // end else
	} // sea_LoadUser

	mysql.call(procedure, params, callback);
} // end checkInChargeHandler

function startGameHandler(response, data){
	var startGame = c2sProtocol.startGame;
	assert.notEqual(data['k_id'], '');
	startGame['k_id'] = data['k_id'];
	assert.notEqual(data['selected_character'], 0);
	startGame['selected_character'] = data['selected_character'];
	assert.notEqual(data['selected_assistant'], 0);
	startGame['selected_assistant'] = data['selected_assistant'];

	var procedure = 'sea_LoadUser';
	var params = "'" + startGame['k_id'] + "'";

	var res = s2cProtocol.startGameReply;
	res['k_id'] = startGame['k_id'];

	var heartMax = 99;

	var callback = function (results, fields) {
		if (results[0] === 0) {
			log.addLog('DEBUG', 'Invalid account');
			res['result'] = false;
			write(response, 'application/json', JSON.stringify(res));
		}
		else {
			var id = results[0][0]['id'];
			procedure = 'sea_StartGame';
			params = id;

			var startGameCallback = function (results, fields) {
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
				
					mysql.call(procedure, params, function (results, fields) {
						procedure = 'sea_UpdateHeart';
						params = id + ', ' + heart;

						mysql.call(procedure, params, function (results, fields) {
							write(response, 'application/json', JSON.stringify(res));
						});
					});
				}
			}
			mysql.call(procedure, params, startGameCallback);
		} // end else
	}; // end sea_LoadUser

	mysql.call(procedure, params, callback);
} // end startGameHandler

function endGameHandler(response, data){
	var endGame = c2sProtocol.endGame;
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

	var res = s2cProtocol.gameResult;
	res['k_id'] = endGame['k_id'];

	var callback = function (results, fields) {
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

			var updateUserLogCallback = function (results, fields) {
				res['k_id'] = endGame['k_id'];
				res['score'] = score;

				write(response, 'application/json', JSON.stringify(res));
			};

			mysql.call(procedure, params, updateUserLogCallback);

			if (endGame['usedItem'] > 0) {
				procedure = 'sea_AddUserItem';
				params = "'" + id + ', ' + 1 + "'";

				mysql.call(procedure, params, function (results, fields) {
					
				});
			}
		}
	};

	mysql.call(procedure, params, callback);
} // end endGameHandler

function loadRankInfoHandler(response, data){
	var loadRankInfo = c2sProtocol.loadRankInfo;
	assert.notEqual(data['k_id'], '');
	loadRankInfo['k_id'] = data['k_id'];

	var requestRanking = g2rProtocol.requestRanking;
	requestRanking['k_id'] = loadRankInfo['k_id'];
	requestRanking['result'] = true;

	toRank.request(response, requestRanking, requestRankingReplyHandler);
} // end loadRankInfoHandler

function requestPointRewardHandler(response, data){
	var requestPointReward = c2sProtocol.requestPointReward;
	assert.notEqual(data['k_id'], '');
	requestPointReward['k_id'] = data['k_id'];
	assert.notEqual(data['point'], 0);
	requestPointReward['point'] = data['point'];

	// TODO
} // end requestPointRewardHandler

function requestRankingReplyHandler(response, data){
	var requestRankingReply = r2gProtocol.requestRankingReply;
	assert.notEqual(data['k_id'], '');
	requestRankingReply['k_id'] = data['k_id'];
	assert.notEqual(data['result'], 0);
	requestRankingReply['result'] = data['result'];
	assert.notEqual(data['overall_ranking'], 0);
	requestRankingReply['overall_ranking'] = data['overall_ranking'];
	assert.notEqual(data['ranking_list'], []);
	requestRankingReply['ranking_list'] = data['ranking_list'];

	var procedure = 'sea_LoadUser';
	var params = "'" + requestRankingReply['k_id'] + "'";

	var res = s2cProtocol.rankInfo;
	res['k_id'] = requestRankingReply['k_id'];
	res['overall_ranking'] = requestRankingReply['overall_ranking'];

	var callback = function (results, fields) {
		if (results[0] === 0) {
			log.addLog('DEBUG', 'Invalid account');
			res['result'] = false;
			write(response, 'application/json', JSON.stringify(res));
		}
		else {
			res['result'] = true;
			res['ranking_list'] = requestRankingReply['ranking_list'];

			write(response, 'application/json', JSON.stringify(res));
		}
	};

	mysql.call(procedure, params, callback);
} // end requestRankingReplyHandler

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
exports.requestRankingReplyHandler = requestRankingReplyHandler;
