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
var logMgr = require('./c2g-index').server.logMgr;

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

function VersionInfoHandler(response, data, session_id){
	var msg = build.VersionInfo.decode(data);
	var rMsg = new build.VersionInfoReply();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in VersionInfoHandler");
		sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
		write(response, toStream(sysMsg));
	} else {
		// FIXME
		rMsg['version'] = msg['version'];
		write(response, toStream(rMsg));
	}
} // end VersionInfoHandler

function RegisterAccountHandler(response, data, session_id){
	var msg = build.RegisterAccount.decode(data);
	var rMsg = new build.RegisterAccountReply();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in RegisterAccountHandler");
		sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
		write(response, toStream(sysMsg));
	} else {
		var procedure = 'sea_CreateUser';
		var params = "'" + msg['k_id'] + "'";
		
		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];

			if (res === 0) {
				logMgr.addLog('ERROR', 'Already exsisting account : ' + msg['k_id']);
				sysMsg['res'] = build.Result['EXISTED_ACCOUNT'];
				write(response, toStream(sysMsg));
			} else {
				write(response, toStream(rMsg));

				var UserRegister = build.UserRegister;
				var req = new UserRegister();
				req['k_id'] = msg['k_id'];

				request(req);
			}		
		});
	}
} // end RegisterAccountHandler

function UnregisterAccountHandler(response, data, session_id){
	var msg = build.UnregisterAccount.decode(data);
	var sysMsg = new build.SystemMessage();
	
	session.toAuthUnregisterSession(msg['k_id'], session_id, function (res) {
		if (res === true) {
			if (inspectField(msg) === false) {
				logMgr.addLog('ERROR', "Undefined field is detected in UnregisterAccountHandler");
				sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
				write(response, toStream(sysMsg));
			} else {
				var procedure = 'sea_LoadUser';
				var params = "'" + msg['k_id'] + "'";

				mysql.call(procedure, params, function (results, fields) {
					var res = results[0][0]['res'];

					if (res > 0) {
						procedure = 'sea_DeleteUser';
						params = res;
						mysql.call(procedure, params, function (results, fields) {});
						logMgr.addLog('SYSTEM', 'UnregisterAccount : ' + msg['k_id']);
						
						var UserUnregister = build.UserUnregister;
						var req = new UserUnregister();
						req['k_id'] = msg['k_id'];

						request(req);
						write(response, toStream(rMsg));
					} else {			
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						logMgr.addLog('ERROR', 'Unregister Invalid Account : ' + msg['k_id'] + ', ' + res);
						write(response, toStream(sysMsg));
					}
				});
			}
		} else {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
		}
	});
} // end UnregisterAccountHandler

function LoginHandler(response, data, session_id){
	var msg = build.Login.decode(data);
	var rMsg = new build.AccountInfo();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', "Undefined field is detected in LoginHandler");
		sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
		write(response, toStream(sysMsg));
	} else {	
		var procedure = 'sea_LoadUser';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];
			var id = res;

			if (res > 0) {
				procedure = 'sea_IsBlack';
				params = "'" + msg['k_id'] + "'";
				mysql.call(procedure, params, function (results, fields) {
					res = results[0][0]['res'];

					if (res) {
						logMgr.addLog('SYSTEM', 'blocked account access : (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['BLOCKED_ACCOUNT'];
						write(response, toStream(sysMsg));
					} else {			
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
									rMsg['honey'] = _res['honey'];
									rMsg['last_charged_time'] = _res['last_charged_time'];
									rMsg['selected_character'] = _res['selected_character'];
									rMsg['selected_assistant'] = _res['selected_assistant'];

									// character
									if (_res['character_one'] > 0) {	
										rMsg['characters'].push({'id':build.AccountInfo.ID['ONE'], 'upgraded':_res['character_one']}); 
									}
									if (_res['character_two'] > 0) {	
										rMsg['characters'].push({'id':build.AccountInfo.ID['TWO'], 'upgraded':_res['character_two']}); 
									}
									if (_res['character_three'] > 0) { 
										rMsg['characters'].push({'id':build.AccountInfo.ID['THREE'], 'upgraded':_res['character_three']});
									}
									if (_res['character_four'] > 0) { 
										rMsg['characters'].push({'id':build.AccountInfo.ID['FOUR'], 'upgraded':_res['character_four']}); 
									}
									if (_res['character_five'] > 0) { 
										rMsg['characters'].push({'id':build.AccountInfo.ID['FIVE'], 'upgraded':_res['character_five']}); 
									}
									if (_res['character_six'] > 0) {	
										rMsg['characters'].push({'id':build.AccountInfo.ID['SIX'], 'upgraded':_res['character_six']}); 
									}
									if (_res['character_seven'] > 0) { 
										rMsg['characters'].push({'id':build.AccountInfo.ID['SEVEN'], 'upgraded':_res['character_seven']});
									}
									if (_res['character_eight'] > 0) { 
										rMsg['characters'].push({'id':build.AccountInfo.ID['EIGHT'], 'upgraded':_res['character_eight']});
									}
									if (_res['character_nine'] > 0) { 
										rMsg['characters'].push({'id':build.AccountInfo.ID['NINE'], 'upgraded':_res['character_nine']}); 
									}
									if (_res['character_ten'] > 0) {	
										rMsg['characters'].push({'id':build.AccountInfo.ID['TEN'], 'upgraded':_res['character_ten']}); 
									}

									// assistant
									if (_res['assistant_one'] > 0) {	
										rMsg['assistants'].push({'id':build.AccountInfo.ID['ONE'], 'upgraded':_res['assistant_one']}); 
									}
									if (_res['assistant_two'] > 0) {	
										rMsg['assistants'].push({'id':build.AccountInfo.ID['TWO'], 'upgraded':_res['assistant_two']}); 
									}
									if (_res['assistant_three'] > 0) { 
										rMsg['assistants'].push({'id':build.AccountInfo.ID['THREE'], 'upgraded':_res['assistant_three']});
									}
									if (_res['assistant_four'] > 0) { 
										rMsg['assistants'].push({'id':build.AccountInfo.ID['FOUR'], 'upgraded':_res['assistant_four']}); 
									}
									if (_res['assistant_five'] > 0) { 
										rMsg['assistants'].push({'id':build.AccountInfo.ID['FIVE'], 'upgraded':_res['assistant_five']}); 
									}
									if (_res['assistant_six'] > 0) {	
										rMsg['assistants'].push({'id':build.AccountInfo.ID['SIX'], 'upgraded':_res['assistant_six']}); 
									}
									if (_res['assistant_seven'] > 0) { 
										rMsg['assistants'].push({'id':build.AccountInfo.ID['SEVEN'], 'upgraded':_res['assistant_seven']});
									}
									if (_res['assistant_eight'] > 0) { 
										rMsg['assistants'].push({'id':build.AccountInfo.ID['EIGHT'], 'upgraded':_res['assistant_eight']});
									}
									if (_res['assistant_nine'] > 0) { 
										rMsg['assistants'].push({'id':build.AccountInfo.ID['NINE'], 'upgraded':_res['assistant_nine']}); 
									}
									if (_res['assistant_ten'] > 0) {	
										rMsg['assistants'].push({'id':build.AccountInfo.ID['TEN'], 'upgraded':_res['assistant_ten']}); 
									}

									// upgrade
									rMsg['honey_score'] = _res['honey_score'];
									rMsg['honey_time'] = _res['honey_time'];
									rMsg['cooldown'] = _res['cooldown'];

									// item
									rMsg['exp_boost'] = _res['exp_boost'];
									rMsg['item_last'] = _res['item_last'];
									rMsg['max_attack'] = _res['max_attack'];
									rMsg['random'] = _res['random'];
									
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
								}
							});
						});

						var AccountLogin = build.AccountLogin;
						var req = new AccountLogin();
						req['k_id'] = msg['k_id'];

						request(req);
					} // end if else
				}); // end mysql.call();
			} else {
				logMgr.addLog('SYSTEM', 'Invalid account (res : ' + res + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
			}
		}); // end mysql.call()
	}
} // end LoginHandler

