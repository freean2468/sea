var protocolHandler = require('./protocolHandler');

var protocolHandle = {
	'979162': protocolHandler.versionInfoHandler,
	'-188222551': protocolHandler.clientVersionInfoHandler,
};

exports.protocolHandle = protocolHandle;
