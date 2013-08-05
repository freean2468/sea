var handler = require('./handler');

var handle = {
	'7599707': handler.AccountLoginHandler,
	'4584043': handler.ConcurrentUserHandler,
	'3603338': handler.PeakConcurrentUserHandler,
	'8585154': handler.UniqueVisitorHandler,
	'10615070': handler.RetentionRateHandler,
	'1637470': handler.PayAssistantHandler,
	'5634001': handler.PayCharacterHandler,
	'10681968': handler.PayCoinHandler,
	'2683878': handler.PayHeartHandler,
	'6683602': handler.PayItemHandler,
	'4715093': handler.PayMoneyHandler,
	'1701625': handler.UserGamePlayHandler,
	'7732116': handler.UserRegisterHandler,
	'1701548': handler.UserUnregisterHandler,
};

exports.handle = handle;