function LogoutHandler(response, data, session_id){
	var msg = build.Logout.decode(data);
	var sysMsg = new build.SystemMessage();
	var rMsg = new build.LogoutReply();

	session.toAuthUnregisterSession(msg['k_id'], session_id, function (res) {
		if (res === true){
			if (inspectField(msg) === false) {
				logMgr.addLog('ERROR', "Undefined field is detected in LogoutHandler");
				sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
				write(response, toStream(sysMsg));
			} else {
				var procedure = 'sea_LoadUser';
				var params = "'" + msg['k_id'] + "'";

				mysql.call(procedure, params, function (results, fields) {
					var res = results[0][0]['res'];

					if (res > 0) {
						logMgr.addLog('SYSTEM', 'logout : ' + msg['k_id']);
						write(response, toStream(rMsg));
					} else {			
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						logMgr.addLog('ERROR', 'logoutHandle failed : ' + msg['k_id'] + ', ' + res);
						write(response, toStream(sysMsg));
					}
				});
			}
		} else {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
		}
	});
} // end LogoutHandler

function CheckInChargeHandler(response, data, session_id){
	var msg = build.CheckInCharge.decode(data);
	var rMsg = new build.ChargeInfo();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res === true) {
			if (inspectField(msg) === false) {
				logMgr.addLog('ERROR', "Undefined field is detected in CheckInChargeHandler");
				sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
				write(response, toStream(sysMsg));
			} else {
				var procedure = 'sea_LoadUser';
				var params = "'" + msg['k_id'] + "'";

				mysql.call(procedure, params, function (results, fields) {
					var res = results[0][0]['res'];
					var id;

					if (res > 0) {
						id = res;
						procedure = 'sea_CheckInCharge';
						params = id;

						mysql.call(procedure, params, function (results, fields) {
							res = results[0][0];
							var last = res['last_charged_time'];
							var honey = res['honey'];
							var honeyMax = 99;
							var now = new Date().getTime();
							now = convertMS2S(now);

							if (honeyMax === honey) {
								procedure = 'sea_UpdateLastChargeTime';
								params = id + ', ' + now;
								rMsg['honey'] = honeyMax;
								rMsg['last_charged_time'] = now;

								mysql.call(procedure, params, function (results, fields) {
									write(response, toStream(rMsg));
								});
							} else {
								var diff = now - last;
								var quotient = diff / 600;
								var uptodate = last + (600 * quotient);

								if (quotient) {
									honey += quotient;
									if (honey >= honeyMax) {
										honey = honeyMax;
									}						
									procedure = 'sea_UpdateLastChargeTime';
									params = id + ', ' + uptodate;
									rMsg['honey'] = honey;
									rMsg['last_charged_time'] = uptodate;
								
									mysql.call(procedure, params, function (results, fields) {
										procedure = 'sea_UpdateHoney';
										params = id + ', ' + honey;

										mysql.call(procedure, params, function (results, fields) {
											write(response, toStream(rMsg));
										});
									});
								} else {
									if (honey === 0) {
										rMsg['honey'] = ChargeInfo.Pack['ZERO'];
									} else {
										rMsg['honey'] = honey;
									}
									
									rMsg['last_charged_time'] = last;
									write(response, toStream(rMsg));
								} // end else
							} // end else
						}); // end mysql.call()
					} else {
						logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				}); // end mysql.call()
			}
		} else {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
		}
	});
} // end CheckInChargeHandler

function SelectCharacterHandler(response, data, session_id){
	var msg = build.SelectCharacter.decode(data);
	var rMsg = new build.SelectCharacterReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res === true) {
			if (inspectField(msg) === false) {
				logMgr.addLog('ERROR', "Undefined field is detected in SelectCharacterHandler");
				sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
				write(response, toStream(sysMsg));
			} else {
				var procedure = 'sea_LoadUser';
				var params = "'" + msg['k_id'] + "'";

				mysql.call(procedure, params, function (results, fields) {
					var res = results[0][0]['res'];
					var id;

					if (res > 0) {
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
							
							if (selected === 1 && res['character_one']) {
								write(response, toStream(rMsg));
							} else if (selected === 2 && res['character_two']) {
								write(response, toStream(rMsg));
							} else if (selected === 3 && res['character_three']) {
								write(response, toStream(rMsg));
							} else if (selected === 4 && res['character_four']) {
								write(response, toStream(rMsg));
							} else if (selected === 5 && res['character_five']) {
								write(response, toStream(rMsg));
							} else if (selected === 6 && res['character_six']) {
								write(response, toStream(rMsg));
							} else if (selected === 7 && res['character_seven']) {
								write(response, toStream(rMsg));
							} else if (selected === 8 && res['character_eight']) {
								write(response, toStream(rMsg));
							} else if (selected === 9 && res['character_nine']) {
								write(response, toStream(rMsg));
							} else if (selected === 10 && res['character_ten']) {
								write(response, toStream(rMsg));
							} else {
								logMgr.addLog('ERROR', 'Invalid character (' + msg['k_id'] + ', ' + 'character : ' + msg['selected_character'] + ')');
								sysMsg['res'] = build.Result['INVALID_CHARACTER'];
								write(response, toStream(sysMsg));				
							}
						});
					} else {
						logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				});
			}
		} else {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
		}
	});
} // end SelectCharacterHandler

