var mysql = require('./mysql');
var build = require('./c2g-proto-build');
var assert = require('assert');
var toStream = require('../common/util').toStream;
var UUID = require('../common/util').UUID;
var convertMS2S = require('../common/util').convertMS2S;
var request = require('./g2l-request').request;
var toAuth = require('./a2g-client').toAuth;
var sessionEvent = require('./a2g-event').sessionEvent;
var session = require('./session');

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

function VersionInfoHandler(response, data, session_id, logMgr){
	var msg = build.VersionInfo.decode(data);
	var rMsg = new build.VersionInfoReply();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in VersionInfoHandler");
		sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
		write(response, toStream(sysMsg));
		return ;
	}

	// FIXME
	rMsg['version'] = msg['version'];
	write(response, toStream(rMsg));	
} // end VersionInfoHandler

function RegisterAccountHandler(response, data, session_id, logMgr){
	var msg = build.RegisterAccount.decode(data);
	var rMsg = new build.RegisterAccountReply();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in RegisterAccountHandler");
		sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
		write(response, toStream(sysMsg));
		return ;
	} 

	var procedure = 'sea_CreateUser';
	var params = "'" + msg['k_id'] + "'";
	
	mysql.call(procedure, params, function (results, fields) {
		var res = results[0][0]['res'];

		if (res === 0) {
			logMgr.addLog('ERROR', 'Already exsisting account : ' + msg['k_id']);
			sysMsg['res'] = build.Result['EXISTED_ACCOUNT'];
			write(response, toStream(sysMsg));
			return ;
		}
		
		write(response, toStream(rMsg));

		var UserRegister = build.UserRegister;
		var req = new UserRegister();
		req['k_id'] = msg['k_id'];

		request(req);
	});
} // end RegisterAccountHandler

function UnregisterAccountHandler(response, data, session_id, logMgr){
	var msg = build.UnregisterAccount.decode(data);
	var sysMsg = new build.SystemMessage();
	
	session.toAuthUnregisterSession(msg['k_id'], session_id, function (res) {
		if (res !== true) {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', "Undefined field is detected in UnregisterAccountHandler");
			sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		var procedure = 'sea_LoadUser';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];

			if (res <= 0) {
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				logMgr.addLog('ERROR', 'Unregister Invalid Account : ' + msg['k_id'] + ', ' + res);
				write(response, toStream(sysMsg));
				return;
			}

			procedure = 'sea_DeleteUser';
			params = res;
			mysql.call(procedure, params, function (results, fields) {});
			logMgr.addLog('SYSTEM', 'UnregisterAccount : ' + msg['k_id']);
			
			var UserUnregister = build.UserUnregister;
			var req = new UserUnregister();
			req['k_id'] = msg['k_id'];

			request(req);
			write(response, toStream(rMsg));
		});
	});
} // end UnregisterAccountHandler

function LoginHandler(response, data, session_id, logMgr){
	var msg = build.Login.decode(data);
	var rMsg = new build.AccountInfo();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in LoginHandler");
		sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
		write(response, toStream(sysMsg));
		return ;
	}
		
	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";

	mysql.call(procedure, params, function (results, fields) {
		var res = results[0][0]['res'];
		var id = res;

		if (res <= 0) {
			logMgr.addLog('SYSTEM', '[LoginHandler] Invalid account (res : ' + res + ')');
			sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
			write(response, toStream(sysMsg));
			return ;
		}

		procedure = 'sea_IsBlack';
		params = "'" + msg['k_id'] + "'";
		mysql.call(procedure, params, function (results, fields) {
			res = results[0][0]['res'];

			if (res) {
				logMgr.addLog('SYSTEM', 'blocked account access : (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['BLOCKED_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}	

			procedure = 'sea_LoadUserInfo';
			params = id;											

			mysql.call(procedure, params, function (results, fields) {
				var _res = results[0][0];

				session.toAuthRegisterSession(msg['k_id'], function (fromAuthSessionId) {
					if (fromAuthSessionId !== false) {
						// info
						rMsg['coin'] = _res['coin'];
						rMsg['mineral'] = _res['mineral'];
						rMsg['lv'] = _res['lv'];
						rMsg['exp'] = _res['exp'];
						rMsg['point'] = _res['point'];
						rMsg['energy'] = _res['energy'];
						rMsg['last_charged_time'] = _res['last_charged_time'];
						rMsg['selected_character'] = _res['selected_character'];

						// character
						if (_res['character_one'] > 0) {	
							rMsg['characters'].push({'id':build.AccountInfo.ID['ONE'], 'level':_res['character_one']}); 
						}
						if (_res['character_two'] > 0) {	
							rMsg['characters'].push({'id':build.AccountInfo.ID['TWO'], 'level':_res['character_two']}); 
						}
						if (_res['character_three'] > 0) { 
							rMsg['characters'].push({'id':build.AccountInfo.ID['THREE'], 'level':_res['character_three']});
						}
						if (_res['character_four'] > 0) { 
							rMsg['characters'].push({'id':build.AccountInfo.ID['FOUR'], 'level':_res['character_four']}); 
						}

						// upgrade
						rMsg['score_factor'] = _res['score_factor'];
						rMsg['time_factor'] = _res['time_factor'];
						rMsg['cooldown_factor'] = _res['cooldown_factor'];

						// item
						rMsg['shield'] = _res['shield'];
						rMsg['item_last'] = _res['item_last'];
						rMsg['ghost'] = _res['ghost'];
						rMsg['weapon_reinforce'] = _res['weapon_reinforce'];
						rMsg['exp_boost'] = _res['exp_boost'];
						rMsg['max_attack'] = _res['max_attack'];
						rMsg['bonus_heart'] = _res['bonus_heart'];
						rMsg['drop_up'] = _res['drop_up'];
						rMsg['magnet'] = _res['magnet'];
						rMsg['bonus_score'] = _res['bonus_score'];
						
//								for (var val in res) {
//									if (rMsg[''+val] === null) {
//										if (res[''+val] === 0) {
//											rMsg[''+val] = Pack['ZERO'];
//										}
//										else {						
//											rMsg[''+val] = res[''+val];
//										}
//									}
//								}

						var _mileage = _res['mileage'];
						var _draw = _res['draw'];

						if (_res['uv'] === 0) {
							procedure = 'sea_UpdateUvOn';
							params = id;

							mysql.call(procedure, params, function (results, fields) {});

							_mileage = _res['mileage'] + 25;

							if (_mileage >= 100) {
								_mileage -= 100;
								++_draw;

								procedure = 'sea_UpdateDraw';
								params = id + ', ' + _draw;

								mysql.call(procedure, params, function (results, fields) {});
							}

							procedure = 'sea_UpdateMileage';
							params = id + ', ' + _mileage;

							mysql.call(procedure, params, function (results, fields) {});
						}

						rMsg['mileage'] = _mileage;
						rMsg['draw'] = _draw;
						
						var stream = toStream(rMsg);

						response.writeHead(200, {'Set-Cookie' : 'piece='+fromAuthSessionId,
												'Content-Type': 'application/octet-stream',
												'Content-Length': stream.length});
						response.write(stream);
						response.end();
					} else {
						logMgr.addLog('SYSTEM', 'Duplicated account login (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['DUPLICATED_LOGIN'];
						write(response, toStream(sysMsg));
						return ;
					}
				});
			});

			var AccountLogin = build.AccountLogin;
			var req = new AccountLogin();
			req['k_id'] = msg['k_id'];

			request(req);
		}); // end mysql.call();
	}); // end mysql.call()
} // end LoginHandler

function LogoutHandler(response, data, session_id, logMgr){
	var msg = build.Logout.decode(data);
	var sysMsg = new build.SystemMessage();
	var rMsg = new build.LogoutReply();

	session.toAuthUnregisterSession(msg['k_id'], session_id, function (res) {
		if (res !== true) {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', "Undefined field is detected in LogoutHandler");
			sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		var procedure = 'sea_LoadUser';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];

			if (res <= 0) {
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				logMgr.addLog('ERROR', 'logoutHandle failed : ' + msg['k_id'] + ', ' + res);
				write(response, toStream(sysMsg));
				return ;
			}

			logMgr.addLog('SYSTEM', 'logout : ' + msg['k_id']);
			write(response, toStream(rMsg));
		});
	});
} // end LogoutHandler

