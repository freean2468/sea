var handler = require('./handler');

var handle = {
	'97057879': handler.VersionInfoHandler,
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
	'2105277059': handler.LoadPostedHoneyHandler,
	'889849479': handler.LoadPostedBatonHandler,
	'221908254': handler.LoadPostedBatonResultHandler,
	'618593180': handler.RequestPointRewardHandler,
	'340332544': handler.BuyItemHandler,
	'1073803264': handler.SendHoneyHandler,
	'7797173': handler.AcceptHoneyHandler,
	'830141680': handler.RequestBatonHandler,
	'6550327': handler.AcceptBatonHandler,
	'544665600': handler.EndBatonHandler,
	'954007011': handler.AcceptBatonResultHandler,
};

exports.handle = handle;