function SelectAssistantHandler(response, data, session_id){
	var msg = build.SelectAssistant.decode(data);
	var rMsg = new build.SelectAssistantReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res === true) {
			if (inspectField(msg) === false) {
				logMgr.addLog('ERROR', "Undefined field is detected in SelectAssistantHandler");
				sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
				write(response, toStream(sysMsg));
			} else {
				var procedure = 'sea_LoadUser';
				var params = "'" + msg['k_id'] + "'";

				mysql.call(procedure, params, function (results, fields) {
					var res = results[0][0]['res'];
					var id;

					if (res > 0) {
						id = res;
						procedure = 'sea_SelectUserAssistant';
						params = res;

						mysql.call(procedure, params, function (results, fields) {
							res = results[0][0];
							var selected = msg['selected_assistant'];

							if (selected < 0 || selected > 10) {
								logMgr.addLog('ERROR', 'Assistant Range Over (' + msg['k_id'] + ', ' + 'assistant : ' + msg['selected_assistant'] + ')');
								sysMsg['res'] = build.Result['INVALID_ASSISTANT'];
								write(response, toStream(sysMsg));
								return;
							}
							
							if (selected === 1 && res['assistant_one']) {
								write(response, toStream(rMsg));
							} else if (selected === 2 && res['assistant_two']) {
								write(response, toStream(rMsg));
							} else if (selected === 3 && res['assistant_three']) {
								write(response, toStream(rMsg));
							} else if (selected === 4 && res['assistant_four']) {
								write(response, toStream(rMsg));
							} else if (selected === 5 && res['assistant_five']) {
								write(response, toStream(rMsg));
							} else if (selected === 6 && res['assistant_six']) {
								write(response, toStream(rMsg));
							} else if (selected === 7 && res['assistant_seven']) {
								write(response, toStream(rMsg));
							} else if (selected === 8 && res['assistant_eight']) {
								write(response, toStream(rMsg));
							} else if (selected === 9 && res['assistant_nine']) {
								write(response, toStream(rMsg));
							} else if (selected === 10 && res['assistant_ten']) {
								write(response, toStream(rMsg));
							} else {
								logMgr.addLog('ERROR', 'Invalid assistant (' + msg['k_id'] + ', ' + 'assistant : ' + msg['selected_assistant'] + ')');
								sysMsg['res'] = build.Result['INVALID_ASSISTANT'];
								write(response, toStream(sysMsg));				
							}
						});
					}
					else {
						logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				});
			}
		} else {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
		}
	});
} // end SelectAssistantHandler

function StartGameHandler(response, data, session_id){
	var msg = build.StartGame.decode(data);
	var rMsg = new build.StartGameReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res === true) {
			if (inspectField(msg) === false) {
				logMgr.addLog('ERROR', "Undefined field is detected in StartGameHandler");
				sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
				write(response, toStream(sysMsg));
			} else {
				var procedure = 'sea_LoadUser';
				var params = "'" + msg['k_id'] + "'";

				var honeyMax = 99;

				mysql.call(procedure, params, function (results, fields) {
					var res = results[0][0]['res'];
					var id;

					if (res > 0) {
						id = res;
						procedure = 'sea_startgame';
						params = id;

						mysql.call(procedure, params, function (results, fields) {
							res = results[0][0];
							var reqassistant = msg['selected_assistant'];
							var character = res['selected_character'];
							var assistant = res['selected_assistant'];
							var honey = res['honey'];
							var last = res['last_charged_time'];

							if (honey < 1) {
								logMgr.addLog('system', 'Not enough honey : ' + rMsg['k_id']);
								sysMsg['res'] = build.Result['NOT_ENOUGH_HONEY'];
								write(response, toStream(sysMsg));
							} else if (character != msg['selected_character'] || assistant != reqassistant) {
								logMgr.addLog('error', "Doesn't match with db (" + character + ": " + msg['selected_character'] + ", " + assistant + ": " + reqassistant + ")" ); 
								sysMsg['res'] = build.Result['NO_MATCH_WITH_DB'];
								write(response, toStream(sysMsg));
							} else {
								if (honey == honeyMax) {
									last = new Date().getTime();	
									last = convertMS2S(last);
								}
								honey -= 1;

								rMsg['honey'] = honey;

								procedure = 'sea_UpdateLastChargeTime';
								params = id + ', ' + last;					
								rMsg['last_charged_time'] = last;
							
								mysql.call(procedure, params, function (results, fields) {
									procedure = 'sea_UpdateHoney';
									params = id + ', ' + honey;

									mysql.call(procedure, params, function (results, fields) {
										write(response, toStream(rMsg));
									});
								});
							}
						});
					} else {
						logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				}); // end sea_LoadUser
			}
		} else {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
		}
	});
} // end StartGameHandler

function EndGameHandler(response, data, session_id){
	var msg = build.EndGame.decode(data);
	var rMsg = new build.GameResult();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res === true) {
			if (inspectField(msg) === false) {
				logMgr.addLog('ERROR', "Undefined field is detected in EndGameHandler");
				sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
				write(response, toStream(sysMsg));
			} else {
				var procedure = 'sea_LoadUser';
				var params = "'" + msg['k_id'] + "'";

				mysql.call(procedure, params, function (results, fields) {
					var res = results[0][0]['res'];
					var id;

					if (res > 0) {
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
								req['selected_assistant'] = msg['selected_assistant'];
								req['score'] = msg['score'];
								req['enemy_kill'] = msg['enemy_kill'];
								req['dist'] = msg['dist'];
								req['play_time'] = msg['play_time'];
								req['exp_boost'] = res['exp_boost'];
								req['last_item'] = res['last_item'];
								req['max_attack'] = res['max_attack'];
								req['random'] = res['random'];

								request(req);

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

								if (res['random'] > 0) {
									procedure = 'sea_UpdateRandom';
									params = id + ', ' + 0;
									mysql.call(procedure, params, function(results, fields) {});
								}
							});
						});
					} else {
						logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				});
			}
		} else {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
		}
	});
} // end EndGameHandler

