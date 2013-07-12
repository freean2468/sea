var mysql = require('./handler_MySQL');
var mongodb = require('./handler_MongoDB');
var options = {MYSQL: 1, MONGODB: 2};
var flags = options['MYSQL'] /*+ options['MONGODB']*/;

function VersionInfoHandler(response, data) {
	if (flags & options['MYSQL']) mysql.VersionInfoHandler(response, data);
	if (flags & options['MONGODB']) mongodb.VersionInfoHandler(response, data);
}

function RegisterAccountHandler(response, data) {
	if (flags & options['MYSQL']) mysql.RegisterAccountHandler(response, data);
	if (flags & options['MONGODB']) mongodb.RegisterAccountHandler(response, data);
}

function UnregisterAccountHandler(response, data) {
	if (flags & options['MYSQL']) mysql.UnregisterAccountHandler(response, data);
	if (flags & options['MONGODB']) mongodb.UnregisterAccountHandler(response, data);
}

function LoginHandler(response, data) {
	if (flags & options['MYSQL']) mysql.LoginHandler(response, data);
	if (flags & options['MONGODB']) mongodb.LoginHandler(response, data);
}

function LogoutHandler(response, data) {
	if (flags & options['MYSQL']) mysql.LogoutHandler(response, data);
	if (flags & options['MONGODB']) mongodb.LogoutHandler(response, data);
}

function CheckInChargeHandler(response, data) {
	if (flags & options['MYSQL']) mysql.CheckInChargeHandler(response, data);
	if (flags & options['MONGODB']) mongodb.CheckInChargeHandler(response, data);
}

function SelectCharacterHandler(response, data) {
	if (flags & options['MYSQL']) mysql.SelectCharacterHandler(response, data);
	if (flags & options['MONGODB']) mongodb.SelectCharacterHandler(response, data);
}

function SelectAssistantHandler(response, data) {
	if (flags & options['MYSQL']) mysql.SelectAssistantHandler(response, data);
	if (flags & options['MONGODB']) mongodb.SelectAssistantHandler(response, data);
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

function LoadPostedHoneyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.LoadPostedHoneyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.LoadPostedHoneyHandler(response, data);
}

function LoadPostedBatonHandler(response, data) {
	if (flags & options['MYSQL']) mysql.LoadPostedBatonHandler(response, data);
	if (flags & options['MONGODB']) mongodb.LoadPostedBatonHandler(response, data);
}

function LoadPostedBatonResultHandler(response, data) {
	if (flags & options['MYSQL']) mysql.LoadPostedBatonResultHandler(response, data);
	if (flags & options['MONGODB']) mongodb.LoadPostedBatonResultHandler(response, data);
}

function RequestPointRewardHandler(response, data) {
	if (flags & options['MYSQL']) mysql.RequestPointRewardHandler(response, data);
	if (flags & options['MONGODB']) mongodb.RequestPointRewardHandler(response, data);
}

function BuyItemHandler(response, data) {
	if (flags & options['MYSQL']) mysql.BuyItemHandler(response, data);
	if (flags & options['MONGODB']) mongodb.BuyItemHandler(response, data);
}

function SendHoneyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.SendHoneyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.SendHoneyHandler(response, data);
}

function AcceptHoneyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.AcceptHoneyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.AcceptHoneyHandler(response, data);
}

function RequestBatonHandler(response, data) {
	if (flags & options['MYSQL']) mysql.RequestBatonHandler(response, data);
	if (flags & options['MONGODB']) mongodb.RequestBatonHandler(response, data);
}

function AcceptBatonHandler(response, data) {
	if (flags & options['MYSQL']) mysql.AcceptBatonHandler(response, data);
	if (flags & options['MONGODB']) mongodb.AcceptBatonHandler(response, data);
}

function EndBatonHandler(response, data) {
	if (flags & options['MYSQL']) mysql.EndBatonHandler(response, data);
	if (flags & options['MONGODB']) mongodb.EndBatonHandler(response, data);
}

function AcceptBatonResultHandler(response, data) {
	if (flags & options['MYSQL']) mysql.AcceptBatonResultHandler(response, data);
	if (flags & options['MONGODB']) mongodb.AcceptBatonResultHandler(response, data);
}

function VersionInfoReplyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.VersionInfoReplyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.VersionInfoReplyHandler(response, data);
}

function RegisterAccountReplyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.RegisterAccountReplyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.RegisterAccountReplyHandler(response, data);
}

function SelectCharacterReplyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.SelectCharacterReplyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.SelectCharacterReplyHandler(response, data);
}

function SelectAssistantReplyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.SelectAssistantReplyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.SelectAssistantReplyHandler(response, data);
}

function StartGameReplyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.StartGameReplyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.StartGameReplyHandler(response, data);
}

function AccountInfoHandler(response, data) {
	if (flags & options['MYSQL']) mysql.AccountInfoHandler(response, data);
	if (flags & options['MONGODB']) mongodb.AccountInfoHandler(response, data);
}

function LogoutReplyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.LogoutReplyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.LogoutReplyHandler(response, data);
}

function ChargeInfoHandler(response, data) {
	if (flags & options['MYSQL']) mysql.ChargeInfoHandler(response, data);
	if (flags & options['MONGODB']) mongodb.ChargeInfoHandler(response, data);
}

function RankInfoHandler(response, data) {
	if (flags & options['MYSQL']) mysql.RankInfoHandler(response, data);
	if (flags & options['MONGODB']) mongodb.RankInfoHandler(response, data);
}

function PostedHoneyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.PostedHoneyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.PostedHoneyHandler(response, data);
}

function PostedBatonHandler(response, data) {
	if (flags & options['MYSQL']) mysql.PostedBatonHandler(response, data);
	if (flags & options['MONGODB']) mongodb.PostedBatonHandler(response, data);
}

function PostedBatonResultHandler(response, data) {
	if (flags & options['MYSQL']) mysql.PostedBatonResultHandler(response, data);
	if (flags & options['MONGODB']) mongodb.PostedBatonResultHandler(response, data);
}

function GameResultHandler(response, data) {
	if (flags & options['MYSQL']) mysql.GameResultHandler(response, data);
	if (flags & options['MONGODB']) mongodb.GameResultHandler(response, data);
}

function BuyItemReplyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.BuyItemReplyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.BuyItemReplyHandler(response, data);
}

function SendHoneyReplyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.SendHoneyReplyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.SendHoneyReplyHandler(response, data);
}

function RequestBatonReplyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.RequestBatonReplyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.RequestBatonReplyHandler(response, data);
}

function AcceptHoneyReplyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.AcceptHoneyReplyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.AcceptHoneyReplyHandler(response, data);
}

function AcceptBatonReplyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.AcceptBatonReplyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.AcceptBatonReplyHandler(response, data);
}

function BatonResultHandler(response, data) {
	if (flags & options['MYSQL']) mysql.BatonResultHandler(response, data);
	if (flags & options['MONGODB']) mongodb.BatonResultHandler(response, data);
}

function AcceptBatonResultReplyHandler(response, data) {
	if (flags & options['MYSQL']) mysql.AcceptBatonResultReplyHandler(response, data);
	if (flags & options['MONGODB']) mongodb.AcceptBatonResultReplyHandler(response, data);
}

function AccountLoginHandler(response, data) {
	if (flags & options['MYSQL']) mysql.AccountLoginHandler(response, data);
	if (flags & options['MONGODB']) mongodb.AccountLoginHandler(response, data);
}

function ConcurrentUserHandler(response, data) {
	if (flags & options['MYSQL']) mysql.ConcurrentUserHandler(response, data);
	if (flags & options['MONGODB']) mongodb.ConcurrentUserHandler(response, data);
}

function PeakConcurrentUserHandler(response, data) {
	if (flags & options['MYSQL']) mysql.PeakConcurrentUserHandler(response, data);
	if (flags & options['MONGODB']) mongodb.PeakConcurrentUserHandler(response, data);
}

function UniqueVisitorHandler(response, data) {
	if (flags & options['MYSQL']) mysql.UniqueVisitorHandler(response, data);
	if (flags & options['MONGODB']) mongodb.UniqueVisitorHandler(response, data);
}

function RetentionRateHandler(response, data) {
	if (flags & options['MYSQL']) mysql.RetentionRateHandler(response, data);
	if (flags & options['MONGODB']) mongodb.RetentionRateHandler(response, data);
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
exports.VersionInfoReplyHandler = VersionInfoReplyHandler;
exports.RegisterAccountReplyHandler = RegisterAccountReplyHandler;
exports.SelectCharacterReplyHandler = SelectCharacterReplyHandler;
exports.SelectAssistantReplyHandler = SelectAssistantReplyHandler;
exports.StartGameReplyHandler = StartGameReplyHandler;
exports.AccountInfoHandler = AccountInfoHandler;
exports.LogoutReplyHandler = LogoutReplyHandler;
exports.ChargeInfoHandler = ChargeInfoHandler;
exports.RankInfoHandler = RankInfoHandler;
exports.PostedHoneyHandler = PostedHoneyHandler;
exports.PostedBatonHandler = PostedBatonHandler;
exports.PostedBatonResultHandler = PostedBatonResultHandler;
exports.GameResultHandler = GameResultHandler;
exports.BuyItemReplyHandler = BuyItemReplyHandler;
exports.SendHoneyReplyHandler = SendHoneyReplyHandler;
exports.RequestBatonReplyHandler = RequestBatonReplyHandler;
exports.AcceptHoneyReplyHandler = AcceptHoneyReplyHandler;
exports.AcceptBatonReplyHandler = AcceptBatonReplyHandler;
exports.BatonResultHandler = BatonResultHandler;
exports.AcceptBatonResultReplyHandler = AcceptBatonResultReplyHandler;
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
