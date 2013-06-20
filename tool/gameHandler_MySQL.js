var mysql = require('./mysql');
var build = require('./protoBuild');
var assert = require('assert');
var encrypt = require('./util').encrypt;
var toStream = require('./util').toStream;
var request = require('./request').request;
var log = require('./log');

function write(res, stream) {
	res.writeHead(200, {'Content-Type': 'application/octet-stream', 'Content-Length':stream.length});
	res.write(stream);
	res.end();
}

function VersionInfoHandler(response, data){
	var msg = build.VersionInfo.decode(data);
} // end VersionInfoHandler

function VersionInfoReplyHandler(response, data){
	var msg = build.VersionInfoReply.decode(data);
} // end VersionInfoReplyHandler

function ClientVersionInfoHandler(response, data){
	var msg = build.ClientVersionInfo.decode(data);
} // end ClientVersionInfoHandler

function ClientVersionInfoReplyHandler(response, data){
	var msg = build.ClientVersionInfoReply.decode(data);
} // end ClientVersionInfoReplyHandler

function RegisterAccountHandler(response, data){
	var msg = build.RegisterAccount.decode(data);
	var now = new Date().getTime();

	var procedure = 'sea_CreateUser';
	var params = "'" + msg['k_id'] + "', " + now + "";
	
	var callback = function (results, fields) {
		var res = true;

		if (res === 0) {
			log.addLog('DEBUG', 'Already exsisted account');
			res = false;
		}

		var RegisterAccountReply = build.RegisterAccountReply;
		var rMsg = new RegisterAccountReply();
		rMsg['k_id'] = msg['k_id'];
		rMsg['res'] = res;

		write(response, toStream(rMsg));

		var UserRegister = build.UserRegister;
		var req = new UserRegister();
		req['k_id'] = msg['k_id'];

		request(req);
	};

	mysql.call(procedure, params, callback);
} // end RegisterAccountHandler

function UnregisterAccountHandler(response, data){
	var msg = build.UnregisterAccount.decode(data);
} // end UnregisterAccountHandler

function LoadUserInfoHandler(response, data){
	var msg = build.LoadUserInfo.decode(data);
	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";

	var callback = function (results, fields) {
		var res = true;
		var AccountInfo = build.AccountInfo;
		var rMsg = new AccountInfo();
		rMsg['k_id'] = msg['k_id'];
		rMsg['res'] = msg['res'];

		if (res === 0) {
			log.addLog('DEBUG', 'Invalid account');
			rMsg['res'] = false;
			write(response, toStream(rMsg));
		}
		else {
			procedure = 'sea_LoadUserInfo';
			id = results[0][0]['id'];
			params = id;

			var loadUserInfoCallback = function (results, fields) {
				for (var val in results[0][0]) {
					if (rMsg[''+val] === 0 || rMsg[''+val] === '') {
						rMsg[''+val] = results[0][0][''+val];
					}
				}

				write(response, toStream(rMsg));

				procedure = 'sea_UpdateUvOn';
				params = id;

				mysql.call(procedure, params, function (results, fields) {});
			}

			mysql.call(procedure, params, loadUserInfoCallback);
		}
	}

	mysql.call(procedure, params, callback);
} // end LoadUserInfoHandler

function CheckInChargeHandler(response, data){
	var msg = build.CheckInCharge.decode(data);
	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";

	var callback = function (results, fields) {
		var res = true;
		var ChargeInfo = build.ChargeInfo;
		var rMsg = new ChargeInfo();
		rMsg['res'] = res;
		rMsg['k_id'] = msg['k_id'];

		if (res === 0) {
			log.addLog('DEBUG', 'Invalid account');
			rMsg['res'] = false;
			write(response, toStream(rMsg));
		}
		else {
			var id = results[0][0]['id'];
			procedure = 'sea_CheckInCharge';
			params = id;

			var checkInChargeCallback = function (results, fields) {
				var last = results[0][0]['last_charged_time'];
				var heart = results[0][0]['heart'];
				var heartMax = 99;
				var now = new Date().getTime();

				if (heartMax === heart) {
					procedure = 'sea_UpdateLastChargeTime';
					params = id + ', ' + now;
					rMsg['heart'] = heartMax;
					rMsg['last_charged_time'] = now;

					mysql.call(procedure, params, function (results, fields) {
						write(response, toStream(rMsg));
					});
				}
				else {
					var diff = now - last;
					var quotient = diff / 600;
					var uptodate = last + (600 * quotient);

					if (quotient) {
						heart += quotient;
						if (heart >= heartMax) {
							heart = heartMax;
						}						
						procedure = 'sea_UpdateLastChargeTime';
						params = id + ', ' + uptodate;
						rMsg['heart'] = heartMax;
						rMsg['last_charged_time'] = uptodate;
					
						mysql.call(procedure, params, function (results, fields) {
							procedure = 'sea_UpdateHeart';
							params = id + ', ' + heart;

							mysql.call(procedure, params, function (results, fields) {
								write(response, toStream(rMsg));
							});
						});
					}
					else {
						rMsg['heart'] = heart;
						rMsg['last_charged_time'] = last;
						write(response, toStream(rMsg));
					} // end else
				} // end else
			} // checkInChargeCallback
			mysql.call(procedure, params, checkInChargeCallback);
		} // end else
	} // sea_LoadUser

	mysql.call(procedure, params, callback);
} // end CheckInChargeHandler

