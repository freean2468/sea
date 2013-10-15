// Load the TCP Library
var net = require('net'),
	LogMgr = require('../common/log').LogMgr,
	session = require('./session')
	;

var currentDate = new Date();

function Client(socket) {
	// Property
	this.stream = null;
	this.indexOfStream = 0;
	this.socket = socket;	// client socket

	// Method
}

function Server(router) {
	// Property
	this.router = router;
	this.sessionMgr;
	this.logMgr = new LogMgr('../authServer/LOG/', currentDate);
	this.server;
	this.clientList = {};

	// Method
	this.create = function () {
		this.router.init();
		this.logMgr.init('AUTH');
		this.sessionMgr = new session.SessionMgr(this.logMgr);
		var that = this;

		this.server = net.createServer(function (socket) {
			var client = new Client(socket);

			that.clientList[socket._handle.fd] = client;
			
			// Handle incoming messages from clients.
			socket.on('data', function (chunk) {
				//console.log(socket.remoteAddress + ":" + socket.remotePort);			
				var client = that.clientList[socket._handle.fd];

				if (client.indexOfStream < 4) {
					var accumulatedLength = client.indexOfStream + chunk.length;
					var oldStream = client.stream;

					if (accumulatedLength < 4) {
						client.stream = null;
						client.stream = new Buffer(4);
						if (oldStream !== null) {
							oldStream.copy(client.stream, 0, 0);
							client.indexOfStream = oldStream.length;
						}
					} else {
						var buffer;
						var len;

						if (oldStream === null) {
							buffer = chunk;
							len = buffer.readUInt32LE(0);
							client.stream = null;
							client.stream = new Buffer(len);
						} else {
							buffer = new Buffer(accumulatedLength);
							buffer.concat([oldStream, new Buffer(chunk)], buffer.length);
							len = buffer.readUInt32LE(0);					
							client.stream = null;
							client.stream = new Buffer(len);
							oldStream.copy(client.stream, 0, 0);
							client.indexOfStream = oldStream.length;
							buffer = null;
						}
					}
				}

				chunk.copy(client.stream, client.indexOfStream, 0);
				client.indexOfStream += chunk.length;
				
				if (4 <= client.indexOfStream) {
					var len = client.stream.readUInt32LE(0);
					
					if (len <= client.indexOfStream) {
						if (client.stream.length < len) {
							that.logMgr('ERROR', 'client.stream.length < len');
							return;
						}

						var data = new Buffer(len - 4);	// Throw away 4bytes contain lenth value of packet.

						client.stream.copy(data, 0, 4, len);
//						client.stream = client.stream.slice(len);						
						client.stream = null;
						client.indexOfStream = 0;
						router.processPacket(that, socket, data);
					}
				}
			});
	 
			// Remove the client from the list when it leaves
			socket.on('end', function () {
				if (socket._handle !== null && socket._handle !== undefined) {
					delete that.clientList[socket._handle.fd];
					//this.logMgr('AUTH', socket + " left.");
				}
			});

			socket.on('close', function (socket) {
				console.log('socket left');
			});

			socket.on('error', function (error) {
				console.log('!!!!!!!!!! error occured');
				console.log(error);
			});
		});
	};

	this.listen = function (port) {
		this.server.listen(port);

		console.log("g2a-tcp-server(" + process.pid + ") has started at port " + port);
	};
}

module.exports = {
    'Server': Server,
};