function LoadRankInfoHandler(response, data, session_id){
	var msg = build.LoadRankInfo.decode(data);
	var rMsg = new build.RankInfo();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res === true) {
			if (inspectField(msg) === false) {
				logMgr.addLog('ERROR', "Undefined field is detected in LoadRankInfoHandler");
				sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
				write(response, toStream(sysMsg));
			} else {
				var procedure = 'sea_LoadUser';
				var params = "'" + msg['k_id'] + "'";

				mysql.call(procedure, params, function (results, fields) {
					var res = results[0][0]['res'];
					var id;

					if (res > 0) {
						id = res;
						var rankingList = require('./c2g-server').rankingList;
						
						if (rankingList.length === 0|| rankingList.length === 1) {
							rMsg['overall_ranking'] = 1;
							write(response, toStream(rMsg));
						} else {
							// FIXME
							procedure = 'sea_LoadHoneyBySender';
							params = id;
							mysql.call(procedure, params, function(results, fields) {							
								res = results[0][0]['receiver_id'];

								if (res === 0) {
									for (var i = 0, l = rankingList.length; i < l; ++i) {
										var score = rankingList[i]['highest_score'];
										var honey_sended = 0;
										
										rMsg['ranking_list'].push({'k_id': rankingList[i]['k_id'], 'score': score, 'honey_sended': honey_sended});

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
												var honey_sended = 0;

												for(var val in temp) {
													if (rankingList[i]['k_id'] === temp[val]) {
														honey_sended = 1;
														break;
													}
												}
												
												rMsg['ranking_list'].push({'k_id': rankingList[i]['k_id'], 'score': score, 'honey_sended': honey_sended});

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
					} else {
						logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				});
			}
		} else {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
		}
	});
} // end LoadRankInfoHandler

function LoadPostedHoneyHandler(response, data, session_id){
	var msg = build.LoadPostedHoney.decode(data);
	var rMsg = new build.PostedHoney();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res === true) {
			if (inspectField(msg) === false) {
				logMgr.addLog('ERROR', "Undefined field is detected in LoadPostedHoneyHandler");
				sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
				write(response, toStream(sysMsg));
			} else {
				var procedure = 'sea_LoadUser';
				var params = "'" + msg['k_id'] + "'";

				mysql.call(procedure, params, function (results, fields) {
					var res = results[0][0]['res'];
					var id;
				
					if (res > 0) {
						id = res;

						procedure = 'sea_LoadHoneyByReceiver';
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
										
										rMsg['honey'].push({'sender_k_id':res, 'sended_time':list[count]['sended_time']});
										++count;
										if (count === l) {
											write(response, toStream(rMsg));
										}
									});						
								}
							}
						});
					} else {
						logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				});
			}
		} else {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
		}
	});
} // end LoadPostedHoneyHandler

function LoadPostedBatonHandler(response, data, session_id){
	var msg = build.LoadPostedBaton.decode(data);
	var rMsg = new build.PostedBaton();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res === true) {
			if (inspectField(msg) === false) {
				logMgr.addLog('ERROR', "Undefined field is detected in LoadPostedBatonHandler");
				sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
				write(response, toStream(sysMsg));
			} else {
				var procedure = 'sea_LoadUser';
				var params = "'" + msg['k_id'] + "'";

				mysql.call(procedure, params, function (results, fields) {
					var res = results[0][0]['res'];
					var id;
				
					if (res > 0) {
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
					}
					else {
						logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				});
			}
		} else {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
		}
	});
} // end LoadPostedBatonHandler

function LoadPostedBatonResultHandler(response, data, session_id){
	var msg = build.LoadPostedBatonResult.decode(data);
	var rMsg = new build.PostedBatonResult();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res === true) {
			if (inspectField(msg) === false) {
				logMgr.addLog('ERROR', "Undefined field is detected in LoadPostedBatonResultHandler");
				sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
				write(response, toStream(sysMsg));
			} else {
				var procedure = 'sea_LoadUser';
				var params = "'" + msg['k_id'] + "'";

				mysql.call(procedure, params, function (results, fields) {
					var res = results[0][0]['res'];
					var id;
				
					if (res > 0) {
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
					} else {
						logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				});
			}
		} else {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
		}
	});
} // end LoadPostedBatonResultHandler

function RequestPointRewardHandler(response, data, session_id){
	var msg = build.RequestPointReward.decode(data);
} // end RequestPointRewardHandler

function BuyItemHandler(response, data, session_id){
	var msg = build.BuyItem.decode(data);
	var BuyItemReply = build.BuyItemReply;
	var rMsg = new BuyItemReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res === true) {
			if (inspectField(msg) === false) {
				logMgr.addLog('ERROR', "Undefined field is detected in BuyItemHandler");
				sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
				write(response, toStream(sysMsg));
			} else {
				var procedure = 'sea_LoadUser';
				var params = "'" + msg['k_id'] + "'";

				mysql.call(procedure, params, function (results, fields) {
					var res = results[0][0]['res'];
					var id;

					if (res > 0) {
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
										procedure = 'sea_UpdateCoin';
										coin -= require('../data/item-data').exp_boost;
										params = id + ', ' + coin;
										mysql.call(procedure, params, function(results, fields){});

										procedure = 'sea_UpdateExpBoost';
										params = id + ', ' + 1;
										mysql.call(procedure, params, function(results, fields){});
						
										rMsg['item'] = BuyItemReply.Item['EXP_BOOST'];
										rMsg['coin'] = coin;
										write(response, toStream(rMsg));
									} else if (msg['item'] === build.BuyItem.Item['LAST_ITEM']) {								
										procedure = 'sea_UpdateCoin';
										coin -= require('../data/item-data').last_item;
										params = id + ', ' + coin;
										mysql.call(procedure, params, function(results, fields){});

										procedure = 'sea_UpdateItemLast';
										params = id + ', ' + 1;
										mysql.call(procedure, params, function(results, fields){});
						
										rMsg['item'] = BuyItemReply.Item['LAST_ITEM'];
										rMsg['coin'] = coin;
										write(response, toStream(rMsg));
									} else if (msg['item'] === build.BuyItem.Item['MAX_ATTACK']) {
										procedure = 'sea_UpdateCoin';
										coin -= require('../data/item-data').max_attack;
										params = id + ', ' + coin;
										mysql.call(procedure, params, function(results, fields){});

										procedure = 'sea_UpdateMaxAttack';
										params = id + ', ' + 1;
										mysql.call(procedure, params, function(results, fields){});
						
										rMsg['item'] = BuyItemReply.Item['MAX_ATTACK'];
										rMsg['coin'] = coin;
										write(response, toStream(rMsg));
									} else if (msg['item'] === build.BuyItem.Item['RANDOM']) {
										procedure = 'sea_UpdateCoin';
										coin -= require('../data/item-data').random;
										params = id + ', ' + coin;
										mysql.call(procedure, params, function(results, fields){});

										var random = Math.floor(Math.random() * (BuyItemReply.Item['MAX'] - BuyItemReply.Item['MAGNET'])) + BuyItemReply.Item['MAGNET'];

										procedure = 'sea_UpdateRandom';
										params = id + ', ' + random;
										mysql.call(procedure, params, function(results, fields){});
						
										rMsg['item'] = random;
										rMsg['coin'] = coin;
										write(response, toStream(rMsg));
									} else {
										_flag = false;
										logMgr.addLog('ERROR', 'Invalid request field (' + msg['k_id'] + ', ' + msg['item'] + ')');
										sysMsg['res'] = build.Result['INVALID_REQ_FIELD'];
										write(response, toStream(sysMsg));
									}

									if (_flag === true) {
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
					} else {
						logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				});
			}
		} else {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
		}
	});
} // end BuyItemHandler

