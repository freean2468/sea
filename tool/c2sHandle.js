var handler = require('./handler');

var handle = {
	'1415117601': handler.RegisterAccountHandler,
	'1296626420': handler.UnregisterAccountHandler,
	'12322730': handler.LoginHandler,
	'543619392': handler.LogoutHandler,
	'770373176': handler.CheckInChargeHandler,
	'683737635': handler.SelectCharacterHandler,
	'1315109379': handler.SelectAssistantHandler,
	'285274112': handler.StartGameHandler,
	'1441135488': handler.EndGameHandler,
	'67040062': handler.LoadRankInfoHandler,
	'618593180': handler.RequestPointRewardHandler,
};

exports.handle = handle;
