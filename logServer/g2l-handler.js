var build = require('./g2l-proto-build');

function write(res, stream) {
	res.writeHead(200, {'Content-Type': 'application/octet-stream', 'Content-Length':stream.length});
	res.write(stream);
	res.end();
}

function inspectField(msg) {
	for (var val in msg) {
		if (msg[val + ''] === undefined) {
			return false;
		}
	}
	return true;
}

function AccountLoginHandler(response, data) {
	var msg = build.AccountLogin.decode(data);
	var logMgr = require('./g2l-index').server.logMgr;
	var mysqlMgr = require('./g2l-index').server.mysqlMgr;

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in AccountLoginHandler");
	} else {
		mysqlMgr.addLogLogin(msg['k_id'], function (res) {
			var res = res['res'];
			console.log('addLogLogin: ' + res);
		});
	}

	response.end();
} // end AccountLoginHandler

function ConcurrentUserHandler(response, data) {
	var msg = build.ConcurrentUser.decode(data);
	var logMgr = require('./g2l-index').server.logMgr;
	var mysqlMgr = require('./g2l-index').server.mysqlMgr;
	
	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in ConcurrentUserHandler");
	} else {
		var ccu = msg['ccu'];
		
		mysqlMgr.addConcurrentUser(ccu, function (res) {
			if (res['res'] !== 0) {
				console.log("CCU : " + ccu);
			}
		});
	}
	response.end();
} // end ConcurrentUserHandler

function PeakConcurrentUserHandler(response, data) {
	var msg = build.PeakConcurrentUser.decode(data);
	var logMgr = require('./g2l-index').server.logMgr;
	var mysqlMgr = require('./g2l-index').server.mysqlMgr;
	
	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in PeakConcurrentUserHandler");
	} else {
		mysqlMgr.peakConcurrentUser(function (res) {
			var pccu = res['res'];
				
			mysqlMgr.addPeakConcurrentUser(pccu, function (res) {
				if (res['res'] !== 0) {
					console.log("PCCU : " + pccu);
				}
			});
		});
	}
	response.end();
} // end PeakConcurrentUserHandler

function UniqueVisitorHandler(response, data) {
	var msg = build.UniqueVisitor.decode(data);
	var logMgr = require('./g2l-index').server.logMgr;
	var mysqlMgr = require('./g2l-index').server.mysqlMgr;

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in UniqueVisitorHandler");
	} else {
		var uv = msg['uv'];

		mysqlMgr.addUniqueVisitor(uv, function (res) {
			if (res['res'] !== 0) {
				console.log("UV : " + uv);
			}
		});
	}
	response.end();
} // end UniqueVisitorHandler

function RetentionRateHandler(response, data) {
	var msg = build.RetentionRate.decode(data);
	var logMgr = require('./g2l-index').server.logMgr;
	var mysqlMgr = require('./g2l-index').server.mysqlMgr;

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in RetentionRateHandler");
	} else {
		var rr = msg['rr'];

		mysqlMgr.addRetentionRate(rr, function (res) {
			if (res['res'] !== 0) {
				console.log("RR : " + rr);
			}
		});
	}
	response.end();
} // end RetentionRateHandler

function PayCharacterHandler(response, data) {
	var msg = build.PayCharacter.decode(data);
	var logMgr = require('./g2l-index').server.logMgr;
	var mysqlMgr = require('./g2l-index').server.mysqlMgr;
	
	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in PayCharacterHandler");
	} else {
		mysqlMgr.addLogPayCharacter(msg['k_id'], msg['paid_character'], msg['rest_coin'], function (res) {
			var res = res['res'];
			console.log('addLogPayCharacter: ' + res);
		});
	}
	response.end();
} // end PayCharacterHandler

function PayCoinHandler(response, data) {
	var msg = build.PayCoin.decode(data);
	var logMgr = require('./g2l-index').server.logMgr;
	var mysqlMgr = require('./g2l-index').server.mysqlMgr;

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in PayCoinHandler");
	} else {
		mysqlMgr.addLogPayCoin(msg['k_id'], msg['paid_coin'], msg['rest_money'], function (res) {
			var res = res['res'];
			console.log('addLogPayCoin: ' + res);
		});
	}
	response.end();
} // end PayCoinHandler