function BuyOrUpgradeCharacterHandler(response, data, session_id){
	var msg = build.BuyOrUpgradeCharacter.decode(data);
	var rMsg = new build.BuyOrUpgradeCharacterReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res === true) {
			if (inspectField(msg) === false) {
				logMgr.addLog('ERROR', "Undefined field is detected in BuyOrUpgradeCharacterHandler");
				sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
				write(response, toStream(sysMsg));
			} else {
				var procedure = 'sea_LoadUser';
				var params = "'" + msg['k_id'] + "'";

				mysql.call(procedure, params, function (results, fields) {
					var res = results[0][0]['res'];		
					
					if (res > 0) {
						var id = res;
						procedure = 'sea_SelectUserCharacter';
						params = id;

						mysql.call(procedure, params, function (results, fields) {
							var character = msg['character'];

							if (character > 14 || character < 0) {
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

									if (cost < coin) {								
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
									} else {
										logMgr.addLog('SYSTEM', 'Not enough coin (' + msg['k_id'] + ')');
										sysMsg['res'] = build.Result['NOT_ENOUGH_COIN'];
										write(response, toStream(sysMsg));
									}
								});
							}
						});
					} else {
						logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				});
			}
		} else {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
		}
	});
} // end BuyOrUpgradeCharacterHandler

function BuyOrUpgradeAssistantHandler(response, data, session_id){
	var msg = build.BuyOrUpgradeAssistant.decode(data);
	var rMsg = new build.BuyOrUpgradeAssistantReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res === true) {
			if (inspectField(msg) === false) {
				logMgr.addLog('ERROR', "Undefined field is detected in BuyOrUpgradeAssistantHandler");
				sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
				write(response, toStream(sysMsg));
			} else {
				var procedure = 'sea_LoadUser';
				var params = "'" + msg['k_id'] + "'";

				mysql.call(procedure, params, function (results, fields) {
					var res = results[0][0]['res'];		
					
					if (res > 0) {
						var id = res;
						procedure = 'sea_SelectUserAssistant';
						params = id;

						mysql.call(procedure, params, function (results, fields) {
							var assistant = msg['assistant'];

							if (assistant > 14 || assistant < 0) {
								logMgr.addLog('ERROR', "Invalid assistant (" + msg['k_id'] + ", " + assistant + ")");
								sysMsg['res'] = build.Result['NO_MATHCH_WITH_DB'];
								write(response, toStream(sysMsg));

								return;
							}

							res = results[0][0];
							var idx = 0;
							var idxId;

							for (var val in res) {
								++idx;

								if (idx === assistant) {
									idxId = val+'';
									break;
								}
							}

							var lv = res[idxId];

							if (lv > 4) {
								logMgr.addLog('ERROR', "The assistant is fully upgraded. (" + msg['k_id'] + ")");
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
									var data = require('../data/assistant-data')[assistant+''];
									var cost = data[lv];

									if (cost < coin) {								
										coin -= cost;
										
										var text = 'assistant_';
										idxId = idxId.slice(text.length);
										var first = idxId[0];
										var rest = idxId.slice(1);

										procedure = 'sea_AddAssistant' + first.toUpperCase() + rest;
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
													rMsg['assistant'] = assistant;
													rMsg['lv'] = res;
													write(response, toStream(rMsg));
												});
											} else {
												logMgr.addLog('ERROR', "Failed to upgrade on DB(" + msg['k_id'] + ', ' + assistant + ")");
												sysMsg['res'] = build.Result['FAILED_DB_UPDATE'];
												write(response, toStream(sysMsg));
											}
										});

										procedure = 'sea_UpdateCoin';
										params = id + ', ' + coin;
										
										mysql.call(procedure, params, function (results, fields) {});
									} else {
										logMgr.addLog('SYSTEM', 'Not enough coin (' + msg['k_id'] + ')');
										sysMsg['res'] = build.Result['NOT_ENOUGH_COIN'];
										write(response, toStream(sysMsg));
									}
								});
							}
						});
					} else {
						logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				});
			}
		} else {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
		}
	});
} // end BuyOrUpgradeAssistantHandler

