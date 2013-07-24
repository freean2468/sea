var mysql = require('./mysql');
var build = require('./protoBuild');
var assert = require('assert');
var encrypt = require('./util').encrypt;
var toStream = require('./util').toStream;
var UUID = require('./util').UUID;
var convertMS2S = require('./util').convertMS2S;
var request = require('./request').request;
var registerSession = require('./session').registerSession;
var upgradeTable = require('./data').upgrade;
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

function VersionInfoHandler(response, data){
	var msg = build.VersionInfo.decode(data);
	var rMsg = new build.VersionInfoReply();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in VersionInfoHandler");
		sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
		write(response, toStream(sysMsg));
	} else {
		// FIXME
		rMsg['version'] = msg['version'];
		write(response, toStream(rMsg));
	}
} // end VersionInfoHandler

function RegisterAccountHandler(response, data){
	var msg = build.RegisterAccount.decode(data);
	var rMsg = new build.RegisterAccountReply();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in RegisterAccountHandler");
		sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
		write(response, toStream(sysMsg));
	} else {
		var procedure = 'sea_CreateUser';
		var params = "'" + msg['k_id'] + "'";
		
		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];

			if (res === 0) {
				log.addLog('ERROR', 'Already exsisting account : ' + msg['k_id']);
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

function UnregisterAccountHandler(response, data){
	response.end();
	var msg = build.UnregisterAccount.decode(data);
//	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in RegisterAccountHandler");
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
				log.addLog('SYSTEM', 'UnregisterAccount : ' + msg['k_id']);
				
				var UserUnregister = build.UserUnregister;
				var req = new UserUnregister();
				req['k_id'] = msg['k_id'];

				request(req);
//				write(response, toStream(rMsg));
			}
			else {			
//				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				log.addLog('ERROR', 'Unregister Invalid Account : ' + msg['k_id'] + ', ' + res);
//				write(response, toStream(sysMsg));
			}
		});
	}
} // end UnregisterAccountHandler

