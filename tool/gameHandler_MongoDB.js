var mongodb = require('./mongodb');
var build = require('./protoBuild');
var assert = require('assert');
var encrypt = require('./util').encrypt;
var toStream = require('./util').toStream;
var request = require('./request').request;
var log = require('./log');

function write(res, stream) {
	res.writeHead(200, {'Content-Type': 'application/octet-stream', 'Content-Length':stream.length});
	res.write(stream);
	res.end();
}

function VersionInfoHandler(response, data){
	var VersionInfo = ver.build('VER').VersionInfo;
	var msg = VersionInfo.decode(data);
} // end VersionInfoHandler

function VersionInfoReplyHandler(response, data){
	var msg = build.VersionInfoReply.decode(data);
} // end VersionInfoReplyHandler

function ClientVersionInfoHandler(response, data){
	var ClientVersionInfo = ver.build('VER').ClientVersionInfo;
	var msg = ClientVersionInfo.decode(data);
} // end ClientVersionInfoHandler

function ClientVersionInfoReplyHandler(response, data){
	var msg = build.ClientVersionInfoReply.decode(data);
} // end ClientVersionInfoReplyHandler

function RegisterAccountHandler(response, data){
	var RegisterAccount = c2s.build('C2S').RegisterAccount;
	var msg = RegisterAccount.decode(data);
} // end RegisterAccountHandler

function UnregisterAccountHandler(response, data){
	var msg = build.UnregisterAccount.decode(data);
} // end UnregisterAccountHandler

function LoadUserInfoHandler(response, data){
	var LoadUserInfo = c2s.build('C2S').LoadUserInfo;
	var msg = LoadUserInfo.decode(data);
} // end LoadUserInfoHandler

function CheckInChargeHandler(response, data){
	var CheckInCharge = c2s.build('C2S').CheckInCharge;
	var msg = CheckInCharge.decode(data);
} // end CheckInChargeHandler

function StartGameHandler(response, data){
	var StartGame = c2s.build('C2S').StartGame;
	var msg = StartGame.decode(data);
} // end StartGameHandler

function EndGameHandler(response, data){
	var EndGame = c2s.build('C2S').EndGame;
	var msg = EndGame.decode(data);
} // end EndGameHandler

function LoadRankInfoHandler(response, data){
	var LoadRankInfo = c2s.build('C2S').LoadRankInfo;
	var msg = LoadRankInfo.decode(data);
} // end LoadRankInfoHandler

function RequestPointRewardHandler(response, data){
	var RequestPointReward = c2s.build('C2S').RequestPointReward;
	var msg = RequestPointReward.decode(data);
} // end RequestPointRewardHandler

exports.VersionInfoHandler = VersionInfoHandler;
exports.VersionInfoReplyHandler = VersionInfoReplyHandler;
exports.ClientVersionInfoHandler = ClientVersionInfoHandler;
exports.ClientVersionInfoReplyHandler = ClientVersionInfoReplyHandler;
exports.RegisterAccountHandler = RegisterAccountHandler;
exports.UnregisterAccountHandler = UnregisterAccountHandler;
exports.LoadUserInfoHandler = LoadUserInfoHandler;
exports.CheckInChargeHandler = CheckInChargeHandler;
exports.StartGameHandler = StartGameHandler;
exports.EndGameHandler = EndGameHandler;
exports.LoadRankInfoHandler = LoadRankInfoHandler;
exports.RequestPointRewardHandler = RequestPointRewardHandler;