function SendHoneyHandler(response, data, session_id){
	var msg = build.SendHoney.decode(data);
	var rMsg = new build.SendHoneyReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res === true) {
			if (inspectField(msg) === false) {
				logMgr.addLog('ERROR', "Undefined field is detected in SendHoneyHandler");
				sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
				write(response, toStream(sysMsg));
			} else {
				var procedure = 'sea_LoadUser';
				var params = "'" + msg['k_id'] + "'";

				mysql.call(procedure, params, function (results, fields) {
					var res = results[0][0]['res'];		
					
					if (res > 0) {
						var sender_id = res;

						procedure = 'sea_LoadUser';
						params = "'" + msg['receiver_k_id'] + "'";
						mysql.call(procedure, params, function(results, fields) {
							res = results[0][0]['res'];

							if (res > 0) {
								var receiver_id = res;

								procedure = 'sea_LoadMileageAndDraw';
								params = sender_id;

								mysql.call(procedure, params, function (results, fields) {
									var _res = results[0][0];

									procedure = 'sea_AddHoney';
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
							} else {
								logMgr.addLog('ERROR', 'Invalid account (' + msg['receiver_k_id'] + ')');
								sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
								write(response, toStream(sysMsg));
							}
						});
					} else {
						logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				});
			}
		} else {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
		}
	});
} // end SendHoneyHandler

function AcceptHoneyHandler(response, data, session_id){
	var msg = build.AcceptHoney.decode(data);
	var rMsg = new build.AcceptHoneyReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res === true) {
			if (inspectField(msg) === false) {
				logMgr.addLog('ERROR', "Undefined field is detected in AcceptHoneyHandler");
				sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
				write(response, toStream(sysMsg));
			} else {
				var procedure = 'sea_LoadUser';
				var params = "'" + msg['k_id'] + "'";

				mysql.call(procedure, params, function (results, fields) {
					var res = results[0][0]['res'];		
					
					if (res > 0) {
						var receiver_id = res;

						procedure = 'sea_LoadUser';
						params = "'" + msg['sender_k_id'] + "'";
						mysql.call(procedure, params, function(results, fields) {
							res = results[0][0]['res'];

							if (res > 0) {
								var sender_id = res;

								procedure = 'sea_AcceptHoney';
								params = sender_id + ', ' + receiver_id + ', ' + msg['sended_time'];
								
								mysql.call(procedure, params, function(results, fields) {
									res = results[0][0]['res'];

									if (res === -1) {
										logMgr.addLog('ERROR', 'Invalid honey (' + msg['receiver_k_id'] + ', ' + msg['sender_k_id'] + ')');
										sysMsg['res'] = build.Result['INVALID_HONEY'];
										write(response, toStream(sysMsg));
									} else {
										var honeyMax = 99;
										procedure = 'sea_UpdateHoney';
										
										if (res + 1 > honeyMax) {
											param = receiver_id + ', ' + 99;		
										} else {
											param = receiver_id + ', ' + (res+1);
										}
										mysql.call(procedure, param, function(results, fields) {});
										write(response, toStream(rMsg));
									}
								});
							} else {
								logMgr.addLog('ERROR', 'Invalid account (' + msg['sender_k_id'] + ')');
								sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
								write(response, toStream(sysMsg));
							}
						});
					} else {
						logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				});
			}
		} else {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
		}
	});
} // end AcceptHoneyHandler

function RequestBatonHandler(response, data, session_id){
	var msg = build.RequestBaton.decode(data);
	var rMsg = new build.RequestBatonReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res === true) {
			if (inspectField(msg) === false) {
				logMgr.addLog('ERROR', "Undefined field is detected in RequestBatonHandler");
				sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
				write(response, toStream(sysMsg));
			} else {
				var procedure = 'sea_LoadUser';
				var params = "'" + msg['k_id'] + "'";

				mysql.call(procedure, params, function (results, fields) {
					var res = results[0][0]['res'];		

					if (res > 0) {
						var sender_id = res;

						procedure = 'sea_LoadUser';
						params = "'" + msg['receiver_k_id'] + "'";
						mysql.call(procedure, params, function(results, fields) {
							res = results[0][0]['res'];

							if (res > 0) {
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
							} else {
								logMgr.addLog('ERROR', 'Invalid account (' + msg['receiver_k_id'] + ')');
								sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
								write(response, toStream(sysMsg));
							}
						});
					} else {
						logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				});
			}
		} else {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
		}
	});
} // end RequestBatonHandler

function AcceptBatonHandler(response, data, session_id){
	var msg = build.AcceptBaton.decode(data);
	var rMsg = new build.AcceptBatonReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res === true) {
			if (inspectField(msg) === false) {
				logMgr.addLog('ERROR', "Undefined field is detected in AcceptBatonHandler");
				sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
				write(response, toStream(sysMsg));
			} else {
				var procedure = 'sea_LoadUser';
				var params = "'" + msg['k_id'] + "'";

				mysql.call(procedure, params, function (results, fields) {
					var res = results[0][0]['res'];
					var receiver_id;
				
					if (res > 0) {
						var sender_id;
						receiver_id = res;

						procedure = 'sea_LoadUser';
						params = "'" + msg['sender_k_id'] + "'";
						mysql.call(procedure, params, function (results, fields) {
							res = results[0][0]['res'];

							if (res > 0) {
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
											var reqassistant = msg['selected_assistant'];
											var character = res['selected_character'];
											var assistant = res['selected_assistant'];

											if (character != msg['selected_character'] || assistant != reqassistant) {
												logMgr.addLog('error', "Doesn't match with db (" + character + ": " + msg['selected_character'] + ", " + assistant + ": " + reqassistant + ")" ); 
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
							} else {
								logMgr.addLog('ERROR', 'Invalid account (' + msg['sender_k_id'] + ')');
								sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
								write(response, toStream(sysMsg));
							}
						});
					} else {
						logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				});
			}
		} else {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
		}
	});
} // end AcceptBatonHandler

function EndBatonHandler(response, data, session_id){
	var msg = build.EndBaton.decode(data);
	var rMsg = new build.BatonResult();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res === true) {
			if (inspectField(msg) === false) {
				logMgr.addLog('ERROR', "Undefined field is detected in EndBatonHandler");
				sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
				write(response, toStream(sysMsg));
			} else {
				var procedure = 'sea_LoadUser';
				var params = "'" + msg['k_id'] + "'";

				mysql.call(procedure, params, function (results, fields) {
					var res = results[0][0]['res'];
					var receiver_id;

					if (res > 0) {
						procedure = 'sea_LoadUser';
						params = "'" + msg['sender_k_id'] + "'";
						receiver_id = res;			
						var sender_id;

						mysql.call(procedure, params, function (results, fields) {
							res = results[0][0]['res'];
							sender_id = res;
							
							if (res > 0) {
								procedure = 'sea_LoadBatonScore';
								params = sender_id + ', ' + receiver_id + ', ' + msg['sended_time'];

								mysql.call(procedure, params, function (results, fields) {
									var score;
									res = results[0][0]['score'];

									if (res === -1) {
										logMgr.addLog('ERROR', 'Invalid baton (sed:' + sender_id + ', rec:' + receiver_id + ', time: ' + msg['sended_time'] + ')');
										sysMsg['res'] = build.Result['INVALID_BATON'];
										write(response, toStream(sysMsg));
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

												if (res['random'] > 0) {
													procedure = 'sea_UpdateRandom';
													params = id + ', ' + 0;
													mysql.call(procedure, params, function(results, fields) {});
												}
											});
										});
									}
								});
							} else {
								logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
								sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
								write(response, toStream(sysMsg));
							}
						});
					} else {
						logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				});
			}
		} else {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
		}
	});
} // end EndBatonHandler

