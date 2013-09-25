var handler = require('./g2l-handler');

var handle = {
	'3535091': handler.AccountLoginHandler,
	'588967': handler.ConcurrentUserHandler,
	'7534626': handler.PeakConcurrentUserHandler,
	'589692': handler.UniqueVisitorHandler,
	'4587419': handler.RetentionRateHandler,
	'2620907': handler.PayCharacterHandler,
	'10613532': handler.PayCoinHandler,
	'9630510': handler.PayHeartHandler,
	'1179605': handler.PayItemHandler,
	'1635278': handler.PayMoneyHandler,
	'1635188': handler.UserGamePlayHandler,
	'7665682': handler.UserRegisterHandler,
	'2683878': handler.UserUnregisterHandler,
};

exports.handle = handle;
