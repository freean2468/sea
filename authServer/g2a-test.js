/*
	Basic tests about protocol and connection.
    - Protocol IDs Should not be duplicated each other.
    - Sends and receives appropriate version info.
*/

var net = require('net'),
    assert = require('assert'),
    auth_server = require('../auth-server'),
    auth_route = require('../auth-route'),
	auth_proto = require('../auth-proto');

module.exports = {
    'Protocol IDs Should not be duplicated each other.' : function() {
        auth_proto.msgIdList.forEach(function(id) {
            var count = 0;
            auth_proto.msgIdList.forEach(function(id2) {
                if (id == id2) ++count;
            });

            assert.equal(count, 1); // There is nothing except myself.
        });
    }
    ,
    'Sends and receives appropriate version info.' : function () {
        var HOST = '127.0.0.1';
        var PORT = 7770;
        var version = 1234;

        var server = auth_server.createServer(version, auth_route);
		server.listen(PORT);

		var client = new net.Socket();
		client.connect(PORT, HOST, function () {
            //console.log('CONNECTED TO: ' + HOST + ':' + PORT);
			
            client.stream = new Buffer(20);
			client.indexOfStream = 0;
		
			//send version packet
			var VersionInfo = auth_proto.packetMaker('c2s.VersionInfo');
			var msg = new VersionInfo;
			msg['version'] = version;
			auth_proto.sendPacket(client, msg);           
		});

		// Add a 'data' event handler for the client socket
		// data is what the server sent to this socket
		client.on('data', function (data) {
			data.copy(client.stream, client.indexOfStream, 0);
			client.indexOfStream += data.length;
			
			var len = client.stream.readUInt32LE(0);
			if (len <= client.indexOfStream) {
				var data = new Buffer(len - 8);
				client.stream.copy(data, 0, 8, len);
				client.stream = client.stream.slice(len);
				
				var msg = auth_proto.packetMaker('s2c.VersionInfo').decode(data);
				assert.equal(msg['version'], version);
				
				client.destroy();
			}
		});

		// Add a 'close' event handler for the client socket
		client.on('close', function () {
			console.log('Connection closed');
            server.close();
		});
    },
};
