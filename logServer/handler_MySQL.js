var mysql = require('./mysql');
var build = require('./protoBuild');
var assert = require('assert');
var encrypt = require('./util').encrypt;
var toStream = require('./util').toStream;
var UUID = require('./util').UUID;
var log = require('./log');

function write(res, stream) {
	res.writeHead(200, {'Content-Type': 'application/octet-stream', 'Content-Length':stream.length});
	res.write(stream);
	res.end();
}

function AccountLoginHandler(response, data){
	var msg = build.AccountLogin.decode(data);

	var procedure = 'sea_AddLogLogin';
	var params = "'" + msg['k_id'] + "'";

	var callback = function (results, fields) {
		var res = results[0][0]['res'];
		console.log(procedure + ': ' + res);
	};

	mysql.call(procedure, params, callback);
} // end AccountLoginHandler

function ConcurrentUserHandler(response, data){
	var msg = build.ConcurrentUser.decode(data);

	var ccu = msg['ccu'];
	var procedure = 'sea_AddConcurrentUser';
	var params = ccu;
	
	var callback = function (results, fields) {
		if (results[0][0]['res'] !== 0) {
			console.log("CCU : " + ccu);
		}
	};

	mysql.call(procedure, params, callback);
} // end ConcurrentUserHandler

function PeakConcurrentUserHandler(response, data){
	var msg = build.PeakConcurrentUser.decode(data);

	var procedure = 'sea_PeakConcurrentUser';
	var params = '';
	
	var callback = function (results, fields) {
		var pccu = results[0][0]['res'];
			
		procedure = 'sea_AddPeakConcurrentUser';
		params = pccu;

		var addPccuCallback = function (results, fields) {
			if (results[0][0]['res'] !== 0) {
				console.log("PCCU : " + pccu);
			}
		};

		mysql.call(procedure, params, addPccuCallback);
	};

	mysql.call(procedure, params, callback);
} // end PeakConcurrentUserHandler

function UniqueVisitorHandler(response, data){
	var msg = build.UniqueVisitor.decode(data);

	var uv = msg['uv'];
	var procedure = 'sea_AddUniqueVisitor';
	var params = uv;

	var callback = function (results, fields) {
		if (results[0][0]['res'] !== 0) {
			console.log("UV : " + uv);
		}
	};

	mysql.call(procedure, params, callback);
} // end UniqueVisitorHandler

function RetentionRateHandler(response, data){
	var msg = build.RetentionRate.decode(data);

	var rr = msg['rr'];
	var procedure = 'sea_AddRetentionRate';
	var params = rr;

	var callback = function (results, fields) {
		if (results[0][0]['res'] !== 0) {
			console.log("RR : " + rr);
		}
	};

	mysql.call(procedure, params, callback);
} // end RetentionRateHandler

function PayAssistantHandler(response, data){
	var msg = build.PayAssistant.decode(data);
	
	var procedure = 'sea_AddLogPayAssistant';
	var params = "'" + msg['k_id'] + "', " + msg['paid_assistant'] + ", " + msg['rest_coin'];

	var callback = function (results, fields) {
		var res = results[0][0]['res'];
		console.log(procedure + ': ' + res);
	};

	mysql.call(procedure, params, callback);
} // end PayAssistantHandler

function PayCharacterHandler(response, data){
	var msg = build.PayCharacter.decode(data);

	var procedure = 'sea_AddLogPayCharacter';
	var params = "'" + msg['k_id'] + "', " + msg['paid_character'] + ", " + msg['rest_coin'];

	var callback = function (results, fields) {
		var res = results[0][0]['res'];
		console.log(procedure + ': ' + res);
	};

	mysql.call(procedure, params, callback);
} // end PayCharacterHandler

function PayCoinHandler(response, data){
	var msg = build.PayCoin.decode(data);

	var procedure = 'sea_AddLogPayCoin';
	var params = "'" + msg['k_id'] + "', " + msg['paid_coin'] + ", " + msg['rest_money'];

	var callback = function (results, fields) {
		var res = results[0][0]['res'];
		console.log(procedure + ': ' + res);
	};

	mysql.call(procedure, params, callback);
} // end PayCoinHandler

function PayHeartHandler(response, data){
	var msg = build.PayHeart.decode(data);

	var procedure = 'sea_AddLogPayHeart';
	var params = "'" + msg['k_id'] + "', " + msg['paid_heart'] + ", " + msg['rest_coin'];

	var callback = function (results, fields) {
		var res = results[0][0]['res'];
		console.log(procedure + ': ' + res);
	};

	mysql.call(procedure, params, callback);
} // end PayHeartHandler

function PayItemHandler(response, data){
	var msg = build.PayItem.decode(data);
	
	var procedure = 'sea_AddLogPayItem';
	var params = "'" + msg['k_id'] + "', " + msg['paid_item'] + ", " + msg['rest_coin'];

	var callback = function (results, fields) {
		var res = results[0][0]['res'];
		console.log(procedure + ': ' + res);
	};

	mysql.call(procedure, params, callback);
} // end PayItemHandler

function PayMoneyHandler(response, data){
	var msg = build.PayMoney.decode(data);

	var procedure = 'sea_AddLogPayMoney';
	var params = "'" + msg['k_id'] + "', " + msg['paid_money'] + ", " + msg['rest_money'];

	var callback = function (results, fields) {
		var res = results[0][0]['res'];
		console.log(procedure + ': ' + res);
	};

	mysql.call(procedure, params, callback);
} // end PayMoneyHandler

function UserGamePlayHandler(response, data){
	var msg = build.UserGamePlay.decode(data);

	var procedure = 'sea_AddLogPlay';
	var params = "'" + msg['k_id'] + "', " + msg['selected_character'] + ", " + msg['selected_assistant'] + ", "
				msg['score'] + ", " + msg['enemy_kill'] + ", " + msg['dist'] + "," + msg['play_time'];

	var callback = function (results, fields) {
		var res = results[0][0]['res'];
		console.log(procedure + ': ' + res);
	};

	mysql.call(procedure, params, callback);
} // end UserGamePlayHandler

function UserRegisterHandler(response, data){
	var msg = build.UserRegister.decode(data);

	var procedure = 'sea_AddLogRegister';
	var params = "'" + msg['k_id'] + "'";

	var callback = function (results, fields) {
		var res = results[0][0]['res'];
		console.log(procedure + ': ' + res);		
	};

	mysql.call(procedure, params, callback);
} // end UserRegisterHandler

function UserUnregisterHandler(response, data){
	var msg = build.UserUnregister.decode(data);

	var procedure = 'sea_AddLogUnregister';
	var params = "'" + msg['k_id'] + "'";

	var callback = function (results, fields) {
		var res = results[0][0]['res'];
		console.log(procedure + ': ' + res);
	};

	mysql.call(procedure, params, callback);
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
