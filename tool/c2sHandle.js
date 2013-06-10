var handler = require('./handler');

var handle = {
	'1415117601': handler.RegisterAccountHandler,
	'1296626420': handler.UnregisterAccountHandler,
	'67040062': handler.LoadUserInfoHandler,
	'770373176': handler.CheckInChargeHandler,
	'285274112': handler.StartGameHandler,
	'1441135488': handler.EndGameHandler,
	'67040062': handler.LoadRankInfoHandler,
	'618593180': handler.RequestPointRewardHandler,
};

exports.handle = handle;
