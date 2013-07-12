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
	var VersionInfoReply = build.VersionInfoReply;
	var rMsg = new VersionInfoReply();

	// FIXME
	rMsg['version'] = msg['version'];

	write(response, toStream(rMsg));
} // end VersionInfoHandler

function RegisterAccountHandler(response, data){
	var msg = build.RegisterAccount.decode(data);
	var now = new Date().getTime();

	var procedure = 'sea_CreateUser';
	var params = "'" + msg['k_id'] + "', " + now + "";
	
	var callback = function (results, fields) {
		var RegisterAccountReply = build.RegisterAccountReply;
		var rMsg = new RegisterAccountReply();
		var res = results[0][0]['res'];
		var Result = build.Result;

		if (res === 0) {
			log.addLog('ERROR', 'Already exsisting account : ' + msg['k_id']);

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
//	var msg = build.UnregisterAccount.decode(data);
} // end UnregisterAccountHandler

function LoginHandler(response, data){
	var msg = build.Login.decode(data);
	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";

	var callback = function (results, fields) {
		var res = results[0][0]['res'];
		var id = res;
		var AccountInfo = build.AccountInfo;
		var rMsg = new AccountInfo();
		rMsg['k_id'] = msg['k_id'];
		var Result = build.Result;
		var blackCallback = function (results, fields) {
			res = results[0][0]['res'];

			if (res) {
				log.addLog('SYSTEM', 'blocked account access : (' + msg['k_id'] + ')');
				rMsg['res'] = Result['BLOCK'];
				for (var val in rMsg) {
					if (rMsg[''+val] === null) {
						rMsg[''+val] = build.AccountInfo.Pack['ZERO'];
					}
				}
				write(response, toStream(rMsg));
			} else {				
				procedure = 'sea_LoadUserInfo';
				params = id;											

				var loadUserInfoCallback = function (results, fields) {
					res = results[0][0];
					var Pack = build.AccountInfo.Pack;
					var piece = UUID();

					if (registerSession(piece, msg['k_id']) === 0) {
						log.addLog('SYSTEM', 'Duplicated account login (' + msg['k_id'] + ')');
						rMsg['res'] = Result['DUPLE'];

						for (var val in rMsg) {
							if (rMsg[''+val] === null || rMsg[''+val] === undefined) {
								rMsg[''+val] = AccountInfo.Pack['ZERO'];
							}
						}
						
						write(response, toStream(rMsg));
					} else {
						rMsg['res'] = Result['TRUE'];

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
					}
				};

				mysql.call(procedure, params, loadUserInfoCallback);

				var AccountLogin = build.AccountLogin;
				var req = new AccountLogin();
				req['k_id'] = msg['k_id'];

				request(req);
			} // end if else
		}; // end blackcallback

		if (res > 0) {
			procedure = 'sea_IsBlack';
			params = "'" + msg['k_id'] + "'";
			mysql.call(procedure, params, blackCallback);
		}
		else {
			log.addLog('SYSTEM', 'Invalid account (res : ' + res + ')');
			rMsg['res'] = Result['FALSE'];
			write(response, toStream(rMsg));
		}
	}; // end callback

	mysql.call(procedure, params, callback);
} // end LoginHandler

function LogoutHandler(response, data){
	var msg = build.Logout.decode(data);
	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";

	var callback = function (results, fields) {
		var res = results[0][0]['res'];
		var Logout = build.Logout;
		var rMsg = new Logout();
		rMsg['k_id'] = msg['k_id'];

		if (res > 0) {
			rMsg['res'] = build.Result['TRUE'];
			log.addLog('SYSTEM', 'logout : ' + msg['k_id']);
		}
		else {			
			rMsg['res'] = build.Result['FALSE'];
			log.addLog('ERROR', 'logoutHandle failed : ' + msg['k_id'] + ', ' + res);
		}

		write(response, toStream(rMsg));
	};

	mysql.call(procedure, params, callback);
} // end LogoutHandler

function CheckInChargeHandler(response, data){
	var msg = build.CheckInCharge.decode(data);
	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";

	var callback = function (results, fields) {
		var res = results[0][0]['res'];
		var id;
		var ChargeInfo = build.ChargeInfo;
		var Result = build.Result;
		var rMsg = new ChargeInfo();
		rMsg['k_id'] = msg['k_id'];

		if (res > 0) {
			id = res;
			rMsg['res'] = Result['TRUE'];
			procedure = 'sea_CheckInCharge';
			params = id;

			var checkInChargeCallback = function (results, fields) {
				res = results[0][0];
				var last = res['last_charged_time'];
				var honey = res['honey'];
				var honeyMax = 99;
				var now = new Date().getTime();

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
			}; // checkInChargeCallback

			mysql.call(procedure, params, checkInChargeCallback);			
		}
		else {
			log.addLog('SYSTEM', 'Invalid account (' + msg['k_id'] + ')');
			rMsg['res'] = Result['FALSE'];
			write(response, toStream(rMsg));
		}
	}; // sea_LoadUser

	mysql.call(procedure, params, callback);
} // end CheckInChargeHandler

function SelectCharacterHandler(response, data){
	var msg = build.SelectCharacter.decode(data);
	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";

	var callback = function (results, fields) {
		var res = results[0][0]['res'];
		var id;
		var SelectCharacterReply = build.SelectCharacterReply;
		var rMsg = new SelectCharacterReply();
		var Result = build.Result;
		rMsg['k_id'] = msg['k_id'];

		if (res > 0) {
			id = res;
			rMsg['res'] = Result['TRUE'];
			procedure = 'sea_SelectUserCharacter';
			params = id;

			var callback = function (results, fields) {
				res = results[0][0]['res'];

				if (res & msg['selected_character']) {
					write(response, toStream(rMsg));
				}
				else {
					log.addLog('ERROR', 'Invalid character (' + msg['k_id'] + ', ' + 'character : ' + msg['selected_character'] + ')');
				}
			};

			mysql.call(procedure, params, loadUserInfoCallback);
		}
		else {
			log.addLog('SYSTEM', 'Invalid account (' + msg['k_id'] + ')');
			rMsg['res'] = Result['FALSE'];
			write(response, toStream(rMsg));
		}
	};

	mysql.call(procedure, params, callback);
} // end SelectCharacterHandler

function SelectAssistantHandler(response, data){
	var msg = build.SelectAssistant.decode(data);
	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";

	var callback = function (results, fields) {
		var res = results[0][0]['res'];
		var id;
		var SelectAssistantReply = build.SelectAssistantReply;
		var rMsg = new SelectAssistantReply();
		var Result = build.Result;
		rMsg['k_id'] = msg['k_id'];

		if (res > 0) {
			id = res;
			rMsg['res'] = Result['TRUE'];
			procedure = 'sea_SelectUserAssistant';
			params = res;

			var selectCallback = function (results, fields) {
				res = results[0][0]['res'];

				if (res & msg['selected_assistant']) {
					write(response, toStream(rMsg));
				}
				else {
					log.addLog('ERROR', 'Invalid assistant (' + msg['k_id'] + ', ' + 'assistant : ' + msg['selected_assistant'] + ')');
				}
			};

			mysql.call(procedure, params, selectCallback);			
		}
		else {
			log.addLog('SYSTEM', 'Invalid account (' + msg['k_id'] + ')');
			rMsg['res'] = Result['FALSE'];
			write(response, toStream(rMsg));
		}
	};

	mysql.call(procedure, params, callback);
} // end SelectAssistantHandler

function StartGameHandler(response, data){
	var msg = build.StartGame.decode(data);
	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";

	var honeyMax = 99;

	var callback = function (results, fields) {
		var res = results[0][0]['res'];
		var id;
		var StartGameReply = build.StartGameReply;
		var Result = build.Result;
		var rMsg = new StartGameReply();
		rMsg['k_id'] = msg['k_id'];

		if (res > 0) {
			id = res;
			rMsg['res'] = Result['TRUE'];
			procedure = 'sea_StartGame';
			params = id;

			var startGameCallback = function (results, fields) {
				res = results[0][0];
				var reqAssistant = msg['selected_assistant'];
				var character = res['selected_character'];
				var assistant = res['selected_assistant'];
				var honey = res['honey'];
				var last = res['last_charged_time'];

				if (honey < 1) {
					log.addLog('SYSTEM', 'Not enough honey : ' + rMsg['k_id']);
					
					// FIXME
					write(response, toStream(rMsg));
				}
				else if (character != msg['selected_character'] 
						|| (( (reqAssistant === build.StartGame.Pack['ZERO']) ? 0 : (assistant != reqAssistant)))) {
					log.addLog('ERROR', "doesn't match with DB (" + character + ": " + msg['selected_character'] + ", " + assistant + ": " + reqAssistant + ")" ); 
					// FIXME
					write(response, toStream(rMsg));
				}
				else {
					if (honey == honeyMax) {
						last = new Date().getTime();	
					}
					honey -= 1;

					if (honey === 0) {
						rMsg['honey'] = StartGameReply.Pack['ZERO'];
					}
					else {
						rMsg['honey'] = honey;
					}

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
			};

			mysql.call(procedure, params, startGameCallback);
		}
		else {
			log.addLog('SYSTEM', 'Invalid account (' + msg['k_id'] + ')');
			rMsg['res'] = Result['FALSE'];
			write(response, toStream(rMsg));
		}
	}; // end sea_LoadUser

	mysql.call(procedure, params, callback);
} // end StartGameHandler

function EndGameHandler(response, data){
	var msg = build.EndGame.decode(data);
	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";

	var callback = function (results, fields) {
		var res = results[0][0]['res'];
		var id;
		var GameResult = build.GameResult;
		var Result = build.Result;
		var rMsg = new GameResult();
		rMsg['k_id'] = msg['k_id'];

		if (res > 0) {
			id = res;			
			rMsg['res'] = Result['TRUE'];
			procedure = 'sea_LoadUserBriefInfo';
			params = id;

			var userBriefInfoCallback = function (results, fields) {
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
				params = id + ', ' + rMsg['total_score'] + ', ' + msg['dist'] + ', ' + msg['kill'];
				mysql.call(procedure, params, function (results, fields) {});

				if (msg['usedItem'] > 0) {
					procedure = 'sea_AddUserItem';
					params = "'" + id + ', ' + '-1' + "'";
					mysql.call(procedure, params, function (results, fields) {});
				}

				var UserRegister = build.UserRegister;
				var req = new UserRegister();
				req['k_id'] = msg['k_id'];
				req['selected_character'] = msg['selected_character'];
				req['selected_assistant'] = msg['selected_assistant'];
				req['score'] = msg['score'];
				req['enemy_kill'] = msg['enemy_kill'];
				req['dist'] = msg['dist'];
				req['used_item'] = msg['used_item'];
				req['play_time'] = msg['play_time'];

				request(req);
			};

			mysql.call(procedure, params, userBriefInfoCallback);
		}
		else {
			log.addLog('SYSTEM', 'Invalid account (' + msg['k_id'] + ')');
			rMsg['res'] = Result['FALSE'];
			write(response, toStream(rMsg));
		}
	};

	mysql.call(procedure, params, callback);
} // end EndGameHandler

function LoadRankInfoHandler(response, data){
	var msg = build.LoadRankInfo.decode(data);	
	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";

	var callback = function (results, fields) {
		var res = results[0][0]['res'];
		var id;
		var RankInfo = build.RankInfo;
		var Result = build.Result;
		var rMsg = new RankInfo();
		var ZERO = RankInfo.FriendRankInfo.Pack['ZERO'];

		rMsg['k_id'] = msg['k_id'];

		if (res > 0) {
			id = res;
			rMsg['res'] = Result['TRUE'];
			var rankingList = require('./server').rankingList;
			
			if (rankingList.length === 0|| rankingList.length === 1) {
				rMsg['overall_ranking'] = 1;
				write(response, toStream(rMsg));
			}
			else {
				// FIXME
				var loadHoneyCallback = function(results, fields) {							
					res = results[0][0]['receiver_id'];

					if (res === 0) {
						for (var i = 0; i < rankingList.length; ++i) {
							var score = rankingList[i]['highest_score'];
							var honey_sended = ZERO;

							if (score === 0) {
								score = ZERO;
							}
							
							rMsg['ranking_list'].push({'k_id': rankingList[i]['k_id'], 'score': score, 'honey_sended': honey_sended});

							if (rankingList[i]['k_id'] === rMsg['k_id']) {
								rMsg['overall_ranking'] = i+1;
							} else {
								rMsg['overall_ranking'] = -12944; // unique value
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
									var honey_sended = ZERO;

									if (score === 0) {
										score = ZERO;
									}
									
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
										rMsg['overall_ranking'] = -12944; // unique value
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
				}; // end loadHoneyCallback 

				procedure = 'sea_LoadHoneyBySender';
				param = id;

				mysql.call(procedure, params, loadHoneyCallback);
			}
		}
		else {
			log.addLog('SYSTEM', 'Invalid account (' + msg['k_id'] + ')');
			rMsg['res'] = Result['FALSE'];
			write(response, toStream(rMsg));
		}
	};

	mysql.call(procedure, params, callback);
} // end LoadRankInfoHandler

function LoadPostedHoneyHandler(response, data){
	var msg = build.LoadPostedHoney.decode(data);
	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";

	var callback = function (results, fields) {
		var res = results[0][0]['res'];
		var id;
		var PostedHoney = build.PostedHoney;
		var Result = build.Result;
		var rMsg = new PostedHoney();
	
		rMsg['k_id'] = msg['k_id'];

		if (res > 0) {
			id = res;
			rMsg['res'] = Result['TRUE'];			

			procedure = 'sea_LoadHoneyByReceiver';
			params = id;
			var loadHoneyCallback = function (results, fields) {
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
			};

			mysql.call(procedure, params, loadHoneyCallback);
		}
		else {
			log.addLog('SYSTEM', 'Invalid account (' + msg['k_id'] + ')');
			rMsg['res'] = Result['FALSE'];
			write(response, toStream(rMsg));
		}
	};

	mysql.call(procedure, params, callback);
} // end LoadPostedHoneyHandler

function LoadPostedBatonHandler(response, data){
	var msg = build.LoadPostedBaton.decode(data);
	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";

	var callback = function (results, fields) {
		var res = results[0][0]['res'];
		var id;
		var PostedBaton = build.PostedBaton;
		var Result = build.Result;
		var rMsg = new PostedBaton();
	
		rMsg['k_id'] = msg['k_id'];

		if (res > 0) {
			id = res;
			rMsg['res'] = Result['TRUE'];			

			procedure = 'sea_LoadBaton';
			params = id;
			var loadCallback = function (results, fields) {
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
			};

			mysql.call(procedure, params, loadCallback);
		}
		else {
			log.addLog('SYSTEM', 'Invalid account (' + msg['k_id'] + ')');
			rMsg['res'] = Result['FALSE'];
			write(response, toStream(rMsg));
		}
	};

	mysql.call(procedure, params, callback);
} // end LoadPostedBatonHandler

function LoadPostedBatonResultHandler(response, data){
	var msg = build.LoadPostedBatonResult.decode(data);
	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";

	var callback = function (results, fields) {
		var res = results[0][0]['res'];
		var id;
		var PostedBatonResult = build.PostedBatonResult;
		var Result = build.Result;
		var rMsg = new PostedBatonResult();
	
		rMsg['k_id'] = msg['k_id'];

		if (res > 0) {
			id = res;
			rMsg['res'] = Result['TRUE'];			

			procedure = 'sea_LoadBatonResult';
			params = id;
			var loadCallback = function (results, fields) {
				var sender_id = results[0][0]['sender_id'];

				console.log(results[0]);

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
			};

			mysql.call(procedure, params, loadCallback);
		}
		else {
			log.addLog('SYSTEM', 'Invalid account (' + msg['k_id'] + ')');
			rMsg['res'] = Result['FALSE'];
			write(response, toStream(rMsg));
		}
	};

	mysql.call(procedure, params, callback);
} // end LoadPostedBatonResultHandler

function RequestPointRewardHandler(response, data){
	var msg = build.RequestPointReward.decode(data);
} // end RequestPointRewardHandler

function BuyItemHandler(response, data){
	var msg = build.BuyItem.decode(data);

	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";

	var callback = function (results, fields) {
		var res = results[0][0]['res'];
		var id;
		var BuyItemReply = build.BuyItemReply;
		var Result = build.Result;
		var rMsg = new BuyItemReply();
	
		rMsg['k_id'] = msg['k_id'];

		if (res > 0) {
			id = res;			
			procedure = 'sea_LoadCoin';
			params = id;
			var loadCoinCallback = function(results, fields) {
				var coin = results[0][0]['coin'];

				if (coin < 0) {
					rMsg['res'] = Result['NOT_ENOUGH'];
					rMsg['item'] = BuyItemReply.Item['NONE'];
				} else {
					rMsg['res'] = Result['TRUE'];

					// FIXME
					if (msg['item'] === build.BuyItem.Item['EXP_BOOST']) {						
						procedure = 'sea_UpdateCoin';
						params = id + ', ' + 0;
						mysql.call(procedure, params, function(results, fields){});

						procedure = 'sea_UpdateExpBoost';
						params = id + ', ' + 1;
						mysql.call(procedure, params, function(results, fields){});
		
						rMsg['item'] = BuyItemReply.Item['EXP_BOOST'];
					} else if (msg['item'] === build.BuyItem.Item['LAST_ITEM']) {
						procedure = 'sea_UpdateCoin';
						params = id + ', ' + 0;
						mysql.call(procedure, params, function(results, fields){});

						procedure = 'sea_UpdateItemLast';
						params = id + ', ' + 1;
						mysql.call(procedure, params, function(results, fields){});
		
						rMsg['item'] = BuyItemReply.Item['LAST_ITEM'];
					} else if (msg['item'] === build.BuyItem.Item['MAX_ATTACK']) {
						procedure = 'sea_UpdateCoin';
						params = id + ', ' + 0;
						mysql.call(procedure, params, function(results, fields){});

						procedure = 'sea_UpdateMaxAttack';
						params = id + ', ' + 1;
						mysql.call(procedure, params, function(results, fields){});
		
						rMsg['item'] = BuyItemReply.Item['MAX_ATTACK'];
					} else if (msg['item'] === build.BuyItem.Item['RANDOM']) {
						procedure = 'sea_UpdateCoin';
						params = id + ', ' + 0;
						mysql.call(procedure, params, function(results, fields){});

						var random = Math.floor(Math.random() * (BuyItemReply.Item['MAX'] - BuyItemReply.Item['MAGNET'])) + BuyItemReply.Item['MAGNET'];

						procedure = 'sea_UpdateRandom';
						params = id + ', ' + random;
						mysql.call(procedure, params, function(results, fields){});
		
						rMsg['item'] = random;

					} else {
						log.addLog('ERROR', 'Invalid request field (' + msg['k_id'] + ', ' + msg['item'] + ')');
						rMsg['res'] = Result['FALSE'];
						rMsg['item'] = BuyItemReply.Item['NONE'];
					}
				}
				write(response, toStream(rMsg));
			};

			mysql.call(procedure, params, loadCoinCallback);
		}
		else {
			log.addLog('SYSTEM', 'Invalid account (' + msg['k_id'] + ')');
			rMsg['res'] = Result['FALSE'];
			write(response, toStream(rMsg));
		}
	};

	mysql.call(procedure, params, callback);
} // end BuyItemHandler

function SendHoneyHandler(response, data){
	var msg = build.SendHoney.decode(data);

	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";

	var callback = function (results, fields) {
		var res = results[0][0]['res'];		
		
		if (res > 0) {
			var sender_id = res;

			procedure = 'sea_LoadUser';
			params = "'" + msg['receiver_k_id'] + "'";
			var secondLoadUserCallback = function(results, fields) {
				res = results[0][0]['res'];

				if (res > 0) {
					var receiver_id = res;
					var SendHoneyReply = build.SendHoneyReply;
					var Result = build.Result;
					var rMsg = new SendHoneyReply();
				
					rMsg['res'] = Result['TRUE'];
					rMsg['k_id'] = msg['k_id'];		

					procedure = 'sea_AddHoney';
					params = sender_id + ', ' + receiver_id;						

					write(response, toStream(rMsg));

					mysql.call(procedure, params, function(results, fields) {});
				}
				else {
					log.addLog('SYSTEM', 'Invalid account (' + msg['k_id'] + ')');
					rMsg['res'] = Result['FALSE'];
					write(response, toStream(rMsg));
				}
			}

			mysql.call(procedure, params, secondLoadUserCallback);
		}
		else {
			log.addLog('SYSTEM', 'Invalid account (' + msg['k_id'] + ')');
			rMsg['res'] = Result['FALSE'];
			write(response, toStream(rMsg));
		}
	};

	mysql.call(procedure, params, callback);
} // end SendHoneyHandler

function AcceptHoneyHandler(response, data){
	var msg = build.AcceptHoney.decode(data);

	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";
	var Result = build.Result;
	var AcceptHoneyReply = build.AcceptHoneyReply;
	var rMsg = new AcceptHoneyReply();

	var callback = function (results, fields) {
		var res = results[0][0]['res'];		
		
		if (res > 0) {
			var receiver_id = res;

			procedure = 'sea_LoadUser';
			params = "'" + msg['sender_k_id'] + "'";
			var secondLoadUserCallback = function(results, fields) {
				res = results[0][0]['res'];
				console.log(results[0][0]);

				if (res > 0) {
					var sender_id = res;
					
					var acceptHoneyCallback = function(results, fields) {
						res = results[0][0]['res'];
						var honeyMax = 99;
						procedure = 'sea_UpdateHoney';
						
						if (res + 1 > honeyMax) {
							param = 99;		
						} else {
							param = receiver_id + ', ' + (res+1);
						}
						mysql.call(procedure, param, function(results, fields) {});
						write(response, toStream(rMsg));
					};

					rMsg['res'] = Result['TRUE'];
					rMsg['k_id'] = msg['k_id'];		

					procedure = 'sea_AcceptHoney';
					params = sender_id + ', ' + receiver_id;						

					mysql.call(procedure, params, acceptHoneyCallback);
				}
				else {
					log.addLog('SYSTEM', 'Invalid account (' + msg['sender_k_id'] + ')');
					rMsg['res'] = Result['FALSE'];
					write(response, toStream(rMsg));
				}
			}

			mysql.call(procedure, params, secondLoadUserCallback);
		}
		else {
			log.addLog('SYSTEM', 'Invalid account (' + msg['k_id'] + ')');
			rMsg['res'] = Result['FALSE'];
			write(response, toStream(rMsg));
		}
	};

	mysql.call(procedure, params, callback);
} // end AcceptHoneyHandler

function RequestBatonHandler(response, data){
	var msg = build.RequestBaton.decode(data);
	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";
	var RequestBatonReply = build.RequestBatonReply;
	var Result = build.Result;
	var rMsg = new RequestBatonReply();

	var callback = function (results, fields) {
		var res = results[0][0]['res'];		
		rMsg['k_id'] = msg['k_id'];
		rMsg['coin'] = -189629;

		if (res > 0) {
			var sender_id = res;

			procedure = 'sea_LoadUser';
			params = "'" + msg['receiver_k_id'] + "'";
			var secondLoadUserCallback = function(results, fields) {
				res = results[0][0]['res'];

				if (res > 0) {
					var receiver_id = res;
					var procedure = 'sea_LoadCoin';
					var params = sender_id;
					var loadCoinCallback = function (results, fields) {
						var coin = results[0][0]['coin'];

						if (coin > 1000) {
							var restCoin = coin - 1000;

							rMsg['res'] = Result['TRUE'];							
							rMsg['coin'] = restCoin;

							procedure = 'sea_UpdateCoin';
							params = sender_id + ', ' + restCoin;

							mysql.call(procedure, params, function(results, fields) {});

							procedure = 'sea_AddBaton';
							params = sender_id + ', ' + receiver_id + ', ' + msg['score'] + ", '" + msg['map'] + "'";	

							mysql.call(procedure, params, function(results, fields) {});
						} else {
							rMsg['res'] = Result['NOT_ENOUGH'];
						}

						write(response, toStream(rMsg));
					};

					mysql.call(procedure, params, loadCoinCallback);
				} else {
					log.addLog('SYSTEM', 'Invalid account (' + msg['receiver_k_id'] + ')');
					rMsg['res'] = Result['FALSE'];
					write(response, toStream(rMsg));
				}
			}

			mysql.call(procedure, params, secondLoadUserCallback);
		} else {
			log.addLog('SYSTEM', 'Invalid account (' + msg['k_id'] + ')');
			rMsg['res'] = Result['FALSE'];
			write(response, toStream(rMsg));
		}
	};

	mysql.call(procedure, params, callback);
} // end RequestBatonHandler

function AcceptBatonHandler(response, data){
	var msg = build.AcceptBaton.decode(data);
	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";

	var callback = function (results, fields) {
		var res = results[0][0]['res'];
		var receiver_id;
		var AcceptBatonReply = build.AcceptBatonReply;
		var Result = build.Result;
		var rMsg = new AcceptBatonReply();
	
		rMsg['k_id'] = msg['k_id'];

		if (res > 0) {
			var sender_id;
			receiver_id = res;

			procedure = 'sea_LoadUser';
			params = "'" + msg['sender_k_id'] + "'";
			var loadCallback = function (results, fields) {
				res = results[0][0]['res'];

				if (res > 0) {
					sender_id = res;
					procedure = 'sea_ExistBaton';
					params = sender_id + ', ' + receiver_id + ', ' + msg['sended_time'];

					mysql.call(procedure, params, function (results, fields) {
						res = results[0][0]['res'];

						console.log("baton count : " + res);

						if (res) {
							rMsg['res'] = Result['TRUE'];
						}
						else {
							rMsg['res'] = Result['FALSE'];
						}
						write(response, toStream(rMsg));
					});
				} else {
					log.addLog('SYSTEM', 'Invalid account (' + msg['sender_k_id'] + ')');
					rMsg['res'] = Result['FALSE'];
					write(response, toStream(rMsg));
				}
			};

			mysql.call(procedure, params, loadCallback);
		}
		else {
			log.addLog('SYSTEM', 'Invalid account (' + msg['k_id'] + ')');
			rMsg['res'] = Result['FALSE'];
			write(response, toStream(rMsg));
		}
	};

	mysql.call(procedure, params, callback);
} // end AcceptBatonHandler

function EndBatonHandler(response, data){
	var msg = build.EndBaton.decode(data);
	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";
	var Result = build.Result;
	var BatonResult = build.BatonResult;
	var rMsg = new BatonResult();

	var init = function (rMsg) {
		rMsg['coin'] = BatonResult.Pack['ZERO'];
		rMsg['total_coin'] = BatonResult.Pack['ZERO'];
		rMsg['update'] = BatonResult.Update['FAIL'];
	};

	var callback = function (results, fields) {
		var res = results[0][0]['res'];
		var receiver_id;

		rMsg['k_id'] = msg['k_id'];

		if (res > 0) {
			procedure = 'sea_LoadUser';
			params = "'" + msg['sender_k_id'] + "'";
			receiver_id = res;			
			var sender_id;

			var secondCallback = function (results, fields) {
				res = results[0][0]['res'];
				sender_id = res;
				
				if (res > 0) {
					rMsg['res'] = Result['TRUE'];
					procedure = 'sea_LoadBatonScore';
					params = sender_id + ', ' + receiver_id + ', ' + msg['sended_time'];
					var loadBatonScoreCallback = function (results, fields) {
						var score;
						res = results[0][0]['score'];

						if (res === -1) {
							rMsg['res'] = Result['TRUE'];
							init(rMsg);
							write(response, toStream(rMsg));	
						} else {
							score = res;
							procedure = 'sea_LoadCoin';
							params = receiver_id;

							var userBriefInfoCallback = function (results, fields) {
								coin = results[0][0]['coin'];
								
								var finalScore = msg['score'] + score;

								rMsg['coin'] = msg['coin'];
								rMsg['total_coin'] = msg['coin'] + coin;

								procedure = 'sea_LoadHighestScore';
								params = sender_id;
								mysql.call(procedure, params, function (results, fields) {
									res = results[0][0]['res'];

									if (finalScore <= res) {
										rMsg['update'] = BatonResult.Update['FAIL'];										
									} else {
										rMsg['update'] = BatonResult.Update['SUCCESS'];
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

								if (msg['usedItem'] > 0) {
									procedure = 'sea_AddUserItem';
									params = "'" + id + ', ' + '-1' + "'";
									mysql.call(procedure, params, function (results, fields) {});
								}
							};

							mysql.call(procedure, params, userBriefInfoCallback);
						}
					};

					mysql.call(procedure, params, loadBatonScoreCallback);
				} else {
					log.addLog('SYSTEM', 'Invalid account (' + msg['k_id'] + ')');
					rMsg['res'] = Result['FALSE'];
					init(rMsg);
					write(response, toStream(rMsg));
				}
			}

			mysql.call(procedure, params, secondCallback);
		}
		else {
			log.addLog('SYSTEM', 'Invalid account (' + msg['k_id'] + ')');
			rMsg['res'] = Result['FALSE'];
			init(rMsg);
			write(response, toStream(rMsg));
		}
	};

	mysql.call(procedure, params, callback);
} // end EndBatonHandler

function AcceptBatonResultHandler(response, data){
	var msg = build.AcceptBatonResult.decode(data);
	var procedure = 'sea_LoadUser';
	var params = "'" + msg['k_id'] + "'";
	var Result = build.Result;
	var AcceptBatonResultReply = build.AcceptBatonResultReply;
	var rMsg = new AcceptBatonResultReply();

	var init = function (rMsg) {
		rMsg['update'] = AcceptBatonResultReply.Update['FAIL'];
		rMsg['score'] = AcceptBatonResultReply.Pack['ZERO'];
	};

	var callback = function (results, fields) {
		var res = results[0][0]['res'];
		var receiver_id;

		rMsg['k_id'] = msg['k_id'];

		if (res > 0) {
			procedure = 'sea_LoadUser';
			params = "'" + msg['sender_k_id'] + "'";
			receiver_id = res;			
			var sender_id;

			var secondCallback = function (results, fields) {
				res = results[0][0]['res'];
				sender_id = res;
				
				if (res > 0) {
					procedure = 'sea_LoadBatonResultScore';
					params = sender_id + ', ' + receiver_id + ', ' + msg['sended_time'];
					var loadScoreCallback = function (results, fields) {
						res = results[0][0]['score'];

						if (res === -1 ) {
							log.addLog('SYSTEM', 'Invalid account (' + msg['sender_k_id'] + ')');
							rMsg['res'] = Result['FALSE'];
							init(rMsg);
							write(response, toStream(rMsg));
						} else {
							rMsg['res'] = Result['TRUE'];
							var score = res;

							procedure = 'sea_LoadHighestScore';
							params = sender_id;
							mysql.call(procedure, params, function (results, fields) {
								res = results[0][0]['res'];

								if (score <= res) {
									rMsg['update'] = AcceptBatonResultReply.Update['FAIL'];
									rMsg['score'] = res;
								} else {
									rMsg['update'] = AcceptBatonResultReply.Update['SUCCESS'];
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
					};

					mysql.call(procedure, params, loadScoreCallback);
				} else {
					log.addLog('SYSTEM', 'Invalid account (' + msg['sender_k_id'] + ')');
					rMsg['res'] = Result['FALSE'];
					init(rMsg);
					write(response, toStream(rMsg));
				}
			};

			mysql.call(procedure, params, secondCallback);
		} else {
			log.addLog('SYSTEM', 'Invalid account (' + msg['k_id'] + ')');
			rMsg['res'] = Result['FALSE'];
			init(rMsg);
			write(response, toStream(rMsg));
		}
	};

	mysql.call(procedure, params, callback);
} // end AcceptBatonResultHandler

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
exports.SendHoneyHandler = SendHoneyHandler;
exports.AcceptHoneyHandler = AcceptHoneyHandler;
exports.RequestBatonHandler = RequestBatonHandler;
exports.AcceptBatonHandler = AcceptBatonHandler;
exports.EndBatonHandler = EndBatonHandler;
exports.AcceptBatonResultHandler = AcceptBatonResultHandler;
