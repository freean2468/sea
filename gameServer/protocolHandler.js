var mysql = require('./protocolHandler_MySQL');
var mongodb = require('./protocolHandler_MongoDB');
var options = {MYSQL: 1, MONGODB: 2};
var flags = options['MYSQL'] /*+ options['MONGODB']*/;

function versionInfoHandler(response, data) {
	if (flags & options['MYSQL']) mysql.versionInfoHandler(response, data);
	if (flags & options['MONGODB']) mongodb.versionInfoHandler(response, data);
}

function clientVersionInfoHandler(response, data) {
	if (flags & options['MYSQL']) mysql.clientVersionInfoHandler(response, data);
	if (flags & options['MONGODB']) mongodb.clientVersionInfoHandler(response, data);
}

function registerAccountHandler(response, data) {
	if (flags & options['MYSQL']) mysql.registerAccountHandler(response, data);
	if (flags & options['MONGODB']) mongodb.registerAccountHandler(response, data);
}

function unregisterAccountHandler(response, data) {
	if (flags & options['MYSQL']) mysql.unregisterAccountHandler(response, data);
	if (flags & options['MONGODB']) mongodb.unregisterAccountHandler(response, data);
}

function loadUserInfoHandler(response, data) {
	if (flags & options['MYSQL']) mysql.loadUserInfoHandler(response, data);
	if (flags & options['MONGODB']) mongodb.loadUserInfoHandler(response, data);
}

function checkInChargeHandler(response, data) {
	if (flags & options['MYSQL']) mysql.checkInChargeHandler(response, data);
	if (flags & options['MONGODB']) mongodb.checkInChargeHandler(response, data);
}

function startGameHandler(response, data) {
	if (flags & options['MYSQL']) mysql.startGameHandler(response, data);
	if (flags & options['MONGODB']) mongodb.startGameHandler(response, data);
}

function endGameHandler(response, data) {
	if (flags & options['MYSQL']) mysql.endGameHandler(response, data);
	if (flags & options['MONGODB']) mongodb.endGameHandler(response, data);
}

function loadRankInfoHandler(response, data) {
	if (flags & options['MYSQL']) mysql.loadRankInfoHandler(response, data);
	if (flags & options['MONGODB']) mongodb.loadRankInfoHandler(response, data);
}

function requestPointRewardHandler(response, data) {
	if (flags & options['MYSQL']) mysql.requestPointRewardHandler(response, data);
	if (flags & options['MONGODB']) mongodb.requestPointRewardHandler(response, data);
}

function registerAccountReplyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.registerAccountReplyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.registerAccountReplyHandler(response, data);
}

function unregisterAccountReplyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.unregisterAccountReplyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.unregisterAccountReplyHandler(response, data);
}

function startGameReplyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.startGameReplyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.startGameReplyHandler(response, data);
}

function accountInfoHandler(response, data) {
	if (flags & options['MYSQL']) mysql.accountInfoHandler(response, data);
	if (flags & options['MONGODB']) mongodb.accountInfoHandler(response, data);
}

function chargeInfoHandler(response, data) {
	if (flags & options['MYSQL']) mysql.chargeInfoHandler(response, data);
	if (flags & options['MONGODB']) mongodb.chargeInfoHandler(response, data);
}

function rankInfoHandler(response, data) {
	if (flags & options['MYSQL']) mysql.rankInfoHandler(response, data);
	if (flags & options['MONGODB']) mongodb.rankInfoHandler(response, data);
}

function gameResultHandler(response, data) {
	if (flags & options['MYSQL']) mysql.gameResultHandler(response, data);
	if (flags & options['MONGODB']) mongodb.gameResultHandler(response, data);
}

function versionInfoReplyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.versionInfoReplyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.versionInfoReplyHandler(response, data);
}

function clientVerionInfoReplyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.clientVerionInfoReplyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.clientVerionInfoReplyHandler(response, data);
}

function requestRankingReplyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.requestRankingReplyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.requestRankingReplyHandler(response, data);
}

function requestRankingHandler(response, data) {
	if (flags & options['MYSQL']) mysql.requestRankingHandler(response, data);
	if (flags & options['MONGODB']) mongodb.requestRankingHandler(response, data);
}

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
