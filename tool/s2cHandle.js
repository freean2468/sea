var handler = require('./handler');

var handle = {
	'930151572': handler.SystemMessageHandler,
	'212532706': handler.VersionInfoReplyHandler,
	'1622018505': handler.RegisterAccountReplyHandler,
	'1952577891': handler.SelectCharacterReplyHandler,
	'1952577891': handler.SelectAssistantReplyHandler,
	'519762701': handler.StartGameReplyHandler,
	'74840653': handler.AccountInfoHandler,
	'64091022': handler.LogoutReplyHandler,
	'7663927': handler.ChargeInfoHandler,
	'25751552': handler.RankInfoHandler,
	'92009206': handler.PostedHoneyHandler,
	'81000074': handler.PostedBatonHandler,
	'642844433': handler.PostedBatonResultHandler,
	'10876551': handler.GameResultHandler,
	'74117480': handler.BuyItemReplyHandler,
	'2059273157': handler.BuyCharacterReplyHandler,
	'2059273358': handler.BuyAssistantReplyHandler,
	'518193085': handler.SendHoneyReplyHandler,
	'1132791610': handler.RequestBatonReplyHandler,
	'510456537': handler.AcceptHoneyReplyHandler,
	'807931012': handler.AcceptBatonReplyHandler,
	'7864253': handler.BatonResultHandler,
	'1775630798': handler.AcceptBatonResultReplyHandler,
	'97120694': handler.UpgradeReplyHandler,
};

exports.handle = handle;
