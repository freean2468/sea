var mongodb = require('./mongodb');
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
	assert.notEqual(data['kId'], '');
	registerAccount['kId'] = data['kId'];

	var doc = {
		k_id: registerAccount['k_id'],
	};

	var callback = function (res){
		console.log(res);
	};
	
	mongodb.insert('user', doc, callback);

} // end registerAccountHandler

function unregisterAccountHandler(response, data){
	var unregisterAccount = protocol.unregisterAccount;
	assert.notEqual(data['k_id'], '');
	unregisterAccount['k_id'] = data['k_id'];
} // end unregisterAccountHandler

function loadUserInfoHandler(response, data){
	var loadUserInfo = protocol.loadUserInfo;
	assert.notEqual(data['kId'], '');
	loadUserInfo['kId'] = data['kId'];
} // end loadUserInfoHandler

function checkInChargeHandler(response, data){
	var checkInCharge = protocol.checkInCharge;
	assert.notEqual(data['kId'], '');
	checkInCharge['kId'] = data['kId'];
} // end checkInChargeHandler

function startGameHandler(response, data){
	var startGame = protocol.startGame;
	assert.notEqual(data['kId'], '');
	startGame['kId'] = data['kId'];
	assert.notEqual(data['selectedCharac'], 0);
	startGame['selectedCharac'] = data['selectedCharac'];
	assert.notEqual(data['selectedAssist'], 0);
	startGame['selectedAssist'] = data['selectedAssist'];
} // end startGameHandler

function endGameHandler(response, data){
	var endGame = protocol.endGame;
	assert.notEqual(data['kId'], '');
	endGame['kId'] = data['kId'];
	assert.notEqual(data['score'], 0);
	endGame['score'] = data['score'];
	assert.notEqual(data['dist'], 0);
	endGame['dist'] = data['dist'];
	assert.notEqual(data['kill'], 0);
	endGame['kill'] = data['kill'];
} // end endGameHandler

function loadRankInfoHandler(response, data){
	var loadRankInfo = protocol.loadRankInfo;
	assert.notEqual(data['k_id'], '');
	loadRankInfo['k_id'] = data['k_id'];
} // end loadRankInfoHandler

function requestPointRewardHandler(response, data){
	var requestPointReward = protocol.requestPointReward;
	assert.notEqual(data['kId'], '');
	requestPointReward['kId'] = data['kId'];
	assert.notEqual(data['point'], 0);
	requestPointReward['point'] = data['point'];
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
	assert.notEqual(data['ressult'], 0);
	unregisterAccountReply['ressult'] = data['ressult'];
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
	assert.notEqual(data['kId'], '');
	accountInfo['kId'] = data['kId'];
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
	assert.notEqual(data['lastChargedTime'], 0);
	accountInfo['lastChargedTime'] = data['lastChargedTime'];
	assert.notEqual(data['characters'], 0);
	accountInfo['characters'] = data['characters'];
	assert.notEqual(data['selectedCharacter'], 0);
	accountInfo['selectedCharacter'] = data['selectedCharacter'];
	assert.notEqual(data['assistants'], 0);
	accountInfo['assistants'] = data['assistants'];
	assert.notEqual(data['selectedAssistant'], 0);
	accountInfo['selectedAssistant'] = data['selectedAssistant'];
	assert.notEqual(data['items'], 0);
	accountInfo['items'] = data['items'];
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
} // end requestRankingReplyHandler

function requestRankingHandler(response, data){
	var requestRanking = protocol.requestRanking;
	assert.notEqual(data['k_id'], '');
	requestRanking['k_id'] = data['k_id'];
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
