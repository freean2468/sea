var handler = require('./g2c-handler');

var handle = {
	'131068445': handler.SystemMessageHandler,
	'1089076202': handler.VersionInfoReplyHandler,
	'3142601': handler.RegisterAccountReplyHandler,
	'54132717': handler.SelectCharacterReplyHandler,
	'35517005': handler.SelectAssistantReplyHandler,
	'278724898': handler.StartGameReplyHandler,
	'76741253': handler.AccountInfoHandler,
	'1481109953': handler.LogoutReplyHandler,
	'149157351': handler.ChargeInfoHandler,
	'9108294': handler.RankInfoHandler,
	'8122398': handler.PostedHoneyHandler,
	'4127219': handler.PostedBatonHandler,
	'4191570': handler.PostedBatonResultHandler,
	'194297': handler.GameResultHandler,
	'4191111': handler.BuyItemReplyHandler,
	'6160160': handler.BuyOrUpgradeCharacterReplyHandler,
	'1176176': handler.BuyOrUpgradeAssistantReplyHandler,
	'1242437': handler.SendHoneyReplyHandler,
	'194286': handler.RequestBatonReplyHandler,
	'3208394': handler.AcceptHoneyReplyHandler,
	'7270557': handler.AcceptBatonReplyHandler,
	'261180': handler.BatonResultHandler,
	'5242518': handler.AcceptBatonResultReplyHandler,
	'3273014': handler.UpgradeReplyHandler,
	'5307594': handler.InviteFriendReplyHandler,
	'325704': handler.LoadRewardReplyHandler,
};

exports.handle = handle;
