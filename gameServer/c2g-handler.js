var build = require('./c2g-proto-build'),
	assert = require('assert'),
	toStream = require('../common/util').toStream,
	convertMS2S = require('../common/util').convertMS2S,
	request = require('./g2l-request').request,
	session = require('./session'),
	define = require('../common/define');
	;

function write(res, stream) {
	res.writeHead(200, {'Content-Type': 'application/octet-stream', 'Content-Length':stream.length});
	res.write(stream);
	res.end();
}

function inspectField(response, msg) {
	for (var val in msg) {
		if (typeof msg[val + ''] === 'undefined') {
			var server = require('./c2g-index').server;
			var logMgr = server.logMgr;
			var sysMsg = new build.SystemMessage();
			sysMsg['res'] = build.SystemMessage.Result['UNDEFINED_FIELD'];
			write(response, toStream(sysMsg));
			return false;
		}
	}
	return true;
}

function VersionInfoHandler(response, data, session_id){
	var msg = build.VersionInfo.decode(data);
	var rMsg = new build.VersionInfoReply();
	var sysMsg = new build.SystemMessage();
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;
	var mysqlMgr = server.getMysqlMgr();

	if (inspectField(response, msg) === false) {
		logMgr.addLog('ERROR', 'Undefined field is detected in [VersionInfoHandler]');
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
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;
	var mysqlMgr = server.getMysqlMgr();

	if (inspectField(response, msg) === false) {
		logMgr.addLog('ERROR', 'Undefined field is detected in [RegisterAccountHandler]');
		return ;
	} 

	mysqlMgr.createUser(msg['k_id'], function (res) {
		id = res['res'];

		if (id === 0) {
			logMgr.addLog('ERROR', 'Already exsisting account : ' + msg['k_id']);
			sysMsg['res'] = build.SystemMessage.Result['EXISTING_ACCOUNT'];
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
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;
	
	session.toAuthUnregisterSession(session_id, function (res) {
		var mysqlMgr = server.getMysqlMgr();
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[UnregisterAccount] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [UnregisterAccountHandler]');
			return ;
		}

		mysqlMgr.loadUser(kId, function (res) {
			var id = res['res'];

			if (id <= 0) {
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				logMgr.addLog('ERROR', '[UnregisterAccount] Invalid Account : ' + kId + ', ' + res);
				write(response, toStream(sysMsg));
				return ;
			}

			mysqlMgr = server.getMysqlMgr();
			mysqlMgr.deleteUser(id, function (res) {
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
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;
	var mysqlMgr = server.getMysqlMgr();

	if (inspectField(response, msg) === false) {
		logMgr.addLog('ERROR', 'Undefined field is detected in [LoginHandler]');
		return ;
	}
		
	mysqlMgr.loadUser(msg['k_id'], function (res) {
		var id = res['res'];

		if (id <= 0) {
			logMgr.addLog('SYSTEM', '[LoginHandler] Invalid account (res : ' + res + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
			write(response, toStream(sysMsg));
			return ;
		}

		mysqlMgr = server.getMysqlMgr();
		mysqlMgr.isBlack(msg['k_id'], function (res) {
			if (res['res']) {
				logMgr.addLog('SYSTEM', 'blocked account access : (' + msg['k_id'] + ')');
				sysMsg['res'] = build.SystemMessage.Result['BLOCKED_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}	

			mysqlMgr = server.getMysqlMgr();
			mysqlMgr.loadUserInfo(id, function (res) {
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
					rMsg['cash'] = info['cash'];
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

					// item
					rMsg['item_1'] = info['item_1'];
					rMsg['item_2'] = info['item_2'];
					rMsg['item_3'] = info['item_3'];
					rMsg['item_4'] = info['item_4'];
					rMsg['item_5'] = info['item_5'];
					rMsg['random'] = info['random'];
					
					var _mileage = info['mileage'];
					var _draw = info['draw'];

					var _lastCall = function (mileage, draw) {
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
						mysqlMgr = server.getMysqlMgr();
						mysqlMgr.updateUvOn(id, function (res) {
							_mileage = info['mileage'] + 5;

							var _callback_1 = function (mileage, draw) {
								mysqlMgr = server.getMysqlMgr();
								mysqlMgr.updateMileage(id, mileage, function (res) {
									_lastCall(mileage, draw);							
								});
							};

							if (_mileage >= 100) {
								_mileage -= 100;
								++_draw;

								mysqlMgr = server.getMysqlMgr();
								mysqlMgr.updateDraw(id, _draw, function (res) {
									_callback_1(_mileage, _draw);
								});
							} else {
								_callback_1(_mileage, _draw);
							}
						});
					} else {
						_lastCall(_mileage, _draw);
					}
				});
			});

			var AccountLogin = build.AccountLogin;
			var req = new AccountLogin();
			req['k_id'] = msg['k_id'];

			request(req);
		}); // end mysqlMgr();
	}); // end mysqlMgr()
} // end LoginHandler

function LogoutHandler(response, data, session_id){
	var msg = build.Logout.decode(data);
	var sysMsg = new build.SystemMessage();
	var server = require('./c2g-index').server;
	var rMsg = new build.LogoutReply();
	var logMgr = server.logMgr;

	session.toAuthUnregisterSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[Logout] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [LogoutHandler]');
			return ;
		}
		
		var mysqlMgr = server.getMysqlMgr();
		mysqlMgr.loadUser(kId, function (res) {
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
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[CheckInCharge] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [CheckInChargeHandler]');
			return ;
		} 

		var mysqlMgr = server.getMysqlMgr();
		mysqlMgr.loadUser(kId, function (res) {
			var id = res['res'];

			if (id <= 0) {
				logMgr.addLog('ERROR', '[CheckInCharge] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysqlMgr = server.getMysqlMgr();
			mysqlMgr.checkInCharge(id, function (res) {
				var last = res['last_charged_time'];
				var energy = res['energy'];
				var energyMax = 100;
				var now = new Date().getTime();
				now = convertMS2S(now);

				var _lastCall = function () {
					write(response, toStream(rMsg));
				};

				if (energyMax === energy) {
					rMsg['energy'] = energyMax;
					rMsg['last_charged_time'] = now;

					mysqlMgr = server.getMysqlMgr();
					mysqlMgr.updateLastChargeTime(id, now, function (res) {
						_lastCall();
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

						mysqlMgr = server.getMysqlMgr();
						mysqlMgr.updateLastChargeTime(id, uptodate, function (res) {
							mysqlMgr = server.getMysqlMgr();
							mysqlMgr.updateEnergy(id, energy, function (res) {
								_lastCall();
							});
						});
					} else {
						if (energy === 0) {
							rMsg['energy'] = 0;
						} else {
							rMsg['energy'] = energy;
						}
						
						rMsg['last_charged_time'] = last;
						_lastCall();
					} // end else
				} // end else
			}); // end mysqlMgr()
		}); // end mysqlMgr()
	});
} // end CheckInChargeHandler

function SelectCharacterHandler(response, data, session_id){
	var msg = build.SelectCharacter.decode(data);
	var rMsg = new build.SelectCharacterReply();
	var sysMsg = new build.SystemMessage();
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[SelectCharacter] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [SelectCharacterHandle]');
			return ;
		} 

		var mysqlMgr = server.getMysqlMgr();
		mysqlMgr.loadUser(kId, function (res) {
			var id = res['res'];

			if (id <= 0) {
				logMgr.addLog('ERROR', '[SelectCharacter] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysqlMgr = server.getMysqlMgr();
			mysqlMgr.selectCharacters(id, function (res) {
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
					mysqlMgr = server.getMysqlMgr();
					mysqlMgr.updateSelectedCharacter(id, selected, function (res) {
						write(response, toStream(rMsg));
					});
				} else {
					logMgr.addLog('ERROR', '[SelectCharacter] This user (' + kId + ') does not have this character (' + selected + ')');
					sysMsg['res'] = build.SystemMessage.Result['NOT_HAVING'];
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
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;

	var doubleExp = false;

	var startTrace = function () {
		var now = new Date();

		session.toAuthTraceStartGame(session_id, convertMS2S(now.getTime()), doubleExp);
	};

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[StartGame] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [StartGameHandler]');
			return ;
		}

		var energyMax = 100;

		var mysqlMgr = server.getMysqlMgr();
		mysqlMgr.loadUser(kId, function (res) {
			var id = res['res'];

			if (id <= 0) {
				logMgr.addLog('ERROR', '[StartGame] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysqlMgr = server.getMysqlMgr();
			mysqlMgr.startGame(id, function (res) {
				var info = res;
				var character = info['selected_character'];
				var energy = info['energy'];
				var last = info['last_charged_time'];

				if (energy < 1) {
					logMgr.addLog('system', '[StartGame] Not enough energy : ' + kId);
					sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_ENERGY'];
					write(response, toStream(sysMsg));
					return ;
				}

				if (energy == energyMax) {
					last = new Date().getTime();	
					last = convertMS2S(last);
				}
				energy -= 1;

				rMsg['energy'] = energy;
				rMsg['last_charged_time'] = last;
			
				mysqlMgr = server.getMysqlMgr();
				mysqlMgr.updateLastChargeTime(id, last, function (res) {
					mysqlMgr = server.getMysqlMgr();
					mysqlMgr.updateEnergy(id, energy, function (res) {
						var dataMgr = server.dataMgr;
						var itemData = dataMgr.itemData;

						var procedureCallList = [];

						for (var i = 0; i < 4; ++i) {
							var item = itemData[i];
							var itemId = item['ID'];
							var on = false;
							var amount = info['_'+itemId];
							var rest = amount;

							if (amount > 0) {
								procedureCallList.push(itemId);
								rest = amount - 1;
								on = true;
							}

							rMsg['used_item_list'].push({'id': itemId,  'on': on, 'rest': rest});
						}

						if (info['random'] !== 0) {
							procedureCallList.push(itemId);

							var item = itemData.getItemDataById([info['random']]);
							var itemId = item['ID'];
							rMsg['user_item_list'].push({'id': itemId, 'on': true, 'rest': 0});
						}

						if (procedureCallList.length === 0) {
							startTrace();
							write(response, toStream(rMsg));
							return ;
						}

						var lastCallTrigger = procedureCallList.length;

						var wrap = function (idx) {
							var _lastCall = function (idx) {
								++idx;

								if (idx === lastCallTrigger) {
									startTrace();
									write(response, toStream(rMsg));
								} else {
									wrap(idx);
								}
							};

							var item = dataMgr.getItemDataById(procedureCallList[idx]);
							var itemId = item['ID'];

							mysqlMgr = server.getMysqlMgr();
							if (5 < itemId) {
								mysqlMgr.updateRandom(id, 0, function (res) { 
									_lastCall(idx);
								});
							} else {
								mysqlMgr.updateItem(id, -1, itemId, function (res) { 
									_lastCall(idx);
								});
							}
						};

						wrap(0);
					});
				});
			});
		}); // end sea_LoadUser
	});
} // end StartGameHandler

function EndGameHandler(response, data, session_id){
	var msg = build.EndGame.decode(data);
	var rMsg = new build.GameResult();
	var sysMsg = new build.SystemMessage();
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;

	session.toAuthUpdateEndGameSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[EndGame] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [EndGameHandler]');
			return ;
		}

		var mysqlMgr = server.getMysqlMgr();
		mysqlMgr.loadUser(kId, function (res) {
			var id = res['res'];

			if (id <= 0) {
				logMgr.addLog('ERROR', '[EndGame] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysqlMgr = server.getMysqlMgr();
			mysqlMgr.loadUserInfo(id, function (res) {
				var info = res;
				var _lastCall = function () {
					write(response, toStream(rMsg));
				};

				var selectedCharacter = info['selected_character'];

				// TODO : Detecting Cheating
				mysqlMgr = server.getMysqlMgr();
				mysqlMgr.selectCharacters(id, function (res) {
					var characterLevel = res['_' + selectedCharacter];
					var dataMgr = require('./c2g-index').server.dataMgr;
					var characterData = dataMgr.getCharacterDataByIdAndLv(selectedCharacter, characterLevel);
					// Character bonus coefficient
					var characterScoreCoefficient = characterData['Char_Score'];
					var characterExpCoefficient = characterData['Char_Exp'];
					var characterCoinCoefficient = characterData['Char_Coin'];

					mysqlMgr = server.getMysqlMgr();
					mysqlMgr.loadGhostHouse(id, function (res) {
						var ghostHouseInfo = res;

						// House & ghost card match bonus coefficient
						var houseMatchCardScoreCoefficient = 0;
						var houseMatchCardExpCoefficient = 0;
						var houseMatchCardCoinCoefficient = 0;
						var E_Match_Card = define.E_Match_Card;

						// ghost card bonus coefficient
						var ghostCardScoreCoefficient = 0;
						var ghostCardExpCoefficient = 0;
						var ghostCardCoinCoefficient = 0;
						
						for (var i = 0; i < ghostHouseInfo.length / 2; ++i) {
							var ghostCard = ghostHouseInfo['_' + i];
							
							if (ghostCard !== -1) {
								var ghostHouseData = dataMgr.getHouseDataById(i);

								if (ghostHouseData['Match_Card_ID'] === ghostCard) {
									var type = ghostHouseData['Match_Card_Bonus_Effect_Type'];
									var value = ghostHouseData['Match_Card_Bonus_Effect_Value'];

									if (E_Match_Card[type] === 'Add_Score') {
										houseMatchCardScoreCoefficient += value;
									} else if (E_Match_Card[type] === 'Add_Coin') {
										houseMatchCardCoinCoefficient += value;
									} else if (E_Match_Card[type] === 'Add_Exp') {
										houseMatchCardExpCoefficient += value;
									}
								}

								var ghostCardData = dataMgr.getGhostDataById(ghostCard);

								ghostCardScoreCoefficient += ghostCardData['Card_Score'];
								ghostCardExpCoefficient += ghostCardData['Card_Exp'];
								ghostCardCoinCoefficient += ghostCardData['Card_Coin'];
							}
						}

						mysqlMgr = server.getMysqlMgr();
						mysqlMgr.selectCharacterCostumes(id, selectedCharacter, function (res) {
							var costumeHead = res['head'];
							var costumeTop = res['top'];
							var costumeBottoms = res['bottoms'];
							var costumeBack = res['back'];

							// costume bonus coefficient
							var costumeScoreCoefficient = 0;
							var costumeExpCoefficient = 0;
							var costumeCoinCoefficient = 0;

							if (costumeHead !== 0) {
								var data = dataMgr.getCostumeDataById(costumeHead);
								costumeScoreCoefficient += data['Costume_Score'];
								costumeExpCoefficient += data['Costume_Exp'];
								costumeCoinCoefficient += data['Costume_Coin'];
							}

							if (costumeTop !== 0) {
								var data = dataMgr.getCostumeDataById(costumeTop);
								costumeScoreCoefficient += data['Costume_Score'];
								costumeExpCoefficient += data['Costume_Exp'];
								costumeCoinCoefficient += data['Costume_Coin'];
							}

							if (costumeBottoms !== 0) {
								var data = dataMgr.getCostumeDataById(costumeBottoms);
								costumeScoreCoefficient += data['Costume_Score'];
								costumeExpCoefficient += data['Costume_Exp'];
								costumeCoinCoefficient += data['Costume_Coin'];
							}

							if (costumeBack !== 0) {
								var data = dataMgr.getCostumeDataById(costumeBack);
								costumeScoreCoefficient += data['Costume_Score'];
								costumeExpCoefficient += data['Costume_Exp'];
								costumeCoinCoefficient += data['Costume_Coin'];
							}							

							// Score Reward
							var scoreReward = msg['score'];
							var bonusScore = scoreReward * (characterScoreCoefficient + houseMatchCardScoreCoefficient + ghostCardScoreCoefficient + costumeScoreCoefficient);

							rMsg['score'] = scoreReward;
							rMsg['bonus_score'] = bonusScore;
							rMsg['total_score'] = scoreReward + bonusScore;

							// Mileage Reward
							var mileage = info['mileage'];
							var draw = info['draw'];
							var mileageReward = msg['mileage'];

							mileage += mileageReward;

							mysqlMgr = server.getMysqlMgr();
							if (100 <= mileage) {
								++draw;
								mileage -= 100;
								mysqlMgr.updateDraw(id, draw, function (res) { });
							}

							mysqlMgr.updateMileage(id, mileage, function (res) { });

							rMsg['mileage'] = mileageReward;
							rMsg['total_mileage'] = mileage;
							rMsg['draw'] = draw;				

							// Coin Reward
							var coin = info['coin'];
							var coinReward = msg['coin'];
							var bonusCoin = coinReward * (characterCoinCoefficient + houseMatchCardCoinCoefficient + ghostCardCoinCoefficient + costumeCoinCoefficient);

							coin += coinReward + bonusCoin;

							rMsg['coin'] = coinReward;
							rMsg['bonus_coin'] = bonusCoin;
							rMsg['total_coin'] = coin;

							// Exp Reward
							// TODO : Computing item Bonus Exp.
							var lv = info['lv'];
							var exp = info['exp'];
							var expReward = msg['dist'] * 0.1;
							var bonusExp = expReward * (characterExpCoefficient + houseMatchCardExpCoefficient + ghostCardExpCoefficient + costumeExpCoefficient);
							var dataMgr = require('./c2g-index').server.dataMgr;
							var levelTable = dataMgr.getLevelData(lv);

							exp += expReward + bonusExp;

							if (levelTable !== false) {
								while (levelTable['Exp'] <= exp) {
									exp -= levelTable['Exp'];
									++lv;					
									levelTable = dataMgr.getLevelData(lv);
								}
							}

							rMsg['level'] = lv;
							rMsg['exp'] = expReward;
							rMsg['bonus_exp'] = bonusExp;
							rMsg['total_exp'] = exp;

							mysqlMgr.updateExp(id, exp, function (res) {								
								mysqlMgr.updateCoin(id, coin, function (res) { _lastCall(); });
							});
							mysqlMgr.updateUserLog(id, rMsg['total_score'], msg['dist'], msg['enemy_kill'], function (res) {});

							var UserGamePlay = build.UserGamePlay;
							var req = new UserGamePlay();

							req['k_id'] = kId;
							req['selected_character'] = info['selected_character'];
							req['score'] = msg['score'];
							req['enemy_kill'] = msg['enemy_kill'];
							req['dist'] = msg['dist'];
							req['play_time'] = msg['play_time'];
							req['shield'] = info['item_1'];
							req['item_last'] = info['item_2'];
							req['ghostify'] = info['item_3'];
							req['immortal'] = info['item_4'];
							req['exp_boost'] = info['item_5'];
							req['random'] = info['random'];

							request(req);
						});
					});
				});
			});
		});
	});
} // end EndGameHandler

function LoadRankInfoHandler(response, data, session_id){
	var msg = build.LoadRankInfo.decode(data);
	var rMsg = new build.RankInfo();
	var sysMsg = new build.SystemMessage();
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[LoadRankInfo] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [LoadRankInfoHandler]');
			return ;
		}

		var mysqlMgr = server.getMysqlMgr();
		mysqlMgr.loadUser(kId, function (res) {
			var id = res['res'];

			if (id <= 0) {
				logMgr.addLog('ERROR', '[LoadRankInfo] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

//			var rankingList = require('./c2g-index').server.rankingList;
			
//			if (rankingList.length === 0 || rankingList.length === 1) {
				rMsg['overall_ranking'] = 1;
				write(response, toStream(rMsg));
//			} else {
//				// FIXME
//				mysqlMgr.loadEnergyBySender(id, function(res) {							
//					var receiver_id = res[0]['receiver_id'];
//
//					if (receiver_id === 0) {
//						for (var i = 0, l = rankingList.length; i < l; ++i) {
//							var score = rankingList[i]['highest_score'];
//							var energy_sended = 0;
//							
//							rMsg['ranking_list'].push({'k_id': rankingList[i]['k_id'], 'score': score, 'energy_sended': energy_sended});
//
//							if (rankingList[i]['k_id'] === kId) {
//								rMsg['overall_ranking'] = i+1;
//							} else {
//								rMsg['overall_ranking'] = 0;
//							}
//						}
//						write(response, toStream(rMsg));
//					} else {
//						var length = res.length;
//						var count = 0;
//						var list = res;
//						var temp = [];
//						var loadUserKIdCallback = function(res) {
//							++count;
//							temp.push(res['res']);
//
//							if (count === length) {
//								for (var i = 0, l = rankingList.length; i < l; ++i) {
//									var score = rankingList[i]['highest_score'];
//									var energy_sended = 0;
//
//									for(var val in temp) {
//										if (rankingList[i]['k_id'] === temp[val]) {
//											energy_sended = 1;
//											break;
//										}
//									}
//									
//									rMsg['ranking_list'].push({'k_id': rankingList[i]['k_id'], 'score': score, 'energy_sended': energy_sended});
//
//									if (rankingList[i]['k_id'] === kId) {
//										rMsg['overall_ranking'] = i+1;
//									} else {
//										rMsg['overall_ranking'] = 0;
//									}
//								}
//								write(response, toStream(rMsg));
//							}
//						};
//
//						for (var i = 0; i < length; ++i) {
//							mysqlMgr.loadUserKId(list[i]['receiver_id'], loadUserKIdCallback);
//						}
//					} // end else						
//				}); // end mysqlMgr()
//			}
		});
	});
} // end LoadRankInfoHandler

function LoadPostboxHandler(response, data, session_id){
	var msg = build.LoadPostbox.decode(data);
	var rMsg = new build.Postbox();
	var sysMsg = new build.SystemMessage();
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[LoadPostbox] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [LoadPostbox]');
			return ;
		}

		var mysqlMgr = server.getMysqlMgr();
		mysqlMgr.loadUser(kId, function (res) {
			var id = res['res'];
		
			if (id <= 0) {
				logMgr.addLog('ERROR', '[LoadPostbox] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			var _callback_4 = function () {
				mysqlMgr = server.getMysqlMgr();
				mysqlMgr.loadEvolutionByReceiverId(id, function (res) {
					var sender_id = res[0]['sender_id'];

					if (sender_id === 0) {
						write(response, toStream(rMsg));
						return;
					}

					var list = res;
					var lastCallTrigger = list.length;
					
					var wrap = function (idx) {
						var accepted = list[idx]['accepted'];

						var _lastCall = function (idx) {
							++idx;

							if (idx === lastCallTrigger) {
								write(response, toStream(rMsg));
							} else {
								wrap(idx);
							}
						};

						if (accepted === 1) {
							_lastCall(idx);
							return ;
						}

						mysqlMgr = server.getMysqlMgr();
						mysqlMgr.loadUserKId(list[idx]['sender_id'], function (res) {
							var sender_k_id = res['res'];
							var item = list[idx];

							rMsg['evolution'].push({'sender_k_id': sender_k_id, 'character_id': item['character_id'], 'sended_time': item['sended_time']});

							_lastCall(idx);
						});
					};

					wrap(0);
				});
			};

			var _callback_3 = function () {
				mysqlMgr = server.getMysqlMgr();
				mysqlMgr.loadBatonResult(id, function (res) {
					var sender_id = res[0]['sender_id'];

					if (sender_id === 0) {
						_callback_4();
						return;
					}

					var list = res;
					var nextCallTrigger = list.length;

					var wrap = function (idx) {
						mysqlMgr = server.getMysqlMgr();
						mysqlMgr.loadUserKId(list[idx]['sender_id'], function (res) {
							var temp = res['res'];
							var cp = list[idx];
							
							rMsg['baton_result'].push({'sender_k_id':temp, 'acquisition_score':cp['score'], 'sended_time':cp['sended_time']});

							++idx;
							if (idx === nextCallTrigger) {
								console.log('callback_4');
								_callback_4();
							} else {
								wrap(idx);
							}
						});
					};

					wrap(0);
				});
			};

			var _callback_2 = function () {
				mysqlMgr = server.getMysqlMgr();
				mysqlMgr.loadBaton(id, function (res) {
					var sender_id = res[0]['sender_id'];

					if (sender_id === 0) {
						_callback_3();
						return;
					}

					var list = res;
					var nextCallTrigger = list.length;

					var wrap = function (idx) {
						mysqlMgr = server.getMysqlMgr();
						mysqlMgr.loadUserKId(list[idx]['sender_id'], function (res) {
							var res = res['res'];
							var cp = list[idx];
							rMsg['baton'].push({'sender_k_id':res, 'map_name':cp['map'], 'last_score':cp['score'], 'sended_time':cp['sended_time']});

							++idx;
							if (idx === nextCallTrigger) {
								console.log('callback_3');
								_callback_3();
							} else {
								wrap(idx);
							}
						});
					};

					wrap(0);
				});
			};

			var _callback_1 = function () {
				mysqlMgr = server.getMysqlMgr();
				mysqlMgr.loadEnergyByReceiver(id, function (res) {
					var sender_id = res[0]['sender_id'];

					if (sender_id === 0) {
						_callback_2();						
						return;
					}
					
					var list = res;
					var nextCallTrigger = list.length;

					var wrap = function (idx) {
						mysqlMgr = server.getMysqlMgr();
						mysqlMgr.loadUserKId(list[idx]['sender_id'], function (res) {
							var res = res['res'];
							
							rMsg['energy'].push({
								'sender_k_id': res,
								'amount': list[idx]['amount'],
								'sended_time': list[idx]['sended_time'],
							});
							
							++idx;
							if (idx === nextCallTrigger) {
								_callback_2();
							} else {
								wrap(idx);
							}
						});
					};

					wrap(0);
				});
			};

			_callback_1();
		});
	});
} // end LoadPostboxHandler

function BuyItemHandler(response, data, session_id){
	var msg = build.BuyItem.decode(data);
	var BuyItemReply = build.BuyItemReply;
	var rMsg = new BuyItemReply();
	var sysMsg = new build.SystemMessage();
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[BuyItem] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [BuyItemHandler]');
			return ;
		}

		var mysqlMgr = server.getMysqlMgr();
		mysqlMgr.loadUser(kId, function (res) {
			var id = res['res'];

			if (id <= 0) {
				logMgr.addLog('ERROR', '[BuyItem] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysqlMgr = server.getMysqlMgr();
			mysqlMgr.loadUserBriefInfo(id, function(res) {
				var coin = res['coin'];
				var dataMgr = require('./c2g-index').server.dataMgr;
				var itemId = msg['item'];
				var itemData = dataMgr.getItemDataById(itemId);

				if (itemId < build.BuyItem.Limit['MIN']	|| build.BuyItem.Limit['MAX'] < itemId) {
					logMgr.addLog('ERROR', '[BuyItem] Invalid item (' + kId + ', ' + itemId + ')');
					sysMsg['res'] = build.SystemMessage.Result['INVALID_ITEM'];
					write(response, toStream(sysMsg));
					return;
				}

				var priceCoin = itemData['Price_Coin'];

				if (coin < priceCoin) {
					logMgr.addLog('SYSTEM', '[BuyItem] Not enough coin (' + kId + ')');
					sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_COIN'];
					write(response, toStream(sysMsg));
					return;
				}

				var _mileage = res['mileage'] + 5;
				var _draw = res['draw'];
				var _lastCall = function () {
					write(response, toStream(rMsg));
				};

				mysqlMgr = server.getMysqlMgr();
				if (_mileage >= 100) {
					++_draw;
					_mileage -= 100;
					mysqlMgr.updateDraw(id, _draw, function (res) { });
				}

				mysqlMgr.updateMileage(id, _mileage, function (res) { });

				rMsg['mileage'] = _mileage;
				rMsg['draw'] = _draw;
				rMsg['coin'] = coin - priceCoin;

				if (itemId < build.BuyItem.Limit['MAX']) {
					rMsg['item'] = msg['item'];
		
					mysqlMgr.updateItem(id, 1, itemData['ID'], function (res) { 
						mysqlMgr = server.getMysqlMgr();
						mysqlMgr.updateCoin(id, rMsg['coin'], function (res) {
							_lastCall();
						}); 
					});
				} else {
					var length = dataMgr.itemData.length;
					var itemId = Math.floor(Math.random() * length) + 1;
					var itemData = dataMgr.getItemDataById(itemId);
												
					rMsg['item'] = itemData['ID'];
					
					mysqlMgr.updateRandom(id, itemData['ID'], function (res) {
						if (res !== 0) {
							rMsg['coin'] -= (priceCoin/2);								
						} else {
							rMsg['coin'] -= priceCoin;
						}

						mysqlMgr = server.getMysqlMgr();
						mysqlMgr.updateCoin(id, rMsg['coin'], function (res) {
							_lastCall();
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
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[BuyOrUpgradeCharacter] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [BuyOrUpgradeCharacterHandler]');
			return ;
		} 
		
		var mysqlMgr = server.getMysqlMgr();
		mysqlMgr.loadUser(kId, function (res) {
			var id = res['res'];		
			
			if (id <= 0) {
				logMgr.addLog('ERROR', '[BuyOrUpgradeCharacter] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysqlMgr = server.getMysqlMgr();
			mysqlMgr.selectCharacters(id, function (res) {
				var character = msg['character'];
				var lv = res['_' + character];
				
				if (lv === 5 || lv === 10 || lv === 15) {
					logMgr.addLog('SYSTEM', '[BuyOrUpgradeCharacter] wrong approach detected (' + k_id + ')');
					sysMsg['res'] = build.SystemMessage.Result['WRONG_APPROACH'];
					write(response, toStream(sysMsg));
					return ;
				}

				var dataMgr = require('./c2g-index').server.dataMgr;
				var characterData = dataMgr.getCharacterDataByIdAndlv(character, lv);

				if (character <= 0  || dataMgr.characterData.length < character) {
					logMgr.addLog('ERROR', '[BuyOrUpgradeCharacter] Invalid character (' + kId + ', ' + character + ')');
					sysMsg['res'] = build.SystemMessage.Result['NO_MATHCH_WITH_DB'];
					write(response, toStream(sysMsg));

					return;
				}

				if (dataMgr.characterData[character].length <= lv) {
					logMgr.addLog('ERROR', '[BuyOrUpgradeCharacter] The character is fully upgraded. (' + kId + ')');
					sysMsg['res'] = build.SystemMessage.Result['FULLY_UPGRADED'];
					write(response, toStream(sysMsg));
					return;
				}

				mysqlMgr = server.getMysqlMgr();
				mysqlMgr.loadUserBriefInfo(id, function (res) {
					var priceCoin = characterData['Price_Coin'];
					var priceCash = characterData['Price_Cash'];
					var coin = res['coin'];
					var cash = res['cash'];

					if (0 < priceCoin && coin < priceCoin) {
						logMgr.addLog('SYSTEM', '[BuyOrUpgradeCharacter] Not enough coin (' + kId + ')');
						sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_COIN'];
						write(response, toStream(sysMsg));
						return ;
					}

					if (0 < priceCash && cash < priceCahs) {
						logMgr.addLog('SYSTEM', '[BuyOrUpgradeCharacter] Not enough cash (' + kId + ')');
						sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_CASH'];
						write(response, toStream(sysMsg));
						return ;
					}

					mysqlMgr = server.getMysqlMgr();
					mysqlMgr.addCharacter(id, character, function (res) {
						var newLv = res['res'];

						if (newLv !== lv + 1) {
							logMgr.addLog('ERROR', '[BuyOrUpgradeCharacter] Failed to upgrade on DB(' + kId + ', ' + character + ')');
							sysMsg['res'] = build.SystemMessage.Result['FAILED_DB_UPDATE'];
							write(response, toStream(sysMsg));
							return;
						}

						mysqlMgr = server.getMysqlMgr();
						mysqlMgr.loadMileageAndDraw(id, function (res) {
							var _res = res;
							var _mileage = _res['mileage'];
							var _draw = _res['draw'];
							var _lastCall = function () {								
								write(response, toStream(rMsg));
							};

							if (newLv === 1) {
								_mileage += 30;
							} else {
								_mileage += 10;
							}

							mysqlMgr = server.getMysqlMgr();
							if (_mileage >= 100) {
								++_draw;
								_mileage -= 100;
								mysqlMgr.updateDraw(id, _draw, function (res) { });
							}

							mysqlMgr.updateMileage(id, _mileage, function (res) { });

							rMsg['mileage'] = _mileage;
							rMsg['draw'] = _draw;
							rMsg['character'] = character;
							rMsg['lv'] = newLv;
							rMsg['coin'] = coin - priceCoin;
							rMsg['cash'] = cash - priceCash;

							if (0 < priceCoin && 0 < priceCash) {
								mysqlMgr.updateCoin(id, pay, function (res) { });
								mysqlMgr.updateCash(id, pay, function (res) { _lastCall(); });
							} else if (0 < priceCoin) {
								mysqlMgr.updateCoin(id, pay, function (res) { _lastCall(); });
							} else if (0 < priceCash) {
								mysqlMgr.updateCash(id, pay, function (res) { _lastCall(); });
							}
						});
					});
				});
			});
		});
	});
} // end BuyOrUpgradeCharacterHandler

function SendEnergyHandler(response, data, session_id){
	var msg = build.SendEnergy.decode(data);
	var rMsg = new build.SendEnergyReply();
	var sysMsg = new build.SystemMessage();
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[SendEnergy] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [SendEnergyHandle]');
			return ;
		}

		var mysqlMgr = server.getMysqlMgr();
		mysqlMgr.loadUser(kId, function (res) {
			var sender_id = res['res'];		
			
			if (sender_id <= 0) {
				logMgr.addLog('ERROR', '[SendEnergy] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysqlMgr = server.getMysqlMgr();
			mysqlMgr.loadUser(msg['receiver_k_id'], function(res) {
				var receiver_id = res['res'];

				if (receiver_id <= 0) {
					logMgr.addLog('ERROR', '[SendEnergy] Invalid account (' + msg['receiver_k_id'] + ')');
					sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
					write(response, toStream(sysMsg));
					return ;
				}

				mysqlMgr = server.getMysqlMgr();
				mysqlMgr.loadMileageAndDraw(sender_id, function (res) {
					var _res = res;
					var _lastCall = function () {
						write(response, toStream(rMsg));
					};

					mysqlMgr = server.getMysqlMgr();
					mysqlMgr.addEnergy(sender_id, receiver_id, 1, function(res) { });
						
					var _mileage = _res['mileage'] + 10;
					var _draw = _res['draw'];

					if (_mileage >= 100) {
						++_draw;
						_mileage -= 100;
						mysqlMgr.updateDraw(id, _draw, function (res) { });
					}

					rMsg['mileage'] = _mileage;
					rMsg['draw'] = _draw;

					mysqlMgr.updateMileage(id, _mileage, function (res) { _lastCall(); });
				});
			});
		});
	});
} // end SendEnergyHandler

function AcceptEnergyHandler(response, data, session_id){
	var msg = build.AcceptEnergy.decode(data);
	var rMsg = new build.AcceptEnergyReply();
	var sysMsg = new build.SystemMessage();
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;

	session.toAuthUpdateSession(kId, session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[AcceptEnergy] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [AcceptEnergyHandler]');
			return ;
		}

		var mysqlMgr = server.getMysqlMgr();
		mysqlMgr.loadUser(kId, function (res) {
			var receiver_id = res['res'];		
			
			if (receiver_id <= 0) {
				logMgr.addLog('ERROR', '[AcceptEnergy] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysqlMgr = server.getMysqlMgr();
			mysqlMgr.loadUser(msg['sender_k_id'], function(res) {
				var sender_id = res['res'];

				if (sender_id <= 0) {
					logMgr.addLog('ERROR', '[AcceptEnergy] Invalid account (' + msg['sender_k_id'] + ')');
					sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
					write(response, toStream(sysMsg));
					return ;
				}

				mysqlMgr = server.getMysqlMgr();
				mysqlMgr.acceptEnergy(sender_id, receiver_id, msg['sended_time'], function (res) {
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
						energy = energyMax;		
					} else {
						energy = res + 1;
					}

					mysqlMgr = server.getMysqlMgr();
					mysqlMgr.updateEnergy(receiver_id, energy, function(res) {
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
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[RequestBaton] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', '[RequestBaton] Undefined field is detected in RequestBatonHandler');
			return ;
		}

		var mysqlMgr = server.getMysqlMgr();
		mysqlMgr.loadUser(kId, function (res) {
			var sender_id = res['res'];		

			if (sender_id <= 0) {
				logMgr.addLog('ERROR', '[RequestBaton] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysqlMgr = server.getMysqlMgr();
			mysqlMgr.loadUser(msg['receiver_k_id'], function(res) {
				var receiver_id = res['res'];

				if (receiver_id <= 0) {
					logMgr.addLog('ERROR', '[RequestBaton] Invalid account (' + msg['receiver_k_id'] + ')');
					sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
					write(response, toStream(sysMsg));
					return ;
				}

				mysqlMgr = server.getMysqlMgr();
				mysqlMgr.loadCoin(sender_id, function (res) {
					var coin = res['coin'];
					var batonRequestCost = 1000;

					if (coin < batonRequestCost) {
						logMgr.addLog('SYSTEM', '[RequestBaton] Not enough coin (' + k_id + ')');
						sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_COIN'];
						write(response, toStream(sysMsg));
						return ;
					}

					var restCoin = coin - batonRequestCost;
					var _lastCall = function () {
						write(response, toStream(rMsg));					
					};

					rMsg['coin'] = restCoin;
					
					mysqlMgr = server.getMysqlMgr();
					mysqlMgr.updateCoin(sender_id, restCoin, function (res) { });
					mysqlMgr.addBaton(sender_id, receiver_id, msg['score'], msg['map'], function (res) { _lastCall(); });
				});
			});
		});
	});
} // end RequestBatonHandler

function AcceptBatonHandler(response, data, session_id){
	var msg = build.AcceptBaton.decode(data);
	var rMsg = new build.AcceptBatonReply();
	var sysMsg = new build.SystemMessage();
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[AcceptBaton] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [AcceptBatonHandler]');
			return ;
		}

		mysqlMgr = server.getMysqlMgr();
		mysqlMgr.loadUser(kId, function (res) {
			var receiver_id = res['res'];
		
			if (receiver_id <= 0) {
				logMgr.addLog('ERROR', '[AcceptBaton] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysqlMgr = server.getMysqlMgr();
			mysqlMgr.loadUser(msg['sender_k_id'], function (res) {
				var sender_id = res['res'];

				if (sender_id <= 0) {
					logMgr.addLog('ERROR', '[AcceptBaton] Invalid account (' + msg['sender_k_id'] + ')');
					sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
					write(response, toStream(sysMsg));
					return ;
				}

				mysqlMgr = server.getMysqlMgr();
				mysqlMgr.existBaton(sender_id, receiver_id, msg['sended_time'], function (res) {
					res = res['res'];

					if (!res) {
						logMgr.addLog('ERROR', '[AcceptBaton] Invalid baton (sed:' + sender_id + ', rec:' + receiver_id + ', time: ' + msg['sended_time'] + ')');
						sysMsg['res'] = build.SystemMessage.Result['INVALID_BATON'];
						write(response, toStream(sysMsg));
						return ;
					}

					mysqlMgr = server.getMysqlMgr();
					mysqlMgr.startGame(receiver_id, function (res) {
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
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[EndBaton] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [EndBatonHandler]');
			return ;
		}

		var mysqlMgr = server.getMysqlMgr();
		mysqlMgr.loadUser(kId, function (res) {
			var receiver_id = res['res'];

			if (receiver_id <= 0) {
				logMgr.addLog('ERROR', '[EndBaton] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysqlMgr = server.getMysqlMgr();
			mysqlMgr.loadUser(msg['sender_k_id'], function (res) {
				var sender_id = res['res'];
				
				if (sender_id <= 0) {
					logMgr.addLog('ERROR', '[EndBaton] Invalid account (' + kId + ')');
					sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
					write(response, toStream(sysMsg));
					return ;
				}

				mysqlMgr = server.getMysqlMgr();
				mysqlMgr.loadBatonScore(sender_id, receiver_id, msg['sended_time'], function (res) {
					var score;
					res = res['score'];

					if (res === -1) {
						logMgr.addLog('ERROR', '[EndBaton] Invalid baton (sed:' + sender_id + ', rec:' + receiver_id + ', time: ' + msg['sended_time'] + ')');
						sysMsg['res'] = build.SystemMessage.Result['INVALID_BATON'];
						write(response, toStream(sysMsg));
						return ;
					} else {
						score = res;

						mysqlMgr = server.getMysqlMgr();
						mysqlMgr.loadCoin(receiver_id, function (res) {
							var coin = res['coin'];							
							var finalScore = msg['score'] + score;
							var _lastCall = function () {
								write(response, toStream(rMsg));
							};

							rMsg['coin'] = msg['coin'];
							rMsg['total_coin'] = msg['coin'] + coin;							

							mysqlMgr = server.getMysqlMgr();
							mysqlMgr.loadHighestScore(sender_id, function (res) {
								res = res['res'];

								if (finalScore <= res) {
									rMsg['update'] = false;
								} else {
									rMsg['update'] = true;
								}
							});

							mysqlMgr.updateCoin(receiver_id, rMsg['total_coin'], function (res) { });
							mysqlMgr.addBatonResult(receiver_id, sender_id, finalScore, function (res) { });
							mysqlMgr.deleteBaton(sender_id, receiver_id, msg['sended_time'], function (res) { _lastCall(); });
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
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[AcceptBatonResult] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [AcceptBatonResultHandler]');
			return ;
		}

		var mysqlMgr = server.getMysqlMgr();
		mysqlMgr.loadUser(kId, function (res) {
			var receiver_id = res['res'];

			if (receiver_id <= 0) {
				logMgr.addLog('ERROR', '[AcceptBatonResult] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysqlMgr = server.getMysqlMgr();
			mysqlMgr.loadUser(msg['sender_k_id'], function (res) {
				var sender_id = res['res'];
				
				if (sender_id <= 0) {
					logMgr.addLog('ERROR', '[AcceptBatonResult] Invalid account (' + msg['sender_k_id'] + ')');
					sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
					write(response, toStream(sysMsg));
					return ;
				}

				mysqlMgr = server.getMysqlMgr();
				mysqlMgr.loadBatonResultScore(sender_id, receiver_id, msg['sended_time'], function (res) {
					var score = res['score'];

					if (res === -1 ) {
						logMgr.addLog('ERROR', '[AcceptBatonResult] Invalid baton result (sed:' + sender_id + ', rec:' + receiver_id + ', time: ' + msg['sended_time'] + ')');
						sysMsg['res'] = build.SystemMessage.Result['INVALID_BATON_RESULT'];
						write(response, toStream(sysMsg));
						return ;
					}

					mysqlMgr = server.getMysqlMgr();
					mysqlMgr.loadHighestScore(sender_id, function (res) {
						res = res['res'];

						if (score <= res) {
							rMsg['update'] = false;
							rMsg['score'] = res;
						} else {
							rMsg['update'] = true;
							rMsg['score'] = score;

							// FIXME
							mysqlMgr = server.getMysqlMgr();
							mysqlMgr.updateUserLog(receiver_id, score, 0, 0, function (res) {});
						}

						mysqlMgr = server.getMysqlMgr();
						mysqlMgr.deleteBatonResult(sender_id, receiver_id, msg['sended_time'], function (res) {
							write(response, toStream(rMsg));
						});
					});
				});
			});
		});
	});
} // end AcceptBatonResultHandler

function InviteFriendHandler(response, data, session_id){
	var msg = build.InviteFriend.decode(data);
	var rMsg = new build.InviteFriendReply();
	var sysMsg = new build.SystemMessage();
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[InviteFriend] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [InviteFriendHandler]');
			return ;
		}

		var mysqlMgr = server.getMysqlMgr();
		mysqlMgr.loadUser(kId, function (res) {
			var id = res['res'];		
			
			if (id <= 0) {
				logMgr.addLog('ERROR', '[InviteFriend] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysqlMgr = server.getMysqlMgr();
			mysqlMgr.loadInviteCountWithMileageAndDraw(id, function (res) {
				var _invite = res['invite_count'] + 1;
				var _mileage = res['mileage'] + 10;
				var _draw = res['draw'];

				mysqlMgr = server.getMysqlMgr();
				mysqlMgr.updateInviteCount(id, _invite, function (res) {
					rMsg['invite_count'] = _invite;

					var _callback = function () {
						write(response, toStream(rMsg));							
					};

					mysqlMgr = server.getMysqlMgr();
					if (_mileage >= 100) {
						++_draw;
						_mileage -= 100;
						mysqlMgr.updateDraw(id, _draw, function (res) { });
					}

					rMsg['mileage'] = _mileage;
					rMsg['draw'] = _draw;

					mysqlMgr.updateMileage(id, _mileage, function (res) { _callback(); });

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
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[BuyCostume] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [BuyCostumeHandler]');
			return ;
		}

		var mysqlMgr = server.getMysqlMgr();
		mysqlMgr.loadUser(kId, function (res) {
			var id = res['res'];		
				
			if (id <= 0) {
				logMgr.addLog('ERROR', '[BuyCostume] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			var dataMgr = server.dataMgr;

			if (msg['costume_id'] <= 0 || dataMgr.costumeData.length <= msg['costume_id']) {
				logMgr.addLog('ERROR', '[BuyCostume] Invalid costume id');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_COSTUME_ID'];
				write(response, toStream(sysMsg));
				return ;
			}

			var costumeData = dataMgr.getCostumeDataById(msg['costume_id']);
			var priceCash = costumeData['Price_Cash'];
			var priceCoin = costumeData['Price_Coin'];

			mysqlMgr = server.getMysqlMgr();
			mysqlMgr.loadUserBriefInfo(id, function (res) {
				var coin = res['coin'];
				var cash = res['cash'];

				if (0 < priceCoin && coin < priceCoin) {
					logMgr.addLog('SYSTEM', '[BuyCostume] Not enough coin (' + kId + ')');
					sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_COIN'];
					write(response, toStream(sysMsg));
					return ;										
				}

				if (0 < priceCash && cash < priceCash) {
					logMgr.addLog('SYSTEM', '[BuyCostume] Not enough cash (' + kId + ')');
					sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_CASH'];
					write(response, toStream(sysMsg));
					return ;
				}

				mysql = server.getMysqlMgr();
				mysqlMgr.onCostume(id, msg['costume_id'], function (res) {
					rMsg['costume_id'] = msg['costume_id'];
					var _lastCall = function () {
						write(response, toStream(rMsg));
					};

					rMsg['cash'] = res['cash'] - priceCash;
					rMsg['coin'] = res['coin'] - priceCoin;
					
					var _mileage = res['mileage'] + 5;
					var _draw = res['draw'];

					mysql = server.getMysqlMgr();
					if (_mileage >= 100) {
						++_draw;
						_mileage -= 100;
						mysqlMgr.updateDraw(id, _draw, function (res) { });
					}
					
					rMsg['mileage'] = _mileage;
					rMsg['draw'] = _draw;

					mysqlMgr.updateMileage(id, _mileage, function (res) { });

					if (0 < priceCoin && 0 < priceCash) {
						mysqlMgr.updateCoin(id, rMsg['coin'], function (res) {});
						mysqlMgr.updateCash(id, rMsg['cash'], function (res) { _lastCall(); });
					} else if (0 < priceCoin) {
						mysqlMgr.updateCoin(id, rMsg['coin'], function (res) { _lastCall(); });
					} else if (0 < priceCash) {
						mysqlMgr.updateCash(id, rMsg['cash'], function (res) { _lastCall(); });
					}
				});
			});
		});
	});
} // end BuyCostumeHandler

function WearCostumeHandler(response, data, session_id) {
	var msg = build.WearCostume.decode(data);
	var rMsg = new build.WearCostumeReply();
	var sysMsg = new build.SystemMessage();
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[WearCostume] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [WearCostumeHandler]');
			return ;
		}

		mysqlMgr = server.getMysqlMgr();
		mysqlMgr.loadUser(kId, function (res) {
			var id = res['res'];		
			
			if (id <= 0) {
				logMgr.addLog('ERROR', '[WearCostume] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			var dataMgr = server.dataMgr;

			if (msg['costume_id'] <= 0 || dataMgr.costumeData.length <= msg['costume_id']) {
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

			mysqlMgr = server.getMysqlMgr();
			mysqlMgr.selectCostume(id, function (res) {
				var costumeData = dataMgr.getCostumeDataById(msg['costume_id']);
				var costumeColumn = '_' + costumeData['ID'];
				var costume = res[costumeColumn];

				if (costume === null || typeof costume === 'undefined') {
					logMgr.addLog('ERROR', '[WearCostume] This user (' + kId + ') does not have this costume(' + costume + ')');
					sysMsg['res'] = build.SystemMessage.Result['NOT_HAVING'];
					write(response, toStream(sysMsg));
					return ;
				}

				mysqlMgr = server.getMysqlMgr();
				mysqlMgr.selectCharacters(id, function (res) {
					if (res['_' + msg['character_id']] === 0) {
						logMgr.addLog('ERROR', '[WearCostume] This user  (' + kId + ') does not have this character(' + msg['character_id'] + ')');
						sysMsg['res'] = build.SystemMessage.Result['NOT_HAVING'];
						write(response, toStream(sysMsg));
						return ;
					}
					
					procedure = 'updateCharacter' + costumeData['Costume_Type'];

					mysqlMgr = server.getMysqlMgr();
					mysqlMgr[procedure](id, msg['costume_id'], msg['character_id'], function (res) {
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
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[DrawFirst] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [DrawFirstHandler]');
			return ;
		}

		var mysqlMgr = server.getMysqlMgr();
		mysqlMgr.loadUser(kId, function (res) {
			var id = res['res'];		
			
			if (id <= 0) {
				logMgr.addLog('ERROR', '[DrawFirst] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysqlMgr = server.getMysqlMgr();
			mysqlMgr.loadDraw(id, function (res) {
				if (res <= 0) {
					logMgr.addLog('ERROR', '[DrawFirst] Not enough draw (' + kId + ')');
					sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_DRAW'];
					write(response, toStream(sysMsg));
					return ;					
				}

				var dataMgr = server.dataMgr;
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
				
				var _lastCall = function () {
					write(response, toStream(rMsg));
				};
					
				var dataMgr = require('./c2g-index').server.dataMgr;
	
				mysqlMgr = server.getMysqlMgr();
				mysqlMgr.updateDraw(id, res, -1, function (res) { });

				if (isGhost) {
					mysqlMgr.updateGhost(id, pick['id'], function (res) { _lastCall(); });
				} else {
					if (pick['type'] === 'coin') {
						mysqlMgr.addCoin(id, pick['content'], function (res) { _lastCall(); });
					} else {
						if (pick['content'] === 1) { mysqlMgr.updateShield(id, 1, function(res) { _lastCall(); }); }
						else if (pick['content'] === 2) { mysqlMgr.updateGhostify(id, 1, function(res) { _lastCall(); }); }
						else if (pick['content'] === 3) { mysqlMgr.updateImmortal(id, 1, function(res) { _lastCall(); }); }
						else if (pick['content'] === 4) { mysqlMgr.updateExpBoost(id, 1, function(res) { _lastCall(); }); }
						else if (pick['content'] === 5) { mysqlMgr.updateItemLast(id, 1, function(res) { _lastCall(); }); }
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
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[DrawSecond] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [DrawSecondHandler]');
			return ;
		}

		var mysqlMgr = server.getMysqlMgr();
		mysqlMgr.loadUser(kId, function (res) {
			var id = res['res'];		
			
			if (id <= 0) {
				logMgr.addLog('ERROR', '[DrawSecond] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysql = server.getMysqlMgr();
			mysqlMgr.loadCash(id, function (res) {
				if (res < 10) {
					logMgr.addLog('ERROR', '[DrawSecond] Not enough cash (' + kId + ')');
					sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_CASH'];
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

				var _lastCall = function () {
					write(response, toStream(rMsg));
				};

				mysqlMgr = server.getMysqlMgr();
				mysqlMgr.updateCash(id, res - 10, function (res) { });

				if (isGhost) {
					mysqlMgr.updateGhost(id, pick['id'], function (res) { _lastCall(); });
				} else {
					if (pick['type'] === 'coin') {
						mysqlMgr.addCoin(id, pick['content'], function (res) { _lastCall(); });
					} else {
						if (pick['content'] === 1) { mysqlMgr.updateShield(id, 1, function(res) { _lastCall(); }); }
						else if (pick['content'] === 2) { mysqlMgr.updateGhostify(id, 1, function(res) { _lastCall(); }); }
						else if (pick['content'] === 3) { mysqlMgr.updateImmortal(id, 1, function(res) { _lastCall(); }); }
						else if (pick['content'] === 4) { mysqlMgr.updateExpBoost(id, 1, function(res) { _lastCall(); }); }
						else if (pick['content'] === 5) { mysqlMgr.updateItemLast(id, 1, function(res) { _lastCall(); }); }
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
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[EquipGhost] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [EquipGhostHandler]');
			return ;
		}

		mysqlMgr = server.getMysqlMgr();
		mysqlMgr.loadUser(kId, function (res) {
			var id = res['res'];		
			
			if (id <= 0) {
				logMgr.addLog('ERROR', '[EquipGhost] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}
			
			var dataMgr = server.dataMgr;

			if (msg['ghost_id'] <= 0 || dataMgr.ghostData.length < msg['ghost_id']) {
				logMgr.addLog('ERROR', '[EquipGhost] Invalid ghost ID from (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_GHOST'];
				write(response, toStream(sysMsg));
				return ;
			}

			if (msg['house_id'] <= 0 || dataMgr.roomData.length < msg['house_id']) {
				logMgr.addLog('ERROR', '[EquipGhost] Invalid room number from (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_HOUSE_ID'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysqlMgr = server.getMysqlMgr();
			mysqlMgr.loadGhostHouse(id, function (res) {
				var room = res['room_' + msg['house_id']];

				if (room === -1) {
					logMgr.addLog('ERROR', '[EquipGhost] This user(' + kId + ') trying to equip a ghost on closed room');
					sysMsg['res'] = build.SystemMessage.Result['NOT_HAVING'];
					write(response, toStream(sysMsg));
					return ;
				}

				mysqlMgr = server.getMysqlMgr();
				mysqlMgr.loadGhosts(id, function (res) {
					var ghost = res['_' + msg['ghost_id']];

					if (ghost <= 0) {
						logMgr.addLog('ERROR', '[EquipGhost] This user(' + kId + ') does not have this ghost');
						sysMsg['res'] = build.SystemMessage.Result['NOT_HAVING'];
						write(response, toStream(sysMsg));
						return ;						
					}

					mysqlMgr = server.getMysqlMgr();
					mysqlMgr.setGhostTo(id, msg['ghost_id'], msg['house_id'], function (res) {
						rMsg['house_id'] = msg['house_id'];
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
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[UnequipGhost] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [UnequipGhostHandler]');
			return ;
		}

		var mysqlMgr = server.getMysqlMgr();
		mysqlMgr.loadUser(kId, function (res) {
			var id = res['res'];		
			
			if (id <= 0) {
				logMgr.addLog('ERROR', '[UnequipGhost] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			if (msg['house_id'] <= 0 || dataMgr.roomData.length < msg['house_id']) {
				logMgr.addLog('ERROR', '[UnequipGhost] Invalid room number from (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_HOUSE_ID'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysqlMgr = server.getMysqlMgr();
			mysqlMgr.loadGhostHouse(id, function (res) {
				var room = res['room_' + msg['house_id']];

				if (room === -1) {
					logMgr.addLog('ERROR', '[UnequipGhost] This user(' + kId + ') trying to unequip a ghost from closed room');
					sysMsg['res'] = build.SystemMessage.Result['NOT_HAVING'];
					write(response, toStream(sysMsg));
					return ;
				}

				mysqlMgr = server.getMysqlMgr();
				mysqlMgr.removeGhostFrom(id, msg['house_id'], function (res) {
					rMsg['house_id'] = msg['house_id'];
					write(response, toStream(rMsg));
				});
			});
		});
	});
} // end UnequipGhostHandler

function PurchaseHouseHandler(response, data, session_id) {
	var msg = build.PurchaseHouse.decode(data);
	var rMsg = new build.PurchaseHouseReply();
	var sysMsg = new build.SystemMessage();
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[PurchaseHouse] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [PurchaseHouseHandler]');
			return ;
		}

		var mysqlMgr = server.getMysqlMgr();
		mysqlMgr.loadUser(kId, function (res) {
			var id = res['res'];		
			
			if (id <= 0) {
				logMgr.addLog('ERROR', '[PurchaseHouse] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			var dataMgr = require('./c2g-index').server.dataMgr;
			houseData = dataMgr.getHouseDataById(msg['house_id']);

			if (msg['house_id'] <= 0 || houseData.length <= msg['house_id']) {
				logMgr.addLog('ERROR', '[PurchaseHouse] This user(' + kId + ') already has this house');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_HOUSE_ID'];
				write(response, toStream(sysMsg));
				return ;				
			}

			var mysqlMgr = server.getMysqlMgr();
			mysqlMgr.loadGhostHouse(id, function (res) {
				var house = res['house_' + msg['house_id']];			

				if (house !== -1) {
					logMgr.addLog('ERROR', '[PurchaseHouse] This user(' + kId + ') already has this house');
					sysMsg['res'] = build.SystemMessage.Result['ALREADY_HAVING'];
					write(response, toStream(sysMsg));
					return ;
				}
				
				mysqlMgr = server.getMysqlMgr();
				mysq.loadUserBriefInfo(id, function (res) {
					var coin = res['coin'];
					var cash = res['cash'];

					var priceCoin = house['Price_Coin'];
					var priceCash = house['Price_Cash'];

					if (0 < priceCoin && coin < priceCoin) {
						logMgr.addLog('ERROR', '[PurchaseHouse] user(' + kId + ') not enough coin');
						sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_COIN'];
						write(response, toStream(sysMsg));
						return ;							
					} 
					
					if (0 < priceCash && cash < priceCash) {
						logMgr.addLog('ERROR', '[PurchaseHouse] user(' + kId + ') not enough cash');
						sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_CASH'];
						write(response, toStream(sysMsg));
						return ;
					}

					rMsg['house_id'] = msg['house_id'];
					rMsg['coin'] = coin - priceCoin;
					rMsg['cash'] = cash - priceCash;
					
					var _lastCall = function () {
						write(response, toStream(rMsg));							
					};

					mysqlMgr = server.getMysqlMgr();

					if (0 < priceCoin) {
						mysqlMgr.updateCoin(id, rMsg['coin'], function (res) { });
					}

					if (0 < priceCash) {
						mysqlMgr.updateCash(id, rMsg['cash'], function (res) { });
					}
					
					mysqlMgr.purchaseHouse(id, msg['house_id'], function (res) { _lastCall(); });
				});
			});
		});
	});
} // end PurchaseHouseHandler

function RequestEvolutionHandler(response, data, session_id){
	var msg = build.RequestEvolution.decode(data);
	var rMsg = new build.RequestEvolutionReply();
	var sysMsg = new build.SystemMessage();
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[RequestEvolution] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', '[RequestEvolution] Undefined field is detected in RequestEvolutionHandler');
			return ;
		}

		var mysqlMgr = server.getMysqlMgr();
		mysqlMgr.loadUser(kId, function (res) {
			var sender_id = res['res'];		

			if (sender_id <= 0) {
				logMgr.addLog('ERROR', '[RequestEvolution] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			var procedure = 'sea_LoadCharacter_' + msg['character_id'];
			mysqlMgr = server.getMysqlMgr();
			mysqlMgr[procedure](sender_id, function(res) {
				var lv = res['lv'];
				
				if (!(lv === 5 || lv === 10 || lv === 15)) {
					logMgr.addLog('SYSTEM', '[RequestEvolution] wrong approach detected (' + k_id + ')');
					sysMsg['res'] = build.SystemMessage.Result['WRONG_APPROACH'];
					write(response, toStream(sysMsg));
					return ;
				}

				mysqlMgr = server.getMysqlMgr();
				mysqlMgr.loadUser(msg['receiver_k_id'], function(res) {
					var receiver_id = res['res'];

					if (receiver_id <= 0) {
						logMgr.addLog('ERROR', '[RequestEvolution] Invalid account (' + msg['receiver_k_id'] + ')');
						sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
						write(response, toStream(sysMsg));
						return ;
					}

					mysqlMgr = server.getMysqlMgr();
					mysqlMgr.loadCoin(sender_id, function (res) {
						var coin = res['coin'];
						var evolveRequestCost = 1000;

						if (coin < evolveRequestCost) {
							logMgr.addLog('SYSTEM', '[RequestEvolution] Not enough coin (' + k_id + ')');
							sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_COIN'];
							write(response, toStream(sysMsg));
							return ;
						}

						var restCoin = coin - evolveRequestCost;
						var _lastCall = function () {
							write(response, toStream(rMsg));
						};

						rMsg['coin'] = restCoin;
						
						mysqlMgr = server.getMysqlMgr();
						mysqlMgr.updateCoin(sender_id, restCoin, function (res) { });

						mysqlMgr.addEvolution(sender_id, receiver_id, msg['character_id'], function (res) { _lastCall(); });
					});
				});
			});
		});
	});
} // end RequestEvolutionHandler

function AcceptEvolutionHandler(response, data, session_id){
	var msg = build.AcceptEvolution.decode(data);
	var rMsg = new build.AcceptEvolutionReply();
	var sysMsg = new build.SystemMessage();
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[AcceptEvolution] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', 'Undefined field is detected in [AcceptEvolutionHandler]');
			return ;
		}

		mysqlMgr = server.getMysqlMgr();
		mysqlMgr.loadUser(kId, function (res) {
			var receiver_id = res['res'];
		
			if (receiver_id <= 0) {
				logMgr.addLog('ERROR', '[AcceptEvolution] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			mysqlMgr = server.getMysqlMgr();
			mysqlMgr.loadUser(msg['sender_k_id'], function (res) {
				var sender_id = res['res'];

				if (sender_id <= 0) {
					logMgr.addLog('ERROR', '[AcceptEvolution] Invalid account (' + msg['sender_k_id'] + ')');
					sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
					write(response, toStream(sysMsg));
					return ;
				}

				mysqlMgr = server.getMysqlMgr();
				mysqlMgr.existEvolution(sender_id, receiver_id, function (res) {
					res = res['res'];

					if (!res) {
						logMgr.addLog('ERROR', '[AcceptEvolution] Invalid evolution (sed:' + sender_id + ', rec:' + receiver_id + ')');
						sysMsg['res'] = build.SystemMessage.Result['INVALID_EVOLUTION'];
						write(response, toStream(sysMsg));
						return ;
					}

					mysqlMgr = server.getMysqlMgr();
					mysqlMgr.acceptEvolution(sender_id, receiver_id, character_id, function (res) {
						write(response, toStream(rMsg));
					});
				});
			});
		});
	});
} // end AcceptEvolutionHandler

function LoadEvolutionProgressHandler(response, data, session_id){
	var msg = build.LoadEvolutionProgress.decode(data);
	var rMsg = new build.EvolutionProgress();
	var sysMsg = new build.SystemMessage();
	var server = require('./c2g-index').server;
	var logMgr = server.logMgr;

	session.toAuthUpdateSession(session_id, function (res) {
		var kId = res;

		if (kId === false) {
			logMgr.addLog('ERROR', '[LoadEvolutionProgress] Unauthenticated client accessed : (' + session_id + ')');
			sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
			write(response, toStream(sysMsg));
			return ;
		}

		if (inspectField(response, msg) === false) {
			logMgr.addLog('ERROR', '[LoadEvolutionProgress] Undefined field is detected in LoadEvolutionProgressHandler');
			return ;
		}

		var mysqlMgr = server.getMysqlMgr();
		mysqlMgr.loadUser(kId, function (res) {
			var sender_id = res['res'];		

			if (sender_id <= 0) {
				logMgr.addLog('ERROR', '[LoadEvolutionProgress] Invalid account (' + kId + ')');
				sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
				write(response, toStream(sysMsg));
				return ;
			}

			var dataMgr = require('./c2g-index').server.dataMgr;
			var lastCallTrigger = dataMgr.characterData.length;

			var wrap = function (idx) {
				var characterId = (idx + 1);
				var procedure = 'sea_LoadCharacter_' + characterId;
				mysqlMgr = server.getMysqlMgr();
				mysqlMgr[procedure](sender_id, function(res) {
					var lv = res;

					mysqlMgr = server.getMysqlMgr();
					mysqlMgr.loadEvolutionProgress(sender_id, characterId, function(res) {
						var list = res;
						var acceptedList = [];
						var newLevel = lv;
						var i = 0;

						for (; i < list.length; ++i) {
							if (list[i]['accepted'] === 1) {
								acceptedList.push(list[i]);
							}
						}
						

						var _lastCall = function (idx) {
							++idx;

							if (idx === lastCallTrigger) {
								write(response, toStream(rMsg));
							} else {
								wrap(idx);
							}
						};

						var _callback_1 = function () {
							newLevel = lv + 1;
							procedure = 'sea_AddCharacter_' + characterId;
							mysqlMgr = server.getMysqlMgr();
							mysqlMgr[procedure](sender_id, function (res) { });
							mysqlMgr.deleteEvolution(sender_id, characterId, function (res) { _lastCall(idx); });
						};

						if (accepted === 1 && lv === 5) {
							_callback_1();
						} else if (accepted === 2 && lv === 10) {
							_callback_1();
						} else if (accepted === 3 && lv === 15) {
							_callback_1();
						} else {
							_lastCall(idx);
						}
					});
				});
			};

			wrap(0);
		});
	});
} // end LoadEvolutionProgressHandler

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
	'LoadPostboxHandler': LoadPostboxHandler,
	'BuyItemHandler': BuyItemHandler,
	'BuyOrUpgradeCharacterHandler': BuyOrUpgradeCharacterHandler,
	'SendEnergyHandler': SendEnergyHandler,
	'AcceptEnergyHandler': AcceptEnergyHandler,
	'RequestBatonHandler': RequestBatonHandler,
	'AcceptBatonHandler': AcceptBatonHandler,
	'EndBatonHandler': EndBatonHandler,
	'AcceptBatonResultHandler': AcceptBatonResultHandler,
	'InviteFriendHandler': InviteFriendHandler,
	'LoadRewardHandler': LoadRewardHandler,
	'BuyCostumeHandler': BuyCostumeHandler,
	'WearCostumeHandler': WearCostumeHandler,
	'DrawFirstHandler': DrawFirstHandler,
	'DrawSecondHandler': DrawSecondHandler,
	'EquipGhostHandler': EquipGhostHandler,
	'UnequipGhostHandler': UnequipGhostHandler,
	'PurchaseHouseHandler': PurchaseHouseHandler,
	'RequestEvolutionHandler': RequestEvolutionHandler,
	'AcceptEvolutionHandler': AcceptEvolutionHandler,
	'LoadEvolutionProgressHandler': LoadEvolutionProgressHandler,
};