function CheckInChargeHandler(response, data, session_id, logMgr){
	var msg = build.CheckInCharge.decode(data);
	var rMsg = new build.ChargeInfo();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res !== true) {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', "Undefined field is detected in CheckInChargeHandler");
			sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		} 

		var procedure = 'sea_LoadUser';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			var id;

			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			id = res;
			procedure = 'sea_CheckInCharge';
			params = id;

			mysql.call(procedure, params, function (results, fields) {
				res = results[0][0];
				var last = res['last_charged_time'];
				var energy = res['energy'];
				var energyMax = 100;
				var now = new Date().getTime();
				now = convertMS2S(now);

				if (energyMax === energy) {
					procedure = 'sea_UpdateLastChargeTime';
					params = id + ', ' + now;
					rMsg['energy'] = energyMax;
					rMsg['last_charged_time'] = now;

					mysql.call(procedure, params, function (results, fields) {
						write(response, toStream(rMsg));
					});
				} else {
					var diff = now - last;
					var quotient = diff / 600;
					var uptodate = last + (600 * quotient);

					if (quotient) {
						energy += quotient;
						if (energy >= energyMax) {
							energy = energyMax;
						}						
						procedure = 'sea_UpdateLastChargeTime';
						params = id + ', ' + uptodate;
						rMsg['energy'] = energy;
						rMsg['last_charged_time'] = uptodate;
					
						mysql.call(procedure, params, function (results, fields) {
							procedure = 'sea_UpdateEnergy';
							params = id + ', ' + energy;

							mysql.call(procedure, params, function (results, fields) {
								write(response, toStream(rMsg));
							});
						});
					} else {
						if (energy === 0) {
							rMsg['energy'] = ChargeInfo.Pack['ZERO'];
						} else {
							rMsg['energy'] = energy;
						}
						
						rMsg['last_charged_time'] = last;
						write(response, toStream(rMsg));
					} // end else
				} // end else
			}); // end mysql.call()
		}); // end mysql.call()
	});
} // end CheckInChargeHandler

function SelectCharacterHandler(response, data, session_id, logMgr){
	var msg = build.SelectCharacter.decode(data);
	var rMsg = new build.SelectCharacterReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res !== true) {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', "Undefined field is detected in SelectCharacterHandler");
			sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		} 

		var procedure = 'sea_LoadUser';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			var id;

			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			id = res;
			procedure = 'sea_SelectUserCharacter';
			params = id;

			mysql.call(procedure, params, function (results, fields) {
				res = results[0][0];
				var selected = msg['selected_character'];

				if (selected < 0 || selected > 10) {
					logMgr.addLog('ERROR', 'Character Range Over (' + msg['k_id'] + ', ' + 'character : ' + msg['selected_character'] + ')');
					sysMsg['res'] = build.Result['INVALID_CHARACTER'];
					write(response, toStream(sysMsg));
					return;
				}
				
				if (selected === 1 && res['character_one'] || 
					selected === 2 && res['character_two'] ||
					selected === 3 && res['character_three'] ||
					selected === 4 && res['character_four'] ) 
				{
					write(response, toStream(rMsg));
				} else {
					logMgr.addLog('ERROR', 'Invalid character (' + msg['k_id'] + ', ' + 'character : ' + msg['selected_character'] + ')');
					sysMsg['res'] = build.Result['INVALID_CHARACTER'];
					write(response, toStream(sysMsg));
				}
			});
		});
	});
} // end SelectCharacterHandler

function StartGameHandler(response, data, session_id, logMgr){
	var msg = build.StartGame.decode(data);
	var rMsg = new build.StartGameReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res !== true) {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', "Undefined field is detected in StartGameHandler");
			sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		var procedure = 'sea_LoadUser';
		var params = "'" + msg['k_id'] + "'";

		var energyMax = 100;

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			var id;

			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			id = res;
			procedure = 'sea_startgame';
			params = id;

			mysql.call(procedure, params, function (results, fields) {
				res = results[0][0];
				var character = res['selected_character'];
				var energy = res['energy'];
				var last = res['last_charged_time'];

				if (energy < 1) {
					logMgr.addLog('system', 'Not enough energy : ' + rMsg['k_id']);
					sysMsg['res'] = build.Result['NOT_ENOUGH_ENERGY'];
					write(response, toStream(sysMsg));
				} else if (character != msg['selected_character']) {
					logMgr.addLog('error', "Doesn't match with db (" + character + ": " + msg['selected_character'] + ")" ); 
					sysMsg['res'] = build.Result['NO_MATCH_WITH_DB'];
					write(response, toStream(sysMsg));
				} else {
					if (energy == energyMax) {
						last = new Date().getTime();	
						last = convertMS2S(last);
					}
					energy -= 1;

					rMsg['energy'] = energy;

					procedure = 'sea_UpdateLastChargeTime';
					params = id + ', ' + last;					
					rMsg['last_charged_time'] = last;
				
					mysql.call(procedure, params, function (results, fields) {
						procedure = 'sea_UpdateEnergy';
						params = id + ', ' + energy;

						mysql.call(procedure, params, function (results, fields) {
							write(response, toStream(rMsg));
						});
					});
				}
			});
		}); // end sea_LoadUser
	});
} // end StartGameHandler

