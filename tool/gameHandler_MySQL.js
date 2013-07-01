var mysql = require('./mysql');
var build = require('./protoBuild');
var assert = require('assert');
var encrypt = require('./util').encrypt;
var toStream = require('./util').toStream;
var UUID = require('./util').UUID;
var request = require('./request').request;
var registerSession = require('./session').registerSession;
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
		var RegisterAccountReply = build.RegisterAccountReply;
		var rMsg = new RegisterAccountReply();
		var res = results[0][0]['last_id'];
		var Result = build.Result;

		console.log(RegisterAccountReply);

		if (res === 0) {
			log.addLog('DEBUG', 'Already exsisted account');

			rMsg['res'] = Result['FALSE'];
		}
		else {
			rMsg['res'] = Result['TRUE'];

			var UserRegister = build.UserRegister;
			var req = new UserRegister();
			req['k_id'] = msg['k_id'];

			request(req);
		}

		rMsg['k_id'] = msg['k_id'];

		write(response, toStream(rMsg));		
	};

	mysql.call(procedure, params, callback);
} // end RegisterAccountHandler

function UnregisterAccountHandler(response, data){
	var msg = build.UnregisterAccount.decode(data);
} // end UnregisterAccountHandler

function LoginHandler(response, data){
	var msg = build.Login.decode(data);
	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";

	var callback = function (results, fields) {
		var id = results[0][0]['id']
		var AccountInfo = build.AccountInfo;
		var rMsg = new AccountInfo();
		var Result = build.Result;
		rMsg['k_id'] = msg['k_id'];

		if (id === 0) {
			log.addLog('DEBUG', 'Invalid account');
			rMsg['res'] = Result['FALSE'];
			write(response, toStream(rMsg));
		}
		else {
			rMsg['res'] = Result['TRUE'];
			procedure = 'sea_LoadUserInfo';
			params = id;

			var loadUserInfoCallback = function (results, fields) {
				var res = results[0][0];
				var Pack = build.AccountInfo.Pack;

				for (var val in res) {
					if (rMsg[''+val] === null) {
						if (res[''+val] === 0) {
							rMsg[''+val] = Pack['ZERO'];
						}
						else {						
							rMsg[''+val] = res[''+val];
						}
					}
				}

				var piece = UUID();

				registerSession(piece);
				var stream = toStream(rMsg);

				response.writeHead(200, {'Set-Cookie' : 'piece='+piece,
					'Content-Type': 'application/octet-stream',
					'Content-Length': stream.length});
				response.write(stream);
				response.end();

				if (rMsg['uv'] === 0) {
					procedure = 'sea_UpdateUvOn';
					params = id;

					mysql.call(procedure, params, function (results, fields) {});
				}
			};

			mysql.call(procedure, params, loadUserInfoCallback);

			var AccountLogin = build.AccountLogin;
			var req = new AccountLogin();
			req['k_id'] = msg['k_id'];

			request(req);
		}
	};

	mysql.call(procedure, params, callback);
} // end LoginHandler

function LogoutHandler(response, data){
//	var msg = build.Logout.decode(data);
} // end LogoutHandler

function CheckInChargeHandler(response, data){
	var msg = build.CheckInCharge.decode(data);
	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";

	var callback = function (results, fields) {
		var id = results[0][0]['id'];
		var ChargeInfo = build.ChargeInfo;
		var Result = build.Result;
		var rMsg = new ChargeInfo();
		rMsg['k_id'] = msg['k_id'];

		if (id === 0) {
			log.addLog('DEBUG', 'Invalid account');
			rMsg['res'] = Result['FALSE'];
			write(response, toStream(rMsg));
		}
		else {
			rMsg['res'] = Result['TRUE'];
			var id = results[0][0]['id'];
			procedure = 'sea_CheckInCharge';
			params = id;

			var checkInChargeCallback = function (results, fields) {
				var res = results[0][0]
				var last = res['last_charged_time'];
				var heart = res['heart'];
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
						rMsg['heart'] = heart;
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
						if (heart === 0) {
							rMsg['heart'] = ChargeInfo.Pack['ZERO'];
						}
						else {
							rMsg['heart'] = heart;
						}
						
						rMsg['last_charged_time'] = last;
						write(response, toStream(rMsg));
					} // end else
				} // end else
			}; // checkInChargeCallback

			mysql.call(procedure, params, checkInChargeCallback);
		} // end else
	}; // sea_LoadUser

	mysql.call(procedure, params, callback);
} // end CheckInChargeHandler

function SelectCharacterHandler(response, data){
	var msg = build.SelectCharacter.decode(data);
} // end SelectCharacterHandler

