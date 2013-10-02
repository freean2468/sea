var handler = require('./g2l-handler');

var handle = {
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
