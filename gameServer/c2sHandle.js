var handler = require('./handler');

var handle = {
	'4324427': handler.VersionInfoHandler,
	'1177254': handler.RegisterAccountHandler,
	'10351738': handler.UnregisterAccountHandler,
	'12322730': handler.LoginHandler,
	'323783': handler.LogoutHandler,
	'6355369': handler.CheckInChargeHandler,
	'324419': handler.SelectCharacterHandler,
	'2359002': handler.SelectAssistantHandler,
	'1373111': handler.StartGameHandler,
	'6356356': handler.EndGameHandler,
	'389941': handler.LoadRankInfoHandler,
	'3407142': handler.LoadPostedHoneyHandler,
	'23854771': handler.LoadPostedBatonHandler,
	'1175967': handler.LoadPostedBatonResultHandler,
	'1441362': handler.RequestPointRewardHandler,
	'5439087': handler.BuyItemHandler,
	'7469576': handler.BuyOrUpgradeCharacterHandler,
	'7467298': handler.BuyOrUpgradeAssistantHandler,
	'1440444': handler.SendHoneyHandler,
	'7470930': handler.AcceptHoneyHandler,
	'3472750': handler.RequestBatonHandler,
	'3534913': handler.AcceptBatonHandler,
	'1505624': handler.EndBatonHandler,
	'1569529': handler.AcceptBatonResultHandler,
	'9500500': handler.UpgradeHoneyScoreHandler,
	'1571955': handler.UpgradeHoneyTimeHandler,
	'1569677': handler.UpgradeCooldownHandler,
	'4583783': handler.InviteFriendHandler,
	'2552832': handler.LoadRewardHandler,
};

exports.handle = handle;
