var mysql = require('./mysql');
var build = require('./protoBuild');
var assert = require('assert');
var encrypt = require('./util').encrypt;
var toStream = require('./util').toStream;
var UUID = require('./util').UUID;
var convertMS2S = require('./util').convertMS2S;
var log = require('./log');

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
		log.addLog('ERROR', "Undefined field is detected in AccountLoginHandler");
		response.end();
	} else {
		var procedure = 'sea_AddLogLogin';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			console.log(procedure + ': ' + res);
		});
	}
} // end AccountLoginHandler

function ConcurrentUserHandler(response, data){
	var msg = build.ConcurrentUser.decode(data);
	
	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in ConcurrentUserHandler");
		response.end();
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
} // end ConcurrentUserHandler

function PeakConcurrentUserHandler(response, data){
	var msg = build.PeakConcurrentUser.decode(data);
	
	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in PeakConcurrentUserHandler");
		response.end();
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
} // end PeakConcurrentUserHandler

function UniqueVisitorHandler(response, data){
	var msg = build.UniqueVisitor.decode(data);

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in UniqueVisitorHandler");
		response.end();
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
} // end UniqueVisitorHandler

function RetentionRateHandler(response, data){
	var msg = build.RetentionRate.decode(data);

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in RetentionRateHandler");
		response.end();
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
} // end RetentionRateHandler

function PayAssistantHandler(response, data){
	var msg = build.PayAssistant.decode(data);
	
	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in PayAssistantHandler");
		response.end();
	} else {
		var procedure = 'sea_AddLogPayAssistant';
		var params = "'" + msg['k_id'] + "', " + msg['paid_assistant'] + ", " + msg['rest_coin'];

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			console.log(procedure + ': ' + res);
		});
	}
} // end PayAssistantHandler

function PayCharacterHandler(response, data){
	var msg = build.PayCharacter.decode(data);
	
	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in PayCharacterHandler");
		response.end();
	} else {
		var procedure = 'sea_AddLogPayCharacter';
		var params = "'" + msg['k_id'] + "', " + msg['paid_character'] + ", " + msg['rest_coin'];

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			console.log(procedure + ': ' + res);
		});
	}
} // end PayCharacterHandler

function PayCoinHandler(response, data){
	var msg = build.PayCoin.decode(data);

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in PayCoinHandler");
		response.end();
	} else {
		var procedure = 'sea_AddLogPayCoin';
		var params = "'" + msg['k_id'] + "', " + msg['paid_coin'] + ", " + msg['rest_money'];

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			console.log(procedure + ': ' + res);
		});
	}
} // end PayCoinHandler

function PayHeartHandler(response, data){
	var msg = build.PayHeart.decode(data);

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in PayHeartHandler");
		response.end();
	} else {
		var procedure = 'sea_AddLogPayHeart';
		var params = "'" + msg['k_id'] + "', " + msg['paid_heart'] + ", " + msg['rest_coin'];

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			console.log(procedure + ': ' + res);
		});
	}
} // end PayHeartHandler

function PayItemHandler(response, data){
	var msg = build.PayItem.decode(data);
	
	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in PayItemHandler");
		response.end();
	} else {
		var procedure = 'sea_AddLogPayItem';
		var params = "'" + msg['k_id'] + "', " + msg['paid_item'] + ", " + msg['rest_coin'];

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			console.log(procedure + ': ' + res);
		});
	}
} // end PayItemHandler

function PayMoneyHandler(response, data){
	var msg = build.PayMoney.decode(data);
	
	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in PayMoneyHandler");
		response.end();
	} else {
		var procedure = 'sea_AddLogPayMoney';
		var params = "'" + msg['k_id'] + "', " + msg['paid_money'] + ", " + msg['rest_money'];

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			console.log(procedure + ': ' + res);
		});
	}
} // end PayMoneyHandler

function UserGamePlayHandler(response, data){
	var msg = build.UserGamePlay.decode(data);

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in UserGamePlayHandler");
		response.end();
	} else {
		var procedure = 'sea_AddLogPlay';
		var params = "'" + msg['k_id'] + "', " + msg['selected_character'] + ", " + msg['selected_assistant'] + ", " + msg['score'] + ", " + msg['enemy_kill'] + ", " + msg['dist'] + ", " + msg['play_time'] + ", " + msg['exp_boost'] + ", " + msg['last_item'] + ", " + msg['max_attack'] + ", " + msg['random'];

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			console.log(procedure + ': ' + res);
		});
	}
} // end UserGamePlayHandler

function UserRegisterHandler(response, data){
	var msg = build.UserRegister.decode(data);

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in UserRegisterHandler");
		response.end();
	} else {
		var procedure = 'sea_AddLogRegister';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			console.log(procedure + ': ' + res);		
		});
	}
} // end UserRegisterHandler

function UserUnregisterHandler(response, data){
	var msg = build.UserUnregister.decode(data);

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in UserUnregisterHandler");
		response.end();
	} else {
		var procedure = 'sea_AddLogUnregister';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			console.log(procedure + ': ' + res);
		});
	}
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
