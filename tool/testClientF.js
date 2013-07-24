var build = require('./gameProtoBuild');
var arg = [];

process.argv.forEach(function(val, index, array) {
	arg.push(val);	
});

var registerAccount = new build.RegisterAccount();
var registerAccountReply = new build.RegisterAccountReply();
var login = new build.Login();
var loadRankInfo = new build.LoadRankInfo();
var accountInfo = new build.AccountInfo();
var rankInfo = new build.RankInfo();
var unregisterAccount = new build.UnregisterAccount();
var checkInCharge = new build.CheckInCharge();
var startGame = new build.StartGame();
var endGame = new build.EndGame();
var chargeInfo = new build.ChargeInfo();
var startGameReply = new build.StartGameReply();
var gameResult = new build.GameResult();
var logout = new build.Logout();
var buyItem = new build.BuyItem();
var buyItemReply = new build.BuyItemReply();
var sendHoney = new build.SendHoney();
var sendHoneyReply = new build.SendHoneyReply();
var acceptHoney = new build.AcceptHoney();
var acceptHoneyReply = new build.AcceptHoneyReply();
var loadPostedHoney = new build.LoadPostedHoney();
var postedHoney = new build.PostedHoney();
var loadPostedBaton = new build.LoadPostedBaton();
var postedBaton = new build.PostedBaton();
var loadPostedBatonResult = new build.LoadPostedBatonResult();
var postedBatonResult = new build.PostedBatonResult();
var acceptBaton = new build.AcceptBaton();
var acceptBatonReply = new build.AcceptBatonReply();
var endBaton = new build.EndBaton();
var acceptBatonResult = new build.AcceptBatonResult();
var acceptBatonResultReply = new build.AcceptBatonResultReply();
var batonResult = new build.BatonResult();

var http = require('http');
var encrypt = require('./util').encrypt;
var decrypt = require('./util').decrypt;
var fetchId = require('./util').fetchId;
var UUID = require('./util').UUID;
var toBuf = require('./util').toBuf;
var toArrBuf = require('./util').toArrBuf;

console.log("---------- commands ---------------");
console.log("-----------------------------------");

var piece = "";

registerAccount['k_id'] = 0;

console.log(registerAccount);

request(registerAccount);

function fetchCookie(res) {
	var cookies = {};
	var part = res.headers['set-cookie'] && res.headers['set-cookie'][0].split('=');

	cookies[part[0].trim()] = (part[1] || '').trim();

	return cookies;
}

var msg;

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
				console.log('RECEIVE : registerAccountReply \n');
				console.log(build.RegisterAccountReply.decode(res));

				login['k_id'] = registerAccount['k_id'];
				console.log('SEND : login');
				request(login);

