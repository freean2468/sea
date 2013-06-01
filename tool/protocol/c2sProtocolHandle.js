var protocolHandler = require('./protocolHandler');

var protocolHandle = {
	'1791621329': protocolHandler.registerAccountHandler,
	'1727001234': protocolHandler.unregisterAccountHandler,
	'19331440': protocolHandler.loadUserInfoHandler,
	'890369080': protocolHandler.checkInChargeHandler,
	'193227': protocolHandler.startGameHandler,
	'1309014912': protocolHandler.endGameHandler,
	'1963864': protocolHandler.loadRankInfoHandler,
	'-239339370': protocolHandler.requestPointRewardHandler,
};

exports.protocolHandle = protocolHandle;
