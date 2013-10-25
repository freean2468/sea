/*
 * AuthServer has very restricted responsibility to manage session.
 * Synchronize session with connected game servers.
 */

function processRegisterSession(server, socket, data) {
    var RegisterSessionReply = server.router.proto.packetMaker('a2g.RegisterSessionReply');
    var msg = new RegisterSessionReply;

	var res = server.sessionMgr.registerSession(data.k_id);

	msg.session_id = res;
	msg.callback_id = data.callback_id;

	server.router.proto.sendPacket(socket, msg);
}

function processUnregisterSession(server, socket, data) {
    var UnregisterSessionReply = server.router.proto.packetMaker('a2g.UnregisterSessionReply');
    var msg = new UnregisterSessionReply;

	var res = server.sessionMgr.unregisterSession(data.session_id);

	if (res === false) {
		var SystemMessage = server.router.proto.packetMaker('a2g.SystemMessage');
		msg = null;
		msg = new SystemMessage;

		msg.res = SystemMessage.Result['INVALID_SESSION'];
	} else {
		msg.k_id = res;
	}

	msg.callback_id = data.callback_id;

	server.router.proto.sendPacket(socket, msg);
}

function processUpdateSession(server, socket, data) {
    var UpdateSessionReply = server.router.proto.packetMaker('a2g.UpdateSessionReply');
    var msg = new UpdateSessionReply;

	var res = server.sessionMgr.updateSession(data.session_id);

	if (res === false) {
		var SystemMessage = server.router.proto.packetMaker('a2g.SystemMessage');
		msg = null;
		msg = new SystemMessage;

		msg.res = SystemMessage.Result['INVALID_SESSION'];
	} else {
		msg.k_id = res;
	}

	msg.callback_id = data.callback_id;

	server.router.proto.sendPacket(socket, msg);
}

function processTraceStartGame(server, socket, data) {
	server.sessionMgr.traceStartGame(data);
}

function processUpdateEndGameSession(server, socket, data) {
    var UpdateEndGameSessionReply = server.router.proto.packetMaker('a2g.UpdateEndGameSessionReply');
    var msg = new UpdateEndGameSessionReply;

	var traceData = server.sessionMgr.updateEndGameSession(data.session_id);

	if (traceData === false) {
		var SystemMessage = server.router.proto.packetMaker('a2g.SystemMessage');
		msg = null;
		msg = new SystemMessage;

		msg.res = SystemMessage.Result['INVALID_SESSION'];
	} else {
		msg.k_id = traceData['k_id'];
		msg.start_time = traceData['start_time'];
		msg.double_exp = traceData['double_exp'];
	}

	msg.callback_id = data.callback_id;

	server.router.proto.sendPacket(socket, msg);
}

module.exports = {
	'P_RegisterSession': processRegisterSession,
	'P_UnregisterSession': processUnregisterSession,
	'P_UpdateSession': processUpdateSession,
	'P_TraceStartGame': processTraceStartGame,
	'P_UpdateEndGameSession': processUpdateEndGameSession,
};
