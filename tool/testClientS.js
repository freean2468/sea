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
var requestBaton = new build.RequestBaton();
var requestBatonReply = new build.RequestBatonReply();
var loadPostedHoney = new build.LoadPostedHoney();
var postedHoney = new build.PostedHoney();
var loadPostedBaton = new build.LoadPostedBaton();
var postedBaton = new build.PostedBaton();
var loadPostedBatonResult = new build.LoadPostedBatonResult();
var postedBatonResult = new build.PostedBatonResult();
var acceptBaton = new build.AcceptBaton();
var endBaton = new build.EndBaton();
var acceptBatonResult = new build.AcceptBatonResult();
var acceptBatonResultReply = new build.AcceptBatonResultReply();

var http = require('http');
var encrypt = require('./util').encrypt;
var decrypt = require('./util').decrypt;
var fetchId = require('./util').fetchId;
var UUID = require('./util').UUID;
var toBuf = require('./util').toBuf;
var toArrBuf = require('./util').toArrBuf;

console.log("---------- commands ---------------");
console.log("'send_honey'");
console.log("'request_baton'");
console.log("-----------------------------------");

var piece = "";

registerAccount['k_id'] = UUID();

var receiver = 9223371;

registerAccount['k_id'] = 9223372;

console.log(registerAccount);

request(registerAccount);

var msg;

function fetchCookie(res) {
	var cookies = {};
	var part = res.headers['set-cookie'] && res.headers['set-cookie'][0].split('=');

	cookies[part[0].trim()] = (part[1] || '').trim();

	return cookies;
}

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
				login['k_id'] = registerAccount['k_id'];
				request(login);

//				unregisterAccount['k_id'] = res['k_id'];
//				request(unregisterAccount);
			}
			else if (id === accountInfo['id']['low']) {
				console.log('accountInfo \n');
				msg = build.AccountInfo.decode(res);
				if (msg['res'] === build.Result['BLOCK']) {
					console.log("BLOCKED");
				} else {
					var cookies = fetchCookie(response);
					piece = cookies['piece'];

					console.log("piece : " + piece);

					loadRankInfo['k_id'] = registerAccount['k_id'];
					request(loadRankInfo);
				}
			}
			else if (id === rankInfo['id']['low']) {
				console.log('rankInfo \n');

				for(var val in arg) {
					if (arg[val] === 'send_honey') {
						sendHoney['k_id'] = registerAccount['k_id'];
						sendHoney['receiver_k_id'] = receiver;
						request(sendHoney);
						break;
					}
					else if (arg[val] === 'request_baton') {
						requestBaton['k_id'] = registerAccount['k_id'];
						requestBaton['receiver_k_id'] = receiver;
						requestBaton['map'] = 'test';
						requestBaton['score'] = 5000;
						request(requestBaton);
						break;
					}
				}
				loadPostedBatonResult['k_id'] = registerAccount['k_id'];
				console.log('SEND : loadPostedBatonResult');
				request(loadPostedBatonResult);
			}
			else if (id === sendHoneyReply['id']['low']) {
				console.log('sendHoneyReply \n');
				logout['k_id'] = registerAccount['k_id'];
				request(logout);
			}
			else if (id === postedBatonResult['id']['low']) {
				console.log('RECEIVE : postedBatonResult \n');
				msg = build.PostedBatonResult.decode(res);
				console.log(msg);

				if (msg['baton_result'].length > 0) {
					acceptBatonResult['k_id'] = registerAccount['k_id'];
					acceptBatonResult['sender_k_id'] = msg['baton_result'][0]['sender_k_id'];
					acceptBatonResult['sended_time'] = msg['baton_result'][0]['sended_time'];
					console.log('SEND : acceptBatonResult \n');
					request(acceptBatonResult);
				}
			}
			else if (id === requestBatonReply['id']['low']) {
				console.log('RECEIVE : requestBatonReply \n');
				logout['k_id'] = registerAccount['k_id'];
				request(logout);
			}
			else if (id === acceptBatonResultReply['id']['low']) {
				console.log('RECEIVE : acceptBatonResultReply \n');
				console.log(build.AcceptBatonResultReply.decode(res));
				logout['k_id'] = registerAccount['k_id'];
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
