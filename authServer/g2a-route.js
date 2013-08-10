/*
	Here is where to interpret received data stream from clients.
    - Sends data to handler appropriate function.
*/

var handler = require('./g2a-handler'),
    proto = require('./g2a-proto');

var decodeTable = {};
var dispatcherTable = {};

function registerPacketHandler(msgName, msg, handler) {
	var id = proto.genID(msgName);

	decodeTable[id] = msg;
	dispatcherTable[id] = handler;
}

function init() {
    proto.init();

    // Constructs factory that interpret packets and
	// Constructs dispatcher to send packet to appropriate handler.
	registerPacketHandler('g2a.RegisterSession', proto.g2a_pkg.RegisterSession, handler.P_RegisterSession);
	registerPacketHandler('g2a.UnregisterSession', proto.g2a_pkg.UnregisterSession, handler.P_UnregisterSession);
	registerPacketHandler('g2a.UpdateSession', proto.g2a_pkg.UpdateSession, handler.P_UpdateSession);
}

// size + data = header(id) + body(protobuf)
function processPakcet(socket, data) {
    if (data.length <= 0) {
		console.log('data.length <= 0');
		return;
	}

    var id = data.readInt32LE(0);

    //console.log("[processPacket] id :" + id)
    //console.log(data);

    if (decodeTable[id] == null) {
        console.log("no factory for packet : " + id);
        return;
    }

    var msg = decodeTable[id].decode(data.slice(4));

    if (dispatcherTable[id] == null || typeof dispatcherTable[id] != 'function') {
        console.log("no dispatcher for packet" + id);
        return;
    }

    //console.log("[processPacket] " + msg);
    dispatcherTable[id](socket, msg);
}

module.exports = {
    "init": init,
    "processPakcet": processPakcet,
};