function AcceptBatonResultHandler(response, data, session_id){
	var msg = build.AcceptBatonResult.decode(data);
	var rMsg = new build.AcceptBatonResultReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res === true) {
			if (inspectField(msg) === false) {
				logMgr.addLog('ERROR', "Undefined field is detected in EndBatonHandler");
				sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
				write(response, toStream(sysMsg));
			} else {
				var procedure = 'sea_LoadUser';
				var params = "'" + msg['k_id'] + "'";

				mysql.call(procedure, params, function (results, fields) {
					var res = results[0][0]['res'];
					var receiver_id;

					if (res > 0) {
						procedure = 'sea_LoadUser';
						params = "'" + msg['sender_k_id'] + "'";
						receiver_id = res;			
						var sender_id;

						mysql.call(procedure, params, function (results, fields) {
							res = results[0][0]['res'];
							sender_id = res;
							
							if (res > 0) {
								procedure = 'sea_LoadBatonResultScore';
								params = sender_id + ', ' + receiver_id + ', ' + msg['sended_time'];

								mysql.call(procedure, params, function (results, fields) {
									res = results[0][0]['score'];

									if (res === -1 ) {
										logMgr.addLog('ERROR', 'Invalid baton result (sed:' + sender_id + ', rec:' + receiver_id + ', time: ' + msg['sended_time'] + ')');
										sysMsg['res'] = build.Result['INVALID_BATON_RESULT'];
										write(response, toStream(sysMsg));
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
							} else {
								logMgr.addLog('ERROR', 'Invalid account (' + msg['sender_k_id'] + ')');
								sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
								write(response, toStream(sysMsg));
							}
						});
					} else {
						logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				});
			}
		} else {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
		}
	});
} // end AcceptBatonResultHandler

function UpgradeHoneyScoreHandler(response, data, session_id){
	var msg = build.UpgradeHoneyScore.decode(data);
	var rMsg = new build.UpgradeReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res === true) {
			if (inspectField(msg) === false) {
				logMgr.addLog('ERROR', "Undefined field is detected in UpgradeHoneyScoreHandler");
				sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
				write(response, toStream(sysMsg));
			} else {
				var procedure = 'sea_LoadUser';
				var params = "'" + msg['k_id'] + "'";

				mysql.call(procedure, params, function (results, fields) {
					var res = results[0][0]['res'];		
					
					if (res > 0) {
						var id = res;
						procedure = 'sea_LoadUpgradeInfo';
						params = id;

						mysql.call(procedure, params, function (results, fields) {
							var honeyScore = results[0][0]['honey_score'];

							if (honeyScore > 19) {
								logMgr.addLog('ERROR', "honey is fully upgraded. (" + msg['k_id'] + ")");
								sysMsg['res'] = build.Result['FULLY_UPGRADED'];
								write(response, toStream(sysMsg));
							} else if (honeyScore < 0) {
								logMgr.addLog('ERROR', "Upgrade value can't not be less than 0.(" + msg['k_id'] + ")");
								sysMsg['res'] = build.Result['NO_MATCH_WITH_DB'];
								write(response, toStream(sysMsg));
							} else {
								procedure = 'sea_LoadCoin';
								params = id;

								mysql.call(procedure, params, function (results, fields) {
									var coin = results[0][0]['coin'];
									var honey_score = require('../data/upgrade-data').honey_score;
									var cost = honey_score[honeyScore];

									if (cost < coin) {
										coin -= cost;

										procedure = 'sea_UpgradeHoneyScore';
										params = id;

										mysql.call(procedure, params, function (results, fields) {
											res = results[0][0]['res'];

											if (res === honeyScore + 1) {
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
												logMgr.addLog('ERROR', "Failed to upgrade honeyScore on DB(" + msg['k_id'] + ', ' + honeyScore + ")");
												sysMsg['res'] = build.Result['FAILED_DB_UPDATE'];
												write(response, toStream(sysMsg));
											}
										});

										procedure = 'sea_UpdateCoin';
										params = id + ', ' + coin;
										
										mysql.call(procedure, params, function (results, fields) {});
									} else {
										logMgr.addLog('SYSTEM', 'Not enough coin (' + msg['k_id'] + ')');
										sysMsg['res'] = build.Result['NOT_ENOUGH_COIN'];
										write(response, toStream(sysMsg));
									}
								});
							}
						});
					} else {
						logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				});
			}
		} else {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
		}
	});
} // end UpgradeHoneyScoreHandler

