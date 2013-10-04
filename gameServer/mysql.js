var mysql = require('mysql');
var log = require('./log');

var pool = mysql.createPool({
	host: '127.0.0.1',
	port: 3306,
	database: 'sea',
	charset: 'UTF8_GENERAL_CI',
	supportBigNumbers: true,
	user: 'root',
	password: 'xmongames',
	waitForConnections: true,
	connectionLimit: 500,
});

function query(sql, escaped, callback) {
	pool.getConnection(function(err, connection) {
//		handleDisconnect(connection);
	
		var query = connection.query(sql, escaped, function(err, results, fields) {
			if (err) throw err;
	
			connection.release();
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
}

function call(procedure, params, callback) {
	pool.getConnection(function(err, connection) {
		var call = 'CALL ' + procedure + '(' + params + ')';
		if (err) throw err;

		connection.query(call, function(err, results, fields) {
			if (err) throw err;

			connection.release();
			callback(results);
		});
	});
}

function handleDisconnect(connection) {
	connection.on('error', function(err) {
		if (!err.fatal) {
			return;
		}

		if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
			throw err;
		}

		log.addLog('DEBUG', 'Re-connection lost connection: ' + err.stack);

		connection = mysql.createConnection(connection.config);

		handleDisconnect(connection);
		connection.connect();
	});
}

//
// MySQL Stored Procedure calls
//

// sea_user.sql

function getUserCount (callback) {
	var procedure = 'sea_GetUserCount';
	var params = '';
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function createUser (k_id, callback) {
	var procedure = 'sea_CreateUser';
	var params = "'" + k_id + "'";
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function loadUser (k_id, callback) {
	var procedure = 'sea_LoadUser';
	var params = "'" + k_id + "'";
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function loadUserKId (id, callback) {
	var procedure = 'sea_LoadUserKId';
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function deleteUser (id, callback) {
	var procedure = 'sea_DeleteUser';
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

// sea_user_info.sql

function loadUserInfo (id, callback) {
	var procedure = 'sea_LoadUserInfo';
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function loadEnergy (id, callback) {
	var procedure = 'sea_LoadEnergy';
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function loadCoin (id, callback) {
	var procedure = 'sea_LoadCoin';
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function loadMoney (id, callback) {
	var procedure = 'sea_LoadMoney';
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function loadDraw (id, callback) {
	var procedure = 'sea_LoadDraw';
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function loadInviteCountWithMileageAndDraw (id, callback) {
	var procedure = 'sea_LoadInviteCountWithMileageAndDraw';
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function loadMileageAndDraw (id, callback) {
	var procedure = 'sea_LoadMileageAndDraw';
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function loadUserBriefInfo (id, callback) {
	var procedure = 'sea_LoadUserBriefInfo';
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function checkInCharge (id, callback) {
	var procedure = 'sea_CheckInCharge';
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function startGame (id, callback) {
	var procedure = 'sea_StartGame';
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function updateCoin (id, coin, callback) {
	var procedure = 'sea_UpdateCoin';
	var params = id + ', ' + coin;
	call(procedure, params, function () { callback(true); });
}

function addCoin (id, amount, callback) {
	var procedure = 'sea_AddCoin';
	var params = id + ', ' + amount;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function updateMoney (id, money, callback) {
	var procedure = 'sea_UpdateMoney';
	var params = id + ', ' + money;
	call(procedure, params, function () { callback(true); });
}

function updateEnergy (id, energy, callback) {
	var procedure = 'sea_UpdateEnergy';
	var params = id + ', ' + energy;
	call(procedure, params, function () { callback(true); });
}

function updateLastChargeTime (id, last, callback) {
	var procedure = 'sea_UpdateLastChargeTime';
	var params = id + ', ' + last;
	call(procedure, params, function () { callback(true); });
}

function updateSelectedCharacter (id, selected, callback) {
	var procedure = 'sea_UpdateSelectedCharacter';
	var params = id + ', ' + selected;
	call(procedure, params, function () { callback(true); });
}

function updateInviteCount (id, count, callback) {
	var procedure = 'sea_UpdateInviteCount';
	var params = id + ', ' + count;
	call(procedure, params, function () { callback(true); });
}

function updateMileage (id, mileage, callback) {
	var procedure = 'sea_UpdateMileage';
	var params = id + ', ' + mileage;
	call(procedure, params, function () { callback(true); });
}

function updateDraw (id, draw, callback) {
	var procedure = 'sea_UpdateDraw';
	var params = id + ', ' + draw;
	call(procedure, params, function () { callback(true); });
}

// sea_baton.sql

function addBaton (sender, receiver, score, map, callback) {
	var procedure = 'sea_AddBaton';
	var params = sender + ', ' + receiver + ', ' + score + ', ' + map;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function existBaton (sender, receiver, time, callback) {
	var procedure = 'sea_ExistBaton';
	var params = sender + ', ' + receiver + ', ' + time;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function loadBatonScore (sender, receiver, time, callback) {
	var procedure = 'sea_LoadBatonScore';
	var params = sender + ', ' + receiver + ', ' + time;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function loadBaton (receiver, callback) {
	var procedure = 'sea_LoadBaton';
	var params = receiver;
	call(procedure, params, function (results) { callback(results[0]); });
}

function deleteBaton (sender, receiver, time, callback) {
	var procedure = 'sea_DeleteBaton';
	var params = sender + ', ' + receiver + ', ' + time;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function deleteExpiredBaton (callback) {
	var procedure = 'sea_deleteExpiredBaton';
	var params = '';
	call(procedure, params, function (results) { callback(results[0][0]); });
}

// sea_baton_result.sql

function addBatonResult (sender, receiver, score, callback) {
	var procedure = 'sea_AddBatonResult';
	var params = sender + ', ' + receiver + ', ' + score;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function loadBatonResultScore (sender, receiver, time, callback) {
	var procedure = 'sea_LoadBatonResultScore';
	var params = sender + ', ' + receiver + ', ' + time;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function loadBatonResult (receiver, callback) {
	var procedure = 'sea_LoadBatonResult';
	var params = receiver;
	call(procedure, params, function (results) { callback(results[0]); });
}

function deleteBatonResult (sender, receiver, time, callback) {
	var procedure = 'sea_DeleteBatonResult';
	var params = sender + ', ' + receiver + ', ' + time;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function deleteExpiredBatonResult (callback) {
	var procedure = 'sea_deleteExpiredBatonResult';
	var params = '';
	call(procedure, params, function (results) { callback(results[0][0]); });
}

// sea_character_1~4.sql

function selectCharacters (id, callback) {
	var procedure = 'sea_SelectCharacters';
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function addCharacter (id, target, callback) {
	var procedure = 'sea_AddCharacter_' + target;
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function selectCharacterCostumes (id, target, callback) {
	var procedure = 'sea_SelectCharacters_' + target + '_Costumes';
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function updateCharacterHead (id, costume, target, callback) {
	var procedure = 'sea_UpdateCharacter_' + target + '_Head';
	var params = id + ', ' + costume;
	call(procedure, params, function () { callback(true); });
}

function updateCharacterTop (id, costume, target, callback) {
	var procedure = 'sea_UpdateCharacter_' + target + '_Top';
	var params = id + ', ' + costume;
	call(procedure, params, function () { callback(true); });
}

function updateCharacterBottoms (id, costume, target, callback) {
	var procedure = 'sea_UpdateCharacter_' + target + '_Bottoms';
	var params = id + ', ' + costume;
	call(procedure, params, function () { callback(true); });
}

function updateCharacterBack (id, costume, target, callback) {
	var procedure = 'sea_UpdateCharacter_' + target + '_Back';
	var params = id + ', ' + costume;
	call(procedure, params, function () { callback(true); });
}

// sea_costume_head.sql

function selectCostumeHead (id, callback) {
	var procedure = 'sea_SelectCostumeHead';
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function onCostumeHead (id, target, callback) {
	var procedure = 'sea_OnCostumeHead_' + target;
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

// sea_costume_top.sql

function selectCostumeTop (id, callback) {
	var procedure = 'sea_SelectCostumeTop';
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function onCostumeTop (id, target, callback) {
	var procedure = 'sea_OnCostumeTop_' + target;
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

// sea_costume_bottoms.sql

function selectCostumeBottoms (id, callback) {
	var procedure = 'sea_SelectCostumeBottoms';
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function onCostumeBottoms (id, target, callback) {
	var procedure = 'sea_OnCostumeBottoms_' + target;
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

// sea_costume_back.sql

function selectCostumeBack (id, callback) {
	var procedure = 'sea_SelectCostumeBack';
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function onCostumeBack (id, target, callback) {
	var procedure = 'sea_OnCostumeBack_' + target;
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

// sea_energy.sql

function addEnergy (sender, receiver, callback) {
	var procedure = 'sea_AddEnergy';
	var params = sender + ', ' + receiver;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function loadEnergyBySender (sender, callback) {
	var procedure = 'sea_LoadEnergyBySender';
	var params = sender;
	call(procedure, params, function (results) { callback(results[0]); });
}

function loadEnergyByReceiver (receiver, callback) {
	var procedure = 'sea_LoadEnergyByReceiver';
	var params = receiver;
	call(procedure, params, function (results) { callback(results[0]); });
}

function acceptEnergy (sender, receiver, time, callback) {
	var procedure = 'sea_AcceptEnergy';
	var params = sender + ', ' + receiver + ', ' + time;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function deleteExpiredEnergy (callback) {
	var procedure = 'sea_DeleteExpiredEnergy';
	var params = '';
	call(procedure, params, function (results) { callback(results[0][0]); });
}

// sea_ghost_1~2.sql

function loadGhosts (id, callback) {
	var procedure = 'sea_LoadGhosts';
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function updateGhost (id, amount, target, callback) {
	var procedure = 'sea_UpdateGhost_' + target;
	var params = id + ', ' + amount;
	call(procedure, params, function () { callback(true); });
}

// sea_ghost_house.sql

function loadGhostHouse (id, callback) {
	var procedure = 'sea_LoadGhostHouse';
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function purchaseRoom (id, target, callback) {
	var procedure = 'sea_PurchaseRoom_' + target;
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function setGhostTo (id, ghost, target, callback) {
	var procedure = 'sea_SetGhostTo_' + target;
	var params = id + ', ' + ghost;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function removeGhostFrom (id, target, callback) {
	var procedure = 'sea_FromGhostFrom_' + target;
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

// sea_item.sql

function loadItems (id, callback) {
	var procedure = 'sea_LoadItems';
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function updateExpBoost (id, amount, callback) {
	var procedure = 'sea_UpdateExpBoost';
	var params = id + ', ' + amount;
	call(procedure, params, function () { callback(true); });
}

function updateItemLast (id, amount, callback) {
	var procedure = 'sea_UpdateItemLast';
	var params = id + ', ' + amount;
	call(procedure, params, function () { callback(true); });
}

function updateShield (id, amount, callback) {
	var procedure = 'sea_UpdateShield';
	var params = id + ', ' + amount;
	call(procedure, params, function () { callback(true); });
}

function updateGhostify (id, amount, callback) {
	var procedure = 'sea_UpdateGhostify';
	var params = id + ', ' + amount;
	call(procedure, params, function () { callback(true); });
}

function updateImmortal (id, amount, callback) {
	var procedure = 'sea_UpdateImmortal';
	var params = id + ', ' + amount;
	call(procedure, params, function () { callback(true); });
}

function updateRandom (id, type, callback) {
	var procedure = 'sea_UpdateRandom';
	var params = id + ', ' + type;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

// sea_metric.sql

function retentionRate (callback) {
	var procedure = 'sea_RetentionRate';
	var params = '';
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function updateWeekly (id, callback) {
	var procedure = 'sea_UpdateWeekly';
	var params = id;
	call(procedure, params, function () { callback(true); });
}

function lastUv (callback) {
	var procedure = 'sea_LastUv';
	var params = '';
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function updateUvOn (id, callback) {
	var procedure = 'sea_UpdateUvOn';
	var params = id;
	call(procedure, params, function () { callback(true); });
}

function updateUvOff (id, callback) {
	var procedure = 'sea_UpdateUvOff';
	var params = id;
	call(procedure, params, function () { callback(); });
}

function updatePuOn (id, callback) {
	var procedure = 'sea_UpdatePuOn';
	var params = id;
	call(procedure, params, function () { callback(); });
}

// sea_upgrade.sql

function loadUpgrade (id, callback) {
	var procedure = 'sea_LoadUpgrade';
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function upgradeScoreFactor (id, callback) {
	var procedure = 'sea_UpgradeScoreFactor';
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function upgradeTimeFactor (id, callback) {
	var procedure = 'sea_UpgradeTimeFactor';
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function upgradeCooldownFactor (id, callback) {
	var procedure = 'sea_UpgradeCooldownFactor';
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

// sea_user_black.sql

function getBlackCount (callback) {
	var procedure = 'sea_BlackCount';
	var params = '';
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function registerBlack (k_id, callback) {
	var procedure = 'sea_RegisterBlack';
	var params = "'" + k_id + "'";
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function unregisterBlack (k_id, callback) {
	var procedure = 'sea_UnregisterBlack';
	var params = "'" + k_id + "'";
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function isBlack (k_id, callback) {
	var procedure = 'sea_IsBlack';
	var params = "'" + k_id + "'";
	call(procedure, params, function (results) { callback(results[0][0]); });
}

// sea_user_log.sql

function loadHighestScore (id, callback) {
	var procedure = 'sea_LoadHighestScore';
	var params = id;
	call(procedure, params, function (results) { callback(results[0][0]); });
}

function updateUserLog (id, score, dist, kill, callback) {
	var procedure = 'sea_UpdateUserLog';
	var params = id + ', ' + score + ', ' + dist + ', ' + kill;
	call(procedure, params, function () { callback(true); });
}

function ranking (callback) {
	var procedure = 'sea_Ranking';
	var params = '';
	call(procedure, params, function (results) { callback(results[0]); });
}

//
//

module.exports = {
	'getUserCount': getUserCount,
	'createUser': createUser,
	'loadUser': loadUser,
	'loadUserKId': loadUserKId,
	'deleteUser': deleteUser,

	'loadUserInfo': loadUserInfo,
	'loadEnergy': loadEnergy,
	'loadCoin': loadCoin,
	'loadMoney': loadMoney,
	'loadDraw': loadDraw,
	'loadInviteCountWithMileageAndDraw': loadInviteCountWithMileageAndDraw,
	'loadMileageAndDraw': loadMileageAndDraw,
	'loadUserBriefInfo': loadUserBriefInfo,
	'checkInCharge': checkInCharge,
	'startGame': startGame,
	'updateCoin': updateCoin,
	'addCoin': addCoin,
	'updateMoney': updateMoney,
	'updateEnergy': updateEnergy,
	'updateLastChargeTime': updateLastChargeTime,
	'updateSelectedCharacter': updateSelectedCharacter,
	'updateInviteCount': updateInviteCount,
	'updateMileage': updateMileage,
	'updateDraw': updateDraw,

	'addBaton': addBaton,
	'existBaton': existBaton,
	'loadBatonScore': loadBatonScore,
	'loadBaton': loadBaton,
	'deleteBaton': deleteBaton,
	'deleteExpiredBaton': deleteExpiredBaton,

	'addBatonResult': addBatonResult,
	'loadBatonResultScore': loadBatonResultScore,
	'loadBatonResult': loadBatonResult,
	'deleteBatonResult': deleteBatonResult,
	'deleteExpiredBatonResult': deleteExpiredBatonResult,

	'selectCharacters': selectCharacters,
	'addCharacter': addCharacter,
	'selectCharacterCostumes': selectCharacterCostumes,
	'updateCharacterHead': updateCharacterHead,
	'updateCharacterTop': updateCharacterTop,
	'updateCharacterBottoms': updateCharacterBottoms,
	'updateCharacterBack': updateCharacterBack,

	'selectCostumeHead': selectCostumeHead,
	'onCostumeHead': onCostumeHead,

	'selectCostumeTop': selectCostumeTop,
	'onCostumeTop': onCostumeTop,

	'selectCostumeBottoms': selectCostumeBottoms,
	'onCostumeBottoms': onCostumeBottoms,

	'selectCostumeBack': selectCostumeBack,
	'onCostumeBack': onCostumeBack,

	'addEnergy': addEnergy,
	'loadEnergyBySender': loadEnergyBySender,
	'loadEnergyByReceiver': loadEnergyByReceiver,
	'acceptEnergy': acceptEnergy,
	'deleteExpiredEnergy': deleteExpiredEnergy,

	'loadGhosts': loadGhosts,
	'updateGhost': updateGhost,

	'loadGhostHouse': loadGhostHouse,
	'purchaseRoom': purchaseRoom,
	'setGhostTo': setGhostTo,
	'removeGhostFrom': removeGhostFrom,

	'loadItems': loadItems,
	'updateExpBoost': updateExpBoost,
	'updateItemLast': updateItemLast,
	'updateShield': updateShield,
	'updateGhostify': updateGhostify,
	'updateImmortal': updateImmortal,
	'updateRandom': updateRandom,

	'retentionRate': retentionRate,
	'updateWeekly': updateWeekly,
	'lastUv': lastUv,
	'updateUvOn': updateUvOn,
	'updateUvOff': updateUvOff,
	'updatePuOn': updatePuOn,

	'loadUpgrade': loadUpgrade,
	'upgradeScoreFactor': upgradeScoreFactor,
	'upgradeTimeFactor': upgradeTimeFactor,
	'upgradeCooldownFactor': upgradeCooldownFactor,

	'getBlackCount': getBlackCount,
	'registerBlack': registerBlack,
	'unregisterBlack': unregisterBlack,
	'isBlack': isBlack,

	'loadHighestScore': loadHighestScore,
	'updateUserLog': updateUserLog,
	'ranking': ranking,
};
