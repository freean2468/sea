var build = require('./protoBuild');

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

function UUID() {
	 var str = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx';
	 return str.replace(/[xy]/g, function(c) {
		 var r = Math.random() * 16|0, v = c == 'x' ? r : (r&0x3|0x8);
		 return v.toString(16);
	 });
}

registerAccount['k_id'] = UUID();

console.log(registerAccount);

request(registerAccount);

function fetchId(ab) {
	var id = 0;
	var arr = [];
	var base = 1 << 7;
	var exp = 0;

	for (i = 1; i < ab.byteLength; ++i) {
		if (ab[i] < base) {
			exp = ab[i];
			break;
		}
		
		arr.push(ab[i]);		
	}

	var j = 0;
	for (; j < arr.length; ++j) {
		id += ((arr[j]-base) * (1 << (7*j))); 
	}
	id += (exp * (1 << (7*j)));

	return id;
}

function toBuf(ab) {
	var buf = new Buffer(ab.byteLength);

	for (i = 0; i < buf.length; ++i) {
		buf[i] = ab[i];
	}

	return buf;
}

function toArrBuf(buffer) {
	var ab = new ArrayBuffer(buffer.length);
	
	for (i = 0; i < buffer.length; ++i) {
		ab[i] = buffer[i];
	}

	return ab;
}

function request(data) {
	var opts = {
		host: 'localhost',
		port: 8888,
		method: 'POST',
		path: '/',
		headers: {
			'Content-Type': 'application/octet-stream',
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

			var res = toArrBuf(new Buffer(res_data, 'hex'));
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

	var req = http.request(opts, callback);

	console.log(data.toArrayBuffer());

	req.on('error', function(e) {
		console.log("Got error: " + e.message);
	});
	
	// write the data
	req.write(toBuf(data.toArrayBuffer()).toString('hex'));
	req.end();
}
