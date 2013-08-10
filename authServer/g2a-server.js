// Load the TCP Library
var net = require('net');
var g2a_route = require('./g2a-route');
var clientList = {};

function Client(socket) {
	// Property
	this.stream = null;
	this.indexOfStream = 0;
	this.socket = socket;	// client socket

	// Method
}

function createServer(route) {
	route.init();

    var tcp = net.createServer(function (socket) {
		var client = new Client(socket);
		
		clientList[socket._handle.fd] = client;
 
        // Handle incoming messages from clients.
        socket.on('data', function (chunk) {
            //console.log(socket.remoteAddress + ":" + socket.remotePort);			
            var client = clientList[socket._handle.fd];

			if (client.indexOfStream < 4) {
				var accuratedLength = client.indexOfStream + chunk.length;
				var oldStream = client.stream;

				if (accuratedLength < 4) {
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
						buffer = new Buffer(accuratedLength);
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
						console.log('client.stream.length < len');
						return;
					}

					var data = new Buffer(len - 4);	// Throw away 4bytes contain lenth value of packet.

					client.stream.copy(data, 0, 4, len);
					client.stream = client.stream.slice(len);
					route.processPakcet(socket, data);
					
					client.stream = null;
					client.indexOfStream = 0;
				}
			}
        });
 
        // Remove the client from the list when it leaves
        socket.on('end', function () {
			if (socket._handle.fd !== null) {
		        delete clientList[socket._handle.fd];
				console.log(socket + " left.");
			}
        });
    });
    return tcp;
}

// createServer(0, g2a_route);

//pb_sever method
module.exports = {
    'createServer': createServer,
	'getClientList': function() {
		return clientList;
	},
};