function StartGameHandler(response, data){
	var msg = build.StartGame.decode(data);
	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";

	var heartMax = 99;

	var callback = function (results, fields) {
		var res = true;;
		var StartGameReply = build.StartGameReply;
		var rMsg = new StartGameReply();
		rMsg['res'] = res;
		rMsg['k_id'] = msg['k_id'];

		if (res === 0) {
			log.addLog('DEBUG', 'Invalid account');
			rMsg['res'] = false;
			write(response, toStream(rMsg));
		}
		else {
			var id = results[0][0]['id'];
			procedure = 'sea_StartGame';
			params = id;

			var startGameCallback = function (results, fields) {
				var character = results[0][0]['selected_character'];
				var assistant = results[0][0]['selected_assistant'];
				var heart = results[0][0]['heart'];
				var last = results[0][0]['last_charged_time'];

				if (heart < 1) {
					log.addLog('DEBUG', 'Not enough heart');
					// FIXME
					write(response, toStream(rMsg));
				}
				else if (character != msg['selected_character'] 
						|| assistant != msg['selected_assistant']) {
					log.addLog('ERROR', 'doesn\'t match with DB'); 
					// FIXME
					write(response, toStream(rMsg));
				}
				else {
					if (heart == heartMax) {
						last = new Date().getTime();	
					}
					heart -= 1;

					procedure = 'sea_UpdateLastChargeTime';
					params = id + ', ' + last;
					rMsg['heart'] = heart;
					rMsg['last_charged_time'] = last;
				
					mysql.call(procedure, params, function (results, fields) {
						procedure = 'sea_UpdateHeart';
						params = id + ', ' + heart;

						mysql.call(procedure, params, function (results, fields) {
							write(response, toStream(rMsg));
						});
					});
				}
			}
			mysql.call(procedure, params, startGameCallback);
		} // end else
	}; // end sea_LoadUser

	mysql.call(procedure, params, callback);
} // end StartGameHandler

function EndGameHandler(response, data){
	var msg = build.EndGame.decode(data);
	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";

	var callback = function (results, fields) {
		var res = true;
		var GameResult = build.GameResult;
		var rMsg = new GameResult();
		rMsg['k_id'] = msg['k_id'];
		rMsg['res'] = res;

		if (res === 0) {
			log.addLog('DEBUG', 'Invalid account');
			rMsg['res'] = false;
			write(response, toStream(rMsg));
		}
		else {
			// FIXME
			var id = results[0][0]['id'];
			var score = 10*(1+msg['dist']) * (1+msg['kill']);
			procedure = 'sea_UpdateUserLog';
			params = id + ', ' + score + ', ' + msg['dist'] + ', ' + msg['kill'];

			var updateUserLogCallback = function (results, fields) {
				rMsg['score'] = score;

				write(response, toStream(rMsg));
			};

			mysql.call(procedure, params, updateUserLogCallback);

			if (msg['usedItem'] > 0) {
				procedure = 'sea_AddUserItem';
				params = "'" + id + ', ' + 1 + "'";

				mysql.call(procedure, params, function (results, fields) {
					
				});
			}
		}
	};

	mysql.call(procedure, params, callback);
} // end EndGameHandler

function LoadRankInfoHandler(response, data){
	var msg = build.LoadRankInfo.decode(data);	
	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";

	var callback = function (results, fields) {
		var res = true;
		var RankInfo = build.RankInfo;
		var rMsg = new RankInfo();
		rMsg['res'] = res;
		rMsg['k_id'] = msg['k_id'];

		if (res === 0) {
			log.addLog('DEBUG', 'Invalid account');
			rMsg['res'] = false;
			write(response, toStream(rMsg));
		}
		else {
			var rankingList = require('./server').rankingList;
			// FIXME

			for (var i = 0; i < rankingList.length; ++i) {
				rMsg['ranking_list'].push({'k_id': rankingList[i]['k_id'], 'score': rankingList[i]['highest_score']});

				if (rankingList[i]['k_id'] === res['k_id']) {
					rMsg['overall_ranking'] = i+1;
				}
			}

			write(response, toStream(rMsg));
		}
	};

	mysql.call(procedure, params, callback);
} // end LoadRankInfoHandler

function RequestPointRewardHandler(response, data){
	var msg = build.RequestPointReward.decode(data);
} // end RequestPointRewardHandler

exports.VersionInfoHandler = VersionInfoHandler;
exports.VersionInfoReplyHandler = VersionInfoReplyHandler;
exports.ClientVersionInfoHandler = ClientVersionInfoHandler;
exports.ClientVersionInfoReplyHandler = ClientVersionInfoReplyHandler;
exports.RegisterAccountHandler = RegisterAccountHandler;
exports.UnregisterAccountHandler = UnregisterAccountHandler;
exports.LoadUserInfoHandler = LoadUserInfoHandler;
exports.CheckInChargeHandler = CheckInChargeHandler;
exports.StartGameHandler = StartGameHandler;
exports.EndGameHandler = EndGameHandler;
exports.LoadRankInfoHandler = LoadRankInfoHandler;
exports.RequestPointRewardHandler = RequestPointRewardHandler;
