var	toAuth = require('./a2g-client').toAuth;
var sessionEvent = require('./a2g-event').sessionEvent;

function toAuthRegisterSession(k_id, callback) {
	var RegisterSession = toAuth.proto.packetMaker('g2a.RegisterSession');
	var toAuthMsg = new RegisterSession;
	
	toAuthMsg.k_id = k_id;

	toAuth.proto.sendPacket(toAuth.socket, toAuthMsg);

	sessionEvent.insert(k_id, function (res) {
		callback(res);
	});
}

function toAuthUnregisterSession(k_id, session_id, callback) {
	var UnregisterSession = toAuth.proto.packetMaker('g2a.UnregisterSession');
	var toAuthMsg = new UnregisterSession;
	
	toAuthMsg.k_id = k_id;
	toAuthMsg.session_id = session_id;

	toAuth.proto.sendPacket(toAuth.socket, toAuthMsg);

	sessionEvent.insert(k_id, function (res) {
		callback(res);
	});
}

function toAuthUpdateSession(k_id, session_id, callback) {
	var UpdateSession = toAuth.proto.packetMaker('g2a.UpdateSession');
	var toAuthMsg = new UpdateSession;
	
	toAuthMsg.k_id = k_id;
	toAuthMsg.session_id = session_id;

	toAuth.proto.sendPacket(toAuth.socket, toAuthMsg);

	sessionEvent.insert(k_id, function (res) {
		callback(res);
	});
}

module.exports = {
	'toAuthRegisterSession' : toAuthRegisterSession,
	'toAuthUnregisterSession' : toAuthUnregisterSession,
	'toAuthUpdateSession': toAuthUpdateSession,
};
