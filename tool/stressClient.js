var build = require('./gameProtoBuild');
var idx;

process.argv.forEach(function(val, index, array) {
	if ( index === 2) {
		idx = val[0];
	}	
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

var piece = "";

registerAccount['k_id'] = require('./kIdTable').table[idx];

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

		response.setEncoding('utf8');

		response.on('data', function(chunk) {
			res_data += chunk;
		});

		response.on('end', function() {
			var stream = decrypt(res_data);

			var res = toArrBuf(new Buffer(stream, 'hex'));
			var id = fetchId(res);

			if (id === registerAccountReply['id']['low']) {
				login['k_id'] = registerAccount['k_id'];
				request(login);

//				unregisterAccount['k_id'] = res['k_id'];
//				request(unregisterAccount);
			} else if (id === accountInfo['id']['low']) {
				msg = build.AccountInfo.decode(res);
				if (msg['res'] === build.Result['BLOCK']) {
				} else {
					var cookies = fetchCookie(response);
					piece = cookies['piece'];
					loadRankInfo['k_id'] = registerAccount['k_id'];
					request(loadRankInfo);
				}
			} else if (id === rankInfo['id']['low']) {
				loadPostedHoney['k_id'] = registerAccount['k_id'];
				request(loadPostedHoney);
			} else if (id === postedHoney['id']['low']) {
				loadPostedBaton['k_id'] = registerAccount['k_id'];
				request(loadPostedBaton);
			} else if (id === postedBaton['id']['low']) {
				msg = build.PostedBaton.decode(res);
				loadPostedBatonResult['k_id'] = registerAccount['k_id'];
				request(loadPostedBatonResult);
			} else if (id === postedBatonResult['id']['low']) {
				checkInCharge['k_id'] = registerAccount['k_id'];
				request(checkInCharge);
			}
			else if (id === acceptHoneyReply['id']['low']) {
				logout['k_id'] = registerAccount['k_id'];
				request(logout);
			}
			else if (id === acceptBatonReply['id']['low']) {
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

				request(endBaton);
			}
			else if (id === batonResult['id']['low']) {
			}
			else if (id === chargeInfo['id']['low']) {
				buyItem['k_id'] = registerAccount['k_id'];
				buyItem['item'] = Math.floor(Math.random() * build.BuyItem.Item['RANDOM']) + 1;
				request(buyItem);
			}
			else if (id === buyItemReply['id']['low']){
				startGame['k_id'] = registerAccount['k_id'];
				startGame['selected_character'] = build.StartGame.Pack['BASIC'];
				startGame['selected_assistant'] = build.StartGame.Pack['ZERO'];
				request(startGame);
			}
			else if (id === startGameReply['id']['low']) {
				endGame['k_id'] = registerAccount['k_id'];
				endGame['dist'] = 100;
				endGame['kill'] = 5;
				endGame['usedItem'] = 0;
				endGame['selected_character'] = build.EndGame.Pack['BASIC'];
				endGame['selected_assistant'] = build.EndGame.Pack['ZERO'];
				endGame['score'] = Math.floor(Math.random() * 1000) + 1;
				endGame['playTime'] = Math.floor(Math.random() * 1000) + 1;
				endGame['coin'] = Math.floor(Math.random() * 1000) + 1;
				request(endGame);
			}
			else if (id === gameResult['id']['low']) {
				logout['k_id'] = registerAccount['k_id'];
				request(logout);
				console.log(logout['k_id'] + " : logout!");
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
			'Content-length': stream.length,
			'Cookie': 'piece=' + piece
		}
	};

	var req = http.request(opts, callback);

	req.on('error', function(e) {
	});
	
	// write the data
	req.write(stream);
	req.end();
}
