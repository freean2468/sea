var mongodb = require('./mongodb');
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

	var doc = {
		k_id: registerAccount['k_id'],
	};

	var callback = function (res){
		console.log(res);
	};
	
	mongodb.insert('user', doc, callback);
} // end registerAccountHandler

function unregisterAccountHandler(response, data){
	var unregisterAccount = c2sProtocol.unregisterAccount;
	assert.notEqual(data['k_id'], '');
	unregisterAccount['k_id'] = data['k_id'];
} // end unregisterAccountHandler

function loadUserInfoHandler(response, data){
	var loadUserInfo = c2sProtocol.loadUserInfo;
	assert.notEqual(data['k_id'], '');
	loadUserInfo['k_id'] = data['k_id'];
} // end loadUserInfoHandler

function checkInChargeHandler(response, data){
	var checkInCharge = c2sProtocol.checkInCharge;
	assert.notEqual(data['k_id'], '');
	checkInCharge['k_id'] = data['k_id'];
} // end checkInChargeHandler

function startGameHandler(response, data){
	var startGame = c2sProtocol.startGame;
	assert.notEqual(data['k_id'], '');
	startGame['k_id'] = data['k_id'];
	assert.notEqual(data['selected_character'], 0);
	startGame['selected_character'] = data['selected_character'];
	assert.notEqual(data['selected_assistant'], 0);
	startGame['selected_assistant'] = data['selected_assistant'];
} // end startGameHandler

function endGameHandler(response, data){
	var endGame = c2sProtocol.endGame;
	assert.notEqual(data['k_id'], '');
	endGame['k_id'] = data['k_id'];
	assert.notEqual(data['dist'], 0);
	endGame['dist'] = data['dist'];
	assert.notEqual(data['kill'], 0);
	endGame['kill'] = data['kill'];
	assert.notEqual(data['usedItem'], 0);
	endGame['usedItem'] = data['usedItem'];
} // end endGameHandler

function loadRankInfoHandler(response, data){
	var loadRankInfo = c2sProtocol.loadRankInfo;
	assert.notEqual(data['k_id'], '');
	loadRankInfo['k_id'] = data['k_id'];
} // end loadRankInfoHandler

function requestPointRewardHandler(response, data){
	var requestPointReward = c2sProtocol.requestPointReward;
	assert.notEqual(data['k_id'], '');
	requestPointReward['k_id'] = data['k_id'];
	assert.notEqual(data['point'], 0);
	requestPointReward['point'] = data['point'];
} // end requestPointRewardHandler

function requestRankingReplyHandler(response, data){
	var requestRankingReply = r2gProtocol.requestRankingReply;
	assert.notEqual(data['k_id'], '');
	requestRankingReply['k_id'] = data['k_id'];
	assert.notEqual(data['result'], 0);
	requestRankingReply['result'] = data['result'];
	assert.notEqual(data['overall_ranking'], 0);
	requestRankingReply['overall_ranking'] = data['overall_ranking'];
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