function LoginHandler(response, data){
	var msg = build.Login.decode(data);
	var rMsg = new build.AccountInfo();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in LoginHandler");
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
						log.addLog('SYSTEM', 'blocked account access : (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['BLOCKED_ACCOUNT'];
						write(response, toStream(sysMsg));
					} else {			
						procedure = 'sea_LoadUserInfo';
						params = id;											

						mysql.call(procedure, params, function (results, fields) {
							res = results[0][0];
							var Pack = build.AccountInfo.Pack;
							var piece = UUID();

							if (registerSession(piece, msg['k_id']) === 0) {
								log.addLog('SYSTEM', 'Duplicated account login (' + msg['k_id'] + ')');
								sysMsg['res'] = build.Result['DUPLICATED_LOGIN'];
								write(response, toStream(sysMsg));
							} else {
								// info
								rMsg['coin'] = res['coin'];
								rMsg['mineral'] = res['mineral'];
								rMsg['lv'] = res['lv'];
								rMsg['exp'] = res['exp'];
								rMsg['point'] = res['point'];
								rMsg['honey'] = res['honey'];
								rMsg['last_charged_time'] = res['last_charged_time'];
								rMsg['selected_character'] = res['selected_character'];
								rMsg['selected_assistant'] = res['selected_assistant'];

								// character
								if (res['character_one'] > 0) {	
									rMsg['characters'].push({'id':build.AccountInfo.ID['ONE'], 'upgraded':res['character_one']}); 
								}
								if (res['character_two'] > 0) {	
									rMsg['characters'].push({'id':build.AccountInfo.ID['TWO'], 'upgraded':res['character_two']}); 
								}
								if (res['character_three'] > 0) { 
									rMsg['characters'].push({'id':build.AccountInfo.ID['THREE'], 'upgraded':res['character_three']});
								}
								if (res['character_four'] > 0) { 
									rMsg['characters'].push({'id':build.AccountInfo.ID['FOUR'], 'upgraded':res['character_four']}); 
								}
								if (res['character_five'] > 0) { 
									rMsg['characters'].push({'id':build.AccountInfo.ID['FIVE'], 'upgraded':res['character_five']}); 
								}
								if (res['character_six'] > 0) {	
									rMsg['characters'].push({'id':build.AccountInfo.ID['SIX'], 'upgraded':res['character_six']}); 
								}
								if (res['character_seven'] > 0) { 
									rMsg['characters'].push({'id':build.AccountInfo.ID['SEVEN'], 'upgraded':res['character_seven']});
								}
								if (res['character_eight'] > 0) { 
									rMsg['characters'].push({'id':build.AccountInfo.ID['EIGHT'], 'upgraded':res['character_eight']});
								}
								if (res['character_nine'] > 0) { 
									rMsg['characters'].push({'id':build.AccountInfo.ID['NINE'], 'upgraded':res['character_nine']}); 
								}
								if (res['character_ten'] > 0) {	
									rMsg['characters'].push({'id':build.AccountInfo.ID['TEN'], 'upgraded':res['character_ten']}); 
								}

								// assistant
								if (res['assistant_one'] > 0) {	
									rMsg['assistants'].push({'id':build.AccountInfo.ID['ONE'], 'upgraded':res['assistant_one']}); 
								}
								if (res['assistant_two'] > 0) {	
									rMsg['assistants'].push({'id':build.AccountInfo.ID['TWO'], 'upgraded':res['assistant_two']}); 
								}
								if (res['assistant_three'] > 0) { 
									rMsg['assistants'].push({'id':build.AccountInfo.ID['THREE'], 'upgraded':res['assistant_three']});
								}
								if (res['assistant_four'] > 0) { 
									rMsg['assistants'].push({'id':build.AccountInfo.ID['FOUR'], 'upgraded':res['assistant_four']}); 
								}
								if (res['assistant_five'] > 0) { 
									rMsg['assistants'].push({'id':build.AccountInfo.ID['FIVE'], 'upgraded':res['assistant_five']}); 
								}
								if (res['assistant_six'] > 0) {	
									rMsg['assistants'].push({'id':build.AccountInfo.ID['SIX'], 'upgraded':res['assistant_six']}); 
								}
								if (res['assistant_seven'] > 0) { 
									rMsg['assistants'].push({'id':build.AccountInfo.ID['SEVEN'], 'upgraded':res['assistant_seven']});
								}
								if (res['assistant_eight'] > 0) { 
									rMsg['assistants'].push({'id':build.AccountInfo.ID['EIGHT'], 'upgraded':res['assistant_eight']});
								}
								if (res['assistant_nine'] > 0) { 
									rMsg['assistants'].push({'id':build.AccountInfo.ID['NINE'], 'upgraded':res['assistant_nine']}); 
								}
								if (res['assistant_ten'] > 0) {	
									rMsg['assistants'].push({'id':build.AccountInfo.ID['TEN'], 'upgraded':res['assistant_ten']}); 
								}

								// upgrade
								rMsg['honey_score'] = res['honey_score'];
								rMsg['honey_time'] = res['honey_time'];
								rMsg['cooldown'] = res['cooldown'];

								// item
								rMsg['exp_boost'] = res['exp_boost'];
								rMsg['item_last'] = res['item_last'];
								rMsg['max_attack'] = res['max_attack'];
								rMsg['random'] = res['random'];
								
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

								var stream = toStream(rMsg);

								response.writeHead(200, {'Set-Cookie' : 'piece='+piece,
														'Content-Type': 'application/octet-stream',
														'Content-Length': stream.length});
								response.write(stream);
								response.end();

								if (res['uv'] === 0) {
									procedure = 'sea_UpdateUvOn';
									params = id;

									mysql.call(procedure, params, function (results, fields) {});
								}
							}
						});

						var AccountLogin = build.AccountLogin;
						var req = new AccountLogin();
						req['k_id'] = msg['k_id'];

						request(req);
					} // end if else
				}); // end mysql.call();
			}
			else {
				log.addLog('SYSTEM', 'Invalid account (res : ' + res + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
			}
		}); // end mysql.call()
	}
} // end LoginHandler

function LogoutHandler(response, data){
	var msg = build.Logout.decode(data);
	var sysMsg = new build.SystemMessage();
	var rMsg = new build.LogoutReply();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in LogoutHandler");
		sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
		write(response, toStream(sysMsg));
	} else {
		var procedure = 'sea_LoadUser';
		var params = "'" + msg['k_id'] + "'";

		mysql.call(procedure, params, function (results, fields) {
			var res = results[0][0]['res'];

			if (res > 0) {
				log.addLog('SYSTEM', 'logout : ' + msg['k_id']);
				write(response, toStream(rMsg));
			}
			else {			
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				log.addLog('ERROR', 'logoutHandle failed : ' + msg['k_id'] + ', ' + res);
				write(response, toStream(sysMsg));
			}
		});
	}
} // end LogoutHandler

