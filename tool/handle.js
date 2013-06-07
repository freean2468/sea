var handler = require('./handler');

var handle = {
	'97057879': handler.VersionInfoHandler,
	'70841257': handler.ClientVersionInfoHandler,
	'1415117601': handler.RegisterAccountHandler,
	'1296626420': handler.UnregisterAccountHandler,
	'67040062': handler.LoadUserInfoHandler,
	'770373176': handler.CheckInChargeHandler,
	'285274112': handler.StartGameHandler,
	'1441135488': handler.EndGameHandler,
	'67040062': handler.LoadRankInfoHandler,
	'618593180': handler.RequestPointRewardHandler,
	'1622018505': handler.RegisterAccountReplyHandler,
	'1477441904': handler.UnregisterAccountReplyHandler,
	'519762701': handler.StartGameReplyHandler,
	'74840653': handler.AccountInfoHandler,
	'7663927': handler.ChargeInfoHandler,
	'25751552': handler.RankInfoHandler,
	'10876551': handler.GameResultHandler,
	'212532706': handler.VersionInfoReplyHandler,
	'1271857080': handler.ClientVersionInfoReplyHandler,
};

exports.handle = handle;