function EndGameHandler(response, data, session_id, logMgr){
	var msg = build.EndGame.decode(data);
	var rMsg = new build.GameResult();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res !== true) {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', "Undefined field is detected in EndGameHandler");
			sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		var procedure = 'sea_LoadUser';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			var id;

			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			id = res;			
			procedure = 'sea_LoadUserBriefInfo';
			params = id;

			mysql.call(procedure, params, function (results, fields) {
				res = results[0][0];					
				var _mileage = res['mileage'] + 5;
				var _draw = res['draw'];

				if (_mileage >= 100) {
					++_draw;

					procedure = 'sea_UpdateDraw';
					params = id + ', ' + _draw;

					mysql.call(procedure, params, function (results, fields) {});
				}

				procedure = 'sea_UpdateMileage';
				params = id + ', ' + _mileage;

				mysql.call(procedure, params, function (results, fields) {});

				rMsg['score'] = msg['score'];
				rMsg['coin'] = msg['coin'];
				rMsg['total_coin'] = msg['coin'] + res['coin'];
				rMsg['bonus_score'] = parseInt((msg['score'] + msg['coin']) * (res['lv']/100));
				rMsg['total_score'] = msg['score'] + msg['coin'] + rMsg['bonus_score'];
				rMsg['mileage'] = _mileage;
				rMsg['draw'] = _draw;
				// TODO
				rMsg['level'] = res['lv'];
				rMsg['exp'] = res['exp'] + rMsg['total_score'];

				write(response, toStream(rMsg));

				procedure = 'sea_UpdateCoin';
				params = id + ', ' + rMsg['total_coin'];
				mysql.call(procedure, params, function (results, fields) {});

				procedure = 'sea_UpdateLevel';
				params = id + ', ' + rMsg['level'] + ', ' + rMsg['exp'];
				mysql.call(procedure, params, function (results, fields) {});

				procedure = 'sea_UpdateUserLog';
				params = id + ', ' + rMsg['total_score'] + ', ' + msg['dist'] + ', ' + msg['enemy_kill'];
				mysql.call(procedure, params, function (results, fields) {});

				procedure = 'sea_LoadItems';
				params = id;
				mysql.call(procedure, params, function (results, fields) {
					res = results[0][0];

					var UserGamePlay = build.UserGamePlay;
					var req = new UserGamePlay();
					req['k_id'] = msg['k_id'];
					req['selected_character'] = msg['selected_character'];
					req['score'] = msg['score'];
					req['enemy_kill'] = msg['enemy_kill'];
					req['dist'] = msg['dist'];
					req['play_time'] = msg['play_time'];
					req['shield'] = res['shield'];
					req['ghost'] = res['ghost'];
					req['weapon_reinforce'] = res['weapon_reinforce'];
					req['exp_boost'] = res['exp_boost'];
					req['item_last'] = res['item_last'];
					req['max_attack'] = res['max_attack'];
					req['bonus_heart'] = res['bonus_heart'];
					req['drop_up'] = res['drop_up'];
					req['magnet'] = res['magnet'];
					req['bonus_score'] = res['bonus_score'];

					request(req);

					// FIXME
					if (res['shield'] > 0) {
						procedure = 'sea_UpdateShield';
						params = id + ', ' + -1;
						mysql.call(procedure, params, function(results, fields) {});
					}

					if (res['ghost'] > 0) {
						procedure = 'sea_UpdateGhost';
						params = id + ', ' + -1;
						mysql.call(procedure, params, function(results, fields) {});
					}

					if (res['weapon_reinforce'] > 0) {
						procedure = 'sea_UpdateWeaponReinforce';
						params = id + ', ' + -1;
						mysql.call(procedure, params, function(results, fields) {});
					}

					if (res['exp_boost'] > 0) {
						procedure = 'sea_UpdateExpBoost';
						params = id + ', ' + -1;
						mysql.call(procedure, params, function(results, fields) {});
					}

					if (res['item_last'] > 0) {
						procedure = 'sea_UpdateItemLast';
						params = id + ', ' + -1;
						mysql.call(procedure, params, function(results, fields) {});
					}

					if (res['max_attack'] > 0) {
						procedure = 'sea_UpdateMaxAttack';
						params = id + ', ' + -1;
						mysql.call(procedure, params, function(results, fields) {});
					}

					if (res['bonus_heart'] > 0) {
						procedure = 'sea_UpdateBonusHeart';
						params = id + ', ' + -1;
						mysql.call(procedure, params, function(results, fields) {});
					}

					if (res['drop_up'] > 0) {
						procedure = 'sea_UpdateDropUp';
						params = id + ', ' + -1;
						mysql.call(procedure, params, function(results, fields) {});
					}

					if (res['magnet'] > 0) {
						procedure = 'sea_UpdateMagnet';
						params = id + ', ' + -1;
						mysql.call(procedure, params, function(results, fields) {});
					}

					if (res['bonus_score'] > 0) {
						procedure = 'sea_UpdateBonusScore';
						params = id + ', ' + -1;
						mysql.call(procedure, params, function(results, fields) {});
					}
				});
			});
		});
	});
} // end EndGameHandler

function LoadRankInfoHandler(response, data, session_id, logMgr){
	var msg = build.LoadRankInfo.decode(data);
	var rMsg = new build.RankInfo();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res !== true) {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', "Undefined field is detected in LoadRankInfoHandler");
			sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		var procedure = 'sea_LoadUser';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			var id;

			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			id = res;
			var rankingList = require('./c2g-index').server.rankingList;
			
			if (rankingList.length === 0 || rankingList.length === 1) {
				rMsg['overall_ranking'] = 1;
				write(response, toStream(rMsg));
			} else {
				// FIXME
				procedure = 'sea_LoadEnergyBySender';
				params = id;
				mysql.call(procedure, params, function(results, fields) {							
					res = results[0][0]['receiver_id'];

					if (res === 0) {
						for (var i = 0, l = rankingList.length; i < l; ++i) {
							var score = rankingList[i]['highest_score'];
							var energy_sended = 0;
							
							rMsg['ranking_list'].push({'k_id': rankingList[i]['k_id'], 'score': score, 'energy_sended': energy_sended});

							if (rankingList[i]['k_id'] === rMsg['k_id']) {
								rMsg['overall_ranking'] = i+1;
							} else {
								rMsg['overall_ranking'] = 0;
							}
						}
						write(response, toStream(rMsg));
					} else {
						var length = results[0].length;
						var count = 0;
						var list = results[0];
						var temp = [];
						var loadUserKIdCallback = function(results, fields) {
							++count;
							temp.push(results[0][0]['res']);

							if (count === length) {
								for (var i = 0, l = rankingList.length; i < l; ++i) {
									var score = rankingList[i]['highest_score'];
									var energy_sended = 0;

									for(var val in temp) {
										if (rankingList[i]['k_id'] === temp[val]) {
											energy_sended = 1;
											break;
										}
									}
									
									rMsg['ranking_list'].push({'k_id': rankingList[i]['k_id'], 'score': score, 'energy_sended': energy_sended});

									if (rankingList[i]['k_id'] === rMsg['k_id']) {
										rMsg['overall_ranking'] = i+1;
									} else {
										rMsg['overall_ranking'] = 0;
									}
								}
								write(response, toStream(rMsg));
							}
						};
						procedure = 'sea_LoadUserKId';

						for (var i = 0; i < length; ++i) {
							param = list[i]['receiver_id'];

							mysql.call(procedure, param, loadUserKIdCallback);
						}
					} // end else						
				}); // end mysql.call()
			}
		});
	});
} // end LoadRankInfoHandler

function LoadPostedEnergyHandler(response, data, session_id, logMgr){
	var msg = build.LoadPostedEnergy.decode(data);
	var rMsg = new build.PostedEnergy();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res !== true) {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', "Undefined field is detected in LoadPostedEnergyHandler");
			sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		var procedure = 'sea_LoadUser';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			var id;
		
			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			id = res;

			procedure = 'sea_LoadEnergyByReceiver';
			params = id;
			mysql.call(procedure, params, function (results, fields) {
				res = results[0][0]['sender_id'];

				if (res === 0) {
					write(response, toStream(rMsg));	
				} else {
					procedure = 'sea_LoadUserKId';
					var list = results[0];
					var count = 0;

					for (var i = 0, l = list.length; i < l; ++i) {
						params = list[i]['sender_id'];
						mysql.call(procedure, params, function (results, fields) {							
							var res = results[0][0]['res'];
							
							rMsg['energy'].push({'sender_k_id':res, 'sended_time':list[count]['sended_time']});
							++count;
							if (count === l) {
								write(response, toStream(rMsg));
							}
						});						
					}
				}
			});
		});
	});
} // end LoadPostedEnergyHandler

