var handler = require('./handler');

var handle = {
	'9303303': handler.VersionInfoHandler,
	'4324600': handler.RegisterAccountHandler,
	'2357184': handler.UnregisterAccountHandler,
	'12322730': handler.LoginHandler,
	'391770': handler.LogoutHandler,
	'3340343': handler.CheckInChargeHandler,
	'391313': handler.SelectCharacterHandler,
	'1372651': handler.StartGameHandler,
	'6419430': handler.EndGameHandler,
	'9434386': handler.LoadRankInfoHandler,
	'11402687': handler.BuyItemHandler,
	'7404500': handler.BuyOrUpgradeCharacterHandler,
	'9434986': handler.SendEnergyHandler,
	'4453192': handler.AcceptEnergyHandler,
	'6487776': handler.RequestBatonHandler,
	'3473212': handler.InviteFriendHandler,
	'3470935': handler.LoadRewardHandler,
	'7470654': handler.BuyCostumeHandler,
	'2486858': handler.WearCostumeHandler,
	'13496872': handler.DrawFirstHandler,
	'9499341': handler.DrawSecondHandler,
	'520980': handler.EquipGhostHandler,
	'522803': handler.UnequipGhostHandler,
	'3536908': handler.PurchaseHouseHandler,
	'3538726': handler.RequestEvolutionHandler,
	'4585601': handler.AcceptEvolutionHandler,
	'7599702': handler.LoadEvolutionProgressHandler,
	'1572854': handler.LoadPostboxHandler,
};

exports.handle = handle;
