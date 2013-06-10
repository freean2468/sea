var handler = require('./handler');

var handle = {
	'97057879': handler.VersionInfoHandler,
	'212532706': handler.VersionInfoReplyHandler,
	'70841257': handler.ClientVersionInfoHandler,
	'1271857080': handler.ClientVersionInfoReplyHandler,
};

exports.handle = handle;
