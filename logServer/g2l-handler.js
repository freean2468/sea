var mysql = require('./g2l-handler-mysql');
var mongodb = require('./g2l-handler-mongodb');
var options = {MYSQL: 1, MONGODB: 2};
var flags = options['MYSQL'] /*+ options['MONGODB']*/;

function VersionInfoHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.VersionInfoHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.VersionInfoHandler(response, data, logMgr);
}

function RegisterAccountHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.RegisterAccountHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.RegisterAccountHandler(response, data, logMgr);
}

function UnregisterAccountHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.UnregisterAccountHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.UnregisterAccountHandler(response, data, logMgr);
}

function LoginHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.LoginHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.LoginHandler(response, data, logMgr);
}

function LogoutHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.LogoutHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.LogoutHandler(response, data, logMgr);
}

function CheckInChargeHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.CheckInChargeHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.CheckInChargeHandler(response, data, logMgr);
}

function SelectCharacterHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.SelectCharacterHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.SelectCharacterHandler(response, data, logMgr);
}

function SelectAssistantHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.SelectAssistantHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.SelectAssistantHandler(response, data, logMgr);
}

function StartGameHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.StartGameHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.StartGameHandler(response, data, logMgr);
}

function EndGameHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.EndGameHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.EndGameHandler(response, data, logMgr);
}

function LoadRankInfoHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.LoadRankInfoHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.LoadRankInfoHandler(response, data, logMgr);
}

function LoadPostedHoneyHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.LoadPostedHoneyHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.LoadPostedHoneyHandler(response, data, logMgr);
}

function LoadPostedBatonHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.LoadPostedBatonHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.LoadPostedBatonHandler(response, data, logMgr);
}

function LoadPostedBatonResultHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.LoadPostedBatonResultHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.LoadPostedBatonResultHandler(response, data, logMgr);
}

function RequestPointRewardHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.RequestPointRewardHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.RequestPointRewardHandler(response, data, logMgr);
}

function BuyItemHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.BuyItemHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.BuyItemHandler(response, data, logMgr);
}

function BuyOrUpgradeCharacterHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.BuyOrUpgradeCharacterHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.BuyOrUpgradeCharacterHandler(response, data, logMgr);
}

function BuyOrUpgradeAssistantHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.BuyOrUpgradeAssistantHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.BuyOrUpgradeAssistantHandler(response, data, logMgr);
}

function SendHoneyHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.SendHoneyHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.SendHoneyHandler(response, data, logMgr);
}

function AcceptHoneyHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.AcceptHoneyHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.AcceptHoneyHandler(response, data, logMgr);
}

function RequestBatonHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.RequestBatonHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.RequestBatonHandler(response, data, logMgr);
}

function AcceptBatonHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.AcceptBatonHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.AcceptBatonHandler(response, data, logMgr);
}

function EndBatonHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.EndBatonHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.EndBatonHandler(response, data, logMgr);
}

function AcceptBatonResultHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.AcceptBatonResultHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.AcceptBatonResultHandler(response, data, logMgr);
}

function UpgradeHoneyScoreHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.UpgradeHoneyScoreHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.UpgradeHoneyScoreHandler(response, data, logMgr);
}

function UpgradeHoneyTimeHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.UpgradeHoneyTimeHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.UpgradeHoneyTimeHandler(response, data, logMgr);
}

function UpgradeCooldownHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.UpgradeCooldownHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.UpgradeCooldownHandler(response, data, logMgr);
}

function InviteFriendHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.InviteFriendHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.InviteFriendHandler(response, data, logMgr);
}

function LoadRewardHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.LoadRewardHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.LoadRewardHandler(response, data, logMgr);
}

function SystemMessageHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.SystemMessageHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.SystemMessageHandler(response, data, logMgr);
}

function VersionInfoReplyHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.VersionInfoReplyHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.VersionInfoReplyHandler(response, data, logMgr);
}

function RegisterAccountReplyHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.RegisterAccountReplyHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.RegisterAccountReplyHandler(response, data, logMgr);
}

function SelectCharacterReplyHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.SelectCharacterReplyHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.SelectCharacterReplyHandler(response, data, logMgr);
}

function SelectAssistantReplyHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.SelectAssistantReplyHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.SelectAssistantReplyHandler(response, data, logMgr);
}

function StartGameReplyHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.StartGameReplyHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.StartGameReplyHandler(response, data, logMgr);
}

function AccountInfoHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.AccountInfoHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.AccountInfoHandler(response, data, logMgr);
}

function LogoutReplyHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.LogoutReplyHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.LogoutReplyHandler(response, data, logMgr);
}

function ChargeInfoHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.ChargeInfoHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.ChargeInfoHandler(response, data, logMgr);
}

function RankInfoHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.RankInfoHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.RankInfoHandler(response, data, logMgr);
}

function PostedHoneyHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.PostedHoneyHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.PostedHoneyHandler(response, data, logMgr);
}

function PostedBatonHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.PostedBatonHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.PostedBatonHandler(response, data, logMgr);
}

function PostedBatonResultHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.PostedBatonResultHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.PostedBatonResultHandler(response, data, logMgr);
}

function GameResultHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.GameResultHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.GameResultHandler(response, data, logMgr);
}

function BuyItemReplyHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.BuyItemReplyHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.BuyItemReplyHandler(response, data, logMgr);
}

function BuyOrUpgradeCharacterReplyHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.BuyOrUpgradeCharacterReplyHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.BuyOrUpgradeCharacterReplyHandler(response, data, logMgr);
}

function BuyOrUpgradeAssistantReplyHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.BuyOrUpgradeAssistantReplyHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.BuyOrUpgradeAssistantReplyHandler(response, data, logMgr);
}

function SendHoneyReplyHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.SendHoneyReplyHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.SendHoneyReplyHandler(response, data, logMgr);
}

function RequestBatonReplyHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.RequestBatonReplyHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.RequestBatonReplyHandler(response, data, logMgr);
}

function AcceptHoneyReplyHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.AcceptHoneyReplyHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.AcceptHoneyReplyHandler(response, data, logMgr);
}

function AcceptBatonReplyHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.AcceptBatonReplyHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.AcceptBatonReplyHandler(response, data, logMgr);
}

function BatonResultHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.BatonResultHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.BatonResultHandler(response, data, logMgr);
}

function AcceptBatonResultReplyHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.AcceptBatonResultReplyHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.AcceptBatonResultReplyHandler(response, data, logMgr);
}

function UpgradeReplyHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.UpgradeReplyHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.UpgradeReplyHandler(response, data, logMgr);
}

function InviteFriendReplyHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.InviteFriendReplyHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.InviteFriendReplyHandler(response, data, logMgr);
}

function LoadRewardReplyHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.LoadRewardReplyHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.LoadRewardReplyHandler(response, data, logMgr);
}

function AccountLoginHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.AccountLoginHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.AccountLoginHandler(response, data, logMgr);
}

function ConcurrentUserHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.ConcurrentUserHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.ConcurrentUserHandler(response, data, logMgr);
}

function PeakConcurrentUserHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.PeakConcurrentUserHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.PeakConcurrentUserHandler(response, data, logMgr);
}

function UniqueVisitorHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.UniqueVisitorHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.UniqueVisitorHandler(response, data, logMgr);
}

function RetentionRateHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.RetentionRateHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.RetentionRateHandler(response, data, logMgr);
}

function PayAssistantHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.PayAssistantHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.PayAssistantHandler(response, data, logMgr);
}

function PayCharacterHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.PayCharacterHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.PayCharacterHandler(response, data, logMgr);
}

function PayCoinHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.PayCoinHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.PayCoinHandler(response, data, logMgr);
}

function PayHeartHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.PayHeartHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.PayHeartHandler(response, data, logMgr);
}

function PayItemHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.PayItemHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.PayItemHandler(response, data, logMgr);
}

function PayMoneyHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.PayMoneyHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.PayMoneyHandler(response, data, logMgr);
}

function UserGamePlayHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.UserGamePlayHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.UserGamePlayHandler(response, data, logMgr);
}

function UserRegisterHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.UserRegisterHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.UserRegisterHandler(response, data, logMgr);
}

function UserUnregisterHandler(response, data, logMgr) {
	if (flags & options['MYSQL']) mysql.UserUnregisterHandler(response, data, logMgr);
	if (flags & options['MONGODB']) mongodb.UserUnregisterHandler(response, data, logMgr);
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
exports.BuyOrUpgradeCharacterHandler = BuyOrUpgradeCharacterHandler;
exports.BuyOrUpgradeAssistantHandler = BuyOrUpgradeAssistantHandler;
exports.SendHoneyHandler = SendHoneyHandler;
exports.AcceptHoneyHandler = AcceptHoneyHandler;
exports.RequestBatonHandler = RequestBatonHandler;
exports.AcceptBatonHandler = AcceptBatonHandler;
exports.EndBatonHandler = EndBatonHandler;
exports.AcceptBatonResultHandler = AcceptBatonResultHandler;
exports.UpgradeHoneyScoreHandler = UpgradeHoneyScoreHandler;
exports.UpgradeHoneyTimeHandler = UpgradeHoneyTimeHandler;
exports.UpgradeCooldownHandler = UpgradeCooldownHandler;
exports.InviteFriendHandler = InviteFriendHandler;
exports.LoadRewardHandler = LoadRewardHandler;
exports.SystemMessageHandler = SystemMessageHandler;
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
exports.BuyOrUpgradeCharacterReplyHandler = BuyOrUpgradeCharacterReplyHandler;
exports.BuyOrUpgradeAssistantReplyHandler = BuyOrUpgradeAssistantReplyHandler;
exports.SendHoneyReplyHandler = SendHoneyReplyHandler;
exports.RequestBatonReplyHandler = RequestBatonReplyHandler;
exports.AcceptHoneyReplyHandler = AcceptHoneyReplyHandler;
exports.AcceptBatonReplyHandler = AcceptBatonReplyHandler;
exports.BatonResultHandler = BatonResultHandler;
exports.AcceptBatonResultReplyHandler = AcceptBatonResultReplyHandler;
exports.UpgradeReplyHandler = UpgradeReplyHandler;
exports.InviteFriendReplyHandler = InviteFriendReplyHandler;
exports.LoadRewardReplyHandler = LoadRewardReplyHandler;
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
