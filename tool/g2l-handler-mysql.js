var mysql = require('./mysql');
var build = require('./g2l-proto-build');
var assert = require('assert');
var toStream = require('../common/util').toStream;
var UUID = require('../common/util').UUID;
var convertMS2S = require('../common/util').convertMS2S;
var logMgr = require('./g2l-index').server.logMgr;

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

function AccountLoginHandler(response, data){
	var msg = build.AccountLogin.decode(data);

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in AccountLoginHandler");
	} else {
		var procedure = 'sea_AddLogLogin';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			console.log(procedure + ': ' + res);
		});
	}

	response.end();
} // end AccountLoginHandler

function ConcurrentUserHandler(response, data){
	var msg = build.ConcurrentUser.decode(data);
	
	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in ConcurrentUserHandler");
	} else {
		var ccu = msg['ccu'];
		var procedure = 'sea_AddConcurrentUser';
		var params = ccu;
		
		mysql.call(procedure, params, function (results, fields) {
			if (results[0][0]['res'] !== 0) {
				console.log("CCU : " + ccu);
			}
		});
	}
	response.end();
} // end ConcurrentUserHandler

function PeakConcurrentUserHandler(response, data){
	var msg = build.PeakConcurrentUser.decode(data);
	
	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in PeakConcurrentUserHandler");
	} else {
		var procedure = 'sea_PeakConcurrentUser';
		var params = '';
		
		mysql.call(procedure, params, function (results, fields) {
			var pccu = results[0][0]['res'];
				
			procedure = 'sea_AddPeakConcurrentUser';
			params = pccu;

			mysql.call(procedure, params, function (results, fields) {
				if (results[0][0]['res'] !== 0) {
					console.log("PCCU : " + pccu);
				}
			});
		});
	}
	response.end();
} // end PeakConcurrentUserHandler

function UniqueVisitorHandler(response, data){
	var msg = build.UniqueVisitor.decode(data);

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in UniqueVisitorHandler");
	} else {
		var uv = msg['uv'];
		var procedure = 'sea_AddUniqueVisitor';
		var params = uv;

		mysql.call(procedure, params, function (results, fields) {
			if (results[0][0]['res'] !== 0) {
				console.log("UV : " + uv);
			}
		});
	}
	response.end();
} // end UniqueVisitorHandler

function RetentionRateHandler(response, data){
	var msg = build.RetentionRate.decode(data);

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in RetentionRateHandler");
	} else {
		var rr = msg['rr'];
		var procedure = 'sea_AddRetentionRate';
		var params = rr;

		mysql.call(procedure, params, function (results, fields) {
			if (results[0][0]['res'] !== 0) {
				console.log("RR : " + rr);
			}
		});
	}
	response.end();
} // end RetentionRateHandler

function PayAssistantHandler(response, data){
	var msg = build.PayAssistant.decode(data);
	
	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in PayAssistantHandler");
	} else {
		var procedure = 'sea_AddLogPayAssistant';
		var params = "'" + msg['k_id'] + "', " + msg['paid_assistant'] + ", " + msg['rest_coin'];

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			console.log(procedure + ': ' + res);
		});
	}
	response.end();
} // end PayAssistantHandler

function PayCharacterHandler(response, data){
	var msg = build.PayCharacter.decode(data);
	
	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in PayCharacterHandler");
	} else {
		var procedure = 'sea_AddLogPayCharacter';
		var params = "'" + msg['k_id'] + "', " + msg['paid_character'] + ", " + msg['rest_coin'];

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			console.log(procedure + ': ' + res);
		});
	}
	response.end();
} // end PayCharacterHandler

function PayCoinHandler(response, data){
	var msg = build.PayCoin.decode(data);

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in PayCoinHandler");
	} else {
		var procedure = 'sea_AddLogPayCoin';
		var params = "'" + msg['k_id'] + "', " + msg['paid_coin'] + ", " + msg['rest_money'];

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			console.log(procedure + ': ' + res);
		});
	}
	response.end();
} // end PayCoinHandler

function PayHeartHandler(response, data){
	var msg = build.PayHeart.decode(data);

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in PayHeartHandler");
	} else {
		var procedure = 'sea_AddLogPayHeart';
		var params = "'" + msg['k_id'] + "', " + msg['paid_heart'] + ", " + msg['rest_coin'];

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			console.log(procedure + ': ' + res);
		});
	}
	response.end();
} // end PayHeartHandler

function PayItemHandler(response, data){
	var msg = build.PayItem.decode(data);
	
	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in PayItemHandler");
	} else {
		var procedure = 'sea_AddLogPayItem';
		var params = "'" + msg['k_id'] + "', " + msg['paid_item'] + ", " + msg['rest_coin'];

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			console.log(procedure + ': ' + res);
		});
	}
	response.end();
} // end PayItemHandler

function PayMoneyHandler(response, data){
	var msg = build.PayMoney.decode(data);
	
	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in PayMoneyHandler");
	} else {
		var procedure = 'sea_AddLogPayMoney';
		var params = "'" + msg['k_id'] + "', " + msg['paid_money'] + ", " + msg['rest_money'];

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			console.log(procedure + ': ' + res);
		});
	}
	response.end();
} // end PayMoneyHandler

function UserGamePlayHandler(response, data){
	var msg = build.UserGamePlay.decode(data);

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in UserGamePlayHandler");
	} else {
		var procedure = 'sea_AddLogPlay';
		var params = "'" + msg['k_id'] + "', " + msg['selected_character'] + ", " + msg['selected_assistant'] + ", " + msg['score'] + ", " + msg['enemy_kill'] + ", " + msg['dist'] + ", " + msg['play_time'] + ", " + msg['exp_boost'] + ", " + msg['last_item'] + ", " + msg['max_attack'] + ", " + msg['random'];

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			console.log(procedure + ': ' + res);
		});
	}
	response.end();
} // end UserGamePlayHandler

function UserRegisterHandler(response, data){
	var msg = build.UserRegister.decode(data);

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in UserRegisterHandler");
	} else {
		var procedure = 'sea_AddLogRegister';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			console.log(procedure + ': ' + res);		
		});
	}
	response.end();
} // end UserRegisterHandler

function UserUnregisterHandler(response, data){
	var msg = build.UserUnregister.decode(data);

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in UserUnregisterHandler");
	} else {
		var procedure = 'sea_AddLogUnregister';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			console.log(procedure + ': ' + res);
		});
	}
	response.end();
} // end UserUnregisterHandler

exports.AccountLoginHandler = AccountLoginHandler;
exports.ConcurrentUserHandler = ConcurrentUserHandler;
exports.PeakConcurrentUserHandler = PeakConcurrentUserHandler;
exports.UniqueVisitorHandler = UniqueVisitorHandler;
exports.RetentionRateHandler = RetentionRateHandler;
exports.PayAssistantHandler = PayAssistantHandler;
exports.PayCharacterHandler = PayCharacterHandler;
exports.PayCoinHandler = PayCoinHandler;
exports.PayHeartHandler = PayHeartHandler;
exports.PayItemHandler = PayItemHandler;
exports.PayMoneyHandler = PayMoneyHandler;
exports.UserGamePlayHandler = UserGamePlayHandler;
exports.UserRegisterHandler = UserRegisterHandler;
exports.UserUnregisterHandler = UserUnregisterHandler;