function CheckInChargeHandler(response, data){
	var msg = build.CheckInCharge.decode(data);
	var rMsg = new build.ChargeInfo();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in CheckInChargeHandler");
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
					}
					else {
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
						}
						else {
							if (honey === 0) {
								rMsg['honey'] = ChargeInfo.Pack['ZERO'];
							}
							else {
								rMsg['honey'] = honey;
							}
							
							rMsg['last_charged_time'] = last;
							write(response, toStream(rMsg));
						} // end else
					} // end else
				}); // end mysql.call()
			}
			else {
				log.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
			}
		}); // end mysql.call()
	}
} // end CheckInChargeHandler

function SelectCharacterHandler(response, data){
	var msg = build.SelectCharacter.decode(data);
	var rMsg = new build.SelectCharacterReply();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in SelectCharacterHandler");
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
					res = results[0][0]['res'];

					if (res & msg['selected_character']) {
						write(response, toStream(rMsg));
					} else {
						log.addLog('ERROR', 'Invalid character (' + msg['k_id'] + ', ' + 'character : ' + msg['selected_character'] + ')');
						sysMsg['res'] = build.Result['INVALID_CHARACTER'];
						write(response, toStream(sysMsg));
					}
				});
			} else {
				log.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
			}
		});
	}
} // end SelectCharacterHandler

function SelectAssistantHandler(response, data){
	var msg = build.SelectAssistant.decode(data);
	var rMsg = new build.SelectAssistantReply();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in SelectAssistantHandler");
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
					res = results[0][0]['res'];

					if (res & msg['selected_assistant']) {
						write(response, toStream(rMsg));
					}
					else {
						log.addLog('ERROR', 'Invalid assistant (' + msg['k_id'] + ', ' + 'assistant : ' + msg['selected_assistant'] + ')');
						sysMsg['res'] = build.Result['INVALID_ASSISTANT'];
						write(response, toStream(sysMsg));
					}
				});
			}
			else {
				log.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
			}
		});
	}
} // end SelectAssistantHandler

function StartGameHandler(response, data){
	var msg = build.StartGame.decode(data);
	var rMsg = new build.StartGameReply();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in StartGameHandler");
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
						log.addLog('system', 'Not enough honey : ' + rMsg['k_id']);
						sysMsg['res'] = build.Result['NOT_ENOUGH_HONEY'];
						write(response, toStream(sysMsg));
					}
					else if (character != msg['selected_character'] || assistant != reqassistant) {
						log.addLog('error', "Doesn't match with db (" + character + ": " + msg['selected_character'] + ", " + assistant + ": " + reqassistant + ")" ); 
						sysMsg['res'] = build.Result['NO_MATCH_WITH_DB'];
						write(response, toStream(sysMsg));
					}
					else {
						if (honey == honeyMax) {
							last = new Date().getTime();	
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
			}
			else {
				log.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
			}
		}); // end sea_LoadUser
	}
} // end StartGameHandler

function EndGameHandler(response, data){
	var msg = build.EndGame.decode(data);
	var rMsg = new build.GameResult();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in EndGameHandler");
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
					
					rMsg['score'] = msg['score'];
					rMsg['coin'] = msg['coin'];
					rMsg['total_coin'] = msg['coin'] + res['coin'];
					rMsg['bonus_score'] = parseInt((msg['score'] + msg['coin']) * (res['lv']/100));
					rMsg['total_score'] = msg['score'] + msg['coin'] + rMsg['bonus_score'];
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
			}
			else {
				log.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
			}
		});
	}
} // end EndGameHandler

function LoadRankInfoHandler(response, data){
	var msg = build.LoadRankInfo.decode(data);
	var rMsg = new build.RankInfo();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in LoadRankInfoHandler");
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
				var rankingList = require('./server').rankingList;
				
				if (rankingList.length === 0|| rankingList.length === 1) {
					rMsg['overall_ranking'] = 1;
					write(response, toStream(rMsg));
				}
				else {
					// FIXME
					procedure = 'sea_LoadHoneyBySender';
					params = id;
					mysql.call(procedure, params, function(results, fields) {							
						res = results[0][0]['receiver_id'];

						if (res === 0) {
							for (var i = 0; i < rankingList.length; ++i) {
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
						}
						else {
							var length = results[0].length;
							var count = 0;
							var list = results[0];
							var temp = [];
							var loadUserKIdCallback = function(results, fields) {
								++count;
								temp.push(results[0][0]['res']);

								if (count === length) {
									for (var i = 0; i < rankingList.length; ++i) {
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

							for (i = 0; i < length; ++i) {
								param = list[i]['receiver_id'];

								mysql.call(procedure, param, loadUserKIdCallback);
							}
						} // end else						
					}); // end mysql.call()
				}
			}
			else {
				log.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
			}
		});
	}
} // end LoadRankInfoHandler

