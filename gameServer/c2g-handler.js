var mysql = require('./mysql');
var build = require('./c2g-proto-build');
var assert = require('assert');
var toStream = require('../common/util').toStream;
var convertMS2S = require('../common/util').convertMS2S;
var request = require('./g2l-request').request;
var session = require('./session');

function write(res, stream) {
	res.writeHead(200, {'Content-Type': 'application/octet-stream', 'Content-Length':stream.length});
	res.write(stream);
	res.end();
}

function inspectField(msg) {
	for (var val in msg) {
		if (typeof msg[val + ''] === 'undefined') {
			return false;
		}
	}
	return true;
}

function VersionInfoHandler(response, data, session_id){
	var msg = build.VersionInfo.decode(data);
	var rMsg = new build.VersionInfoReply();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', 'Undefined field is detected in [VersionInfoHandler]');
		sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
		write(response, toStream(sysMsg));
		return ;
	}

	var version = new build.VersionInfo()['version'];

	rMsg['version'] = version;
	write(response, toStream(rMsg));	
} // end VersionInfoHandler

function RegisterAccountHandler(response, data, session_id){
	var msg = build.RegisterAccount.decode(data);
	var rMsg = new build.RegisterAccountReply();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', 'Undefined field is detected in [RegisterAccountHandler]');
		sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
		write(response, toStream(sysMsg));
		return ;
	} 

	mysql.createUser(msg['k_id'], function (res) {
		id = res['res'];

		if (id === 0) {
			logMgr.addLog('ERROR', 'Already exsisting account : ' + msg['k_id']);
			sysMsg['res'] = build.SystemMessage.Result['EXISTED_ACCOUNT'];
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

function UnregisterAccountHandler(response, data, session_id){
	var msg = build.UnregisterAccount.decode(data);
	var rMsg = new build.UnregisterAccountReply();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;
	
	session.toAuthUnregisterSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[UnregisterAccount] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [UnregisterAccountHandler]');
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysql.loadUser(kId, function (res) {
			var id = res['res'];

			if (id <= 0) {
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				logMgr.addLog('ERROR', '[UnregisterAccount] Invalid Account : ' + kId + ', ' + res);
				write(response, toStream(sysMsg));
				return ;
			}

			mysql.deleteUser(id, function (res) {
				logMgr.addLog('SYSTEM', 'UnregisterAccount : ' + kId);
				
				var UserUnregister = build.UserUnregister;
				var req = new UserUnregister();
				req['k_id'] = kId;

				request(req);
				write(response, toStream(rMsg));
			});
		});
	});
} // end UnregisterAccountHandler

function LoginHandler(response, data, session_id){
	var msg = build.Login.decode(data);
	var rMsg = new build.AccountInfo();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	if (inspectField(msg) === false) {
		logMgr.addLog('ERROR', 'Undefined field is detected in [LoginHandler]');
		sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
		write(response, toStream(sysMsg));
		return ;
	}
		
	mysql.loadUser(msg['k_id'], function (res) {
		var id = res['res'];

		if (id <= 0) {
			logMgr.addLog('SYSTEM', '[LoginHandler] Invalid account (res : ' + res + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysql.isBlack(msg['k_id'], function (res) {
			if (res['res']) {
				logMgr.addLog('SYSTEM', 'blocked account access : (' + msg['k_id'] + ')');
				sysMsg['res'] = build.SystemMessage.Result['BLOCKED_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}	

			mysql.loadUserInfo(id, function (res) {
				var info = res;
				session.toAuthRegisterSession(msg['k_id'], function (fromAuthSessionId) {
//					if (fromAuthSessionId === false) {
//						logMgr.addLog('SYSTEM', 'Duplicated account login (' + msg['k_id'] + ')');
//						sysMsg['res'] = build.SystemMessage.Result['DUPLICATED_LOGIN'];
//						write(response, toStream(sysMsg));
//						return ;
//					}

					// info
					rMsg['lv'] = info['lv'];
					rMsg['exp'] = info['exp'];
					rMsg['coin'] = info['coin'];
					rMsg['money'] = info['money'];
					rMsg['energy'] = info['energy'];
					rMsg['last_charged_time'] = info['last_charged_time'];
					rMsg['selected_character'] = info['selected_character'];

					var dataMgr = require('./c2g-index').server.dataMgr;

					// character
					for (var i = 1; i <= dataMgr.characterData.length; ++i) {
						var lv = info['_' + i];

						if (lv > 0) {
							rMsg['characters'].push({'id': i, 'level': lv});
						}
					}

					// upgrade
					rMsg['score_factor'] = info['score_factor'];
					rMsg['time_factor'] = info['time_factor'];
					rMsg['cooldown_factor'] = info['cooldown_factor'];

					// item
					rMsg['shield'] = info['shield'];
					rMsg['item_last'] = info['item_last'];
					rMsg['ghostify'] = info['ghostify'];
					rMsg['immortal'] = info['immortal'];
					rMsg['exp_boost'] = info['exp_boost'];
					rMsg['random'] = info['random'];
					
					var _mileage = info['mileage'];
					var _draw = info['draw'];

					var _callback = function (mileage, draw) {
						rMsg['mileage'] = _mileage;
						rMsg['draw'] = _draw;
						
						var stream = toStream(rMsg);

						response.writeHead(200, {'Set-Cookie' : 'piece='+fromAuthSessionId,
												'Content-Type': 'application/octet-stream',
												'Content-Length': stream.length});
						response.write(stream);
						response.end();
					};

					if (info['uv'] === 0) {
						mysql.updateUvOn(id, function (res) {
							_mileage = info['mileage'] + 5;

							var _callback_2 = function (mileage, draw) {									
								mysql.updateMileage(id, mileage, function (res) {
									_callback(mileage, draw);							
								});
							};

							if (_mileage >= 100) {
								_mileage -= 100;
								++_draw;

								mysql.updateDraw(id, _draw, function (res) {
									_callback_2(_mileage, _draw);
								});
							} else {
								_callback_2(_mileage, _draw);
							}
						});
					} else {
						_callback(_mileage, _draw);
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

function LogoutHandler(response, data, session_id){
	var msg = build.Logout.decode(data);
	var sysMsg = new build.SystemMessage();
	var rMsg = new build.LogoutReply();
	var logMgr = require('./c2g-index').server.logMgr;

	session.toAuthUnregisterSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[Logout] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', "Undefined field is detected in [LogoutHandler]");
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysql.loadUser(kId, function (res) {
			var id = res['res'];

			if (id <= 0) {
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				logMgr.addLog('ERROR', 'logoutHandle failed : ' + kId + ', ' + id);
				write(response, toStream(sysMsg));
				return ;
			}

			logMgr.addLog('SYSTEM', 'logout : ' + kId);
			write(response, toStream(rMsg));
		});
	});
} // end LogoutHandler

function CheckInChargeHandler(response, data, session_id){
	var msg = build.CheckInCharge.decode(data);
	var rMsg = new build.ChargeInfo();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[CheckInCharge] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [CheckInChargeHandler]');
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		} 

		mysql.loadUser(kId, function (res) {
			var id = res['res'];

			if (id <= 0) {
				logMgr.addLog('ERROR', '[CheckInCharge] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

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

function SelectCharacterHandler(response, data, session_id){
	var msg = build.SelectCharacter.decode(data);
	var rMsg = new build.SelectCharacterReply();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[SelectCharacter] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [SelectCharacterHandle]');
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		} 

		mysql.loadUser(kId, function (res) {
			var id = res['res'];

			if (id <= 0) {
				logMgr.addLog('ERROR', '[SelectCharacter] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysql.selectCharacters(id, function (res) {
				var selected = msg['selected_character'];				
				var dataMgr = require('./c2g-index').server.dataMgr;

				if (selected <= 0 || dataMgr.characterData.length < selected) {
					logMgr.addLog('ERROR', 'Character Range Over (' + kId + ', ' + 'character : ' + msg['selected_character'] + ')');
					sysMsg['res'] = build.SystemMessage.Result['INVALID_CHARACTER'];
					write(response, toStream(sysMsg));
					return;
				}
				
				if (res['_' + selected])
				{
					mysql.updateSelectedCharacter(id, selected, function (res) {
						write(response, toStream(rMsg));
					});
				} else {
					logMgr.addLog('ERROR', '[SelectCharacter] Invalid character (' + kId + ', ' + 'character : ' + msg['selected_character'] + ')');
					sysMsg['res'] = build.SystemMessage.Result['INVALID_CHARACTER'];
					write(response, toStream(sysMsg));
				}
			});
		});
	});
} // end SelectCharacterHandler

function StartGameHandler(response, data, session_id){
	var msg = build.StartGame.decode(data);
	var rMsg = new build.StartGameReply();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[StartGame] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [StartGameHandler]');
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		var energyMax = 100;

		mysql.loadUser(kId, function (res) {
			var id = res['res'];

			if (id <= 0) {
				logMgr.addLog('ERROR', '[StartGame] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysql.startGame(id, function (res) {
				var info = res;
				var character = res['selected_character'];
				var energy = res['energy'];
				var last = res['last_charged_time'];

				if (energy < 1) {
					logMgr.addLog('system', '[StartGame] Not enough energy : ' + kId);
					sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_ENERGY'];
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
							var dataMgr = require('./c2g-index').server.dataMgr;
							var itemData = dataMgr.itemData;
							var _callback = function () {
								write(response, toStream(rMsg));
							};

							var mysqlCallList = [];

							for (var i = 0; i < itemData.length; ++i) {
								var item = itemData[i];
								var name = item['name'];
								var now = info[name];
								var on = false;
								var rest = now;
								var item_id = i + 1;

								if (now > 0) {
									mysqlCallList.push(i);
									rest -= 1;
									on = true;
									
									if (name === 'Random') {
										rest = 0;
										item_id = now;
									}
								}

								rMsg['used_item_list'].push({'id': item_id,  'on': on, 'rest': rest});
							}

							if (mysqlCallList.length === 0) {
								_callback();
								return ;
							}

							for (var i = 0; i < mysqlCallList.length; ++i) {
								var item = itemData[mysqlCallList[i]];
								var name = item['name'];
								var procedure = 'update' + name;
								
								function wrap(idx) {
									if (name === 'Random') {
										mysql.updateRandom(id, 0, function (res) { 
											if (mysqlCallList.length === idx+1) {
												_callback();
											}
										});
									} else {
										mysql[procedure](id, -1, function (res) { 
											if (mysqlCallList.length === idx+1) {
												_callback();
											}
										});
									}
								}
								wrap(i);
							}
						});
					});
				}
			});
		}); // end sea_LoadUser
	});
} // end StartGameHandler

function EndGameHandler(response, data, session_id){
	var msg = build.EndGame.decode(data);
	var rMsg = new build.GameResult();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[EndGame] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [EndGameHandler]');
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysql.loadUser(kId, function (res) {
			var id = res['res'];

			if (id <= 0) {
				logMgr.addLog('ERROR', '[EndGame] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysql.loadUserInfo(id, function (res) {
				var info = res;
				var _mileage = info['mileage'] + 5;
				var _draw = info['draw'];
				var _callback = function () {
					write(response, toStream(rMsg));
				};

				if (_mileage >= 100) {
					++_draw;
					_mileage -= 100;
					mysql.updateDraw(id, _draw, function (res) { });
				}

				mysql.updateMileage(id, _mileage, function (res) { });

				rMsg['score'] = msg['score'];
				rMsg['coin'] = msg['coin'];
				rMsg['total_coin'] = msg['coin'] + info['coin'];
				rMsg['bonus_score'] = msg['score'] + msg['coin'];
				rMsg['total_score'] = msg['score'] + msg['coin'] + rMsg['bonus_score'];
				rMsg['mileage'] = _mileage;
				rMsg['draw'] = _draw;

				// FIXME
				rMsg['level'] = info['lv'];
				rMsg['exp'] = info['exp'] + 1;

				if (rMsg['level'] * 10 <= rMsg['exp']) {
					rMsg['exp'] = 0;
					rMsg['level'] += 1;
					mysql.updateLv(id, rMsg['level'], function (res) { });
				}

				mysql.updateExp(id, rMsg['exp'], function (res) { });
				mysql.updateCoin(id, rMsg['total_coin'], function (res) { _callback(); });
				mysql.updateUserLog(id, rMsg['total_score'], msg['dist'], msg['enemy_kill'], function (res) {});

				var UserGamePlay = build.UserGamePlay;
				var req = new UserGamePlay();

				req['k_id'] = kId;
				req['selected_character'] = info['selected_character'];
				req['score'] = msg['score'];
				req['enemy_kill'] = msg['enemy_kill'];
				req['dist'] = msg['dist'];
				req['play_time'] = msg['play_time'];
				req['shield'] = info['shield'];
				req['ghostify'] = info['ghostify'];
				req['immortal'] = info['immortal'];
				req['exp_boost'] = info['exp_boost'];
				req['item_last'] = info['item_last'];
				req['random'] = info['random'];

				request(req);
			});
		});
	});
} // end EndGameHandler

function LoadRankInfoHandler(response, data, session_id){
	var msg = build.LoadRankInfo.decode(data);
	var rMsg = new build.RankInfo();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[LoadRankInfo] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [LoadRankInfoHandler]');
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysql.loadUser(kId, function (res) {
			var id = res['res'];

			if (id <= 0) {
				logMgr.addLog('ERROR', '[LoadRankInfo] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

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

							if (rankingList[i]['k_id'] === kId) {
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

									if (rankingList[i]['k_id'] === kId) {
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

function LoadPostedEnergyHandler(response, data, session_id){
	var msg = build.LoadPostedEnergy.decode(data);
	var rMsg = new build.PostedEnergy();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[LoadPostedEnergy] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [LoadPostedEnergyHandler]');
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysql.loadUser(kId, function (res) {
			var id = res['res'];
		
			if (id <= 0) {
				logMgr.addLog('ERROR', '[LoadPostedEnergy] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysql.loadEnergyByReceiver(id, function (res) {
				var sender_id = res[0]['sender_id'];

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

function LoadPostedBatonHandler(response, data, session_id){
	var msg = build.LoadPostedBaton.decode(data);
	var rMsg = new build.PostedBaton();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[LoadPostedBaton] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [LoadPostedBatonHandler]');
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysql.loadUser(kId, function (res) {
			var id = res['res'];
		
			if (id <= 0) {
				logMgr.addLog('ERROR', '[LoadPostedBaton] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

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

function LoadPostedBatonResultHandler(response, data, session_id){
	var msg = build.LoadPostedBatonResult.decode(data);
	var rMsg = new build.PostedBatonResult();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[LoadPostedBatonResult] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [LoadPostedBatonResultHandler]');
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysql.loadUser(kId, function (res) {
			var id = res['res'];
		
			if (id <= 0) {
				logMgr.addLog('ERROR', '[LoadPostedBatonResult] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

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

function BuyItemHandler(response, data, session_id){
	var msg = build.BuyItem.decode(data);
	var BuyItemReply = build.BuyItemReply;
	var rMsg = new BuyItemReply();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[BuyItem] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [BuyItemHandler]');
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysql.loadUser(kId, function (res) {
			var id = res['res'];

			if (id <= 0) {
				logMgr.addLog('ERROR', '[BuyItem] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysql.loadUserBriefInfo(id, function(res) {
				var coin = res['coin'];
				var dataMgr = require('./c2g-index').server.dataMgr;
				var itemData = dataMgr.getItemDataById(msg['item']);
				var cost = itemData['cost'];

				if (coin < cost) {
					logMgr.addLog('SYSTEM', '[BuyItem] Not enough coin (' + kId + ')');
					sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_COIN'];
					write(response, toStream(sysMsg));
					return;
				}

				if (typeof itemData === 'undefined') {
					logMgr.addLog('ERROR', '[BuyItem] Invalid item (' + kId + ', ' + msg['item'] + ')');
					sysMsg['res'] = build.SystemMessage.Result['INVALID_ITEM'];
					write(response, toStream(sysMsg));
					return;
				}

				var _mileage = res['mileage'] + 5;
				var _draw = res['draw'];
				var _callback = function () {
					write(response, toStream(rMsg));
				};

				if (_mileage >= 100) {
					++_draw;
					_mileage -= 100;
					mysql.updateDraw(id, _draw, function (res) { });
				}

				mysql.updateMileage(id, _mileage, function (res) { });

				rMsg['mileage'] = _mileage;
				rMsg['draw'] = _draw;

				if (build.BuyItem['RANDOM'] !== msg['item']) {
					rMsg['item'] = msg['item'];
		
					procedure = 'update' + itemData['name'];
					mysql[procedure](id, 1, function (res) { 
						coin -= cost;
						mysql.updateCoin(id, coin, function (res) {
							rMsg['coin'] = coin;
							_callback();
						}); 
					});
				} else {
					var typeList = itemData['type'];
					var length = typeList.length;
					var item = Math.floor(Math.random * length);
					var data = typeList[item];
												
					rMsg['item'] = data['id'];
					
					mysql.updateRandom(id, data['id'], function (res) {
						if (res !== 0) {
							coin -= (cost/2);								
						} else {
							coin -= cost;
						}

						mysql.updateCoin(id, coin, function (res) {
							rMsg['coin'] = coin;
							_callback();
						});
					});
				}
			});
		});
	});
} // end BuyItemHandler

function BuyOrUpgradeCharacterHandler(response, data, session_id){
	var msg = build.BuyOrUpgradeCharacter.decode(data);
	var rMsg = new build.BuyOrUpgradeCharacterReply();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[BuyOrUpgradeCharacter] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [BuyOrUpgradeCharacterHandler]');
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		} 
		
		mysql.loadUser(kId, function (res) {
			var id = res['res'];		
			
			if (id <= 0) {
				logMgr.addLog('ERROR', '[BuyOrUpgradeCharacter] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysql.selectCharacters(id, function (res) {
				res = res;
				var character = msg['character'];						
				var dataMgr = require('./c2g-index').server.dataMgr;
				var characterData = dataMgr.getCharacterDataById(character);

				if (character <= 0  || dataMgr.characterData.length < character) {
					logMgr.addLog('ERROR', '[BuyOrUpgradeCharacter] Invalid character (' + kId + ', ' + character + ')');
					sysMsg['res'] = build.SystemMessage.Result['NO_MATHCH_WITH_DB'];
					write(response, toStream(sysMsg));

					return;
				}

				var lv = res['_' + character];
				var lvMax = 16;

				if (lv >= lvMax) {
					logMgr.addLog('ERROR', '[BuyOrUpgradeCharacter] The character is fully upgraded. (' + kId + ')');
					sysMsg['res'] = build.SystemMessage.Result['FULLY_UPGRADED'];
					write(response, toStream(sysMsg));
				} else if (lv < 0) {
					logMgr.addLog('ERROR', '[BuyOrUpgradeCharacter] Upgrade value can not not be less than 0.(' + kId + ')');
					sysMsg['res'] = build.SystemMessage.Result['NO_MATCH_WITH_DB'];
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
								logMgr.addLog('SYSTEM', '[BuyOrUpgradeCharacter] Not enough coin (' + kId + ')');
								sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_COIN'];
							} else {
								logMgr.addLog('SYSTEM', '[BuyOrUpgradeCharacter] Not enough money (' + kId + ')');
								sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_MONEY'];
							}
							write(response, toStream(sysMsg));
							return ;
						}

						pay -= price;
						
						// TODO : concern about evolve and upgrade
						mysql.addCharacter(id, character, function (res) {
							var newLv = res['res'];

							if (newLv !== lv + 1) {
								logMgr.addLog('ERROR', '[BuyOrUpgradeCharacter] Failed to upgrade on DB(' + kId + ', ' + character + ')');
								sysMsg['res'] = build.SystemMessage.Result['FAILED_DB_UPDATE'];
								write(response, toStream(sysMsg));
								return;
							}

							mysql.loadMileageAndDraw(id, function (res) {
								var _res = res;
								var _mileage = _res['mileage'];
								var _draw = _res['draw'];
								var _callback = function () {								
									write(response, toStream(rMsg));										
								};

								if (newLv === 1) {
									_mileage += 30;

									if (_mileage >= 100) {
										++_draw;
										_mileage -= 100;
										mysql.updateDraw(id, _draw, function (res) { });
									}

									mysql.updateMileage(id, _mileage, function (res) { });
								} 

								rMsg['mileage'] = _mileage;
								rMsg['draw'] = _draw;
								rMsg['character'] = character;
								rMsg['lv'] = newLv;

								if (characterData['priceType'] === 'coin') {
									rMsg['coin'] = pay;
									rMsg['money'] = money;
									mysql.updateCoin(id, pay, function (res) { _callback(); });		
								} else {
									rMsg['coin'] = coin;
									rMsg['money'] = pay;
									mysql.updateMoney(id, pay, function (res) { _callback(); });
								}
							});
						});
					});
				}
			});
		});
	});
} // end BuyOrUpgradeCharacterHandler

function SendEnergyHandler(response, data, session_id){
	var msg = build.SendEnergy.decode(data);
	var rMsg = new build.SendEnergyReply();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[SendEnergy] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [SendEnergyHandle]');
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysql.loadUser(kId, function (res) {
			var sender_id = res['res'];		
			
			if (sender_id <= 0) {
				logMgr.addLog('ERROR', '[SendEnergy] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			procedure = 'sea_LoadUser';
			mysql.loadUser(msg['receiver_k_id'], function(res) {
				var receiver_id = res['res'];

				if (receiver_id <= 0) {
					logMgr.addLog('ERROR', '[SendEnergy] Invalid account (' + msg['receiver_k_id'] + ')');
					sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
					write(response, toStream(sysMsg));
					return ;
				}

				mysql.loadMileageAndDraw(sender_id, function (res) {
					var _res = res;
					var _callback = function () {
						write(response, toStream(rMsg));
					};

					mysql.addEnergy(sender_id, receiver_id, function(res) { });
						
					var _mileage = _res['mileage'] + 10;
					var _draw = _res['draw'];

					if (_mileage >= 100) {
						++_draw;
						_mileage -= 100;
						mysql.updateDraw(id, _draw, function (res) { });
					}

					rMsg['mileage'] = _mileage;
					rMsg['draw'] = _draw;

					mysql.updateMileage(id, _mileage, function (res) { _callback(); });
				});
			});
		});
	});
} // end SendEnergyHandler

function AcceptEnergyHandler(response, data, session_id){
	var msg = build.AcceptEnergy.decode(data);
	var rMsg = new build.AcceptEnergyReply();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	session.toAuthUpdateSession(kId, session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[AcceptEnergy] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [AcceptEnergyHandler]');
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysql.loadUser(kId, function (res) {
			var receiver_id = res['res'];		
			
			if (receiver_id <= 0) {
				logMgr.addLog('ERROR', '[AcceptEnergy] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysql.loadUser(msg['sender_k_id'], function(res) {
				var sender_id = res['res'];

				if (sender_id <= 0) {
					logMgr.addLog('ERROR', '[AcceptEnergy] Invalid account (' + msg['sender_k_id'] + ')');
					sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
					write(response, toStream(sysMsg));
					return ;
				}

				mysql.acceptEnergy(sender_id, receiver_id, msg['sended_time'], function (res) {
					res = res['res'];

					if (res === -1) {
						logMgr.addLog('ERROR', '[AcceptEnergy] Invalid energy (' + msg['receiver_k_id'] + ', ' + msg['sender_k_id'] + ')');
						sysMsg['res'] = build.SystemMessage.Result['INVALID_HONEY'];
						write(response, toStream(sysMsg));
						return;
					} 

					var energyMax = 100;
					var energy = 0;
					procedure = 'sea_UpdateEnergy';
					
					if (res + 1 > energyMax) {
						energy = 99;		
					} else {
						energy = res + 1;
					}

					mysql.updateEnergy(receiver_id, energy, function(res) {
						rMsg['energy'] = energy;
						write(response, toStream(rMsg));
					});					
				});
			});
		});
	});
} // end AcceptEnergyHandler

function RequestBatonHandler(response, data, session_id){
	var msg = build.RequestBaton.decode(data);
	var rMsg = new build.RequestBatonReply();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[RequestBaton] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', '[RequestBaton] Undefined field is detected in RequestBatonHandler');
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysql.loadUser(kId, function (res) {
			var sender_id = res['res'];		

			if (sender_id <= 0) {
				logMgr.addLog('ERROR', '[RequestBaton] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysql.loadUser(msg['receiver_k_id'], function(res) {
				var receiver_id = res['res'];

				if (receiver_id <= 0) {
					logMgr.addLog('ERROR', '[RequestBaton] Invalid account (' + msg['receiver_k_id'] + ')');
					sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
					write(response, toStream(sysMsg));
					return ;
				}

				mysql.loadCoin(sender_id, function (res) {
					var coin = res['coin'];
					var batonRequestCost = 1000;

					if (coin < batonRequestCost) {
						logMgr.addLog('SYSTEM', '[RequestBaton] Not enough coin (' + k_id + ')');
						sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_COIN'];
						write(response, toStream(sysMsg));
						return ;
					}

					var restCoin = coin - batonRequestCost;
					var _callback = function () {
						write(response, toStream(rMsg));					
					};

					rMsg['coin'] = restCoin;
					
					mysql.updateCoin(sender_id, restCoin, function (res) { })
					mysql.addBaton(sender_id, receiver_id, msg['score'], msg['map'], function (res) { _callback(); });
				});
			});
		});
	});
} // end RequestBatonHandler

function AcceptBatonHandler(response, data, session_id){
	var msg = build.AcceptBaton.decode(data);
	var rMsg = new build.AcceptBatonReply();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[AcceptBaton] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [AcceptBatonHandler]');
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysql.loadUser(kId, function (res) {
			var receiver_id = res['res'];
		
			if (receiver_id <= 0) {
				logMgr.addLog('ERROR', '[AcceptBaton] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysql.loadUser(msg['sender_k_id'], function (res) {
				var sender_id = res['res'];

				if (sender_id <= 0) {
					logMgr.addLog('ERROR', '[AcceptBaton] Invalid account (' + msg['sender_k_id'] + ')');
					sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
					write(response, toStream(sysMsg));
					return ;
				}

				mysql.existBaton(sender_id, receiver_id, msg['sended_time'], function (res) {
					res = res['res'];

					if (!res) {
						logMgr.addLog('ERROR', '[AcceptBaton] Invalid baton (sed:' + sender_id + ', rec:' + receiver_id + ', time: ' + msg['sended_time'] + ')');
						sysMsg['res'] = build.SystemMessage.Result['INVALID_BATON'];
						write(response, toStream(sysMsg));
						return ;
					}

					mysql.startGame(receiver_id, function (res) {
						write(response, toStream(rMsg));
					});
				});
			});
		});
	});
} // end AcceptBatonHandler

function EndBatonHandler(response, data, session_id){
	var msg = build.EndBaton.decode(data);
	var rMsg = new build.BatonResult();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[EndBaton] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [EndBatonHandler]');
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysql.loadUser(kId, function (res) {
			var receiver_id = res['res'];

			if (receiver_id <= 0) {
				logMgr.addLog('ERROR', '[EndBaton] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysql.loadUser(msg['sender_k_id'], function (res) {
				var sender_id = res['res'];
				
				if (sender_id <= 0) {
					logMgr.addLog('ERROR', '[EndBaton] Invalid account (' + kId + ')');
					sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
					write(response, toStream(sysMsg));
					return ;
				}

				mysql.loadBatonScore(sender_id, receiver_id, msg['sended_time'], function (res) {
					var score;
					res = res['score'];

					if (res === -1) {
						logMgr.addLog('ERROR', '[EndBaton] Invalid baton (sed:' + sender_id + ', rec:' + receiver_id + ', time: ' + msg['sended_time'] + ')');
						sysMsg['res'] = build.SystemMessage.Result['INVALID_BATON'];
						write(response, toStream(sysMsg));
						return ;
					} else {
						score = res;

						mysql.loadCoin(receiver_id, function (res) {
							var coin = res['coin'];							
							var finalScore = msg['score'] + score;
							var _callback = function () {
								write(response, toStream(rMsg));									
							};

							rMsg['coin'] = msg['coin'];
							rMsg['total_coin'] = msg['coin'] + coin;							

							mysql.loadHighestScore(sender_id, function (res) {
								res = res['res'];

								if (finalScore <= res) {
									rMsg['update'] = false;
								} else {
									rMsg['update'] = true;
								}
							});

							mysql.updateCoin(receiver_id, rMsg['total_coin'], function (res) { });
							mysql.addBatonResult(receiver_id, sender_id, finalScore, function (res) { });
							mysql.deleteBaton(sender_id, receiver_id, msg['sended_time'], function (res) { _callback(); });
						});
					}
				});
			});
		});
	});
} // end EndBatonHandler

function AcceptBatonResultHandler(response, data, session_id){
	var msg = build.AcceptBatonResult.decode(data);
	var rMsg = new build.AcceptBatonResultReply();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[AcceptBatonResult] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [AcceptBatonResultHandler]');
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysql.loadUser(kId, function (res) {
			var receiver_id = res['res'];

			if (receiver_id <= 0) {
				logMgr.addLog('ERROR', '[AcceptBatonResult] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysql.loadUser(msg['sender_k_id'], function (res) {
				var sender_id = res['res'];
				
				if (sender_id <= 0) {
					logMgr.addLog('ERROR', '[AcceptBatonResult] Invalid account (' + msg['sender_k_id'] + ')');
					sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
					write(response, toStream(sysMsg));
					return ;
				}

				mysql.loadBatonResultScore(sender_id, receiver_id, msg['sended_time'], function (res) {
					var score = res['score'];

					if (res === -1 ) {
						logMgr.addLog('ERROR', '[AcceptBatonResult] Invalid baton result (sed:' + sender_id + ', rec:' + receiver_id + ', time: ' + msg['sended_time'] + ')');
						sysMsg['res'] = build.SystemMessage.Result['INVALID_BATON_RESULT'];
						write(response, toStream(sysMsg));
						return ;
					}

					mysql.loadHighestScore(sender_id, function (res) {
						res = res['res'];

						if (score <= res) {
							rMsg['update'] = false;
							rMsg['score'] = res;
						} else {
							rMsg['update'] = true;
							rMsg['score'] = score;

							// FIXME
							mysql.updateUserLog(receiver_id, score, 0, 0, function (res) {});
						}

						mysql.deleteBatonResult(sender_id, receiver_id, msg['sended_time'], function (res) {
							write(response, toStream(rMsg));
						});
					});
				});
			});
		});
	});
} // end AcceptBatonResultHandler

function UpgradeFactorHandler(response, data, session_id){
	var msg = build.UpgradeFactor.decode(data);
	var rMsg = new build.UpgradeFactorReply();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[UpgradeFactor] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [UpgradeScoreFactorHandler]');
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysql.loadUser(kId, function (res) {
			var id = res['res'];		
			
			if (id <= 0) {
				logMgr.addLog('ERROR', '[UpgradeFactor] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysql.loadUpgrade(id, function (res) {
				var scoreFactor = res['score_factor'];
				var timeFactor = res['time_factor'];
				var cooldownFactor = res['cooldown_factor'];
				var scoreFactorMax = 19;
				var timeFactorMax = 19;
				var cooldownFactorMax = 19;
				var _callback = function() {
					write(response, toStream(rMsg));						
				};

				if (msg['factor'] === build.UpgradeFactor.Factor['SCORE']) {
					if (scoreFactor >= scoreFactorMax) {
						logMgr.addLog('ERROR', '[UpgradeFactor] score_factor is fully upgraded. (' + kId + ')');
						sysMsg['res'] = build.SystemMessage.Result['FULLY_UPGRADED'];
						write(response, toStream(sysMsg));
						return ;
					}
					
					if (scoreFactor < 0) {
						logMgr.addLog('ERROR', '[UpgradeFactor] Upgrade value can not not be less than 0.(' + kId + ')');
						sysMsg['res'] = build.SystemMessage.Result['NO_MATCH_WITH_DB'];
						write(response, toStream(sysMsg));
						return ;
					}

					mysql.loadCoin(id, function (res) {
						var coin = res['coin'];
						var dataMgr = require('./c2g-index').server.dataMgr;
						var upgradeData = dataMgr.getUpgradeDataById(1);
						var cost = upgradeData['upgrade'][scoreFactor + 1];

						if (coin < cost) {
							logMgr.addLog('SYSTEM', '[UpgradeFactor] Not enough coin (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_COIN'];
							write(response, toStream(sysMsg));
							return ;
						}

						coin -= cost;

						mysql.upgradeScoreFactor(id, function (res) {
							res = res['res'];

							if (res !== scoreFactor + 1) {
								logMgr.addLog('ERROR', '[UpgradeFactor] Failed to upgrade scoreFactor on DB(' + kId + ', ' + bonusScore + ")");
								sysMsg['res'] = build.SystemMessage.Result['FAILED_DB_UPDATE'];
								write(response, toStream(sysMsg));
								return ;
							}

							mysql.updateCoin(id, coin, function (res) { });
							mysql.loadMileageAndDraw(id, function (res) {
								var _mileage = res['mileage'] + 5;
								var _draw = res['draw'];
								
								if (_mileage >= 100) {
									++_draw;
									_mileage -= 100;
									mysql.updateDraw(id, _draw, function (res) { });
								}

								rMsg['mileage'] = _mileage;
								rMsg['draw'] = _draw;
								rMsg['coin'] = coin;

								mysql.updateMileage(id, _mileage, function (res) { _callback(); });
							});
						});
					});
				} else if (msg['factor'] === build.UpgradeFactor.Factor['TIME']) {
					if (timeFactor >= timeFactorMax) {
						logMgr.addLog('ERROR', '[UpgradeFactor] timeFactor is fully upgraded. (' + kId + ')');
						sysMsg['res'] = build.SystemMessage.Result['FULLY_UPGRADED'];
						write(response, toStream(sysMsg));
						return ;
					} 
					
					if (timeFactor < 0) {
						logMgr.addLog('ERROR', '[UpgradeFactor] Upgrade value can not not be less than 0.(' + kId + ')');
						sysMsg['res'] = build.SystemMessage.Result['NO_MATCH_WITH_DB'];
						write(response, toStream(sysMsg));
						return ;
					}

					mysql.loadCoin(id, function (res) {
						var coin = res['coin'];
						var dataMgr = require('./c2g-index').server.dataMgr;
						var upgradeData = dataMgr.getUpgradeDataById(2);
						var cost = upgradeData['upgrade'][timeFactor + 1];

						if (coin < cost) {
							logMgr.addLog('SYSTEM', '[UpgradeFactor] Not enough coin (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_COIN'];
							write(response, toStream(sysMsg));
							return ;
						}

						coin -= cost;

						mysql.upgradeTimeFactor(id, function (res) {
							res = res['res'];

							if (res !== timeFactor + 1) {
								logMgr.addLog('ERROR', '[UpgradeFactor] Failed to upgrade timeFactor on DB(' + kId + ', ' + timeFactor + ')');
								sysMsg['res'] = build.SystemMessage.Result['FAILED_DB_UPDATE'];
								write(response, toStream(sysMsg));
								return ;
							}

							mysql.updateCoin(id, coin, function (res) { });
							mysql.loadMileageAndDraw(id, function (res) {
								var _mileage = res['mileage'] + 15;
								var _draw = res['draw'];

								if (_mileage >= 100) {
									++_draw;
									_mileage -= 100;
									mysql.updateDraw(id, _draw, function (res) { });
								}

								rMsg['mileage'] = _mileage;
								rMsg['draw'] = _draw;
								rMsg['coin'] = coin;

								mysql.updateMileage(id, _mileage, function (res) { _callback(); });
							});
						});
					});
				} else if (msg['factor'] === build.UpgradeFactor.Factor['COOLDOWN']) {
					if (cooldownFactor >= cooldownFactorMax) {
						logMgr.addLog('ERROR', '[UpgradeFactor] cooldownFactor is fully upgraded. (' + kId + ')');
						sysMsg['res'] = build.SystemMessage.Result['FULLY_UPGRADED'];
						write(response, toStream(sysMsg));
						return ;
					}
					
					if (cooldownFactor < 0) {
						logMgr.addLog('ERROR', '[UpgradeFactor] Upgrade value can not not be less than 0.(' + kId + ')');
						sysMsg['res'] = build.SystemMessage.Result['NO_MATCH_WITH_DB'];
						write(response, toStream(sysMsg));
						return ;
					}
					
					mysql.loadCoin(id, function (res) {
						var coin = res['coin'];
						var dataMgr = require('./c2g-index').server.dataMgr;
						var upgradeData = dataMgr.getUpgradeDataById(3);
						var cost = upgradeData['upgrade'][cooldownFactor + 1];

						if (coin < cost) {
							logMgr.addLog('SYSTEM', '[UpgradeFactor] Not enough coin (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_COIN'];
							write(response, toStream(sysMsg));
							return ;
						}

						coin -= cost;

						mysql.upgradeCooldownFactor(id, function (res) {
							res = re['res'];

							if (res !== cooldown + 1) {
								logMgr.addLog('ERROR', '[UpgradeFactor] Failed to upgrade cooldownFactor on DB(' + kId + ', ' + cooldownFactor + ')');
								sysMsg['res'] = build.SystemMessage.Result['FAILED_DB_UPDATE'];
								write(response, toStream(sysMsg));
								return ;
							}

							mysql.updateCoin(id, coin, function (res) { });
							mysql.loadMileageAndDraw(id, function (res) {
								var _mileage = res['mileage'] + 15;
								var _draw = res['draw'];

								if (_mileage >= 100) {
									++_draw;
									_mileage -= 100;
									mysql.updateDraw(id, _draw, function (res) { });
								}

								rMsg['mileage'] = _mileage;
								rMsg['draw'] = _draw;
								rMsg['coin'] = coin;

								mysql.updateMileage(id, _mileage, function (res) { _callback(); });
							});
						});
					});
				} else {
					logMgr.addLog('ERROR', '[UpgradeFactor] Invalid upgrade (' + kId + ')');
					sysMsg['res'] = build.SystemMessage.Result['INVALID_UPGRADE'];
					write(response, toStream(sysMsg));
					return ;
				}
			});
		});
	});
} // end UpgradeFactorHandler

function InviteFriendHandler(response, data, session_id){
	var msg = build.InviteFriend.decode(data);
	var rMsg = new build.InviteFriendReply();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[InviteFriend] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [InviteFriendHandler]');
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysql.loadUser(kId, function (res) {
			var id = res['res'];		
			
			if (id <= 0) {
				logMgr.addLog('ERROR', '[InviteFriend] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysql.loadInviteCountWithMileageAndDraw(id, function (res) {
				var _invite = res['invite_count'] + 1;
				var _mileage = res['mileage'] + 10;
				var _draw = res['draw'];

				mysql.updateInviteCount(id, _invite, function (res) {
					rMsg['invite_count'] = _invite;

					var _callback = function () {
						write(response, toStream(rMsg));							
					};

					if (_mileage >= 100) {
						++_draw;
						_mileage -= 100;
						mysql.updateDraw(id, _draw, function (res) { });
					}

					rMsg['mileage'] = _mileage;
					rMsg['draw'] = _draw;

					mysql.updateMileage(id, _mileage, function (res) { _callback(); });

					// TODO
					if (_invite === 10) {

					} else if (_invite === 15) {

					} else if (_invite === 30) {

					}
				});
			});
		});
	});
} // end InviteFriendHandler

function LoadRewardHandler(response, data, session_id){
	var msg = build.LoadReward.decode(data);
} // end LoadRewardHandler

function BuyCostumeHandler(response, data, session_id) {
	var msg = build.BuyCostume.decode(data);
	var rMsg = new build.BuyCostumeReply();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[BuyCostume] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [BuyCostumeHandler]');
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysql.loadUser(kId, function (res) {
			var id = res['res'];		
				
			if (id <= 0) {
				logMgr.addLog('ERROR', '[BuyCostume] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			var dataMgr = require('./c2g-index').server.dataMgr;

			if (msg['category'] <= 0 || build.BuyCostume.CostumeCategory['MAX'] <= msg['category']) {
				logMgr.addLog('ERROR', '[BuyCostume] Invalid costume category');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_COSTUME_CATEGORY'];
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
				logMgr.addLog('ERROR', '[BuyCostume] Invalid costume id');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_COSTUME_ID'];
				write(response, toStream(sysMsg));
				return ;
			}

			var costumeData = dataMgr.getCostumeDataByCategoryAndId(msg['category'], msg['costume_id']);
			var priceType = costumeData['priceType'];
			var price = costumeData['price'];

			mysql.loadUserBriefInfo(id, function (res) {
				var pay;

				if (priceType === 'coin') {
					pay = res['coin'];
				} else {
					pay = res['money'];
				}

				if (pay < cost) {								
					if (priceType === 'coin') {
						logMgr.addLog('SYSTEM', '[BuyCostume] Not enough coin (' + kId + ')');
						sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_COIN'];
					} else {
						logMgr.addLog('SYSTEM', '[BuyCostume] Not enough money (' + kId + ')');
						sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_MONEY'];
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
						var _callback = function () {
							write(response, toStream(rMsg));
						};

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
							_mileage -= 100;
							mysql.updateDraw(id, _draw, function (res) { });
						}
						
						rMsg['mileage'] = _mileage;
						rMsg['draw'] = _draw;

						mysql.updateMileage(id, _mileage, function (res) { });

						if (priceType === 'coin') {
							mysql.updateCoin(id, rMsg['coin'], function (res) { _callback(); });
						} else {							
							mysql.updateMoney(id, rMsg['money'], function (res) { _callback(); });
						}
					});
				}
			});
		});
	});
} // end BuyCostumeHandler

function WearCostumeHandler(response, data, session_id) {
	var msg = build.WearCostume.decode(data);
	var rMsg = new build.WearCostumeReply();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[WearCostume] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [WearCostumeHandler]');
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysql.loadUser(kId, function (res) {
			var id = res['res'];		
			
			if (id <= 0) {
				logMgr.addLog('ERROR', '[WearCostume] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			var dataMgr = require('./c2g-index').server.dataMgr;

			if (msg['category'] <= 0 || build.WearCostume.CostumeCategory['MAX'] <= msg['category']) {
				logMgr.addLog('ERROR', '[WearCostume] Invalid costume category');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_COSTUME_CATEGORY'];
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
				logMgr.addLog('ERROR', '[WearCostume] Invalid costume id');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_COSTUME_ID'];
				write(response, toStream(sysMsg));
				return ;
			}

			if (msg['character_id'] <= 0 || dataMgr.characterData.length < msg['character_id']) {
				logMgr.addLog('ERROR', '[WearCostume] Invalid character id');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_CHARACTER'];
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
					logMgr.addLog('ERROR', '[WearCostume] This user (' + kId + ') does not have this costume(' + costume + ')');
					sysMsg['res'] = build.SystemMessage.Result['PURCHASE_FIRST'];
					write(response, toStream(sysMsg));
					return ;
				}

				mysql.selectCharacters(id, function (res) {
					if (res['_' + msg['character_id']] === 0) {
						logMgr.addLog('ERROR', '[WearCostume] This user  (' + kId + ') does not have this character(' + msg['character_id'] + ')');
						sysMsg['res'] = build.SystemMessage.Result['PURCHASE_FIRST'];
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

function DrawFirstHandler(response, data, session_id) {
	var msg = build.DrawFirst.decode(data);
	var rMsg = new build.DrawFirstReply();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[DrawFirst] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [DrawFirstHandler]');
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysql.loadUser(kId, function (res) {
			var id = res['res'];		
			
			if (id <= 0) {
				logMgr.addLog('ERROR', '[DrawFirst] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysql.loadDraw(id, function (res) {
				if (res <= 0) {
					logMgr.addLog('ERROR', '[DrawFirst] Not enough draw (' + kId + ')');
					sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_DRAW'];
					write(response, toStream(sysMsg));
					return ;					
				}

				var dataMgr = require('./c2g-index').server.dataMgr;
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
				
				var _callback = function () {
					write(response, toStream(rMsg));
				};
					
				var dataMgr = require('./c2g-index').server.dataMgr;
	
				mysql.updateDraw(id, res, -1, function (res) { });

				if (isGhost) {
					mysql.updateGhost(id, pick['id'], function (res) { _callback(); });
				} else {
					if (pick['type'] === 'coin') {
						mysql.addCoin(id, pick['content'], function (res) { _callback(); });
					} else {
						if (pick['content'] === 1) { mysql.updateShield(id, 1, function(res) { _callback(); }); }
						else if (pick['content'] === 2) { mysql.updateGhostify(id, 1, function(res) { _callback(); }); }
						else if (pick['content'] === 3) { mysql.updateImmortal(id, 1, function(res) { _callback(); }); }
						else if (pick['content'] === 4) { mysql.updateExpBoost(id, 1, function(res) { _callback(); }); }
						else if (pick['content'] === 5) { mysql.updateItemLast(id, 1, function(res) { _callback(); }); }
					}
				}

				var drawMgr = require('./c2g-index').server.drawMgr;

				drawMgr.push(id, rMsg['draw_list']);
			});
		});
	});
} // end DrawFirstHandler

function DrawSecondHandler(response, data, session_id) {
	var msg = build.DrawSecond.decode(data);
	var rMsg = new build.DrawSecondReply();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[DrawSecond] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [DrawSecondHandler]');
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysql.loadUser(kId, function (res) {
			var id = res['res'];		
			
			if (id <= 0) {
				logMgr.addLog('ERROR', '[DrawSecond] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysql.loadMoney(id, function (res) {
				if (res < 10) {
					logMgr.addLog('ERROR', '[DrawSecond] Not enough money (' + kId + ')');
					sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_MONEY'];
					write(response, toStream(sysMsg));
					return ;
				}

				var drawMgr = require('./c2g-index').server.drawMgr;
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

				var _callback = function () {
					write(response, toStream(rMsg));
				};

				mysql.updateMoney(id, res - 10, function (res) { });

				if (isGhost) {
					mysql.updateGhost(id, pick['id'], function (res) { _callback(); });
				} else {
					if (pick['type'] === 'coin') {
						mysql.addCoin(id, pick['content'], function (res) { _callback(); });
					} else {
						if (pick['content'] === 1) { mysql.updateShield(id, 1, function(res) { _callback(); }); }
						else if (pick['content'] === 2) { mysql.updateGhostify(id, 1, function(res) { _callback(); }); }
						else if (pick['content'] === 3) { mysql.updateImmortal(id, 1, function(res) { _callback(); }); }
						else if (pick['content'] === 4) { mysql.updateExpBoost(id, 1, function(res) { _callback(); }); }
						else if (pick['content'] === 5) { mysql.updateItemLast(id, 1, function(res) { _callback(); }); }
					}
				}
			});
		});
	});
} // end DrawSecondHandler

function EquipGhostHandler(response, data, session_id) {
	var msg = build.EquipGhost.decode(data);
	var rMsg = new build.EquipGhostReply();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[EquipGhost] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [EquipGhostHandler]');
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysql.loadUser(kId, function (res) {
			var id = res['res'];		
			
			if (id <= 0) {
				logMgr.addLog('ERROR', '[EquipGhost] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}
			
			var dataMgr = require('./c2g-index').server.dataMgr;

			if (msg['ghost_id'] <= 0 || dataMgr.ghostData.length < msg['ghost_id']) {
				logMgr.addLog('ERROR', '[EquipGhost] Invalid ghost ID from (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_GHOST'];
				write(response, toStream(sysMsg));
				return ;
			}

			if (msg['room_number'] <= 0 || dataMgr.roomData.length < msg['room_number']) {
				logMgr.addLog('ERROR', '[EquipGhost] Invalid room number from (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ROOM'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysql.loadGhostHouse(id, function (res) {
				var room = res['room_' + msg['room_number']];

				if (room === -1) {
					logMgr.addLog('ERROR', '[EquipGhost] This user(' + kId + ') trying to equip a ghost on closed room');
					sysMsg['res'] = build.SystemMessage.Result['PURCHASE_FIRST'];
					write(response, toStream(sysMsg));
					return ;
				}

				mysql.loadGhosts(id, function (res) {
					var ghost = res['_' + msg['ghost_id']];

					if (ghost <= 0) {
						logMgr.addLog('ERROR', '[EquipGhost] This user(' + kId + ') does not have this ghost');
						sysMsg['res'] = build.SystemMessage.Result['INVALID_GHOST'];
						write(response, toStream(sysMsg));
						return ;						
					}

					mysql.setGhostTo(id, msg['ghost_id'], msg['room_number'], function (res) {
						rMsg['room_number'] = msg['room_number'];
						rMsg['ghost_id'] = msg['ghost_id'];
						write(response, toStream(rMsg));
					});
				});
			});
		});
	});
} // end EquipGhostHandler

function UnequipGhostHandler(response, data, session_id) {
	var msg = build.UnequipGhost.decode(data);
	var rMsg = new build.UnequipGhostReply();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[UnequipGhost] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [UnequipGhostHandler]');
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysql.loadUser(kId, function (res) {
			var id = res['res'];		
			
			if (id <= 0) {
				logMgr.addLog('ERROR', '[UnequipGhost] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			if (msg['room_number'] <= 0 || dataMgr.roomData.length < msg['room_number']) {
				logMgr.addLog('ERROR', '[UnequipGhost] Invalid room number from (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ROOM'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysql.loadGhostHouse(id, function (res) {
				var room = res['room_' + msg['room_number']];

				if (room === -1) {
					logMgr.addLog('ERROR', '[UnequipGhost] This user(' + kId + ') trying to unequip a ghost from closed room');
					sysMsg['res'] = build.SystemMessage.Result['PURCHASE_FIRST'];
					write(response, toStream(sysMsg));
					return ;
				}

				mysql.removeGhostFrom(id, msg['room_number'], function (res) {
					rMsg['room_number'] = msg['room_number'];
					write(response, toStream(rMsg));
				});
			});
		});
	});
} // end UnequipGhostHandler

function PurchaseRoomHandler(response, data, session_id) {
	var msg = build.PurchaseRoom.decode(data);
	var rMsg = new build.PurchaseRoomReply();
	var sysMsg = new build.SystemMessage();
	var logMgr = require('./c2g-index').server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[PurchaseRoom] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [PurchaseRoomHandler]');
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysql.loadUser(kId, function (res) {
			var id = res['res'];		
			
			if (id <= 0) {
				logMgr.addLog('ERROR', '[PurchaseRoom] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysql.loadGhostHouse(id, function (res) {
				var room = res['room_' + msg['room_number']];

				if (room !== -1) {
					logMgr.addLog('ERROR', '[PurchaseRoom] This user(' + kId + ') already has this room');
					sysMsg['res'] = build.SystemMessage.Result['CAN_NOT_PURCHASE'];
					write(response, toStream(sysMsg));
					return ;
				}
				
				mysq.loadUserBriefInfo(id, function (res) {
					var dataMgr = require('./c2g-index').server.dataMgr;
					room = dataMgr.getRoomDataById(msg['room_number']);		
					var value = room['content'];

					if (room['type'] === 'coin' && res['coin'] < value) {
						logMgr.addLog('ERROR', '[PurchaseRoom] user(' + kId + ') not enough coin');
						sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_COIN'];
						write(response, toStream(sysMsg));
						return ;							
					} else if (room['type'] === 'money' && res['money'] < value) {
						logMgr.addLog('ERROR', '[PurchaseRoom] user(' + kId + ') not enough coin');
						sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_COIN'];
						write(response, toStream(sysMsg));
						return ;
					}

					rMsg['room_number'] = msg['room_number'];
					
					var _callback = function () {
						write(response, toStream(rMsg));							
					};

					if (room['type'] === 'coin') {
						mysql.updateCoin(id, res['coin'] - value, function (res) { });
					} else if (room['type'] === 'money') {
						mysql.updateMoney(id, res['money'] - value, function (res) { });
					} else {
						assert.equal(1, 0);
					}
					
					mysql.purchaseRoom(id, msg['room_number'], function (res) { _callback(); });
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
