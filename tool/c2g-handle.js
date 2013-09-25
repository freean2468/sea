var handler = require('./c2g-handler');

var handle = {
	'2290025': handler.VersionInfoHandler,
	'3276552': handler.RegisterAccountHandler,
	'3274366': handler.UnregisterAccountHandler,
	'12322730': handler.LoginHandler,
	'1177254': handler.LogoutHandler,
	'9303417': handler.CheckInChargeHandler,
	'324879': handler.SelectCharacterHandler,
	'10353272': handler.StartGameHandler,
	'6354089': handler.EndGameHandler,
	'5371290': handler.LoadRankInfoHandler,
	'6356727': handler.LoadPostedEnergyHandler,
	'2356356': handler.LoadPostedBatonHandler,
	'2421803': handler.LoadPostedBatonResultHandler,
	'6419524': handler.RequestPointRewardHandler,
	'10417253': handler.BuyItemHandler,
	'83948486': handler.BuyOrUpgradeCharacterHandler,
	'9433168': handler.SendEnergyHandler,
	'6418607': handler.AcceptEnergyHandler,
	'7469574': handler.RequestBatonHandler,
	'7470205': handler.AcceptBatonHandler,
	'6484309': handler.EndBatonHandler,
	'4454546': handler.AcceptBatonResultHandler,
	'1505516': handler.UpgradeScoreFactorHandler,
	'5503240': handler.UpgradeTimeFactorHandler,
	'8518012': handler.UpgradeCooldownFactorHandler,
	'9499241': handler.InviteFriendHandler,
	'2553748': handler.LoadRewardHandler,
};

exports.handle = handle;
