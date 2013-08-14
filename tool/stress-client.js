var build = require('./c2g-proto-build');
var idx;
var ip;
var port;

process.argv.forEach(function(val, index, array) {
	if ( index === 2) {
		idx = val;
	} else if ( index === 3) {
		ip = val;
	} else if ( index === 4) {
		port = val;
	}
});

var registerAccount = new build.RegisterAccount(),
	registerAccountReply = new build.RegisterAccountReply(),
	login = new build.Login(),
	loadRankInfo = new build.LoadRankInfo(),
	accountInfo = new build.AccountInfo(),
	rankInfo = new build.RankInfo(),
	unregisterAccount = new build.UnregisterAccount(),
	checkInCharge = new build.CheckInCharge(),
	startGame = new build.StartGame(),
	endGame = new build.EndGame(),
	chargeInfo = new build.ChargeInfo(),
	startGameReply = new build.StartGameReply(),
	gameResult = new build.GameResult(),
	logout = new build.Logout(),
	buyItem = new build.BuyItem(),
	buyItemReply = new build.BuyItemReply(),
	sendHoney = new build.SendHoney(),
	sendHoneyReply = new build.SendHoneyReply(),
	acceptHoney = new build.AcceptHoney(),
	acceptHoneyReply = new build.AcceptHoneyReply(),
	loadPostedHoney = new build.LoadPostedHoney(),
	postedHoney = new build.PostedHoney(),
	loadPostedBaton = new build.LoadPostedBaton(),
	postedBaton = new build.PostedBaton(),
	loadPostedBatonResult = new build.LoadPostedBatonResult(),
	postedBatonResult = new build.PostedBatonResult(),
	acceptBaton = new build.AcceptBaton(),
	acceptBatonReply = new build.AcceptBatonReply(),
	endBaton = new build.EndBaton(),
	acceptBatonResult = new build.AcceptBatonResult(),
	acceptBatonResultReply = new build.AcceptBatonResultReply(),
	batonResult = new build.BatonResult(),
	systemMessage = new build.SystemMessage();

var http = require('http'),
	util = require('../common/util');

var piece = "";
var k_id = require('./kid-table').table[idx];

var pre = new Date().getTime();

registerAccount['k_id'] = k_id;

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
			var stream = util.decrypt(res_data);

			var res = util.toArrBuf(new Buffer(stream, 'hex'));
			var id = util.fetchId(res);

			if (id === registerAccountReply['id']['low']) {
				login['k_id'] = k_id;
				request(login);
			} else if (id === accountInfo['id']['low']) {
				var cookies = fetchCookie(response);
				piece = cookies['piece'];
				loadRankInfo['k_id'] = k_id;
				request(loadRankInfo);				
			} else if (id === rankInfo['id']['low']) {
				loadPostedHoney['k_id'] = k_id;
				request(loadPostedHoney);
			} else if (id === postedHoney['id']['low']) {
				loadPostedBaton['k_id'] = k_id;
				request(loadPostedBaton);
			} else if (id === postedBaton['id']['low']) {
				msg = build.PostedBaton.decode(res);
				loadPostedBatonResult['k_id'] = k_id;
				request(loadPostedBatonResult);
			} else if (id === postedBatonResult['id']['low']) {
				checkInCharge['k_id'] = k_id;
				request(checkInCharge);
			}
			else if (id === chargeInfo['id']['low']) {
				buyItem['k_id'] = k_id;
				buyItem['item'] = Math.floor(Math.random() * (build.BuyItem.Item['MAX']-1)) + 1;
				request(buyItem);
			}
			else if (id === buyItemReply['id']['low']){
				startGame['k_id'] = k_id;
				startGame['selected_character'] = 1;
				startGame['selected_assistant'] = 0;
				request(startGame);
			}
			else if (id === startGameReply['id']['low']) {
				endGame['k_id'] = k_id;
				endGame['dist'] = Math.floor(Math.random() * 100);
				endGame['enemy_kill'] = Math.floor(Math.random() * 10);
				endGame['selected_character'] = 1;
				endGame['selected_assistant'] = 0;
				endGame['score'] = Math.floor(Math.random() * 1000) + 1;
				endGame['play_time'] = Math.floor(Math.random() * 1000) + 1;
				endGame['coin'] = Math.floor(Math.random() * 1000) + 1;
				request(endGame);
			}
			else if (id === gameResult['id']['low']) {
				logout['k_id'] = k_id;
				request(logout);
				var post = new Date().getTime();
				var period = post - pre;

				console.log(logout['k_id'] + " : logout! (" + period + "ms)");
			} else if (id === systemMessage['id']['low']) {
				msg = build.SystemMessage.decode(res);
				if (msg['res'] === build.Result['EXISTED_ACCOUNT']) {
					login['k_id'] = k_id;
					request(login);
				}
			}
			else {

			}
		});
	};

	var buf = util.toBuf(data.toArrayBuffer()).toString('hex');
	var stream = util.encrypt(buf);

	var opts = {
		host: ip,
		port: port,
		method: 'POST',
		path: '/',
		headers: {
			'content-type': 'application/octet-stream',
			'content-length': stream.length,
			'cookie': 'piece=' + piece,
			'connection': 'close',
		},
		agent: false,
	};

	var req = http.request(opts, callback);

	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});
	
	// write the data
	req.write(stream);
	req.end();
}
