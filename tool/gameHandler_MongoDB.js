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

function LoadPostedHoneyHandler(response, data){
	var msg = build.LoadPostedHoney.decode(data);
} // end LoadPostedHoneyHandler

function LoadPostedBatonHandler(response, data){
	var msg = build.LoadPostedBaton.decode(data);
} // end LoadPostedBatonHandler

function LoadPostedBatonResultHandler(response, data){
	var msg = build.LoadPostedBatonResult.decode(data);
} // end LoadPostedBatonResultHandler

function RequestPointRewardHandler(response, data){
	var RequestPointReward = c2s.build('C2S').RequestPointReward;
	var msg = RequestPointReward.decode(data);
} // end RequestPointRewardHandler

function BuyItemHandler(response, data){
	var msg = build.BuyItem.decode(data);
} // end BuyItemHandler

function SendHoneyHandler(response, data){
	var msg = build.SendHoney.decode(data);
} // end SendHoneyHandler

function AcceptHoneyHandler(response, data){
	var msg = build.AcceptHoney.decode(data);
} // end AcceptHoneyHandler

function RequestBatonHandler(response, data){
	var msg = build.RequestBaton.decode(data);
} // end RequestBatonHandler

function AcceptBatonHandler(response, data){
	var msg = build.AcceptBaton.decode(data);
} // end AcceptBatonHandler

function EndBatonHandler(response, data){
	var msg = build.EndBaton.decode(data);
} // end EndBatonHandler

function AcceptBatonResultHandler(response, data){
	var msg = build.AcceptBatonResult.decode(data);
} // end AcceptBatonResultHandler

exports.VersionInfoHandler = VersionInfoHandler;
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
exports.LoadPostedHoneyHandler = LoadPostedHoneyHandler;
exports.LoadPostedBatonHandler = LoadPostedBatonHandler;
exports.LoadPostedBatonResultHandler = LoadPostedBatonResultHandler;
exports.RequestPointRewardHandler = RequestPointRewardHandler;
exports.BuyItemHandler = BuyItemHandler;
exports.SendHoneyHandler = SendHoneyHandler;
exports.AcceptHoneyHandler = AcceptHoneyHandler;
exports.RequestBatonHandler = RequestBatonHandler;
exports.AcceptBatonHandler = AcceptBatonHandler;
exports.EndBatonHandler = EndBatonHandler;
exports.AcceptBatonResultHandler = AcceptBatonResultHandler;
