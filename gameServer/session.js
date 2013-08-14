function toAuthRegisterSession(k_id, callback) {
	var server = require('./c2g-index').server;
	var client = server.getClient();
	var packetMgr = client.packetMgr;

	var RegisterSession = packetMgr.proto.packetMaker('g2a.RegisterSession');
	var toAuthMsg = new RegisterSession;
	
	toAuthMsg.k_id = k_id;

	var socket = client.getSocket().socket;
	packetMgr.proto.sendPacket(socket, toAuthMsg);

	client.sessionEvent.insert(k_id, function (res) {
		callback(res);
	});
}

function toAuthUnregisterSession(k_id, session_id, callback) {
	var server = require('./c2g-index').server;
	var client = server.getClient();
	var packetMgr = client.packetMgr;

	var UnregisterSession = packetMgr.proto.packetMaker('g2a.UnregisterSession');
	var toAuthMsg = new UnregisterSession;
	
	toAuthMsg.k_id = k_id;
	toAuthMsg.session_id = session_id;

	var socket = client.getSocket().socket;
	packetMgr.proto.sendPacket(socket, toAuthMsg);

	client.sessionEvent.insert(k_id, function (res) {
		callback(res);
	});
}

function toAuthUpdateSession(k_id, session_id, callback) {
	var server = require('./c2g-index').server;
	var client = server.getClient();
	var packetMgr = client.packetMgr;

	var UpdateSession = packetMgr.proto.packetMaker('g2a.UpdateSession');
	var toAuthMsg = new UpdateSession;
	
	toAuthMsg.k_id = k_id;
	toAuthMsg.session_id = session_id;

	var socket = client.getSocket().socket;
	packetMgr.proto.sendPacket(socket, toAuthMsg);

	client.sessionEvent.insert(k_id, function (res) {
		callback(res);
	});
}

module.exports = {
	'toAuthRegisterSession' : toAuthRegisterSession,
	'toAuthUnregisterSession' : toAuthUnregisterSession,
	'toAuthUpdateSession': toAuthUpdateSession,
};