function LoadPostedBatonHandler(response, data, session_id, logMgr){
	var msg = build.LoadPostedBaton.decode(data);
	var rMsg = new build.PostedBaton();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res !== true) {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', "Undefined field is detected in LoadPostedBatonHandler");
			sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		var procedure = 'sea_LoadUser';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			var id;
		
			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			id = res;

			procedure = 'sea_LoadBaton';
			params = id;
			mysql.call(procedure, params, function (results, fields) {
				res = results[0][0]['sender_id'];

				if (res === 0) {
					write(response, toStream(rMsg));	
				} else {
					var list = results[0];
					procedure = 'sea_LoadUserKId';
					var count = 0;

					for (var i = 0, l = list.length; i < l; ++i) {
						params = list[i]['sender_id'];
						mysql.call(procedure, params, function (results, fields) {
							var res = results[0][0]['res'];
							var cp = list[count];
							rMsg['baton'].push({'sender_k_id':res, 'map_name':cp['map'], 'last_score':cp['score'], 'sended_time':cp['sended_time']});
							++count;

							if (count === l) {
								write(response, toStream(rMsg));
							}
						});						
					}
				}
			});
		});
	});
} // end LoadPostedBatonHandler

function LoadPostedBatonResultHandler(response, data, session_id, logMgr){
	var msg = build.LoadPostedBatonResult.decode(data);
	var rMsg = new build.PostedBatonResult();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res !== true) {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', "Undefined field is detected in LoadPostedBatonResultHandler");
			sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		var procedure = 'sea_LoadUser';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			var id;
		
			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			id = res;

			procedure = 'sea_LoadBatonResult';
			params = id;
			mysql.call(procedure, params, function (results, fields) {
				var sender_id = results[0][0]['sender_id'];

				if (sender_id === 0) {
					write(response, toStream(rMsg));	
				} else {
					var list = results[0];
					procedure = 'sea_LoadUserKId';
					var count = 0;

					for (var i = 0, l = list.length; i < l; ++i) {
						params = list[i]['sender_id'];
						mysql.call(procedure, params, function (results, fields) {
							var temp = results[0][0]['res'];
							var cp = list[count];
							
							rMsg['baton_result'].push({'sender_k_id':temp, 'acquisition_score':cp['score'], 'sended_time':cp['sended_time']});

							++count;

							if (count === l) {
								write(response, toStream(rMsg));
							}
						});						
					}
				}
			});
		});
	});
} // end LoadPostedBatonResultHandler

function RequestPointRewardHandler(response, data, session_id, logMgr){
	var msg = build.RequestPointReward.decode(data);
} // end RequestPointRewardHandler

function BuyItemHandler(response, data, session_id, logMgr){
	var msg = build.BuyItem.decode(data);
	var BuyItemReply = build.BuyItemReply;
	var rMsg = new BuyItemReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res !== true) {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', "Undefined field is detected in BuyItemHandler");
			sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		var procedure = 'sea_LoadUser';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			var id;

			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			id = res;			
			procedure = 'sea_LoadCoin';
			params = id;
			mysql.call(procedure, params, function(results, fields) {
				var coin = results[0][0]['coin'];

				if (coin < 0) {
					logMgr.addLog('SYSTEM', 'Not enough coin (' + msg['k_id'] + ')');
					sysMsg['res'] = build.Result['NOT_ENOUGH_COIN'];
					write(response, toStream(sysMsg));
				} else {
					procedure = 'sea_LoadMileageAndDraw';
					params = id;

					mysql.call(procedure, params, function (results, fields) {
						var _res = results[0][0];
						var _mileage = _res['mileage'] + 10;
						var _draw = _res['draw'];
						var _flag = true;

						if (_mileage >= 100) {
							++_draw;
						}

						rMsg['mileage'] = _mileage;
						rMsg['draw'] = _draw;

						if (msg['item'] === build.BuyItem.Item['EXP_BOOST']) {
							coin -= require('../data/item-data').exp_boost;
							procedure = 'sea_UpdateExpBoost';			
							rMsg['item'] = BuyItemReply.Item['EXP_BOOST'];
						} else if (msg['item'] === build.BuyItem.Item['ITEM_LAST']) {
							coin -= require('../data/item-data').item_last;
							procedure = 'sea_UpdateItemLast';			
							rMsg['item'] = BuyItemReply.Item['LAST_ITEM'];
						} else if (msg['item'] === build.BuyItem.Item['MAX_ATTACK']) {
							coin -= require('../data/item-data').max_attack;
							procedure = 'sea_UpdateMaxAttack';			
							rMsg['item'] = BuyItemReply.Item['MAX_ATTACK'];
						} else if (msg['item'] === build.BuyItem.Item['SHIELD']) {
							coin -= require('../data/item-data').shield;
							procedure = 'sea_UpdateShield';			
							rMsg['item'] = BuyItemReply.Item['SHIELD'];
						} else if (msg['item'] === build.BuyItem.Item['GHOST']) {
							coin -= require('../data/item-data').ghost;
							procedure = 'sea_UpdateGhost';			
							rMsg['item'] = BuyItemReply.Item['GHOST'];
						} else if (msg['item'] === build.BuyItem.Item['WEAPON_REINFORCE']) {
							coin -= require('../data/item-data').weapon_reinforce;
							procedure = 'sea_UpdateWeaponReinforce';			
							rMsg['item'] = BuyItemReply.Item['WEAPON_REINFORCE'];
						} else if (msg['item'] === build.BuyItem.Item['BONUS_HEART']) {
							coin -= require('../data/item-data').bonus_heart;
							procedure = 'sea_UpdateBonusHeart';			
							rMsg['item'] = BuyItemReply.Item['BONUS_HEART'];
						} else if (msg['item'] === build.BuyItem.Item['DROP_UP']) {
							coin -= require('../data/item-data').drop_up;
							procedure = 'sea_UpdateDropUp';			
							rMsg['item'] = BuyItemReply.Item['DROP_UP'];
						} else if (msg['item'] === build.BuyItem.Item['MAGNET']) {
							coin -= require('../data/item-data').magnet;
							procedure = 'sea_UpdateMagnet';			
							rMsg['item'] = BuyItemReply.Item['MAGNET'];
						} else if (msg['item'] === build.BuyItem.Item['BONUS_SCORE']) {
							coin -= require('../data/item-data').bonus_score;
							procedure = 'sea_UpdateBonusScore';			
							rMsg['item'] = BuyItemReply.Item['BONUS_SCORE'];
						} else {
							_flag = false;
							logMgr.addLog('ERROR', 'Invalid request field (' + msg['k_id'] + ', ' + msg['item'] + ')');
							sysMsg['res'] = build.Result['INVALID_REQ_FIELD'];
							write(response, toStream(sysMsg));
						}

						if (_flag === true) {
							params = id + ', ' + 1;
							mysql.call(procedure, params, function(results, fields){});

							procedure = 'sea_UpdateCoin';
							params = id + ', ' + coin;
							mysql.call(procedure, params, function(results, fields){});

							rMsg['coin'] = coin;
							write(response, toStream(rMsg));

							if (_mileage >= 100) {
								procedure = 'sea_UpdateDraw';
								params = id + ', ' + _draw;

								mysql.call(procedure, params, function (results, fields) {});
							}

							procedure = 'sea_UpdateMileage';
							params = id + ', ' + _mileage;

							mysql.call(procedure, params, function (results, fields) {});
						}
					});
				}
			});
		});
	});
} // end BuyItemHandler

