var handler = require('./handler');

var handle = {
	'1622018505': handler.RegisterAccountReplyHandler,
	'1952577891': handler.SelectCharacterReplyHandler,
	'1952577891': handler.SelectAssistantReplyHandler,
	'519762701': handler.StartGameReplyHandler,
	'74840653': handler.AccountInfoHandler,
	'7663927': handler.ChargeInfoHandler,
	'25751552': handler.RankInfoHandler,
	'10876551': handler.GameResultHandler,
};

exports.handle = handle;
