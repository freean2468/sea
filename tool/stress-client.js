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
	logout = new build.Logout(),
	accountInfo = new build.AccountInfo(),
	logoutReply = new build.LogoutReply(),
	systemMessage = new build.SystemMessage()
	;

var http = require('http'),
	util = require('../server/sea_util');

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
		var res_data = new Buffer(0);

		//response.setEncoding('utf8');

		response.on('data', function(chunk) {
			var buf = new Buffer(chunk);
			var newBuf = new Buffer(res_data.length + buf.length);
			
			res_data.copy(newBuf);
			buf.copy(newBuf, res_data.length);

			res_data = newBuf;
		});

		response.on('end', function() {
			var data = util.toArrBuf(res_data);
			var id = util.fetchId(data);

			if (id === versionInfoReply['id']['low']) {
				clearTimeout(timerId);
				registerAccount['k_id'] = k_id;
				setTimer('registerAccount');
				request(registerAccount);
			} else if (id === registerAccountReply['id']['low']) {
				clearTimeout(timerId);
				login['k_id'] = k_id;
				setTimer('login');
				request(login);
			} else if (id === accountInfo['id']['low']) {
				clearTimeout(timerId);
				logout['k_id'] = k_id;
				setTimer('logout');
				request(logout);
				var post = new Date().getTime();
				var period = post - pre;

				console.log('idx: ' + idx + ', ' + k_id + ' : logout! (' + period + 'ms)');
			} else if (id === logoutReply['id']['low']) {
				process.exit();
			} else if (id === systemMessage['id']['low']) {
				clearTimeout(timerId);
				msg = build.SystemMessage.decode(data);
				if (msg['res'] === build.SystemMessage.Result['EXISTING_ACCOUNT']) {
					login['k_id'] = k_id;
					setTimer('login');
					request(login);
				}
			}
			else {
				console.log('nothing can do');
			}
		});
	};

	console.log('');	console.log('');

	var ab = data.toArrayBuffer();
	var buf = util.toBuf(ab);

	var stream = buf;

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
