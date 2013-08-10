var a2g_proto = require('./a2g-proto');
var sessionEvent = require('./a2g-event').sessionEvent;

function processSystemMessageReply(socket, data) {
	sessionEvent.emit('systemMessage', data.k_id, data.res);
}

function processRegisterSessionReply(socket, data) {
	sessionEvent.emit('register', data.k_id, data.session_id);
}

function processUnregisterSessionReply(socket, data) {
	sessionEvent.emit('unregister', data.k_id);
}

function processUpdateSessionReply(socket, data) {
	sessionEvent.emit('update', data.k_id);
}

module.exports = {
	"P_SystemMessage": processSystemMessageReply,
	"P_RegisterSessionReply": processRegisterSessionReply,
	"P_UnregisterSessionReply": processUnregisterSessionReply,
	"P_UpdateSessionReply": processUpdateSessionReply,
};