function LoadPostedHoneyHandler(response, data){
	var msg = build.LoadPostedHoney.decode(data);
	var rMsg = new build.PostedHoney();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in LoadPostedHoneyHandler");
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
						var length = list.length;
						var count = 0;

						for (i = 0; i < length; ++i) {
							params = list[i]['sender_id'];
							mysql.call(procedure, params, function (results, fields) {							
								var res = results[0][0]['res'];
								
								rMsg['honey'].push({'sender_k_id':res, 'sended_time':list[count]['sended_time']});
								++count;
								if (count === length) {
									write(response, toStream(rMsg));
								}
							});						
						}
					}
				});
			}
			else {
				log.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
			}
		});
	}
} // end LoadPostedHoneyHandler

function LoadPostedBatonHandler(response, data){
	var msg = build.LoadPostedBaton.decode(data);
	var rMsg = new build.PostedBaton();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in LoadPostedBatonHandler");
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
						var length = list.length;
						var count = 0;

						for(i = 0; i < length; ++i) {
							params = list[i]['sender_id'];
							mysql.call(procedure, params, function (results, fields) {
								var res = results[0][0]['res'];
								var cp = list[count];
								rMsg['baton'].push({'sender_k_id':res, 'map_name':cp['map'], 'last_score':cp['score'], 'sended_time':cp['sended_time']});
								++count;

								if (count === length) {
									write(response, toStream(rMsg));
								}
							});						
						}
					}
				});
			}
			else {
				log.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
			}
		});
	}
} // end LoadPostedBatonHandler

function LoadPostedBatonResultHandler(response, data){
	var msg = build.LoadPostedBatonResult.decode(data);
	var rMsg = new build.PostedBatonResult();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in LoadPostedBatonResultHandler");
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
						var length = list.length;
						var count = 0;

						for (i = 0; i < length; ++i) {
							params = list[i]['sender_id'];
							mysql.call(procedure, params, function (results, fields) {
								var temp = results[0][0]['res'];
								var cp = list[count];
								
								rMsg['baton_result'].push({'sender_k_id':temp, 'acquisition_score':cp['score'], 'sended_time':cp['sended_time']});

								++count;

								if (count === length) {
									write(response, toStream(rMsg));
								}
							});						
						}
					}
				});
			} else {
				log.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
			}
		});
	}
} // end LoadPostedBatonResultHandler

function RequestPointRewardHandler(response, data){
	var msg = build.RequestPointReward.decode(data);
} // end RequestPointRewardHandler

function BuyItemHandler(response, data){
	var msg = build.BuyItem.decode(data);
	var BuyItemReply = build.BuyItemReply;
	var rMsg = new BuyItemReply();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in BuyItemHandler");
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
						log.addLog('SYSTEM', 'Not enough coin (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['NOT_ENOUGH_COIN'];
						write(response, toStream(sysMsg));
					} else {
						// FIXME
						if (msg['item'] === build.BuyItem.Item['EXP_BOOST']) {						
							procedure = 'sea_UpdateCoin';
							params = id + ', ' + 0;
							mysql.call(procedure, params, function(results, fields){});

							procedure = 'sea_UpdateExpBoost';
							params = id + ', ' + 1;
							mysql.call(procedure, params, function(results, fields){});
			
							rMsg['item'] = BuyItemReply.Item['EXP_BOOST'];
							write(response, toStream(rMsg));
						} else if (msg['item'] === build.BuyItem.Item['LAST_ITEM']) {
							procedure = 'sea_UpdateCoin';
							params = id + ', ' + 0;
							mysql.call(procedure, params, function(results, fields){});

							procedure = 'sea_UpdateItemLast';
							params = id + ', ' + 1;
							mysql.call(procedure, params, function(results, fields){});
			
							rMsg['item'] = BuyItemReply.Item['LAST_ITEM'];
							write(response, toStream(rMsg));
						} else if (msg['item'] === build.BuyItem.Item['MAX_ATTACK']) {
							procedure = 'sea_UpdateCoin';
							params = id + ', ' + 0;
							mysql.call(procedure, params, function(results, fields){});

							procedure = 'sea_UpdateMaxAttack';
							params = id + ', ' + 1;
							mysql.call(procedure, params, function(results, fields){});
			
							rMsg['item'] = BuyItemReply.Item['MAX_ATTACK'];
							write(response, toStream(rMsg));
						} else if (msg['item'] === build.BuyItem.Item['RANDOM']) {
							procedure = 'sea_UpdateCoin';
							params = id + ', ' + 0;
							mysql.call(procedure, params, function(results, fields){});

							var random = Math.floor(Math.random() * (BuyItemReply.Item['MAX'] - BuyItemReply.Item['MAGNET'])) + BuyItemReply.Item['MAGNET'];

							procedure = 'sea_UpdateRandom';
							params = id + ', ' + random;
							mysql.call(procedure, params, function(results, fields){});
			
							rMsg['item'] = random;
							write(response, toStream(rMsg));
						} else {
							log.addLog('ERROR', 'Invalid request field (' + msg['k_id'] + ', ' + msg['item'] + ')');
							sysMsg['res'] = build.Result['INVALID_REQ_FIELD'];
							write(response, toStream(sysMsg));
						}
					}
				});
			}
			else {
				log.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
			}
		});
	}
} // end BuyItemHandler

