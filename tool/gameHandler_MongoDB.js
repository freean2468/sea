var mongodb = require('./mongodb');
var build = require('./protoBuild');
var assert = require('assert');
var encrypt = require('./util').encrypt;
var toStream = require('./util').toStream;
var UUID = require('./util').UUID;
var request = require('./request').request;
var registerSession = require('./session').registerSession;
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

function LoginHandler(response, data){
	var msg = build.Login.decode(data);
} // end LoginHandler

function LogoutHandler(response, data){
	var msg = build.Logout.decode(data);
} // end LogoutHandler

function CheckInChargeHandler(response, data){
	var CheckInCharge = c2s.build('C2S').CheckInCharge;
	var msg = CheckInCharge.decode(data);
} // end CheckInChargeHandler

function SelectCharacterHandler(response, data){
	var msg = build.SelectCharacter.decode(data);
} // end SelectCharacterHandler

function SelectAssistantHandler(response, data){
	var msg = build.SelectAssistant.decode(data);
} // end SelectAssistantHandler

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
exports.LoginHandler = LoginHandler;
exports.LogoutHandler = LogoutHandler;
exports.CheckInChargeHandler = CheckInChargeHandler;
exports.SelectCharacterHandler = SelectCharacterHandler;
exports.SelectAssistantHandler = SelectAssistantHandler;
exports.StartGameHandler = StartGameHandler;
exports.EndGameHandler = EndGameHandler;
exports.LoadRankInfoHandler = LoadRankInfoHandler;
exports.RequestPointRewardHandler = RequestPointRewardHandler;
