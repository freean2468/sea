var handler = require('./handler');

var handle = {
	'97057879': handler.VersionInfoHandler,
	'70841257': handler.ClientVersionInfoHandler,
};

exports.handle = handle;
