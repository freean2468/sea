var mongodb = require('./mongodb');
var build = require('./g2l-proto-build');
var assert = require('assert');
var toStream = require('../common/util').toStream;
var UUID = require('../common/util').UUID;
var convertMS2S = require('../common/util').convertMS2S;

function write(res, stream) {
	res.writeHead(200, {'Content-Type': 'application/octet-stream', 'Content-Length':stream.length});
	res.write(stream);
	res.end();
}

function inspectField(msg) {
	for (var val in msg) {
		if (msg[val + ''] === undefined) {
			return false;
		}
	}
	return true;
}

function AccountLoginHandler(response, data, logMgr) {
	var msg = build.AccountLogin.decode(data);
} // end AccountLoginHandler

function ConcurrentUserHandler(response, data, logMgr) {
	var msg = build.ConcurrentUser.decode(data);
} // end ConcurrentUserHandler

function PeakConcurrentUserHandler(response, data, logMgr) {
	var msg = build.PeakConcurrentUser.decode(data);
} // end PeakConcurrentUserHandler

function UniqueVisitorHandler(response, data, logMgr) {
	var msg = build.UniqueVisitor.decode(data);
} // end UniqueVisitorHandler

function RetentionRateHandler(response, data, logMgr) {
	var msg = build.RetentionRate.decode(data);
} // end RetentionRateHandler

function PayAssistantHandler(response, data, logMgr) {
	var msg = build.PayAssistant.decode(data);
} // end PayAssistantHandler

function PayCharacterHandler(response, data, logMgr) {
	var msg = build.PayCharacter.decode(data);
} // end PayCharacterHandler

function PayCoinHandler(response, data, logMgr) {
	var msg = build.PayCoin.decode(data);
} // end PayCoinHandler

function PayHeartHandler(response, data, logMgr) {
	var msg = build.PayHeart.decode(data);
} // end PayHeartHandler

function PayItemHandler(response, data, logMgr) {
	var msg = build.PayItem.decode(data);
} // end PayItemHandler

function PayMoneyHandler(response, data, logMgr) {
	var msg = build.PayMoney.decode(data);
} // end PayMoneyHandler

function UserGamePlayHandler(response, data, logMgr) {
	var msg = build.UserGamePlay.decode(data);
} // end UserGamePlayHandler

function UserRegisterHandler(response, data, logMgr) {
	var msg = build.UserRegister.decode(data);
} // end UserRegisterHandler

function UserUnregisterHandler(response, data, logMgr) {
	var msg = build.UserUnregister.decode(data);
} // end UserUnregisterHandler

exports.AccountLoginHandler = AccountLoginHandler;
exports.ConcurrentUserHandler = ConcurrentUserHandler;
exports.PeakConcurrentUserHandler = PeakConcurrentUserHandler;
exports.UniqueVisitorHandler = UniqueVisitorHandler;
exports.RetentionRateHandler = RetentionRateHandler;
exports.PayAssistantHandler = PayAssistantHandler;
exports.PayCharacterHandler = PayCharacterHandler;
exports.PayCoinHandler = PayCoinHandler;
exports.PayHeartHandler = PayHeartHandler;
exports.PayItemHandler = PayItemHandler;
exports.PayMoneyHandler = PayMoneyHandler;
exports.UserGamePlayHandler = UserGamePlayHandler;
exports.UserRegisterHandler = UserRegisterHandler;
exports.UserUnregisterHandler = UserUnregisterHandler;