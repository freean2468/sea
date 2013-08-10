var mysql = require('./g2l-handler-mysql');
var mongodb = require('./g2l-handler-mongodb');
var options = {MYSQL: 1, MONGODB: 2};
var flags = options['MYSQL'] /*+ options['MONGODB']*/;

function VersionInfoHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.VersionInfoHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.VersionInfoHandler(response, data, session_id);
}

function RegisterAccountHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.RegisterAccountHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.RegisterAccountHandler(response, data, session_id);
}

function UnregisterAccountHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.UnregisterAccountHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.UnregisterAccountHandler(response, data, session_id);
}

function LoginHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.LoginHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.LoginHandler(response, data, session_id);
}

function LogoutHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.LogoutHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.LogoutHandler(response, data, session_id);
}

function CheckInChargeHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.CheckInChargeHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.CheckInChargeHandler(response, data, session_id);
}

function SelectCharacterHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.SelectCharacterHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.SelectCharacterHandler(response, data, session_id);
}

function SelectAssistantHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.SelectAssistantHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.SelectAssistantHandler(response, data, session_id);
}

function StartGameHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.StartGameHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.StartGameHandler(response, data, session_id);
}

function EndGameHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.EndGameHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.EndGameHandler(response, data, session_id);
}

function LoadRankInfoHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.LoadRankInfoHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.LoadRankInfoHandler(response, data, session_id);
}

function LoadPostedHoneyHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.LoadPostedHoneyHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.LoadPostedHoneyHandler(response, data, session_id);
}

function LoadPostedBatonHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.LoadPostedBatonHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.LoadPostedBatonHandler(response, data, session_id);
}

function LoadPostedBatonResultHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.LoadPostedBatonResultHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.LoadPostedBatonResultHandler(response, data, session_id);
}

function RequestPointRewardHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.RequestPointRewardHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.RequestPointRewardHandler(response, data, session_id);
}

function BuyItemHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.BuyItemHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.BuyItemHandler(response, data, session_id);
}

function BuyOrUpgradeCharacterHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.BuyOrUpgradeCharacterHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.BuyOrUpgradeCharacterHandler(response, data, session_id);
}

function BuyOrUpgradeAssistantHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.BuyOrUpgradeAssistantHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.BuyOrUpgradeAssistantHandler(response, data, session_id);
}

function SendHoneyHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.SendHoneyHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.SendHoneyHandler(response, data, session_id);
}

function AcceptHoneyHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.AcceptHoneyHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.AcceptHoneyHandler(response, data, session_id);
}

function RequestBatonHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.RequestBatonHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.RequestBatonHandler(response, data, session_id);
}

function AcceptBatonHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.AcceptBatonHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.AcceptBatonHandler(response, data, session_id);
}

function EndBatonHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.EndBatonHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.EndBatonHandler(response, data, session_id);
}

function AcceptBatonResultHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.AcceptBatonResultHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.AcceptBatonResultHandler(response, data, session_id);
}

function UpgradeHoneyScoreHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.UpgradeHoneyScoreHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.UpgradeHoneyScoreHandler(response, data, session_id);
}

function UpgradeHoneyTimeHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.UpgradeHoneyTimeHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.UpgradeHoneyTimeHandler(response, data, session_id);
}

function UpgradeCooldownHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.UpgradeCooldownHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.UpgradeCooldownHandler(response, data, session_id);
}

function InviteFriendHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.InviteFriendHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.InviteFriendHandler(response, data, session_id);
}

function LoadRewardHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.LoadRewardHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.LoadRewardHandler(response, data, session_id);
}

function SystemMessageHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.SystemMessageHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.SystemMessageHandler(response, data, session_id);
}

function VersionInfoReplyHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.VersionInfoReplyHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.VersionInfoReplyHandler(response, data, session_id);
}

function RegisterAccountReplyHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.RegisterAccountReplyHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.RegisterAccountReplyHandler(response, data, session_id);
}

function SelectCharacterReplyHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.SelectCharacterReplyHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.SelectCharacterReplyHandler(response, data, session_id);
}

function SelectAssistantReplyHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.SelectAssistantReplyHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.SelectAssistantReplyHandler(response, data, session_id);
}

function StartGameReplyHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.StartGameReplyHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.StartGameReplyHandler(response, data, session_id);
}

function AccountInfoHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.AccountInfoHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.AccountInfoHandler(response, data, session_id);
}

function LogoutReplyHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.LogoutReplyHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.LogoutReplyHandler(response, data, session_id);
}

function ChargeInfoHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.ChargeInfoHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.ChargeInfoHandler(response, data, session_id);
}

function RankInfoHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.RankInfoHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.RankInfoHandler(response, data, session_id);
}

function PostedHoneyHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.PostedHoneyHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.PostedHoneyHandler(response, data, session_id);
}

function PostedBatonHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.PostedBatonHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.PostedBatonHandler(response, data, session_id);
}

function PostedBatonResultHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.PostedBatonResultHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.PostedBatonResultHandler(response, data, session_id);
}

function GameResultHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.GameResultHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.GameResultHandler(response, data, session_id);
}

function BuyItemReplyHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.BuyItemReplyHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.BuyItemReplyHandler(response, data, session_id);
}

function BuyOrUpgradeCharacterReplyHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.BuyOrUpgradeCharacterReplyHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.BuyOrUpgradeCharacterReplyHandler(response, data, session_id);
}

function BuyOrUpgradeAssistantReplyHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.BuyOrUpgradeAssistantReplyHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.BuyOrUpgradeAssistantReplyHandler(response, data, session_id);
}

function SendHoneyReplyHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.SendHoneyReplyHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.SendHoneyReplyHandler(response, data, session_id);
}

function RequestBatonReplyHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.RequestBatonReplyHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.RequestBatonReplyHandler(response, data, session_id);
}

function AcceptHoneyReplyHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.AcceptHoneyReplyHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.AcceptHoneyReplyHandler(response, data, session_id);
}

function AcceptBatonReplyHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.AcceptBatonReplyHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.AcceptBatonReplyHandler(response, data, session_id);
}

function BatonResultHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.BatonResultHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.BatonResultHandler(response, data, session_id);
}

function AcceptBatonResultReplyHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.AcceptBatonResultReplyHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.AcceptBatonResultReplyHandler(response, data, session_id);
}

function UpgradeReplyHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.UpgradeReplyHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.UpgradeReplyHandler(response, data, session_id);
}

function InviteFriendReplyHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.InviteFriendReplyHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.InviteFriendReplyHandler(response, data, session_id);
}

function LoadRewardReplyHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.LoadRewardReplyHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.LoadRewardReplyHandler(response, data, session_id);
}

function AccountLoginHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.AccountLoginHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.AccountLoginHandler(response, data, session_id);
}

function ConcurrentUserHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.ConcurrentUserHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.ConcurrentUserHandler(response, data, session_id);
}

function PeakConcurrentUserHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.PeakConcurrentUserHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.PeakConcurrentUserHandler(response, data, session_id);
}

function UniqueVisitorHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.UniqueVisitorHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.UniqueVisitorHandler(response, data, session_id);
}

function RetentionRateHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.RetentionRateHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.RetentionRateHandler(response, data, session_id);
}

function PayAssistantHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.PayAssistantHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.PayAssistantHandler(response, data, session_id);
}

function PayCharacterHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.PayCharacterHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.PayCharacterHandler(response, data, session_id);
}

function PayCoinHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.PayCoinHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.PayCoinHandler(response, data, session_id);
}

function PayHeartHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.PayHeartHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.PayHeartHandler(response, data, session_id);
}

function PayItemHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.PayItemHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.PayItemHandler(response, data, session_id);
}

function PayMoneyHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.PayMoneyHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.PayMoneyHandler(response, data, session_id);
}

function UserGamePlayHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.UserGamePlayHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.UserGamePlayHandler(response, data, session_id);
}

function UserRegisterHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.UserRegisterHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.UserRegisterHandler(response, data, session_id);
}

function UserUnregisterHandler(response, data, session_id) {
	if (flags & options['MYSQL']) mysql.UserUnregisterHandler(response, data, session_id);
	if (flags & options['MONGODB']) mongodb.UserUnregisterHandler(response, data, session_id);
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