function BuyCharacterHandler(response, data){
	var msg = build.BuyCharacter.decode(data);
	var BuyItemReply = build.BuyItemReply;
	var rMsg = new BuyItemReply();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in BuyItemHandler");
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
						log.addLog('SYSTEM', 'Not enough coin (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['NOT_ENOUGH_COIN'];
						write(response, toStream(sysMsg));
					} else {
						log.addLog('ERROR', 'Invalid request field (' + msg['k_id'] + ', ' + msg['item'] + ')');
						sysMsg['res'] = build.Result['INVALID_REQ_FIELD'];
						write(response, toStream(sysMsg));
					}
				});
			}
			else {
				log.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
			}
		});
	}
} // end BuyCharacterHandler

function BuyAssistantHandler(response, data){
	var msg = build.BuyAssistant.decode(data);
} // end BuyAssistantHandler

function SendHoneyHandler(response, data){
	var msg = build.SendHoney.decode(data);
	var rMsg = new build.SendHoneyReply();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in SendHoneyHandler");
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

						procedure = 'sea_AddHoney';
						params = sender_id + ', ' + receiver_id;						

						write(response, toStream(rMsg));

						mysql.call(procedure, params, function(results, fields) {});
					}
					else {
						log.addLog('ERROR', 'Invalid account (' + msg['receiver_k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				});
			}
			else {
				log.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
			}
		});
	}
} // end SendHoneyHandler

function AcceptHoneyHandler(response, data){
	var msg = build.AcceptHoney.decode(data);
	var rMsg = new build.AcceptHoneyReply();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in AcceptHoneyHandler");
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
								log.addLog('ERROR', 'Invalid honey (' + msg['receiver_k_id'] + ', ' + msg['sender_k_id'] + ')');
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
					}
					else {
						log.addLog('ERROR', 'Invalid account (' + msg['sender_k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				});
			}
			else {
				log.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
			}
		});
	}
} // end AcceptHoneyHandler

function RequestBatonHandler(response, data){
	var msg = build.RequestBaton.decode(data);
	var rMsg = new build.RequestBatonReply();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in RequestBatonHandler");
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
								log.addLog('SYSTEM', 'Not enough coin (' + msg['k_id'] + ')');
								sysMsg['res'] = build.Result['NOT_ENOUGH_COIN'];
								write(response, toStream(sysMsg));							
							}
						});
					} else {
						log.addLog('ERROR', 'Invalid account (' + msg['receiver_k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				});
			} else {
				log.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
			}
		});
	}
} // end RequestBatonHandler