function BuyOrUpgradeCharacterHandler(response, data, session_id, logMgr){
	var msg = build.BuyOrUpgradeCharacter.decode(data);
	var rMsg = new build.BuyOrUpgradeCharacterReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res !== true) {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', "Undefined field is detected in BuyOrUpgradeCharacterHandler");
			sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		} 
		
		var procedure = 'sea_LoadUser';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];		
			
			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			var id = res;
			procedure = 'sea_SelectUserCharacter';
			params = id;

			mysql.call(procedure, params, function (results, fields) {
				var character = msg['character'];

				if (character > msg.ID['MAX']-1 || character < 0) {
					logMgr.addLog('ERROR', "Invalid character (" + msg['k_id'] + ", " + character + ")");
					sysMsg['res'] = build.Result['NO_MATHCH_WITH_DB'];
					write(response, toStream(sysMsg));

					return;
				}

				res = results[0][0];
				var idx = 0;
				var idxId;

				for (var val in res) {
					++idx;

					if (idx === character) {
						idxId = val+'';
						break;
					}
				}

				var lv = res[idxId];

				if (lv > 14) {
					logMgr.addLog('ERROR', "The character is fully upgraded. (" + msg['k_id'] + ")");
					sysMsg['res'] = build.Result['FULLY_UPGRADED'];
					write(response, toStream(sysMsg));
				} else if (lv < 0) {
					logMgr.addLog('ERROR', "Upgrade value can't not be less than 0.(" + msg['k_id'] + ")");
					sysMsg['res'] = build.Result['NO_MATCH_WITH_DB'];
					write(response, toStream(sysMsg));
				} else {
					procedure = 'sea_LoadCoin';
					params = id;

					mysql.call(procedure, params, function (results, fields) {
						var coin = results[0][0]['coin'];							
						var data = require('../data/character-data')[character+''];
						var cost = data[lv];

						if (cost > coin) {								
							logMgr.addLog('SYSTEM', 'Not enough coin (' + msg['k_id'] + ')');
							sysMsg['res'] = build.Result['NOT_ENOUGH_COIN'];
							write(response, toStream(sysMsg));
							return ;
						}

						coin -= cost;
						
						var text = 'character_';
						idxId = idxId.slice(text.length);
						var first = idxId[0];
						var rest = idxId.slice(1);

						procedure = 'sea_AddCharacter' + first.toUpperCase() + rest;
						params = id;

						mysql.call(procedure, params, function (results, fields) {
							res = results[0][0]['res'];

							if (res === lv + 1) {
								procedure = 'sea_LoadMileageAndDraw';
								params = id;

								mysql.call(procedure, params, function (results, fields) {
									var _res = results[0][0];
									var _mileage = _res['mileage'] + 30;
									var _draw = _res['draw'];

									if (_mileage >= 100) {
										++_draw;

										procedure = 'sea_UpdateDraw';
										params = id + ', ' + _draw;

										mysql.call(procedure, params, function (results, fields) {});
									}

									procedure = 'sea_UpdateMileage';
									params = id + ', ' + _mileage;

									mysql.call(procedure, params, function (results, fields) {});

									rMsg['mileage'] = _mileage;
									rMsg['draw'] = _draw;
									rMsg['coin'] = coin;
									rMsg['character'] = character;
									rMsg['lv'] = res;
									write(response, toStream(rMsg));
								});
							} else {
								logMgr.addLog('ERROR', "Failed to upgrade on DB(" + msg['k_id'] + ', ' + character + ")");
								sysMsg['res'] = build.Result['FAILED_DB_UPDATE'];
								write(response, toStream(sysMsg));
							}
						});

						procedure = 'sea_UpdateCoin';
						params = id + ', ' + coin;
						
						mysql.call(procedure, params, function (results, fields) {});
					});
				}
			});
		});
	});
} // end BuyOrUpgradeCharacterHandler

function SendEnergyHandler(response, data, session_id, logMgr){
	var msg = build.SendEnergy.decode(data);
	var rMsg = new build.SendEnergyReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res !== true) {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', "Undefined field is detected in SendEnergyHandler");
			sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		var procedure = 'sea_LoadUser';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];		
			
			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			var sender_id = res;

			procedure = 'sea_LoadUser';
			params = "'" + msg['receiver_k_id'] + "'";
			mysql.call(procedure, params, function(results, fields) {
				res = results[0][0]['res'];

				if (res <= 0) {
					logMgr.addLog('ERROR', 'Invalid account (' + msg['receiver_k_id'] + ')');
					sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
					write(response, toStream(sysMsg));
					return ;
				}

				var receiver_id = res;

				procedure = 'sea_LoadMileageAndDraw';
				params = sender_id;

				mysql.call(procedure, params, function (results, fields) {
					var _res = results[0][0];

					procedure = 'sea_AddEnergy';
					params = sender_id + ', ' + receiver_id;

					mysql.call(procedure, params, function(results, fields) {});
						
					var _mileage = _res['mileage'] + 5;
					var _draw = _res['draw'];

					if (_mileage >= 100) {
						++_draw;

						procedure = 'sea_UpdateDraw';
						params = id + ', ' + _draw;

						mysql.call(procedure, params, function (results, fields) {});
					}

					procedure = 'sea_UpdateMileage';
					params = id + ', ' + _mileage;

					rMsg['mileage'] = _mileage;
					rMsg['draw'] = _draw;
					write(response, toStream(rMsg));
				});
			});
		});
	});
} // end SendEnergyHandler

function AcceptEnergyHandler(response, data, session_id, logMgr){
	var msg = build.AcceptEnergy.decode(data);
	var rMsg = new build.AcceptEnergyReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res !== true) {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', "Undefined field is detected in AcceptEnergyHandler");
			sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		var procedure = 'sea_LoadUser';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];		
			
			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			var receiver_id = res;

			procedure = 'sea_LoadUser';
			params = "'" + msg['sender_k_id'] + "'";
			mysql.call(procedure, params, function(results, fields) {
				res = results[0][0]['res'];

				if (res <= 0) {
					logMgr.addLog('ERROR', 'Invalid account (' + msg['sender_k_id'] + ')');
					sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
					write(response, toStream(sysMsg));
					return ;
				}

				var sender_id = res;

				procedure = 'sea_AcceptEnergy';
				params = sender_id + ', ' + receiver_id + ', ' + msg['sended_time'];
				
				mysql.call(procedure, params, function(results, fields) {
					res = results[0][0]['res'];

					if (res === -1) {
						logMgr.addLog('ERROR', 'Invalid energy (' + msg['receiver_k_id'] + ', ' + msg['sender_k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_HONEY'];
						write(response, toStream(sysMsg));
					} else {
						var energyMax = 100;
						procedure = 'sea_UpdateEnergy';
						
						if (res + 1 > energyMax) {
							param = receiver_id + ', ' + 99;		
						} else {
							param = receiver_id + ', ' + (res+1);
						}
						mysql.call(procedure, param, function(results, fields) {});
						write(response, toStream(rMsg));
					}
				});
			});
		});
	});
} // end AcceptEnergyHandler

