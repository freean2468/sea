function processSystemMessageReply(client, socket, data) {
	client.sessionEvent.systemMessage(data.k_id, data.res);
}

function processRegisterSessionReply(client, socket, data) {
	client.sessionEvent.register(data.k_id, data.session_id);
}

function processUnregisterSessionReply(client, socket, data) {
	client.sessionEvent.unregister(data.k_id);
}

function processUpdateSessionReply(client, socket, data) {
	client.sessionEvent.update(data.k_id);
}

module.exports = {
	"P_SystemMessage": processSystemMessageReply,
	"P_RegisterSessionReply": processRegisterSessionReply,
	"P_UnregisterSessionReply": processUnregisterSessionReply,
	"P_UpdateSessionReply": processUpdateSessionReply,
};
