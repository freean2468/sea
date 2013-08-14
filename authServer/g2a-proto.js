/*
    This is module handles associated with packet.
	- Doesn't create object.
    - Locate both of packet factory and dispatcher to global scope and then share.
    - Doesn't reference any other modules.
*/
var protojs = require('protobufjs');

function Proto () {
	// property
	this.makerTable = {};  // pair = msgName + msg
    this.msgIdTable = {};  // pair = msg + msgId
    this.msgIdList = [];   // For test to know whether all of ID of messages is different or not.
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
		//console.log(msgName + ":"+ id);

		this.msgIdTable[msg.prototype] = id;
		this.makerTable[msgName] = msg;
		this.msgIdList.push(id);
	};

	this.init = function () {
	    // Register packet maker
		this.addMaker('a2g.SystemMessage', this.a2g_pkg.SystemMessage);
		this.addMaker('a2g.RegisterSessionReply', this.a2g_pkg.RegisterSessionReply);
		this.addMaker('a2g.UnregisterSessionReply', this.a2g_pkg.UnregisterSessionReply);
		this.addMaker('a2g.UpdateSessionReply', this.a2g_pkg.UpdateSessionReply);
		//----
		this.addMaker('g2a.RegisterSession', this.g2a_pkg.RegisterSession);
		this.addMaker('g2a.UnregisterSession', this.g2a_pkg.UnregisterSession);
		this.addMaker('a2g.UpdateSession', this.g2a_pkg.UpdateSession);
	};

	this.packetMaker = function (name) {
	    return this.makerTable[name];
	};

	this.sendPacket = function (socket, msg) {
		var id = this.msgIdTable[msg.__proto__];

		//console.log("sendpacket : " + msg);    

		var packet = msg.encode().toBuffer();
		var buffer = new Buffer(packet.length + 8);

		buffer.writeUInt32LE(buffer.length, 0);
		buffer.writeUInt32LE(id, 4);
		packet.copy(buffer, 8);
		
		//console.log("send packet :");
		//console.log(buffer);

		var res = socket.write(buffer);

		if (res == true) {
			//console.log('all buffer was flushed to the kernel buffer');
		} else {
			console.log('Drain event will be emitted.');		
		}
	};
}

module.exports = {
	'Proto': Proto,
};
