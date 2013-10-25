function processSystemMessageReply(client, socket, data) {
	client.sessionEvent.systemMessage(data.callback_id, data.res);
}

function processRegisterSessionReply(client, socket, data) {
	client.sessionEvent.register(data.callback_id, data.session_id);
}

function processUnregisterSessionReply(client, socket, data) {
	client.sessionEvent.unregister(data.callback_id, data.k_id);
}

function processUpdateSessionReply(client, socket, data) {
	client.sessionEvent.update(data.callback_id, data.k_id);
}

function processUpdateEndGameSessionReply(client, socket, data) {
	client.sessionEvent.trace(data.callback_id, data.k_id, data.start_time, data.double_exp);
}

module.exports = {
	'P_SystemMessage': processSystemMessageReply,
	'P_RegisterSessionReply': processRegisterSessionReply,
	'P_UnregisterSessionReply': processUnregisterSessionReply,
	'P_UpdateSessionReply': processUpdateSessionReply,
	'P_UpdateEndGameSessionReply': processUpdateEndGameSessionReply,
};
