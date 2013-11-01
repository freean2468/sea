/*
	#1. Creating accounts.
	#2. Just after accounts are created.
	#3. When an user buys items
	#4. black list
	#5. When an user buys characters
	#6. When an user buys costumes
	#7. When an user gets ghosts
	#8. When an user purchases ghost houses
	#9. When an user sets a ghost to an house then puts it out.
	#10. When an user sends a energy to the other after that, the other accepts it.
	#11. When an user sends a evolution to the other after that, the other accepts it.

TODO
	# Removing expired contents
*/

var MysqlMgr = require('../common/mysql').MysqlMgr;

var User = function(name) {
	// property
	this.id = 0;
	this.name = name;

	// method
	this.setId = function (id) {
		this.id = id;
	};
};

var test_1 = new User('unit_test_1');
var test_2 = new User('unit_test_2');
var mysqlMgr = new MysqlMgr('sea', 1);
var second = 0;

suite('Stored Procedure in MySQL', function() {
	suite('#1. Creating an account.', function() {
		suite('#1-1. sea_user.sql', function() {
			suite('# sea_CreateUser', function() {			
				test('should not return 0', function(done) {
					mysqlMgr.createUser(test_1.name, function(res) {
						var res = res['res'];
						res.should.not.eql(0);
						done();
					});
				});

				test('should not return 0', function(done) {
					mysqlMgr.createUser(test_2.name, function(res) {
						var res = res['res'];
						res.should.not.eql(0);
						done();
					});
				});
			});

			suite('# sea_GetUserCount', function() {
				test('should return res: more than 0', function(done) {
					mysqlMgr.getUserCount(function(res) {
						var res = res['res'];
						res.should.be.above(0);
						done();
					});
				});
			});
		});
	});

	suite('#2. Just after an account is created.', function() {
		suite('#2-1. sea_user.sql', function() {
			suite('# sea_LoadUser', function() {
				test('should not return 0', function(done) {
					mysqlMgr.loadUser(test_1.name, function(res) {
						var res = res['res'];
						res.should.not.eql(0);
						test_1.setId(res);
						done();
					});
				});

				test('should not return 0', function(done) {
					mysqlMgr.loadUser(test_2.name, function(res) {
						var res = res['res'];
						res.should.not.eql(0);
						test_2.setId(res);
						done();
					});
				});
			});

			suite('# sea_LoadUserKId', function() {
				test('should return ' + test_1.name, function(done) {
					mysqlMgr.loadUserKId(test_1.id, function(res) {
						var res = res['res'];
						res.should.eql(test_1.name);
						done();
					});
				});
			});
		});

		suite('#2-2. sea_user_info.sql', function() {
			suite('# sea_LoadUserInfo', function() {
				test('should return lv : 1', function(done) {
					mysqlMgr.loadUserInfo(test_1.id, function(res) {
						var info = res;
						info['lv'].should.eql(1);
						done();
					});
				});
			});

			suite('# sea_LoadSelectedCharacter', function() {
				test('should return 3', function(done) {
					mysqlMgr.loadSelectedCharacter(test_1.id, function(res) {
						res['selected_character'].should.eql(3);
						done();
					});
				});
			});

			suite('# sea_LoadEnergy', function() {
				test('should return 100', function(done) {
					mysqlMgr.loadEnergy(test_1.id, function(res) {
						var energy = res['energy'];
						energy.should.eql(100);
						done();
					});
				});
			});

			suite('# sea_LoadCoin', function() {
				test('should return 99999', function(done) {
					mysqlMgr.loadCoin(test_1.id, function(res) {
						var coin = res['coin'];
						coin.should.eql(99999);
						done();
					});
				});
			});

			suite('# sea_LoadCash', function() {
				test('should return 9999', function(done) {
					mysqlMgr.loadCash(test_1.id, function(res) {
						var cash = res['cash'];
						cash.should.eql(9999);
						done();
					});
				});
			});

			suite('# sea_LoadDraw', function() {
				test('should return 0', function(done) {
					mysqlMgr.loadDraw(test_1.id, function(res) {
						var draw = res['draw'];
						draw.should.eql(0);
						done();
					});
				});
			});

			suite('# sea_LoadInviteCountWithMileageAndDraw', function() {
				test('should return invite_count: 0, draw: 0, mileage: 0', function(done) {
					mysqlMgr.loadInviteCountWithMileageAndDraw(test_1.id, function(res) {
						res['invite_count'].should.eql(0);
						res['draw'].should.eql(0);
						res['mileage'].should.eql(0);
						done();
					});
				});
			});

			suite('# sea_LoadMileageAndDraw', function() {
				test('should return mileage: 0, draw: 0', function(done) {
					mysqlMgr.loadMileageAndDraw(test_1.id, function(res) {
						res['draw'].should.eql(0);
						res['mileage'].should.eql(0);
						done();
					});
				});
			});

			suite('# sea_LoadUserBriefInfo', function() {
				test('should return coin: 99999, cash: 9999, mileage: 0, draw: 0', function(done) {
					mysqlMgr.loadUserBriefInfo(test_1.id, function(res) {
						res['coin'].should.eql(99999);
						res['cash'].should.eql(9999);
						res['mileage'].should.eql(0);
						res['draw'].should.eql(0);
						done();
					});
				});
			});

			suite('# sea_CheckInCharge', function() {
				test('should return energy: 100', function(done) {
					mysqlMgr.checkInCharge(test_1.id, function(res) {
						res['energy'].should.eql(100);
						done();
					});
				});
			});

			suite.skip('# sea_StartGame', function() {
				test('should return energy: 100, selected_character: 3, _1: 0, _2: 0, _3: 0, _4: 0, _5: 0, random: 0', function(done) {
					mysqlMgr.startGame(test_1.id, function(res) {
						res['energy'].should.eql(100);
						res['selected_character'].should.eql(3);
						res['_1'].should.eql(0);
						res['_2'].should.eql(0);
						res['_3'].should.eql(0);
						res['_4'].should.eql(0);
						res['_5'].should.eql(0);
						res['random'].should.eql(0);
						done();
					});
				});
			});

			suite.skip('# sea_UpdateLv', function() {
				test('should return true', function(done) {
					mysqlMgr.updateLv(test_1.id, 2, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite.skip('# sea_UpdateExp', function() {
				test('should return true', function(done) {
					mysqlMgr.updateExp(test_1.id, 5, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite.skip('# sea_UpdateCoin', function() {
				test('should return true', function(done) {
					mysqlMgr.updateCoin(test_1.id, 100, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite.skip('# sea_AddCoin', function() {
				test('should coin: 105', function(done) {
					mysqlMgr.addCoin(test_1.id, 5, function(res) {
						res['coin'].should.eql(105);
						done();
					});
				});
			});

			suite.skip('# sea_UpdateCash', function() {
				test('should return true', function(done) {
					mysqlMgr.updateCash(test_1.id, 17, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite.skip('# sea_UpdateEnergy', function() {
				test('should return true', function(done) {
					mysqlMgr.updateEnergy(test_1.id, 8, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite.skip('# sea_UpdateLastChargeTime', function() {
				test('should return true', function(done) {
					var now = new Date();
					second = now.getTime() * 1000;

					mysqlMgr.updateLastChargeTime(test_1.id, second, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite.skip('# sea_UpdateSelectedCharacter', function() {
				test('should return true', function(done) {
					mysqlMgr.updateSelectedCharacter(test_1.id, 3, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite.skip('# sea_UpdateInviteCount', function() {
				test('should return true', function(done) {
					mysqlMgr.updateInviteCount(test_1.id, 21, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite.skip('# sea_UpdateMileage', function() {
				test('should return true', function(done) {
					mysqlMgr.updateMileage(test_1.id, 12, function(res) {
						res.should.be.true;
						done();
					});
				});
			});
			
			suite.skip('# sea_UpdateDraw', function() {
				test('should return true', function(done) {
					mysqlMgr.updateDraw(test_1.id, 1, function(res) {
						res.should.be.true;
						done();
					});
				});
			});
		});

		suite('#2-3. sea_item.sql', function() {
			suite('# sea_LoadItems', function() {
				test('should return { _1: 0, _2: 0, _3: 0, _4: 0, _5: 0, random: 0 }', function(done) {
					mysqlMgr.loadItems(test_1.id, function(res) {
						res['_1'].should.eql(0);
						res['_2'].should.eql(0);
						res['_3'].should.eql(0);
						res['_4'].should.eql(0);
						res['_5'].should.eql(0);
						res['random'].should.eql(0);
						done();
					});
				});
			});
		});
		
		suite('#2-4. sea_user_log.sql', function() {
			suite('#sea_LoadHighestScore', function() {
				test('should return 0', function(done) {
					mysqlMgr.loadHighestScore(test_1.id, function(res) {
						res['res'].should.eql(0);
						done();
					});
				});
			});
		});

		suite('#2-5. sea_character_1.sql', function() {
			suite('#sea_SelectCharacters', function() {
				test('should return {_1: 0, _2: 0, _3: 1, _4: 0}', function(done) {
					mysqlMgr.selectCharacters(test_1.id, function(res) {
						res['_1'].should.eql(0);
						res['_2'].should.eql(0);
						res['_3'].should.eql(1);
						res['_4'].should.eql(0);
						done();
					});
				});
			});

			suite('#sea_SelectLoad_1', function() {
				test('should return {lv: 0}', function(done) {
					mysqlMgr.loadCharacter(test_1.id, 1, function(res) {
						res['lv'].should.eql(0);
						done();
					});
				});
			});

			suite('#sea_SelectCharacter_1_Costumes', function() {
				test('should return {head: 0, top: 0, bottoms: 0, head: 0}', function(done) {
					mysqlMgr.selectCharacterCostumes(test_1.id, 1, function(res) {
						res['head'].should.eql(0);
						res['top'].should.eql(0);
						res['bottoms'].should.eql(0);
						res['head'].should.eql(0);
						done();
					});
				});
			});

			suite('#sea_UpdateCharacter_1_Head', function() {
				test('should return true', function(done) {
					mysqlMgr.updateCharacterHead(test_1.id, 0, 1, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('#sea_UpdateCharacter_1_Top', function() {
				test('should return true', function(done) {
					mysqlMgr.updateCharacterTop(test_1.id, 0, 1, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('#sea_UpdateCharacter_1_Bottoms', function() {
				test('should return true', function(done) {
					mysqlMgr.updateCharacterBottoms(test_1.id, 0, 1, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('#sea_UpdateCharacter_1_Back', function() {
				test('should return true', function(done) {
					mysqlMgr.updateCharacterBack(test_1.id, 0, 1, function(res) {
						res.should.be.true;
						done();
					});
				});
			});
		});

		suite('#2-5. sea_character_2.sql', function() {
			suite('# sea_SelectLoad_2', function() {
				test('should return {lv: 0}', function(done) {
					mysqlMgr.loadCharacter(test_1.id, 2, function(res) {
						res['lv'].should.eql(0);
						done();
					});
				});
			});

			suite('# sea_SelectCharacter_2_Costumes', function() {
				test('should return {head: 0, top: 0, bottoms: 0, back: 0}', function(done) {
					mysqlMgr.selectCharacterCostumes(test_1.id, 2, function(res) {
						res['head'].should.eql(0);
						res['top'].should.eql(0);
						res['bottoms'].should.eql(0);
						res['back'].should.eql(0);
						done();
					});
				});
			});

			suite('# sea_UpdateCharacter_2_Head', function() {
				test('should return true', function(done) {
					mysqlMgr.updateCharacterHead(test_1.id, 0, 2, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateCharacter_2_Top', function() {
				test('should return true', function(done) {
					mysqlMgr.updateCharacterTop(test_1.id, 0, 2, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateCharacter_2_Bottoms', function() {
				test('should return true', function(done) {
					mysqlMgr.updateCharacterBottoms(test_1.id, 0, 2, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateCharacter_2_Back', function() {
				test('should return true', function(done) {
					mysqlMgr.updateCharacterBack(test_1.id, 0, 2, function(res) {
						res.should.be.true;
						done();
					});
				});
			});
		});

		suite('#2-6. sea_character_3.sql', function() {
			suite('# sea_SelectLoad_3', function() {
				test('should return {lv: 1}', function(done) {
					mysqlMgr.loadCharacter(test_1.id, 3, function(res) {
						res['lv'].should.eql(1);
						done();
					});
				});
			});

			suite('# sea_SelectCharacter_3_Costumes', function() {
				test('should return {head: 22, top: 1, bottoms: 2, back: 0}', function(done) {
					mysqlMgr.selectCharacterCostumes(test_1.id, 3, function(res) {
						res['head'].should.eql(22);
						res['top'].should.eql(1);
						res['bottoms'].should.eql(2);
						res['back'].should.eql(0);
						done();
					});
				});
			});

			suite('# sea_UpdateCharacter_3_Head', function() {
				test('should return true', function(done) {
					mysqlMgr.updateCharacterHead(test_1.id, 22, 3, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateCharacter_3_Top', function() {
				test('should return true', function(done) {
					mysqlMgr.updateCharacterTop(test_1.id, 1, 3, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateCharacter_3_Bottoms', function() {
				test('should return true', function(done) {
					mysqlMgr.updateCharacterBottoms(test_1.id, 2, 3, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateCharacter_3_Back', function() {
				test('should return true', function(done) {
					mysqlMgr.updateCharacterBack(test_1.id, 0, 2, function(res) {
						res.should.be.true;
						done();
					});
				});
			});
		});

		suite('#2-7. sea_character_4.sql', function() {
			suite('# sea_SelectLoad_4', function() {
				test('should return {lv: 0}', function(done) {
					mysqlMgr.loadCharacter(test_1.id, 4, function(res) {
						res['lv'].should.eql(0);
						done();
					});
				});
			});

			suite('# sea_SelectCharacter_4_Costumes', function() {
				test('should return {head: 0, top: 0, bottoms: 0, back: 0}', function(done) {
					mysqlMgr.selectCharacterCostumes(test_1.id, 4, function(res) {
						res['head'].should.eql(0);
						res['top'].should.eql(0);
						res['bottoms'].should.eql(0);
						res['back'].should.eql(0);
						done();
					});
				});
			});

			suite('# sea_UpdateCharacter_4_Head', function() {
				test('should return true', function(done) {
					mysqlMgr.updateCharacterHead(test_1.id, 0, 4, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateCharacter_4_Top', function() {
				test('should return true', function(done) {
					mysqlMgr.updateCharacterTop(test_1.id, 0, 4, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateCharacter_4_Bottoms', function() {
				test('should return true', function(done) {
					mysqlMgr.updateCharacterBottoms(test_1.id, 0, 4, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateCharacter_4_Back', function() {
				test('should return true', function(done) {
					mysqlMgr.updateCharacterBack(test_1.id, 0, 4, function(res) {
						res.should.be.true;
						done();
					});
				});
			});
		});

		suite('#2-8. sea_costume_1.sql', function() {
			suite('# sea_SelectCostume', function() {
				test('should return {_1: 1, _2: 1, _3: 0, _4: 0, _5: 0, _6: 0, _7: 0, _8: 0, _9: 0, _10: 0, _11: 0, _12: 0, _13: 0, _14: 0, _15: 0, _16: 0, _17: 0, _18: 0, _19: 0, _20: 0, _21: 0, _22: 1, _23: 0, _24: 0, _25: 0, _26: 0, _27: 0, _28: 0, _29: 0, _30: 0}', function(done) {
					mysqlMgr.selectCostumes(test_1.id, function(res) {
						res['_1'].should.eql(1);
						res['_2'].should.eql(1);
						res['_3'].should.eql(0);
						res['_4'].should.eql(0);
						res['_5'].should.eql(0);
						res['_5'].should.eql(0);
						res['_6'].should.eql(0);
						res['_7'].should.eql(0);
						res['_8'].should.eql(0);
						res['_9'].should.eql(0);
						res['_10'].should.eql(0);
						res['_11'].should.eql(0);
						res['_12'].should.eql(0);
						res['_13'].should.eql(0);
						res['_14'].should.eql(0);
						res['_15'].should.eql(0);
						res['_16'].should.eql(0);
						res['_17'].should.eql(0);
						res['_18'].should.eql(0);
						res['_19'].should.eql(0);
						res['_20'].should.eql(0);
						res['_21'].should.eql(0);
						res['_22'].should.eql(1);
						res['_23'].should.eql(0);
						res['_24'].should.eql(0);
						res['_25'].should.eql(0);
						res['_26'].should.eql(0);
						res['_27'].should.eql(0);
						res['_28'].should.eql(0);
						res['_29'].should.eql(0);
						res['_30'].should.eql(0);
						done();
					});
				});
			});
		});
		
		suite('#2-9. sea_ghost_1.sql', function() {
			suite('# sea_LoadGhosts', function() {
				test('should return {_1: 0, _2: 0, _3: 0, _4: 0, _5: 0, _6: 0, _7: 0, _8: 0, _9: 0, _10: 0, _11: 0, _12: 0, _13: 0, _14: 0, _15: 0, _16: 0, _17: 0, _18: 0, _19: 0, _20: 0, _21: 0, _22: 0, _23: 0, _24: 0, _25: 0, _26: 0, _27: 0, _28: 0, _29: 0, _30: 0}', function(done) {
					mysqlMgr.loadGhosts(test_1.id, function(res) {
						res['_1'].should.eql(0);
						res['_2'].should.eql(0);
						res['_3'].should.eql(0);
						res['_4'].should.eql(0);
						res['_5'].should.eql(0);
						res['_5'].should.eql(0);
						res['_6'].should.eql(0);
						res['_7'].should.eql(0);
						res['_8'].should.eql(0);
						res['_9'].should.eql(0);
						res['_10'].should.eql(0);
						res['_11'].should.eql(0);
						res['_12'].should.eql(0);
						res['_13'].should.eql(0);
						res['_14'].should.eql(0);
						res['_15'].should.eql(0);
						res['_16'].should.eql(0);
						res['_17'].should.eql(0);
						res['_18'].should.eql(0);
						res['_19'].should.eql(0);
						res['_20'].should.eql(0);
						res['_21'].should.eql(0);
						res['_22'].should.eql(0);
						res['_23'].should.eql(0);
						res['_24'].should.eql(0);
						res['_25'].should.eql(0);
						res['_26'].should.eql(0);
						res['_27'].should.eql(0);
						res['_28'].should.eql(0);
						res['_29'].should.eql(0);
						res['_30'].should.eql(0);
						done();
					});
				});
			});
		});

		suite('#2-10. sea_ghost_house.sql', function() {
			suite('# sea_LoadGhostHouse', function() {
				test('should return {_1: 0, _2: -1, _3: -1, _4: -1, _5: -1, _1_time: 0, _2_time: 0, _3_time: 0, _4_time: 0, _5_time: 0}', function(done) {
					mysqlMgr.loadGhostHouse(test_1.id, function(res) {
						res['_1'].should.eql(0);
						res['_2'].should.eql(-1);
						res['_3'].should.eql(-1);
						res['_4'].should.eql(-1);
						res['_5'].should.eql(-1);
						res['_1_time'].should.eql(0);
						res['_2_time'].should.eql(0);
						res['_3_time'].should.eql(0);
						res['_4_time'].should.eql(0);
						res['_5_time'].should.eql(0);
						done();
					});
				});
			});
		});
	});

	suite('#3. When an user buys items', function() {
		suite('#3-1. sea_item.sql', function() {
			suite('# sea_UpdateItem_1', function() {
				test('should return true', function(done) {
					mysqlMgr.updateItem(test_1.id, 1, 1, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateItem_2', function() {
				test('should return true', function(done) {
					mysqlMgr.updateItem(test_1.id, 2, 2, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateItem_3', function() {
				test('should return true', function(done) {
					mysqlMgr.updateItem(test_1.id, 3, 3, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateItem_4', function() {
				test('should return true', function(done) {
					mysqlMgr.updateItem(test_1.id, 4, 4, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateItem_5', function() {
				test('should return true', function(done) {
					mysqlMgr.updateItem(test_1.id, 5, 5, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateRandom', function() {
				test('should return {_random: 0}', function(done) {
					mysqlMgr.updateRandom(test_1.id, 7, function(res) {
						res['_random'].should.eql(0);
						done();
					});
				});
			});

			suite('# sea_LoadItems', function() {
				test('should return { _1: 1, _2: 2, _3: 3, _4: 4, _5: 5, random: 7 }', function(done) {
					mysqlMgr.loadItems(test_1.id, function(res) {
						res['_1'].should.eql(1);
						res['_2'].should.eql(2);
						res['_3'].should.eql(3);
						res['_4'].should.eql(4);
						res['_5'].should.eql(5);
						res['random'].should.eql(7);
						done();
					});
				});
			});
		});
	});

	suite('#4. black list', function() {
		suite('#4-1. sea_user_black.sql', function() {
			suite('# sea_RegisterBlack', function() {
				test('should return true', function(done) {
					mysqlMgr.registerBlack(test_1.name, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_isBlack', function() {
				test('should return 1', function(done) {
					mysqlMgr.isBlack(test_1.name, function(res) {
						res['res'].should.eql(1);
						done();
					});
				});
			});

			suite('# sea_GetBlackCount', function() {
				test('should return {res: 1}', function(done) {
					mysqlMgr.getBlackCount(function (res) {
						res['res'].should.eql(1);
						done();
					});
				});
			});

			suite('# sea_UnregisterBlack', function() {
				test('should return 1', function(done) {
					mysqlMgr.unregisterBlack(test_1.name, function(res) {
						res.should.be.true;
						done();
					});
				});
			});
		});
	});

	//
	suite.skip('sea_user_log.sql', function() {
		suite('# sea_UpdateUserLog', function() {
			test('should return true', function(done) {
				mysqlMgr.updateUserLog(test_1.id, 100, 100, 10, function(res) {
					res.should.be.true;
					done();
				});
			});
		});
	});

	suite('#5. When an user buys characters', function() {
		suite('#5-1. sea_character_1.sql', function() {
			suite('# sea_AddCharacter_1', function() {
				test('should return {lv: 1}', function(done) {
					mysqlMgr.addCharacter(test_1.id, 1, function(res) {
						res['lv'].should.eql(1);
						done();
					});
				});
			});

			suite('# sea_CreateCharacter_1_BasicCostumes', function() {
				test('should return true', function(done) {
					mysqlMgr.createCharacterBasicCostumes(test_1.id, 1, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_SelectCharacter_1_Costumes', function() {
				test('should return {head: 23, top: 3, bottoms: 4, back: 0}', function(done) {
					mysqlMgr.selectCharacterCostumes(test_1.id, 1, function(res) {
						res['head'].should.eql(23);
						res['top'].should.eql(3);
						res['bottoms'].should.eql(4);
						res['back'].should.eql(0);
						done();
					});
				});
			});
		});

		suite('#5-2. sea_character_2.sql', function() {
			suite('# sea_AddCharacter_2', function() {
				test('should return {lv: 1}', function(done) {
					mysqlMgr.addCharacter(test_1.id, 2, function(res) {
						res['lv'].should.eql(1);
						done();
					});
				});
			});

			suite('# sea_CreateCharacter_2_BasicCostumes', function() {
				test('should return true', function(done) {
					mysqlMgr.createCharacterBasicCostumes(test_1.id, 2, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_SelectCharacter_2_Costumes', function() {
				test('should return {head: 24, top: 5, bottoms: 6, back: 0}', function(done) {
					mysqlMgr.selectCharacterCostumes(test_1.id, 2, function(res) {
						res['head'].should.eql(24);
						res['top'].should.eql(5);
						res['bottoms'].should.eql(6);
						res['back'].should.eql(0);
						done();
					});
				});
			});
		});

		suite('#5-3. sea_character_4.sql', function() {
			suite('# sea_AddCharacter_4', function() {
				test('should return {lv: 1}', function(done) {
					mysqlMgr.addCharacter(test_1.id, 4, function(res) {
						res['lv'].should.eql(1);
						done();
					});
				});
			});

			suite('# sea_CreateCharacter_4_BasicCostumes', function() {
				test('should return true', function(done) {
					mysqlMgr.createCharacterBasicCostumes(test_1.id, 4, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_SelectCharacter_4_Costumes', function() {
				test('should return {head: 25, top: 7, bottoms: 8, back: 0}', function(done) {
					mysqlMgr.selectCharacterCostumes(test_1.id, 4, function(res) {
						res['head'].should.eql(25);
						res['top'].should.eql(7);
						res['bottoms'].should.eql(8);
						res['back'].should.eql(0);
						done();
					});
				});
			});
		});
	});

	suite('#6. When an user buys costumes', function() {
		suite('#6-1. sea_costume_2.sql', function() {
			suite('# sea_OnCostume_11', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 11, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_12', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 12, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_13', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 13, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_14', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 14, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_15', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 15, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_16', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 16, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_17', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 17, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_18', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 18, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_19', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 19, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_20', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 20, function(res) {
						res.should.be.true;
						done();
					});
				});
			});
		});

		suite('#6-2. sea_costume_3.sql', function() {
			suite('# sea_OnCostume_21', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 21, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_22', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 22, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_23', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 23, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_24', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 24, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_25', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 25, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_26', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 26, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_27', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 27, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_28', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 28, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_29', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 29, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_30', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 30, function(res) {
						res.should.be.true;
						done();
					});
				});
			});
		});

		suite('#6-3. sea_costume_1.sql', function() {
			suite('# sea_OnCostume_1', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 1, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_2', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 2, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_3', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 3, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_4', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 4, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_5', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 5, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_6', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 6, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_7', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 7, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_8', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 8, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_9', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 9, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_OnCostume_10', function() {
				test('should return true', function(done) {
					mysqlMgr.onCostume(test_1.id, 10, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_SelectCostumes', function() {
				test('should return {_1: 1, _2: 1, _3: 1, _4: 1, _5: 1, _6: 1, _7: 1, _8: 1, _9: 1, _10: 1, _11: 1, _12: 1, _13: 1, _14: 1, _15: 1, _16: 1, _17: 1, _18: 1, _19: 1, _20: 1, _21: 1, _22: 1, _23: 1, _24: 1, _25: 1, _26: 1, _27: 1, _28: 1, _29: 1, _30: 1}', function(done) {
					mysqlMgr.selectCostumes(test_1.id, function(res) {
						res['_1'].should.eql(1);
						res['_2'].should.eql(1);
						res['_3'].should.eql(1);
						res['_4'].should.eql(1);
						res['_5'].should.eql(1);
						res['_5'].should.eql(1);
						res['_6'].should.eql(1);
						res['_7'].should.eql(1);
						res['_8'].should.eql(1);
						res['_9'].should.eql(1);
						res['_10'].should.eql(1);
						res['_11'].should.eql(1);
						res['_12'].should.eql(1);
						res['_13'].should.eql(1);
						res['_14'].should.eql(1);
						res['_15'].should.eql(1);
						res['_16'].should.eql(1);
						res['_17'].should.eql(1);
						res['_18'].should.eql(1);
						res['_19'].should.eql(1);
						res['_20'].should.eql(1);
						res['_21'].should.eql(1);
						res['_22'].should.eql(1);
						res['_23'].should.eql(1);
						res['_24'].should.eql(1);
						res['_25'].should.eql(1);
						res['_26'].should.eql(1);
						res['_27'].should.eql(1);
						res['_28'].should.eql(1);
						res['_29'].should.eql(1);
						res['_30'].should.eql(1);
						done();
					});
				});
			});
		});
	});

	suite('#7. When an user gets ghosts', function() {
		suite('#7-1. sea_ghost_2.sql', function() {
			suite('# sea_UpdateGhost_11', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 11, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_12', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 12, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_13', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 13, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_14', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 14, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_15', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 15, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_16', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 16, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_17', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 17, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_18', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 18, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_19', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 19, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_20', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 20, function(res) {
						res.should.be.true;
						done();
					});
				});
			});
		});

		suite('#6-2. sea_costume_3.sql', function() {
			suite('# sea_UpdateGhost_21', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 21, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_22', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 22, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_23', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 23, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_24', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 24, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_25', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 25, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_26', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 26, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_27', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 27, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_28', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 28, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_29', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 29, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_30', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 30, function(res) {
						res.should.be.true;
						done();
					});
				});
			});
		});

		suite('#6-3. sea_costume_1.sql', function() {
			suite('# sea_UpdateGhost_1', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 1, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_2', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 2, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_3', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 3, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_4', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 4, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_5', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 5, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_6', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 6, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_7', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 7, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_8', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 8, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_9', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 9, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_UpdateGhost_10', function() {
				test('should return true', function(done) {
					mysqlMgr.updateGhost(test_1.id, 1, 10, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_LoadGhosts', function() {
				test('should return {_1: 1, _2: 1, _3: 1, _4: 1, _5: 1, _6: 1, _7: 1, _8: 1, _9: 1, _10: 1, _11: 1, _12: 1, _13: 1, _14: 1, _15: 1, _16: 1, _17: 1, _18: 1, _19: 1, _20: 1, _21: 1, _22: 1, _23: 1, _24: 1, _25: 1, _26: 1, _27: 1, _28: 1, _29: 1, _30: 1}', function(done) {
					mysqlMgr.loadGhosts(test_1.id, function(res) {
						res['_1'].should.eql(1);
						res['_2'].should.eql(1);
						res['_3'].should.eql(1);
						res['_4'].should.eql(1);
						res['_5'].should.eql(1);
						res['_5'].should.eql(1);
						res['_6'].should.eql(1);
						res['_7'].should.eql(1);
						res['_8'].should.eql(1);
						res['_9'].should.eql(1);
						res['_10'].should.eql(1);
						res['_11'].should.eql(1);
						res['_12'].should.eql(1);
						res['_13'].should.eql(1);
						res['_14'].should.eql(1);
						res['_15'].should.eql(1);
						res['_16'].should.eql(1);
						res['_17'].should.eql(1);
						res['_18'].should.eql(1);
						res['_19'].should.eql(1);
						res['_20'].should.eql(1);
						res['_21'].should.eql(1);
						res['_22'].should.eql(1);
						res['_23'].should.eql(1);
						res['_24'].should.eql(1);
						res['_25'].should.eql(1);
						res['_26'].should.eql(1);
						res['_27'].should.eql(1);
						res['_28'].should.eql(1);
						res['_29'].should.eql(1);
						res['_30'].should.eql(1);
						done();
					});
				});
			});
		});		
	});

	suite('#8. When an user purchases ghost houses', function() {
		suite('#8-1. sea_ghost_house.sql', function() {
			suite('# sea_PurchaseHouse_2', function() {
				test('should return true', function(done) {
					mysqlMgr.purchaseHouse(test_1.id, 2, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_PurchaseHouse_3', function() {
				test('should return true', function(done) {
					mysqlMgr.purchaseHouse(test_1.id, 3, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_PurchaseHouse_4', function() {
				test('should return true', function(done) {
					mysqlMgr.purchaseHouse(test_1.id, 4, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_PurchaseHouse_5', function() {
				test('should return true', function(done) {
					mysqlMgr.purchaseHouse(test_1.id, 5, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_LoadGhostHouse', function() {
				test('should return {_1: 0, _2: -1, _3: -1, _4: -1, _5: -1, _1_time: 0, _2_time: 0, _3_time: 0, _4_time: 0, _5_time: 0}', function(done) {
					mysqlMgr.loadGhostHouse(test_1.id, function(res) {
						res['_1'].should.eql(0);
						res['_2'].should.eql(0);
						res['_3'].should.eql(0);
						res['_4'].should.eql(0);
						res['_5'].should.eql(0);
						res['_1_time'].should.eql(0);
						res['_2_time'].should.eql(0);
						res['_3_time'].should.eql(0);
						res['_4_time'].should.eql(0);
						res['_5_time'].should.eql(0);
						done();
					});
				});
			});
		});
	});

	suite('#9. When an user sets a ghost to an house then puts it out.', function() {
		suite('#9-1. sea_ghost_house.sql', function() {
			suite('# sea_SetGhostTo_1', function() {
				test('should return true', function(done) {
					mysqlMgr.setGhostTo(test_1.id, 1, 1, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_SetGhostTo_2', function() {
				test('should return true', function(done) {
					mysqlMgr.setGhostTo(test_1.id, 2, 2, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_SetGhostTo_3', function() {
				test('should return true', function(done) {
					mysqlMgr.setGhostTo(test_1.id, 3, 3, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_SetGhostTo_4', function() {
				test('should return true', function(done) {
					mysqlMgr.setGhostTo(test_1.id, 4, 4, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_SetGhostTo_5', function() {
				test('should return true', function(done) {
					mysqlMgr.setGhostTo(test_1.id, 5, 5, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_LoadGhostHouse', function() {
				test('should return {_1: 1, _2: 2, _3: 3, _4: 4, _5: 5}', function(done) {
					mysqlMgr.loadGhostHouse(test_1.id, function(res) {
						res['_1'].should.eql(1);
						res['_2'].should.eql(2);
						res['_3'].should.eql(3);
						res['_4'].should.eql(4);
						res['_5'].should.eql(5);
						res['_1_time'].should.not.eql(0);
						res['_2_time'].should.not.eql(0);
						res['_3_time'].should.not.eql(0);
						res['_4_time'].should.not.eql(0);
						res['_5_time'].should.not.eql(0);
						done();
					});
				});
			});

			suite('# sea_RemoveGhostFrom_1', function() {
				test('should return true', function(done) {
					mysqlMgr.removeGhostFrom(test_1.id, 1, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_RemoveGhostFrom_2', function() {
				test('should return true', function(done) {
					mysqlMgr.removeGhostFrom(test_1.id, 2, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_RemoveGhostFrom_3', function() {
				test('should return true', function(done) {
					mysqlMgr.removeGhostFrom(test_1.id, 3, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_RemoveGhostFrom_4', function() {
				test('should return true', function(done) {
					mysqlMgr.removeGhostFrom(test_1.id, 4, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_RemoveGhostFrom_5', function() {
				test('should return true', function(done) {
					mysqlMgr.removeGhostFrom(test_1.id, 5, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_LoadGhostHouse', function() {
				test('should return {_1: 0, _2: 0, _3: 0, _4: 0, _5: 0}', function(done) {
					mysqlMgr.loadGhostHouse(test_1.id, function(res) {
						res['_1'].should.eql(0);
						res['_2'].should.eql(0);
						res['_3'].should.eql(0);
						res['_4'].should.eql(0);
						res['_5'].should.eql(0);
						res['_1_time'].should.eql(0);
						res['_2_time'].should.eql(0);
						res['_3_time'].should.eql(0);
						res['_4_time'].should.eql(0);
						res['_5_time'].should.eql(0);
						done();
					});
				});
			});
		});
	});

	suite('#10. When an user sends a energy to the other after that, the other accepts it.', function() {
		suite('#10-1. sea_energy.sql', function() {
			var sendedTime = 0;

			suite('# sea_AddEnergy', function() {
				test('should return true', function(done) {
					mysqlMgr.addEnergy(test_1.id, test_2.id, 1, function(res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_LoadEnergyBySender', function() {
				test('should return { receiver_id: test_2.id, amount: 1, sended_time }', function(done) {
					mysqlMgr.loadEnergyBySender(test_1.id, function(res) {
						var list = res;
						var obj = list[0];

						obj['receiver_id'].should.eql(test_2.id);
						obj['amount'].should.eql(1);
						obj['sended_time'].should.not.eql(0);
						done();
					});
				});
			});

			suite('# sea_LoadEnergyByReceiver', function() {
				test('should return { sender_id: test_1.id, amount: 1, sended_time }', function(done) {
					mysqlMgr.loadEnergyByReceiver(test_2.id, function(res) {
						var list = res;
						var obj = list[0];

						obj['sender_id'].should.eql(test_1.id);
						obj['amount'].should.eql(1);
						obj['sended_time'].should.not.eql(0);
						sendedTime = obj['sended_time'];
						done();
					});
				});
			});

			suite('# sea_AcceptEnergy', function() {
				test('should return {res : 100}', function(done) {
					mysqlMgr.acceptEnergy(test_1.id, test_2.id, sendedTime, function(res) {
						res['energy'].should.eql(100);
						done();
					});
				});
			});

			suite('# sea_LoadEnergyBySender', function() {
				test('should return { receiver_id: 0 }', function(done) {
					mysqlMgr.loadEnergyBySender(test_1.id, function(res) {
						var list = res;
						var obj = list[0];

						obj['receiver_id'].should.eql(0);
						done();
					});
				});
			});

			suite('# sea_LoadEnergyByReceiver', function() {
				test('should return { sender_id: 0 }', function(done) {
					mysqlMgr.loadEnergyByReceiver(test_2.id, function(res) {
						var list = res;
						var obj = list[0];

						obj['sender_id'].should.eql(0);
						done();
					});
				});
			});
		});
	});

	suite('#11. When an user sends a evolution to the other after that, the other accepts it.', function() {
		suite('#11-1. sea_evolution.sql', function() {
			suite('# sea_AddEvolution', function() {
				test('should return true', function (done) {
					mysqlMgr.addEvolution(test_1.id, test_2.id, 3, function (res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_ExistEvolution', function() {
				test('should return { res: 1 }', function (done) {
					mysqlMgr.existEvolution(test_1.id, test_2.id, 3, function (res) {
						res['res'].should.eql(1);
						done();
					});
				});
			});

			suite('# sea_LoadEvolutionByReceiverId', function () {
				test('should return { sender_id: test_1.id, character_id: 3, sended_time', function (done) {
					mysqlMgr.loadEvolutionByReceiverId(test_2.id, function (res) {
						var list = res;
						var obj = list[0];

						obj['sender_id'].should.eql(test_1.id);
						obj['character_id'].should.eql(3);
						obj['sended_time'].should.not.eql(0);
						done();
					});
				});
			});

			suite('# sea_LoadEvolutionProgress', function () {
				test('should return { receiver_id: test_2.id, character_id: 3, sended_time, accepted: 0 }', function (done) {
					mysqlMgr.loadEvolutionProgress(test_1.id, 3, function (res) {
						var list = res;
						var obj = list[0];

						obj['receiver_id'].should.eql(test_2.id);
						obj['character_id'].should.eql(3);
						obj['sended_time'].should.not.eql(0);
						obj['accepted'].should.eql(0);
						done();
					});
				});
			});

			suite('# sea_AcceptEvolution', function () {
				test('should return true', function (done) {
					mysqlMgr.acceptEvolution(test_1.id, test_2.id, 3, function (res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_LoadEvolutionProgress', function () {
				test('should return { receiver_id: test_2.id, character_id: 3, sended_time, accepted: 1 }', function (done) {
					mysqlMgr.loadEvolutionProgress(test_1.id, 3, function (res) {
						var list = res;
						var obj = list[0];

						obj['receiver_id'].should.eql(test_2.id);
						obj['character_id'].should.eql(3);
						obj['sended_time'].should.not.eql(0);
						obj['accepted'].should.eql(1);
						done();
					});
				});
			});

			suite('# sea_DeleteEvolution', function () {
				test('should return true', function (done) {
					mysqlMgr.deleteEvolution(test_1.id, 3, function (res) {
						res.should.be.true;
						done();
					});
				});
			});

			suite('# sea_LoadEvolutionByReceiverId', function () {
				test('should return { sender_id: 0 }', function (done) {
					mysqlMgr.loadEvolutionByReceiverId(test_2.id, function (res) {
						var list = res;
						var obj = list[0];

						obj['sender_id'].should.eql(0);
						done();
					});
				});
			});
		});
	});

	suite('sea_user.sql', function() {
		suite('# sea_DeleteUser', function() {
			test('should return true', function(done) {
				mysqlMgr.deleteUser(test_1.id, function(res) {
					res.should.eql(true);
					done();
				});
			});

			test('should return true', function(done) {
				mysqlMgr.deleteUser(test_2.id, function(res) {
					res.should.eql(true);
					done();
				});
			});
		});
	});
});