function UpgradeHoneyTimeHandler(response, data, session_id){
	var msg = build.UpgradeHoneyTime.decode(data);
	var rMsg = new build.UpgradeReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res === true) {
			if (inspectField(msg) === false) {
				logMgr.addLog('ERROR', "Undefined field is detected in UpgradeHoneyTimeHandler");
				sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
				write(response, toStream(sysMsg));
			} else {
				var procedure = 'sea_LoadUser';
				var params = "'" + msg['k_id'] + "'";

				mysql.call(procedure, params, function (results, fields) {
					var res = results[0][0]['res'];		
					
					if (res > 0) {
						var id = res;
						procedure = 'sea_LoadUpgradeInfo';
						params = id;

						mysql.call(procedure, params, function (results, fields) {
							var honeyTime = results[0][0]['honey_time'];
							if (honeyTime > 19) {
								logMgr.addLog('ERROR', "honeyTime is fully upgraded. (" + msg['k_id'] + ")");
								sysMsg['res'] = build.Result['FULLY_UPGRADED'];
								write(response, toStream(sysMsg));
							} else if (honeyTime < 0) {
								logMgr.addLog('ERROR', "Upgrade value can't not be less than 0.(" + msg['k_id'] + ")");
								sysMsg['res'] = build.Result['NO_MATCH_WITH_DB'];
								write(response, toStream(sysMsg));
							} else {
								procedure = 'sea_LoadCoin';
								params = id;

								mysql.call(procedure, params, function (results, fields) {
									var coin = results[0][0]['coin'];
									var honey_time = require('../data/upgrade-data').honey_time;
									var cost = honey_time[honeyTime];

									if (cost < coin) {								
										coin -= cost;

										procedure = 'sea_UpgradeHoneyTime';
										params = id;

										mysql.call(procedure, params, function (results, fields) {
											res = results[0][0]['res'];

											if (res === honeyTime + 1) {
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
												logMgr.addLog('ERROR', "Failed to upgrade honeyTime on DB(" + msg['k_id'] + ', ' + honeyTime + ")");
												sysMsg['res'] = build.Result['FAILED_DB_UPDATE'];
												write(response, toStream(sysMsg));
											}
										});

										procedure = 'sea_UpdateCoin';
										params = id + ', ' + coin;
										
										mysql.call(procedure, params, function (results, fields) {});
									} else {
										logMgr.addLog('SYSTEM', 'Not enough coin (' + msg['k_id'] + ')');
										sysMsg['res'] = build.Result['NOT_ENOUGH_COIN'];
										write(response, toStream(sysMsg));
									}
								});
							}
						});
					} else {
						logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				});
			}
		} else {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
		}
	});
} // end UpgradeHoneyTimeHandler

function UpgradeCooldownHandler(response, data, session_id){
	var msg = build.UpgradeCooldown.decode(data);
	var rMsg = new build.UpgradeReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res === true) {
			if (inspectField(msg) === false) {
				logMgr.addLog('ERROR', "Undefined field is detected in UpgradeCooldownHandler");
				sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
				write(response, toStream(sysMsg));
			} else {
				var procedure = 'sea_LoadUser';
				var params = "'" + msg['k_id'] + "'";

				mysql.call(procedure, params, function (results, fields) {
					var res = results[0][0]['res'];		
					
					if (res > 0) {
						var id = res;
						procedure = 'sea_LoadUpgradeInfo';
						params = id;

						mysql.call(procedure, params, function (results, fields) {
							var cooldown = results[0][0]['cooldown'];

							if (cooldown > 19) {
								logMgr.addLog('ERROR', "cooldown is fully upgraded. (" + msg['k_id'] + ")");
								sysMsg['res'] = build.Result['FULLY_UPGRADED'];
								write(response, toStream(sysMsg));
							} else if (cooldown < 0) {
								logMgr.addLog('ERROR', "Upgrade value can't not be less than 0.(" + msg['k_id'] + ")");
								sysMsg['res'] = build.Result['NO_MATCH_WITH_DB'];
								write(response, toStream(sysMsg));
							} else {
								procedure = 'sea_LoadCoin';
								params = id;

								mysql.call(procedure, params, function (results, fields) {
									var coin = results[0][0]['coin'];
									var Cooldown = require('../data/upgrade-data').cooldown;
									var cost = Cooldown[cooldown];

									if (cost < coin) {								
										coin -= cost;

										procedure = 'sea_UpgradeCooldown';
										params = id;

										mysql.call(procedure, params, function (results, fields) {
											res = results[0][0]['res'];

											if (res === cooldown + 1) {
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
												logMgr.addLog('ERROR', "Failed to upgrade cooldown on DB(" + msg['k_id'] + ', ' + cooldown + ")");
												sysMsg['res'] = build.Result['FAILED_DB_UPDATE'];
												write(response, toStream(sysMsg));
											}
										});

										procedure = 'sea_UpdateCoin';
										params = id + ', ' + coin;
										
										mysql.call(procedure, params, function (results, fields) {});
									} else {
										logMgr.addLog('SYSTEM', 'Not enough coin (' + msg['k_id'] + ')');
										sysMsg['res'] = build.Result['NOT_ENOUGH_COIN'];
										write(response, toStream(sysMsg));
									}
								});
							}
						});
					} else {
						logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				});
			}
		} else {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
		}
	});
} // end UpgradeCooldownHandler

function InviteFriendHandler(response, data, session_id){
	var msg = build.InviteFriend.decode(data);
	var rMsg = new build.InviteFriendReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res === true) {
			if (inspectField(msg) === false) {
				logMgr.addLog('ERROR', "Undefined field is detected in InviteFriendHandler");
				sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
				write(response, toStream(sysMsg));
			} else {
				var procedure = 'sea_LoadUser';
				var params = "'" + msg['k_id'] + "'";

				mysql.call(procedure, params, function (results, fields) {
					var res = results[0][0]['res'];		
					
					if (res > 0) {
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
					} else {
						logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				});
			}
		} else {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
		}
	});
} // end InviteFriendHandler

function LoadRewardHandler(response, data, session_id){
	var msg = build.LoadReward.decode(data);
} // end LoadRewardHandler

exports.VersionInfoHandler = VersionInfoHandler;
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
exports.LoadPostedHoneyHandler = LoadPostedHoneyHandler;
exports.LoadPostedBatonHandler = LoadPostedBatonHandler;
exports.LoadPostedBatonResultHandler = LoadPostedBatonResultHandler;
exports.RequestPointRewardHandler = RequestPointRewardHandler;
exports.BuyItemHandler = BuyItemHandler;
exports.BuyOrUpgradeCharacterHandler = BuyOrUpgradeCharacterHandler;
exports.BuyOrUpgradeAssistantHandler = BuyOrUpgradeAssistantHandler;
exports.SendHoneyHandler = SendHoneyHandler;
exports.AcceptHoneyHandler = AcceptHoneyHandler;
exports.RequestBatonHandler = RequestBatonHandler;
exports.AcceptBatonHandler = AcceptBatonHandler;
exports.EndBatonHandler = EndBatonHandler;
exports.AcceptBatonResultHandler = AcceptBatonResultHandler;
exports.UpgradeHoneyScoreHandler = UpgradeHoneyScoreHandler;
exports.UpgradeHoneyTimeHandler = UpgradeHoneyTimeHandler;
exports.UpgradeCooldownHandler = UpgradeCooldownHandler;
exports.InviteFriendHandler = InviteFriendHandler;
exports.LoadRewardHandler = LoadRewardHandler;