function AcceptBatonHandler(response, data){
	var msg = build.AcceptBaton.decode(data);
	var rMsg = new build.AcceptBatonReply();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in AcceptBatonHandler");
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
										log.addLog('error', "Doesn't match with db (" + character + ": " + msg['selected_character'] + ", " + assistant + ": " + reqassistant + ")" ); 
										sysMsg['res'] = build.Result['NO_MATCH_WITH_DB'];
										write(response, toStream(sysMsg));
									} else {
										write(response, toStream(rMsg));
									}
								});
							} else {
								log.addLog('ERROR', 'Invalid baton (sed:' + sender_id + ', rec:' + receiver_id + ', time: ' + msg['sended_time'] + ')');
								sysMsg['res'] = build.Result['INVALID_BATON'];
								write(response, toStream(sysMsg));
							}
						});
					} else {
						log.addLog('ERROR', 'Invalid account (' + msg['sender_k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				});
			} else {
				log.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
			}
		});
	}
} // end AcceptBatonHandler

function EndBatonHandler(response, data){
	var msg = build.EndBaton.decode(data);
	var rMsg = new build.BatonResult();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in EndBatonHandler");
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
								log.addLog('ERROR', 'Invalid baton (sed:' + sender_id + ', rec:' + receiver_id + ', time: ' + msg['sended_time'] + ')');
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
						log.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				});
			}
			else {
				log.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
			}
		});
	}
} // end EndBatonHandler

function AcceptBatonResultHandler(response, data){
	var msg = build.AcceptBatonResult.decode(data);
	var rMsg = new build.AcceptBatonResultReply();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in EndBatonHandler");
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
								log.addLog('ERROR', 'Invalid baton result (sed:' + sender_id + ', rec:' + receiver_id + ', time: ' + msg['sended_time'] + ')');
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
						log.addLog('ERROR', 'Invalid account (' + msg['sender_k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
					}
				});
			} else {
				log.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
			}
		});
	}
} // end AcceptBatonResultHandler

function UpgradeHoneyScoreHandler(response, data){
	var msg = build.UpgradeHoneyScore.decode(data);
	var rMsg = new build.UpgradeReply();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in SendHoneyHandler");
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
						log.addLog('ERROR', "honey is fully upgraded. (" + msg['k_id'] + ")");
						sysMsg['res'] = build.Result['FULLY_UPGRADED'];
						write(response, toStream(sysMsg));
					} else if (honeyScore < 0) {
						log.addLog('ERROR', "Upgrade value can't not be less than 0.(" + msg['k_id'] + ")");
						sysMsg['res'] = build.Result['NO_MATCH_WITH_DB'];
						write(response, toStream(sysMsg));
					} else {
						procedure = 'sea_LoadCoin';
						params = id;

						mysql.call(procedure, params, function (results, fields) {
							var coin = results[0][0]['coin'];
							var table;
							for (i = 0; i < upgradeTable.length; ++i) {
								if (upgradeTable[i]['field'] === 'honeyScore') {
									table = upgradeTable[i]['table'];
									break;
								}
							}
							var cost = table[honeyScore]['cost'];

							if (cost < coin) {								
								coin -= cost;

								rMsg['coin'] = coin;
								write(response, toStream(rMsg));

								procedure = 'sea_UpgradeHoneyScore';
								params = id;

								mysql.call(procedure, params, function (results, fields) {});

								procedure = 'sea_UpdateCoin';
								params = id + ', ' + coin;
								
								mysql.call(procedure, params, function (results, fields) {});
							} else {
								log.addLog('SYSTEM', 'Not enough coin (' + msg['k_id'] + ')');
								sysMsg['res'] = build.Result['NOT_ENOUGH_COIN'];
								write(response, toStream(sysMsg));
							}
						});
					}
				});
			} else {
				log.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
			}
		});
	}
} // end UpgradeHoneyScoreHandler

function UpgradeHoneyTimeHandler(response, data){
	var msg = build.UpgradeHoneyTime.decode(data);
	var rMsg = new build.UpgradeReply();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in SendHoneyHandler");
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
						log.addLog('ERROR', "honeyTime is fully upgraded. (" + msg['k_id'] + ")");
						sysMsg['res'] = build.Result['FULLY_UPGRADED'];
						write(response, toStream(sysMsg));
					} else if (honeyTime < 0) {
						log.addLog('ERROR', "Upgrade value can't not be less than 0.(" + msg['k_id'] + ")");
						sysMsg['res'] = build.Result['NO_MATCH_WITH_DB'];
						write(response, toStream(sysMsg));
					} else {
						procedure = 'sea_LoadCoin';
						params = id;

						mysql.call(procedure, params, function (results, fields) {
							var coin = results[0][0]['coin'];
							var table;
							for (i = 0; i < upgradeTable.length; ++i) {
								if (upgradeTable[i]['field'] === 'honeyTime') {
									table = upgradeTable[i]['table'];
									break;
								}
							}
							var cost = table[honeyTime]['cost'];

							if (cost < coin) {								
								coin -= cost;

								rMsg['coin'] = coin;
								write(response, toStream(rMsg));

								procedure = 'sea_UpgradeHoneyTime';
								params = id;

								mysql.call(procedure, params, function (results, fields) {});

								procedure = 'sea_UpdateCoin';
								params = id + ', ' + coin;
								
								mysql.call(procedure, params, function (results, fields) {});
							} else {
								log.addLog('SYSTEM', 'Not enough coin (' + msg['k_id'] + ')');
								sysMsg['res'] = build.Result['NOT_ENOUGH_COIN'];
								write(response, toStream(sysMsg));
							}
						});
					}
				});
			} else {
				log.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
			}
		});
	}
} // end UpgradeHoneyTimeHandler

