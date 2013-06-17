var mysql = require('./handler_MySQL');
var mongodb = require('./handler_MongoDB');
var options = {MYSQL: 1, MONGODB: 2};
var flags = options['MYSQL'] /*+ options['MONGODB']*/;

function VersionInfoHandler(response, data) {
	if (flags & options['MYSQL']) mysql.VersionInfoHandler(response, data);
	if (flags & options['MONGODB']) mongodb.VersionInfoHandler(response, data);
}

function VersionInfoReplyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.VersionInfoReplyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.VersionInfoReplyHandler(response, data);
}

function ClientVersionInfoHandler(response, data) {
	if (flags & options['MYSQL']) mysql.ClientVersionInfoHandler(response, data);
	if (flags & options['MONGODB']) mongodb.ClientVersionInfoHandler(response, data);
}

function ClientVersionInfoReplyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.ClientVersionInfoReplyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.ClientVersionInfoReplyHandler(response, data);
}

function RegisterAccountHandler(response, data) {
	if (flags & options['MYSQL']) mysql.RegisterAccountHandler(response, data);
	if (flags & options['MONGODB']) mongodb.RegisterAccountHandler(response, data);
}

function UnregisterAccountHandler(response, data) {
	if (flags & options['MYSQL']) mysql.UnregisterAccountHandler(response, data);
	if (flags & options['MONGODB']) mongodb.UnregisterAccountHandler(response, data);
}

function LoadUserInfoHandler(response, data) {
	if (flags & options['MYSQL']) mysql.LoadUserInfoHandler(response, data);
	if (flags & options['MONGODB']) mongodb.LoadUserInfoHandler(response, data);
}

function CheckInChargeHandler(response, data) {
	if (flags & options['MYSQL']) mysql.CheckInChargeHandler(response, data);
	if (flags & options['MONGODB']) mongodb.CheckInChargeHandler(response, data);
}

function StartGameHandler(response, data) {
	if (flags & options['MYSQL']) mysql.StartGameHandler(response, data);
	if (flags & options['MONGODB']) mongodb.StartGameHandler(response, data);
}

function EndGameHandler(response, data) {
	if (flags & options['MYSQL']) mysql.EndGameHandler(response, data);
	if (flags & options['MONGODB']) mongodb.EndGameHandler(response, data);
}

function LoadRankInfoHandler(response, data) {
	if (flags & options['MYSQL']) mysql.LoadRankInfoHandler(response, data);
	if (flags & options['MONGODB']) mongodb.LoadRankInfoHandler(response, data);
}

function RequestPointRewardHandler(response, data) {
	if (flags & options['MYSQL']) mysql.RequestPointRewardHandler(response, data);
	if (flags & options['MONGODB']) mongodb.RequestPointRewardHandler(response, data);
}

function RegisterAccountReplyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.RegisterAccountReplyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.RegisterAccountReplyHandler(response, data);
}

function UnregisterAccountReplyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.UnregisterAccountReplyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.UnregisterAccountReplyHandler(response, data);
}

function StartGameReplyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.StartGameReplyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.StartGameReplyHandler(response, data);
}

function AccountInfoHandler(response, data) {
	if (flags & options['MYSQL']) mysql.AccountInfoHandler(response, data);
	if (flags & options['MONGODB']) mongodb.AccountInfoHandler(response, data);
}

function ChargeInfoHandler(response, data) {
	if (flags & options['MYSQL']) mysql.ChargeInfoHandler(response, data);
	if (flags & options['MONGODB']) mongodb.ChargeInfoHandler(response, data);
}

function RankInfoHandler(response, data) {
	if (flags & options['MYSQL']) mysql.RankInfoHandler(response, data);
	if (flags & options['MONGODB']) mongodb.RankInfoHandler(response, data);
}

function GameResultHandler(response, data) {
	if (flags & options['MYSQL']) mysql.GameResultHandler(response, data);
	if (flags & options['MONGODB']) mongodb.GameResultHandler(response, data);
}

function AccountLoginHandler(response, data) {
	if (flags & options['MYSQL']) mysql.AccountLoginHandler(response, data);
	if (flags & options['MONGODB']) mongodb.AccountLoginHandler(response, data);
}

function PayAssistantHandler(response, data) {
	if (flags & options['MYSQL']) mysql.PayAssistantHandler(response, data);
	if (flags & options['MONGODB']) mongodb.PayAssistantHandler(response, data);
}

function PayCharacterHandler(response, data) {
	if (flags & options['MYSQL']) mysql.PayCharacterHandler(response, data);
	if (flags & options['MONGODB']) mongodb.PayCharacterHandler(response, data);
}

function PayCoinHandler(response, data) {
	if (flags & options['MYSQL']) mysql.PayCoinHandler(response, data);
	if (flags & options['MONGODB']) mongodb.PayCoinHandler(response, data);
}

function PayHeartHandler(response, data) {
	if (flags & options['MYSQL']) mysql.PayHeartHandler(response, data);
	if (flags & options['MONGODB']) mongodb.PayHeartHandler(response, data);
}

function PayItemHandler(response, data) {
	if (flags & options['MYSQL']) mysql.PayItemHandler(response, data);
	if (flags & options['MONGODB']) mongodb.PayItemHandler(response, data);
}

function PayMoneyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.PayMoneyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.PayMoneyHandler(response, data);
}

function UserGamePlayHandler(response, data) {
	if (flags & options['MYSQL']) mysql.UserGamePlayHandler(response, data);
	if (flags & options['MONGODB']) mongodb.UserGamePlayHandler(response, data);
}

function UserRegisterHandler(response, data) {
	if (flags & options['MYSQL']) mysql.UserRegisterHandler(response, data);
	if (flags & options['MONGODB']) mongodb.UserRegisterHandler(response, data);
}

function UserUnregisterHandler(response, data) {
	if (flags & options['MYSQL']) mysql.UserUnregisterHandler(response, data);
	if (flags & options['MONGODB']) mongodb.UserUnregisterHandler(response, data);
}

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
exports.RegisterAccountReplyHandler = RegisterAccountReplyHandler;
exports.UnregisterAccountReplyHandler = UnregisterAccountReplyHandler;
exports.StartGameReplyHandler = StartGameReplyHandler;
exports.AccountInfoHandler = AccountInfoHandler;
exports.ChargeInfoHandler = ChargeInfoHandler;
exports.RankInfoHandler = RankInfoHandler;
exports.GameResultHandler = GameResultHandler;
exports.AccountLoginHandler = AccountLoginHandler;
exports.PayAssistantHandler = PayAssistantHandler;
exports.PayCharacterHandler = PayCharacterHandler;
exports.PayCoinHandler = PayCoinHandler;
exports.PayHeartHandler = PayHeartHandler;
exports.PayItemHandler = PayItemHandler;
exports.PayMoneyHandler = PayMoneyHandler;
exports.UserGamePlayHandler = UserGamePlayHandler;
exports.UserRegisterHandler = UserRegisterHandler;
exports.UserUnregisterHandler = UserUnregisterHandler;
