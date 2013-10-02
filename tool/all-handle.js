var handler = require('./handler');

var handle = {
	'1374569': handler.VersionInfoHandler,
	'6354906': handler.RegisterAccountHandler,
	'2356724': handler.UnregisterAccountHandler,
	'12322730': handler.LoginHandler,
	'389124': handler.LogoutHandler,
	'1372651': handler.CheckInChargeHandler,
	'390853': handler.SelectCharacterHandler,
	'389330': handler.StartGameHandler,
	'1375967': handler.EndGameHandler,
	'6420788': handler.LoadRankInfoHandler,
	'5439087': handler.LoadPostedEnergyHandler,
	'5438714': handler.LoadPostedBatonHandler,
	'5438626': handler.LoadPostedBatonResultHandler,
	'5501882': handler.RequestPointRewardHandler,
	'5503699': handler.BuyItemHandler,
	'7468656': handler.BuyOrUpgradeCharacterHandler,
	'5502145': handler.SendEnergyHandler,
	'10484584': handler.AcceptEnergyHandler,
	'11532354': handler.RequestBatonHandler,
	'4520985': handler.AcceptBatonHandler,
	'6551479': handler.EndBatonHandler,
	'4520520': handler.AcceptBatonResultHandler,
	'2555106': handler.UpgradeFactorHandler,
	'3601985': handler.InviteFriendHandler,
	'2554651': handler.LoadRewardHandler,
	'7600427': handler.BuyCostumeHandler,
	'3603343': handler.WearCostumeHandler,
	'12580588': handler.DrawFirstHandler,
	'9632019': handler.DrawSecondHandler,
	'653848': handler.EquipGhostHandler,
	'651576': handler.UnequipGhostHandler,
	'3669680': handler.PurchaseRoomHandler,
	'2683884': handler.AccountLoginHandler,
	'6683602': handler.ConcurrentUserHandler,
	'2683418': handler.PeakConcurrentUserHandler,
	'3668852': handler.UniqueVisitorHandler,
	'6682959': handler.RetentionRateHandler,
	'1572242': handler.PayCharacterHandler,
	'57014259': handler.PayCoinHandler,
	'11728187': handler.PayEnergyHandler,
	'6749484': handler.PayItemHandler,
	'3733917': handler.PayMoneyHandler,
	'1767594': handler.UserGamePlayHandler,
	'7798091': handler.UserRegisterHandler,
	'4783518': handler.UserUnregisterHandler,
};

exports.handle = handle;