function SelectAssistantHandler(response, data){
	var msg = build.SelectAssistant.decode(data);
} // end SelectAssistantHandler

function StartGameHandler(response, data){
	var msg = build.StartGame.decode(data);
	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";

	var heartMax = 99;

	var callback = function (results, fields) {
		var id = results[0][0]['id'];
		var StartGameReply = build.StartGameReply;
		var Result = build.Result;
		var rMsg = new StartGameReply();

		rMsg['k_id'] = msg['k_id'];

		if (id === 0) {
			log.addLog('DEBUG', 'Invalid account');
			rMsg['res'] = Result['FALSE'];
			write(response, toStream(rMsg));
		}
		else {			
			rMsg['res'] = Result['TRUE'];
			procedure = 'sea_StartGame';
			params = id;

			var startGameCallback = function (results, fields) {
				var res = results[0][0];
				var character = res['selected_character'];
				var assistant = res['selected_assistant'];
				var heart = res['heart'];
				var last = res['last_charged_time'];

				if (heart < 1) {
					log.addLog('DEBUG', 'Not enough heart : ' + rMsg['k_id']);
					
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

					if (heart === 0) {
						rMsg['heart'] = StartGameReply.Pack['ZERO'];
					}
					else {
						rMsg['heart'] = heart;
					}

					procedure = 'sea_UpdateLastChargeTime';
					params = id + ', ' + last;					
					rMsg['last_charged_time'] = last;
				
					mysql.call(procedure, params, function (results, fields) {
						procedure = 'sea_UpdateHeart';
						params = id + ', ' + heart;

						mysql.call(procedure, params, function (results, fields) {
							write(response, toStream(rMsg));
						});
					});
				}
			};

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
		var id = results[0][0]['id'];
		var GameResult = build.GameResult;
		var Result = build.Result;
		var rMsg = new GameResult();
		rMsg['k_id'] = msg['k_id'];

		if (id === 0) {
			log.addLog('DEBUG', 'Invalid account');
			rMsg['res'] = Result['FALSE'];
			write(response, toStream(rMsg));
		}
		else {
			// FIXME
			var score = 10*(1+msg['dist']) * (1+msg['kill']);
			rMsg['res'] = Result['TRUE'];
			procedure = 'sea_UpdateUserLog';
			params = id + ', ' + score + ', ' + msg['dist'] + ', ' + msg['kill'];

			var updateUserLogCallback = function (results, fields) {
				if (score === 0) {
					rMsg['score'] = GameResult.Pack['ZERO'];
				}
				else {
					rMsg['score'] = score;
				}

				write(response, toStream(rMsg));
			};

			mysql.call(procedure, params, updateUserLogCallback);

			if (msg['usedItem'] > 0) {
				procedure = 'sea_AddUserItem';
				params = "'" + id + ', ' + 1 + "'";

				mysql.call(procedure, params, function (results, fields) {
					
				});
			}

			var UserRegister = build.UserRegister;
			var req = new UserRegister();
			req['k_id'] = msg['k_id'];

			request(req);
		}
	};

	mysql.call(procedure, params, callback);
} // end EndGameHandler

function LoadRankInfoHandler(response, data){
	var msg = build.LoadRankInfo.decode(data);	
	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";

	var callback = function (results, fields) {
		var id = results[0][0];
		var RankInfo = build.RankInfo;
		var Result = build.Result;
		var rMsg = new RankInfo();
		
		rMsg['k_id'] = msg['k_id'];

		if (id === 0) {
			log.addLog('DEBUG', 'Invalid account');
			rMsg['res'] = Result['FALSE'];
			write(response, toStream(rMsg));
		}
		else {
			rMsg['res'] = Result['TRUE'];
			var rankingList = require('./server').rankingList;
			// FIXME

			for (var i = 0; i < rankingList.length; ++i) {
				var score = rankingList[i]['highest_score'];

				if (score === 0) {
					score = RankInfo.FriendRankInfo.Pack['ZERO'];
				}

				rMsg['ranking_list'].push({'k_id': rankingList[i]['k_id'], 'score': score});

				if (rankingList[i]['k_id'] === rMsg['k_id']) {
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
exports.LoginHandler = LoginHandler;
exports.LogoutHandler = LogoutHandler;
exports.CheckInChargeHandler = CheckInChargeHandler;
exports.SelectCharacterHandler = SelectCharacterHandler;
exports.SelectAssistantHandler = SelectAssistantHandler;
exports.StartGameHandler = StartGameHandler;
exports.EndGameHandler = EndGameHandler;
exports.LoadRankInfoHandler = LoadRankInfoHandler;
exports.RequestPointRewardHandler = RequestPointRewardHandler;
