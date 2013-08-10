/*
 * AuthServer has very restricted responsibility that is to manage session.
 * Synchronize session with game servers connected to this.
 */

var g2a_proto = require('./g2a-proto'),
	sessionMgr = require('./session').sessionMgr;

function processRegisterSession(socket, data) {
    var RegisterSessionReply = g2a_proto.packetMaker('a2g.RegisterSessionReply');
    var msg = new RegisterSessionReply;
	var clientList = require('./g2a-server').getClientList();

	var res = sessionMgr.registerSession(data.k_id);

	if (res !== false) {
		msg.session_id = res;
	} else {
		var SystemMessage = g2a_proto.packetMaker('a2g.SystemMessage');
		msg = null;
		msg = new SystemMessage;

		msg.res = SystemMessage.Result['DUPLICATED_LOGIN'];
	}

	msg.k_id = data.k_id;

	g2a_proto.sendPacket(socket, msg);
}

function processUnregisterSession(socket, data) {
    var UnregisterSessionReply = g2a_proto.packetMaker('a2g.UnregisterSessionReply');
    var msg = new UnregisterSessionReply;
	var clientList = require('./g2a-server').getClientList();

	var res = sessionMgr.unregisterSession(data.k_id, data.session_id);

	if (res) {

	} else {
		var SystemMessage = g2a_proto.packetMaker('a2g.SystemMessage');
		msg = null;
		msg = new SystemMessage;

		msg.res = SystemMessage.Result['INVALID_SESSION'];
	}

	msg.k_id = data.k_id;

	g2a_proto.sendPacket(socket, msg);
}

function processUpdateSession(socket, data) {
    var UpdateSessionReply = g2a_proto.packetMaker('a2g.UpdateSessionReply');
    var msg = new UpdateSessionReply;
	var clientList = require('./g2a-server').getClientList();

	var res = sessionMgr.updateSession(data.k_id, data.session_id);

	if (res) {

	} else {
		var SystemMessage = g2a_proto.packetMaker('a2g.SystemMessage');
		msg = null;
		msg = new SystemMessage;

		msg.res = SystemMessage.Result['INVALID_SESSION'];
	}

	msg.k_id = data.k_id;

	g2a_proto.sendPacket(socket, msg);
}

module.exports = {
	"P_RegisterSession": processRegisterSession,
	"P_UnregisterSession": processUnregisterSession,
	"P_UpdateSession": processUpdateSession,
};
