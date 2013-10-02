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

	mysql.createUser(msg['k_id'], function (res) {
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

		mysql.loadUser(msg['k_id'], function (res) {
			var res = res['res'];

			if (res <= 0) {
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				logMgr.addLog('ERROR', 'Unregister Invalid Account : ' + msg['k_id'] + ', ' + res);
				write(response, toStream(sysMsg));
				return;
			}

			mysql.deleteUser(function (res) {});
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
		
	mysql.loadUser(msg['k_id'], function (res) {
		var id = res['res'];

		if (res <= 0) {
			logMgr.addLog('SYSTEM', '[LoginHandler] Invalid account (res : ' + res + ')');
			sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysql.isBlack(msg['k_id'], function (res) {
			if (res) {
				logMgr.addLog('SYSTEM', 'blocked account access : (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['BLOCKED_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}	

			mysql.loadUserInfo(id, function (res) {
				session.toAuthRegisterSession(msg['k_id'], function (fromAuthSessionId) {
					if (fromAuthSessionId !== false) {
						// info
						rMsg['coin'] = res['coin'];
						rMsg['money'] = res['money'];
						rMsg['lv'] = res['lv'];
						rMsg['exp'] = res['exp'];
						rMsg['point'] = res['point'];
						rMsg['energy'] = res['energy'];
						rMsg['last_charged_time'] = res['last_charged_time'];
						rMsg['selected_character'] = res['selected_character'];

						var dataMgr = require('c2g-index').server.dataMgr;

						// character
						for (var i = 1; i <= dataMgr.characterData.length; ++i) {
							var lv = res['_' + i];

							if (lv > 0) {
								rMsg['characters'].push({'id': i, 'level': lv});
							}
						}

						// upgrade
						rMsg['score_factor'] = res['score_factor'];
						rMsg['time_factor'] = res['time_factor'];
						rMsg['cooldown_factor'] = res['cooldown_factor'];

						// item
						rMsg['shield'] = res['shield'];
						rMsg['item_last'] = res['item_last'];
						rMsg['ghost'] = res['ghost'];
						rMsg['weapon_reinforce'] = res['weapon_reinforce'];
						rMsg['exp_boost'] = res['exp_boost'];
						rMsg['max_attack'] = res['max_attack'];
						rMsg['bonus_heart'] = res['bonus_heart'];
						rMsg['drop_up'] = res['drop_up'];
						rMsg['magnet'] = res['magnet'];
						rMsg['bonus_score'] = res['bonus_score'];
						
						var _mileage = res['mileage'];
						var _draw = res['draw'];

						if (res['uv'] === 0) {
							mysql.updateUvOn(id, function (res) {});

							_mileage = res['mileage'] + 25;

							if (_mileage >= 100) {
								_mileage -= 100;
								++_draw;

								mysql.updateDraw(id, draw, function (res) {});
							}

							mysql.updateMileage(id, _mileage, function (res) {});
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
		}); // end mysql();
	}); // end mysql()
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

		mysql.loadUser(msg['k_id'], function (res) {
			var res = res['res'];

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

		mysql.loadUser(msg['k_id'], function (res) {
			var res = res['res'];
			var id;

			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			id = res;

			mysql.checkInCharge(id, function (res) {
				var last = res['last_charged_time'];
				var energy = res['energy'];
				var energyMax = 100;
				var now = new Date().getTime();
				now = convertMS2S(now);

				if (energyMax === energy) {
					rMsg['energy'] = energyMax;
					rMsg['last_charged_time'] = now;

					mysql.updateLastChargeTime(id, now, function (res) {
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
						rMsg['energy'] = energy;
						rMsg['last_charged_time'] = uptodate;
					
						mysql.updateLastChargeTime(id, uptodate, function (res) {
							mysql.updateEnergy(id, energy, function (res) {
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
			}); // end mysql()
		}); // end mysql()
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

		mysql.loadUser(msg['k_id'], function (res) {
			var id = res['res'];

			if (id <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysql.selectCharacters(id, function (res) {
				var selected = msg['selected_character'];				
				var dataMgr = require('c2g-index').server.dataMgr;

				if (selected <= 0 || dataMgr.characterData.length < selected) {
					logMgr.addLog('ERROR', 'Character Range Over (' + msg['k_id'] + ', ' + 'character : ' + msg['selected_character'] + ')');
					sysMsg['res'] = build.Result['INVALID_CHARACTER'];
					write(response, toStream(sysMsg));
					return;
				}
				
				if (res['_' + selected])
				{
					mysql.updateSelectedCharacter(id, selected, function (res) {});
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

		var energyMax = 100;

		mysql.loadUser(msg['k_id'], function (res) {
			var res = res['res'];
			var id;

			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			id = res;

			mysql.startGame(id, function (res) {
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
					rMsg['last_charged_time'] = last;
				
					mysql.updateLastChargeTime(id, last, function (res) {
						mysql.updateEnergy(id, energy, function (res) {
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

		mysql.loadUser(msg['k_id'], function (res) {
			var res = res['res'];
			var id;

			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			id = res;			

			mysql.loadUserBriefInfo(id, function (res) {
				var _mileage = res['mileage'] + 5;
				var _draw = res['draw'];

				if (_mileage >= 100) {
					++_draw;

					mysql.updateDraw(id, _draw, function (res) {});
				}

				mysql.updateMileage(id, _mileage, function (res) {});

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

				mysql.updateCoin(id, rMsg['total_coin'], function (res) {});
				mysql.updateLevel(id, rMsg['level'], rMsg['exp'], function (res) {});
				mysql.updateUserLog(id, rMsg['total_score'], msg['dist'], msg['enemy_kill'], function (res) {});
				mysql.loadItems(id, function (res) {
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
					if (res['shield'] > 0) { mysql.updateShield(id, -1, function(res) {}); }
					if (res['ghostify'] > 0) { mysql.updateGhostify(id, -1, function(res) {}); }
					if (res['weapon_reinforce'] > 0) { mysql.updateWeaponReinforce(id, -1, function(res) {}); }
					if (res['exp_boost'] > 0) {	mysql.updateExpBoost(id, -1, function(res) {});	}
					if (res['item_last'] > 0) {	mysql.updateItemLast(id, -1, function(res) {});	}
					if (res['max_attack'] > 0) { mysql.updateMaxAttack(id, -1, function(res) {}); }
					if (res['bonus_heart'] > 0) { mysql.updateBonusHeart(id, -1, function(res) {}); }
					if (res['drop_up'] > 0) { mysql.updateDropUp(id, -1, function(res) {}); }
					if (res['magnet'] > 0) { mysql.updateMagnet(id, -1, function(res) {}); }
					if (res['bonus_score'] > 0) { mysql.updateBonusScore(id, -1, function(res) {});	}
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

		mysql.loadUser(msg['k_id'], function (res) {
			var res = res['res'];
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
				mysql.loadEnergyBySender(id, function(res) {							
					var receiver_id = res[0]['receiver_id'];

					if (receiver_id === 0) {
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
						var length = res.length;
						var count = 0;
						var list = res;
						var temp = [];
						var loadUserKIdCallback = function(res) {
							++count;
							temp.push(res['res']);

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

						for (var i = 0; i < length; ++i) {
							mysql.loadUserKId(list[i]['receiver_id'], loadUserKIdCallback);
						}
					} // end else						
				}); // end mysql()
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

		mysql.loadUser(msg['k_id'], function (res) {
			var res = res['res'];
			var id;
		
			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			id = res;

			mysql.loadEnergyByReceiver(id, function (res) {
				var sender_id = res['sender_id'];

				if (sender_id === 0) {
					write(response, toStream(rMsg));	
				} else {
					var list = res;
					var count = 0;

					for (var i = 0, l = list.length; i < l; ++i) {
						mysql.loadUserKId(list[i]['sender_id'], function (res) {							
							var res = res['res'];
							
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

		mysql.loadUser(msg['k_id'], function (res) {
			var res = res['res'];
			var id;
		
			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			id = res;

			mysql.loadBaton(id, function (res) {
				var sender_id = res[0]['sender_id'];

				if (sender_id === 0) {
					write(response, toStream(rMsg));	
				} else {
					var list = res;
					var count = 0;

					for (var i = 0, l = list.length; i < l; ++i) {
						mysql.loadUserKId(list[i]['sender_id'], function (res) {
							var res = res['res'];
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

		mysql.loadUser(msg['k_id'], function (res) {
			var res = res['res'];
			var id;
		
			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			id = res;

			mysql.loadBatonResult(id, function (res) {
				var sender_id = res[0]['sender_id'];

				if (sender_id === 0) {
					write(response, toStream(rMsg));	
				} else {
					var list = res;
					var count = 0;

					for (var i = 0, l = list.length; i < l; ++i) {
						mysql.loadUserKId(list[i]['sender_id'], function (res) {
							var temp = res[0]['res'];
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

		mysql.loadUser(msg['k_id'], function (res) {
			var res = res['res'];
			var id;

			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			id = res;			
			mysql.loadCoin(id, function(res) {
				var coin = res['coin'];
				var dataMgr = require('c2g-index').server.dataMgr;
				var itemData = dataMgr.getItemDataById(msg['item']);
				var cost = itemData['cost'];

				if (coin < cost) {
					logMgr.addLog('SYSTEM', 'Not enough coin (' + msg['k_id'] + ')');
					sysMsg['res'] = build.Result['NOT_ENOUGH_COIN'];
					write(response, toStream(sysMsg));
				} else {
					mysql.loadMileageAndDraw(id, function (res) {
						var _mileage = res['mileage'] + 10;
						var _draw = res['draw'];

						if (_mileage >= 100) {
							++_draw;
						}

						rMsg['mileage'] = _mileage;
						rMsg['draw'] = _draw;

						if (itemData !== undefined) {
							coin -= cost;
							rMsg['item'] = msg['item'];

							procedure = 'update' + data['name'];
							mysql[procedure](id, 1, function(res){});

							mysql.updateCoin(id, coin, function(res){});

							rMsg['coin'] = coin;
							write(response, toStream(rMsg));

							if (_mileage >= 100) {
								mysql.updateDraw(id, _draw, function (res) {});
							}

							mysql.updateMileage(id, _mileage, function (res) {});
						} else {
							logMgr.addLog('ERROR', 'Invalid item (' + msg['k_id'] + ', ' + msg['item'] + ')');
							sysMsg['res'] = build.Result['INVALID_ITEM'];
							write(response, toStream(sysMsg));
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
		
		mysql.loadUser(msg['k_id'], function (res) {
			var res = res['res'];		
			
			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			var id = res;

			mysql.selectCharacters(id, function (res) {
				res = res;
				var character = msg['character'];						
				var dataMgr = require('c2g-index').server.dataMgr;
				var characterData = dataMgr.getCharacterDataById(character);

				if (character <= 0  || dataMgr.characterData.length < character) {
					logMgr.addLog('ERROR', "Invalid character (" + msg['k_id'] + ", " + character + ")");
					sysMsg['res'] = build.Result['NO_MATHCH_WITH_DB'];
					write(response, toStream(sysMsg));

					return;
				}

				var lv = res['_' + character];
				var lvMax = 16;

				if (lv >= lvMax) {
					logMgr.addLog('ERROR', "The character is fully upgraded. (" + msg['k_id'] + ")");
					sysMsg['res'] = build.Result['FULLY_UPGRADED'];
					write(response, toStream(sysMsg));
				} else if (lv < 0) {
					logMgr.addLog('ERROR', "Upgrade value can't not be less than 0.(" + msg['k_id'] + ")");
					sysMsg['res'] = build.Result['NO_MATCH_WITH_DB'];
					write(response, toStream(sysMsg));
				} else {
					mysql.loadUserBriefInfo(id, function (res) {
						var pay;
						var coin = res['coin'];
						var money = res['money'];

						if (characterData['priceType'] === 'coin') {
							pay = coin;	
						} else {
							pay = money;
						}

						var price = 0;
						
						if (lv === 0) {
							price = characterData['price'];
						} else {
							price = characterData['evolve'][lv + 1];
						}

						if (pay < price) {			
							if (characterData['priceType'] === 'coin') {
								logMgr.addLog('SYSTEM', 'Not enough coin (' + msg['k_id'] + ')');
								sysMsg['res'] = build.Result['NOT_ENOUGH_COIN'];
							} else {
								logMgr.addLog('SYSTEM', 'Not enough money (' + msg['k_id'] + ')');
								sysMsg['res'] = build.Result['NOT_ENOUGH_MONEY'];
							}
							write(response, toStream(sysMsg));
							return ;
						}

						pay -= price;
						
						// TODO : concern about evolve and upgrade
						mysql.addCharacter(id, character, function (res) {
							res = res['res'];

							if (res === lv + 1) {
								mysql.loadMileageAndDraw(id, function (res) {
									var _res = res;
									var _mileage = _res['mileage'] + 30;
									var _draw = _res['draw'];

									if (_mileage >= 100) {
										++_draw;

										mysql.updateDraw(id, _draw, function (res) {});
									}

									mysql.updateMileage(id, _mileage, function (res) {});

									rMsg['mileage'] = _mileage;
									rMsg['draw'] = _draw;

									if (characterData['priceType'] === 'coin') {
										rMsg['coin'] = pay;
										rMsg['money'] = money;										
									} else {
										rMsg['coin'] = coin;
										rMsg['money'] = pay;
									}

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

						if (characterData['priceType'] === 'coin') {
							mysql.updateCoin(id, pay, function (res) {});
						} else {
							mysql.updateMoney(id, pay, function (res) {});
						}
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

		mysql.loadUser(msg['k_id'], function (res) {
			var res = res['res'];		
			
			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			var sender_id = res;

			procedure = 'sea_LoadUser';
			mysql.loadUser(msg['receiver_k_id'], function(res) {
				res = res['res'];

				if (res <= 0) {
					logMgr.addLog('ERROR', 'Invalid account (' + msg['receiver_k_id'] + ')');
					sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
					write(response, toStream(sysMsg));
					return ;
				}

				var receiver_id = res;

				mysql.loadMileageAndDraw(sender_id, function (res) {
					var _res = res;

					mysql.addEnergy(sender_id, receiver_id, function(res) {});
						
					var _mileage = _res['mileage'] + 5;
					var _draw = _res['draw'];

					if (_mileage >= 100) {
						++_draw;

						mysql.updateDraw(id, _draw, function (res) {});
					}

					mysql.updateMileage(id, _mileage, function (res) {});

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

		mysql.loadUser(msg['k_id'], function (res) {
			var res = res['res'];		
			
			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			var receiver_id = res;

			mysql.loadUser(msg['sender_k_id'], function(res) {
				res = res['res'];

				if (res <= 0) {
					logMgr.addLog('ERROR', 'Invalid account (' + msg['sender_k_id'] + ')');
					sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
					write(response, toStream(sysMsg));
					return ;
				}

				var sender_id = res;

				mysql.acceptEnergy(sender_id, receiver_id, msg['sended_time'], function(res) {
					res = res['res'];

					if (res === -1) {
						logMgr.addLog('ERROR', 'Invalid energy (' + msg['receiver_k_id'] + ', ' + msg['sender_k_id'] + ')');
						sysMsg['res'] = build.Result['INVALID_HONEY'];
						write(response, toStream(sysMsg));
					} else {
						var energyMax = 100;
						var energy = 0;
						procedure = 'sea_UpdateEnergy';
						
						if (res + 1 > energyMax) {
							energy = 99;		
						} else {
							energy = res + 1;
						}

						mysql.updateEnergy(receiver_id, energy, function(res) {});
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

		mysql.loadUser(msg['k_id'], function (res) {
			var res = res['res'];		

			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			var sender_id = res;

			mysql.loadUser(msg['receiver_k_id'], function(res) {
				res = res['res'];

				if (res <= 0) {
					logMgr.addLog('ERROR', 'Invalid account (' + msg['receiver_k_id'] + ')');
					sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
					write(response, toStream(sysMsg));
					return ;
				}

				var receiver_id = res;
				mysql.loadCoin(sender_id, function (res) {
					var coin = res['coin'];
					var batonRequestCost = 1000;

					if (coin > batonRequestCost) {
						var restCoin = coin - batonRequestCost;

						rMsg['coin'] = restCoin;

						mysql.updateCoin(sender_id, restCoin, function(res) {});

						mysql.addBaton(sender_id, receiver_id, msg['score'], msg['map'], function(res) {});

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

		mysql.loadUser(msg['k_id'], function (res) {
			var res = res['res'];
			var receiver_id;
		
			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			var sender_id;
			receiver_id = res;

			mysql.loadUser(msg['sender_k_id'], function (res) {
				res = res['res'];

				if (res <= 0) {
					logMgr.addLog('ERROR', 'Invalid account (' + msg['sender_k_id'] + ')');
					sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
					write(response, toStream(sysMsg));
					return ;
				}

				sender_id = res;

				mysql.existBaton(sender_id, receiver_id, msg['sended_time'], function (res) {
					res = res['res'];

					if (res) {
						mysql.startGame(receiver_id, function (res) {
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

		mysql.loadUser(msg['k_id'], function (res) {
			var res = res['res'];
			var receiver_id;

			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			receiver_id = res;			
			var sender_id;

			mysql.loadUser(msg['sender_k_id'], function (res) {
				res = res['res'];
				sender_id = res;
				
				if (res <= 0) {
					logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
					sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
					write(response, toStream(sysMsg));
					return ;
				}

				mysql.loadBatonScore(sender_id, receiver_id, msg['sended_time'], function (res) {
					var score;
					res = res['score'];

					if (res === -1) {
						logMgr.addLog('ERROR', 'Invalid baton (sed:' + sender_id + ', rec:' + receiver_id + ', time: ' + msg['sended_time'] + ')');
						sysMsg['res'] = build.Result['INVALID_BATON'];
						write(response, toStream(sysMsg));
						return ;
					} else {
						score = res;

						mysql.loadCoin(receiver_id, function (res) {
							coin = res['coin'];
							
							var finalScore = msg['score'] + score;

							rMsg['coin'] = msg['coin'];
							rMsg['total_coin'] = msg['coin'] + coin;

							mysql.loadHighestScore(sender_id, function (res) {
								res = res['res'];

								if (finalScore <= res) {
									rMsg['update'] = build.Update['FAIL'];										
								} else {
									rMsg['update'] = build.Update['SUCCESS'];
								}

								write(response, toStream(rMsg));							
							});

							mysql.updateCoin(receiver_id, rMsg['total_coin'], function (res) {});
							mysql.addBatonResult(receiver_id, sender_id, finalScore, function (res) {});
							mysql.deleteBaton(sender_id, receiver_id, msg['sended_time'], function (res) {});
							mysql.loadItems(receiver_id, function (res) {
								if (res['shield'] > 0) { mysql.updateShield(id, -1, function(res) {}); }
								if (res['ghostify'] > 0) { mysql.updateGhostify(id, -1, function(res) {}); }
								if (res['weapon_reinforce'] > 0) { mysql.updateWeaponReinforce(id, -1, function(res) {}); }
								if (res['exp_boost'] > 0) {	mysql.updateExpBoost(id, -1, function(res) {});	}
								if (res['item_last'] > 0) {	mysql.updateItemLast(id, -1, function(res) {});	}
								if (res['max_attack'] > 0) { mysql.updateMaxAttack(id, -1, function(res) {}); }
								if (res['bonus_heart'] > 0) { mysql.updateBonusHeart(id, -1, function(res) {}); }
								if (res['drop_up'] > 0) { mysql.updateDropUp(id, -1, function(res) {}); }
								if (res['magnet'] > 0) { mysql.updateMagnet(id, -1, function(res) {}); }
								if (res['bonus_score'] > 0) { mysql.updateBonusScore(id, -1, function(res) {});	}
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

		mysql.loadUser(msg['k_id'], function (res) {
			var res = res['res'];
			var receiver_id;

			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			receiver_id = res;			
			var sender_id;

			mysql.loadUser(msg['sender_k_id'], function (res) {
				res = res['res'];
				sender_id = res;
				
				if (res <= 0) {
					logMgr.addLog('ERROR', 'Invalid account (' + msg['sender_k_id'] + ')');
					sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
					write(response, toStream(sysMsg));
					return ;
				}

				mysql.loadBatonResultScore(sender_id, receiver_id, msg['sended_time'], function (res) {
					res = res['score'];

					if (res === -1 ) {
						logMgr.addLog('ERROR', 'Invalid baton result (sed:' + sender_id + ', rec:' + receiver_id + ', time: ' + msg['sended_time'] + ')');
						sysMsg['res'] = build.Result['INVALID_BATON_RESULT'];
						write(response, toStream(sysMsg));
						return ;
					} else {
						var score = res;

						mysql.loadHighestScore(sender_id, function (res) {
							res = res['res'];

							if (score <= res) {
								rMsg['update'] = build.Update['FAIL'];
								rMsg['score'] = res;
							} else {
								rMsg['update'] = build.Update['SUCCESS'];
								rMsg['score'] = score;

								// FIXME
								mysql.updateUserLog(receiver_id, score, 0, 0, function (res) {});
							}

							write(response, toStream(rMsg));							
						});

						mysql.deleteBatonResult(sender_id, receiver_id, msg['sended_time'], function (res) {});
					}
				});
			});
		});
	});
} // end AcceptBatonResultHandler

function UpgradeFactorHandler(response, data, session_id, logMgr){
	var msg = build.UpgradeFactor.decode(data);
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

		mysql.loadUser(msg['k_id'], function (res) {
			var res = res['res'];		
			
			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			var id = res;

			mysql.loadUpgrade(id, function (res) {
				var scoreFactor = res['score_factor'];
				var timeFactor = res['time_factor'];
				var cooldownFactor = res['cooldown_factor'];
				var scoreFactorMax = 19;
				var timeFactorMax = 19;
				var cooldownFactor = 19;

				if (msg['factor'] === build.UpgradeFactor.Factor['SCORE']) {
					if (scoreFactor >= scoreFactorMax) {
						logMgr.addLog('ERROR', "score_factor is fully upgraded. (" + msg['k_id'] + ")");
						sysMsg['res'] = build.Result['FULLY_UPGRADED'];
						write(response, toStream(sysMsg));
					} else if (scoreFactor < 0) {
						logMgr.addLog('ERROR', "Upgrade value can't not be less than 0.(" + msg['k_id'] + ")");
						sysMsg['res'] = build.Result['NO_MATCH_WITH_DB'];
						write(response, toStream(sysMsg));
					} else {
						mysql.loadCoin(id, function (res) {
							var coin = res['coin'];
							var dataMgr = require('c2g-index').server.dataMgr;
							var upgradeData = dataMgr.getUpgradeDataById(1);
							var cost = upgradeData['upgrade'][scoreFactor + 1];

							if (cost < coin) {
								coin -= cost;

								mysql.upgradeScoreFactor(id, function (res) {
									res = res['res'];

									if (res === scoreFactor + 1) {
										mysql.updateCoin(id, coin, function (res) {});
										mysql.loadMileageAndDraw(id, function (res) {
											var _mileage = res['mileage'] + 15;
											var _draw = res['draw'];

											if (_mileage >= 100) {
												++_draw;

												mysql.updateDraw(id, _draw, function (res) {});
											}

											mysql.updateMileage(id, _mileage, function (res) {});

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
				} else if (msg['factor'] === build.UpgradeFactor.Factor['TIME']) {
					if (timeFactor >= timeFactorMax) {
						logMgr.addLog('ERROR', "timeFactor is fully upgraded. (" + msg['k_id'] + ")");
						sysMsg['res'] = build.Result['FULLY_UPGRADED'];
						write(response, toStream(sysMsg));
					} else if (timeFactor < 0) {
						logMgr.addLog('ERROR', "Upgrade value can't not be less than 0.(" + msg['k_id'] + ")");
						sysMsg['res'] = build.Result['NO_MATCH_WITH_DB'];
						write(response, toStream(sysMsg));
					} else {
						mysql.loadCoin(id, function (res) {
							var coin = res['coin'];
							var dataMgr = require('c2g-index').server.dataMgr;
							var upgradeData = dataMgr.getUpgradeDataById(2);
							var cost = upgradeData['upgrade'][timeFactor + 1];

							if (cost < coin) {								
								coin -= cost;

								mysql.upgradeTimeFactor(id, function (res) {
									res = res['res'];

									if (res === timeFactor + 1) {
										mysql.updateCoin(id, coin, function (res) {});
										mysql.loadMileageAndDraw(id, function (res) {
											var _mileage = res['mileage'] + 15;
											var _draw = res['draw'];

											if (_mileage >= 100) {
												++_draw;

												mysql.updateDraw(id, _draw, function (res) {});
											}

											mysql.updateMileage(id, _mileage, function (res) {});

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
				} else if (msg['factor'] === build.UpgradeFactor.Factor['COOLDOWN']) {
					if (cooldownFactor >= cooldownFactorMax) {
						logMgr.addLog('ERROR', "cooldownFactor is fully upgraded. (" + msg['k_id'] + ")");
						sysMsg['res'] = build.Result['FULLY_UPGRADED'];
						write(response, toStream(sysMsg));
					} else if (cooldownFactor < 0) {
						logMgr.addLog('ERROR', "Upgrade value can't not be less than 0.(" + msg['k_id'] + ")");
						sysMsg['res'] = build.Result['NO_MATCH_WITH_DB'];
						write(response, toStream(sysMsg));
					} else {
						mysql.loadCoin(id, function (res) {
							var coin = res['coin'];
							var dataMgr = require('c2g-index').server.dataMgr;
							var upgradeData = dataMgr.getUpgradeDataById(3);
							var cost = upgradeData['upgrade'][cooldownFactor + 1];

							if (cost < coin) {								
								coin -= cost;

								mysql.upgradeCooldownFactor(id, function (res) {
									res = re['res'];

									if (res === cooldown + 1) {
										mysql.updateCoin(id, coin, function (res) {});
										mysql.loadMileageAndDraw(id, function (res) {
											var _mileage = res['mileage'] + 15;
											var _draw = res['draw'];

											if (_mileage >= 100) {
												++_draw;

												mysql.updateDraw(id, _draw, function (res) {});
											}

											mysql.updateMileage(id, _mileage, function (res) {});

											rMsg['mileage'] = _mileage;
											rMsg['draw'] = _draw;
											rMsg['coin'] = coin;
											write(response, toStream(rMsg));
										});
									} else {
										logMgr.addLog('ERROR', 'Failed to upgrade cooldownFactor on DB(' + msg['k_id'] + ', ' + cooldownFactor + ')');
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
				} else {
					logMgr.addLog('ERROR', 'Invalid upgrade (' + msg['k_id'] + ')');
					sysMsg['res'] = build.Result['INVALID_UPGRADE'];
					write(response, toStream(sysMsg));
				}
			});
		});
	});
} // end UpgradeFactorHandler

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

		mysql.loadUser(msg['k_id'], function (res) {
			var res = res['res'];		
			
			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			var id = res;

			mysql.loadInviteCountWithMileageAndDraw(id, function (res) {
				var _invite = res['invite_count'] + 1;
				var _mileage = res['mileage'] + 5;
				var _draw = res['draw'];

				mysql.updateInviteCount(id, _invite, function (res) {
					rMsg['invite_count'] = _invite;

					if (_mileage >= 100) {
						++_draw;

						mysql.updateDraw(id, _draw, function (res) {});
					}

					mysql.updateMileage(id, _mileage, function (res) {});

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

function BuyCostumeHandler(response, data, session_id, logMgr) {
	var msg = build.BuyCostume.decode(data);
	var rMsg = new build.BuyCostumeReply();
	var sysMsg = new build.SystemMessage();

	session.toAuthUpdateSession(msg['k_id'], session_id, function (res) {
		if (res !== true) {
			logMgr.addLog('ERROR', 'Unauthenticated client accessed : (' + msg['k_id'] + ', ' + session_id + ')');
			sysMsg['res'] = build.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in InviteFriendHandler');
			sysMsg['res'] = build.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysql.loadUser(msg['k_id'], function (res) {
			var res = res['res'];		
				
			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			var dataMgr = require('c2g-index').server.dataMgr;

			if (msg['category'] <= 0 || build.BuyCostume.CostumeCategory['MAX'] <= msg['category']) {
				logMgr.addLog('ERROR', 'Invalid costume category');
				sysMsg['res'] = build.Result['INVALID_COSTUME_CATEGORY'];
				write(response, toStream(sysMsg));
				return ;
			}

			if ((msg['category'] === build.BuyCostume.CostumeCategory['HEAD'] &&
				msg['costume_id'] <= 0 || dataMgr.costumeData['HEAD'].length < msg['costume_id']) ||
				(msg['category'] === build.BuyCostume.CostumeCategory['TOP'] &&
				msg['costume_id'] <= 0 || dataMgr.costumeData['TOP'].length <= msg['costume_id']) ||
				(msg['category'] === build.BuyCostume.CostumeCategory['BOTTOMS'] &&
				msg['costume_id'] <= 0 || dataMgr.costumeData['BOTTOMS'].length <= msg['costume_id']) ||
				(msg['category'] === build.BuyCostume.CostumeCategory['BACK'] &&
				msg['costume_id'] <= 0 || dataMgr.costumeData['BACK'].length <= msg['costume_id'])) 
			{
				logMgr.addLog('ERROR', 'Invalid costume id');
				sysMsg['res'] = build.Result['INVALID_COSTUME_ID'];
				write(response, toStream(sysMsg));
				return ;
			}

			var costumeData = dataMgr.getCostumeDataByCategoryAndId(msg['category'], msg['costume_id']);
			var priceType = costumeData['priceType'];
			var price = costumeData['price'];

			var id = res;

			mysql.loadUserBriefInfo(id, function (res) {
				var pay;

				if (priceType === 'coin') {
					pay = res['coin'];
				} else {
					pay = res['money'];
				}

				if (pay < cost) {								
					if (priceType === 'coin') {
						logMgr.addLog('SYSTEM', 'Not enough coin (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['NOT_ENOUGH_COIN'];
					} else {
						logMgr.addLog('SYSTEM', 'Not enough money (' + msg['k_id'] + ')');
						sysMsg['res'] = build.Result['NOT_ENOUGH_MONEY'];
					}
					write(response, toStream(sysMsg));
					return ;
				} else {
					// TODO : Concern about schema and range of costume_id
					if (msg['category'] === build.BuyCostume.CostumeCategory['HEAD']) {
						procedure = 'sea_OnCostumeHead';
					} else if (msg['category'] === build.BuyCostume.CostumeCategory['TOP']) {
						procedure = 'sea_OnCostumeTop';
					} else if (msg['category'] === build.BuyCostume.CostumeCategory['BOTTOMS']) {
						procedure = 'sea_OnCostumeBottoms';
					} else if (msg['category'] === build.BuyCostume.CostumeCategory['BACK']) {
						procedure = 'sea_OnCostumeBack';
					}

					params = id;
					mysql[procedure](id, msg['costume_id'], function (res) {
						rMsg['costume_id'] = msg['costume_id'];

						if (priceType === 'coin') {
							rMsg['coin'] = pay - cost;
							rMsg['money'] = res['money'];
						} else {
							rMsg['money'] = pay - cost;
							rMsg['coin'] = res['coin'];
						}
						
						var _mileage = res['mileage'] + 5;
						var _draw = res['draw'];

						if (_mileage >= 100) {
							++_draw;

							mysql.updateDraw(id, _draw, function (res) {});
						}
						
						rMsg['mileage'] = _mileage;
						rMsg['draw'] = _draw;

						write(response, toStream(rMsg));

						mysql.updateMileage(id, _mileage, function (res) {});

						if (priceType === 'coin') {
							mysql.updateCoin(id, rMsg['coin'], function (res) {});
						} else {							
							mysql.updateMoney(id, rMsg['money'], function (res) {});
						}
					});
				}
			});
		});
	});
} // end BuyCostumeHandler

function WearCostumeHandler(response, data, session_id, logMgr) {
	var msg = build.WearCostume.decode(data);
	var rMsg = new build.WearCostumeReply();
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

		mysql.loadUser(msg['k_id'], function (res) {
			var id = res['res'];		
			
			if (id <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			var dataMgr = require('c2g-index').server.dataMgr;

			if (msg['category'] <= 0 || build.WearCostume.CostumeCategory['MAX'] <= msg['category']) {
				logMgr.addLog('ERROR', 'Invalid costume category');
				sysMsg['res'] = build.Result['INVALID_COSTUME_CATEGORY'];
				write(response, toStream(sysMsg));
				return ;
			}

			if ((msg['category'] === build.WearCostume.CostumeCategory['HEAD'] &&
				msg['costume_id'] <= 0 || dataMgr.costumeData['HEAD'].length < msg['costume_id']) ||
				(msg['category'] === build.WearCostume.CostumeCategory['TOP'] &&
				msg['costume_id'] <= 0 || dataMgr.costumeData['TOP'].length <= msg['costume_id']) ||
				(msg['category'] === build.WearCostume.CostumeCategory['BOTTOMS'] &&
				msg['costume_id'] <= 0 || dataMgr.costumeData['BOTTOMS'].length <= msg['costume_id']) ||
				(msg['category'] === build.WearCostume.CostumeCategory['BACK'] &&
				msg['costume_id'] <= 0 || dataMgr.costumeData['BACK'].length <= msg['costume_id'])) 
			{
				logMgr.addLog('ERROR', 'Invalid costume id');
				sysMsg['res'] = build.Result['INVALID_COSTUME_ID'];
				write(response, toStream(sysMsg));
				return ;
			}

			if (msg['character_id'] <= 0 || dataMgr.characterData.length < msg['character_id']) {
				logMgr.addLog('ERROR', 'Invalid character id');
				sysMsg['res'] = build.Result['INVALID_CHARACTER'];
				write(response, toStream(sysMsg));
				return ;
			}			

			var part = "";

			// TODO : Concern about schema and range of costume_id
			if (msg['category'] === build.WearCostume.CostumeCategory['HEAD']) {
				procedure = 'sea_SelectCostumeHead';
				part = "Head";
			} else if (msg['category'] === build.WearCostume.CostumeCategory['TOP']) {
				procedure = 'sea_SelectCostumeTop';
				part = "Top";
			} else if (msg['category'] === build.WearCostume.CostumeCategory['BOTTOMS']) {
				procedure = 'sea_SelectCostumeBottoms';
				part = "Bottom";
			} else if (msg['category'] === build.WearCostume.CostumeCategory['BACK']) {
				procedure = 'sea_SelectCostumeBack';
				part = "Back";
			}

			mysql[procedure](id, function (res) {
				var costumeData = dataMgr.getCostumeDataByCategoryAndId(msg['category'], msg['costume_id']);
				var costumeColumn = '_' + costumeData['id'];
				var costume = res[costumeColumn];

				if (costume === 0 || costume === undefined) {
					logMgr.addLog('ERROR', 'This user (' + msg['k_id'] + ') does not have this costume(' + costume + ')');
					sysMsg['res'] = build.Result['PURCHASE_FIRST'];
					write(response, toStream(sysMsg));
					return ;
				}

				mysql.selectCharacters(id, function (res) {
					if (res['_' + msg['character_id']] === 0) {
						logMgr.addLog('ERROR', 'This user  (' + msg['k_id'] + ') does not have this character(' + msg['character_id'] + ')');
						sysMsg['res'] = build.Result['PURCHASE_FIRST'];
						write(response, toStream(sysMsg));
						return ;
					}
					
					procedure = 'updateCharacter' +  part;

					mysql[procedure](id, msg['costume_id'], msg['character_id'], function (res) {
						rMsg['costume_id'] = msg['costume_id'];
						write(response, toStream(rMsg));
					});					
				});
			});
		});
	});
} // end WearCostumeHandler

function DrawFirstHandler(response, data, session_id, logMgr) {
	var msg = build.DrawFirst.decode(data);
	var rMsg = new build.DrawFirstReply();
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

		mysql.loadUser(msg['k_id'], function (res) {
			var id = res['res'];		
			
			if (id <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysql.loadDraw(id, function (res) {
				if (res <= 0) {
					logMgr.addLog('ERROR', 'Not enough draw (' + msg['k_id'] + ')');
					sysMsg['res'] = build.Result['NOT_ENOUGH_DRAW'];
					write(response, toStream(sysMsg));
					return ;					
				}

				var dataMgr = require('c2g-index').server.dataMgr;
				var drawList = dataMgr.drawList;
				var draw = [];

				for (var i = 0; i < drawList.length; ++i) {
					var length = drawList[i].length;

					for (var j = 0; j < length; ++j) {
						var random = Math.floor(Math.random * length) + 1;
						draw.push(drawList[i][random]);
					}
				}

				var rating = Math.floor(Math.random * 1000) + 1; // permillage
				var pick = 0;
				var isGhost = false;

				if (rating <= 1) {
					pick = 1;	
				} else if (rating <= 6) { // 1 + 5
					pick = 2;
				} else if (rating <= 31) { // 1 + 5 + 25
					pick = 3;
				} else if (rating <= 106) { // 1 + 5 + 25 + 75
					pick = 4;
				} else if (rating <= 216) { // 1 + 5 + 25 + 75 + 110
					pick = 5;
				} else if (rating <= 361) { // 1 + 5 + 25 + 75 + 110 + 145
					pick = 6;
				} else if (rating <= 556) { // 1 + 5 + 25 + 75 + 110 + 145 + 195
					pick = 7;
				} else if (rating <= 771) { // 1 + 5 + 25 + 75 + 110 + 145 + 195 + 215
					pick = 8;
				} else if (rating <= 1000) { // 1 + 5 + 25 + 75 + 110 + 145 + 195 + 215 + 229
					pick = 9;
				}

				if (pick <= 4) {
					isGhost = true;
				}

				pick = draw[pick - 1];
				rMsg['pick']['id'] = pick['id'];
				rMsg['pick']['is_ghost'] = isGhost;

				for (var i = 0; i < draw.length; ++i) {
					if (pick - 1 !== i) {
						var isGhost = false;

						if (i < 4) {
							isGhost = true;
						}

						rMsg['draw_list'].push({'id': draw[i]['id'], 'is_ghost': isGhost });
					}
				}
				
				write(response, toStream(rMsg));
					
				var dataMgr = require('c2g-index').server.dataMgr;
				
				mysql.updateDraw(id, res, -1, function (res){});

				if (isGhost) {
					mysql.updateGhost(id, pick['id'], function (res){});
				} else {
					if (pick['type'] === 'coin') {
						mysql.addCoin(id, pick['content'], function (res) {});
					} else {
						if (pick['content'] === 1) { mysql.updateShield(id, 1, function(res) {}); }
						else if (pick['content'] === 2) { mysql.updateGhostify(id, 1, function(res) {}); }
						else if (pick['content'] === 3) { mysql.updateWeaponReinforce(id, 1, function(res) {}); }
						else if (pick['content'] === 4) { mysql.updateExpBoost(id, 1, function(res) {}); }
						else if (pick['content'] === 5) { mysql.updateItemLast(id, 1, function(res) {}); }
						else if (pick['content'] === 6) { mysql.updateMaxAttack(id, 1, function(res) {}); }
						else if (pick['content'] === 7) { mysql.updateBonusHeart(id, 1, function(res) {}); }
						else if (pick['content'] === 8) { mysql.updateDropUp(id, 1, function(res) {}); }
						else if (pick['content'] === 9) { mysql.updateMagnet(id, 1, function(res) {}); }
						else if (pick['content'] === 10) { mysql.updateBonusScore(id, 1, function(res) {}); }
					}
				}

				var drawMgr = require('c2g-index').server.drawMgr;

				drawMgr.push(id, rMsg['draw_list']);
			});
		});
	});
} // end DrawFirstHandler

function DrawSecondHandler(response, data, session_id, logMgr) {
	var msg = build.DrawSecond.decode(data);
	var rMsg = new build.DrawSecondReply();
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

		mysql.loadUser(msg['k_id'], function (res) {
			var id = res['res'];		
			
			if (id <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysql.loadMoney(id, function (res) {
				if (res < 10) {
					logMgr.addLog('ERROR', '[DrawSecond] Not enough money (' + msg['k_id'] + ')');
					sysMsg['res'] = build.Result['NOT_ENOUGH_MONEY'];
					write(response, toStream(sysMsg));
					return ;
				}

				var drawMgr = require('c2g-index').server.drawMgr;
				var drawList = drawMgr.pull(id);

				if (msg['draw'] === false) {
					rMsg['pick'] = {'is_ghost': false, 'id': 0};
					write(response, toStream(rMsg));
					return ;
				}

				var rating = Math.floor(Math.random * 1000) + 1; // permillage
				var pick = 0;
				var isGhost = false;

				if (rating <= 2) {
					pick = 1;	
				} else if (rating <= 12) { // 2 + 10
					pick = 2;
				} else if (rating <= 52) { // 2 + 10 + 40
					pick = 3;
				} else if (rating <= 152) { // 2 + 10 + 40 + 100
					pick = 4;
				} else if (rating <= 302) { // 2 + 10 + 40 + 100 + 150
					pick = 5;
				} else if (rating <= 512) { // 2 + 10 + 40 + 100 + 150 + 210
					pick = 6;
				} else if (rating <= 752) { // 2 + 10 + 40 + 100 + 150 + 210 + 240
					pick = 7;
				} else if (rating <= 1000) { // 2 + 10 + 40 + 100 + 150 + 210 + 240 + 248
					pick = 8;
				}
				
				if ((drawList[3]['is_ghost'] === true && pick <= 4) || (drawList[3]['is_ghost'] === false && pick <= 3)) {
					isGhost = true;
				}

				pick = drawList[pick - 1];
				rMsg['pick']['id'] = pick['id'];
				rMsg['pick']['is_ghost'] = isGhost;			
				write(response, toStream(rMsg));

				mysql.updateMoney(id, res - 10, function (res) {});

				if (isGhost) {
					mysql.updateGhost(id, pick['id'], function (res){});
				} else {
					if (pick['type'] === 'coin') {
						mysql.addCoin(id, pick['content'], function (res) {});
					} else {
						if (pick['content'] === 1) { mysql.updateShield(id, 1, function(res) {}); }
						else if (pick['content'] === 2) { mysql.updateGhostify(id, 1, function(res) {}); }
						else if (pick['content'] === 3) { mysql.updateWeaponReinforce(id, 1, function(res) {}); }
						else if (pick['content'] === 4) { mysql.updateExpBoost(id, 1, function(res) {}); }
						else if (pick['content'] === 5) { mysql.updateItemLast(id, 1, function(res) {}); }
						else if (pick['content'] === 6) { mysql.updateMaxAttack(id, 1, function(res) {}); }
						else if (pick['content'] === 7) { mysql.updateBonusHeart(id, 1, function(res) {}); }
						else if (pick['content'] === 8) { mysql.updateDropUp(id, 1, function(res) {}); }
						else if (pick['content'] === 9) { mysql.updateMagnet(id, 1, function(res) {}); }
						else if (pick['content'] === 10) { mysql.updateBonusScore(id, 1, function(res) {}); }
					}
				}
			});
		});
	});
} // end DrawSecondHandler

function EquipGhostHandler(response, data, session_id, logMgr) {
	var msg = build.EquipGhost.decode(data);
	var rMsg = new build.EquipGhostReply();
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

		mysql.loadUser(msg['k_id'], function (res) {
			var id = res['res'];		
			
			if (id <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}
			
			var dataMgr = require('c2g-index').server.dataMgr;

			if (msg['ghost_id'] <= 0 || dataMgr.ghostData.length < msg['ghost_id']) {
				logMgr.addLog('ERROR', '[EquipGhost] Invalid ghost ID from (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_GHOST'];
				write(response, toStream(sysMsg));
				return ;
			}

			if (msg['room_number'] <= 0 || dataMgr.roomData.length < msg['room_number']) {
				logMgr.addLog('ERROR', '[EquipGhost] Invalid room number from (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ROOM'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysql.loadGhostHouse(id, function (res) {
				var room = res['room_' + msg['room_number']];

				if (room === -1) {
					logMgr.addLog('ERROR', '[EquipGhost] This user(' + msg['k_id'] + ') trying to equip a ghost on closed room');
					sysMsg['res'] = build.Result['PURCHASE_FIRST'];
					write(response, toStream(sysMsg));
					return ;
				}

				mysql.loadGhosts(id, function (res) {
					var ghost = res['_' + msg['ghost_id']];

					if (ghost <= 0) {
						logMgr.addLog('ERROR', '[EquipGhost] This user(' + msg['k_id'] + ') does not have this ghost');
						sysMsg['res'] = build.Result['INVALID_GHOST'];
						write(response, toStream(sysMsg));
						return ;						
					}

					mysql.setGhostTo(id, msg['ghost_id'], msg['room_number'], function (res) { });

					rMsg['room_number'] = msg['room_number'];
					rMsg['ghost_id'] = msg['ghost_id'];
					write(response, toStream(rMsg));
				});
			});
		});
	});
} // end EquipGhostHandler

function UnequipGhostHandler(response, data, session_id, logMgr) {
	var msg = build.UnequipGhost.decode(data);
	var rMsg = new build.UnequipGhostReply();
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

		mysql.loadUser(msg['k_id'], function (res) {
			var id = res['res'];		
			
			if (id <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			if (msg['room_number'] <= 0 || dataMgr.roomData.length < msg['room_number']) {
				logMgr.addLog('ERROR', '[EquipGhost] Invalid room number from (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ROOM'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysql.loadGhostHouse(id, function (res) {
				var room = res['room_' + msg['room_number']];

				if (room === -1) {
					logMgr.addLog('ERROR', '[UnequipGhost] This user(' + msg['k_id'] + ') trying to unequip a ghost from closed room');
					sysMsg['res'] = build.Result['PURCHASE_FIRST'];
					write(response, toStream(sysMsg));
					return ;
				}

				mysql.removeGhostFrom(id, msg['room_number'], function (res) {});

				rMsg['room_number'] = msg['room_number'];
				write(response, toStream(rMsg));
			});
		});
	});
} // end UnequipGhostHandler

function PurchaseRoomHandler(response, data, session_id, logMgr) {
	var msg = build.PurchaseRoom.decode(data);
	var rMsg = new build.PurchaseRoomReply();
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

		mysql.loadUser(msg['k_id'], function (res) {
			var id = res['res'];		
			
			if (res <= 0) {
				logMgr.addLog('ERROR', 'Invalid account (' + msg['k_id'] + ')');
				sysMsg['res'] = build.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysql.loadGhostHouse(id, function (res) {
				var room = res['room_' + msg['room_number']];

				if (room !== -1) {
					logMgr.addLog('ERROR', '[PurchaseRoom] This user(' + msg['k_id'] + ') already has this room');
					sysMsg['res'] = build.Result['CAN_NOT_PURCHASE'];
					write(response, toStream(sysMsg));
					return ;
				}
				
				mysq.loadUserBriefInfo(id, function (res) {
					var dataMgr = require('c2g-index').server.dataMgr;
					room = dataMgr.getRoomDataById(msg['room_number']);
		
					var value = room['content'];

					if (room['type'] === 'coin' && res['coin'] < value) {
						logMgr.addLog('ERROR', '[PurchaseRoom] user(' + msg['k_id'] + ') not enough coin');
						sysMsg['res'] = build.Result['NOT_ENOUGH_COIN'];
						write(response, toStream(sysMsg));
						return ;							
					} else if (room['type'] === 'money' && res['money'] < value) {
						logMgr.addLog('ERROR', '[PurchaseRoom] user(' + msg['k_id'] + ') not enough coin');
						sysMsg['res'] = build.Result['NOT_ENOUGH_COIN'];
						write(response, toStream(sysMsg));
						return ;
					}
					
					if (room['type'] === 'coin') {
						mysql.updateCoin(id, res['coin'] - value, function (res) {});
					} else if (room['type'] === 'money') {
						mysql.updateMoney(id, res['money'] - value, function (res) {});
					} else {
						assert.equal(1, 0);
					}

					mysql.purchaseRoom(id, msg['room_number'], function (res) {});

					rMsg['room_number'] = msg['room_number'];
					write(response, toStream(rMsg));
				});
			});
		});
	});
} // end PurchaseRoomHandler

module.exports = {
	'VersionInfoHandler': VersionInfoHandler,
	'RegisterAccountHandler': RegisterAccountHandler,
	'UnregisterAccountHandler': UnregisterAccountHandler,
	'LoginHandler': LoginHandler,
	'LogoutHandler': LogoutHandler,
	'CheckInChargeHandler': CheckInChargeHandler,
	'SelectCharacterHandler': SelectCharacterHandler,
	'StartGameHandler': StartGameHandler,
	'EndGameHandler': EndGameHandler,
	'LoadRankInfoHandler': LoadRankInfoHandler,
	'LoadPostedEnergyHandler': LoadPostedEnergyHandler,
	'LoadPostedBatonHandler': LoadPostedBatonHandler,
	'LoadPostedBatonResultHandler': LoadPostedBatonResultHandler,
	'RequestPointRewardHandler': RequestPointRewardHandler,
	'BuyItemHandler': BuyItemHandler,
	'BuyOrUpgradeCharacterHandler': BuyOrUpgradeCharacterHandler,
	'SendEnergyHandler': SendEnergyHandler,
	'AcceptEnergyHandler': AcceptEnergyHandler,
	'RequestBatonHandler': RequestBatonHandler,
	'AcceptBatonHandler': AcceptBatonHandler,
	'EndBatonHandler': EndBatonHandler,
	'AcceptBatonResultHandler': AcceptBatonResultHandler,
	'UpgradeFactorHandler': UpgradeFactorHandler,
	'InviteFriendHandler': InviteFriendHandler,
	'LoadRewardHandler': LoadRewardHandler,
	'BuyCostumeHandler': BuyCostumeHandler,
	'WearCostumeHandler': WearCostumeHandler,
	'DrawFirstHandler': DrawFirstHandler,
	'DrawSecondHandler': DrawSecondHandler,
	'EquipGhostHandler': EquipGhostHandler,
	'UnequipGhostHandler': UnequipGhostHandler,
	'PurchaseRoomHandler': PurchaseRoomHandler,
};