//				unregisterAccount['k_id'] = res['k_id'];
//				request(unregisterAccount);
			} else if (id === accountInfo['id']['low']) {
				console.log('RECEIVE : accountInfo \n');
				console.log(build.AccountInfo.decode(res));

				msg = build.AccountInfo.decode(res);
				if (msg['res'] === build.Result['BLOCK']) {
					console.log("BLOCKED");
				} else {
					var cookies = fetchCookie(response);
					piece = cookies['piece'];

					console.log("piece : " + piece);

					loadRankInfo['k_id'] = registerAccount['k_id'];

					console.log('SEND : loadRankInfo');

					request(loadRankInfo);
				}
			} else if (id === rankInfo['id']['low']) {
				console.log('RECEIVE : rankInfo \n');
				console.log(build.RankInfo.decode(res));

				loadPostedHoney['k_id'] = registerAccount['k_id'];
				console.log('SEND : loadPostedHoney');
				request(loadPostedHoney);
			} else if (id === postedHoney['id']['low']) {
				console.log('RECEIVE : postedHoney \n');
				console.log(build.PostedHoney.decode(res));

				loadPostedBaton['k_id'] = registerAccount['k_id'];
				console.log('SEND : loadPostedBaton');
				request(loadPostedBaton);
			} else if (id === postedBaton['id']['low']) {
				console.log('RECEIVE : postedBaton \n');
				msg = build.PostedBaton.decode(res);
				console.log(msg);

				loadPostedBatonResult['k_id'] = registerAccount['k_id'];
				console.log('SEND : loadPostedBatonResult');
				request(loadPostedBatonResult);
			} else if (id === postedBatonResult['id']['low']) {
				console.log('RECEIVE : postedBatonResult \n');
				console.log(build.PostedBatonResult.decode(res));

				checkInCharge['k_id'] = registerAccount['k_id'];
				console.log('SEND : checkInCharge');
				request(checkInCharge);
	
				for (i = 0; i < arg.length; ++i) {					
					if (arg[i] === 'accept_honey') {
						acceptHoney['k_id'] = registerAccount['k_id'];
						acceptHoney['sender_k_id'] = 9223372;
						console.log('SEND : acceptHoney');
						request(acceptHoney);
					}
					if (arg[i] === 'accept_baton') {
						console.log(msg);
						acceptBaton['k_id'] = registerAccount['k_id'];
						acceptBaton['sender_k_id'] = msg['baton'][0]['sender_k_id'];
						acceptBaton['sended_time'] = msg['baton'][0]['sended_time'];
						acceptBaton['selected_character'] = build.AcceptBaton.Pack['BASIC'];
						acceptBaton['selected_assistant'] = build.AcceptBaton.Pack['ZERO'];
						console.log('SEND : acceptBaton');
						request(acceptBaton);
					}
				}
			}
			else if (id === acceptHoneyReply['id']['low']) {
				console.log('RECEIVE : acceptHoneyReply \n');
				console.log(build.AcceptHoneyReply.decode(res));

				logout['k_id'] = registerAccount['k_id'];
				console.log('SEND : logout');
				request(logout);
			}
			else if (id === acceptBatonReply['id']['low']) {
				console.log('RECEIVE : acceptBatonReply \n');
				console.log(build.AcceptBatonReply.decode(res));
				
				endBaton['k_id'] = registerAccount['k_id'];
				endBaton['sender_k_id'] = acceptBaton['sender_k_id'];
				endBaton['sended_time'] = acceptBaton['sended_time'];
				endBaton['selected_character'] = acceptBaton['selected_character'];
				endBaton['selected_assistant'] = acceptBaton['selected_assistant'];
				endBaton['score'] = Math.floor(Math.random() * 1000) + 1;
				endBaton['dist'] = Math.floor(Math.random() * 10) + 1;
				endBaton['kill'] = Math.floor(Math.random() * 10) + 1;
				endBaton['usedItem'] = 0;
				endBaton['playTime'] = Math.floor(Math.random() * 1000) + 1; 
				endBaton['coin'] = Math.floor(Math.random() * 1000) + 1;

				console.log('SEND : EndBaton');
				request(endBaton);
			}
			else if (id === batonResult['id']['low']) {
				console.log('RECEIVE : batonRegult \n');
				console.log(build.BatonResult.decode(res));
			}
			else if (id === chargeInfo['id']['low']) {
				console.log('RECEIVE : chargeInfo \n');
				console.log(build.ChargeInfo.decode(res));

				buyItem['k_id'] = registerAccount['k_id'];
				buyItem['item'] = Math.floor(Math.random() * build.BuyItem.Item['RANDOM']) + 1;
				console.log('SEND : buyItem');
				request(buyItem);
			}
			else if (id === buyItemReply['id']['low']){
				console.log('RECEIVE : buyItemReply \n');
				console.log(build.BuyItemReply.decode(res));

				startGame['k_id'] = registerAccount['k_id'];
				startGame['selected_character'] = build.StartGame.Pack['BASIC'];
				startGame['selected_assistant'] = build.StartGame.Pack['ZERO'];
				console.log('SEND : stargGame');
				request(startGame);
			}
			else if (id === startGameReply['id']['low']) {
				console.log('RECEIVE : startGameReply \n');
				console.log(build.StartGameReply.decode(res));

				endGame['k_id'] = registerAccount['k_id'];
				endGame['dist'] = 100;
				endGame['enemy_kill'] = 5;
				endGame['used_item'] = 0;
				endGame['selected_character'] = build.EndGame.Pack['BASIC'];
				endGame['selected_assistant'] = build.EndGame.Pack['ZERO'];
				endGame['score'] = Math.floor(Math.random() * 1000) + 1;
				endGame['play_time'] = Math.floor(Math.random() * 1000) + 1;
				endGame['coin'] = Math.floor(Math.random() * 1000) + 1;
				console.log('SEND : endGame');
				console.log(endGame);
				request(endGame);
			}
			else if (id === gameResult['id']['low']) {
				console.log('RECEIVE : gameResult \n');
				console.log(build.GameResult.decode(res));

				logout['k_id'] = registerAccount['k_id'];
				console.log('SEND : logout');
				request(logout);
			}
			else {

			}
		});
	};

//	console.log(data.toArrayBuffer());

	var buf = toBuf(data.toArrayBuffer()).toString('hex');
	var stream = encrypt(buf);

	var opts = {
		host: 'localhost',
		port: 8888,
		method: 'POST',
		path: '/',
		headers: {
			'Content-Type': 'application/octet-stream',
			'Content-length': stream.length,
			'Cookie': 'piece=' + piece
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
