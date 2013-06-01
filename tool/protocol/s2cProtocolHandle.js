var protocolHandler = require('./protocolHandler');

var protocolHandle = {
	'-561450825': protocolHandler.registerAccountReplyHandler,
	'-734332534': protocolHandler.unregisterAccountReplyHandler,
	'-803210640': protocolHandler.startGameReplyHandler,
	'86832461': protocolHandler.accountInfoHandler,
	'8843447': protocolHandler.chargeInfoHandler,
	'1049161728': protocolHandler.rankInfoHandler,
	'7142187': protocolHandler.gameResultHandler,
	'-304875355': protocolHandler.versionInfoReplyHandler,
	'2005400364': protocolHandler.clientVerionInfoReplyHandler,
};

exports.protocolHandle = protocolHandle;
