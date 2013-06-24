var handler = require('./handler');

var handle = {
	'64812982': handler.AccountLoginHandler,
	'1694830347': handler.ConcurrentUserHandler,
	'1062535298': handler.PeakConcurrentUserHandler,
	'1240072080': handler.UniqueVisitorHandler,
	'920645671': handler.RetentionRateHandler,
	'141882649': handler.PayAssistantHandler,
	'12186137': handler.PayCharacterHandler,
	'184089216': handler.PayCoinHandler,
	'2093740032': handler.PayHeartHandler,
	'1894117888': handler.PayItemHandler,
	'669446144': handler.PayMoneyHandler,
	'97122730': handler.UserGamePlayHandler,
	'124058308': handler.UserRegisterHandler,
	'1240071080': handler.UserUnregisterHandler,
};

exports.handle = handle;