function RequestBatonHandler(response, data, session_id, logMgr){
	var msg = build.RequestBaton.decode(data);
	var rMsg = new build.RequestBatonReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res !== true) {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', "Undefined field is detected in RequestBatonHandler");
			sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		var procedure = 'sea_LoadUser';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];		

			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			var sender_id = res;

			procedure = 'sea_LoadUser';
			params = "'" + msg['receiver_k_id'] + "'";
			mysql.call(procedure, params, function(results, fields) {
				res = results[0][0]['res'];

				if (res <= 0) {
					logMgr.addLog('ERROR', 'Invalid account (' + msg['receiver_k_id'] + ')');
					sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
					write(response, toStream(sysMsg));
					return ;
				}

				var receiver_id = res;
				procedure = 'sea_LoadCoin';
				params = sender_id;
				mysql.call(procedure, params, function (results, fields) {
					var coin = results[0][0]['coin'];

					if (coin > 1000) {
						var restCoin = coin - 1000;

						rMsg['coin'] = restCoin;

						procedure = 'sea_UpdateCoin';
						params = sender_id + ', ' + restCoin;

						mysql.call(procedure, params, function(results, fields) {});

						procedure = 'sea_AddBaton';
						params = sender_id + ', ' + receiver_id + ', ' + msg['score'] + ", '" + msg['map'] + "'";	

						mysql.call(procedure, params, function(results, fields) {});

						write(response, toStream(rMsg));
					} else {
						logMgr.addLog('SYSTEM', 'Not enough coin (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['NOT_ENOUGH_COIN'];
						write(response, toStream(sysMsg));							
					}
				});
			});
		});
	});
} // end RequestBatonHandler

function AcceptBatonHandler(response, data, session_id, logMgr){
	var msg = build.AcceptBaton.decode(data);
	var rMsg = new build.AcceptBatonReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res !== true) {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', "Undefined field is detected in AcceptBatonHandler");
			sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		var procedure = 'sea_LoadUser';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			var receiver_id;
		
			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			var sender_id;
			receiver_id = res;

			procedure = 'sea_LoadUser';
			params = "'" + msg['sender_k_id'] + "'";
			mysql.call(procedure, params, function (results, fields) {
				res = results[0][0]['res'];

				if (res <= 0) {
					logMgr.addLog('ERROR', 'Invalid account (' + msg['sender_k_id'] + ')');
					sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
					write(response, toStream(sysMsg));
					return ;
				}

				sender_id = res;
				procedure = 'sea_ExistBaton';
				params = sender_id + ', ' + receiver_id + ', ' + msg['sended_time'];

				mysql.call(procedure, params, function (results, fields) {
					res = results[0][0]['res'];

					if (res) {
						procedure = 'sea_startgame';
						params = receiver_id;

						mysql.call(procedure, params, function (results, fields) {
							res = results[0][0];
							var character = res['selected_character'];

							if (character != msg['selected_character']) {
								logMgr.addLog('error', "Doesn't match with db (" + character + ": " + msg['selected_character'] + ")" ); 
								sysMsg['res'] = build.Result['NO_MATCH_WITH_DB'];
								write(response, toStream(sysMsg));
							} else {
								write(response, toStream(rMsg));
							}
						});
					} else {
						logMgr.addLog('ERROR', 'Invalid baton (sed:' + sender_id + ', rec:' + receiver_id + ', time: ' + msg['sended_time'] + ')');
						sysMsg['res'] = build.Result['INVALID_BATON'];
						write(response, toStream(sysMsg));
					}
				});
			});
		});
	});
} // end AcceptBatonHandler

function EndBatonHandler(response, data, session_id, logMgr){
	var msg = build.EndBaton.decode(data);
	var rMsg = new build.BatonResult();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res !== true) {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', "Undefined field is detected in EndBatonHandler");
			sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		var procedure = 'sea_LoadUser';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			var receiver_id;

			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			procedure = 'sea_LoadUser';
			params = "'" + msg['sender_k_id'] + "'";
			receiver_id = res;			
			var sender_id;

			mysql.call(procedure, params, function (results, fields) {
				res = results[0][0]['res'];
				sender_id = res;
				
				if (res <= 0) {
					logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
					sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
					write(response, toStream(sysMsg));
					return ;
				}

				procedure = 'sea_LoadBatonScore';
				params = sender_id + ', ' + receiver_id + ', ' + msg['sended_time'];

				mysql.call(procedure, params, function (results, fields) {
					var score;
					res = results[0][0]['score'];

					if (res === -1) {
						logMgr.addLog('ERROR', 'Invalid baton (sed:' + sender_id + ', rec:' + receiver_id + ', time: ' + msg['sended_time'] + ')');
						sysMsg['res'] = build.Result['INVALID_BATON'];
						write(response, toStream(sysMsg));
						return ;
					} else {
						score = res;
						procedure = 'sea_LoadCoin';
						params = receiver_id;

						mysql.call(procedure, params, function (results, fields) {
							coin = results[0][0]['coin'];
							
							var finalScore = msg['score'] + score;

							rMsg['coin'] = msg['coin'];
							rMsg['total_coin'] = msg['coin'] + coin;

							procedure = 'sea_LoadHighestScore';
							params = sender_id;
							mysql.call(procedure, params, function (results, fields) {
								res = results[0][0]['res'];

								if (finalScore <= res) {
									rMsg['update'] = build.Update['FAIL'];										
								} else {
									rMsg['update'] = build.Update['SUCCESS'];
								}

								write(response, toStream(rMsg));							
							});

							procedure = 'sea_UpdateCoin';
							params = receiver_id + ', ' + rMsg['total_coin'];
							mysql.call(procedure, params, function (results, fields) {});

							procedure = 'sea_AddBatonResult';
							params = receiver_id + ', ' +  sender_id + ', ' + finalScore;
							mysql.call(procedure, params, function (results, fields) {});

							procedure = 'sea_DeleteBaton';
							params = sender_id + ', ' + receiver_id + ', ' + msg['sended_time'];
							mysql.call(procedure, params, function (results, fields) {});
							
							procedure = 'sea_LoadItems';
							params = receiver_id;
							mysql.call(procedure, params, function (results, fields) {
								res = results[0][0];

								if (res['shield'] > 0) {
									procedure = 'sea_UpdateShield';
									params = id + ', ' + -1;
									mysql.call(procedure, params, function(results, fields) {});
								}

								if (res['ghost'] > 0) {
									procedure = 'sea_UpdateGhost';
									params = id + ', ' + -1;
									mysql.call(procedure, params, function(results, fields) {});
								}

								if (res['weapon_reinforce'] > 0) {
									procedure = 'sea_UpdateWeaponReinforce';
									params = id + ', ' + -1;
									mysql.call(procedure, params, function(results, fields) {});
								}

								if (res['exp_boost'] > 0) {
									procedure = 'sea_UpdateExpBoost';
									params = id + ', ' + -1;
									mysql.call(procedure, params, function(results, fields) {});
								}

								if (res['item_last'] > 0) {
									procedure = 'sea_UpdateItemLast';
									params = id + ', ' + -1;
									mysql.call(procedure, params, function(results, fields) {});
								}

								if (res['max_attack'] > 0) {
									procedure = 'sea_UpdateMaxAttack';
									params = id + ', ' + -1;
									mysql.call(procedure, params, function(results, fields) {});
								}

								if (res['bonus_heart'] > 0) {
									procedure = 'sea_UpdateBonusHeart';
									params = id + ', ' + -1;
									mysql.call(procedure, params, function(results, fields) {});
								}

								if (res['drop_up'] > 0) {
									procedure = 'sea_UpdateDropUp';
									params = id + ', ' + -1;
									mysql.call(procedure, params, function(results, fields) {});
								}

								if (res['magnet'] > 0) {
									procedure = 'sea_UpdateMagnet';
									params = id + ', ' + -1;
									mysql.call(procedure, params, function(results, fields) {});
								}

								if (res['bonus_score'] > 0) {
									procedure = 'sea_UpdateBonusScore';
									params = id + ', ' + -1;
									mysql.call(procedure, params, function(results, fields) {});
								}
							});
						});
					}
				});
			});
		});
	});
} // end EndBatonHandler

