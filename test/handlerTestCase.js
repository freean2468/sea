var msgs = require('./msg').msgs,
	table = require('./table').root,
	http = require('http'),
	assert = require('assert'),
	encrypt = require('../tool/util').encrypt,
	decrypt = require('../tool/util').decrypt,
	toBuf = require('../tool/util').toBuf,
	fetchId = require('../tool/util').fetchId,
	toArrBuf = require('../tool/util').toArrBuf,
	cookie = [],
	Result = getTable('enum', 'Result'),
	sendedHoney,
	postedBaton,
	postedBatonResult;

module.exports = {
	'VersionInfo works!' : function() {
		
	}
	,
	"'One' user's RegisterAccount works!" : function() {
		var msg = getMsg('RegisterAccount');
		msg['k_id'] = 'One';
		request(msg, function (response, data) {
			var stream = decrypt(data),
				res = toArrBuf(new Buffer(stream, 'hex')),
				id = fetchId(res);

			for (var i = 0; i < msgs.length; ++i) {
				var instance = msgs[i]['instance'];
				if (id === instance['id']['low']) {
					var name = msgs[i]['msg'];
					assert.equal(name, 'RegisterAccountReply');
				}
			}
		} );
	}
	,
	"'Other' user's RegisterAccount works!" : function() {
		var msg = getMsg('RegisterAccount');
		msg['k_id'] = 'Other';
		request(msg, function (response, data) {
			var stream = decrypt(data),
				res = toArrBuf(new Buffer(stream, 'hex')),
				id = fetchId(res);

			for (var i = 0; i < msgs.length; ++i) {
				var instance = msgs[i]['instance'];
				if (id === instance['id']['low']) {
					var name = msgs[i]['msg'];
					assert.equal(name, 'RegisterAccountReply');
				}
			}
		} );
	}
	,
	"'One' user's Login works!" : function() {
		var msg = getMsg('Login');
		msg['k_id'] = 'One';
		request(msg, function (response, data) {
			var stream = decrypt(data),
				res = toArrBuf(new Buffer(stream, 'hex')),
				id = fetchId(res),
				obj;

			for (var i = 0; i < msgs.length; ++i) {
				var instance = msgs[i]['instance'];
				if (id === instance['id']['low']) {
					var name = msgs[i]['msg'];
					var build = msgs[i]['build'];
					assert.equal(name, 'AccountInfo');
					obj = build.decode(res);
				}
			}
			assert.notEqual(obj, undefined);

			registerCookie('One', response);

			assert.notEqual(cookie['One'], undefined);
		} );
	}
	,
	"'Other' user's Login works!" : function() {
		var msg = getMsg('Login');
		msg['k_id'] = 'Other';
		request(msg, function (response, data) {
			var stream = decrypt(data),
				res = toArrBuf(new Buffer(stream, 'hex')),
				id = fetchId(res),
				obj;

			for (var i = 0; i < msgs.length; ++i) {
				var instance = msgs[i]['instance'];
				if (id === instance['id']['low']) {
					var name = msgs[i]['msg'];
					var build = msgs[i]['build'];
					assert.equal(name, 'AccountInfo');
					obj = build.decode(res);
				}
			}
			assert.notEqual(obj, undefined);

			registerCookie('Other', response);

			assert.notEqual(cookie['Other'], undefined);
		} );
	}
	,
	"'One' user's CheckInCharge works!" : function() {
		setTimeout(function() {
			var msg = getMsg('CheckInCharge');
			msg['k_id'] = 'One';

			request(msg, function (response, data) {
				var stream = decrypt(data),
					res = toArrBuf(new Buffer(stream, 'hex')),
					id = fetchId(res),
					obj;

				for (var i = 0; i < msgs.length; ++i) {
					var instance = msgs[i]['instance'];
					if (id === instance['id']['low']) {
						var name = msgs[i]['msg'];
						var build = msgs[i]['build'];
						assert.equal(name, 'ChargeInfo');
						obj = build.decode(res);
					}
				}
				assert.notEqual(obj, undefined);
			}, cookie['One']);
		}, 1000);
	}
	,
	"'One' user's SelectCharacter works!" : function() {
		setTimeout(function() {
			var msg = getMsg('SelectCharacter');
			msg['k_id'] = 'One';
			msg['selected_character'] = 1;

			request(msg, function (response, data) {
				var stream = decrypt(data),
					res = toArrBuf(new Buffer(stream, 'hex')),
					id = fetchId(res),
					obj;

				for (var i = 0; i < msgs.length; ++i) {
					var instance = msgs[i]['instance'];
					if (id === instance['id']['low']) {
						var name = msgs[i]['msg'];
						var build = msgs[i]['build'];
						assert.equal(name, 'SelectCharacterReply');
						obj = build.decode(res);
					}
				}
				assert.notEqual(obj, undefined);
			}, cookie['One']);
		}, 1000);
	}
	,
	"'One' user's SelectAssistant doesn't works because of INVALID_ASSISTANT" : function() {
		setTimeout(function() {
			var msg = getMsg('SelectAssistant');
			msg['k_id'] = 'One';
			msg['selected_assistant'] = 1;

			request(msg, function (response, data) {
				var stream = decrypt(data),
					res = toArrBuf(new Buffer(stream, 'hex')),
					id = fetchId(res),
					obj;

				for (var i = 0; i < msgs.length; ++i) {
					var instance = msgs[i]['instance'];
					if (id === instance['id']['low']) {
						var name = msgs[i]['msg'];
						var build = msgs[i]['build'];
						assert.equal(name, 'SystemMessage');
						obj = build.decode(res);
					}
				}
				assert.notEqual(obj, undefined);
				assert.equal(obj['res'], getEnum(Result, 'INVALID_ASSISTANT'));
			}, cookie['One']);
		}, 1000);
	}
	,
	"'One' user's StartGame works!" : function() {
		setTimeout(function() {
			var msg = getMsg('StartGame');
			msg['k_id'] = 'One';
			msg['selected_character'] = 1;
			msg['selected_assistant'] = 0;

			request(msg, function (response, data) {
				var stream = decrypt(data),
					res = toArrBuf(new Buffer(stream, 'hex')),
					id = fetchId(res),
					obj;

				for (var i = 0; i < msgs.length; ++i) {
					var instance = msgs[i]['instance'];
					if (id === instance['id']['low']) {
						var name = msgs[i]['msg'];
						var build = msgs[i]['build'];
						assert.equal(name, 'StartGameReply');
						obj = build.decode(res);
					}
				}
				assert.notEqual(obj, undefined);
			}, cookie['One']);
		}, 1000);
	}
	,
	"'One' user's EndGame works!" : function() {
		setTimeout(function() {
			var msg = getMsg('EndGame');
			msg['k_id'] = 'One';
			msg['selected_character'] = 1;
			msg['selected_assistant'] = 0;
			msg['score'] = 100;
			msg['dist'] = 20;
			msg['enemy_kill'] = 10;
			msg['play_time'] = 102;
			msg['coin'] = 281;

			request(msg, function (response, data) {
				var stream = decrypt(data),
					res = toArrBuf(new Buffer(stream, 'hex')),
					id = fetchId(res),
					obj;

				for (var i = 0; i < msgs.length; ++i) {
					var instance = msgs[i]['instance'];
					if (id === instance['id']['low']) {
						var name = msgs[i]['msg'];
						var build = msgs[i]['build'];
						assert.equal(name, 'GameResult');
						obj = build.decode(res);
					}
				}
				assert.notEqual(obj, undefined);
			}, cookie['One']);
		}, 1000);
	}
	,
	"'One' user's LoadRankInfo works!" : function() {
		setTimeout(function() {
			var msg = getMsg('LoadRankInfo');
			msg['k_id'] = 'One';

			request(msg, function (response, data) {
				var stream = decrypt(data),
					res = toArrBuf(new Buffer(stream, 'hex')),
					id = fetchId(res),
					obj;

				for (var i = 0; i < msgs.length; ++i) {
					var instance = msgs[i]['instance'];
					if (id === instance['id']['low']) {
						var name = msgs[i]['msg'];
						var build = msgs[i]['build'];
						assert.equal(name, 'RankInfo');
						obj = build.decode(res);
					}
				}
				assert.notEqual(obj, undefined);
			}, cookie['One']);
		}, 1000);
	}
	,
	"'One' user's BuyItem works!" : function() {
		setTimeout(function() {
			var msg = getMsg('BuyItem');
			msg['k_id'] = 'One';
			msg['item'] = 1;

			request(msg, function (response, data) {
				var stream = decrypt(data),
					res = toArrBuf(new Buffer(stream, 'hex')),
					id = fetchId(res),
					obj;

				for (var i = 0; i < msgs.length; ++i) {
					var instance = msgs[i]['instance'];
					if (id === instance['id']['low']) {
						var name = msgs[i]['msg'];
						var build = msgs[i]['build'];
						assert.equal(name, 'BuyItemReply');
						obj = build.decode(res);
					}
				}
				assert.notEqual(obj, undefined);
			}, cookie['One']);
		}, 1000);
	}
	,
	"'One' user's SendHoney to 'Other' works!" : function() {
		setTimeout(function() {
			var msg = getMsg('SendHoney');
			msg['k_id'] = 'One';
			msg['receiver_k_id'] = 'Other';

			request(msg, function (response, data) {
				var stream = decrypt(data),
					res = toArrBuf(new Buffer(stream, 'hex')),
					id = fetchId(res),
					obj;

				for (var i = 0; i < msgs.length; ++i) {
					var instance = msgs[i]['instance'];
					if (id === instance['id']['low']) {
						var name = msgs[i]['msg'];
						var build = msgs[i]['build'];
						assert.equal(name, 'SendHoneyReply');
						obj = build.decode(res);
					}
				}
				assert.notEqual(obj, undefined);
			}, cookie['One']);
		}, 200);
	}
	,
	"'Other' user's LoadPostedHoney works!" : function() {
		setTimeout(function() {
			var msg = getMsg('LoadPostedHoney');
			msg['k_id'] = 'Other';

			request(msg, function (response, data) {
				var stream = decrypt(data),
					res = toArrBuf(new Buffer(stream, 'hex')),
					id = fetchId(res),
					obj;

				for (var i = 0; i < msgs.length; ++i) {
					var instance = msgs[i]['instance'];
					if (id === instance['id']['low']) {
						var name = msgs[i]['msg'];
						var build = msgs[i]['build'];
						assert.equal(name, 'PostedHoney');
						obj = build.decode(res);
						sendedHoney = obj['honey'][0];
					}
				}
				assert.notEqual(obj, undefined);
			}, cookie['One']);
		}, 500);
	}
	,
	"'Other' user's AcceptHoney from 'One' works!" : function() {
		setTimeout(function() {
			var msg = getMsg('AcceptHoney');
			msg['k_id'] = 'Other';
			msg['sender_k_id'] = sendedHoney['sender_k_id'];
			msg['sended_time'] = sendedHoney['sended_time'];

			request(msg, function (response, data) {
				var stream = decrypt(data),
					res = toArrBuf(new Buffer(stream, 'hex')),
					id = fetchId(res),
					obj;

				for (var i = 0; i < msgs.length; ++i) {
					var instance = msgs[i]['instance'];
					if (id === instance['id']['low']) {
						var name = msgs[i]['msg'];
						var build = msgs[i]['build'];
						assert.equal(name, 'AcceptHoneyReply');
						obj = build.decode(res);
					}
				}
				assert.notEqual(obj, undefined);
			}, cookie['One']);
		}, 1500);
	}
	,
	"'One' user's RequestBaton to 'Other' works!" : function() {
		setTimeout(function() {
			var msg = getMsg('RequestBaton');
			msg['k_id'] = 'One';
			msg['receiver_k_id'] = 'Other';
			msg['map'] = 'test';
			msg['score'] = 102;

			request(msg, function (response, data) {
				var stream = decrypt(data),
					res = toArrBuf(new Buffer(stream, 'hex')),
					id = fetchId(res),
					obj;

				for (var i = 0; i < msgs.length; ++i) {
					var instance = msgs[i]['instance'];
					if (id === instance['id']['low']) {
						var name = msgs[i]['msg'];
						var build = msgs[i]['build'];
						assert.equal(name, 'RequestBatonReply');
						obj = build.decode(res);
					}
				}
				assert.notEqual(obj, undefined);
			}, cookie['One']);
		}, 200);
	}
	,
	"'Other' user's LoadPostedBaton works!" : function() {
		setTimeout(function() {
			var msg = getMsg('LoadPostedBaton');
			msg['k_id'] = 'Other';

			request(msg, function (response, data) {
				var stream = decrypt(data),
					res = toArrBuf(new Buffer(stream, 'hex')),
					id = fetchId(res),
					obj;

				for (var i = 0; i < msgs.length; ++i) {
					var instance = msgs[i]['instance'];
					if (id === instance['id']['low']) {
						var name = msgs[i]['msg'];
						var build = msgs[i]['build'];
						assert.equal(name, 'PostedBaton');
						obj = build.decode(res);
						postedBaton = obj['baton'][0];
					}
				}
				assert.notEqual(obj, undefined);
			}, cookie['One']);
		}, 500);
	}
	,
	"'Other' user's AcceptBaton from 'One' works!" : function() {
		setTimeout(function() {
			var msg = getMsg('AcceptBaton');
			msg['k_id'] = 'Other';
			msg['sender_k_id'] = postedBaton['sender_k_id'];
			msg['sended_time'] = postedBaton['sended_time'];
			msg['selected_character'] = 1;
			msg['selected_assistant'] = 0;

			request(msg, function (response, data) {
				var stream = decrypt(data),
					res = toArrBuf(new Buffer(stream, 'hex')),
					id = fetchId(res),
					obj;

				for (var i = 0; i < msgs.length; ++i) {
					var instance = msgs[i]['instance'];
					if (id === instance['id']['low']) {
						var name = msgs[i]['msg'];
						var build = msgs[i]['build'];
						assert.equal(name, 'AcceptBatonReply');
						obj = build.decode(res);
					}
				}
				assert.notEqual(obj, undefined);
			}, cookie['One']);
		}, 1500);
	}
	,
	"'Other' user's EndBaton from 'One' works!" : function() {
		setTimeout(function() {
			var msg = getMsg('EndBaton');
			msg['k_id'] = 'Other';
			msg['sender_k_id'] = postedBaton['sender_k_id'];
			msg['sended_time'] = postedBaton['sended_time'];
			msg['selected_character'] = 1;
			msg['selected_assistant'] = 0;
			msg['score'] = 2978;
			msg['dist'] = 129;
			msg['enemy_kill'] = 182;
			msg['play_time'] = 119;
			msg['coin'] = 298;

			request(msg, function (response, data) {
				var stream = decrypt(data),
					res = toArrBuf(new Buffer(stream, 'hex')),
					id = fetchId(res),
					obj;

				for (var i = 0; i < msgs.length; ++i) {
					var instance = msgs[i]['instance'];
					if (id === instance['id']['low']) {
						var name = msgs[i]['msg'];
						var build = msgs[i]['build'];
						assert.equal(name, 'BatonResult');
						obj = build.decode(res);
					}
				}
				assert.notEqual(obj, undefined);
			}, cookie['One']);
		}, 1600);
	}
	,
	"'One' user's LoadPostedBatonResult works!" : function() {
		setTimeout(function() {
			var msg = getMsg('LoadPostedBatonResult');
			msg['k_id'] = 'One';

			request(msg, function (response, data) {
				var stream = decrypt(data),
					res = toArrBuf(new Buffer(stream, 'hex')),
					id = fetchId(res),
					obj;

				for (var i = 0; i < msgs.length; ++i) {
					var instance = msgs[i]['instance'];
					if (id === instance['id']['low']) {
						var name = msgs[i]['msg'];
						var build = msgs[i]['build'];
						assert.equal(name, 'PostedBatonResult');
						obj = build.decode(res);
						postedBatonResult = obj['baton_result'][0];
					}
				}
				assert.notEqual(obj, undefined);
			}, cookie['One']);
		}, 1800);
	}
	,
	"'One' user's AcceptBatonResult works!" : function() {
		setTimeout(function() {
			var msg = getMsg('AcceptBatonResult');
			msg['k_id'] = 'One';
			msg['sender_k_id'] = postedBatonResult['sender_k_id'];
			msg['sended_time'] = postedBatonResult['sended_time'];

			request(msg, function (response, data) {
				var stream = decrypt(data),
					res = toArrBuf(new Buffer(stream, 'hex')),
					id = fetchId(res),
					obj;

				for (var i = 0; i < msgs.length; ++i) {
					var instance = msgs[i]['instance'];
					if (id === instance['id']['low']) {
						var name = msgs[i]['msg'];
						var build = msgs[i]['build'];
						assert.equal(name, 'AcceptBatonResultReply');
						obj = build.decode(res);
					}
				}
				assert.notEqual(obj, undefined);
			}, cookie['One']);
		}, 1900);
	}
	,
	"'One' user's UpgradeHoneyScore works!" : function() {
		setTimeout(function() {
			var msg = getMsg('UpgradeHoneyScore');
			msg['k_id'] = 'One';

			request(msg, function (response, data) {
				var stream = decrypt(data),
					res = toArrBuf(new Buffer(stream, 'hex')),
					id = fetchId(res),
					obj;

				for (var i = 0; i < msgs.length; ++i) {
					var instance = msgs[i]['instance'];
					if (id === instance['id']['low']) {
						var name = msgs[i]['msg'];
						var build = msgs[i]['build'];
						assert.equal(name, 'UpgradeReply');
						obj = build.decode(res);
					}
				}
				assert.notEqual(obj, undefined);
			}, cookie['One']);
		}, 1000);
	}
	,
	"'One' user's UpgradeHoneyTime works!" : function() {
		setTimeout(function() {
			var msg = getMsg('UpgradeHoneyTime');
			msg['k_id'] = 'One';

			request(msg, function (response, data) {
				var stream = decrypt(data),
					res = toArrBuf(new Buffer(stream, 'hex')),
					id = fetchId(res),
					obj;

				for (var i = 0; i < msgs.length; ++i) {
					var instance = msgs[i]['instance'];
					if (id === instance['id']['low']) {
						var name = msgs[i]['msg'];
						var build = msgs[i]['build'];
						assert.equal(name, 'UpgradeReply');
						obj = build.decode(res);
					}
				}
				assert.notEqual(obj, undefined);
			}, cookie['One']);
		}, 1000);
	}
	,
	"'One' user's UpgradeCooldown works!" : function() {
		setTimeout(function() {
			var msg = getMsg('UpgradeCooldown');
			msg['k_id'] = 'One';

			request(msg, function (response, data) {
				var stream = decrypt(data),
					res = toArrBuf(new Buffer(stream, 'hex')),
					id = fetchId(res),
					obj;

				for (var i = 0; i < msgs.length; ++i) {
					var instance = msgs[i]['instance'];
					if (id === instance['id']['low']) {
						var name = msgs[i]['msg'];
						var build = msgs[i]['build'];
						assert.equal(name, 'UpgradeReply');
						obj = build.decode(res);
					}
				}
				assert.notEqual(obj, undefined);
			}, cookie['One']);
		}, 1000);
	}
	,
	"'One' user's BuyOrUpgradeCharacter works!" : function() {
		setTimeout(function() {
			var msg = getMsg('BuyOrUpgradeCharacter');
			msg['k_id'] = 'One';
			msg['character'] = 1;

			request(msg, function (response, data) {
				var stream = decrypt(data),
					res = toArrBuf(new Buffer(stream, 'hex')),
					id = fetchId(res),
					obj;

				for (var i = 0; i < msgs.length; ++i) {
					var instance = msgs[i]['instance'];
					if (id === instance['id']['low']) {
						var name = msgs[i]['msg'];
						var build = msgs[i]['build'];
						assert.equal(name, 'BuyOrUpgradeCharacterReply');
						obj = build.decode(res);
					}
				}
				assert.notEqual(obj, undefined);
			}, cookie['One']);
		}, 1000);
	}
	,
	"'One' user's BuyOrUpgradeAssistant works!" : function() {
		setTimeout(function() {
			var msg = getMsg('BuyOrUpgradeAssistant');
			msg['k_id'] = 'One';
			msg['assistant'] = 1;

			request(msg, function (response, data) {
				var stream = decrypt(data),
					res = toArrBuf(new Buffer(stream, 'hex')),
					id = fetchId(res),
					obj;

				for (var i = 0; i < msgs.length; ++i) {
					var instance = msgs[i]['instance'];
					if (id === instance['id']['low']) {
						var name = msgs[i]['msg'];
						var build = msgs[i]['build'];
						assert.equal(name, 'BuyOrUpgradeAssistantReply');
						obj = build.decode(res);
					}
				}
				assert.notEqual(obj, undefined);
			}, cookie['One']);
		}, 1000);
	}
	,
	"'One' user's UnregisterAccount works!" : function() {
		setTimeout(function() {
			var msg = getMsg('UnregisterAccount');
			msg['k_id'] = 'One';

			request(msg, function (response, data) {}, cookie['One']);
		}, 2000);
	}
	,
	"'Other' user's UnregisterAccount works!" : function() {
		setTimeout(function() {	
			var msg = getMsg('UnregisterAccount');
			msg['k_id'] = 'Other';

			request(msg, function (response, data) {}, cookie['Other']);
		}, 2000);
	}
	,
};

