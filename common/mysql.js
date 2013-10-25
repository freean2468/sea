var mysql = require('mysql');
var DELAY = 5;

function MysqlMgr(db, cluster) {
	// Property
	this.config = {
					host: '127.0.0.1',
					port: 3306,
					database: db,
					charset: 'UTF8_GENERAL_CI',
					supportBigNumbers: true,
					user: 'root',
					password: 'xmongames',
					waitForConnections: true,
					connectionLimit: 350,
				};
	this.pool = mysql.createPool(this.config);
	this.limit = this.pool['config']['connectionLimit'] / cluster;
	this.connectionCount = 0;
	this.queue = [];
	this.queuing = false;

	// Method
	this.increaseConnectionCount = function () {
		++this.connectionCount;
	};

	this.decreaseConnectionCount = function () {
		--this.connectionCount;
	};

	this.checkHealth = function (info) {
		if (0 < this.queue.length) {
			this.queue.push(info);
			if (this.queuing === false) {
				this.queuing = true;
				setTimeout(function (that) { that.execute(); }, DELAY, this);
			}
			return false;
		}
		if (this.limit - 1 <= this.connectionCount) {
			this.queue.push(info);
			if (this.queuing === false) {
				this.queuing = true;
				setTimeout(function (that) { that.execute(); }, DELAY, this);
			}
			return false;
		}
		return true;
	};

	this.execute = function () {
		for (var i = this.limit - 1 - this.connectionCount; 0 < i && 0 < this.queue.length; --i) {
			var info = this.queue.shift();
			
			this.increaseConnectionCount();

			function wrap(that, info) {
				that.pool.getConnection(function(err, connection) {
					var callback = info['callback'];
					if (info['way'] === 'call') {
						var procedure = info['procedure'];
						var params = info['params'];
						var call = 'CALL ' + procedure + '(' + params + ')';

						if (err) throw err;
						connection.query(call, function(err, results, fields) {
							if (err) throw err;
							connection.release();
							that.decreaseConnectionCount();
							callback(results);
						});
					} else {
						var sql = info['sql'];
						var escaped = info['escaped'];

						var query = connection.query(sql, escaped, function(err, results, fields) {
							if (err) throw err;
					
							connection.release();
							that.decreaseConnectionCount();
							callback(results);
						});
					}	
				});
			}

			wrap(this, info);
		}
		
		if (0 < this.queue.length) {
			setTimeout(function (that) { that.execute(); }, DELAY, this);
			return ;
		}

		this.queuing = false;
	};

	this.query = function (sql, escaped, callback) {
		var info = {
			'way': 'query',
			'sql': sql,
			'escaped': escaped,
			'callback': callback,
		};

		if (this.checkHealth(info) === false) {
			return;
		}

		this.increaseConnectionCount();
		var that = this;
		this.pool.getConnection(function(err, connection) {
			var query = connection.query(sql, escaped, function(err, results, fields) {
				if (err) throw err;
		
				connection.release();
				that.decreaseConnectionCount();
				callback(results);
			});
			/*
			var sql = 'SELECT * FROM ?? WHERE id = ?';
			
			var query = connection.query(sql, ['user', userId], function(err, results) {
			
			sql = 'INSERT INTO ?? SET ?';

			var post = {k_ID: 8812, score: 100};
			query = connection.query(sql, ['user', post], function(err, result) {
				console.log(result.insertId);
			*/
		});
	};

	this.call = function (procedure, params, callback) {
		var info = {
			'way': 'call',
			'procedure': procedure,
			'params': params,
			'callback': callback,
		};

		if (this.checkHealth(info) === false) {
			return;
		}

		this.increaseConnectionCount();
		var that = this;
		this.pool.getConnection(function(err, connection) {
			var call = 'CALL ' + procedure + '(' + params + ')';

			if (err) throw err;
			connection.query(call, function(err, results, fields) {
				if (err) throw err;
				connection.release();
				that.decreaseConnectionCount();
				callback(results);
			});
		});
	};
	
	//
	// MySQL Stored Procedure calls
	//

	// ## db : sea ##

	// sea_user.sql

	this.getUserCount = function (callback) {
		var procedure = 'sea_GetUserCount';
		var params = '';
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.createUser = function (k_id, callback) {
		var procedure = 'sea_CreateUser';
		var params = "'" + k_id + "'";
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.loadUser = function (k_id, callback) {
		var procedure = 'sea_LoadUser';
		var params = "'" + k_id + "'";
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.loadUserKId = function (id, callback) {
		var procedure = 'sea_LoadUserKId';
		var params = id;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.deleteUser = function (id, callback) {
		var procedure = 'sea_DeleteUser';
		var params = id;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	// sea_user_info.sql

	this.loadUserInfo = function (id, callback) {
		var procedure = 'sea_LoadUserInfo';
		var params = id;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.loadEnergy = function (id, callback) {
		var procedure = 'sea_LoadEnergy';
		var params = id;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.loadCoin = function (id, callback) {
		var procedure = 'sea_LoadCoin';
		var params = id;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.loadCash = function (id, callback) {
		var procedure = 'sea_LoadCash';
		var params = id;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.loadDraw = function (id, callback) {
		var procedure = 'sea_LoadDraw';
		var params = id;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.loadInviteCountWithMileageAndDraw = function (id, callback) {
		var procedure = 'sea_LoadInviteCountWithMileageAndDraw';
		var params = id;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.loadMileageAndDraw = function (id, callback) {
		var procedure = 'sea_LoadMileageAndDraw';
		var params = id;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.loadUserBriefInfo = function (id, callback) {
		var procedure = 'sea_LoadUserBriefInfo';
		var params = id;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.checkInCharge = function (id, callback) {
		var procedure = 'sea_CheckInCharge';
		var params = id;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.startGame = function (id, callback) {
		var procedure = 'sea_StartGame';
		var params = id;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.updateLv = function (id, lv, callback) {
		var procedure = 'sea_UpdateLv';
		var params = id + ', ' + lv;
		this.call(procedure, params, function () { callback(true); });
	};

	this.updateExp = function (id, exp, callback) {
		var procedure = 'sea_UpdateExp';
		var params = id + ', ' + exp;
		this.call(procedure, params, function () { callback(true); });
	};

	this.updateCoin = function (id, coin, callback) {
		var procedure = 'sea_UpdateCoin';
		var params = id + ', ' + coin;
		this.call(procedure, params, function () { callback(true); });
	};

	this.addCoin = function (id, amount, callback) {
		var procedure = 'sea_AddCoin';
		var params = id + ', ' + amount;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.updateCash = function (id, cash, callback) {
		var procedure = 'sea_UpdateCash';
		var params = id + ', ' + cash;
		this.call(procedure, params, function () { callback(true); });
	};

	this.updateEnergy = function (id, energy, callback) {
		var procedure = 'sea_UpdateEnergy';
		var params = id + ', ' + energy;
		this.call(procedure, params, function () { callback(true); });
	};

	this.updateLastChargeTime = function (id, last, callback) {
		var procedure = 'sea_UpdateLastChargeTime';
		var params = id + ', ' + last;
		this.call(procedure, params, function () { callback(true); });
	};

	this.updateSelectedCharacter = function (id, selected, callback) {
		var procedure = 'sea_UpdateSelectedCharacter';
		var params = id + ', ' + selected;
		this.call(procedure, params, function () { callback(true); });
	};

	this.updateInviteCount = function (id, count, callback) {
		var procedure = 'sea_UpdateInviteCount';
		var params = id + ', ' + count;
		this.call(procedure, params, function () { callback(true); });
	};

	this.updateMileage = function (id, mileage, callback) {
		var procedure = 'sea_UpdateMileage';
		var params = id + ', ' + mileage;
		this.call(procedure, params, function () { callback(true); });
	};

	this.updateDraw = function (id, draw, callback) {
		var procedure = 'sea_UpdateDraw';
		var params = id + ', ' + draw;
		this.call(procedure, params, function () { callback(true); });
	};

	// sea_baton.sql

	this.addBaton = function (sender, receiver, score, map, callback) {
		var procedure = 'sea_AddBaton';
		var params = sender + ', ' + receiver + ', ' + score + ', ' + map;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.existBaton = function (sender, receiver, time, callback) {
		var procedure = 'sea_ExistBaton';
		var params = sender + ', ' + receiver + ', ' + time;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.loadBatonScore = function (sender, receiver, time, callback) {
		var procedure = 'sea_LoadBatonScore';
		var params = sender + ', ' + receiver + ', ' + time;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.loadBaton = function (receiver, callback) {
		var procedure = 'sea_LoadBaton';
		var params = receiver;
		this.call(procedure, params, function (results) { callback(results[0]); });
	};

	this.deleteBaton = function (sender, receiver, time, callback) {
		var procedure = 'sea_DeleteBaton';
		var params = sender + ', ' + receiver + ', ' + time;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.deleteExpiredBaton = function (callback) {
		var procedure = 'sea_deleteExpiredBaton';
		var params = '';
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	// sea_baton_result.sql

	this.addBatonResult = function (sender, receiver, score, callback) {
		var procedure = 'sea_AddBatonResult';
		var params = sender + ', ' + receiver + ', ' + score;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.loadBatonResultScore = function (sender, receiver, time, callback) {
		var procedure = 'sea_LoadBatonResultScore';
		var params = sender + ', ' + receiver + ', ' + time;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.loadBatonResult = function (receiver, callback) {
		var procedure = 'sea_LoadBatonResult';
		var params = receiver;
		this.call(procedure, params, function (results) { callback(results[0]); });
	};

	this.deleteBatonResult = function (sender, receiver, time, callback) {
		var procedure = 'sea_DeleteBatonResult';
		var params = sender + ', ' + receiver + ', ' + time;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.deleteExpiredBatonResult = function (callback) {
		var procedure = 'sea_deleteExpiredBatonResult';
		var params = '';
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	// sea_character_1~4.sql

	this.selectCharacters = function (id, callback) {
		var procedure = 'sea_SelectCharacters';
		var params = id;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.addCharacter = function (id, target, callback) {
		var procedure = 'sea_AddCharacter_' + target;
		var params = id;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.selectCharacterCostumes = function (id, target, callback) {
		var procedure = 'sea_SelectCharacter_' + target + '_Costumes';
		var params = id;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.updateCharacterHead = function (id, costume, target, callback) {
		var procedure = 'sea_UpdateCharacter_' + target + '_Head';
		var params = id + ', ' + costume;
		this.call(procedure, params, function () { callback(true); });
	};

	this.updateCharacterTop = function (id, costume, target, callback) {
		var procedure = 'sea_UpdateCharacter_' + target + '_Top';
		var params = id + ', ' + costume;
		this.call(procedure, params, function () { callback(true); });
	};

	this.updateCharacterBottoms = function (id, costume, target, callback) {
		var procedure = 'sea_UpdateCharacter_' + target + '_Bottoms';
		var params = id + ', ' + costume;
		this.call(procedure, params, function () { callback(true); });
	};

	this.updateCharacterBack = function (id, costume, target, callback) {
		var procedure = 'sea_UpdateCharacter_' + target + '_Back';
		var params = id + ', ' + costume;
		this.call(procedure, params, function () { callback(true); });
	};

	// sea_costume_1~3.sql

	this.selectCostume = function (id, callback) {
		var procedure = 'sea_SelectCostume';
		var params = id;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.onCostume = function (id, target, callback) {
		var procedure = 'sea_OnCostume_' + target;
		var params = id;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	// sea_energy.sql

	this.addEnergy = function (sender, receiver, amount, callback) {
		var procedure = 'sea_AddEnergy';
		var params = sender + ', ' + receiver + ', ' + amount;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.loadEnergyBySender = function (sender, callback) {
		var procedure = 'sea_LoadEnergyBySender';
		var params = sender;
		this.call(procedure, params, function (results) { callback(results[0]); });
	};

	this.loadEnergyByReceiver = function (receiver, callback) {
		var procedure = 'sea_LoadEnergyByReceiver';
		var params = receiver;
		this.call(procedure, params, function (results) { callback(results[0]); });
	};

	this.acceptEnergy = function (sender, receiver, time, callback) {
		var procedure = 'sea_AcceptEnergy';
		var params = sender + ', ' + receiver + ', ' + time;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.deleteExpiredEnergy = function (callback) {
		var procedure = 'sea_DeleteExpiredEnergy';
		var params = '';
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	// sea_ghost_1~2.sql

	this.loadGhosts = function (id, callback) {
		var procedure = 'sea_LoadGhosts';
		var params = id;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.updateGhost = function (id, amount, target, callback) {
		var procedure = 'sea_UpdateGhost_' + target;
		var params = id + ', ' + amount;
		this.call(procedure, params, function () { callback(true); });
	};

	// sea_ghost_house.sql

	this.loadGhostHouse = function (id, callback) {
		var procedure = 'sea_LoadGhostHouse';
		var params = id;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.purchaseHouse = function (id, target, callback) {
		var procedure = 'sea_PurchaseHouse_' + target;
		var params = id;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.setGhostTo = function (id, ghost, target, callback) {
		var procedure = 'sea_SetGhostTo_' + target;
		var params = id + ', ' + ghost;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.removeGhostFrom = function (id, target, callback) {
		var procedure = 'sea_RemoveGhostFrom_' + target;
		var params = id;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	// sea_item.sql

	this.loadItems = function (id, callback) {
		var procedure = 'sea_LoadItems';
		var params = id;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.updateItem = function (id, amount, target, callback) {
		var procedure = 'sea_UpdateItem_' + target;
		var params = id + ', ' + amount;
		this.call(procedure, params, function () { callback(true); });
	};

	this.updateRandom = function (id, type, callback) {
		var procedure = 'sea_UpdateRandom';
		var params = id + ', ' + type;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	// sea_metric.sql

	this.retentionRate = function (callback) {
		var procedure = 'sea_RetentionRate';
		var params = '';
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.updateWeekly = function (id, callback) {
		var procedure = 'sea_UpdateWeekly';
		var params = id;
		this.call(procedure, params, function () { callback(true); });
	};

	this.lastUv = function (callback) {
		var procedure = 'sea_LastUv';
		var params = '';
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.updateUvOn = function (id, callback) {
		var procedure = 'sea_UpdateUvOn';
		var params = id;
		this.call(procedure, params, function () { callback(true); });
	};

	this.updateUvOff = function (id, callback) {
		var procedure = 'sea_UpdateUvOff';
		var params = id;
		this.call(procedure, params, function () { callback(); });
	};

	this.updatePuOn = function (id, callback) {
		var procedure = 'sea_UpdatePuOn';
		var params = id;
		this.call(procedure, params, function () { callback(); });
	};

	// sea_user_black.sql

	this.getBlackCount = function (callback) {
		var procedure = 'sea_BlackCount';
		var params = '';
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.registerBlack = function (k_id, callback) {
		var procedure = 'sea_RegisterBlack';
		var params = "'" + k_id + "'";
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.unregisterBlack = function (k_id, callback) {
		var procedure = 'sea_UnregisterBlack';
		var params = "'" + k_id + "'";
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.isBlack = function (k_id, callback) {
		var procedure = 'sea_IsBlack';
		var params = "'" + k_id + "'";
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	// sea_user_log.sql

	this.loadHighestScore = function (id, callback) {
		var procedure = 'sea_LoadHighestScore';
		var params = id;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.updateUserLog = function (id, score, dist, kill, callback) {
		var procedure = 'sea_UpdateUserLog';
		var params = id + ', ' + score + ', ' + dist + ', ' + kill;
		this.call(procedure, params, function () { callback(true); });
	};

	this.ranking = function (callback) {
		var procedure = 'sea_Ranking';
		var params = '';
		this.call(procedure, params, function (results) { callback(results[0]); });
	};

	// sea_evolution.sql
	
	this.acceptEvolution = function (sender_id, receiver_id, character_id, callback) {
		var procedure = 'sea_AcceptEvolution';
		var params = sender_id + ', ' + receiver_id + ', ' + character_id;
		this.call(procedure, params, function () { callback(true); });
	};

	this.addEvolution = function (sender_id, receiver_id, character_id, callback) {
		var procedure = 'sea_AddEvolution';
		var params = sender_id + ', ' + receiver_id + ', ' + character_id;
		this.call(procedure, params, function () { callback(true); });
	};
	
	this.existEvolution = function (sender_id, receiver_id, character_id, callback) {
		var procedure = 'sea_ExistEvolution';
		var params = sender_id + ', ' + receiver_id + ', ' + character_id;
		this.call(procedure, params, function (results) { callback(results[0][0]); });
	};

	this.loadEvolutionProgress = function (sender_id, character_id, callback) {
		var procedure = 'sea_LoadEvolutionProgress';
		var params = sender_id + ', ' + character_id;
		this.call(procedure, params, function (results) { callback(results[0]); });
	};

	this.loadEvolutionByReceiverId = function (receiver_id, callback) {
		var procedure = 'sea_LoadEvolutionByReceiverId';
		var params = receiver_id;
		this.call(procedure, params, function (results) { callback(results[0]); });
	};

	this.deleteExpiredEvolution = function (callback) {
		var procedure = 'sea_DeleteExpiredEvolution';
		var params = '';
		this.call(procedure, params, function () { callback(true); });
	};

	this.deleteEvolution = function (sender_id, character_id, callback) {
		var procedure = 'sea_DeleteEvolution';
		var params = sender_id + ', ' + character_id;
		this.call(procedure, params, function () { callback(true); });
	};

	//
	//
	
	// ## db: sea_log ##	
	
	this.addLogLogin = function (k_id, callback) {
		var procedure = 'sea_AddLogLogin';
		var params = "'" + k_id + "'";
		this.call(procedure, params, function (results, fields) { callback(results[0][0]); });
	};

	this.addConcurrentUser = function (ccu, callback) {
		var procedure = 'sea_AddConcurrentUser';
		var params = ccu;
		this.call(procedure, params, function (results, fields) { callback(results[0][0]); });
	};

	this.peakConcurrentUser = function (callback) {
		var procedure = 'sea_PeakConcurrentUser';
		var params = '';
		this.call(procedure, params, function (results, fields) { callback(results[0][0]); });
	};

	this.addLogPayCharacter = function (k_id, character, coin, callback) {
		var procedure = 'sea_AddLogPayCharacter';
		var params = "'" + k_id + "', " + character + ', ' + coin;
		this.call(procedure, params, function (results, fields) { callback(results[0][0]); });
	};

	this.addLogPayCoin = function (k_id, coin, rest, callback) {
		var procedure = 'sea_AddLogPayCoin';
		var params = "'" + k_id + "', " + coin + ', ' + rest;
		this.call(procedure, params, function (results, fields) { callback(results[0][0]); });
	};

	this.addLogPayEnergy = function (k_id, energy, coin, callback) {
		var procedure = 'sea_AddLogPayEnergy';
		var params = "'" + k_id + "', " + energy + ', ' + coin;
		this.call(procedure, params, function (results, fields) { callback(results[0][0]); });
	};

	this.addLogPayItem = function (k_id, item, coin, callback) {
		var procedure = 'sea_AddLogPayItem';
		var params = "'" + k_id + "', " + item + ', ' + coin;
		this.call(procedure, params, function (results, fields) { callback(results[0][0]); });
	};

	this.addLogPayCash = function (k_id, paid, rest, callback) {
		var procedure = 'sea_AddLogPayCash';
		var params = "'" + k_id + "', " + paid + ', ' + rest;
		this.call(procedure, params, function (results, fields) { callback(results[0][0]); });
	};

	this.addPeakConcurrentUser = function (pccu, callback) {
		var procedure = 'sea_AddPeakConcurrentUser';
		var params = pccu;
		this.call(procedure, params, function (results, fields) { callback(results[0][0]); });
	};

	this.addRetentionRate = function (rr, callback) {
		var procedure = 'sea_AddRetentionRate';
		var params = rr;
		this.call(procedure, params, function (results, fields) { callback(results[0][0]); });
	};

	this.addUniqueVisitor = function (uv, callback) {
		var procedure = 'sea_AddUniqueVisitor';
		var params = uv;
		this.call(procedure, params, function (results, fields) { callback(results[0][0]); });
	};

	this.addLogPlay = function (k_id, character, score, kill, dist, time, exp_boost, item_last, shield, ghostify, immortal, random, callback) {
		var procedure = 'sea_AddLogPlay';
		var params = "'" + k_id + "', " + character + ', ' + score + ', ' + kill + ', ' + dist + ', ' + time + ', ' + exp_boost + ', ' + item_last + ', ' + shield + ', ' + ghostify + ', ' + immortal + ', ' + random;
		this.call(procedure, params, function (results, fields) { callback(results[0][0]); });
	};

	this.addLogRegister = function (k_id, callback) {
		var procedure = 'sea_AddLogRegister';
		var params = "'" + k_id + "'";
		this.call(procedure, params, function (results, fields) { callback(results[0][0]); });
	};

	this.addLogUnregister = function (k_id, callback) {
		var procedure = 'sea_AddLogUnregister';
		var params = "'" + k_id + "'";
		this.call(procedure, params, function (results, fields) { callback(results[0][0]); });
	};

	//
	//
}

module.exports = {
	'MysqlMgr': MysqlMgr,
};
