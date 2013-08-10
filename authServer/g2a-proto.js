/*
    This is module handles associated with packet.
	- Doesn't create object.
    - Locate both of packet factory and dispatcher to global scope and then share.
    - Doesn't reference any other modules.
*/
var protojs = require('protobufjs');

var makerTable = {},  // pair = msgName + msg
    msgIdTable = {},  // pair = msg + msgId
    msgIdList = [];   // For test to know whether all of IDs of messages is different or not.

var a2g_pkg = protojs.protoFromFile('../protocol/a2g.proto').build('A2G');
var g2a_pkg = protojs.protoFromFile('../protocol/g2a.proto').build('G2A');

function genID(msgName) {
    var id = 0;

    for (var i = 0; i < msgName.length; ++i) {
        id += msgName.charCodeAt(i) * (i + 1);
    }
    return id;
}

function addMaker(msgName, msg) {
    id = genID(msgName);
	console.log(msgName + ":"+ id);

    msgIdTable[msg.prototype] = id;
    makerTable[msgName] = msg;
    msgIdList.push(id);
}

function init() {
    // Register packet maker
	addMaker('a2g.SystemMessage', a2g_pkg.SystemMessage);
    addMaker('a2g.RegisterSessionReply', a2g_pkg.RegisterSessionReply);
    addMaker('a2g.UnregisterSessionReply', a2g_pkg.UnregisterSessionReply);
	addMaker('a2g.UpdateSessionReply', a2g_pkg.UpdateSessionReply);
    //----
    addMaker('g2a.RegisterSession', g2a_pkg.RegisterSession);
    addMaker('g2a.UnregisterSession', g2a_pkg.UnregisterSession);
	addMaker('a2g.UpdateSession', g2a_pkg.UpdateSession);
}

function packetMaker(name) {
    return makerTable[name];
}

function sendPacket(socket, msg) {
	var id = msgIdTable[msg.__proto__];

    console.log("sendpacket : " + msg);    

    var packet = msg.encode().toBuffer();
    var buffer = new Buffer(packet.length + 8);

	buffer.writeUInt32LE(buffer.length, 0);
    buffer.writeUInt32LE(id, 4);
    packet.copy(buffer, 8);
    
    //console.log("send packet :");
    //console.log(buffer);

	socket.write(buffer);
}

module.exports = {
    "a2g_pkg": a2g_pkg,
    "g2a_pkg": g2a_pkg,
    "init": init,
    "genID" : genID,
    "packetMaker" : packetMaker,
    "sendPacket" : sendPacket,
    "msgIdList" : msgIdList,  // For test.
};
