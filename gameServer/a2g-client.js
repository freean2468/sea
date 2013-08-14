var net = require('net');

var Proto = require('./a2g-proto').Proto,
	SessionEvent = require('./a2g-event').SessionEvent;

var SOCKET_COUNT_PER_CLIENT = 10;

function Socket(packetMgr) {
	// property
	this.socket = new net.Socket();
	this.stream = null;
	this.indexOfStream = 0;
	this.activity = false;
	this.packetMgr = packetMgr;

	// method
	this.connect = function (host, port) {	
		this.socket.connect(port, host, function () {
			console.log('CONNECTED TO : ' + host + ':' + port);
		});

		var that = this;

		// Add a 'data' event handler for the client socket
		// chunk is what the server sent to this socket
		this.socket.on('data', function (chunk) {
			if (that.indexOfStream < 4) {
				var accumulatedLength = that.indexOfStream + chunk.length;
				var oldStream = that.stream;

				if (accumulatedLength < 4) {
					that.stream = null;
					that.stream = new Buffer(4);
					if (oldStream !== null) {
						oldStream.copy(that.stream, 0, 0);
						that.indexOfStream = oldStream.length;
					}
				} else {
					var buffer;
					var len;
					
					if (oldStream === null) {
						buffer = chunk;
						len = buffer.readUInt32LE(0);
						that.stream = null;
						that.stream = new Buffer(len);
					} else {
						buffer = new Buffer(accumulatedLength);
						buffer.concat([oldStream, new Buffer(chunk)], buffer.length);
						var len = buffer.readUInt32LE(0);
						that.stream = null;
						that.stream = new Buffer(len);
						oldStream.copy(that.stream, 0, 0);
						that.indexOfStream = oldStream.length;
						buffer = null;
					}
				}
			}

			chunk.copy(that.stream, that.indexOfStream, 0);
			that.indexOfStream += chunk.length;

			if (4 <= that.indexOfStream) {
				var len = that.stream.readUInt32LE(0);
				
				if (len <= that.indexOfStream) {
					if (that.stream.length < len) {
						console.log('stream.length < len');
						return;
					}

					var data = new Buffer(len - 4);	// Throw away 4bytes containing lenth of packet.

					that.stream.copy(data, 0, 4, len);
//					that.stream = that.stream.slice(len);
					that.stream = null;
					that.indexOfStream = 0;
					that.packetMgr.processPacket(that, data);
					that.off();
				}
			}
		});

		// Add a 'close' event handler for the client socket
		this.socket.on('close', function () {
			console.log('Connection is closed');
		});

		this.socket.on('error', function (error) {
			console.log('!!!!!!!!!!!!!!!!!!!error occured');
			console.log(error);
		});
	};

	this.on = function () {
		this.activity = true;	
	};

	this.off = function () {
		this.activity = false;
	};
}

function PacketMgr(client) {
	// property
	this.handler = require('./a2g-handler');
	this.proto = new Proto();
	this.decodeTable = {};
	this.dispatcherTable = {};	
	this.client = client;

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
		this.registerPacketHandler('a2g.SystemMessage', this.proto.a2g_pkg.SystemMessage, this.handler.P_SystemMessage);
		this.registerPacketHandler('a2g.RegisterSessionReply', this.proto.a2g_pkg.RegisterSessionReply, this.handler.P_RegisterSessionReply);
		this.registerPacketHandler('a2g.UnregisterSessionReply', this.proto.a2g_pkg.UnregisterSessionReply, this.handler.P_UnregisterSessionReply);
		this.registerPacketHandler('a2g.UpdateSessionReply', this.proto.a2g_pkg.UpdateSessionReply, this.handler.P_UpdateSessionReply);
	}

	// size + data = header(id) + body(protobuf)
	this.processPacket = function (socket, data) {
		if (data.length <= 0) {
			console.log('data.length <= 0');
			return;
		}

		//console.log("[processPacket] id :" + id)
		//console.log(data);

		var id = data.readInt32LE(0);

		if (this.decodeTable[id] == null) {
			console.log("no factory for packet : " + id);
			return;
		}

		var msg = this.decodeTable[id].decode(data.slice(4));

		if (this.dispatcherTable[id] === null || typeof this.dispatcherTable[id] !== 'function') {
			console.log("no dispatcher for packet" + id);
			return;
		}

		//console.log("[processPacket] " + msg);
		this.dispatcherTable[id](this.client, socket, msg);
	};
}

function Client(host, port) {
	/*
		property
	*/
	this.sessionEvent = new SessionEvent();
	this.socketList = [];
	this.host = host;
	this.port = port;
	this.socketIndex = 0;
	this.packetMgr = new PacketMgr(this);

	/*
		method
	*/
	this.init = function () {
		this.sessionEvent.init();
		this.packetMgr.init();

		for (var i = 0; i < SOCKET_COUNT_PER_CLIENT; ++i) {
			var socket = new Socket(this.packetMgr);
			socket.connect(this.host, this.port);
			this.socketList.push(socket);
		}
	}


	this.getSocket = function () {
		for (var i = 0, l = this.socketList.length; i < l; ++i) {
			var socket = this.socketList[i];

			if (socket.activity === false) {
				socket.on();
				return socket;
			}
		}
		var socket = new Socket(this.packetMgr);
		socket.connect(this.host, this.port);
		this.socketList.push(socket);
		socket.on();
		return socket;
	};
}

module.exports = {
	'Client': Client,
	'PacketMgr': PacketMgr,
};
