var UUID = require('../common/util').UUID;

function toAuthRegisterSession(k_id, callback) {
	var server = require('./c2g-index').server;
	var client = server.getClient();
	var packetMgr = client.packetMgr;

	var RegisterSession = packetMgr.proto.packetMaker('g2a.RegisterSession');
	var toAuthMsg = new RegisterSession;
	var callbackId = UUID();

	toAuthMsg.callback_id = callbackId;	
	toAuthMsg.k_id = k_id;

	var socket = client.getSocket().socket;
	packetMgr.proto.sendPacket(socket, toAuthMsg);

	client.sessionEvent.insert(callbackId, function (res) {
		callback(res);
	});
}

function toAuthUnregisterSession(session_id, callback) {
	var server = require('./c2g-index').server;
	var client = server.getClient();
	var packetMgr = client.packetMgr;

	var UnregisterSession = packetMgr.proto.packetMaker('g2a.UnregisterSession');
	var toAuthMsg = new UnregisterSession;
	var callbackId = UUID();

	toAuthMsg.callback_id = callbackId;	
	toAuthMsg.session_id = session_id;

	var socket = client.getSocket().socket;
	packetMgr.proto.sendPacket(socket, toAuthMsg);

	client.sessionEvent.insert(callbackId, function (res) {
		callback(res);
	});
}

function toAuthUpdateSession(session_id, callback) {
	var server = require('./c2g-index').server;
	var client = server.getClient();
	var packetMgr = client.packetMgr;

	var UpdateSession = packetMgr.proto.packetMaker('g2a.UpdateSession');
	var toAuthMsg = new UpdateSession;
	var callbackId = UUID();

	toAuthMsg.callback_id = callbackId;	
	toAuthMsg.session_id = session_id;

	var socket = client.getSocket().socket;
	packetMgr.proto.sendPacket(socket, toAuthMsg);

	client.sessionEvent.insert(callbackId, function (res) {
		callback(res);
	});
}

module.exports = {
	'toAuthRegisterSession' : toAuthRegisterSession,
	'toAuthUnregisterSession' : toAuthUnregisterSession,
	'toAuthUpdateSession': toAuthUpdateSession,
};
