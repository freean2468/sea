/*
 * AuthServer has very restricted responsibility that is to manage session.
 * Synchronize session with game servers connected to this.
 */

function processRegisterSession(server, socket, data) {
    var RegisterSessionReply = server.router.proto.packetMaker('a2g.RegisterSessionReply');
    var msg = new RegisterSessionReply;

	var res = server.sessionMgr.registerSession(data.k_id);

	if (res !== false) {
		msg.session_id = res;
	} else {
		var SystemMessage = server.router.proto.packetMaker('a2g.SystemMessage');
		msg = null;
		msg = new SystemMessage;

		msg.res = SystemMessage.Result['DUPLICATED_LOGIN'];
	}

	msg.k_id = data.k_id;

	server.router.proto.sendPacket(socket, msg);
}

function processUnregisterSession(server, socket, data) {
    var UnregisterSessionReply = server.router.proto.packetMaker('a2g.UnregisterSessionReply');
    var msg = new UnregisterSessionReply;

	var res = server.sessionMgr.unregisterSession(data.k_id, data.session_id);

	if (res) {

	} else {
		var SystemMessage = server.router.proto.packetMaker('a2g.SystemMessage');
		msg = null;
		msg = new SystemMessage;

		msg.res = SystemMessage.Result['INVALID_SESSION'];
	}

	msg.k_id = data.k_id;

	server.router.proto.sendPacket(socket, msg);
}

function processUpdateSession(server, socket, data) {
    var UpdateSessionReply = server.router.proto.packetMaker('a2g.UpdateSessionReply');
    var msg = new UpdateSessionReply;

	var res = server.sessionMgr.updateSession(data.k_id, data.session_id);

	if (res) {

	} else {
		var SystemMessage = server.router.proto.packetMaker('a2g.SystemMessage');
		msg = null;
		msg = new SystemMessage;

		msg.res = SystemMessage.Result['INVALID_SESSION'];
	}

	msg.k_id = data.k_id;
	
	server.router.proto.sendPacket(socket, msg);
}

module.exports = {
	"P_RegisterSession": processRegisterSession,
	"P_UnregisterSession": processUnregisterSession,
	"P_UpdateSession": processUpdateSession,
};
