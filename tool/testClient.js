var build = require('./gameProtoBuild');

var registerAccount = new build.RegisterAccount();
var registerAccountReply = new build.RegisterAccountReply();
var loadUserInfo = new build.LoadUserInfo();
var loadRankInfo = new build.LoadRankInfo();
var accountInfo = new build.AccountInfo();
var rankInfo = new build.RankInfo();
var unregisterAccount = new build.UnregisterAccount();
var unregisterAccountReply = new build.UnregisterAccountReply();
var checkInCharge = new build.CheckInCharge();
var startGame = new build.StartGame();
var endGame = new build.EndGame();
var chargeInfo = new build.ChargeInfo();
var startGameReply = new build.StartGameReply();
var gameResult = new build.GameResult();

var http = require('http');
var encrypt = require('./util').encrypt;
var decrypt = require('./util').decrypt;
var fetchId = require('./util').fetchId;
var UUID = require('./util').UUID;
var toBuf = require('./util').toBuf;
var toArrBuf = require('./util').toArrBuf;

registerAccount['k_id'] = UUID();

console.log(registerAccount);

request(registerAccount);

// data is a proto message object.
function request(data) {
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
			var stream = decrypt(res_data);
			console.log(stream);

			var res = toArrBuf(new Buffer(stream, 'hex'));
			var id = fetchId(res);

			if (id === registerAccountReply['id']['low']) {
				console.log('registerAccountReply \n');
				loadUserInfo['k_id'] = registerAccount['k_id'];
				request(loadUserInfo);

//				unregisterAccount['k_id'] = res['k_id'];
//				request(unregisterAccount);
			}
			else if (id === unregisterAccountReply['id']['low']) {
				console.log('unregisterAccountReply \n');				
			} 
			else if (id === accountInfo['id']['low']) {
				console.log('accountInfo \n');

				loadRankInfo['k_id'] = registerAccount['k_id'];
				request(loadRankInfo);
			}
			else if (id === rankInfo['id']['low']) {
				console.log('rankInfo \n');

				checkInCharge['k_id'] = registerAccount['k_id'];
				request(checkInCharge);
			}
			else if (id === chargeInfo['id']['low']) {
				console.log('chargeInfo \n');

				startGame['k_id'] = registerAccount['k_id'];
				startGame['selected_character'] = 1;
				startGame['selected_assistant'] = 1;
				request(startGame);
			}
			else if (id === startGameReply['id']['low']) {
				console.log('startGameReply \n');
				
				endGame['k_id'] = registerAccount['k_id'];
				endGame['dist'] = 100;
				endGame['kill'] = 5;
				endGame['usedItem'] = 0;
				request(endGame);
			}
			else if (id === gameResult['id']['low']) {
				console.log('gameResult \n');


			}
			else {

			}
		});
	};

	var buf = toBuf(data.toArrayBuffer()).toString('hex');
	var stream = encrypt(buf);

	var opts = {
		host: 'localhost',
		port: 8888,
		method: 'POST',
		path: '/',
		headers: {
			'Content-Type': 'application/octet-stream',
			'Content-length': stream.length
		}
	};

	console.log(buf);
	console.log(stream);

	var req = http.request(opts, callback);

	req.on('error', function(e) {
		console.log("Got error: " + e.message);
	});
	
	// write the data
	req.write(stream);
	req.end();
}