function AcceptBatonResultHandler(response, data, session_id, logMgr){
	var msg = build.AcceptBatonResult.decode(data);
	var rMsg = new build.AcceptBatonResultReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res !== true) {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', "Undefined field is detected in EndBatonHandler");
			sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		var procedure = 'sea_LoadUser';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			var receiver_id;

			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			procedure = 'sea_LoadUser';
			params = "'" + msg['sender_k_id'] + "'";
			receiver_id = res;			
			var sender_id;

			mysql.call(procedure, params, function (results, fields) {
				res = results[0][0]['res'];
				sender_id = res;
				
				if (res <= 0) {
					logMgr.addLog('ERROR', 'Invalid account (' + msg['sender_k_id'] + ')');
					sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
					write(response, toStream(sysMsg));
					return ;
				}

				procedure = 'sea_LoadBatonResultScore';
				params = sender_id + ', ' + receiver_id + ', ' + msg['sended_time'];

				mysql.call(procedure, params, function (results, fields) {
					res = results[0][0]['score'];

					if (res === -1 ) {
						logMgr.addLog('ERROR', 'Invalid baton result (sed:' + sender_id + ', rec:' + receiver_id + ', time: ' + msg['sended_time'] + ')');
						sysMsg['res'] = build.Result['INVALID_BATON_RESULT'];
						write(response, toStream(sysMsg));
						return ;
					} else {
						var score = res;

						procedure = 'sea_LoadHighestScore';
						params = sender_id;
						mysql.call(procedure, params, function (results, fields) {
							res = results[0][0]['res'];

							if (score <= res) {
								rMsg['update'] = build.Update['FAIL'];
								rMsg['score'] = res;
							} else {
								rMsg['update'] = build.Update['SUCCESS'];
								rMsg['score'] = score;

								procedure = 'sea_UpdateUserLog';
								params = receiver_id + ', ' + score + ', ' + 0 + ', ' + 0;
								mysql.call(procedure, params, function (results, fields) {});
							}

							write(response, toStream(rMsg));							
						});

						procedure = 'sea_DeleteBatonResult';
						params = sender_id + ', ' + receiver_id + ', ' + msg['sended_time'];
						mysql.call(procedure, params, function (results, fields) {});
					}
				});
			});
		});
	});
} // end AcceptBatonResultHandler

function UpgradeScoreFactorHandler(response, data, session_id, logMgr){
	var msg = build.UpgradeScoreFactor.decode(data);
	var rMsg = new build.UpgradeReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res !== true) {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', "Undefined field is detected in UpgradeScoreFactorHandler");
			sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		var procedure = 'sea_LoadUser';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];		
			
			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			var id = res;
			procedure = 'sea_LoadUpgradeInfo';
			params = id;

			mysql.call(procedure, params, function (results, fields) {
				var scoreFactor = results[0][0]['score_factor'];

				if (scoreFactor > 19) {
					logMgr.addLog('ERROR', "score_factor is fully upgraded. (" + msg['k_id'] + ")");
					sysMsg['res'] = build.Result['FULLY_UPGRADED'];
					write(response, toStream(sysMsg));
				} else if (scoreFactor < 0) {
					logMgr.addLog('ERROR', "Upgrade value can't not be less than 0.(" + msg['k_id'] + ")");
					sysMsg['res'] = build.Result['NO_MATCH_WITH_DB'];
					write(response, toStream(sysMsg));
				} else {
					procedure = 'sea_LoadCoin';
					params = id;

					mysql.call(procedure, params, function (results, fields) {
						var coin = results[0][0]['coin'];
						var score_factor = require('../data/upgrade-data').score_factor;
						var cost = score_factor[scoreFactor];

						if (cost < coin) {
							coin -= cost;

							procedure = 'sea_UpgradeScoreFactor';
							params = id;

							mysql.call(procedure, params, function (results, fields) {
								res = results[0][0]['res'];

								if (res === scoreFactor + 1) {
									procedure = 'sea_UpdateCoin';
									params = id + ', ' + coin;
									
									mysql.call(procedure, params, function (results, fields) {});

									procedure = 'sea_LoadMileageAndDraw';
									params = id;

									mysql.call(procedure, params, function (results, fields) {
										var _res = results[0][0];
										var _mileage = _res['mileage'] + 15;
										var _draw = _res['draw'];

										if (_mileage >= 100) {
											++_draw;

											procedure = 'sea_UpdateDraw';
											params = id + ', ' + _draw;

											mysql.call(procedure, params, function (results, fields) {});
										}

										procedure = 'sea_UpdateMileage';
										params = id + ', ' + _mileage;

										mysql.call(procedure, params, function (results, fields) {});

										rMsg['mileage'] = _mileage;
										rMsg['draw'] = _draw;
										rMsg['coin'] = coin;
										write(response, toStream(rMsg));
									});
								} else {
									logMgr.addLog('ERROR', "Failed to upgrade scoreFactor on DB(" + msg['k_id'] + ', ' + bonusScore + ")");
									sysMsg['res'] = build.Result['FAILED_DB_UPDATE'];
									write(response, toStream(sysMsg));
								}
							});
						} else {
							logMgr.addLog('SYSTEM', 'Not enough coin (' + msg['k_id'] + ')');
							sysMsg['res'] = build.Result['NOT_ENOUGH_COIN'];
							write(response, toStream(sysMsg));
							return ;
						}
					});
				}
			});
		});
	});
} // end UpgradeScoreFactorHandler

function UpgradeTimeFactorHandler(response, data, session_id, logMgr){
	var msg = build.UpgradeTimeFactor.decode(data);
	var rMsg = new build.UpgradeReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res !== true) {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', "Undefined field is detected in UpgradeTimeFactorHandler");
			sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		var procedure = 'sea_LoadUser';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];		
			
			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			var id = res;
			procedure = 'sea_LoadUpgradeInfo';
			params = id;

			mysql.call(procedure, params, function (results, fields) {
				var timeFactor = results[0][0]['time_factor'];
				if (timeFactor > 19) {
					logMgr.addLog('ERROR', "timeFactor is fully upgraded. (" + msg['k_id'] + ")");
					sysMsg['res'] = build.Result['FULLY_UPGRADED'];
					write(response, toStream(sysMsg));
				} else if (timeFactor < 0) {
					logMgr.addLog('ERROR', "Upgrade value can't not be less than 0.(" + msg['k_id'] + ")");
					sysMsg['res'] = build.Result['NO_MATCH_WITH_DB'];
					write(response, toStream(sysMsg));
				} else {
					procedure = 'sea_LoadCoin';
					params = id;

					mysql.call(procedure, params, function (results, fields) {
						var coin = results[0][0]['coin'];
						var time_factor = require('../data/upgrade-data').time_factor;
						var cost = time_factor[timeFactor];

						if (cost < coin) {								
							coin -= cost;

							procedure = 'sea_UpgradeTimeFactor';
							params = id;

							mysql.call(procedure, params, function (results, fields) {
								res = results[0][0]['res'];

								if (res === timeFactor + 1) {
									procedure = 'sea_UpdateCoin';
									params = id + ', ' + coin;
									
									mysql.call(procedure, params, function (results, fields) {});

									procedure = 'sea_LoadMileageAndDraw';
									params = id;

									mysql.call(procedure, params, function (results, fields) {
										var _res = results[0][0];
										var _mileage = _res['mileage'] + 15;
										var _draw = _res['draw'];

										if (_mileage >= 100) {
											++_draw;

											procedure = 'sea_UpdateDraw';
											params = id + ', ' + _draw;

											mysql.call(procedure, params, function (results, fields) {});
										}

										procedure = 'sea_UpdateMileage';
										params = id + ', ' + _mileage;

										mysql.call(procedure, params, function (results, fields) {});

										rMsg['mileage'] = _mileage;
										rMsg['draw'] = _draw;
										rMsg['coin'] = coin;
										write(response, toStream(rMsg));
									});
								} else {
									logMgr.addLog('ERROR', "Failed to upgrade timeFactor on DB(" + msg['k_id'] + ', ' + timeFactor + ")");
									sysMsg['res'] = build.Result['FAILED_DB_UPDATE'];
									write(response, toStream(sysMsg));
								}
							});
						} else {
							logMgr.addLog('SYSTEM', 'Not enough coin (' + msg['k_id'] + ')');
							sysMsg['res'] = build.Result['NOT_ENOUGH_COIN'];
							write(response, toStream(sysMsg));
						}
					});
				}
			});
		});
	});
} // end UpgradeTimeFactorHandler

