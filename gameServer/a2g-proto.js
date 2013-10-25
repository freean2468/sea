/*
    This is module handles associated with packet.
	- Doesn't create object.
    - Locate both of packet factory and dispatcher to global scope and then share.
    - Doesn't reference any other modules.
*/
var protojs = require('protobufjs');

function Proto() {
	// property
	this.makerTable = {}; // pair = msgName + msg
	this.msgIdTable = {}; // pair = msg + msgId
	this.a2g_pkg = protojs.protoFromFile('../protocol/a2g.proto').build('A2G');
	this.g2a_pkg = protojs.protoFromFile('../protocol/g2a.proto').build('G2A');

	// method
	this.genId = function (msgName) {
		var id = 0;

		for (var i = 0; i < msgName.length; ++i) {
			id += msgName.charCodeAt(i) * (i + 1);
		}
		return id;
	};

	this.addMaker = function (msgName, msg) {
		id = this.genId(msgName);
		//console.log(msgName + ":" + id);

		this.msgIdTable[msg.prototype] = id;
		this.makerTable[msgName] = msg;
	};

	this.init = function () {
		// Register packet maker
		this.addMaker('a2g.SystemMessage', this.a2g_pkg.SystemMessage);
		this.addMaker('a2g.RegisterSessionReply', this.a2g_pkg.RegisterSessionReply);
		this.addMaker('a2g.UnregisterSessionReply', this.a2g_pkg.UnregisterSessionReply);
		this.addMaker('a2g.UpdateSessionReply', this.a2g_pkg.UpdateSessionReply);
		this.addMaker('a2g.UpdateEndGameSessionReply', this.a2g_pkg.UpdateEndGameSessionReply);
		//----
		this.addMaker('g2a.RegisterSession', this.g2a_pkg.RegisterSession);
		this.addMaker('g2a.UnregisterSession', this.g2a_pkg.UnregisterSession);
		this.addMaker('g2a.UpdateSession', this.g2a_pkg.UpdateSession);
		this.addMaker('g2a.TraceStartGame', this.g2a_pkg.TraceStartGame);
		this.addMaker('g2a.UpdateEndGameSession', this.g2a_pkg.UpdateEndGameSession);
	};

	this.packetMaker = function (name) {
	    return this.makerTable[name];
	};

	this.sendPacket = function (socket, msg) {
		var id = this.msgIdTable[msg.__proto__];

		//console.log('sendPacket : ' + id);

		var packet = msg.encode().toBuffer();
		var buffer = new Buffer(packet.length + 8);

		buffer.writeUInt32LE(buffer.length, 0);
		buffer.writeUInt32LE(id, 4);
		packet.copy(buffer, 8);

		socket.write(buffer);
	};
}

module.exports = {
    'Proto': Proto,
};
