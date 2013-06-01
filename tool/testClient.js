var ver = require('./protocol/verProtocol');
var c2s = require('./protocol/c2sProtocol');
var s2c = require('./protocol/s2cProtocol');
var registerAccount = c2s.registerAccount;
var loadUserInfo = c2s.loadUserInfo;
var loadRankInfo = c2s.loadRankInfo;
var unregisterAccount = c2s.unregisterAccount;
var checkInCharge = c2s.checkInCharge;
var startGame = c2s.startGame;
var endGame = c2s.endGame;

var http = require('http');

function UUID() {
	 var str = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx';
	 return str.replace(/[xy]/g, function(c) {
		 var r = Math.random() * 16|0, v = c == 'x' ? r : (r&0x3|0x8);
		 return v.toString(16);
	 });
}

registerAccount['k_id'] = UUID();

request(registerAccount);

function request(data) {
	var jsonData = JSON.stringify(data);

	var opts = {
		host: 'localhost',
		port: 8888,
		method: 'POST',
		path: '/',
		headers: {
			'Content-Type': 'application/json',
			'Content-Type': jsonData.length
		}
	};

	var callback = function(response) {
		var res_data = '';

		console.log('STATUS: ' + response.statusCode);
		console.log('HEADERS: ' + JSON.stringify(response.headers));
		
		response.setEncoding('utf8');

		response.on('data', function(chunk) {
			res_data += chunk;
		});

		response.on('end', function() {
			console.log(res_data);

			var res = JSON.parse(res_data);

			if (res['id'] === s2c.registerAccountReply['id']) {
				console.log('registerAccountReply \n');
				loadUserInfo['k_id'] = res['k_id'];
				request(loadUserInfo);

//				unregisterAccount['k_id'] = res['k_id'];
//				request(unregisterAccount);
			}
			else if (res['id'] === s2c.unregisterAccountReply['id']) {
				console.log('unregisterAccountReply \n');				
			} 
			else if (res['id'] === s2c.accountInfo['id']) {
				console.log('accountInfo \n');

				loadRankInfo['k_id'] = loadUserInfo['k_id'];
				request(loadRankInfo);
			}
			else if (res['id'] === s2c.rankInfo['id']) {
				console.log('rankInfo \n');

				checkInCharge['k_id'] = loadUserInfo['k_id'];
				request(checkInCharge);
			}
			else if (res['id'] === s2c.chargeInfo['id']) {
				console.log('chargeInfo \n');

				startGame['k_id'] = loadUserInfo['k_id'];
				startGame['selected_character'] = 1;
				startGame['selected_assistant'] = 1;
				request(startGame);
			}
			else if (res['id'] === s2c.startGameReply['id']) {
				console.log('startGameReply \n');
				
				endGame['k_id'] = loadUserInfo['k_id'];
				endGame['dist'] = 100;
				endGame['kill'] = 5;
				endGame['usedItem'] = 0;
				request(endGame);
			}
			else if (res['id'] === s2c.gameResult['id']) {
				console.log('gameResult \n');


			}
			else {

			}
		});
	};

	var req = http.request(opts, callback);

	req.on('error', function(e) {
		console.log("Got error: " + e.message);
	});

	// write the data
	req.write(jsonData);
	req.end();
}
