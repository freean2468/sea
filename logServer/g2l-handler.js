var mysql = require('./mysql');
var build = require('./g2l-proto-build');
var assert = require('assert');
var toStream = require('../common/util').toStream;
var UUID = require('../common/util').UUID;
var convertMS2S = require('../common/util').convertMS2S;

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

function AccountLoginHandler(response, data, logMgr) {
	var msg = build.AccountLogin.decode(data);

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in AccountLoginHandler");
	} else {
		mysql.addLogLogin(msg['k_id'], function (res) {
			var res = res['res'];
			console.log(procedure + ': ' + res);
		});
	}

	response.end();
} // end AccountLoginHandler

function ConcurrentUserHandler(response, data, logMgr) {
	var msg = build.ConcurrentUser.decode(data);
	
	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in ConcurrentUserHandler");
	} else {
		var ccu = msg['ccu'];
		
		mysql.addConcurrentUser(ccu, function (res) {
			if (res['res'] !== 0) {
				console.log("CCU : " + ccu);
			}
		});
	}
	response.end();
} // end ConcurrentUserHandler

function PeakConcurrentUserHandler(response, data, logMgr) {
	var msg = build.PeakConcurrentUser.decode(data);
	
	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in PeakConcurrentUserHandler");
	} else {
		mysql.peakConcurrentUser(function (res) {
			var pccu = res['res'];
				
			mysql.addPeakConcurrentUser(pccu, function (res) {
				if (res['res'] !== 0) {
					console.log("PCCU : " + pccu);
				}
			});
		});
	}
	response.end();
} // end PeakConcurrentUserHandler

function UniqueVisitorHandler(response, data, logMgr) {
	var msg = build.UniqueVisitor.decode(data);

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in UniqueVisitorHandler");
	} else {
		var uv = msg['uv'];

		mysql.addUniqueVisitor(uv, function (res) {
			if (res['res'] !== 0) {
				console.log("UV : " + uv);
			}
		});
	}
	response.end();
} // end UniqueVisitorHandler

function RetentionRateHandler(response, data, logMgr) {
	var msg = build.RetentionRate.decode(data);

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in RetentionRateHandler");
	} else {
		var rr = msg['rr'];

		mysql.addRetentionRate(rr, function (res) {
			if (res['res'] !== 0) {
				console.log("RR : " + rr);
			}
		});
	}
	response.end();
} // end RetentionRateHandler

function PayCharacterHandler(response, data, logMgr) {
	var msg = build.PayCharacter.decode(data);
	
	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in PayCharacterHandler");
	} else {
		mysql.addLogPayCharacter(msg['k_id'], msg['paid_character'], msg['rest_coin'], function (res) {
			var res = res['res'];
			console.log(procedure + ': ' + res);
		});
	}
	response.end();
} // end PayCharacterHandler

function PayCoinHandler(response, data, logMgr) {
	var msg = build.PayCoin.decode(data);

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in PayCoinHandler");
	} else {
		var procedure = 'sea_AddLogPayCoin';
		var params = "'" + msg['k_id'] + "', " + msg['paid_coin'] + ", " + msg['rest_money'];

		mysql.addLogPayCoin(msg['k_id'], msg['paid_coin'], msg['rest_money'], function (res) {
			var res = res['res'];
			console.log(procedure + ': ' + res);
		});
	}
	response.end();
} // end PayCoinHandler

function PayEnergyHandler(response, data, logMgr) {
	var msg = build.PayEnergy.decode(data);

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in PayHeartHandler");
	} else {
		mysql.addLogPayEnergy(msg['k_id'], msg['paid_energy'], msg['rest_coin'], function (res) {
			var res = res['res'];
			console.log(procedure + ': ' + res);
		});
	}
	response.end();
} // end PayEnergyHandler

function PayItemHandler(response, data, logMgr) {
	var msg = build.PayItem.decode(data);
	
	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in PayItemHandler");
	} else {
		mysql.addLogPayItem(msg['k_id'], msg['paid_item'], msg['rest_coin'], function (res) {
			var res = res['res'];
			console.log(procedure + ': ' + res);
		});
	}
	response.end();
} // end PayItemHandler

function PayMoneyHandler(response, data, logMgr) {
	var msg = build.PayMoney.decode(data);
	
	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in PayMoneyHandler");
	} else {
		var procedure = 'sea_AddLogPayMoney';
		var params = "'" + msg['k_id'] + "', " + msg['paid_money'] + ", " + msg['rest_money'];

		mysql.addLogPayMoney(msg['k_id'], msg['paid_money'], msg['rest_money'], function (res) {
			var res = res['res'];
			console.log(procedure + ': ' + res);
		});
	}
	response.end();
} // end PayMoneyHandler

function UserGamePlayHandler(response, data, logMgr) {
	var msg = build.UserGamePlay.decode(data);

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in UserGamePlayHandler");
	} else {
		mysql.addLogPlay(msg['k_id'], msg['selected_character'], msg['score'], msg['enemy_kill'], msg['dist'], msg['play_time'], msg['exp_boost'], msg['item_last'], msg['max_attack'], msg['shield'], msg['ghost'], msg['weapon_reinforce'], msg['bonus_heart'], msg['drop_up'], msg['magnet'], msg['bonus_score'], function (res) {
			var res = res['res'];
			console.log(procedure + ': ' + res);
		});
	}
	response.end();
} // end UserGamePlayHandler

function UserRegisterHandler(response, data, logMgr) {
	var msg = build.UserRegister.decode(data);

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in UserRegisterHandler");
	} else {
		mysql.addLogRegister(msg['k_id'], function (res) {
			var res = res['res'];
			console.log(procedure + ': ' + res);		
		});
	}
	response.end();
} // end UserRegisterHandler

function UserUnregisterHandler(response, data, logMgr) {
	var msg = build.UserUnregister.decode(data);

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in UserUnregisterHandler");
	} else {
		mysql.addLogUnregister(msg['k_id'], function (res) {
			var res = res['res'];
			console.log(procedure + ': ' + res);
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
