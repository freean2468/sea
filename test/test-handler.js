// TODO
//	Adding additional test on each test case(suite)
//
var User = function(name, sessionId) {
	// property
	this.id = 0;
	this.name = name;
	this.sessionId = sessionId;
	this.energyList = [];
	this.evolutionList = [];

	// method
	this.setId = function (id) {
		this.id = id;
	};

	this.setEnergyList = function (list) {
		this.energyList = list;
	};

	this.setEvolutionList = function (list) {
		this.evolutionList = list;
	};
};

var test_1 = new User('unit_test_1', 1);
var test_2 = new User('unit_test_2', 2);

//
// Dependencies
// 
var build = require('../gameServer/c2g-proto-build'),
	util = require('../common/util'),
	MysqlMgr = require('../common/mysql').MysqlMgr,
	DataMgr = require('../gameServer/data').DataMgr,
	convertMS2S = util.convertMS2S,
	define = require('../common/define'),
	toStream = util.toStream
	;

var FakeResponse = function (rMsg) {
	// property
	this.rMsg = rMsg;
	this.sysMsg = new build.SystemMessage();

	// method
	this.writeHead = function(code, obj) {
		// fake
	};

	this.write = function(stream) {
		// fake
		var data = util.toArrBuf(stream);
		var id = util.fetchId(data);

		id.should.not.eql(this.sysMsg['id']['low']);
		id.should.eql(this.rMsg['id']['low']);
	};

	this.end = function() {
		// fake
	};
};

function write(res, stream) {
	res.writeHead(200, {'Content-Type': 'application/octet-stream', 'Content-Length':stream.length});
	res.write(stream);
	res.end();
}

function request(req) {
	// fake
}

var FakeLogMgr = function () {
	// property

	// method
	this.addLog = function (code, description) {
		// fake
	}
};

var FakeSession = function () {
	// property

	// method	
	this.toAuthRegisterSession = function (kId, callback) {
		var sessionId = 0;

		if (kId === test_1.name) {
			sessionId = test_1.sessionId;
		} else {
			sessionId = test_2.sessionId;
		}

		callback(sessionId);
	};

	this.toAuthUnregisterSession = function (session_id, callback) {
		var kId = '';

		if (session_id === test_1.sessionId) {
			kId = test_1.name;
		} else {
			kId = test_2.name;
		}

		callback(kId);
	};

	this.toAuthUpdateSession = this.toAuthUnregisterSession;

	this.toAuthTraceStartGame = function (session_id, start_time, exp) {

	};

	this.toAuthUpdateEndGameSession = function (session_id, callback) {
		var kId = '';

		if (session_id === test_1.sessionId) {
			kId = test_1.name;
		} else {
			kId = test_2.name;
		}

		callback(kId, 0, false);
	};
};

//
//
//

// sample
suite.skip('# sample', function () {
	setup(function (done) {
		data = new build.Logout();	
		data = data.toArrayBuffer();

		response = new FakeResponse(new build.LogoutReply());

		handlerMock = function (response, data, session_id, done) {

		};

		done();
	});

	test('should be equal to ', function (done) {
		handlerMock(response, data, test_1.sessionId, done);
	});
});