function UpgradeCooldownFactorHandler(response, data, session_id, logMgr){
	var msg = build.UpgradeCooldownFactor.decode(data);
	var rMsg = new build.UpgradeReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res !== true) {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', "Undefined field is detected in UpgradeCooldownHandler");
			sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		var procedure = 'sea_LoadUser';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];		
			
			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			var id = res;
			procedure = 'sea_LoadUpgradeInfo';
			params = id;

			mysql.call(procedure, params, function (results, fields) {
				var cooldownFactor = results[0][0]['cooldownFactor'];

				if (cooldownFactor > 19) {
					logMgr.addLog('ERROR', "cooldownFactor is fully upgraded. (" + msg['k_id'] + ")");
					sysMsg['res'] = build.Result['FULLY_UPGRADED'];
					write(response, toStream(sysMsg));
				} else if (cooldownFactor < 0) {
					logMgr.addLog('ERROR', "Upgrade value can't not be less than 0.(" + msg['k_id'] + ")");
					sysMsg['res'] = build.Result['NO_MATCH_WITH_DB'];
					write(response, toStream(sysMsg));
				} else {
					procedure = 'sea_LoadCoin';
					params = id;

					mysql.call(procedure, params, function (results, fields) {
						var coin = results[0][0]['coin'];
						var cooldown_factor = require('../data/upgrade-data').cooldown_factor;
						var cost = cooldown_factor[cooldownFactor];

						if (cost < coin) {								
							coin -= cost;

							procedure = 'sea_UpgradeCooldownFactor';
							params = id;

							mysql.call(procedure, params, function (results, fields) {
								res = results[0][0]['res'];

								if (res === cooldown + 1) {
									procedure = 'sea_UpdateCoin';
									params = id + ', ' + coin;
									
									mysql.call(procedure, params, function (results, fields) {});

									procedure = 'sea_LoadMileageAndDraw';
									params = id;

									mysql.call(procedure, params, function (results, fields) {
										var _res = results[0][0];
										var _mileage = _res['mileage'] + 15;
										var _draw = _res['draw'];

										if (_mileage >= 100) {
											++_draw;

											procedure = 'sea_UpdateDraw';
											params = id + ', ' + _draw;

											mysql.call(procedure, params, function (results, fields) {});
										}

										procedure = 'sea_UpdateMileage';
										params = id + ', ' + _mileage;

										mysql.call(procedure, params, function (results, fields) {});

										rMsg['mileage'] = _mileage;
										rMsg['draw'] = _draw;
										rMsg['coin'] = coin;
										write(response, toStream(rMsg));
									});
								} else {
									logMgr.addLog('ERROR', "Failed to upgrade cooldownFactor on DB(" + msg['k_id'] + ', ' + cooldownFactor + ")");
									sysMsg['res'] = build.Result['FAILED_DB_UPDATE'];
									write(response, toStream(sysMsg));
								}
							});
						} else {
							logMgr.addLog('SYSTEM', 'Not enough coin (' + msg['k_id'] + ')');
							sysMsg['res'] = build.Result['NOT_ENOUGH_COIN'];
							write(response, toStream(sysMsg));
						}
					});
				}
			});
		});
	});
} // end UpgradeCooldownFactorHandler

function InviteFriendHandler(response, data, session_id, logMgr){
	var msg = build.InviteFriend.decode(data);
	var rMsg = new build.InviteFriendReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res !== true) {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', "Undefined field is detected in InviteFriendHandler");
			sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		var procedure = 'sea_LoadUser';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];		
			
			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			var id = res;
			procedure = 'sea_LoadInviteCountWithMileageAndDraw';
			params = id;

			mysql.call(procedure, params, function (results, fields) {
				var _res = results[0][0];
				var _invite = _res['invite_count'] + 1;
				var _mileage = _res['mileage'] + 5;
				var _draw = _res['draw'];

				procedure = 'sea_UpdateInviteCount';
				params = id + ', ' + _invite;

				mysql.call(procedure, params, function (results, fields) {
					rMsg['invite_count'] = _invite;

					if (_mileage >= 100) {
						++_draw;

						procedure = 'sea_UpdateDraw';
						params = id + ', ' + _draw;

						mysql.call(procedure, params, function (results, fields) {});
					}

					procedure = 'sea_UpdateMileage';
					params = id + ', ' + _mileage;

					mysql.call(procedure, params, function (results, fields) {});

					rMsg['mileage'] = _mileage;
					rMsg['draw'] = _draw;

					// TODO
					if (_invite === 10) {

					} else if (_invite === 15) {

					} else if (_invite === 30) {

					}

					write(response, toStream(rMsg));
				});
			});
		});
	});
} // end InviteFriendHandler

function LoadRewardHandler(response, data, session_id, logMgr){
	var msg = build.LoadReward.decode(data);
} // end LoadRewardHandler

exports.VersionInfoHandler = VersionInfoHandler;
exports.RegisterAccountHandler = RegisterAccountHandler;
exports.UnregisterAccountHandler = UnregisterAccountHandler;
exports.LoginHandler = LoginHandler;
exports.LogoutHandler = LogoutHandler;
exports.CheckInChargeHandler = CheckInChargeHandler;
exports.SelectCharacterHandler = SelectCharacterHandler;
exports.StartGameHandler = StartGameHandler;
exports.EndGameHandler = EndGameHandler;
exports.LoadRankInfoHandler = LoadRankInfoHandler;
exports.LoadPostedEnergyHandler = LoadPostedEnergyHandler;
exports.LoadPostedBatonHandler = LoadPostedBatonHandler;
exports.LoadPostedBatonResultHandler = LoadPostedBatonResultHandler;
exports.RequestPointRewardHandler = RequestPointRewardHandler;
exports.BuyItemHandler = BuyItemHandler;
exports.BuyOrUpgradeCharacterHandler = BuyOrUpgradeCharacterHandler;
exports.SendEnergyHandler = SendEnergyHandler;
exports.AcceptEnergyHandler = AcceptEnergyHandler;
exports.RequestBatonHandler = RequestBatonHandler;
exports.AcceptBatonHandler = AcceptBatonHandler;
exports.EndBatonHandler = EndBatonHandler;
exports.AcceptBatonResultHandler = AcceptBatonResultHandler;
exports.UpgradeScoreFactorHandler = UpgradeScoreFactorHandler;
exports.UpgradeTimeFactorHandler = UpgradeTimeFactorHandler;
exports.UpgradeCooldownFactorHandler = UpgradeCooldownFactorHandler;
exports.InviteFriendHandler = InviteFriendHandler;
exports.LoadRewardHandler = LoadRewardHandler;