function UpgradeCooldownHandler(response, data){
	var msg = build.UpgradeCooldown.decode(data);
	var rMsg = new build.UpgradeReply();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in SendHoneyHandler");
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
						log.addLog('ERROR', "cooldown is fully upgraded. (" + msg['k_id'] + ")");
						sysMsg['res'] = build.Result['FULLY_UPGRADED'];
						write(response, toStream(sysMsg));
					} else if (cooldown < 0) {
						log.addLog('ERROR', "Upgrade value can't not be less than 0.(" + msg['k_id'] + ")");
						sysMsg['res'] = build.Result['NO_MATCH_WITH_DB'];
						write(response, toStream(sysMsg));
					} else {
						procedure = 'sea_LoadCoin';
						params = id;

						mysql.call(procedure, params, function (results, fields) {
							var coin = results[0][0]['coin'];
							var table;
							for (i = 0; i < upgradeTable.length; ++i) {
								if (upgradeTable[i]['field'] === 'cooldown') {
									table = upgradeTable[i]['table'];
									break;
								}
							}
							var cost = table[cooldown]['cost'];

							if (cost < coin) {								
								coin -= cost;

								rMsg['coin'] = coin;
								write(response, toStream(rMsg));

								procedure = 'sea_UpgradeCooldown';
								params = id;

								mysql.call(procedure, params, function (results, fields) {});

								procedure = 'sea_UpdateCoin';
								params = id + ', ' + coin;
								
								mysql.call(procedure, params, function (results, fields) {});
							} else {
								log.addLog('SYSTEM', 'Not enough coin (' + msg['k_id'] + ')');
								sysMsg['res'] = build.Result['NOT_ENOUGH_COIN'];
								write(response, toStream(sysMsg));
							}
						});
					}
				});
			} else {
				log.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
			}
		});
	}
} // end UpgradeCooldownHandler

function UpgradeMaxAttackHandler(response, data){
	var msg = build.UpgradeMaxAttack.decode(data);
	var rMsg = new build.UpgradeReply();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in SendHoneyHandler");
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
					var character = msg['character_id'];

					if (character > 14 || character < 0) {
						log.addLog('ERROR', "Invalid character ID (" + msg['k_id'] + ", " + character + ")");
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

					var dbValue = res[idxId];

					if (dbValue > 14) {
						log.addLog('ERROR', "The character is fully upgraded. (" + msg['k_id'] + ")");
						sysMsg['res'] = build.Result['FULLY_UPGRADED'];
						write(response, toStream(sysMsg));
					} else if (dbValue < 0) {
						log.addLog('ERROR', "Upgrade value can't not be less than 0.(" + msg['k_id'] + ")");
						sysMsg['res'] = build.Result['NO_MATCH_WITH_DB'];
						write(response, toStream(sysMsg));
					} else if (dbValue === 0) {
						log.addLog('ERROR', "Trying to upgrade before buying a character. (" + msg['k_id'] + ")");
						sysMsg['res'] = build.Result['NO_MATCH_WITH_DB'];
						write(response, toStream(sysMsg));
					} else {
						procedure = 'sea_LoadCoin';
						params = id;

						mysql.call(procedure, params, function (results, fields) {
							var coin = results[0][0]['coin'];
							var table;
							for (i = 0; i < upgradeTable.length; ++i) {
								if (upgradeTable[i]['field'] === 'maxAttack') {
									table = upgradeTable[i]['table'];
									break;
								}
							}
							var cost = table[dbValue]['cost'];

							if (cost < coin) {								
								coin -= cost;

								rMsg['coin'] = coin;
								write(response, toStream(rMsg));
								
								var text = 'character_';
								idxId = idxId.slice(text.length);
								var first = idxId[0];
								var rest = idxId.slice(1);

								procedure = 'sea_AddCharacter' + first.toUpperCase() + rest;
								params = id;

								mysql.call(procedure, params, function (results, fields) {});

								procedure = 'sea_UpdateCoin';
								params = id + ', ' + coin;
								
								mysql.call(procedure, params, function (results, fields) {});
							} else {
								log.addLog('SYSTEM', 'Not enough coin (' + msg['k_id'] + ')');
								sysMsg['res'] = build.Result['NOT_ENOUGH_COIN'];
								write(response, toStream(sysMsg));
							}
						});
					}
				});
			} else {
				log.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
			}
		});
	}
} // end UpgradeMaxAttackHandler

