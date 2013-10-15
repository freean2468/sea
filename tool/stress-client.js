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

var versionInfo = new build.VersionInfo(),
	versionInfoReply = new build.VersionInfoReply(),
	registerAccount = new build.RegisterAccount(),
	registerAccountReply = new build.RegisterAccountReply(),
	login = new build.Login(),
	loadRankInfo = new build.LoadRankInfo(),
	accountInfo = new build.AccountInfo(),
//	rankInfo = new build.RankInfo(),
	unregisterAccount = new build.UnregisterAccount(),
	checkInCharge = new build.CheckInCharge(),
	startGame = new build.StartGame(),
	endGame = new build.EndGame(),
	chargeInfo = new build.ChargeInfo(),
	startGameReply = new build.StartGameReply(),
	gameResult = new build.GameResult(),
	logout = new build.Logout(),
	logoutReply = new build.LogoutReply(),
	buyItem = new build.BuyItem(),
	buyItemReply = new build.BuyItemReply(),
	sendEnergy = new build.SendEnergy(),
	sendEnergyReply = new build.SendEnergyReply(),
	acceptEnergy = new build.AcceptEnergy(),
	acceptEnergyReply = new build.AcceptEnergyReply(),
	loadPostedEnergy = new build.LoadPostedEnergy(),
	postedEnergy = new build.PostedEnergy(),
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

var DELAY = 10000;
var timerId = 0;

function setTimer(packet) {
	timerId = setTimeout(function () {
		console.log(packet + ' sended then, was not received any response from server (' + (k_id) + ')');
	}, DELAY);
};

setTimer('versionInfo');
request(versionInfo);

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

			if (id === versionInfoReply['id']['low']) {
				clearTimeout(timerId);
				registerAccount['k_id'] = k_id;
				setTimer('registerAccount');
				request(registerAccount);
			} else if (id === registerAccountReply['id']['low']) {
				clearTimeout(timerId);
				login['k_id'] = k_id;
				setTimer('log');
				request(login);
			} else if (id === accountInfo['id']['low']) {
				clearTimeout(timerId);
				var cookies = fetchCookie(response);
				piece = cookies['piece'];
//				request(loadRankInfo);				
//			} else if (id === rankInfo['id']['low']) {
				setTimer('loadPostedEnergy');
				request(loadPostedEnergy);
			} else if (id === postedEnergy['id']['low']) {
				clearTimeout(timerId);
				setTimer('loadPostedBaton');
				request(loadPostedBaton);
			} else if (id === postedBaton['id']['low']) {
				clearTimeout(timerId);
				msg = build.PostedBaton.decode(res);
				setTimer('loadPostedBatonResult');
				request(loadPostedBatonResult);
			} else if (id === postedBatonResult['id']['low']) {
				clearTimeout(timerId);
				setTimer('checkInCharge');
				request(checkInCharge);
			} else if (id === chargeInfo['id']['low']) {
				clearTimeout(timerId);
				buyItem['item'] = Math.floor(Math.random() * (build.BuyItem.Item['MAX']-1)) + 1;
				setTimer('buyItem');
				request(buyItem);
			} else if (id === buyItemReply['id']['low']) {
				clearTimeout(timerId);
				setTimer('startGame');
				request(startGame);
			} else if (id === startGameReply['id']['low']) {
				clearTimeout(timerId);
				endGame['dist'] = Math.floor(Math.random() * 100);
				endGame['enemy_kill'] = Math.floor(Math.random() * 10);
				endGame['selected_character'] = 1;
				endGame['score'] = Math.floor(Math.random() * 1000) + 1;
				endGame['play_time'] = Math.floor(Math.random() * 1000) + 1;
				endGame['coin'] = Math.floor(Math.random() * 1000) + 1;
				setTimer('endGame');
				request(endGame);
			} else if (id === gameResult['id']['low']) {
				clearTimeout(timerId);
				setTimer('logout');
				request(logout);
				var post = new Date().getTime();
				var period = post - pre;

				console.log('idx: ' + idx + ', ' + k_id + ' : logout! (' + period + 'ms)');
			} else if (id === logoutReply['id']['low']) {
				process.exit();
			} else if (id === systemMessage['id']['low']) {
				clearTimeout(timerId);
				msg = build.SystemMessage.decode(res);
				if (msg['res'] === build.SystemMessage.Result['EXISTED_ACCOUNT']) {
					login['k_id'] = k_id;
					setTimer('login');
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
		console.log('(' + k_id + ') problem with request: ' + e.message);
	});
	
	// write the data
	req.write(stream);
	req.end();
}
