/*
	Here is where to interpret received data stream from clients.
    - Sends data to handler appropriate function.
*/

var handler = require('./g2a-handler');

function Router(proto) {
	// property
	this.proto = proto;
	this.decodeTable = {};
	this.dispatcherTable = {};

	// method
	this.registerPacketHandler = function (msgName, msg, handler) {
		var id = this.proto.genId(msgName);

		this.decodeTable[id] = msg;
		this.dispatcherTable[id] = handler;	
	};

	this.init = function () {
		this.proto.init();

		// Constructs factory that interpret packets and
		// Constructs dispatcher to send packet to appropriate handler.
		this.registerPacketHandler('g2a.RegisterSession', this.proto.g2a_pkg.RegisterSession, handler.P_RegisterSession);
		this.registerPacketHandler('g2a.UnregisterSession', this.proto.g2a_pkg.UnregisterSession, handler.P_UnregisterSession);
		this.registerPacketHandler('g2a.UpdateSession', this.proto.g2a_pkg.UpdateSession, handler.P_UpdateSession);
		this.registerPacketHandler('g2a.UpdateEndGameSession', this.proto.g2a_pkg.UpdateEndGameSession, handler.P_UpdateEndGameSession);
		this.registerPacketHandler('g2a.TraceStartGame', this.proto.g2a_pkg.TraceStartGame, handler.P_TraceStartGame);
	};

	this.processPacket = function (server, socket, data) {
		if (data.length <= 0) {
			console.log('data.length <= 0');
			return;
		}

		var id = data.readInt32LE(0);

		//console.log("[processPacket] id :" + id)
		//console.log(data);

		if (this.decodeTable[id] == null) {
			console.log("no factory for packet : " + id);
			return;
		}

		var msg = this.decodeTable[id].decode(data.slice(4));

		if (this.dispatcherTable[id] == null || typeof this.dispatcherTable[id] != 'function') {
			console.log("no dispatcher for packet" + id);
			return;
		}

		//console.log("[processPacket] " + msg);
		this.dispatcherTable[id](server, socket, msg);
	};
}

module.exports = {
    "Router": Router,
};