suite('# c2g-handler unit test.', function () {
	var data = null;
	var response = null;
	var mysqlMgr = null;
	var logMgr = null;
	var session = null;
	var dataMgr = null;
	var handlerMock = null;

	suiteSetup(function (done) {
		mysqlMgr = new MysqlMgr('sea', 1);
		logMgr = new FakeLogMgr();
		session = new FakeSession();
		dataMgr = new DataMgr();
		dataMgr.init();
		done();
	});

	suite('# VersionInfoHandler', function (done) {
		setup(function (done) {
			data = new build.VersionInfo();	
			data = data.toArrayBuffer();

			response = new FakeResponse(new build.VersionInfoReply());

			handlerMock = function VersionInfoHandler(response, data, session_id, done){
				var msg = build.VersionInfo.decode(data);
				var rMsg = new build.VersionInfoReply();
				var sysMsg = new build.SystemMessage();

				var version = new build.VersionInfoReply()['version'];

				rMsg['version'] = version;

				write(response, toStream(rMsg));
				done();
			};

			done();
		});

		test('# should be equal to id of VersionInfoReply', function (done) {
			handlerMock(response, data, test_1.sessionId, done);
		});
	});

	suite('# RegisterAccountHandler', function () {
		setup(function (done) {
			response = new FakeResponse(new build.RegisterAccountReply());

			handlerMock = function RegisterAccountHandler(response, data, session_id, done){
				var msg = build.RegisterAccount.decode(data);
				var rMsg = new build.RegisterAccountReply();
				var sysMsg = new build.SystemMessage();

				firstCall();

				// Creates user then verifies id;
				function firstCall () {
					mysqlMgr.createUser(msg['k_id'], function (res) {
						var id = res['res'];

						if (id === 0) {
							logMgr.addLog('ERROR', 'Already exsisting account : ' + msg['k_id']);
							sysMsg['res'] = build.SystemMessage.Result['EXISTING_ACCOUNT'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						lastCall();
					});
				}

				// Sends rMsg to client and UserRegister log to log server
				function lastCall () {		
					write(response, toStream(rMsg));

					var UserRegister = build.UserRegister;
					var req = new UserRegister();
					req['k_id'] = msg['k_id'];

					request(req);
					done();
				}
			};

			done();
		});

		suite('# Register test_1', function () {
			setup(function (done) {
				data = new build.RegisterAccount();	
				data['k_id'] = test_1.name;
				data = data.toArrayBuffer();

				done();
			});

			test('should be equal to id of RegisterAccountReply', function (done) {
				handlerMock(response, data, test_1.sessionId, done);
			});
		});

		suite('# Register test_2', function () {
			setup(function (done) {
				data = new build.RegisterAccount();	
				data['k_id'] = test_2.name;
				data = data.toArrayBuffer();

				done();
			});

			test('should be equal to id of RegisterAccountReply', function (done) {
				handlerMock(response, data, test_2.sessionId, done);
			});
		});
	});

	suite('# LoginHandler', function () {
		setup(function (done) {
			response = new FakeResponse(new build.AccountInfo());

			handlerMock = function LoginHandler(response, data, session_id, done){
				var msg = build.Login.decode(data);
				var rMsg = new build.AccountInfo();
				var sysMsg = new build.SystemMessage();

				var id = 0;
				var sessionId = '';

				firstCall();

				// Caqlls loadUser SP then verifies id
				function firstCall() {
					mysqlMgr.loadUser(msg['k_id'], function (res) {
						id = res['res'];
						test_1.id = id;

						if (id <= 0) {
							logMgr.addLog('SYSTEM', '[LoginHandler] Invalid account (res : ' + res + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_2();
					});
				}

				// Calls isBlack SP then verifies it
				function call_2() {
					mysqlMgr.isBlack(msg['k_id'], function (res) {
						if (res['res']) {
							logMgr.addLog('SYSTEM', 'blocked account access : (' + msg['k_id'] + ')');
							sysMsg['res'] = build.SystemMessage.Result['BLOCKED_ACCOUNT'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}	

						call_3();
					});
				}

				// Calls loadUserInfo SP then registers session
				// after that fulfills rMsg
				function call_3() {
					mysqlMgr.loadUserInfo(id, function (res) {
						var info = res;

						session.toAuthRegisterSession(msg['k_id'], function (session_id) {
							sessionId = session_id;

							// info
							rMsg['lv'] = info['lv'];
							rMsg['exp'] = info['exp'];
							rMsg['coin'] = info['coin'];
							rMsg['cash'] = info['cash'];
							rMsg['energy'] = info['energy'];
							rMsg['last_charged_time'] = info['last_charged_time'];
							rMsg['selected_character'] = info['selected_character'];
							rMsg['highest_score'] = info['highest_score'];

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
							
							var mileage = info['mileage'];
							var draw = info['draw'];

							// calls updateMileage SP
							function innerCall_1 (mileage, draw, id, sessionId) {
								mysqlMgr.updateMileage(id, mileage, function (res) {
									rMsg['mileage'] = mileage;
									rMsg['draw'] = draw;

									lastCall();					
								});
							};

							if (info['uv'] === 0) {
								mysqlMgr.updateUvOn(id, function (res) {
									mileage = info['mileage'] + 5;

									if (mileage >= 100) {
										mileage -= 100;
										++draw;

										mysqlMgr.updateDraw(id, draw, function (res) {
											innerCall_1(mileage, draw, id, sessionId);
										});
									} else {
										innerCall_1(mileage, draw, id, sessionId);
									}
								});
							} else {
								rMsg['mileage'] = mileage;
								rMsg['draw'] = draw;

								lastCall();
							}
						});
					});
				}

				// Sends rMsg to client and AccountLogin log to log server
				function lastCall() {
					var stream = toStream(rMsg);

					response.writeHead(200, {'Set-Cookie' : 'piece=' + sessionId,
											'Content-Type': 'application/octet-stream',
											'Content-Length': stream.length});
					response.write(stream);
					response.end();

					var AccountLogin = build.AccountLogin;
					var req = new AccountLogin();
					req['k_id'] = msg['k_id'];

					request(req);
					done();
				}
			};

			done();
		});

		suite('# Login test_1', function () {
			setup(function (done) {
				data = new build.Login();	
				data['k_id'] = test_1.name;
				data = data.toArrayBuffer();

				done();
			});

			test('should be equal to id of AccountInfo', function (done) {
				handlerMock(response, data, test_1.sessionId, done);
			});
		});

		suite('# Login test_2', function () {
			setup(function (done) {
				data = new build.Login();	
				data['k_id'] = test_2.name;
				data = data.toArrayBuffer();

				done();
			});

			test('should be equal to id of AccountInfo', function (done) {
				handlerMock(response, data, test_2.sessionId, done);
			});
		});
	});

	suite('# SelectCharacterHandler', function () {
		setup(function (done) {
			data = new build.SelectCharacter();	
			data['selected_character'] = 3;
			data = data.toArrayBuffer();

			response = new FakeResponse(new build.SelectCharacterReply());

			handlerMock = function SelectCharacterHandler(response, data, session_id, done){
				var msg = build.SelectCharacter.decode(data);
				var rMsg = new build.SelectCharacterReply();
				var sysMsg = new build.SystemMessage();

				var kId = '';
				var id = 0;

				firstCall();

				// Updates session then verifies kId
				function firstCall() {
					session.toAuthUpdateSession(session_id, function (k_id) {
						kId = k_id;

						if (kId === false) {
							logMgr.addLog('ERROR', '[SelectCharacter] Unauthenticated client accessed : (' + session_id + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_2();
					});
				}

				// Ccalls loadUser SP then verifies id
				function call_2() {
					mysqlMgr.loadUser(kId, function (res) {
						id = res['res'];

						if (id <= 0) {
							logMgr.addLog('ERROR', '[SelectCharacter] Invalid account (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_3();
					});
				}

				// Calls selectCharacters SP verifies selected character
				// after that calls updateSelectedCharacter SP
				function call_3() {
					mysqlMgr.selectCharacters(id, function (res) {
						var selected = msg['selected_character'];				

						if (selected <= 0 || dataMgr.characterData.length < selected) {
							logMgr.addLog('ERROR', 'Character Range Over (' + kId + ', ' + 'character : ' + msg['selected_character'] + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_CHARACTER'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}
						
						if (res['_' + selected])
						{
							mysqlMgr.updateSelectedCharacter(id, selected, function (res) {
								lastCall();
							});
						} else {
							logMgr.addLog('ERROR', '[SelectCharacter] This user (' + kId + ') does not have this character (' + selected + ')');
							sysMsg['res'] = build.SystemMessage.Result['NOT_HAVING'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}
					});
				}

				// Sends rMsg to client
				function lastCall() {
					write(response, toStream(rMsg));
					done();
				}
			};

			done();
		});

		test('should be equal to id of SelectCharacterReply', function (done) {
			handlerMock(response, data, test_1.sessionId, done);
		});
	});

	suite('# StartGameHandler', function () {
		setup(function (done) {
			data = new build.StartGame();	
			data = data.toArrayBuffer();

			response = new FakeResponse(new build.StartGameReply());
		
			handlerMock = function StartGameHandler(response, data, session_id, done){
				var msg = build.StartGame.decode(data);
				var rMsg = new build.StartGameReply();
				var sysMsg = new build.SystemMessage();

				var doubleExp = false;
				var kId = '';
				var id = 0;
				var procedureCallList = [];

				function startTrace() {
					var now = new Date();

					session.toAuthTraceStartGame(session_id, convertMS2S(now.getTime()), doubleExp);
				};

				firstCall();

				// Updates session then verifies kId
				function firstCall() {
					session.toAuthUpdateSession(session_id, function (k_id) {
						kId = k_id;

						if (kId === false) {
							logMgr.addLog('ERROR', '[StartGame] Unauthenticated client accessed : (' + session_id + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_2();
					});
				}

				// Calls loadUser SP then verifies id
				function call_2() {
					mysqlMgr.loadUser(kId, function (res) {
						id = res['res'];

						if (id <= 0) {
							logMgr.addLog('ERROR', '[StartGame] Invalid account (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_3();
					});
				}

				// Verifies id then calls startGame SP
				// after that Starts to fullfill StartGameReply meanwhile calls updateLastChargeTime SP
				function call_3() {
					mysqlMgr.startGame(id, function (res) {
						var info = res;
						var character = info['selected_character'];
						var energy = info['energy'];
						var last = info['last_charged_time'];
						var energyMax = 100;

						if (energy < 1) {
							logMgr.addLog('system', '[StartGame] Not enough energy : ' + kId);
							sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_ENERGY'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						if (energy == energyMax) {
							last = new Date().getTime();	
							last = convertMS2S(last);
						}
						energy -= 1;

						rMsg['energy'] = energy;
						rMsg['last_charged_time'] = last;
					
						mysqlMgr.updateLastChargeTime(id, last, function (res) {
							call_4(energy, info);
						});
					});
				}

				// Calls updateEnergy SP then Keeps going to fulfill StartGameReply
				function call_4(energy, info) {
					mysqlMgr.updateEnergy(id, energy, function (res) {
						var itemData = dataMgr.itemData;

						for (var i = 0; i < 5; ++i) {
							var item = itemData[i];
							var itemId = item['ID'];
							var on = false;
							var amount = info['_' + itemId];
							var rest = amount;

							if (amount > 0) {
								procedureCallList.push(itemId);
								rest = amount - 1;
								on = true;
							}

							rMsg['used_item_list'].push({'id': itemId,  'on': on, 'rest': rest});
						}

						if (info['random'] !== 0) {
							var item = dataMgr.getItemDataById([info['random']]);
							var itemId = item['ID'];

							procedureCallList.push(itemId);
							rMsg['used_item_list'].push({'id': itemId, 'on': true, 'rest': 0});
						}

						if (procedureCallList.length === 0) {
							lastCall(-1, 0);
							return ;
						}

						var lastCallTrigger = procedureCallList.length;

						recursiveCall_1(0, lastCallTrigger);
					});
				}

				// Calls updateItem or updateRandom SP 
				function recursiveCall_1(idx, trigger) {
					var item = dataMgr.getItemDataById(procedureCallList[idx]);
					var itemId = item['ID'];

					if (5 < itemId) {
						mysqlMgr.updateRandom(id, 0, function (res) { 
							lastCall(idx, trigger);
						});
					} else {
						if (itemId === 5) {
							doubleExp = true;
						}

						mysqlMgr.updateItem(id, -1, itemId, function (res) { 
							lastCall(idx, trigger);
						});
					}
				};

				// Starts trace and Sends rMsg to Client
				function lastCall(idx, trigger) {
					++idx;

					if (idx === trigger) {
						startTrace();
						write(response, toStream(rMsg));
						done();
					} else {
						recursiveCall_1(idx, trigger);
					}
				}
			};

			done();
		});

		test('should be equal to id of StartGameReply', function (done) {
			handlerMock(response, data, test_1.sessionId, done);
		});
	});

	suite('# EndGameHandler', function () {
		setup(function (done) {
			data = new build.EndGame();	
			data['score'] = 100;
			data['dist'] = 230;
			data['enemy_kill'] = 12;
			data['play_time'] = 30;
			data['coin'] = 100;
			data['mileage'] = 1;
			data = data.toArrayBuffer();

			response = new FakeResponse(new build.GameResult());

			handlerMock = function EndGameHandler(response, data, session_id, done){
				var msg = build.EndGame.decode(data);
				var rMsg = new build.GameResult();
				var sysMsg = new build.SystemMessage();

				var kId = '';
				var id = 0;
				var startTime = 0;
				var doubleExp = 0;
				var info = null;

				// Character bonus coefficient
				var characterScoreCoefficient = 0;
				var characterExpCoefficient = 0;
				var characterCoinCoefficient = 0;

				// House & ghost card match bonus coefficient
				var houseMatchCardScoreCoefficient = 0;
				var houseMatchCardExpCoefficient = 0;
				var houseMatchCardCoinCoefficient = 0;

				// ghost card bonus coefficient
				var ghostCardScoreCoefficient = 0;
				var ghostCardExpCoefficient = 0;
				var ghostCardCoinCoefficient = 0;

				// costume bonus coefficient
				var costumeScoreCoefficient = 0;
				var costumeExpCoefficient = 0;
				var costumeCoinCoefficient = 0;

				firstCall();

				// Updates EndGame session then verifies kId
				function firstCall() {
					session.toAuthUpdateEndGameSession(session_id, function (k_id, start_time, double_exp) {
						kId = k_id;
						startTime = start_time;
						doubleExp = double_exp;

						if (kId === false) {
							logMgr.addLog('ERROR', '[EndGame] Unauthenticated client accessed : (' + session_id + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
							write(response, toStream(sysMsg));
							return ;
						}

						call_2();
					});
				}

				// Calls loadUser SP then verifies id
				function call_2() {
					mysqlMgr.loadUser(kId, function (res) {
						id = res['res'];

						if (id <= 0) {
							logMgr.addLog('ERROR', '[EndGame] Invalid account (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
							write(response, toStream(sysMsg));
							return ;
						}

						call_3();
					});
				}

				// Ccalls loadUserInfo SP then starts to fullfill GameResult meanwhile calls selectCharacterCostumes SP
				function call_3() {
					mysqlMgr.loadUserInfo(id, function (res) {
						info = res;
						// TODO : Detecting Cheating
						var selectedCharacter = info['selected_character'];

						var characterLevel = info['_' + selectedCharacter];
						var characterData = dataMgr.getCharacterDataByIdAndLv(selectedCharacter, characterLevel);

						characterScoreCoefficient = characterData['Char_Score'];
						characterExpCoefficient = characterData['Char_Exp'];
						characterCoinCoefficient = characterData['Char_Coin'];

						var ghostHouseInfo = [];

						for (var i = 0; i < dataMgr.houseData.length; ++i) {
							ghostHouseInfo.push(info['house_' + (i+1)]);
						}

						var E_Match_Card = define.E_Match_Card;

						for (var i = 0; i < ghostHouseInfo.length; ++i) {
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

								if (ghostCardData !== false) {
									ghostCardScoreCoefficient += ghostCardData['Card_Score'];
									ghostCardExpCoefficient += ghostCardData['Card_Exp'];
									ghostCardCoinCoefficient += ghostCardData['Card_Coin'];
								}
							}
						}

						call_4();
					});
				}

				// Keeps going to fullfill GameResult meanwhile calls updateExp SP
				function call_4() {
					mysqlMgr.selectCharacterCostumes(id, info['selected_character'], function (res) {
						var costumeHead = res['head'];
						var costumeTop = res['top'];
						var costumeBottoms = res['bottoms'];
						var costumeBack = res['back'];

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
						var lv = info['lv'];
						var exp = info['exp'];
						var expReward = msg['dist'] * 0.1;
						var bonusExp = expReward * (characterExpCoefficient + houseMatchCardExpCoefficient + ghostCardExpCoefficient + costumeExpCoefficient);
						var levelTable = dataMgr.getLevelData(lv);

						var itemBonusExp = 1;

						if (doubleExp === true) {
							itemBonusExp = 2;
						}

						exp += (expReward + bonusExp) * itemBonusExp;

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
							mysqlMgr.updateCoin(id, coin, function (res) { 
								lastCall(); 
							});
						});
					});
				}

				// Sends rMsg to client and sends UserGamePlay log to log server
				function lastCall() {
					write(response, toStream(rMsg));

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
					done();
				}
			};

			done();
		});

		test('should be equal to id of GameResult', function (done) {
			handlerMock(response, data, test_1.sessionId, done);
		});
	});

	suite('# SendEnergyHandler', function () {
		setup(function (done) {
			data = new build.SendEnergy();	
			data['receiver_k_id'] = test_2.name;
			data = data.toArrayBuffer();

			response = new FakeResponse(new build.SendEnergyReply());

			handlerMock = function SendEnergyHandler(response, data, session_id, done){
				var msg = build.SendEnergy.decode(data);
				var rMsg = new build.SendEnergyReply();
				var sysMsg = new build.SystemMessage();

				var kId = '';
				var senderId = 0;
				var receiverId = 0;

				firstCall();

				// Updates session then verifies kId
				function firstCall() {
					session.toAuthUpdateSession(session_id, function (k_id) {
						kId = k_id;

						if (kId === false) {
							logMgr.addLog('ERROR', '[SendEnergy] Unauthenticated client accessed : (' + session_id + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_2();
					});
				}

				// Calls loadUser SP then verifies senderId
				function call_2() {
					mysqlMgr.loadUser(kId, function (res) {
						senderId = res['res'];
					
						if (senderId <= 0) {
							logMgr.addLog('ERROR', '[SendEnergy] Invalid account (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_3();
					});
				}

				// Calls loadUser SP then verifies receiverId
				function call_3() {
					mysqlMgr.loadUser(msg['receiver_k_id'], function(res) {
						receiverId = res['res'];

						if (receiverId <= 0) {
							logMgr.addLog('ERROR', '[SendEnergy] Invalid account (' + msg['receiver_k_id'] + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_4();
					});
				}

				// Calls loadMileageAndDraw SP then fulfills rMsg
				function call_4() {
					mysqlMgr.loadMileageAndDraw(senderId, function (res) {
						var _res = res;

						mysqlMgr.addEnergy(senderId, receiverId, 1, function(res) { });
							
						var mileage = _res['mileage'] + 10;
						var draw = _res['draw'];

						if (mileage >= 100) {
							++draw;
							mileage -= 100;
							mysqlMgr.updateDraw(senderId, draw, function (res) { });
						}

						rMsg['mileage'] = mileage;
						rMsg['draw'] = draw;

						mysqlMgr.updateMileage(senderId, mileage, function (res) { 
							lastCall(); 
						});
					});
				}

				// Sends rMsg to client
				function lastCall () {
					write(response, toStream(rMsg));
					done();
				};
			};

			done();
		});

		test('should be equal to id of SendEnergyReply', function (done) {
			handlerMock(response, data, test_1.sessionId, done);
		});
	});

	suite('# BuyOrUpgradeCharacterHandler', function () {
		setup(function (done) {
			data = new build.BuyOrUpgradeCharacter();	
			data['character'] = 2;
			data = data.toArrayBuffer();

			response = new FakeResponse(new build.BuyOrUpgradeCharacterReply());

			handlerMock = function BuyOrUpgradeCharacterHandler(response, data, session_id, done, idx){
				var msg = build.BuyOrUpgradeCharacter.decode(data);
				var rMsg = new build.BuyOrUpgradeCharacterReply();
				var sysMsg = new build.SystemMessage();

				var nextCharacterData = null;
				var character = 0;
				var lv = 0;
				var userBriefInfo = null;
				var id = 0;
				var kId = '';
				var coin = 0;
				var cash = 0;
				var priceCoin = 0;
				var priceCash = 0;

				firstCall();

				// Updates session then verifies kId
				function firstCall() {
					session.toAuthUpdateSession(session_id, function (k_id) {
						kId = k_id;

						if (kId === false) {
							logMgr.addLog('ERROR', '[BuyOrUpgradeCharacter] Unauthenticated client accessed : (' + session_id + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_2();
					});
				}

				// Verifies kId then calls loadUser SP
				function call_2() {
					mysqlMgr.loadUser(kId, function (res) {
						id = res['res'];

						if (id <= 0) {
							logMgr.addLog('ERROR', '[BuyOrUpgradeCharacter] Invalid account (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_3();
					});
				}

				// Calls selectCharacters SP then Verifies character 
				function call_3() {
					mysqlMgr.selectCharacters(id, function (res) {
						character = msg['character'];
						lv = res['_' + character];
						
						if (lv === 5 || lv === 10 || lv === 15) {
							logMgr.addLog('SYSTEM', '[BuyOrUpgradeCharacter] wrong approach detected (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['WRONG_APPROACH'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						nextCharacterData = dataMgr.getCharacterDataByIdAndLv(character, lv + 1);

						if (character <= 0  || dataMgr.characterData.length < character) {
							logMgr.addLog('ERROR', '[BuyOrUpgradeCharacter] Invalid character (' + kId + ', ' + character + ')');
							sysMsg['res'] = build.SystemMessage.Result['NO_MATHCH_WITH_DB'];
							write(response, toStream(sysMsg));
							done();
							return;
						}

						if (dataMgr.characterData[character].length <= lv) {
							logMgr.addLog('ERROR', '[BuyOrUpgradeCharacter] The character is fully upgraded. (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['FULLY_UPGRADED'];
							write(response, toStream(sysMsg));
							done();
							return;
						}

						call_4();
					});
				}

				// Calls loadUserBriefInfo SP then computes cost
				function call_4() {
					mysqlMgr.loadUserBriefInfo(id, function (res) {
						userBriefInfo = res;
						priceCoin = nextCharacterData['Price_Coin'];
						priceCash = nextCharacterData['Price_Cash'];
						coin = userBriefInfo['coin'];
						cash = userBriefInfo['cash'];

						if (0 < priceCoin && coin < priceCoin) {
							logMgr.addLog('SYSTEM', '[BuyOrUpgradeCharacter] Not enough coin (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_COIN'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						if (0 < priceCash && cash < priceCash) {
							logMgr.addLog('SYSTEM', '[BuyOrUpgradeCharacter] Not enough cash (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_CASH'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_5();
					});
				}

				// Calls addCharacter SP then verifies lv 
				// after that fullfills BuyOrUpgradeCharacterReply
				function call_5() {
					mysqlMgr.addCharacter(id, character, function (res) {
						var newLv = res['lv'];
						var mileage = userBriefInfo['mileage'];
						var draw = userBriefInfo['draw'];

						if (newLv === 1) {
							mileage += 30;
							mysqlMgr.createCharacterBasicCostumes(id, character, function (res) {});
						} else {
							mileage += 10;
						}

						if (mileage >= 100) {
							++draw;
							mileage -= 100;
							mysqlMgr.updateDraw(id, draw, function (res) { });
						}

						mysqlMgr.updateMileage(id, mileage, function (res) { });

						rMsg['mileage'] = mileage;
						rMsg['draw'] = draw;
						rMsg['character'] = character;
						rMsg['lv'] = newLv;
						rMsg['coin'] = coin - priceCoin;
						rMsg['cash'] = cash - priceCash;

						if (0 < priceCoin && 0 < priceCash) {
							mysqlMgr.updateCoin(id, rMsg['coin'], function (res) { });
							mysqlMgr.updateCash(id, rMsg['cash'], function (res) {
								lastCall(); 
							});
						} else if (0 < priceCoin) {
							mysqlMgr.updateCoin(id, rMsg['coin'], function (res) {
								lastCall();
							});
						} else if (0 < priceCash) {
							mysqlMgr.updateCash(id, rMsg['cash'], function (res) {
								lastCall();
							});
						} else {
							lastCall();
						}
					});
				}

				// Sends rMsg to client
				function lastCall () {								
					write(response, toStream(rMsg));
					if (++idx === 5) {
						done();
					}
				};
			};

			done();
		});

		test('should be equal to id of BuyOrUpgradeCharacterReply', function (done) {
			for (var i = 0; i < 5; ++i) {
				handlerMock(response, data, test_1.sessionId, done, i);
			}
		});
	});

	suite('# RequestEvolutionHandler', function () {
		setup(function (done) {
			data = new build.RequestEvolution();	
			data['receiver_k_id'] = test_2.name;
			data['character_id'] = 2;
			data = data.toArrayBuffer();

			response = new FakeResponse(new build.RequestEvolutionReply());

			handlerMock = function RequestEvolutionHandler(response, data, session_id, done){
				var msg = build.RequestEvolution.decode(data);
				var rMsg = new build.RequestEvolutionReply();
				var sysMsg = new build.SystemMessage();

				var kId = '';
				var senderId = 0;
				var receiverId = 0;

				firstCall();

				// Updates session then verifies kId
				function firstCall() {
					session.toAuthUpdateSession(session_id, function (k_id) {
						kId = k_id;

						if (kId === false) {
							logMgr.addLog('ERROR', '[RequestEvolution] Unauthenticated client accessed : (' + session_id + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_2();
					});
				}

				// Calls loadUser SP then verifies senderId
				function call_2() {
					mysqlMgr.loadUser(kId, function (res) {
						senderId = res['res'];	

						if (senderId <= 0) {
							logMgr.addLog('ERROR', '[RequestEvolution] Invalid account (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_3();
					});
				}

				// Calls selectCharacters SP then verifies character
				function call_3() {
					mysqlMgr.selectCharacters(senderId, function(res) {
						var character = res['_' + msg['character_id']];

						if (msg['character_id'] <= 0 || dataMgr.characterData.length < msg['character_id']) {
							logMgr.addLog('ERROR', 'Character Range Over (' + kId + ', ' + 'character : ' + msg['character_id'] + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_CHARACTER'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}
						
						if (!(character === 5 || character === 10 || character === 15)) {
							logMgr.addLog('SYSTEM', '[RequestEvolution] wrong approach detected (' + k_id + ')');
							sysMsg['res'] = build.SystemMessage.Result['WRONG_APPROACH'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_4();
					});
				}

				// Calls loadUser SP then verifies receiverId
				function call_4() {
					mysqlMgr.loadUser(msg['receiver_k_id'], function(res) {
						receiverId = res['res'];

						if (receiverId <= 0) {
							logMgr.addLog('ERROR', '[RequestEvolution] Invalid account (' + msg['receiver_k_id'] + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_5();
					});
				}

				// Calls loadCoin SP then verifies coin
				// after that fulfills rMsg
				function call_5() {
					mysqlMgr.loadCoin(senderId, function (res) {
						var coin = res['coin'];
						var evolveRequestCost = 1000;

						if (coin < evolveRequestCost) {
							logMgr.addLog('SYSTEM', '[RequestEvolution] Not enough coin (' + k_id + ')');
							sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_COIN'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						var restCoin = coin - evolveRequestCost;

						rMsg['coin'] = restCoin;
						
						mysqlMgr.updateCoin(senderId, restCoin, function (res) { });
						mysqlMgr.addEvolution(senderId, receiverId, msg['character_id'], function (res) { 
							lastCall(); 
						});
					});
				}

				// Sends rMSg to client
				function lastCall () {
					write(response, toStream(rMsg));
					done();
				}
			};

			done();
		});

		test('should be equal to id of RequestEvolutionReply', function (done) {
			handlerMock(response, data, test_1.sessionId, done);
		});
	});

	suite('# PurchaseHouseHandler', function () {
		setup(function (done) {
			data = new build.PurchaseHouse();	
			data['house_id'] = 2;
			data = data.toArrayBuffer();

			response = new FakeResponse(new build.PurchaseHouseReply());

			handlerMock = function PurchaseHouseHandler(response, data, session_id, done) {
				var msg = build.PurchaseHouse.decode(data);
				var rMsg = new build.PurchaseHouseReply();
				var sysMsg = new build.SystemMessage();

				var kId = '';
				var id = 0;
				var house = 0;
				var houseData = null;

				firstCall();

				// Updates session then verifies kId
				function firstCall() {
					session.toAuthUpdateSession(session_id, function (k_id) {
						kId = k_id;

						if (kId === false) {
							logMgr.addLog('ERROR', '[PurchaseHouse] Unauthenticated client accessed : (' + session_id + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_2();
					});
				}

				// Calls loadUser SP then verifies id, house_id
				function call_2() {
					mysqlMgr.loadUser(kId, function (res) {
						id = res['res'];

						if (id <= 0) {
							logMgr.addLog('ERROR', '[PurchaseHouse] Invalid account (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						houseData = dataMgr.getHouseDataById(msg['house_id']);

						if (houseData === false) {
							logMgr.addLog('ERROR', '[PurchaseHouse] Invalid house id');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_HOUSE_ID'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_3();
					});
				}

				// Calls loadGhostHouse SP then verifies house
				function call_3() {			
					mysqlMgr.loadGhostHouse(id, function (res) {
						house = res['_' + msg['house_id']];			

						if (house !== -1) {
							logMgr.addLog('ERROR', '[PurchaseHouse] This user(' + kId + ') already has this house');
							sysMsg['res'] = build.SystemMessage.Result['ALREADY_HAVING'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}
					
						call_4();
					});
				}

				// Calls loadUserBriefInfo then fulfills rMsg
				function call_4() {
					mysqlMgr.loadUserBriefInfo(id, function (res) {
						var userBriefInfo = res;
						var coin = userBriefInfo['coin'];
						var cash = userBriefInfo['cash'];

						var priceCoin = houseData['Price_Coin'];
						var priceCash = houseData['Price_Cash'];

						if (0 < priceCoin && coin < priceCoin) {
							logMgr.addLog('ERROR', '[PurchaseHouse] user(' + kId + ') not enough coin');
							sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_COIN'];
							write(response, toStream(sysMsg));
							done();
							return ;							
						} 
						
						if (0 < priceCash && cash < priceCash) {
							logMgr.addLog('ERROR', '[PurchaseHouse] user(' + kId + ') not enough cash');
							sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_CASH'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						rMsg['house_id'] = msg['house_id'];
						rMsg['coin'] = coin - priceCoin;
						rMsg['cash'] = cash - priceCash;
						
						if (0 < priceCoin) {
							mysqlMgr.updateCoin(id, rMsg['coin'], function (res) { });
						}

						if (0 < priceCash) {
							mysqlMgr.updateCash(id, rMsg['cash'], function (res) { });
						}
						
						mysqlMgr.purchaseHouse(id, msg['house_id'], function (res) { 
							lastCall(); 
						});
					});
				}

				// Sends rMsg to client
				function lastCall() {
					write(response, toStream(rMsg));
					done();
				}
			};

			done();
		});

		test('should be equal to id of PurchaseHouseReply', function (done) {
			handlerMock(response, data, test_1.sessionId, done);
		});
	});

	suite.skip('# EquipGhostHandler', function () {
		setup(function (done) {
			data = new build.EquipGhost();	
			data['ghost_id'] = 1;
			data['house_id'] = 2;
			data = data.toArrayBuffer();

			response = new FakeResponse(new build.EquipGhostReply());

			handleMock = function EquipGhostHandler(response, data, session_id, done) {
				var msg = build.EquipGhost.decode(data);
				var rMsg = new build.EquipGhostReply();
				var sysMsg = new build.SystemMessage();

				var kId = '';
				var id = 0;

				firstCall();

				// Updates session then verifies kId
				function firstCall() {
					session.toAuthUpdateSession(session_id, function (k_id) {
						kId = k_id;

						if (kId === false) {
							logMgr.addLog('ERROR', '[EquipGhost] Unauthenticated client accessed : (' + session_id + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_2();
					});
				}

				// Calls loadUser SP then verifies id, ghost_id, house_id
				function call_2() {
					mysqlMgr.loadUser(kId, function (res) {
						id = res['res'];

						if (id <= 0) {
							logMgr.addLog('ERROR', '[EquipGhost] Invalid account (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						if (msg['ghost_id'] <= 0 || dataMgr.ghostData.length < msg['ghost_id']) {
							logMgr.addLog('ERROR', '[EquipGhost] Invalid ghost ID from (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_GHOST'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						if (msg['house_id'] <= 0 || dataMgr.houseData.length < msg['house_id']) {
							logMgr.addLog('ERROR', '[EquipGhost] Invalid house id from (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_HOUSE_ID'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_3();
					});
				}

				// Calls loadGhostHouse SP then verifies house
				function call_3() {			
					mysqlMgr.loadGhostHouse(id, function (res) {
						var house = res['_' + msg['house_id']];

						if (house === -1) {
							logMgr.addLog('ERROR', '[EquipGhost] This user(' + kId + ') trying to equip a ghost on closed house');
							sysMsg['res'] = build.SystemMessage.Result['NOT_HAVING'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_4();
					});
				}

				// Calls loadGhosts SP then verifies ghost
				function call_4() {
					mysqlMgr.loadGhosts(id, function (res) {
						var ghost = res['_' + msg['ghost_id']];

						if (ghost <= 0) {
							logMgr.addLog('ERROR', '[EquipGhost] This user(' + kId + ') does not have this ghost');
							sysMsg['res'] = build.SystemMessage.Result['NOT_HAVING'];
							write(response, toStream(sysMsg));
							done();
							return ;						
						}

						rMsg['house_id'] = msg['house_id'];
						rMsg['ghost_id'] = msg['ghost_id'];

						lastCall();
					});
				}

				// Sends rMsg to client
				function lastCall() {
					mysqlMgr.setGhostTo(id, msg['ghost_id'], msg['house_id'], function (res) {
						write(response, toStream(rMsg));
						done();
					});
				}
			};

			done();
		});

		test('should be equal to id of EquipGhostReply', function (done) {
			handlerMock(response, data, test_1.sessionId, done);
		});
	});

	suite.skip('# UnequipGhostHandler', function () {
		setup(function (done) {
			data = new build.UnequipGhost();	
			data['house_id'] = 2;
			data = data.toArrayBuffer();

			response = new FakeResponse(new build.UnequipGhostReply());

			handlerMock = function UnequipGhostHandler(response, data, session_id, done) {
				var msg = build.UnequipGhost.decode(data);
				var rMsg = new build.UnequipGhostReply();
				var sysMsg = new build.SystemMessage();

				var kId = '';
				var id = 0;

				firstCall();

				// Updates session then verifies kId
				function firstCall() {
					session.toAuthUpdateSession(session_id, function (k_id) {
						kId = k_id;

						if (kId === false) {
							logMgr.addLog('ERROR', '[UnequipGhost] Unauthenticated client accessed : (' + session_id + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_2();
					});
				}

				// Calls loadUser SP then verifies id, house_id
				function call_2() {
					mysqlMgr.loadUser(kId, function (res) {
						id = res['res'];

						if (id <= 0) {
							logMgr.addLog('ERROR', '[UnequipGhost] Invalid account (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						if (msg['house_id'] <= 0 || dataMgr.houseData.length < msg['house_id']) {
							logMgr.addLog('ERROR', '[UnequipGhost] Invalid house number from (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_HOUSE_ID'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_3();
					});
				}

				// Calls loadGhostHouse SP then verifies house
				function call_3() {
					mysqlMgr.loadGhostHouse(id, function (res) {
						var house = res['_' + msg['house_id']];

						if (house === -1) {
							logMgr.addLog('ERROR', '[UnequipGhost] This user(' + kId + ') trying to unequip a ghost from closed house');
							sysMsg['res'] = build.SystemMessage.Result['NOT_HAVING'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}
						
						rMsg['house_id'] = msg['house_id'];
						
						lastCall();
					});
				}

				// Sends rMsg to client
				function lastCall() {
					mysqlMgr.removeGhostFrom(id, msg['house_id'], function (res) {
						write(response, toStream(rMsg));
						done();
					});
				}
			};

			done();
		});

		test('should be equal to id of UnequipGhostReply', function (done) {
			handlerMock(response, data, test_1.sessionId, done);
		});
	});

	suite('# BuyItemHandler', function () {
		setup(function (done) {
			data = new build.BuyItem();	
			data['item'] = 1;
			data = data.toArrayBuffer();

			response = new FakeResponse(new build.BuyItemReply());

			handlerMock = function BuyItemHandler(response, data, session_id, done){
				var msg = build.BuyItem.decode(data);
				var BuyItemReply = build.BuyItemReply;
				var rMsg = new BuyItemReply();
				var sysMsg = new build.SystemMessage();

				var kId = '';
				var id = 0;

				firstCall();
				
				// Updates session then verifies kId
				function firstCall() {
					session.toAuthUpdateSession(session_id, function (k_id) {
						kId = k_id;

						if (kId === false) {
							logMgr.addLog('ERROR', '[BuyItem] Unauthenticated client accessed : (' + session_id + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_2();
					});
				}

				// Calls loadUser SP then verifies id
				function call_2() {
					mysqlMgr.loadUser(kId, function (res) {
						id = res['res'];

						if (id <= 0) {
							logMgr.addLog('ERROR', '[BuyItem] Invalid account (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_3();
					});
				}

				// Fulfills rMsg
				function call_3() {
					mysqlMgr.loadUserBriefInfo(id, function(res) {
						var coin = res['coin'];
						var itemId = msg['item'];
						var itemData = dataMgr.getItemDataById(itemId);

						if (itemId < build.BuyItem.Limit['MIN']	|| build.BuyItem.Limit['MAX'] < itemId) {
							logMgr.addLog('ERROR', '[BuyItem] Invalid item (' + kId + ', ' + itemId + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_ITEM'];
							write(response, toStream(sysMsg));
							done();
							return;
						}

						var priceCoin = itemData['Price_Coin'];

						if (coin < priceCoin) {
							logMgr.addLog('SYSTEM', '[BuyItem] Not enough coin (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_COIN'];
							write(response, toStream(sysMsg));
							done();
							return;
						}

						var mileage = res['mileage'] + 5;
						var draw = res['draw'];

						if (mileage >= 100) {
							++draw;
							mileage -= 100;
							mysqlMgr.updateDraw(id, draw, function (res) { });
						}

						mysqlMgr.updateMileage(id, mileage, function (res) { });

						rMsg['mileage'] = mileage;
						rMsg['draw'] = draw;
						rMsg['coin'] = coin - priceCoin;

						if (itemId < build.BuyItem.Limit['MAX']) {
							rMsg['item'] = msg['item'];

							mysqlMgr.updateItem(id, 1, itemData['ID'], function (res) { 
								mysqlMgr.updateCoin(id, rMsg['coin'], function (res) {
									lastCall();
								}); 
							});
						} else {
							var length = dataMgr.itemData.length;
							var itemId = Math.floor(Math.random() * length) + 1;
							var itemData = dataMgr.getItemDataById(itemId);
														
							rMsg['item'] = itemData['ID'];
							
							mysqlMgr.updateRandom(id, itemData['ID'], function (res) {
								if (res['_random'] !== 0) {
									rMsg['coin'] -= (priceCoin/2);								
								} else {
									rMsg['coin'] -= priceCoin;
								}

								mysqlMgr.updateCoin(id, rMsg['coin'], function (res) {
									lastCall();
								});
							});
						}
					});
				}

				// Sends rMsg to client
				function lastCall () {
					write(response, toStream(rMsg));
					done();
				};
			};

			done();
		});

		test('should be equal to id of BuyItemReply', function (done) {
			handlerMock(response, data, test_1.sessionId, done);
		});
	});

	suite('# BuyCostumeHandler', function () {
		setup(function (done) {
			data = new build.BuyCostume();	
			data['costume_id'] = 15;
			data = data.toArrayBuffer();

			response = new FakeResponse(new build.BuyCostumeReply());

			handlerMock = function BuyCostumeHandler(response, data, session_id, done) {
				var msg = build.BuyCostume.decode(data);
				var rMsg = new build.BuyCostumeReply();
				var sysMsg = new build.SystemMessage();

				var kId = '';
				var id = 0;
				var userBriefInfo = null;
				var costumeData = null;
				var priceCash = 0;
				var priceCoin = 0;

				firstCall();

				// Updates session then verifies kId
				function firstCall() {
					session.toAuthUpdateSession(session_id, function (k_id) {
						kId = k_id;

						if (kId === false) {
							logMgr.addLog('ERROR', '[BuyCostume] Unauthenticated client accessed : (' + session_id + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_2();
					});
				}

				// Calls loadUser SP then verifies id, coin, priceCoin, cash, priceCash
				function call_2() {
					mysqlMgr.loadUser(kId, function (res) {
						id = res['res'];

						if (id <= 0) {
							logMgr.addLog('ERROR', '[BuyCostume] Invalid account (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						if (msg['costume_id'] <= 0 || dataMgr.costumeData.length <= msg['costume_id']) {
							logMgr.addLog('ERROR', '[BuyCostume] Invalid costume id');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_COSTUME_ID'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						costumeData = dataMgr.getCostumeDataById(msg['costume_id']);
						priceCash = costumeData['Price_Cash'];
						priceCoin = costumeData['Price_Coin'];

						call_3();
					});
				}

				// Calls loadUserBriefInfo
				function call_3() {		
					mysqlMgr.loadUserBriefInfo(id, function (res) {
						userBriefInfo = res;

						if (0 < priceCoin && userBriefInfo['coin'] < priceCoin) {
							logMgr.addLog('SYSTEM', '[BuyCostume] Not enough coin (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_COIN'];
							write(response, toStream(sysMsg));
							done();
							return ;										
						}

						if (0 < priceCash && userBriefInfo['cash'] < priceCash) {
							logMgr.addLog('SYSTEM', '[BuyCostume] Not enough cash (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_CASH'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_4();
					});		
				}

				// Calls onCostume SP then fulfills rMsg
				function call_4() {
					mysqlMgr.onCostume(id, msg['costume_id'], function (res) {
						rMsg['costume_id'] = msg['costume_id'];

						rMsg['cash'] = userBriefInfo['cash'] - priceCash;
						rMsg['coin'] = userBriefInfo['coin'] - priceCoin;
						
						var mileage = userBriefInfo['mileage'] + 5;
						var draw = userBriefInfo['draw'];

						if (mileage >= 100) {
							++draw;
							mileage -= 100;
							mysqlMgr.updateDraw(id, draw, function (res) { });
						}
						
						rMsg['mileage'] = mileage;
						rMsg['draw'] = draw;

						mysqlMgr.updateMileage(id, mileage, function (res) { });

						if (0 < priceCoin && 0 < priceCash) {
							mysqlMgr.updateCoin(id, rMsg['coin'], function (res) {});
							mysqlMgr.updateCash(id, rMsg['cash'], function (res) { 
								lastCall(); 
							});
						} else if (0 < priceCoin) {
							mysqlMgr.updateCoin(id, rMsg['coin'], function (res) { 
								lastCall(); 
							});
						} else if (0 < priceCash) {
							mysqlMgr.updateCash(id, rMsg['cash'], function (res) { 
								lastCall(); 
							});
						} else {
							lastCall();
						}
					});
				}

				// Sends rMsg to client
				function lastCall() {
					write(response, toStream(rMsg));
					done();
				};
			};

			done();
		});

		test('should be equal to id of BuyCostumeReply', function (done) {
			handlerMock(response, data, test_1.sessionId, done);
		});
	});

	suite('# WearCostumeHandler', function () {
		setup(function (done) {
			data = new build.WearCostume();	
			data['costume_id'] = 15;
			data['character_id'] = 2;
			data = data.toArrayBuffer();

			response = new FakeResponse(new build.WearCostumeReply());

			handlerMock = function WearCostumeHandler(response, data, session_id, done) {
				var msg = build.WearCostume.decode(data);
				var rMsg = new build.WearCostumeReply();
				var sysMsg = new build.SystemMessage();

				var kId = '';
				var id = 0;
				var costumeData = null;
				var costumeColumn = '';
				var costume = 0;

				firstCall();

				// Updates session then verifies kId
				function firstCall() {
					session.toAuthUpdateSession(session_id, function (k_id) {
						kId = k_id;

						if (kId === false) {
							logMgr.addLog('ERROR', '[WearCostume] Unauthenticated client accessed : (' + session_id + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_2();
					});
				}

				// Calls loadUser SP then verifies id
				// after that verifies id, costume_id, character_id
				function call_2() {
					mysqlMgr.loadUser(kId, function (res) {
						id = res['res'];	

						if (id <= 0) {
							logMgr.addLog('ERROR', '[WearCostume] Invalid account (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						if (msg['costume_id'] <= 0 || dataMgr.costumeData.length <= msg['costume_id']) {
							logMgr.addLog('ERROR', '[WearCostume] Invalid costume id');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_COSTUME_ID'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						if (msg['character_id'] <= 0 || dataMgr.characterData.length < msg['character_id']) {
							logMgr.addLog('ERROR', '[WearCostume] Invalid character id');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_CHARACTER'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_3();
					});
				}

				// Calls selectCostume SP then verifies costume
				function call_3() {
					mysqlMgr.selectCostumes(id, function (res) {
						costumeData = dataMgr.getCostumeDataById(msg['costume_id']);
						costumeColumn = '_' + costumeData['ID'];
						costume = res[costumeColumn];

						if (costume === null || typeof costume === 'undefined') {
							logMgr.addLog('ERROR', '[WearCostume] This user (' + kId + ') does not have this costume(' + costume + ')');
							sysMsg['res'] = build.SystemMessage.Result['NOT_HAVING'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_4();
					});
				}

				// Calls selectCharacters SP then verifies character
				// after that fulfills rMsg
				function call_4() {
					mysqlMgr.selectCharacters(id, function (res) {
						if (res['_' + msg['character_id']] === 0) {
							logMgr.addLog('ERROR', '[WearCostume] This user  (' + kId + ') does not have this character(' + msg['character_id'] + ')');
							sysMsg['res'] = build.SystemMessage.Result['NOT_HAVING'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}
						
						var E_Parts = define.E_Parts;

						procedure = 'updateCharacter' + E_Parts[costumeData['Costume_Type']];
						rMsg['costume_id'] = msg['costume_id'];

						mysqlMgr[procedure](id, msg['costume_id'], msg['character_id'], function (res) {
							lastCall();
						});
					});
				}

				// Sends rMsg to client
				function lastCall() {
					write(response, toStream(rMsg));
					done();
				}
			};

			done();
		});

		test('should be equal to id of WearCostumeReply', function (done) {
			handlerMock(response, data, test_1.sessionId, done);
		});
	});

	suite('# RequestBatonHandler', function () {
		setup(function (done) {
			data = new build.RequestBaton();	
			data['character_id'] = 3;
			data = data.toArrayBuffer();

			response = new FakeResponse(new build.RequestBatonReply());

			handlerMock = function RequestBatonHandler(response, data, session_id, done){
				var msg = build.RequestBaton.decode(data);
				var rMsg = new build.RequestBatonReply();
				var sysMsg = new build.SystemMessage();

				var kId = '';
				var id = 0;
				var selected = 0;
				var character = msg['character_id'];
				var cash = 0;
				var coin = 0;
				var coinCost = 100;
				var cashCost = 5;

				firstCall();

				// Updates session then verifies kId
				function firstCall() {
					session.toAuthUpdateSession(session_id, function (k_id) {
						kId = k_id;

						if (kId === false) {
							logMgr.addLog('ERROR', '[RequestBaton] Unauthenticated client accessed : (' + session_id + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_2();
					});
				}

				// Calls loadUser SP then verifies id
				function call_2() {
					mysqlMgr.loadUser(kId, function (res) {
						id = res['res'];

						if (id <= 0) {
							logMgr.addLog('ERROR', '[RequestBaton] Invalid account (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_3();
					});
				}

				// Calls loadSelectedCharacter SP then verifies character_id
				function call_3() {
					mysqlMgr.loadSelectedCharacter(id, function (res) {
						selected = res['selected_character'];

						call_4();
					});
				}

				// Calls loadCash SP then verifies cost
				function call_4() {
					mysqlMgr.loadCash(id, function (res) {
						cash = res['cash'];

						if (selected === character && cash < cashCost) {
							logMgr.addLog('ERROR', '[RequestBaton] not enough cash(' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_CASH'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_5();
					});
				}

				// Calls loadCoin SP then verifies coin
				function call_5() {
					mysqlMgr.loadCoin(id, function (res) {
						coin = res['coin'];

						if (selected === character) {
							rMsg['coin'] = coin;
							rMsg['cash'] = cash - cashCost;

							mysqlMgr.updateCash(id, rMsg['cash'], function (res) {
								lastCall();
							});
							return;
						}

						if (coin < coinCost) {
							logMgr.addLog('ERROR', '[RequestBaton] not enough coin(' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['NOT_ENOUGH_COIN'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_6();
					});
				}

				// Calls loadCharacter then verifies lv
				function call_6() {
					mysqlMgr.loadCharacter(id, character, function (res) {
						var lv = res['lv'];

						if (lv <= 0) {
							logMgr.addLog('ERROR', '[RequestBaton] This user(' + kId + ') does not having this character(' + character + ')');
							sysMsg['res'] = build.SystemMessage.Result['NOT_HAVING'];
							write(response, toStream(sysMsg));
							done();
							return ;				
						}

						rMsg['coin'] = coin - coinCost;
						rMsg['cash'] = cash;

						mysqlMgr.updateCoin(id, rMsg['coin'], function (res) {
							lastCall();
						});
					});
				}

				// Sends rMsg to client
				function lastCall () {
					write(response, toStream(rMsg));
					done();
				};
			};

			done();
		});

		test('should be equal to id of RequestBatonReply', function (done) {
			handlerMock(response, data, test_1.sessionId, done);
		});
	});

	suite('# LoadPostboxHandler', function () {
		setup(function (done) {
			data = new build.LoadPostbox();	
			data = data.toArrayBuffer();

			response = new FakeResponse(new build.Postbox());

			handlerMock = function LoadPostboxHandler(response, data, session_id, done){
				var msg = build.LoadPostbox.decode(data);
				var rMsg = new build.Postbox();
				var sysMsg = new build.SystemMessage();

				var kId = '';
				var id = 0;
				var list = 0;
				var nextCallTrigger = 0;

				firstCall();

				// Updates session then verifies kId
				function firstCall() {
					session.toAuthUpdateSession(session_id, function (k_id) {
						kId = k_id;

						if (kId === false) {
							logMgr.addLog('ERROR', '[LoadPostbox] Unauthenticated client accessed : (' + session_id + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_2();
					});
				}

				// Calls loadUser SP then verifies id
				function call_2() {
					mysqlMgr.loadUser(kId, function (res) {
						id = res['res'];

						if (id <= 0) {
							logMgr.addLog('ERROR', '[LoadPostbox] Invalid account (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_3();
					});
				}

				// Verifies id then calls loadEnergyByReceiver SP
				function call_3() {
					mysqlMgr.loadEnergyByReceiver(id, function (res) {
						var sender_id = res[0]['sender_id'];

						if (sender_id === 0) {
							call_4(id);			
							return;
						}
						
						list = res;
						test_2.setEnergyList(list);
						nextCallTrigger = list.length;

						recursiveCall_1(0);
					});
				}

				// Fulfills rMsg['energy'] field.
				function recursiveCall_1(idx) {
					mysqlMgr.loadUserKId(list[idx]['sender_id'], function (res) {
						var res = res['res'];
						
						rMsg['energy'].push({
							'sender_k_id': res,
							'amount': list[idx]['amount'],
							'sended_time': list[idx]['sended_time'],
						});
						
						++idx;
						if (idx === nextCallTrigger) {
							call_4();
						} else {
							recursiveCall_1(idx);
						}
					});
				};

				// Calls loadEvolutionByReceiverId SP
				function call_4() {
					mysqlMgr.loadEvolutionByReceiverId(id, function (res) {
						var sender_id = res[0]['sender_id'];
						
						if (sender_id === 0) {
							lastCall(-1, 0);
							return;
						}

						list = res;
						test_2.setEvolutionList(list);
						mextCallTrigger = list.length;
						
						recursiveCall_2(0);
					});
				}

				// Fulfills rMsg['evolution'] field
				function recursiveCall_2(idx) {
					var accepted = list[idx]['accepted'];

					if (accepted === 1) {
						lastCall(idx, nextCallTrigger);
						return ;
					}

					mysqlMgr.loadUserKId(list[idx]['sender_id'], function (res) {
						var sender_k_id = res['res'];
						var item = list[idx];

						rMsg['evolution'].push({'sender_k_id': sender_k_id, 'character_id': item['character_id'], 'sended_time': item['sended_time']});

						lastCall(idx, nextCallTrigger);
					});
				}

				// Sends rMsg to client or Calls recursiveCall
				var lastCall = function (idx, trigger) {
					++idx;

					if (idx === trigger) {
						write(response, toStream(rMsg));
						done();
					} else {
						recursiveCall_2(idx);
					}
				};
			};

			done();
		});

		test('should be equal to id of Postbox', function (done) {
			handlerMock(response, data, test_2.sessionId, done);
		});
	});

	suite('# AcceptEvolutionHandler', function () {
		setup(function (done) {
			data = new build.AcceptEvolution();	
			data['sender_k_id'] = test_1.name;
			data['character_id'] = 2;
			data = data.toArrayBuffer();

			response = new FakeResponse(new build.AcceptEvolutionReply());

			handlerMock = function AcceptEvolutionHandler(response, data, session_id, done){
				var msg = build.AcceptEvolution.decode(data);
				var rMsg = new build.AcceptEvolutionReply();
				var sysMsg = new build.SystemMessage();

				var kId = '';
				var receiverId = 0;
				var senderId = 0;

				firstCall();

				// Update session then verifies kId
				function firstCall() {
					session.toAuthUpdateSession(session_id, function (k_id) {
						kId = k_id;

						if (kId === false) {
							logMgr.addLog('ERROR', '[AcceptEvolution] Unauthenticated client accessed : (' + session_id + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_2();
					});
				}

				// Calls loadUser SP then verifies receiverId
				function call_2() {
					mysqlMgr.loadUser(kId, function (res) {
						receiverId = res['res'];

						if (receiverId <= 0) {
							logMgr.addLog('ERROR', '[AcceptEvolution] Invalid account (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_3();
					});
				}

				// Ccalls loadUser SP then verifies senderId
				function call_3() {		
					mysqlMgr.loadUser(msg['sender_k_id'], function (res) {
						senderId = res['res'];

						if (senderId <= 0) {
							logMgr.addLog('ERROR', '[AcceptEvolution] Invalid account (' + msg['sender_k_id'] + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_4();
					});
				}

				// Calls existEvolution SP then verifies evolution
				function call_4() {
					mysqlMgr.existEvolution(senderId, receiverId, msg['character_id'], function (res) {
						res = res['res'];

						if (!res) {
							logMgr.addLog('ERROR', '[AcceptEvolution] Invalid evolution (sed:' + senderId + ', rec:' + receiverId + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_EVOLUTION'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						mysqlMgr.acceptEvolution(senderId, receiverId, msg['character_id'], function (res) {
							lastCall();
						});
					});
				}

				// Sends rMsg to client
				function lastCall() {
					write(response, toStream(rMsg));
					done();
				}
			};

			done();
		});

		test('should be equal to id of AcceptEvolutionReply', function (done) {
			handlerMock(response, data, test_2.sessionId, done);
		});
	});

	suite('# LoadEvolutionProgressHandler', function () {
		setup(function (done) {
			data = new build.LoadEvolutionProgress();	
			data = data.toArrayBuffer();

			response = new FakeResponse(new build.EvolutionProgress());

			handlerMock = function LoadEvolutionProgressHandler(response, data, session_id, done){
				var msg = build.LoadEvolutionProgress.decode(data);
				var rMsg = new build.EvolutionProgress();
				var sysMsg = new build.SystemMessage();

				var kId = '';
				var sender_id = 0;

				firstCall();

				// Updates session then verifies kId
				function firstCall() {
					session.toAuthUpdateSession(session_id, function (k_id) {
						kId = k_id;

						if (kId === false) {
							logMgr.addLog('ERROR', '[LoadEvolutionProgress] Unauthenticated client accessed : (' + session_id + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
							write(response, toStream(sysMsg));
							done();
							return ;
						};

						call_2();
					});
				}

				// Calls loadUser then verifies sender_id
				function call_2() {
					mysqlMgr.loadUser(kId, function (res) {
						sender_id = res['res'];	

						if (sender_id <= 0) {
							logMgr.addLog('ERROR', '[LoadEvolutionProgress] Invalid account (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						recursiveCall(0);
					});
				}

				// Calls all of loadCharacter SP in order recursively
				function recursiveCall(idx) {
					var characterId = (idx + 1);

					mysqlMgr.loadCharacter(sender_id, characterId, function(res) {
						var lv = res;

						mysqlMgr.loadEvolutionProgress(sender_id, characterId, function(res) {
							var list = res;
							var acceptedList = [];
							var newLevel = lv;
							var i = 0;
							var lastCallTrigger = dataMgr.characterData.length;

							for (; i < list.length; ++i) {
								if (list[i]['accepted'] === 1) {
									acceptedList.push(list[i]);
								}
							}					

							var accepted = acceptedList.length;

							var innerCall_2 = function () {
								newLevel = lv + 1;
								mysqlMgr.addCharacter(sender_id, characterId, function (res) { });
								mysqlMgr.deleteEvolution(sender_id, characterId, function (res) { 
									lastCall(idx, lastCallTrigger); 
								});
							};

							if (accepted === 1 && lv === 5) {
								innerCall_2();
							} else if (accepted === 2 && lv === 10) {
								innerCall_2();
							} else if (accepted === 3 && lv === 15) {
								innerCall_2();
							} else {
								lastCall(idx, lastCallTrigger);
							}
						});
					});
				}

				// Sends rMsg to client or calls recursiveCall
				function lastCall (idx, trigger) {
					++idx;

					if (idx === trigger) {
						write(response, toStream(rMsg));
						done();
					} else {
						recursiveCall(idx);
					}
				};
			};

			done();
		});

		test('should be equal to id of LoadEvolutionProgressReply', function (done) {
			handlerMock(response, data, test_1.sessionId, done);
		});
	});

	suite('# CheckInChargeHandler', function () {
		setup(function (done) {
			data = new build.CheckInCharge();	
			data = data.toArrayBuffer();

			response = new FakeResponse(new build.ChargeInfo());

			handlerMock = function CheckInChargeHandler(response, data, session_id, done){
				var msg = build.CheckInCharge.decode(data);
				var rMsg = new build.ChargeInfo();
				var sysMsg = new build.SystemMessage();

				var kId = '';
				var id = 0;

				firstCall();

				// Updates session then verifies kId
				function firstCall() {
					session.toAuthUpdateSession(session_id, function (k_id) {
						kId = k_id;

						if (kId === false) {
							logMgr.addLog('ERROR', '[CheckInCharge] Unauthenticated client accessed : (' + session_id + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_2();
					});
				}

				// Calls loadUser SP then verifies id
				function call_2() {
					mysqlMgr.loadUser(kId, function (res) {
						id = res['res'];

						if (id <= 0) {
							logMgr.addLog('ERROR', '[CheckInCharge] Invalid account (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_3();
					});
				}

				// Calls checkInCharge SP then fulfills rMsg
				function call_3() {
					mysqlMgr.checkInCharge(id, function (res) {
						var last = res['last_charged_time'];
						var energy = res['energy'];
						var energyMax = 100;
						var now = new Date().getTime();
						now = convertMS2S(now);

						if (energyMax === energy) {
							rMsg['energy'] = energyMax;
							rMsg['last_charged_time'] = now;

							mysqlMgr.updateLastChargeTime(id, now, function (res) {
								lastCall();
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

								mysqlMgr.updateLastChargeTime(id, uptodate, function (res) {
									mysqlMgr.updateEnergy(id, energy, function (res) {
										lastCall();
									});
								});
							} else {
								if (energy === 0) {
									rMsg['energy'] = 0;
								} else {
									rMsg['energy'] = energy;
								}
								
								rMsg['last_charged_time'] = last;
								lastCall();
							}
						}
					});
				}

				// Sends rMsg to client
				function lastCall() {
					write(response, toStream(rMsg));
					done();
				}
			};

			done();
		});

		test('should be equal to id of ChargeInfo', function (done) {
			handlerMock(response, data, test_1.sessionId, done);
		});
	});

	suite('# AcceptEnergyHandler', function () {
		setup(function (done) {
			data = new build.AcceptEnergy();	
			data['sender_k_id'] = test_1.name;
			data['sended_time'] = test_2.energyList[0]['sended_time'];
			data = data.toArrayBuffer();

			response = new FakeResponse(new build.AcceptEnergyReply());

			handlerMock = function AcceptEnergyHandler(response, data, session_id, done){
				var msg = build.AcceptEnergy.decode(data);
				var rMsg = new build.AcceptEnergyReply();
				var sysMsg = new build.SystemMessage();

				var kId = '';
				var id = 0;
				var receiverId = 0;
				var senderId = 0;

				firstCall();

				// Updates session then verifies kId
				function firstCall() {
					session.toAuthUpdateSession(session_id, function (k_id) {
						kId = k_id;

						if (kId === false) {
							logMgr.addLog('ERROR', '[AcceptEnergy] Unauthenticated client accessed : (' + session_id + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
							write(response, toStream(sysMsg));
							return ;
						}

						call_2();
					});
				}

				// Calls loadUser SP then verifies receiverId
				function call_2() {
					mysqlMgr.loadUser(kId, function (res) {
						receiverId = res['res'];

						if (receiverId <= 0) {
							logMgr.addLog('ERROR', '[AcceptEnergy] Invalid account (' + kId + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
							write(response, toStream(sysMsg));
							return ;
						}

						call_3();
					});
				}

				// Calls loadUser SP then verifies senderId
				function call_3() {
					mysqlMgr.loadUser(msg['sender_k_id'], function(res) {
						senderId = res['res'];

						if (senderId <= 0) {
							logMgr.addLog('ERROR', '[AcceptEnergy] Invalid account (' + msg['sender_k_id'] + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
							write(response, toStream(sysMsg));
							return ;
						}

						call_4();
					});
				}

				// Calls acceptEnergy SP then fulfills rMsg
				function call_4() {
					mysqlMgr.acceptEnergy(senderId, receiverId, msg['sended_time'], function (res) {
						res = res['energy'];

						if (res === -1) {
							logMgr.addLog('ERROR', '[AcceptEnergy] Invalid energy (' + msg['receiver_k_id'] + ', ' + msg['sender_k_id'] + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_HONEY'];
							write(response, toStream(sysMsg));
							return;
						} 

						var energyMax = 100;
						var energy = 0;
						
						if (res + 1 > energyMax) {
							energy = energyMax;		
						} else {
							energy = res + 1;
						}
						
						rMsg['energy'] = energy;

						mysqlMgr.updateEnergy(receiverId, energy, function(res) {
							lastCall();
						});
					});
				}

				// Sends rMsg to client
				function lastCall() {
					write(response, toStream(rMsg));
					done();
				}
			};

			done();
		});

		test('should be equal to id of AcceptEnergyReply', function (done) {
			handlerMock(response, data, test_2.sessionId, done);
		});
	});

	suite('# LogoutHandler', function () {
		setup(function (done) {
			data = new build.Logout();	
			data = data.toArrayBuffer();

			response = new FakeResponse(new build.LogoutReply());

			handlerMock = function LogoutHandler(response, data, session_id, done){
				var msg = build.Logout.decode(data);
				var sysMsg = new build.SystemMessage();
				var rMsg = new build.LogoutReply();

				var kId = '';

				firstCall();

				// Unregisters session then verifies kId
				function firstCall() {
					session.toAuthUnregisterSession(session_id, function (k_id) {
						kId = k_id;

						if (kId === false) {
							logMgr.addLog('ERROR', '[Logout] Unauthenticated client accessed : (' + session_id + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_2();
					});
				}

				// Calls loadUser SP then verifies id
				function call_2() {
					mysqlMgr.loadUser(kId, function (res) {
						var id = res['res'];

						if (id <= 0) {
							sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
							logMgr.addLog('ERROR', 'logoutHandle failed : ' + kId + ', ' + id);
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						lastCall();
					});
				}

				// Sends rMsg to client
				function lastCall() {
					logMgr.addLog('SYSTEM', 'logout : ' + kId);
					write(response, toStream(rMsg));
					done();
				}
			};

			done();
		});

		suite('# Logout test_1', function () {
			test('should be equal to id of LogoutReply', function (done) {
				handlerMock(response, data, test_1.sessionId, done);
			});
		});

		suite('# Logout test_2', function () {
			test('should be equal to id of LogoutReply', function (done) {
				handlerMock(response, data, test_2.sessionId, done);
			});
		});
	});

	suite('# UnregisterAccountHandler', function () {
		setup(function (done) {
			data = new build.UnregisterAccount();	
			data = data.toArrayBuffer();

			response = new FakeResponse(new build.UnregisterAccountReply());

			handlerMock = function UnregisterAccountHandler(response, data, session_id, done) {
				var msg = build.UnregisterAccount.decode(data);
				var rMsg = new build.UnregisterAccountReply();
				var sysMsg = new build.SystemMessage();

				var kId = '';
				var id = 0;

				firstCall();

				// Unregisters session then verifies kId
				function firstCall() {
					session.toAuthUnregisterSession(session_id, function (k_id) {
						kId = k_id;

						if (kId === false) {
							logMgr.addLog('ERROR', '[UnregisterAccount] Unauthenticated client accessed : (' + session_id + ')');
							sysMsg['res'] = build.SystemMessage.Result['INVALID_SESSION'];
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						call_2();
					});
				}

				// Calls loadUser SP then Verifies id
				function call_2() {
					mysqlMgr.loadUser(kId, function (res) {
						id = res['res'];
						
						if (id <= 0) {
							sysMsg['res'] = build.SystemMessage.Result['INVALID_ACCOUNT'];
							logMgr.addLog('ERROR', '[UnregisterAccount] Invalid Account : ' + kId + ', ' + res);
							write(response, toStream(sysMsg));
							done();
							return ;
						}

						lastCall();
					});
				}

				// Deletes user then Sends rMsg to client and UserUnregister log to log server
				function lastCall() {
					mysqlMgr.deleteUser(id, function (res) {
						write(response, toStream(rMsg));

						logMgr.addLog('SYSTEM', 'UnregisterAccount : ' + kId);
						
						var UserUnregister = build.UserUnregister;
						var req = new UserUnregister();
						req['k_id'] = kId;

						request(req);
						done();
					});
				}
			};

			done();
		});

		suite('# Unregister test_1', function () {
			test('should be equal to id of UnregisterAccountReply', function (done) {
				handlerMock(response, data, test_1.sessionId, done);
			});
		});

		suite('# Unregister test_2', function () {
			test('should be equal to id of UnregisterAccountReply', function (done) {
				handlerMock(response, data, test_2.sessionId, done);
			});
		});
	});

	suiteTeardown(function (done) {
		done();
	});
});