function getMsg(name) {
	for (var i = 0; i < msgs.length; ++i) {
		if (msgs[i]['msg'] === name) {
			var instance = msgs[i]['instance'];
			return instance;			
		}
	}
	return undefined;
}

function received(data) {
	var stream = decrypt(data);

	var res = toArrBuf(new Buffer(stream, 'hex'));
	var id = fetchId(res);

	for (var i = 0; i < msgs.length; ++i) {
		var instance = msgs[i]['instance'];
		var build = msgs[i]['build'];
		if (id === instance['id']['low']) {
			var name = msgs[i]['msg'];
			var obj = build.decode(res);
			return obj;
		}
	}
	return undefined;
}

function request(data, process, cookie) {
	if (typeof cookie === undefined) {
		cookie = 0;
	}

	var callback = function(response) {
		var res_data = '';

		response.setEncoding('utf8');

		response.on('data', function(chunk) {
			res_data += chunk;
		});

		response.on('end', function() {
			process(response, res_data);
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
			'Cookie': 'piece=' + cookie
		}
	};

	var req = http.request(opts, callback);

	req.on('error', function(e) {
		console.log("Got error: " + e.message);
	});
	
	// write the data
	req.write(stream);
	req.end();
}

function registerCookie(user, res) {
	var cookies = {};
	var part = res.headers['set-cookie'] && res.headers['set-cookie'][0].split('=');

	if (part !== undefined) {
		cookies[part[0].trim()] = (part[1] || '').trim();
		cookie[user] = cookies['piece'];
	}
}

function getTable(type, name) {
	for (var i = 0, l = table.length; i < l; ++i) {
		for (var j = 0, l = table[i]['table'].length; j < l; ++j) {
			var _table = table[i]['table'][j];

			if (_table['type'] === type && _table['0'] === name) {
				return _table;
			}
		}
	}
	return undefined;
}

function getEnum(_table, fieldName) {
	for (var val in _table) {
		var field = _table[val];
		
		if (field.search(fieldName) !== -1) {
			return val;
		}
	}
	return undefined;
}