function UpgradePetHandler(response, data){
	var msg = build.UpgradePet.decode(data);
	var rMsg = new build.UpgradeReply();
	var sysMsg = new build.SystemMessage();

	if (inspectField(msg) === false) {
		log.addLog('ERROR', "Undefined field is detected in SendHoneyHandler");
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
					var assistant = msg['pet_id'];

					if (assistant > 14 || assistant < 0) {
						log.addLog('ERROR', "Invalid character ID (" + msg['k_id'] + ", " + assistant + ")");
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

					var dbValue = res[idxId];

					if (dbValue > 14) {
						log.addLog('ERROR', "The character is fully upgraded. (" + msg['k_id'] + ")");
						sysMsg['res'] = build.Result['FULLY_UPGRADED'];
						write(response, toStream(sysMsg));
					} else if (dbValue < 0) {
						log.addLog('ERROR', "Upgrade value can't not be less than 0.(" + msg['k_id'] + ")");
						sysMsg['res'] = build.Result['NO_MATCH_WITH_DB'];
						write(response, toStream(sysMsg));
					} else if (dbValue === 0) {
						log.addLog('ERROR', "Trying to upgrade before buying a pet. (" + msg['k_id'] + ")");
						sysMsg['res'] = build.Result['NO_MATCH_WITH_DB'];
						write(response, toStream(sysMsg));
					} else {
						procedure = 'sea_LoadCoin';
						params = id;

						mysql.call(procedure, params, function (results, fields) {
							var coin = results[0][0]['coin'];
							var table;
							for (i = 0; i < upgradeTable.length; ++i) {
								if (upgradeTable[i]['field'] === 'maxAttack') {
									table = upgradeTable[i]['table'];
									break;
								}
							}
							var cost = table[dbValue]['cost'];

							if (cost < coin) {								
								coin -= cost;

								rMsg['coin'] = coin;
								write(response, toStream(rMsg));

								var text = 'assistant_';
								idxId = idxId.slice(text.length);
								var first = idxId[0];
								var rest = idxId.slice(1);

								procedure = 'sea_AddAssistant' + first.toUpperCase() + rest;
								params = id;

								mysql.call(procedure, params, function (results, fields) {});

								procedure = 'sea_UpdateCoin';
								params = id + ', ' + coin;
								
								mysql.call(procedure, params, function (results, fields) {});
							} else {
								log.addLog('SYSTEM', 'Not enough coin (' + msg['k_id'] + ')');
								sysMsg['res'] = build.Result['NOT_ENOUGH_COIN'];
								write(response, toStream(sysMsg));
							}
						});
					}
				});
			} else {
				log.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
			}
		});
	}
} // end UpgradePetHandler

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
exports.BuyCharacterHandler = BuyCharacterHandler;
exports.BuyAssistantHandler = BuyAssistantHandler;
exports.SendHoneyHandler = SendHoneyHandler;
exports.AcceptHoneyHandler = AcceptHoneyHandler;
exports.RequestBatonHandler = RequestBatonHandler;
exports.AcceptBatonHandler = AcceptBatonHandler;
exports.EndBatonHandler = EndBatonHandler;
exports.AcceptBatonResultHandler = AcceptBatonResultHandler;
exports.UpgradeHoneyScoreHandler = UpgradeHoneyScoreHandler;
exports.UpgradeHoneyTimeHandler = UpgradeHoneyTimeHandler;
exports.UpgradeCooldownHandler = UpgradeCooldownHandler;
exports.UpgradeMaxAttackHandler = UpgradeMaxAttackHandler;
exports.UpgradePetHandler = UpgradePetHandler;
