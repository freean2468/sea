var protocolHandler = require('./protocolHandler');

var protocolHandle = {
	'-562433242': protocolHandler.requestRankingReplyHandler,
};

exports.protocolHandle = protocolHandle;
