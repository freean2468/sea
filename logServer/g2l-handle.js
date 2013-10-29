var handler = require('./g2l-handler');

var handle = {
	'5632015': handler.AccountLoginHandler,
	'1634406': handler.ConcurrentUserHandler,
	'15922294': handler.PeakConcurrentUserHandler,
	'3600600': handler.UniqueVisitorHandler,
	'651571': handler.RetentionRateHandler,
	'6681968': handler.PayCharacterHandler,
	'10680691': handler.PayCoinHandler,
	'3667218': handler.PayEnergyHandler,
	'6682325': handler.PayItemHandler,
	'7664756': handler.PayMoneyHandler,
	'1703442': handler.UserGamePlayHandler,
	'16839580': handler.UserRegisterHandler,
	'1703457': handler.UserUnregisterHandler,
};

exports.handle = handle;