function PayEnergyHandler(response, data) {
	var msg = build.PayEnergy.decode(data);
	var logMgr = require('./g2l-index').server.logMgr;
	var mysqlMgr = require('./g2l-index').server.mysqlMgr;

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in PayHeartHandler");
	} else {
		mysqlMgr.addLogPayEnergy(msg['k_id'], msg['paid_energy'], msg['rest_coin'], function (res) {
			var res = res['res'];
			console.log('addLogPayEnergy: ' + res);
		});
	}
	response.end();
} // end PayEnergyHandler

function PayItemHandler(response, data) {
	var msg = build.PayItem.decode(data);
	var logMgr = require('./g2l-index').server.logMgr;
	var mysqlMgr = require('./g2l-index').server.mysqlMgr;
	
	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in PayItemHandler");
	} else {
		mysqlMgr.addLogPayItem(msg['k_id'], msg['paid_item'], msg['rest_coin'], function (res) {
			var res = res['res'];
			console.log('addLogPayItem: ' + res);
		});
	}
	response.end();
} // end PayItemHandler

function PayMoneyHandler(response, data) {
	var msg = build.PayMoney.decode(data);
	var logMgr = require('./g2l-index').server.logMgr;
	var mysqlMgr = require('./g2l-index').server.mysqlMgr;
	
	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in PayMoneyHandler");
	} else {
		mysqlMgr.addLogPayMoney(msg['k_id'], msg['paid_money'], msg['rest_money'], function (res) {
			var res = res['res'];
			console.log('addLogPayMoney: ' + res);
		});
	}
	response.end();
} // end PayMoneyHandler

function UserGamePlayHandler(response, data) {
	var msg = build.UserGamePlay.decode(data);
	var logMgr = require('./g2l-index').server.logMgr;
	var mysqlMgr = require('./g2l-index').server.mysqlMgr;

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in UserGamePlayHandler");
	} else {
		mysqlMgr.addLogPlay(msg['k_id'], msg['selected_character'], msg['score'], msg['enemy_kill'], msg['dist'], msg['play_time'], msg['exp_boost'], msg['item_last'], msg['shield'], msg['ghostify'], msg['immortal'], msg['random'], function (res) {
			var res = res['res'];
			console.log('addLogPlay: ' + res);
		});
	}
	response.end();
} // end UserGamePlayHandler

function UserRegisterHandler(response, data) {
	var msg = build.UserRegister.decode(data);
	var logMgr = require('./g2l-index').server.logMgr;
	var mysqlMgr = require('./g2l-index').server.mysqlMgr;

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in UserRegisterHandler");
	} else {
		mysqlMgr.addLogRegister(msg['k_id'], function (res) {
			var res = res['res'];
			console.log('addLogRegister: ' + res);		
		});
	}
	response.end();
} // end UserRegisterHandler

function UserUnregisterHandler(response, data) {
	var msg = build.UserUnregister.decode(data);
	var logMgr = require('./g2l-index').server.logMgr;
	var mysqlMgr = require('./g2l-index').server.mysqlMgr;

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in UserUnregisterHandler");
	} else {
		mysqlMgr.addLogUnregister(msg['k_id'], function (res) {
			var res = res['res'];
			console.log('addLogUnregister: ' + res);
		});
	}
	response.end();
} // end UserUnregisterHandler

module.exports = {
	'AccountLoginHandler': AccountLoginHandler,
	'ConcurrentUserHandler': ConcurrentUserHandler,
	'PeakConcurrentUserHandler': PeakConcurrentUserHandler,
	'UniqueVisitorHandler': UniqueVisitorHandler,
	'RetentionRateHandler': RetentionRateHandler,
	'PayCharacterHandler': PayCharacterHandler,
	'PayCoinHandler': PayCoinHandler,
	'PayEnergyHandler': PayEnergyHandler,
	'PayItemHandler': PayItemHandler,
	'PayMoneyHandler': PayMoneyHandler,
	'UserGamePlayHandler': UserGamePlayHandler,
	'UserRegisterHandler': UserRegisterHandler,
	'UserUnregisterHandler': UserUnregisterHandler,
};
